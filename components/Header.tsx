
import React from 'react';
import { ViewState } from '../types';

interface Props {
  view: ViewState;
  setView: (view: ViewState) => void;
}

const Header: React.FC<Props> = ({ view, setView }) => {
  const isAdminView = view.startsWith('ADMIN_');

  return (
    <header className={`${isAdminView ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-b sticky top-0 z-50 transition-colors`}>
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => setView(isAdminView ? 'ADMIN_DASHBOARD' : 'STUDENT_HOME')}
        >
          <div className={`${isAdminView ? 'bg-indigo-500' : 'bg-amber-400'} text-white w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm`}>
            {isAdminView ? '⚙️' : '✏️'}
          </div>
          <span className={`text-lg font-black tracking-tight ${isAdminView ? 'text-white' : 'text-slate-900'}`}>
            똑똑 채점기 <span className="text-[10px] font-normal opacity-50 ml-1">{isAdminView ? '관리자' : '학생용'}</span>
          </span>
        </div>
        
        {isAdminView && (
          <button 
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('admin');
              window.history.pushState({}, '', url.toString());
              window.location.reload();
            }}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            학생 화면으로
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
