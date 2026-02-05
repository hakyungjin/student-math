import React, { useState } from 'react';
import { Test, Submission } from '../types';

interface Props {
  test: Test;
  onSubmit: (submission: Omit<Submission, 'id'>) => void;
  onCancel: () => void;
}

// 표준 1~5 객관식인지 판별
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
    if (!studentName.trim()) { alert('이름을 먼저 알려주세요!'); return; }
    setStarted(true);
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < test.questions.length) {
      if (!confirm('아직 안 푼 문제가 있어요! 그래도 제출할까요?')) return;
    }

    setIsSubmitting(true);
    let totalScore = 0;
    const gradedResults: Record<string, boolean> = {};

    try {
      for (const q of test.questions) {
        const studentAnswer = (answers[q.id] || '').trim();
        // 모든 문제를 객관식 정확 매칭으로 채점
        const isCorrect = studentAnswer === q.correctAnswer;
        gradedResults[q.id] = isCorrect;
        if (isCorrect) totalScore += q.points;
      }
      const totalPossible = test.questions.reduce((acc, q) => acc + q.points, 0);
      await onSubmit({ testId: test.id, studentName, answers, score: totalScore, totalPossible, gradedResults, submittedAt: Date.now() });
    } catch (e) {
      alert("전송 중에 잠시 문제가 생겼어요. 다시 한 번 눌러주세요!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!started) {
    return (
      <div className="max-w-md bg-white p-8 md:p-10 rounded-card shadow-2xl shadow-amber-100/20 border border-slate-50 mt-6 md:mt-10 text-center mx-4 md:mx-auto">
        <div className="w-16 h-16 bg-amber-400 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-2xl">✍️</div>
        <h2 className="text-lg md:text-xl font-black mb-1">답안지를 준비할게요</h2>
        <p className="text-slate-400 text-xs md:text-sm mb-8">{test.title}</p>
        <div className="space-y-3">
          <input
            type="text"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 border-slate-50 focus:border-amber-400 outline-none text-center font-bold text-base md:text-lg transition-all"
          />
          <button
            onClick={handleStart}
            className="w-full bg-slate-900 text-white py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            답 적기 시작!
          </button>
          <button onClick={onCancel} className="text-slate-300 text-xs py-2 hover:text-slate-400">뒤로가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-40 px-4 md:px-0">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-6 md:mb-10 sticky top-14 md:top-16 bg-amber-50 py-3 md:py-4 z-10 rounded-b-2xl">
          <h2 className="text-lg md:text-xl font-black text-slate-800">{test.title}</h2>
          <p className="text-slate-400 text-xs mt-1">{studentName} 학생, 시험지에 집중하세요!</p>
        </div>

        <div className="space-y-3">
          {test.questions.map((q, idx) => {
            const standard = isStandard15(q.options);
            const selected = answers[q.id];

            return (
              <div
                key={q.id}
                className={`bg-white p-4 md:p-5 rounded-2xl border-2 transition-all ${selected ? 'border-amber-200' : 'border-slate-100'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {selected ? '✓ 선택됨' : '미선택'}
                  </span>
                </div>

                {standard ? (
                  /* 표준 1~5 객관식: 숫자 원형 버튼 */
                  <div className="flex justify-start gap-2 flex-wrap">
                    {['1','2','3','4','5'].map(num => (
                      <button
                        key={num}
                        onClick={() => handleAnswerChange(q.id, num)}
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-full font-bold transition-all border-2 text-sm ${selected === num ? 'bg-amber-400 border-amber-400 text-white shadow-lg scale-110' : 'bg-white border-slate-100 text-slate-400 hover:border-amber-200'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* 텍스트 선지 객관식: 카드형 버튼 */
                  <div className="space-y-2">
                    {(q.options || []).map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-sm ${
                          selected === opt
                            ? 'border-amber-400 bg-amber-50 text-slate-800 font-bold'
                            : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selected === opt ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {CHOICE_LABELS[i] || i + 1}
                        </span>
                        <span className="flex-grow min-w-0 break-words">{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg text-center text-xs md:text-sm text-amber-700">
          <span className="font-semibold">{Object.keys(answers).length}/{test.questions.length}</span> 문제 풀음
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-amber-50 via-amber-50/90 to-transparent pt-10 z-10">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg shadow-xl transition-all active:scale-95 ${isSubmitting ? 'bg-slate-200 text-slate-400 cursor-wait' : 'bg-amber-400 text-white shadow-amber-200 hover:bg-amber-500'}`}
          >
            {isSubmitting ? '채점 중...' : '다 풀었습니다! 제출!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTestView;
