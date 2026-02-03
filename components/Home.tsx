
import React from 'react';
import { Test } from '../types';

interface Props {
  tests: Test[];
  onStartTest: (test: Test) => void;
}

const Home: React.FC<Props> = ({ tests, onStartTest }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-10 py-4 md:py-8 px-4 md:px-0">
      {/* 헤더 섹션 */}
      <section className="text-center space-y-2 md:space-y-3">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900">
          오늘 풀 시험지를 골라요! 📋
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          종이 시험지의 정답을 아래에서 선택해 제출하세요.
        </p>
      </section>

      {/* 시험지 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {tests.length === 0 ? (
          <div className="col-span-full text-center py-16 md:py-20 bg-white rounded-card border-2 border-dashed border-slate-100">
            <p className="text-slate-300 text-sm md:text-base">아직 준비된 시험지가 없어요.</p>
            <p className="text-xs text-slate-200 mt-2">선생님께 시험지를 열어달라고 말씀드려보세요!</p>
          </div>
        ) : (
          tests.map(test => (
            <button 
              key={test.id}
              onClick={() => onStartTest(test)}
              className="bg-white p-4 md:p-6 rounded-card border border-slate-100 hover:border-amber-300 hover:shadow-lg md:hover:shadow-xl hover:shadow-amber-100/50 transition-all text-left active:scale-[0.98] flex flex-col gap-3"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-base md:text-lg line-clamp-2">{test.title}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-slate-50 text-slate-400 px-2.5 py-1 rounded-full">
                    📝 {test.questions.length}문항
                  </span>
                  <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-semibold">
                    지금 가능
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-amber-500">
                <span className="text-xs font-semibold">풀어보기</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          ))
        )}
      </div>
      
      {/* 푸터 팁 */}
      <div className="pt-6 md:pt-10 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-300">💡 시험지가 보이지 않나요? 페이지를 새로고침해보세요.</p>      </div>
    </div>
  );
};

export default Home;