
import React from 'react';
import { Test } from '../types';

interface Props {
  tests: Test[];
  onStartTest: (test: Test) => void;
}

const Home: React.FC<Props> = ({ tests, onStartTest }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-10 py-4">
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900">
          오늘 풀 시험지를 골라요! 📋
        </h1>
        <p className="text-slate-400 text-sm">
          종이 시험지의 정답을 아래에서 선택해 제출하세요.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {tests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-card border-2 border-dashed border-slate-100">
            <p className="text-slate-300">아직 준비된 시험지가 없어요.</p>
            <p className="text-[10px] text-slate-200 mt-2">선생님께 시험지를 열어달라고 말씀드려보세요!</p>
          </div>
        ) : (
          tests.map(test => (
            <button 
              key={test.id}
              onClick={() => onStartTest(test)}
              className="bg-white p-6 rounded-card flex items-center justify-between border border-slate-100 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100/50 transition-all text-left active:scale-[0.98]"
            >
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{test.title}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full">{test.questions.length}문항</span>
                  <span className="text-[10px] bg-amber-50 text-amber-500 px-2 py-0.5 rounded-full">지금 가능</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          ))
        )}
      </div>
      
      <div className="pt-10 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-300">시험지가 보이지 않나요? 새로고침을 해보세요.</p>
      </div>
    </div>
  );
};

export default Home;
