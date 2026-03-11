import React, { useState } from 'react';
import { Test, Submission } from '../types';
import { compareAnswers, formatForDisplay } from '../answerNormalizer';

interface Props {
  test: Test;
  onSubmit: (submission: Omit<Submission, 'id'>) => void;
  onCancel: () => void;
}

const isStandard15 = (options?: string[]) => {
  if (!options || options.length !== 5) return false;
  return options.every((o, i) => o === String(i + 1));
};

const CHOICE_LABELS = ['①', '②', '③', '④', '⑤'];

const StudentTestView: React.FC<Props> = ({ test, onSubmit, onCancel }) => {
  const [studentName, setStudentName] = useState('');
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = () => {
    if (!studentName.trim()) { alert('이름을 먼저 입력해주세요'); return; }
    setStarted(true);
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < test.questions.length) {
      if (!confirm('아직 풀지 않은 문제가 있습니다. 제출하시겠습니까?')) return;
    }

    setIsSubmitting(true);
    let totalScore = 0;
    const gradedResults: Record<string, boolean> = {};

    try {
      for (const q of test.questions) {
        const studentAnswer = (answers[q.id] || '').trim();
        // 부등식 등 수학 표현식도 정규화하여 비교
        const isCorrect = compareAnswers(studentAnswer, q.correctAnswer);
        gradedResults[q.id] = isCorrect;
        if (isCorrect) totalScore += q.points;
      }
      const totalPossible = test.questions.reduce((acc, q) => acc + q.points, 0);
      await onSubmit({ testId: test.id, studentName, answers, score: totalScore, totalPossible, gradedResults, submittedAt: Date.now() });
    } catch (e) {
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!started) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">답안지 작성</h2>
          <p className="text-slate-400 text-sm mb-8">{test.title}</p>
          <div className="space-y-4">
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleStart}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              시작하기
            </button>
            <button onClick={onCancel} className="text-slate-400 text-sm hover:text-slate-600">
              뒤로가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="max-w-2xl mx-auto">
        {/* 상단 고정 헤더 */}
        <div className="sticky top-16 bg-slate-50 py-4 z-10 border-b border-slate-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">{test.title}</h2>
              <p className="text-sm text-slate-400">{studentName}</p>
            </div>
            <div className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-medium">
              {Object.keys(answers).length}/{test.questions.length}
            </div>
          </div>
        </div>

        {/* 문제 목록 */}
        <div className="space-y-4">
          {test.questions.map((q, idx) => {
            const standard = isStandard15(q.options);
            const selected = answers[q.id];

            return (
              <div
                key={q.id}
                className={`bg-white p-5 rounded-2xl border transition-all ${selected ? 'border-blue-200' : 'border-slate-100'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selected ? '답변 완료' : '미응답'}
                  </span>
                </div>

                {standard ? (
                  <div className="flex gap-2 flex-wrap">
                    {['1','2','3','4','5'].map(num => (
                      <button
                        key={num}
                        onClick={() => handleAnswerChange(q.id, num)}
                        className={`w-11 h-11 rounded-xl font-bold transition-all ${selected === num ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(q.options || []).map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                          selected === opt
                            ? 'border-blue-500 bg-blue-50 text-slate-800 font-medium'
                            : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selected === opt ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {CHOICE_LABELS[i] || i + 1}
                        </span>
                        <span className="flex-grow min-w-0 break-words font-mono">{formatForDisplay(opt)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 제출 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-10">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-medium text-lg transition-all ${isSubmitting ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
          >
            {isSubmitting ? '채점 중...' : '제출하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTestView;
