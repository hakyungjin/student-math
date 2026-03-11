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

  const handleBatchInput = () => {
    const lines = batchText.trim().split('\n').filter(line => line.trim());
    const newQuestions: Question[] = [];
    let questionNumber = questions.length + 1;

    for (const line of lines) {
      const trimmed = line.trim();

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
      alert('정답지 이름을 입력해주세요');
      return;
    }
    if (questions.length === 0) {
      alert('최소 1개 이상의 문제가 필요합니다');
      return;
    }
    onSave({ title: title.trim(), description: '', questions, createdAt: Date.now() });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-slate-100 p-4 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-grow">
            <h1 className="font-bold text-slate-800">정답지 생성</h1>
            <p className="text-xs text-slate-400">최대 50개 문제</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium">
            {questions.length}/50
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-grow pb-24 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* 정답지 이름 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100">
            <label className="text-xs font-medium text-slate-500 mb-2 block">정답지 이름</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예: 2024년 1월 모의고사"
              maxLength={30}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-2">{title.length}/30</p>
          </div>

          {/* 일괄 입력 버튼 */}
          <button
            onClick={() => setShowBatchInput(!showBatchInput)}
            className="text-sm font-medium bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {showBatchInput ? '닫기' : '일괄 입력'}
          </button>

          {/* 일괄 입력 패널 */}
          {showBatchInput && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">일괄 정답 입력</p>
                <div className="text-xs text-slate-500 space-y-1 mb-3">
                  <div className="bg-white rounded-lg p-3 font-mono space-y-1">
                    <p><span className="text-blue-600 font-medium">a 3</span> ← 객관식 3번</p>
                    <p><span className="text-emerald-600 font-medium">b 55</span> ← 주관식(정답 55) → 객관식 변환</p>
                    <p><span className="text-slate-400">3</span> ← 간단히 숫자만 (객관식 3번)</p>
                  </div>
                </div>
              </div>
              <textarea
                value={batchText}
                onChange={e => setBatchText(e.target.value)}
                placeholder={"a 4\na 1\na 3\nb 128\na 2\n3"}
                className="w-full h-32 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleBatchInput}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                >
                  추가하기
                </button>
                <button
                  onClick={() => { setShowBatchInput(false); setBatchText(''); }}
                  className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 문제 없을 때 */}
          {questions.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-slate-500">아직 문제가 없습니다</p>
              <p className="text-xs text-slate-400 mt-1">"일괄 입력"으로 정답을 추가하세요</p>
            </div>
          )}

          {/* 문제 목록 */}
          {questions.map((q, index) => {
            const standard = isStandardMC(q);
            return (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-slate-100 text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    {standard ? (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">객관식</span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">주관식→객관식</span>
                    )}
                  </div>
                  <button onClick={() => removeQuestion(q.id)} className="text-slate-300 hover:text-red-500 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {standard ? (
                  <div className="flex items-center gap-2">
                    {['1','2','3','4','5'].map(num => (
                      <button
                        key={num}
                        onClick={() => updateQuestion(q.id, { correctAnswer: num })}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${q.correctAnswer === num ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">정답</span>
                      <span className="text-sm font-bold text-slate-800">{q.correctAnswer}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {q.options?.map((opt, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded ${opt === q.correctAnswer ? 'bg-emerald-100 text-emerald-700 font-medium' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {i + 1}. {opt}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => regenerateOptions(q.id)}
                      className="text-xs text-blue-500 hover:text-blue-600"
                    >
                      선지 다시 생성
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-20">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
            취소
          </button>
          <button onClick={handleSave} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCreator;
