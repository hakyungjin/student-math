// 간단한 기본 채점 함수
export const gradeShortAnswer = async (question: string, correctAnswer: string, studentAnswer: string): Promise<{ isCorrect: boolean; feedback: string }> => {
  // 정확한 답 또는 자음/모음 등을 무시한 비교
  const isCorrect = studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  return { 
    isCorrect, 
    feedback: isCorrect ? "정답입니다." : "오답입니다." 
  };
};
