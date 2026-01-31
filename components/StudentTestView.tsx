
import React, { useState } from 'react';
import { Test, QuestionType, Submission } from '../types';
import { gradeShortAnswer } from '../geminiService';

interface Props {
  test: Test;
  onSubmit: (submission: Omit<Submission, 'id'>) => void;
  onCancel: () => void;
}

const StudentTestView: React.FC<Props> = ({ test, onSubmit, onCancel }) => {
  const [studentName, setStudentName] = useState('');
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = () => {
    if (!studentName.trim()) { alert('이름을 먼저 알려주세요!'); return; }
    setStarted(true);
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleSubmit = async () => {
    // 모든 문제에 답을 했는지 체크
    if (Object.keys(answers).length < test.questions.length) {
      if (!confirm('아직 안 푼 문제가 있어요! 그래도 제출할까요?')) return;
    }

    setIsSubmitting(true);
    let totalScore = 0;
    const gradedResults: Record<string, boolean> = {};

    try {
      for (const q of test.questions) {
        const studentAnswer = (answers[q.id] || '').trim();
        if (q.type === QuestionType.MULTIPLE_CHOICE) {
          const isCorrect = studentAnswer === q.correctAnswer;
          gradedResults[q.id] = isCorrect;
          if (isCorrect) totalScore += q.points;
        } else {
          // 주관식 AI 채점
          const { isCorrect } = await gradeShortAnswer(q.text, q.correctAnswer, studentAnswer);
          gradedResults[q.id] = isCorrect;
          if (isCorrect) totalScore += q.points;
        }
      }
      const totalPossible = test.questions.reduce((acc, q) => acc + q.points, 0);
      await onSubmit({ testId: test.id, studentName, answers, score: totalScore, totalPossible, gradedResults, submittedAt: Date.now() });
    } catch (e) {
      alert("전송 중에 잠시 문제가 생겼어요. 다시 한 번 눌러주세요!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!started) {
    return (
      <div className="max-w-md mx-auto bg-white p-10 rounded-card shadow-2xl shadow-amber-100/20 border border-slate-50 mt-10 text-center">
        <div className="w-16 h-16 bg-amber-400 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-2xl">✍️</div>
        <h2 className="text-xl font-black mb-1">답안지를 준비할게요</h2>
        <p className="text-slate-400 text-sm mb-8">{test.title}</p>
        <div className="space-y-3">
          <input 
            type="text" 
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-amber-400 outline-none text-center font-bold text-lg transition-all"
          />
          <button 
            onClick={handleStart}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            답 적기 시작!
          </button>
          <button onClick={onCancel} className="text-slate-300 text-xs py-2">뒤로가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-40">
      <div className="flex flex-col items-center mb-10 sticky top-16 bg-amber-50 py-4 z-10">
        <span className="text-[10px] text-amber-600 font-bold bg-amber-100 px-3 py-1 rounded-full mb-1">모바일 답안지</span>
        <h2 className="text-xl font-black text-slate-800">{test.title}</h2>
        <p className="text-slate-400 text-xs mt-1">{studentName} 학생, 시험지에 집중하세요!</p>
      </div>

      <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
        {test.questions.map((q, idx) => (
          <div key={q.id} className={`p-5 flex items-center gap-4 ${idx !== test.questions.length - 1 ? 'border-b border-slate-50' : ''}`}>
            <span className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {idx + 1}
            </span>
            <div className="flex-grow">
              {q.type === QuestionType.MULTIPLE_CHOICE ? (
                <div className="flex justify-between max-w-[240px]">
                  {['1','2','3','4','5'].map(num => (
                    <button 
                      key={num}
                      onClick={() => handleAnswerChange(q.id, num)}
                      className={`w-9 h-9 rounded-full font-bold transition-all border-2 ${answers[q.id] === num ? 'bg-amber-400 border-amber-400 text-white shadow-lg scale-110' : 'bg-white border-slate-100 text-slate-300'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              ) : (
                <input 
                  type="text" 
                  value={answers[q.id] || ''}
                  onChange={e => handleAnswerChange(q.id, e.target.value)}
                  placeholder="주관식 답 입력"
                  className="w-full p-2 text-sm bg-slate-50 rounded-lg outline-none border border-transparent focus:border-amber-200"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-amber-50 via-amber-50/90 to-transparent pt-10">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 ${isSubmitting ? 'bg-slate-200 text-slate-400 cursor-wait' : 'bg-amber-400 text-white shadow-amber-200'}`}
        >
          {isSubmitting ? '채점 중... ✍️' : '다 풀었습니다! 제출!'}
        </button>
      </div>
    </div>
  );
};

export default StudentTestView;
