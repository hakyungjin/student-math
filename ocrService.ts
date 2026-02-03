import Tesseract from 'tesseract.js';
import { GoogleGenAI } from '@google/genai';

export interface OCRResult {
  fullText: string;
  answers: string[];
  confidence: number;
}

// Gemini API 초기화
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
let geminiClient: any = null;

if (apiKey) {
  try {
    geminiClient = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('Gemini 초기화 실패, OCR만 사용합니다:', error);
  }
}

/**
 * Gemini Vision을 사용해서 이미지에서 정답 인식
 * 이미지를 직접 분석해서 더 정확한 결과를 얻습니다
 */
export const recognizeAnswersByGemini = async (imageBase64: string): Promise<OCRResult> => {
  if (!geminiClient) {
    throw new Error('Gemini API Key가 설정되지 않았습니다. .env.local 파일에 VITE_GEMINI_API_KEY를 추가하세요.');
  }

  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64
              }
            },
            {
              text: `이 이미지는 시험지의 정답지입니다. 
              
각 문제의 정답을 JSON 형식으로 추출해주세요.

응답 형식:
{
  "answers": ["3", "1", "4", "2", ...],
  "format": "객관식" 또는 "주관식" 또는 "혼합",
  "questionCount": 문제 개수,
  "confidence": 0-100 사이의 확신도
}

주의사항:
- 객관식은 1,2,3,4,5,가,나,다,라,마 중 하나
- 주관식은 정답 텍스트
- 번호와 함께 표시된 정답만 추출
- 숫자나 선택지가 명확하지 않으면 빈 문자열로 표시`
            }
          ]
        }
      ]
    });

    const text = response.text;
    
    // JSON 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('유효한 JSON을 찾을 수 없습니다');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      fullText: text,
      answers: result.answers || [],
      confidence: result.confidence || 0
    };
  } catch (error) {
    console.error('Gemini 인식 실패:', error);
    throw new Error(`Gemini 분석 실패: ${error instanceof Error ? error.message : '다시 시도해주세요'}`);
  }
};

/**
 * 이미지에서 텍스트를 인식합니다 (OCR - Tesseract)
 */
export const recognizeText = async (imageFile: File | string): Promise<OCRResult> => {
  try {
    const result = await Tesseract.recognize(imageFile, 'kor+eng', {
      logger: (m) => console.log('OCR Progress:', m)
    });

    const fullText = result.data.text;
    const confidence = result.data.confidence;

    // 정답 패턴 인식 (1, 2, 3, 4, 5 숫자 또는 텍스트)
    const answers = extractAnswers(fullText);

    return {
      fullText,
      answers,
      confidence
    };
  } catch (error) {
    console.error('OCR 인식 실패:', error);
    throw new Error('이미지 처리에 실패했습니다. 더 선명한 사진을 시도해주세요.');
  }
};

/**
 * OCR 텍스트에서 정답 추출
 * 형식: "1. 3", "2. 4" 등
 */
const extractAnswers = (text: string): string[] => {
  const answers: string[] = [];
  
  // 각 줄을 분석
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // 패턴 1: "1. 3" 또는 "1) 3"
    const match = line.match(/^\d+[\.\)]\s*([0-5가나다라마])/i);
    if (match) {
      answers.push(match[1].trim());
      continue;
    }
    
    // 패턴 2: "정답: 3"
    const match2 = line.match(/정답[\s\:]*([0-5가나다라마])/i);
    if (match2) {
      answers.push(match2[1].trim());
    }
  }
  
  return answers;
};

/**
 * 이미지 파일을 Base64로 변환
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
  });
};

/**
 * 이미지 미리보기 생성
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

