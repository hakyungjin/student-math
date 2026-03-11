import React, { useState } from 'react';
import { ViewState } from '../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  view: ViewState;
  setView: (view: ViewState) => void;
}

const Header: React.FC<Props> = ({ view, setView }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminView = view.startsWith('ADMIN_');
  const isArchiveView = view.startsWith('ARCHIVE');

  const goToHome = () => {
    if (isAdminView) {
      navigate('/admin');
      setView('ADMIN_DASHBOARD');
    } else {
      navigate('/');
      setView('STUDENT_HOME');
    }
    setMobileMenuOpen(false);
  };

  const goToArchive = () => {
    navigate('/archive');
    setView('ARCHIVE');
    setMobileMenuOpen(false);
  };

  const switchMode = () => {
    if (isAdminView) {
      navigate('/');
      setView('STUDENT_HOME');
    } else {
      navigate('/admin');
      setView('ADMIN_DASHBOARD');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={goToHome}
        >
          <div className="bg-slate-900 text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm">
            M
          </div>
          <span className="text-lg font-bold text-slate-900 hidden sm:inline">
            Math Archive
          </span>
        </div>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => { navigate('/'); setView('STUDENT_HOME'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'STUDENT_HOME' || view === 'STUDENT_TEST' || view === 'STUDENT_RESULT'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            채점하기
          </button>
          <button
            onClick={goToArchive}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isArchiveView
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            시험지 아카이브
          </button>
          <button
            onClick={() => { navigate('/admin'); setView('ADMIN_DASHBOARD'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAdminView
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            관리자
          </button>
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => { navigate('/'); setView('STUDENT_HOME'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-colors ${
                view === 'STUDENT_HOME' || view === 'STUDENT_TEST' || view === 'STUDENT_RESULT'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              채점하기
            </button>
            <button
              onClick={goToArchive}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-colors ${
                isArchiveView
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              시험지 아카이브
            </button>
            <button
              onClick={() => { navigate('/admin'); setView('ADMIN_DASHBOARD'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-colors ${
                isAdminView
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              관리자
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
