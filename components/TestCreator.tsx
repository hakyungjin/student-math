import React, { useState } from 'react';
import { Test, Question, QuestionType } from '../types';
import { generateDistractors, makeShuffledOptions } from '../distractorGenerator';

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

  // 일괄 입력 처리
  // a 3        → 객관식 3번 (표준 1~5)
  // b 55       → 주관식 55 → 객관식 변환 (오답 자동생성)
  // 3          → (기존 호환) 객관식 3번
  const handleBatchInput = () => {
    const lines = batchText.trim().split('\n').filter(line => line.trim());
    const newQuestions: Question[] = [];
    let questionNumber = questions.length + 1;

    for (const line of lines) {
      const trimmed = line.trim();

      // "a 3" 형식: 객관식
      const mcMatch = trimmed.match(/^[aA]\s+([1-5])$/);
      if (mcMatch) {
        newQuestions.push({
          id: Math.random().toString(36).substr(2, 9),
          text: `${questionNumber}번`,
          type: QuestionType.MULTIPLE_CHOICE,
          points: 10,
          correctAnswer: mcMatch[1],
          options: ['1', '2', '3', '4', '5'],
        });
        questionNumber++;
        continue;
      }

      // "b 정답텍스트" 형식: 주관식 → 객관식 변환
      const saMatch = trimmed.match(/^[bB]\s+(.+)$/);
      if (saMatch) {
        const correctAnswer = saMatch[1].trim();
        const distractors = generateDistractors(correctAnswer);
        const options = makeShuffledOptions(correctAnswer, distractors);
        newQuestions.push({
          id: Math.random().toString(36).substr(2, 9),
          text: `${questionNumber}번`,
          type: QuestionType.MULTIPLE_CHOICE,
          points: 10,
          correctAnswer,
          options,
        });
        questionNumber++;
        continue;
      }

      // 기존 호환: 순수 숫자 (1~5)만 있으면 객관식
      const nums = trimmed.split(/[\s,]+/).filter(a => a && /^[1-5]$/.test(a));
      for (const answer of nums) {
        newQuestions.push({
          id: Math.random().toString(36).substr(2, 9),
          text: `${questionNumber}번`,
          type: QuestionType.MULTIPLE_CHOICE,
          points: 10,
          correctAnswer: answer,
          options: ['1', '2', '3', '4', '5'],
        });
        questionNumber++;
      }
    }

    if (newQuestions.length === 0) {
      alert('입력 형식을 확인해주세요.\n\n• a 3  → 객관식 3번\n• b 55 → 주관식(자동 객관식 변환)\n• 3     → 객관식 3번 (간단 입력)');
      return;
    }

    setQuestions([...questions, ...newQuestions]);
    setBatchText('');
    setShowBatchInput(false);
  };

  // 선지 재생성 (주관식→객관식 변환된 문제)
  const regenerateOptions = (id: string) => {
    const q = questions.find(q => q.id === id);
    if (!q || isStandardMC(q)) return;
    const distractors = generateDistractors(q.correctAnswer);
    const options = makeShuffledOptions(q.correctAnswer, distractors);
    updateQuestion(id, { options });
  };

  const isStandardMC = (q: Question) => {
    return /^[1-5]$/.test(q.correctAnswer) &&
      q.options?.length === 5 &&
      q.options.every((o, i) => o === String(i + 1));
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
    onSave({ title: title.trim(), description: '', questions, createdAt: Date.now() });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 md:p-6 z-20">
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

        {/* 빠른 입력 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowBatchInput(!showBatchInput)}
            className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-2 rounded-xl hover:bg-blue-200 transition-colors"
          >
            {showBatchInput ? '닫기' : '일괄 입력'}
          </button>
        </div>

        {/* 빠른 입력 섹션 */}
        {showBatchInput && (
          <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200 space-y-3">
            <div>
              <p className="text-xs font-bold text-blue-700 mb-2">일괄 정답 입력</p>
              <div className="text-xs text-blue-600 space-y-1 mb-3">
                <p className="font-bold">입력 형식:</p>
                <div className="bg-white rounded-lg p-3 font-mono space-y-0.5 text-[11px]">
                  <p><span className="text-amber-600 font-bold">a 3</span> ← 객관식 3번</p>
                  <p><span className="text-amber-600 font-bold">a 1</span> ← 객관식 1번</p>
                  <p><span className="text-emerald-600 font-bold">b 55</span> ← 주관식(정답 55) → 객관식 변환</p>
                  <p><span className="text-emerald-600 font-bold">b 3/4π</span> ← 주관식 → 객관식 변환</p>
                  <p><span className="text-slate-400">3</span> ← 간단히 숫자만 (객관식 3번)</p>
                </div>
                <p className="text-[10px] text-blue-400 mt-1">한 줄에 하나씩 입력하세요. <strong>b</strong> 타입은 오답 선지가 자동 생성됩니다.</p>
              </div>
            </div>
            <textarea
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              placeholder={"a 4\na 1\na 3\nb 128\nb a<-3 또는 a>2\na 2\nb ㄱ, ㄴ, ㄹ\n3"}
              className="w-full h-32 p-3 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleBatchInput}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
              >
                추가하기
              </button>
              <button
                onClick={() => { setShowBatchInput(false); setBatchText(''); }}
                className="flex-1 py-2.5 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 문제 목록 */}
        {questions.length === 0 && (
          <div className="text-center py-12 text-slate-300">
            <p className="text-sm">아직 문제가 없습니다.</p>
            <p className="text-xs mt-1">위의 "일괄 입력"으로 정답을 추가하세요.</p>
          </div>
        )}

        {questions.map((q, index) => {
          const standard = isStandardMC(q);
          return (
            <div key={q.id} className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-sm animate-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-100 text-slate-500 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-grow min-w-0">
                  {standard ? (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">객관식</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">주관식→객관식</span>
                  )}
                </div>
                <button onClick={() => removeQuestion(q.id)} className="text-slate-300 hover:text-red-400 p-1 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>

              {standard ? (
                /* 표준 객관식: 1~5 버튼 */
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
                /* 주관식→객관식: 정답 표시 + 생성된 선지 미리보기 */
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">정답</span>
                    <span className="text-sm font-bold text-slate-800 truncate">{q.correctAnswer}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options?.map((opt, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2.5 py-1 rounded-lg ${opt === q.correctAnswer ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {i + 1}. {opt}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => regenerateOptions(q.id)}
                    className="text-[10px] text-blue-400 hover:text-blue-600"
                  >
                    선지 다시 생성
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3 z-20">
        <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">그만두기</button>
        <button onClick={handleSave} className="flex-1 py-4 bg-amber-400 text-white rounded-xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-500 transition-colors">정답지 저장!</button>
      </div>
    </div>
  );
};

export default TestCreator;
