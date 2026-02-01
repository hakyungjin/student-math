
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // MULTIPLE_CHOICE 전용
  correctAnswer: string;
  points: number;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
}

export interface Submission {
  id: string;
  testId: string;
  studentName: string;
  answers: Record<string, string>; // questionId -> studentAnswer
  score: number;
  totalPossible: number;
  submittedAt: number;
  gradedResults: Record<string, boolean>; // questionId -> isCorrect
}

export type ViewState = 'STUDENT_HOME' | 'STUDENT_TEST' | 'STUDENT_RESULT' | 'ADMIN_DASHBOARD' | 'ADMIN_CREATE' | 'ADMIN_TEST_DETAIL' | 'ADMIN_STUDENT_DETAIL';
