import React from 'react';
import { Test, Submission } from '../types';

interface Props {
  tests: Test[];
  submissions: Submission[];
  onCreateNew: () => void;
  onSelectTest: (test: Test) => void;
  onDeleteTest: (testId: string) => void;
}

const TeacherDashboard: React.FC<Props> = ({ tests, submissions, onCreateNew, onSelectTest, onDeleteTest }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            관리자 대시보드
          </h1>
          <p className="text-slate-500 text-sm mt-1">시험지 정답을 관리하고 제출 현황을 확인하세요</p>
        </div>
        <button
          onClick={onCreateNew}
          className="w-full md:w-auto bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 정답지 만들기
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-slate-800">{tests.length}</div>
          <div className="text-sm text-slate-500">등록된 정답지</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
          <div className="text-sm text-slate-500">총 제출</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-emerald-600">
            {submissions.length > 0
              ? Math.round(submissions.reduce((sum, s) => sum + (s.score / s.totalPossible) * 100, 0) / submissions.length)
              : 0}%
          </div>
          <div className="text-sm text-slate-500">평균 정답률</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(submissions.map(s => s.studentName)).size}
          </div>
          <div className="text-sm text-slate-500">참여 학생</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 실시간 제출 현황 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center justify-between">
                <span>실시간 제출 현황</span>
                <span className="text-sm text-slate-400 font-normal">최근 {submissions.length}건</span>
              </h3>
            </div>

            {/* 모바일 뷰 */}
            <div className="md:hidden p-4 space-y-3">
              {submissions.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  아직 제출된 답안지가 없습니다
                </div>
              ) : (
                submissions.slice(0, 10).map(sub => {
                  const test = tests.find(t => t.id === sub.testId);
                  const percentage = Math.round((sub.score / sub.totalPossible) * 100);
                  return (
                    <div key={sub.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-bold text-slate-800">{sub.studentName}</div>
                        <div className={`font-bold ${percentage >= 80 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                          {sub.score}/{sub.totalPossible}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{test?.title || '삭제된 시험'}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* 데스크톱 테이블 */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">학생</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">시험지</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-slate-500">점수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-slate-400">
                        아직 제출된 답안지가 없습니다
                      </td>
                    </tr>
                  ) : (
                    submissions.slice(0, 10).map(sub => {
                      const test = tests.find(t => t.id === sub.testId);
                      const percentage = Math.round((sub.score / sub.totalPossible) * 100);
                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => test && onSelectTest(test)}
                        >
                          <td className="px-5 py-4 font-medium text-slate-800">{sub.studentName}</td>
                          <td className="px-5 py-4 text-slate-500">{test?.title || '삭제된 시험'}</td>
                          <td className="px-5 py-4 text-right">
                            <span className={`font-bold ${percentage >= 80 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                              {sub.score}
                            </span>
                            <span className="text-slate-400">/{sub.totalPossible}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 등록된 정답지 */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                등록된 정답지
                <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {tests.length}
                </span>
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {tests.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">등록된 정답지가 없습니다</p>
              ) : (
                tests.map(test => {
                  const subCount = submissions.filter(s => s.testId === test.id).length;
                  return (
                    <div key={test.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => onSelectTest(test)}
                        className="flex-grow p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-between text-left"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate text-sm">{test.title}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {test.questions.length}문항 · {subCount}명 응시
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${test.title}" 시험지를 삭제하시겠습니까?\n관련된 제출 기록도 함께 삭제됩니다.`)) {
                            onDeleteTest(test.id);
                          }
                        }}
                        className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
