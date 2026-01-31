
import React from 'react';
import { Submission, Test } from '../types';

interface Props {
  submission: Submission;
  test: Test;
  onHome: () => void;
}

const StudentResultView: React.FC<Props> = ({ submission, test, onHome }) => {
  const percentage = (submission.score / submission.totalPossible) * 100;

  return (
    <div className="max-w-xl mx-auto py-8 animate-in slide-in-from-top-8">
      <div className="bg-white rounded-card shadow-2xl overflow-hidden border border-amber-50">
        <div className={`p-12 text-center text-white ${percentage >= 80 ? 'bg-emerald-400' : percentage >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}>
          <p className="text-xl font-bold opacity-80 mb-2">{submission.studentName} 학생의 점수는?</p>
          <div className="text-8xl font-black my-4">
            {submission.score}<span className="text-2xl opacity-60 ml-1">점</span>
          </div>
          <p className="text-lg font-medium opacity-90">
            {percentage >= 80 ? '와! 정말 대단해요! 🎉' : percentage >= 50 ? '잘했어요! 조금만 더 힘내요! 👍' : '다음에 더 잘할 수 있을 거예요! 😊'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <h3 className="font-bold text-slate-500 text-center uppercase tracking-widest text-sm">간단 결과 확인</h3>
          <div className="grid grid-cols-5 gap-3">
            {test.questions.map((q, idx) => {
              const isCorrect = submission.gradedResults[q.id];
              return (
                <div 
                  key={q.id} 
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}
                >
                  <span className="text-[10px] font-bold opacity-50">{idx + 1}</span>
                  <span className="font-black text-lg">{isCorrect ? 'O' : 'X'}</span>
                </div>
              );
            })}
          </div>

          <button 
            onClick={onHome}
            className="w-full bg-slate-900 text-white py-4 rounded-button font-bold hover:bg-slate-800 transition-all shadow-lg mt-4"
          >
            첫 화면으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentResultView;
