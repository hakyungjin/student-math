import React, { useState, useMemo } from 'react';
import { School, ExamArchive } from '../types';

interface Props {
  schools: School[];
  archives: ExamArchive[];
  onSelectSchool: (school: School) => void;
  onAddSchool: (school: Omit<School, 'id' | 'createdAt'>) => void;
  onUploadExam: (exam: Omit<ExamArchive, 'id' | 'uploadedAt' | 'downloadCount'>) => void;
}

const ExamArchiveView: React.FC<Props> = ({
  schools,
  archives,
  onSelectSchool,
  onAddSchool,
  onUploadExam
}) => {
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showUploadExam, setShowUploadExam] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolRegion, setNewSchoolRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 업로드 폼 상태
  const [uploadForm, setUploadForm] = useState({
    schoolId: '',
    title: '',
    subject: '수학',
    grade: '고1',
    year: new Date().getFullYear(),
    semester: '1학기',
    examType: '중간고사',
    pdfData: '',
    fileName: '',
    fileSize: 0
  });

  // 학교별 시험지 수 계산
  const schoolStats = useMemo(() => {
    const stats: Record<string, number> = {};
    archives.forEach(a => {
      stats[a.schoolId] = (stats[a.schoolId] || 0) + 1;
    });
    return stats;
  }, [archives]);

  // 검색 필터링
  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools;
    const query = searchQuery.toLowerCase();
    return schools.filter(s =>
      s.name.toLowerCase().includes(query) ||
      (s.region && s.region.toLowerCase().includes(query))
    );
  }, [schools, searchQuery]);

  const handleAddSchool = () => {
    if (!newSchoolName.trim()) return;
    onAddSchool({
      name: newSchoolName.trim(),
      region: newSchoolRegion.trim() || undefined
    });
    setNewSchoolName('');
    setNewSchoolRegion('');
    setShowAddSchool(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('PDF 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadForm(prev => ({
        ...prev,
        pdfData: reader.result as string,
        fileName: file.name,
        fileSize: file.size
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadExam = () => {
    if (!uploadForm.schoolId || !uploadForm.title || !uploadForm.pdfData) {
      alert('학교, 시험 제목, PDF 파일을 모두 입력해주세요.');
      return;
    }

    const school = schools.find(s => s.id === uploadForm.schoolId);
    if (!school) return;

    onUploadExam({
      schoolId: uploadForm.schoolId,
      schoolName: school.name,
      title: uploadForm.title,
      subject: uploadForm.subject,
      grade: uploadForm.grade,
      year: uploadForm.year,
      semester: uploadForm.semester,
      examType: uploadForm.examType,
      pdfData: uploadForm.pdfData,
      fileName: uploadForm.fileName,
      fileSize: uploadForm.fileSize
    });

    setUploadForm({
      schoolId: '',
      title: '',
      subject: '수학',
      grade: '고1',
      year: new Date().getFullYear(),
      semester: '1학기',
      examType: '중간고사',
      pdfData: '',
      fileName: '',
      fileSize: 0
    });
    setShowUploadExam(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
          시험지 아카이브
        </h1>
        <p className="text-slate-500">학교별 기출문제를 관리하고 PDF를 업로드/다운로드하세요</p>
      </div>

      {/* 검색 및 액션 바 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="학교명 또는 지역으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddSchool(true)}
            className="px-4 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            학교 추가
          </button>
          <button
            onClick={() => setShowUploadExam(true)}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            시험지 업로드
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-3xl font-bold text-slate-800">{schools.length}</div>
          <div className="text-sm text-slate-500">등록된 학교</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-3xl font-bold text-blue-600">{archives.length}</div>
          <div className="text-sm text-slate-500">총 시험지</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-3xl font-bold text-emerald-600">
            {archives.reduce((sum, a) => sum + a.downloadCount, 0)}
          </div>
          <div className="text-sm text-slate-500">총 다운로드</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="text-3xl font-bold text-purple-600">
            {new Set(archives.map(a => a.year)).size}
          </div>
          <div className="text-sm text-slate-500">수록 연도</div>
        </div>
      </div>

      {/* 학교 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchools.map(school => (
          <div
            key={school.id}
            onClick={() => onSelectSchool(school)}
            className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                {school.name.charAt(0)}
              </div>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{school.name}</h3>
            {school.region && (
              <p className="text-sm text-slate-400 mb-3">{school.region}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-blue-600 font-medium">
                {schoolStats[school.id] || 0}개 시험지
              </span>
            </div>
          </div>
        ))}

        {filteredSchools.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-slate-500 mb-4">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 학교가 없습니다'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddSchool(true)}
                className="text-blue-600 font-medium hover:underline"
              >
                첫 번째 학교 추가하기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 학교 추가 모달 */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-6">새 학교 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">학교명 *</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="예: 서울고등학교"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">지역 (선택)</label>
                <input
                  type="text"
                  value={newSchoolRegion}
                  onChange={(e) => setNewSchoolRegion(e.target.value)}
                  placeholder="예: 서울시 강남구"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddSchool(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddSchool}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 시험지 업로드 모달 */}
      {showUploadExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">시험지 업로드</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">학교 *</label>
                <select
                  value={uploadForm.schoolId}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, schoolId: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">학교 선택</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">연도</label>
                  <input
                    type="number"
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">학기</label>
                  <select
                    value={uploadForm.semester}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1학기">1학기</option>
                    <option value="2학기">2학기</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">학년</label>
                  <select
                    value={uploadForm.grade}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="고1">고1</option>
                    <option value="고2">고2</option>
                    <option value="고3">고3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">시험 유형</label>
                  <select
                    value={uploadForm.examType}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, examType: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="중간고사">중간고사</option>
                    <option value="기말고사">기말고사</option>
                    <option value="모의고사">모의고사</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">과목</label>
                <select
                  value={uploadForm.subject}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="수학">수학</option>
                  <option value="수학I">수학I</option>
                  <option value="수학II">수학II</option>
                  <option value="미적분">미적분</option>
                  <option value="확률과 통계">확률과 통계</option>
                  <option value="기하">기하</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">시험 제목 *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="예: 2024학년도 1학기 중간고사"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PDF 파일 *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  {uploadForm.fileName ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                        <path d="M14 2v6h6M9 13h6M9 17h6"/>
                      </svg>
                      <div className="text-left">
                        <p className="font-medium text-slate-800">{uploadForm.fileName}</p>
                        <p className="text-sm text-slate-500">
                          {(uploadForm.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setUploadForm(prev => ({ ...prev, pdfData: '', fileName: '', fileSize: 0 }))}
                        className="ml-2 text-slate-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-slate-500 mb-1">클릭하여 PDF 업로드</p>
                      <p className="text-sm text-slate-400">최대 10MB</p>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadExam(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUploadExam}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
              >
                업로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamArchiveView;
