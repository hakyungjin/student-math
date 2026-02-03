
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
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in px-4 md:px-0">
      {/* 헤더 섹션 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2 flex-wrap">
            관리자 대시보드 
            <span className="text-xs md:text-sm font-normal text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">선생님 모드</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">시험지 정답을 관리하고 제출 현황을 확인하세요.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="w-full md:w-auto bg-indigo-600 text-white px-5 py-3 md:py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 text-sm md:text-base flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">새 정답지 만들기</span>
          <span className="sm:hidden">정답지 만들기</span>
        </button>
      </div>

      {/* 메인 컨텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* 제출 현황 테이블 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 md:p-6 rounded-card border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 md:mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                📊 실시간 제출 현황
              </span>
              <span className="text-xs md:text-sm text-slate-400 font-normal">최근 {submissions.length}건</span>
            </h3>
            
            {/* 모바일: 카드 레이아웃 */}
            <div className="md:hidden space-y-3">
              {submissions.length === 0 ? (
                <div className="py-8 text-center text-slate-300">
                  <p className="text-sm">아직 제출된 답안지가 없어요.</p>
                </div>
              ) : (
                submissions.map(sub => {
                  const test = tests.find(t => t.id === sub.testId);
                  return (
                    <div key={sub.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-bold text-slate-800">{sub.studentName}</div>
                        <div className="text-right">
                          <span className={`font-black text-lg ${sub.score >= sub.totalPossible * 0.8 ? 'text-indigo-600' : 'text-slate-900'}`}>{sub.score}</span>
                          <span className="text-xs text-slate-300 ml-0.5">/ {sub.totalPossible}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{test?.title || '삭제된 시험'}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* 데스크톱: 테이블 레이아웃 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400 border-b border-slate-50">
                  <tr>
                    <th className="pb-3 font-medium">학생 이름</th>
                    <th className="pb-3 font-medium">시험지 명</th>
                    <th className="pb-3 font-medium text-right">점수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {submissions.length === 0 ? (
                    <tr><td colSpan={3} className="py-10 text-center text-slate-300 italic">아직 제출된 답안지가 없어요.</td></tr>
                  ) : (
                    submissions.map(sub => {
                      const test = tests.find(t => t.id === sub.testId);
                      return (
                        <tr key={sub.id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectTest(test!)}>
                          <td className="py-4 font-bold text-slate-800">{sub.studentName}</td>
                          <td className="py-4 text-slate-500">{test?.title || '삭제된 시험'}</td>
                          <td className="py-4 text-right">
                            <span className={`font-black text-lg ${sub.score >= sub.totalPossible * 0.8 ? 'text-indigo-600' : 'text-slate-900'}`}>{sub.score}</span>
                            <span className="text-xs text-slate-300 ml-0.5">/ {sub.totalPossible}</span>
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

        {/* 등록된 정답지 목록 */}
        <div className="space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-card border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              📚 등록된 정답지
              <span className="text-xs font-normal text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{tests.length}</span>
            </h3>
            <div className="space-y-2 md:space-y-3">
              {tests.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">등록된 정답지가 없어요.</p>
              ) : (
                tests.map(test => {
                  const subCount = submissions.filter(s => s.testId === test.id).length;
                  return (
                    <div key={test.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => onSelectTest(test)}
                        className="flex-grow p-3 md:p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-between text-left"
                      >
                        <div className="overflow-hidden min-w-0">
                          <p className="font-bold text-slate-800 truncate text-sm">{test.title}</p>
                          <p className="text-xs text-slate-400">📝 {test.questions.length}문항 · ✏️ {subCount}명</p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${test.title}" 시험지를 삭제하시겠어요?\n관련된 제출 기록도 함께 삭제됩니다.`)) {
                            onDeleteTest(test.id);
                          }
                        }}
                        className="p-2 md:p-2.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex-shrink-0"
                        title="삭제"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
