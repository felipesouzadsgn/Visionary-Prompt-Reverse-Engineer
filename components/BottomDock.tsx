import React from 'react';
import { PlusCircle, Grid, User as UserIcon, LogOut, Moon, Sun } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomDockProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  onLogout: () => void;
  isDark?: boolean;
  toggleTheme?: () => void;
}

const BottomDock: React.FC<BottomDockProps> = ({ currentView, onChangeView, onLogout, isDark = true, toggleTheme }) => {
  const items = [
    { id: ViewMode.LIBRARY, icon: <Grid size={20} />, label: 'Library' },
    { id: ViewMode.CREATE, icon: <PlusCircle size={24} />, label: 'Create', highlight: true },
    { id: ViewMode.PROFILE, icon: <UserIcon size={20} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div className="animate-float pointer-events-auto">
        <div className="flex items-center gap-2 p-2 bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
            {items.map((item) => (
            <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`
                relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
                ${currentView === item.id 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg scale-110' 
                    : 'text-zinc-500 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}
                `}
            >
                {item.icon}
                {currentView === item.id && (
                    <span className="absolute -bottom-6 text-[9px] font-bold tracking-widest uppercase text-zinc-500 dark:text-white/50 whitespace-nowrap hidden sm:block">
                        {item.label}
                    </span>
                )}
            </button>
            ))}
            
            <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />
            
            {toggleTheme && (
              <button 
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-full text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                title="Toggle Theme"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <button 
                onClick={onLogout}
                className="flex items-center justify-center w-10 h-10 rounded-full text-zinc-500 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Logout"
            >
                <LogOut size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default BottomDock;