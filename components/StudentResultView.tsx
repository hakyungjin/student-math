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
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {/* 점수 헤더 */}
        <div className={`p-10 text-center text-white ${percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}>
          <p className="text-lg font-medium opacity-90 mb-2">{submission.studentName}</p>
          <div className="text-7xl font-bold my-4">
            {submission.score}<span className="text-2xl opacity-70 ml-1">/{submission.totalPossible}</span>
          </div>
          <p className="text-base font-medium opacity-90">
            {percentage >= 80 ? '훌륭합니다!' : percentage >= 50 ? '좋은 결과입니다' : '다음에 더 잘할 수 있어요'}
          </p>
        </div>

        {/* 결과 상세 */}
        <div className="p-6 space-y-6">
          <h3 className="font-medium text-slate-500 text-center text-sm">문제별 결과</h3>
          <div className="grid grid-cols-5 gap-2">
            {test.questions.map((q, idx) => {
              const isCorrect = submission.gradedResults[q.id];
              return (
                <div
                  key={q.id}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}
                >
                  <span className="text-[10px] font-medium opacity-60">{idx + 1}</span>
                  <span className="font-bold text-lg">{isCorrect ? 'O' : 'X'}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={onHome}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentResultView;
