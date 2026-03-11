
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

export type ViewState = 'STUDENT_HOME' | 'STUDENT_TEST' | 'STUDENT_RESULT' | 'ADMIN_DASHBOARD' | 'ADMIN_CREATE' | 'ADMIN_TEST_DETAIL' | 'ADMIN_STUDENT_DETAIL' | 'ARCHIVE' | 'ARCHIVE_SCHOOL';

// 학교 정보
export interface School {
  id: string;
  name: string;
  region?: string; // 지역 (선택)
  createdAt: number;
}

// 시험지 아카이브
export interface ExamArchive {
  id: string;
  schoolId: string;
  schoolName: string;
  title: string;           // 시험 제목 (예: "2024학년도 1학기 중간고사")
  subject: string;         // 과목 (예: "수학", "수학I", "확률과 통계")
  grade: string;           // 학년 (예: "고1", "고2", "고3")
  year: number;            // 시험 연도
  semester: string;        // 학기 (예: "1학기", "2학기")
  examType: string;        // 시험 유형 (예: "중간고사", "기말고사", "모의고사")
  pdfUrl?: string;         // PDF 파일 URL (Firebase Storage 또는 Base64)
  pdfData?: string;        // PDF Base64 데이터 (로컬 저장용)
  fileName?: string;       // 원본 파일명
  fileSize?: number;       // 파일 크기 (bytes)
  uploadedAt: number;
  downloadCount: number;
  testId?: string;         // 연결된 Test ID (채점 연동용)
}
