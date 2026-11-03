import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Logo from './Logo';
import { navigationTabs, isTabActive } from '../../screens/navigation';

const TopNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-12">
        <Logo />

        <nav className="hidden lg:flex p-1.5 bg-slate-100 rounded-full gap-1">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              aria-current={isTabActive(tab, pathname) ? 'page' : undefined}
              className={`px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                isTabActive(tab, pathname)
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.icon && <tab.icon size={16} />}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm">
          <Calendar size={16} />
          <span>Quinta-feira, 8 Out 2026 - 09:40 AM</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default TopNav;
