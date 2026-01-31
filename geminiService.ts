
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const gradeShortAnswer = async (question: string, correctAnswer: string, studentAnswer: string): Promise<{ isCorrect: boolean; feedback: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음 주관식 답변을 채점하세요.
질문: ${question}
정답 기준: ${correctAnswer}
학생 답변: ${studentAnswer}

정확한 단어 일치가 아니더라도 의미가 통하면 정답으로 처리하세요.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN, description: "정답 여부" },
            feedback: { type: Type.STRING, description: "채점 근거 설명" }
          },
          required: ["isCorrect", "feedback"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Grading error:", error);
    // 폴백: 단순 문자열 비교
    const isCorrect = studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    return { isCorrect, feedback: "자동 채점 시스템 오류로 단순 비교 처리되었습니다." };
  }
};
