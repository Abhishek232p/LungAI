
import React from 'react';
import { LungIcon, DashboardIcon, HistoryIcon } from './icons';

type View = 'analyzer' | 'history' | 'dashboard';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  view: View;
  currentView: View;
  setView: (view: View) => void;
  icon: React.ReactNode;
}> = ({ label, view, currentView, setView, icon }) => {
  const isActive = currentView === view;
  const activeClasses = 'bg-blue-600 text-white';
  const inactiveClasses = 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';

  return (
    <button
      onClick={() => setView(view)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <LungIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Lung<span className="text-blue-500">AI</span>
            </h1>
          </div>
          <nav className="flex items-center space-x-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <NavButton label="Analyzer" view="analyzer" currentView={currentView} setView={setView} icon={<LungIcon className="h-5 w-5"/>} />
            <NavButton label="History" view="history" currentView={currentView} setView={setView} icon={<HistoryIcon className="h-5 w-5"/>} />
            <NavButton label="Dashboard" view="dashboard" currentView={currentView} setView={setView} icon={<DashboardIcon className="h-5 w-5"/>} />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
