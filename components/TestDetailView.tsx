
import React from 'react';
import { Test, Submission } from '../types';

interface Props {
  test: Test;
  submissions: Submission[];
  onBack: () => void;
  onSelectStudent: (submission: Submission) => void;
  onDeleteTest: (testId: string) => void;
}

const TestDetailView: React.FC<Props> = ({ test, submissions, onBack, onSelectStudent, onDeleteTest }) => {
  const testSubmissions = submissions.filter(s => s.testId === test.id);
  const scores = testSubmissions.map(s => s.score);
  const totalPossible = test.questions.reduce((acc, q) => acc + q.points, 0);

  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const max = scores.length > 0 ? Math.max(...scores) : 0;
  const min = scores.length > 0 ? Math.min(...scores) : 0;

  // 문항별 정답률
  const questionStats = test.questions.map((q, idx) => {
    const correctCount = testSubmissions.filter(s => s.gradedResults[q.id]).length;
    const rate = testSubmissions.length > 0 ? Math.round((correctCount / testSubmissions.length) * 100) : 0;
    return { question: q, index: idx, correctCount, rate };
  });

  const handleDelete = () => {
    if (confirm(`"${test.title}" 시험지를 삭제하시겠어요?\n관련된 제출 기록도 함께 삭제됩니다.`)) {
      onDeleteTest(test.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="flex-grow">
          <h1 className="text-2xl font-black text-slate-900">{test.title}</h1>
          <p className="text-slate-400 text-sm">{test.questions.length}문항 · 총 {totalPossible}점 만점</p>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors"
        >
          삭제
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm text-center">
          <p className="text-xs text-slate-400 mb-1">평균</p>
          <p className="text-3xl font-black text-indigo-600">{avg}<span className="text-sm text-slate-300 ml-0.5">점</span></p>
        </div>
        <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm text-center">
          <p className="text-xs text-slate-400 mb-1">최고</p>
          <p className="text-3xl font-black text-emerald-500">{max}<span className="text-sm text-slate-300 ml-0.5">점</span></p>
        </div>
        <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm text-center">
          <p className="text-xs text-slate-400 mb-1">최저</p>
          <p className="text-3xl font-black text-rose-400">{min}<span className="text-sm text-slate-300 ml-0.5">점</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 문항별 정답률 */}
        <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4">문항별 정답률</h3>
          <div className="space-y-3">
            {questionStats.map(({ index, rate }) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-6 text-right">{index + 1}</span>
                <div className="flex-grow bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${rate >= 70 ? 'bg-emerald-400' : rate >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
                    style={{ width: `${Math.max(rate, 2)}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-10 text-right ${rate >= 70 ? 'text-emerald-500' : rate >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {rate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 제출 학생 목록 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-card border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-between">
            제출 학생
            <span className="text-[10px] text-slate-400 font-normal">{testSubmissions.length}명</span>
          </h3>
          {testSubmissions.length === 0 ? (
            <div className="py-16 text-center text-slate-300 italic">아직 제출한 학생이 없어요.</div>
          ) : (
            <div className="space-y-2">
              {testSubmissions
                .sort((a, b) => b.score - a.score)
                .map((sub, rank) => {
                  const pct = Math.round((sub.score / sub.totalPossible) * 100);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectStudent(sub)}
                      className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all text-left group"
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${rank < 3 ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {rank + 1}
                      </span>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-slate-800 truncate">{sub.studentName}</p>
                        <p className="text-[10px] text-slate-400">
                          {Object.values(sub.gradedResults).filter(Boolean).length}/{test.questions.length} 정답
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-lg font-black ${pct >= 80 ? 'text-indigo-600' : pct >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {sub.score}<span className="text-[10px] text-slate-300 ml-0.5">/ {sub.totalPossible}</span>
                        </p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestDetailView;
