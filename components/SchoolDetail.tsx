import React, { useState, useMemo } from 'react';
import { School, ExamArchive, Test, Question, QuestionType } from '../types';
import { generateDistractors, makeShuffledOptions } from '../distractorGenerator';

interface Props {
  school: School;
  archives: ExamArchive[];
  tests: Test[];
  isAdmin: boolean;
  onBack: () => void;
  onDownload: (archive: ExamArchive) => void;
  onDelete: (archiveId: string) => void;
  onLinkTest: (archiveId: string, testId: string) => void;
  onStartTest: (test: Test) => void;
  onCreateAnswers: (archiveId: string, title: string, answers: string[]) => void;
}

const SchoolDetail: React.FC<Props> = ({
  school,
  archives,
  tests,
  isAdmin,
  onBack,
  onDownload,
  onDelete,
  onLinkTest,
  onStartTest,
  onCreateAnswers
}) => {
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [answerInputArchiveId, setAnswerInputArchiveId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  // 이 학교의 시험지만 필터
  const schoolArchives = useMemo(() => {
    return archives.filter(a => a.schoolId === school.id);
  }, [archives, school.id]);

  // 필터 옵션 추출
  const years = useMemo(() => {
    const uniqueYears = [...new Set(schoolArchives.map(a => a.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [schoolArchives]);

  const grades = useMemo(() => {
    return [...new Set(schoolArchives.map(a => a.grade))];
  }, [schoolArchives]);

  const subjects = useMemo(() => {
    return [...new Set(schoolArchives.map(a => a.subject))];
  }, [schoolArchives]);

  // 필터링된 시험지
  const filteredArchives = useMemo(() => {
    return schoolArchives.filter(a => {
      if (filterYear !== 'all' && a.year !== filterYear) return false;
      if (filterGrade !== 'all' && a.grade !== filterGrade) return false;
      if (filterSubject !== 'all' && a.subject !== filterSubject) return false;
      return true;
    });
  }, [schoolArchives, filterYear, filterGrade, filterSubject]);

  const handleDownload = (archive: ExamArchive) => {
    if (archive.pdfData) {
      const link = document.createElement('a');
      link.href = archive.pdfData;
      link.download = archive.fileName || `${archive.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onDownload(archive);
    } else if (archive.pdfUrl) {
      window.open(archive.pdfUrl, '_blank');
      onDownload(archive);
    }
  };

  const handleSubmitAnswers = (archive: ExamArchive) => {
    const lines = answerText.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      alert('답안을 입력해주세요');
      return;
    }

    const answers: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      // 숫자만 (1-5)
      if (/^[1-5]$/.test(trimmed)) {
        answers.push(trimmed);
        continue;
      }
      // "a 3" 형식
      const mcMatch = trimmed.match(/^[aA]\s+([1-5])$/);
      if (mcMatch) {
        answers.push(mcMatch[1]);
        continue;
      }
      // "b 답" 형식 (주관식)
      const saMatch = trimmed.match(/^[bB]\s+(.+)$/);
      if (saMatch) {
        answers.push('b:' + saMatch[1].trim());
        continue;
      }
      // 그냥 텍스트면 주관식으로 처리
      if (trimmed) {
        answers.push('b:' + trimmed);
      }
    }

    if (answers.length === 0) {
      alert('유효한 답안이 없습니다');
      return;
    }

    onCreateAnswers(archive.id, archive.title, answers);
    setAnswerText('');
    setAnswerInputArchiveId(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{school.name}</h1>
          {school.region && <p className="text-slate-500">{school.region}</p>}
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-slate-800">{schoolArchives.length}</div>
          <div className="text-sm text-slate-500">총 시험지</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-blue-600">
            {schoolArchives.reduce((sum, a) => sum + a.downloadCount, 0)}
          </div>
          <div className="text-sm text-slate-500">다운로드</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-emerald-600">
            {schoolArchives.filter(a => a.testId).length}
          </div>
          <div className="text-sm text-slate-500">답안 등록</div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterYear === 'all' ? 'all' : filterYear}
          onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 연도</option>
          {years.map(y => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 학년</option>
          {grades.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 과목</option>
          {subjects.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* 시험지 목록 */}
      <div className="space-y-3">
        {filteredArchives.map(archive => {
          const linkedTest = archive.testId ? tests.find(t => t.id === archive.testId) : null;

          return (
            <div
              key={archive.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* PDF 아이콘 */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6"/>
                    </svg>
                  </div>
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{archive.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                      {archive.year}년
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                      {archive.semester}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                      {archive.grade}
                    </span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg">
                      {archive.subject}
                    </span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-lg">
                      {archive.examType}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    {archive.fileSize && <span>{formatFileSize(archive.fileSize)}</span>}
                    <span>업로드: {formatDate(archive.uploadedAt)}</span>
                    <span>다운로드: {archive.downloadCount}회</span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2">
                  {linkedTest ? (
                    <button
                      onClick={() => onStartTest(linkedTest)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-400 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      채점하기
                    </button>
                  ) : (
                    <button
                      onClick={() => setAnswerInputArchiveId(answerInputArchiveId === archive.id ? null : archive.id)}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-400 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      답안 입력
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(archive)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    다운로드
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm('이 시험지를 삭제하시겠습니까?')) {
                          onDelete(archive.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* 답안 입력 폼 */}
              {answerInputArchiveId === archive.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-slate-700 mb-2">답안 입력</p>
                    <div className="text-xs text-slate-500 mb-3 space-y-1">
                      <p>한 줄에 하나씩 입력하세요:</p>
                      <p className="font-mono bg-white px-2 py-1 rounded inline-block">3</p> 객관식 3번
                      <br/>
                      <p className="font-mono bg-white px-2 py-1 rounded inline-block">b 128</p> 주관식 정답
                    </div>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder={"3\n2\n4\nb 128\n1\n5"}
                      className="w-full h-40 p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleSubmitAnswers(archive)}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => { setAnswerInputArchiveId(null); setAnswerText(''); }}
                        className="flex-1 py-2.5 bg-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredArchives.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500">시험지가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDetail;
