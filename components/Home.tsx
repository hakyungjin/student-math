import React from 'react';
import { Test } from '../types';

interface Props {
  tests: Test[];
  onStartTest: (test: Test) => void;
}

const Home: React.FC<Props> = ({ tests, onStartTest }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 md:py-8">
      {/* 헤더 섹션 */}
      <section className="text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          시험지를 선택하세요
        </h1>
        <p className="text-slate-500 text-sm">
          종이 시험지의 정답을 아래에서 선택해 제출하세요
        </p>
      </section>

      {/* 시험지 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 mb-2">아직 준비된 시험지가 없습니다</p>
            <p className="text-xs text-slate-400">관리자에게 시험지를 요청하세요</p>
          </div>
        ) : (
          tests.map(test => (
            <button
              key={test.id}
              onClick={() => onStartTest(test)}
              className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                  {test.questions.length}
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{test.title}</h3>
              <div className="flex gap-2">
                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">
                  {test.questions.length}문항
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-medium">
                  응시 가능
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* 푸터 팁 */}
      <div className="pt-8 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">시험지가 보이지 않나요? 페이지를 새로고침해보세요</p>
      </div>
    </div>
  );
};

export default Home;
