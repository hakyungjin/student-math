import React, { useState } from 'react';
import { Test, Question, QuestionType } from '../types';

interface Props {
  onSave: (test: Omit<Test, 'id'>) => void;
  onCancel: () => void;
}

const TestCreator: React.FC<Props> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showBatchInput, setShowBatchInput] = useState(false);
  const [batchText, setBatchText] = useState('');

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // 간단한 일괄 입력: 줄바꿈으로 정답 입력
  // 예: 1 2 3 을 각 줄에 입력하면 1번 정답 1, 2번 정답 2, 3번 정답 3
  const handleBatchInput = () => {
    const lines = batchText.trim().split('\n').filter(line => line.trim());
    const newQuestions: Question[] = [];
    let questionNumber = questions.length + 1;

    lines.forEach((line) => {
      // 각 줄의 숫자들을 공백이나 쉼표로 분리
      const answers = line
        .trim()
        .split(/[\s,]+/)
        .filter(a => a && /^[1-5]$/.test(a)); // 1-5 숫자만 허용

      answers.forEach((answer) => {
        newQuestions.push({
          id: Math.random().toString(36).substr(2, 9),
          text: `${questionNumber}번 문제`,
          type: QuestionType.MULTIPLE_CHOICE,
          points: 10,
          correctAnswer: answer,
          options: ['1', '2', '3', '4']
        });
        questionNumber++;
      });
    });

    if (newQuestions.length === 0) {
      alert('숫자(1-5)를 줄바꿈이나 공백으로 구분해서 입력해주세요.\n예: 1 2 3');
      return;
    }

    setQuestions([...questions, ...newQuestions]);
    setBatchText('');
    setShowBatchInput(false);
    alert(`✅ ${newQuestions.length}개 문제가 추가되었습니다!`);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('정답지 이름을 입력해주세요!');
      return;
    }
    if (questions.length === 0) {
      alert('최소 1개 이상의 문제가 필요합니다!');
      return;
    }
    onSave({ title: title.trim(), questions });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 md:p-6">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.707 7.707a1 1 0 0 0-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 1 0 1.414 1.414L10 11.414l2.293 2.293a1 1 0 0 0 1.414-1.414L11.414 10l2.293-2.293a1 1 0 0 0-1.414-1.414L10 8.586 7.707 7.707z" clipRule="evenodd" /></svg>
          </button>
          <div className="flex-grow">
            <h1 className="text-sm md:text-base font-bold text-slate-900">정답지 생성</h1>
            <p className="text-xs text-slate-500">최대 50개 문제</p>
          </div>
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
            {questions.length}/50
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-grow overflow-y-auto pb-24 p-4 md:p-6 space-y-4">
        {/* 정답지 이름 입력 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase">정답지 이름</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="예: 2024년 1월 모의고사"
            maxLength={30}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-base outline-none focus:border-amber-300 focus:bg-white transition-colors"
          />
          <p className="text-xs text-slate-400">{title.length}/30</p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBatchInput(!showBatchInput)}
            className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-2 rounded-xl hover:bg-blue-200 transition-colors"
          >
            ⚡ 빠른 입력
          </button>
        </div>

        {/* 빠른 입력 섹션 */}
        {showBatchInput && (
          <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200 space-y-3">
            <div>
              <p className="text-xs font-bold text-blue-700 mb-1">⚡ 빠른 정답 입력</p>
              <p className="text-xs text-blue-600 mb-2">숫자(1-5)만 입력하세요. 줄바꿈이나 공백으로 구분됩니다.</p>
              <code className="text-xs bg-white p-2 rounded block text-slate-600 font-mono mb-2">
                예: 1 2 3
                <br />또는
                <br />1
                <br />2
                <br />3
              </code>
            </div>
            <textarea
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              placeholder="1 2 3 4 5"
              className="w-full h-20 p-3 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={handleBatchInput}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
              >
                추가하기 ✨
              </button>
              <button 
                onClick={() => setShowBatchInput(false)}
                className="flex-1 py-2.5 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 문제 목록 */}
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 animate-in slide-in-from-right-4 flex-wrap md:flex-nowrap">
            <div className="bg-slate-100 text-slate-500 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex-grow min-w-0">
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
            </div>
            <button onClick={() => removeQuestion(q.id)} className="text-slate-300 hover:text-red-400 px-2 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        ))}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3">
        <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">그만두기</button>
        <button onClick={handleSave} className="flex-1 py-4 bg-amber-400 text-white rounded-xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-500 transition-colors">정답지 저장!</button>
      </div>
    </div>
  );
};

export default TestCreator;
