
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ViewState, Test, Submission, School, ExamArchive, Question } from './types';
import Header from './components/Header';
import Home from './components/Home';
import TeacherDashboard from './components/TeacherDashboard';
import TestCreator from './components/TestCreator';
import TestDetailView from './components/TestDetailView';
import StudentSubmissionDetail from './components/StudentSubmissionDetail';
import StudentTestView from './components/StudentTestView';
import StudentResultView from './components/StudentResultView';
import ExamArchiveView from './components/ExamArchive';
import SchoolDetail from './components/SchoolDetail';
import { db, isFirebaseConfigured } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, getDocs, where, updateDoc } from 'firebase/firestore';
import { generateDistractors, makeShuffledOptions } from './distractorGenerator';

interface AppProps {
  mode: 'student' | 'admin';
}

const getInitialView = (mode: string, pathname: string): ViewState => {
  if (pathname === '/archive') return 'ARCHIVE';
  if (mode === 'admin') return 'ADMIN_DASHBOARD';
  return 'STUDENT_HOME';
};

const ADMIN_PASSWORD = '5174';

const App: React.FC<AppProps> = ({ mode }) => {
  const location = useLocation();
  const [view, setView] = useState<ViewState>(getInitialView(mode, location.pathname));
  const [tests, setTests] = useState<Test[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [archives, setArchives] = useState<ExamArchive[]>([]);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useLocalMode, setUseLocalMode] = useState(!isFirebaseConfigured);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const LOCAL_TESTS_KEY = 'tt_tests';
  const LOCAL_SUBMISSIONS_KEY = 'tt_submissions';
  const LOCAL_SCHOOLS_KEY = 'tt_schools';
  const LOCAL_ARCHIVES_KEY = 'tt_archives';

  // Firestore 데이터 로드
  useEffect(() => {
    let unsubscribeTests: () => void = () => {};
    let unsubscribeSubmissions: () => void = () => {};
    let unsubscribeSchools: () => void = () => {};
    let unsubscribeArchives: () => void = () => {};

    if (isFirebaseConfigured && db) {
      try {
        const qTests = query(collection(db, 'tests'), orderBy('createdAt', 'desc'));
        unsubscribeTests = onSnapshot(qTests, (snapshot) => {
          const testsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Test));
          setTests(testsData);
          setIsLoading(false);
        }, (error) => {
          console.error("Firestore Test Error:", error);
          switchToLocalMode();
        });

        const qSubmissions = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
        unsubscribeSubmissions = onSnapshot(qSubmissions, (snapshot) => {
          const submissionsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
          setSubmissions(submissionsData);
        }, (error) => {
          console.error("Firestore Submission Error:", error);
        });

        // 학교 데이터 로드 (인덱스 없이)
        unsubscribeSchools = onSnapshot(collection(db, 'schools'), (snapshot) => {
          const schoolsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as School));
          schoolsData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setSchools(schoolsData);
          console.log("Schools loaded:", schoolsData.length);
        }, (error) => {
          console.error("Firestore Schools Error:", error);
        });

        // 아카이브(시험지) 데이터 로드 (인덱스 없이)
        unsubscribeArchives = onSnapshot(collection(db, 'archives'), (snapshot) => {
          const archivesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ExamArchive));
          archivesData.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
          setArchives(archivesData);
          console.log("Archives loaded:", archivesData.length);
        }, (error) => {
          console.error("Firestore Archives Error:", error);
        });
      } catch (e) {
        switchToLocalMode();
      }
    } else {
      switchToLocalMode();
    }

    return () => {
      unsubscribeTests();
      unsubscribeSubmissions();
      unsubscribeSchools();
      unsubscribeArchives();
    };
  }, []);

  const switchToLocalMode = () => {
    setUseLocalMode(true);
    const savedTests = localStorage.getItem(LOCAL_TESTS_KEY);
    const savedSubmissions = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    const savedSchools = localStorage.getItem(LOCAL_SCHOOLS_KEY);
    const savedArchives = localStorage.getItem(LOCAL_ARCHIVES_KEY);
    if (savedTests) setTests(JSON.parse(savedTests));
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
    if (savedSchools) setSchools(JSON.parse(savedSchools));
    if (savedArchives) setArchives(JSON.parse(savedArchives));
    setIsLoading(false);
  };

  const handleCreateTest = async (newTestData: Omit<Test, 'id'>) => {
    if (!useLocalMode && db) {
      try {
        await addDoc(collection(db, 'tests'), { ...newTestData, createdAt: Date.now() });
        setView('ADMIN_DASHBOARD');
        return;
      } catch (error) {
        console.warn("Cloud save failed, saving locally.");
      }
    }
    const newTest = { ...newTestData, id: 'local_' + Date.now(), createdAt: Date.now() } as Test;
    const updatedTests = [newTest, ...tests];
    setTests(updatedTests);
    localStorage.setItem(LOCAL_TESTS_KEY, JSON.stringify(updatedTests));
    setView('ADMIN_DASHBOARD');
  };

  const handleDeleteTest = async (testId: string) => {
    if (!useLocalMode && db) {
      try {
        await deleteDoc(doc(db, 'tests', testId));
        // 관련 제출물도 삭제
        const subQuery = query(collection(db, 'submissions'), where('testId', '==', testId));
        const subSnapshot = await getDocs(subQuery);
        for (const subDoc of subSnapshot.docs) {
          await deleteDoc(doc(db, 'submissions', subDoc.id));
        }
        setView('ADMIN_DASHBOARD');
        return;
      } catch (error) {
        console.warn("Cloud delete failed, deleting locally.");
      }
    }
    const updatedTests = tests.filter(t => t.id !== testId);
    const updatedSubmissions = submissions.filter(s => s.testId !== testId);
    setTests(updatedTests);
    setSubmissions(updatedSubmissions);
    localStorage.setItem(LOCAL_TESTS_KEY, JSON.stringify(updatedTests));
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(updatedSubmissions));
    setView('ADMIN_DASHBOARD');
  };

  const handleSelectTest = (test: Test) => {
    setActiveTest(test);
    setView('ADMIN_TEST_DETAIL');
  };

  const handleSelectStudent = (submission: Submission) => {
    setActiveSubmission(submission);
    setView('ADMIN_STUDENT_DETAIL');
  };

  const handleStartTest = (test: Test) => {
    setActiveTest(test);
    setView('STUDENT_TEST');
  };

  const handleSubmitTest = async (submissionData: Omit<Submission, 'id'>) => {
    if (!useLocalMode && db) {
      try {
        const docRef = await addDoc(collection(db, 'submissions'), { ...submissionData, submittedAt: Date.now() });
        const completeSubmission = { id: docRef.id, ...submissionData, submittedAt: Date.now() } as Submission;
        setLastSubmission(completeSubmission);
        setView('STUDENT_RESULT');
        return;
      } catch (error) {
        console.warn("Cloud submit failed, saving locally.");
      }
    }
    const newSubmission = { ...submissionData, id: 'local_sub_' + Date.now(), submittedAt: Date.now() } as Submission;
    const updatedSubmissions = [newSubmission, ...submissions];
    setSubmissions(updatedSubmissions);
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(updatedSubmissions));
    setLastSubmission(newSubmission);
    setView('STUDENT_RESULT');
  };

  // 학교 관련 핸들러
  const handleAddSchool = async (schoolData: Omit<School, 'id' | 'createdAt'>) => {
    // undefined 값 제거 (Firebase에서 허용 안함)
    const cleanData: any = { name: schoolData.name, createdAt: Date.now() };
    if (schoolData.region) cleanData.region = schoolData.region;

    if (!useLocalMode && db) {
      try {
        const docRef = await addDoc(collection(db, 'schools'), cleanData);
        console.log("School saved to Firebase:", docRef.id);
        return;
      } catch (error) {
        console.error("Cloud save failed:", error);
      }
    }

    // 로컬 저장
    const newSchool = { ...cleanData, id: 'local_school_' + Date.now() } as School;
    const updatedSchools = [newSchool, ...schools];
    setSchools(updatedSchools);
    localStorage.setItem(LOCAL_SCHOOLS_KEY, JSON.stringify(updatedSchools));
    console.log("School saved locally");
  };

  const handleSelectSchool = (school: School) => {
    setActiveSchool(school);
    setView('ARCHIVE_SCHOOL');
  };

  // 시험지 아카이브 핸들러
  const handleUploadExam = async (examData: Omit<ExamArchive, 'id' | 'uploadedAt' | 'downloadCount'>) => {
    // undefined 값 제거 (Firebase에서 허용 안함)
    const archiveData: any = {
      schoolId: examData.schoolId,
      schoolName: examData.schoolName,
      title: examData.title,
      subject: examData.subject,
      grade: examData.grade,
      year: examData.year,
      semester: examData.semester,
      examType: examData.examType,
      uploadedAt: Date.now(),
      downloadCount: 0
    };
    if (examData.pdfUrl) archiveData.pdfUrl = examData.pdfUrl;
    if (examData.pdfData) archiveData.pdfData = examData.pdfData;
    if (examData.fileName) archiveData.fileName = examData.fileName;
    if (examData.fileSize) archiveData.fileSize = examData.fileSize;
    if (examData.testId) archiveData.testId = examData.testId;

    if (!useLocalMode && db) {
      try {
        // PDF 데이터 크기 체크 (Firebase 문서 크기 제한 ~1MB)
        const dataSize = JSON.stringify(archiveData).length;
        if (dataSize > 900000) {
          console.warn("PDF too large for Firebase, saving locally only");
          alert("PDF 파일이 너무 커서 로컬에만 저장됩니다. (900KB 초과)");
        } else {
          const docRef = await addDoc(collection(db, 'archives'), archiveData);
          console.log("Archive saved to Firebase:", docRef.id);
          return;
        }
      } catch (error) {
        console.error("Cloud save failed:", error);
        alert("클라우드 저장 실패. 로컬에 저장합니다.");
      }
    }

    // 로컬 저장
    const newArchive = { ...archiveData, id: 'local_archive_' + Date.now() } as ExamArchive;
    const updatedArchives = [newArchive, ...archives];
    setArchives(updatedArchives);
    localStorage.setItem(LOCAL_ARCHIVES_KEY, JSON.stringify(updatedArchives));
    console.log("Archive saved locally");
  };

  const handleDownloadExam = async (archive: ExamArchive) => {
    const updatedArchives = archives.map(a =>
      a.id === archive.id ? { ...a, downloadCount: a.downloadCount + 1 } : a
    );
    setArchives(updatedArchives);
    if (useLocalMode) {
      localStorage.setItem(LOCAL_ARCHIVES_KEY, JSON.stringify(updatedArchives));
    } else if (db) {
      try {
        await updateDoc(doc(db, 'archives', archive.id), { downloadCount: archive.downloadCount + 1 });
      } catch (error) {
        console.warn("Cloud update failed");
      }
    }
  };

  const handleDeleteArchive = async (archiveId: string) => {
    if (!useLocalMode && db) {
      try {
        await deleteDoc(doc(db, 'archives', archiveId));
        return;
      } catch (error) {
        console.warn("Cloud delete failed, deleting locally.");
      }
    }
    const updatedArchives = archives.filter(a => a.id !== archiveId);
    setArchives(updatedArchives);
    localStorage.setItem(LOCAL_ARCHIVES_KEY, JSON.stringify(updatedArchives));
  };

  const handleLinkTest = async (archiveId: string, testId: string) => {
    const updatedArchives = archives.map(a =>
      a.id === archiveId ? { ...a, testId } : a
    );
    setArchives(updatedArchives);
    if (useLocalMode) {
      localStorage.setItem(LOCAL_ARCHIVES_KEY, JSON.stringify(updatedArchives));
    } else if (db) {
      try {
        await updateDoc(doc(db, 'archives', archiveId), { testId });
      } catch (error) {
        console.warn("Cloud update failed");
      }
    }
  };

  // 답안 입력으로 Test 생성 및 Archive에 연결
  const handleCreateAnswers = async (archiveId: string, title: string, answers: string[]) => {
    const questions: Question[] = answers.map((answer, idx) => {
      const isSubjective = answer.startsWith('b:');
      const correctAnswer = isSubjective ? answer.slice(2) : answer;

      if (isSubjective) {
        // 주관식 -> 객관식 변환
        const distractors = generateDistractors(correctAnswer);
        const options = makeShuffledOptions(correctAnswer, distractors);
        return {
          id: Math.random().toString(36).substr(2, 9),
          text: `${idx + 1}번`,
          type: 'MULTIPLE_CHOICE' as const,
          points: 10,
          correctAnswer,
          options
        };
      } else {
        // 표준 객관식
        return {
          id: Math.random().toString(36).substr(2, 9),
          text: `${idx + 1}번`,
          type: 'MULTIPLE_CHOICE' as const,
          points: 10,
          correctAnswer,
          options: ['1', '2', '3', '4', '5']
        };
      }
    });

    const newTestData = {
      title: title + ' 정답',
      description: '',
      questions,
      createdAt: Date.now()
    };

    let newTestId = '';

    if (!useLocalMode && db) {
      try {
        const docRef = await addDoc(collection(db, 'tests'), newTestData);
        newTestId = docRef.id;
        // Archive에 testId 연결
        await updateDoc(doc(db, 'archives', archiveId), { testId: newTestId });
        return;
      } catch (error) {
        console.warn("Cloud save failed, saving locally.");
      }
    }

    // 로컬 저장
    newTestId = 'local_' + Date.now();
    const newTest = { ...newTestData, id: newTestId } as Test;
    const updatedTests = [newTest, ...tests];
    setTests(updatedTests);
    localStorage.setItem(LOCAL_TESTS_KEY, JSON.stringify(updatedTests));

    // Archive에 testId 연결
    const updatedArchives = archives.map(a =>
      a.id === archiveId ? { ...a, testId: newTestId } : a
    );
    setArchives(updatedArchives);
    localStorage.setItem(LOCAL_ARCHIVES_KEY, JSON.stringify(updatedArchives));
  };

  const handleAdminLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setPasswordInput('');
    } else {
      alert('비밀번호가 틀렸습니다.');
      setPasswordInput('');
    }
  };

  const renderAdminLogin = () => (
    <div className="max-w-sm mx-auto mt-20">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">관리자 인증</h2>
        <p className="text-slate-400 text-sm mb-6">비밀번호를 입력하세요</p>
        <div className="space-y-4">
          <input
            type="password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            placeholder="비밀번호"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={handleAdminLogin}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            확인
          </button>
          <button
            onClick={() => setView('STUDENT_HOME')}
            className="text-slate-400 text-sm hover:text-slate-600"
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    if (isLoading && view === 'STUDENT_HOME') {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-slate-400">불러오는 중...</p>
        </div>
      );
    }

    // 관리자 뷰인데 인증 안됐으면 로그인 화면
    if (view.startsWith('ADMIN_') && !isAdminAuthenticated) {
      return renderAdminLogin();
    }

    switch (view) {
      case 'STUDENT_HOME': return <Home tests={tests} onStartTest={handleStartTest} />;
      case 'STUDENT_TEST': return activeTest ? <StudentTestView test={activeTest} onSubmit={handleSubmitTest} onCancel={() => setView('STUDENT_HOME')} /> : null;
      case 'STUDENT_RESULT': return lastSubmission ? <StudentResultView submission={lastSubmission} test={activeTest!} onHome={() => setView('STUDENT_HOME')} /> : null;
      case 'ADMIN_DASHBOARD': return <TeacherDashboard tests={tests} submissions={submissions} onCreateNew={() => setView('ADMIN_CREATE')} onSelectTest={handleSelectTest} onDeleteTest={handleDeleteTest} />;
      case 'ADMIN_CREATE': return <TestCreator onSave={handleCreateTest} onCancel={() => setView('ADMIN_DASHBOARD')} />;
      case 'ADMIN_TEST_DETAIL': return activeTest ? <TestDetailView test={activeTest} submissions={submissions} onBack={() => setView('ADMIN_DASHBOARD')} onSelectStudent={handleSelectStudent} onDeleteTest={handleDeleteTest} /> : null;
      case 'ADMIN_STUDENT_DETAIL': return activeTest && activeSubmission ? <StudentSubmissionDetail test={activeTest} submission={activeSubmission} onBack={() => setView('ADMIN_TEST_DETAIL')} /> : null;
      case 'ARCHIVE': return <ExamArchiveView schools={schools} archives={archives} onSelectSchool={handleSelectSchool} onAddSchool={handleAddSchool} onUploadExam={handleUploadExam} />;
      case 'ARCHIVE_SCHOOL': return activeSchool ? <SchoolDetail school={activeSchool} archives={archives} tests={tests} isAdmin={isAdminAuthenticated} onBack={() => setView('ARCHIVE')} onDownload={handleDownloadExam} onDelete={handleDeleteArchive} onLinkTest={handleLinkTest} onStartTest={handleStartTest} onCreateAnswers={handleCreateAnswers} /> : null;
      default: return <Home tests={tests} onStartTest={handleStartTest} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-100">
      <Header view={view} setView={setView} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderView()}
      </main>
      <footer className="py-8 text-center text-slate-400 text-xs">
        시험지 아카이브 & 채점 서비스
      </footer>
    </div>
  );
};

export default App;
