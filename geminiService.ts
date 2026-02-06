import { compareAnswers } from './answerNormalizer';

// 간단한 기본 채점 함수
export const gradeShortAnswer = async (question: string, correctAnswer: string, studentAnswer: string): Promise<{ isCorrect: boolean; feedback: string }> => {
  // 부등식·수학 표현식도 정규화하여 비교
  const isCorrect = compareAnswers(studentAnswer, correctAnswer);
  return {
    isCorrect,
    feedback: isCorrect ? "정답입니다." : "오답입니다."
  };
};
