
import React, { useState } from 'react';
import { Test, Question, QuestionType } from '../types';

interface Props {
  onSave: (test: Omit<Test, 'id'>) => void;
  onCancel: () => void;
}

const TestCreator: React.FC<Props> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = (type: QuestionType) => {
    const num = questions.length + 1;
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: `${num}번 문제`, // 기본값으로 번호만 지정
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

  const handleSave = () => {
    if (!title) { alert('제목을 지어주세요!'); return; }
    if (questions.length === 0) { alert('정답을 최소 하나는 넣어주세요.'); return; }
    onSave({ title, description: '', questions, createdAt: Date.now() });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 pb-32">
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
          <div className="flex gap-2">
            <button onClick={() => addQuestion(QuestionType.MULTIPLE_CHOICE)} className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-2 rounded-xl">객관식 추가</button>
            <button onClick={() => addQuestion(QuestionType.SHORT_ANSWER)} className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl">주관식 추가</button>
          </div>
        </div>

        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 animate-in slide-in-from-right-4">
            <div className="bg-slate-100 text-slate-500 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex-grow">
              {q.type === QuestionType.MULTIPLE_CHOICE ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {['1','2','3','4','5'].map(num => (
                    <button 
                      key={num}
                      onClick={() => updateQuestion(q.id, { correctAnswer: num })}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${q.correctAnswer === num ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}
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
            <button onClick={() => removeQuestion(q.id)} className="text-slate-300 hover:text-red-400 px-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3">
        <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 rounded-button font-bold text-slate-500">그만두기</button>
        <button onClick={handleSave} className="flex-2 py-4 bg-amber-400 text-white rounded-button font-bold shadow-lg shadow-amber-100">정답지 저장!</button>
      </div>
    </div>
  );
};

export default TestCreator;
