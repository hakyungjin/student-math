
import React, { useState } from 'react';
import { Test, Question, QuestionType } from '../types';
import { recognizeText, recognizeAnswersByGemini, createImagePreview, fileToBase64 } from '../ocrService';

interface Props {
  onSave: (test: Omit<Test, 'id'>) => void;
  onCancel: () => void;
}

const TestCreator: React.FC<Props> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showBatchInput, setShowBatchInput] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useGemini, setUseGemini] = useState(true); // Gemini 사용 여부

  const addQuestion = (type: QuestionType) => {
    const num = questions.length + 1;
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: `${num}번 문제`,
      type,
      points: 10,
      correctAnswer: '',
      options: type === QuestionType.MULTIPLE_CHOICE ? ['1', '2', '3', '4'] : undefined
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // 이미지에서 정답 인식 (Gemini 또는 OCR)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setRecognizing(true);
      
      // 미리보기 생성
      const preview = await createImagePreview(file);
      setImagePreview(preview);

      let result;
      
      if (useGemini) {
        // Gemini Vision 사용 (더 정확)
        try {
          const base64 = await fileToBase64(file);
          result = await recognizeAnswersByGemini(base64);
          
          // 인식된 정답을 형식에 맞게 변환
          const formattedAnswers = result.answers
            .map((ans, idx) => `${idx + 1} ${ans}`)
            .join('\n');
          
          setBatchText(formattedAnswers);
          alert(`✅ Gemini 분석 완료!\n확신도: ${Math.round(result.confidence)}%\n\n텍스트를 수정 후 "추가하기"를 클릭하세요.`);
        } catch (geminiError) {
          // Gemini 실패 시 OCR로 폴백
          console.warn('Gemini 실패, OCR로 전환:', geminiError);
          result = await recognizeText(file);
          setBatchText(result.fullText);
          alert(`⚠️ OCR 인식 완료 (Gemini 사용 불가)\n확신도: ${Math.round(result.confidence)}%\n\n텍스트를 수정 후 "추가하기"를 클릭하세요.`);
        }
      } else {
        // 기본 OCR 사용
        result = await recognizeText(file);
        setBatchText(result.fullText);
        alert(`✅ OCR 인식 완료!\n확신도: ${Math.round(result.confidence)}%\n\n텍스트를 수정 후 "추가하기"를 클릭하세요.`);
      }

      setShowImageUpload(false);
      setShowBatchInput(true);
    } catch (error) {
      alert(`❌ 인식 실패: ${error instanceof Error ? error.message : '다시 시도해주세요'}`);
    } finally {
      setRecognizing(false);
      setImagePreview(null);
    }
  };

  // CSV 또는 줄바꿈으로 일괄 입력 (형식: 1,객관식 또는 1 객관식 또는 1)
  const handleBatchInput = () => {
    const lines = batchText.trim().split('\n').filter(line => line.trim());
    const newQuestions: Question[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[,\s]+/).filter(p => p.trim());
      const number = parseInt(parts[0]);
      const typeStr = parts[1]?.toLowerCase() || '';
      
      // 유형 결정: "객" 또는 "주" 또는 "객관식" 또는 "주관식"
      const isMultiple = typeStr.includes('객') || typeStr.includes('multiple') || typeStr.includes('choice');
      const type = isMultiple ? QuestionType.MULTIPLE_CHOICE : QuestionType.SHORT_ANSWER;
      
      // 세 번째 요소가 있으면 답
      const answer = parts[2] || '';

      newQuestions.push({
        id: Math.random().toString(36).substr(2, 9),
        text: `${number}번 문제`,
        type,
        points: 10,
        correctAnswer: answer,
        options: type === QuestionType.MULTIPLE_CHOICE ? ['1', '2', '3', '4'] : undefined
      });
    });

    setQuestions([...questions, ...newQuestions]);
    setBatchText('');
    setShowBatchInput(false);
  };

  const handleSave = () => {
    if (!title) { alert('제목을 지어주세요!'); return; }
    if (questions.length === 0) { alert('정답을 최소 하나는 넣어주세요.'); return; }
    onSave({ title, description: '', questions, createdAt: Date.now() });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 pb-32 px-4 md:px-0">
      <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-slate-800">새 정답지 만들기</h2>
        <input 
          type="text" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="예: 3월 단원평가 수학"
          className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none transition-all font-bold"
        />
        <p className="mt-2 text-xs text-slate-400">문제는 종이 시험지에 있으니, 여기서는 정답만 잘 맞춰주세요!</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-slate-600">정답 목록</h3>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setShowImageUpload(!showImageUpload)}
              className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-2 rounded-xl hover:bg-purple-200 transition-colors"
            >
              📸 사진 인식
            </button>
            <button 
              onClick={() => setShowBatchInput(!showBatchInput)}
              className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-2 rounded-xl hover:bg-blue-200 transition-colors"
            >
              📋 일괄 입력
            </button>
            <button onClick={() => addQuestion(QuestionType.MULTIPLE_CHOICE)} className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-2 rounded-xl hover:bg-amber-200 transition-colors">객관식 추가</button>
            <button onClick={() => addQuestion(QuestionType.SHORT_ANSWER)} className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl hover:bg-emerald-200 transition-colors">주관식 추가</button>
          </div>
        </div>

        {/* 이미지 업로드 섹션 */}
        {showImageUpload && (
          <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-700 mb-2">📸 답안지 사진을 올리세요</p>
                <p className="text-xs text-purple-600 mb-3">명확하고 선명한 사진일수록 인식이 잘됩니다.</p>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-xs font-bold text-purple-700">
                  <input
                    type="checkbox"
                    checked={useGemini}
                    onChange={(e) => setUseGemini(e.target.checked)}
                    className="mr-1"
                  />
                  Gemini 사용
                </label>
              </div>
            </div>
            
            {useGemini && (
              <p className="text-xs bg-purple-100 p-2 rounded text-purple-700">💡 Gemini AI를 사용해서 더 정확한 인식을 수행합니다.</p>
            )}

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={recognizing}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`w-full p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                  recognizing 
                    ? 'bg-purple-100 border-purple-300 cursor-wait' 
                    : 'bg-white border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="text-2xl mb-2">{recognizing ? '🔄' : '📷'}</div>
                <p className="text-xs font-bold text-purple-700">
                  {recognizing ? '인식 중...' : '클릭해서 사진 선택 또는 드래그'}
                </p>
                <p className="text-xs text-purple-600 mt-1">JPG, PNG 지원</p>
              </label>
            </div>
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-full max-h-64 object-cover rounded-lg" />
            )}
            <div className="flex gap-2">
              <button 
                onClick={() => setShowImageUpload(false)}
                className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {showBatchInput && (
          <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200 space-y-3">
            <div>
              <p className="text-xs font-bold text-blue-700 mb-2">📝 형식: 문제번호 [유형] [정답]</p>
              <p className="text-xs text-blue-600 mb-2">예시 (각 줄 입력):</p>
              <code className="text-xs bg-white p-2 rounded block text-slate-600 whitespace-pre">1 객 3
2 주 정답
3,객관식,1
4 주관식</code>
            </div>
            <textarea
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              placeholder="1 객 3&#10;2 주 정답&#10;3 객 2"
              className="w-full h-24 p-3 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleBatchInput}
                className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
              >
                추가하기 ({batchText.trim().split('\n').filter(l => l.trim()).length}개)
              </button>
              <button 
                onClick={() => setShowBatchInput(false)}
                className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 animate-in slide-in-from-right-4 flex-wrap md:flex-nowrap">
            <div className="bg-slate-100 text-slate-500 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex-grow min-w-0">
              {q.type === QuestionType.MULTIPLE_CHOICE ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {['1','2','3','4','5'].map(num => (
                    <button 
                      key={num}
                      onClick={() => updateQuestion(q.id, { correctAnswer: num })}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${q.correctAnswer === num ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              ) : (
                <input 
                  type="text" 
                  value={q.correctAnswer}
                  onChange={e => updateQuestion(q.id, { correctAnswer: e.target.value })}
                  placeholder="주관식 정답 입력"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none border border-transparent focus:border-emerald-200"
                />
              )}
            </div>
            <button onClick={() => removeQuestion(q.id)} className="text-slate-300 hover:text-red-400 px-2 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3">
        <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 rounded-button font-bold text-slate-500">그만두기</button>
        <button onClick={handleSave} className="flex-1 py-4 bg-amber-400 text-white rounded-button font-bold shadow-lg shadow-amber-100 hover:bg-amber-500 transition-colors">정답지 저장!</button>
