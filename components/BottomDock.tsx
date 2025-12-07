
import React from 'react';
import { PlusCircle, Grid, User as UserIcon, LogOut } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomDockProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  onLogout: () => void;
}

const BottomDock: React.FC<BottomDockProps> = ({ currentView, onChangeView, onLogout }) => {
  const items = [
    { id: ViewMode.LIBRARY, icon: <Grid size={20} />, label: 'Library' },
    { id: ViewMode.CREATE, icon: <PlusCircle size={24} />, label: 'Create', highlight: true },
    { id: ViewMode.PROFILE, icon: <UserIcon size={20} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-float">
      <div className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`
              relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
              ${currentView === item.id 
                ? 'bg-white text-black shadow-lg scale-110' 
                : 'text-white/60 hover:text-white hover:bg-white/5'}
            `}
          >
            {item.icon}
            {currentView === item.id && (
                <span className="absolute -bottom-6 text-[9px] font-bold tracking-widest uppercase text-white/50 whitespace-nowrap">
                    {item.label}
                </span>
            )}
          </button>
        ))}
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button 
            onClick={onLogout}
            className="flex items-center justify-center w-10 h-10 rounded-full text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
            <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

export default BottomDock;
