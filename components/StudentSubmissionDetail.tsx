
import React from 'react';
import { Test, Submission, QuestionType } from '../types';
import { formatForDisplay, isInequalityExpression } from '../answerNormalizer';

interface Props {
  test: Test;
  submission: Submission;
  onBack: () => void;
}

const StudentSubmissionDetail: React.FC<Props> = ({ test, submission, onBack }) => {
  const correctCount = Object.values(submission.gradedResults).filter(Boolean).length;
  const wrongCount = test.questions.length - correctCount;
  const pct = Math.round((submission.score / submission.totalPossible) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{submission.studentName}</h1>
          <p className="text-slate-400 text-sm">{test.title}</p>
        </div>
      </div>

      {/* 점수 요약 */}
      <div className={`p-6 rounded-card text-white text-center ${pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}>
        <p className="text-5xl font-black">{submission.score}<span className="text-lg opacity-70 ml-1">/ {submission.totalPossible}</span></p>
        <div className="flex justify-center gap-6 mt-3 text-sm opacity-90">
          <span>맞은 문제 {correctCount}개</span>
          <span>틀린 문제 {wrongCount}개</span>
        </div>
      </div>

      {/* 문항별 상세 */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-600 px-1">문항별 결과</h3>
        {test.questions.map((q, idx) => {
          const isCorrect = submission.gradedResults[q.id];
          const rawStudentAnswer = submission.answers[q.id] || '(미응답)';
          const studentAnswer = isInequalityExpression(rawStudentAnswer) ? formatForDisplay(rawStudentAnswer) : rawStudentAnswer;
          const displayCorrect = isInequalityExpression(q.correctAnswer) ? formatForDisplay(q.correctAnswer) : q.correctAnswer;
          const isMultiple = q.type === QuestionType.MULTIPLE_CHOICE;

          return (
            <div
              key={q.id}
              className={`bg-white p-5 rounded-3xl border-2 transition-all ${isCorrect ? 'border-emerald-100' : 'border-rose-100'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {isCorrect ? 'O' : 'X'}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold text-slate-700 mb-2">
                    {idx + 1}번 {isMultiple ? '(객관식)' : '(주관식)'}
                    <span className="text-[10px] text-slate-300 ml-2">{q.points}점</span>
                  </p>

                  {!isCorrect ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-50 px-2 py-0.5 rounded-full">학생 답</span>
                        <span className="text-sm text-rose-600 font-bold font-mono">{studentAnswer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-50 px-2 py-0.5 rounded-full">정답</span>
                        <span className="text-sm text-emerald-600 font-bold font-mono">{displayCorrect}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-50 px-2 py-0.5 rounded-full">정답</span>
                      <span className="text-sm text-emerald-600 font-bold font-mono">{displayCorrect}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentSubmissionDetail;
