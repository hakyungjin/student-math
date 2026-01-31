
import React from 'react';
import { Test, Submission } from '../types';

interface Props {
  tests: Test[];
  submissions: Submission[];
  onCreateNew: () => void;
}

const TeacherDashboard: React.FC<Props> = ({ tests, submissions, onCreateNew }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            관리자 대시보드 <span className="text-xs font-normal text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">선생님 모드</span>
          </h1>
          <p className="text-slate-500 text-sm">시험지 정답을 관리하고 제출 현황을 확인하세요.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          새 정답지 만들기
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-6 flex items-center justify-between">
              실시간 제출 현황
              <span className="text-[10px] text-slate-400 font-normal">최근 {submissions.length}건</span>
            </h3>
            <div className="overflow-x-auto">
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
                        <tr key={sub.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4 font-bold text-slate-800">{sub.studentName}</td>
                          <td className="py-4 text-slate-500">{test?.title || '삭제된 시험'}</td>
                          <td className="py-4 text-right">
                            <span className={`font-black text-lg ${sub.score >= sub.totalPossible * 0.8 ? 'text-indigo-600' : 'text-slate-900'}`}>{sub.score}</span>
                            <span className="text-[10px] text-slate-300 ml-0.5">/ {sub.totalPossible}</span>
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

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-card border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4">등록된 정답지 ({tests.length})</h3>
            <div className="space-y-3">
              {tests.map(test => (
                <div key={test.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between">
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 truncate text-sm">{test.title}</p>
                    <p className="text-[10px] text-slate-400">{test.questions.length}개 정답</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
