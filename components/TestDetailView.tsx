
import React, { useState } from 'react';
import { Test, Submission } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  test: Test;
  submissions: Submission[];
  onBack: () => void;
  onSelectStudent: (submission: Submission) => void;
  onDeleteTest: (testId: string) => void;
}

type TabType = 'overview' | 'matrix' | 'students';

const TestDetailView: React.FC<Props> = ({ test, submissions, onBack, onSelectStudent, onDeleteTest }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const testSubmissions = submissions.filter(s => s.testId === test.id);
  const scores = testSubmissions.map(s => s.score);
  const totalPossible = test.questions.reduce((acc, q) => acc + q.points, 0);

  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const max = scores.length > 0 ? Math.max(...scores) : 0;
  const min = scores.length > 0 ? Math.min(...scores) : 0;

  // 표준편차
  const stdDev = scores.length > 1
    ? Math.round(Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length) * 10) / 10
    : 0;

  // 전체 정답률
  const totalCorrect = testSubmissions.reduce((sum, s) => sum + Object.values(s.gradedResults).filter(Boolean).length, 0);
  const totalAnswered = testSubmissions.length * test.questions.length;
  const overallCorrectRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // 문항별 정답률
  const questionStats = test.questions.map((q, idx) => {
    const correctCount = testSubmissions.filter(s => s.gradedResults[q.id]).length;
    const rate = testSubmissions.length > 0 ? Math.round((correctCount / testSubmissions.length) * 100) : 0;
    return { question: q, index: idx, correctCount, rate };
  });

  // 점수 분포 (10점 단위 구간)
  const distributionBuckets: { range: string; count: number; pct: number }[] = [];
  if (totalPossible > 0 && testSubmissions.length > 0) {
    const step = Math.max(Math.ceil(totalPossible / 10), 1);
    for (let i = 0; i <= totalPossible; i += step) {
      const lo = i;
      const hi = Math.min(i + step - 1, totalPossible);
      const label = lo === hi ? `${lo}` : `${lo}-${hi}`;
      const count = scores.filter(s => s >= lo && s <= hi).length;
      distributionBuckets.push({ range: label, count, pct: Math.round((count / testSubmissions.length) * 100) });
    }
  }

  // 가장 어려운 문항, 가장 쉬운 문항
  const sortedByDifficulty = [...questionStats].sort((a, b) => a.rate - b.rate);
  const hardestQ = sortedByDifficulty.length > 0 ? sortedByDifficulty[0] : null;
  const easiestQ = sortedByDifficulty.length > 0 ? sortedByDifficulty[sortedByDifficulty.length - 1] : null;

  const handleDelete = () => {
    if (confirm(`"${test.title}" 시험지를 삭제하시겠어요?\n관련된 제출 기록도 함께 삭제됩니다.`)) {
      onDeleteTest(test.id);
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: '전체 통계' },
    { key: 'matrix', label: '학생별 O/X' },
    { key: 'students', label: '학생 목록' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="flex-grow">
          <h1 className="text-2xl font-black text-slate-900">{test.title}</h1>
          <p className="text-slate-400 text-sm">{test.questions.length}문항 · 총 {totalPossible}점 만점 · {testSubmissions.length}명 제출</p>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors"
        >
          삭제
        </button>
      </div>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-card border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 mb-1">평균</p>
          <p className="text-2xl font-black text-indigo-600">{avg}<span className="text-xs text-slate-300 ml-0.5">점</span></p>
        </div>
        <div className="bg-white p-4 rounded-card border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 mb-1">최고</p>
          <p className="text-2xl font-black text-emerald-500">{max}<span className="text-xs text-slate-300 ml-0.5">점</span></p>
        </div>
        <div className="bg-white p-4 rounded-card border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 mb-1">최저</p>
          <p className="text-2xl font-black text-rose-400">{min}<span className="text-xs text-slate-300 ml-0.5">점</span></p>
        </div>
        <div className="bg-white p-4 rounded-card border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 mb-1">표준편차</p>
          <p className="text-2xl font-black text-amber-500">{stdDev}</p>
        </div>
        <div className="bg-white p-4 rounded-card border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 mb-1">전체 정답률</p>
          <p className="text-2xl font-black text-indigo-500">{overallCorrectRate}<span className="text-xs text-slate-300 ml-0.5">%</span></p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 점수 분포 차트 */}
            <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-4">점수 분포</h3>
              {distributionBuckets.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={distributionBuckets} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      formatter={(value: number) => [`${value}명`, '학생 수']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {distributionBuckets.map((entry, i) => (
                        <Cell key={i} fill={entry.count > 0 ? '#6366f1' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-16 text-center text-slate-300 italic">제출 데이터가 없습니다.</div>
              )}
            </div>

            {/* 문항별 정답률 */}
            <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-4">문항별 정답률</h3>
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {questionStats.map(({ index, rate, correctCount }) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-6 text-right">{index + 1}</span>
                    <div className="flex-grow bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${rate >= 70 ? 'bg-emerald-400' : rate >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
                        style={{ width: `${Math.max(rate, 2)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-16 text-right ${rate >= 70 ? 'text-emerald-500' : rate >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {rate}% <span className="text-slate-300">({correctCount})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 가장 어려운 / 쉬운 문항 */}
          {hardestQ && easiestQ && testSubmissions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 p-5 rounded-card border border-rose-100">
                <p className="text-xs font-bold text-rose-400 mb-1">가장 어려운 문항</p>
                <p className="text-lg font-black text-rose-600">
                  {hardestQ.index + 1}번 <span className="text-sm font-bold text-rose-400">정답률 {hardestQ.rate}%</span>
                </p>
                <p className="text-xs text-rose-400 mt-1">정답: {hardestQ.question.correctAnswer}</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-card border border-emerald-100">
                <p className="text-xs font-bold text-emerald-400 mb-1">가장 쉬운 문항</p>
                <p className="text-lg font-black text-emerald-600">
                  {easiestQ.index + 1}번 <span className="text-sm font-bold text-emerald-400">정답률 {easiestQ.rate}%</span>
                </p>
                <p className="text-xs text-emerald-400 mt-1">정답: {easiestQ.question.correctAnswer}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-between">
            학생별 문항 결과
            <span className="text-[10px] text-slate-400 font-normal">{testSubmissions.length}명 · {test.questions.length}문항</span>
          </h3>
          {testSubmissions.length === 0 ? (
            <div className="py-16 text-center text-slate-300 italic">아직 제출한 학생이 없어요.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-white z-10 text-left pb-3 pr-4 font-bold text-slate-500 border-b border-slate-100 min-w-[100px]">학생</th>
                    {test.questions.map((_, idx) => (
                      <th key={idx} className="pb-3 px-1 font-bold text-slate-400 text-center border-b border-slate-100 min-w-[40px]">
                        {idx + 1}
                      </th>
                    ))}
                    <th className="pb-3 pl-4 font-bold text-slate-500 text-center border-b border-slate-100 min-w-[70px]">점수</th>
                    <th className="pb-3 pl-2 font-bold text-slate-500 text-center border-b border-slate-100 min-w-[50px]">정답</th>
                  </tr>
                </thead>
                <tbody>
                  {testSubmissions
                    .sort((a, b) => b.score - a.score)
                    .map((sub, rank) => {
                      const correctCount = Object.values(sub.gradedResults).filter(Boolean).length;
                      const pct = Math.round((sub.score / sub.totalPossible) * 100);
                      return (
                        <tr
                          key={sub.id}
                          onClick={() => onSelectStudent(sub)}
                          className="hover:bg-indigo-50 cursor-pointer transition-colors group"
                        >
                          <td className="sticky left-0 bg-white group-hover:bg-indigo-50 transition-colors py-3 pr-4 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${rank < 3 ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                {rank + 1}
                              </span>
                              <span className="font-bold text-slate-800 truncate">{sub.studentName}</span>
                            </div>
                          </td>
                          {test.questions.map(q => {
                            const isCorrect = sub.gradedResults[q.id];
                            return (
                              <td key={q.id} className="py-3 px-1 text-center border-b border-slate-50">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                                  isCorrect
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-rose-100 text-rose-600'
                                }`}>
                                  {isCorrect ? 'O' : 'X'}
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-3 pl-4 text-center border-b border-slate-50">
                            <span className={`font-black ${pct >= 80 ? 'text-indigo-600' : pct >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                              {sub.score}<span className="text-[10px] text-slate-300 ml-0.5">/{sub.totalPossible}</span>
                            </span>
                          </td>
                          <td className="py-3 pl-2 text-center border-b border-slate-50">
                            <span className="text-slate-500 font-bold text-xs">{correctCount}/{test.questions.length}</span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                {/* 문항별 정답률 요약 행 */}
                <tfoot>
                  <tr className="bg-slate-50">
                    <td className="sticky left-0 bg-slate-50 py-3 pr-4 font-bold text-slate-500 text-xs">정답률</td>
                    {questionStats.map(({ index, rate }) => (
                      <td key={index} className="py-3 px-1 text-center">
                        <span className={`text-[10px] font-black ${rate >= 70 ? 'text-emerald-500' : rate >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {rate}%
                        </span>
                      </td>
                    ))}
                    <td className="py-3 pl-4 text-center">
                      <span className="text-xs font-black text-indigo-500">{overallCorrectRate}%</span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
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
                  const correctCount = Object.values(sub.gradedResults).filter(Boolean).length;
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
                          {correctCount}/{test.questions.length} 정답
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
      )}
    </div>
  );
};

export default TestDetailView;
