
import React, { useState, useEffect } from 'react';
import { ViewState, Test, Submission } from './types';
import Header from './components/Header';
import Home from './components/Home';
import TeacherDashboard from './components/TeacherDashboard';
import TestCreator from './components/TestCreator';
import TestDetailView from './components/TestDetailView';
import StudentSubmissionDetail from './components/StudentSubmissionDetail';
import StudentTestView from './components/StudentTestView';
import StudentResultView from './components/StudentResultView';
import { db, isFirebaseConfigured } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, getDocs, where } from 'firebase/firestore';

interface AppProps {
  mode: 'student' | 'admin';
}

const App: React.FC<AppProps> = ({ mode }) => {
  const [view, setView] = useState<ViewState>(mode === 'admin' ? 'ADMIN_DASHBOARD' : 'STUDENT_HOME');
  const [tests, setTests] = useState<Test[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useLocalMode, setUseLocalMode] = useState(!isFirebaseConfigured);

  const LOCAL_TESTS_KEY = 'tt_tests';
  const LOCAL_SUBMISSIONS_KEY = 'tt_submissions';

  // Firestore 데이터 로드
  useEffect(() => {
    let unsubscribeTests: () => void = () => {};
    let unsubscribeSubmissions: () => void = () => {};

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
      } catch (e) {
        switchToLocalMode();
      }
    } else {
      switchToLocalMode();
    }

    return () => {
      unsubscribeTests();
      unsubscribeSubmissions();
    };
  }, []);

  const switchToLocalMode = () => {
    setUseLocalMode(true);
    const savedTests = localStorage.getItem(LOCAL_TESTS_KEY);
    const savedSubmissions = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    if (savedTests) setTests(JSON.parse(savedTests));
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
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

  const renderView = () => {
    if (isLoading && view === 'STUDENT_HOME') {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-200 border-t-amber-500 mb-4"></div>
          <p className="text-slate-400">정답지를 가져오는 중...</p>
        </div>
      );
    }
    switch (view) {
      case 'STUDENT_HOME': return <Home tests={tests} onStartTest={handleStartTest} />;
      case 'STUDENT_TEST': return activeTest ? <StudentTestView test={activeTest} onSubmit={handleSubmitTest} onCancel={() => setView('STUDENT_HOME')} /> : null;
      case 'STUDENT_RESULT': return lastSubmission ? <StudentResultView submission={lastSubmission} test={activeTest!} onHome={() => setView('STUDENT_HOME')} /> : null;
      case 'ADMIN_DASHBOARD': return <TeacherDashboard tests={tests} submissions={submissions} onCreateNew={() => setView('ADMIN_CREATE')} onSelectTest={handleSelectTest} onDeleteTest={handleDeleteTest} />;
      case 'ADMIN_CREATE': return <TestCreator onSave={handleCreateTest} onCancel={() => setView('ADMIN_DASHBOARD')} />;
      case 'ADMIN_TEST_DETAIL': return activeTest ? <TestDetailView test={activeTest} submissions={submissions} onBack={() => setView('ADMIN_DASHBOARD')} onSelectStudent={handleSelectStudent} onDeleteTest={handleDeleteTest} /> : null;
      case 'ADMIN_STUDENT_DETAIL': return activeTest && activeSubmission ? <StudentSubmissionDetail test={activeTest} submission={activeSubmission} onBack={() => setView('ADMIN_TEST_DETAIL')} /> : null;
      default: return <Home tests={tests} onStartTest={handleStartTest} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-200">
      <Header view={view} setView={setView} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderView()}
      </main>
      <footer className="py-8 text-center text-slate-300 text-[10px] tracking-tight">
        똑똑 채점기 | © 2024 우리 반 전용 디지털 답안지
      </footer>
    </div>
  );
};

export default App;
