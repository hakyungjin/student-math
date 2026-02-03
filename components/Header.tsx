
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
    <header className={`${isAdminView ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-b sticky top-0 z-50 transition-colors`}>
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        {/* 로고 */}
        <div 
          className="flex items-center space-x-2 cursor-pointer flex-shrink-0" 
          onClick={goToHome}
        >
          <div className={`${isAdminView ? 'bg-indigo-500' : 'bg-amber-400'} text-white w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-sm md:text-base`}>
            {isAdminView ? '⚙️' : '✏️'}
          </div>
          <span className={`text-base md:text-lg font-black tracking-tight hidden sm:inline ${isAdminView ? 'text-white' : 'text-slate-900'}`}>
            똑똑 채점기
          </span>
          <span className={`text-base md:text-lg font-black tracking-tight sm:hidden ${isAdminView ? 'text-white' : 'text-slate-900'}`}>
            채점
          </span>
        </div>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex items-center gap-4">
          <span className={`text-xs font-semibold ${isAdminView ? 'text-indigo-400' : 'text-amber-500'}`}>
            {isAdminView ? '관리자 모드' : '학생 모드'}
          </span>
          {isAdminView && (
            <button 
              onClick={switchMode}
              className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              학생 화면 전환
            </button>
          )}
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-2xl"
        >
          {isAdminView ? '☰' : '☰'}
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t ${isAdminView ? 'border-slate-800 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
          <div className="px-4 py-3 space-y-2">
            <div className={`text-xs font-semibold pb-2 ${isAdminView ? 'text-indigo-400' : 'text-amber-500'}`}>
              {isAdminView ? '관리자 모드' : '학생 모드'}
            </div>
            {isAdminView && (
              <button 
                onClick={switchMode}
                className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${isAdminView ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}
              >
                📚 학생 화면 전환
              </button>
            )}
            <button 
              onClick={goToHome}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${isAdminView ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}
            >
              🏠 홈으로
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
