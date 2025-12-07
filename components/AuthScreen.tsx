import React, { useState } from 'react';
import { Fingerprint, ArrowRight } from 'lucide-react';
import GlassCard from './GlassCard';

interface AuthScreenProps {
  onLogin: (name: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onLogin(name);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-float">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-thin tracking-tighter dark:text-white text-zinc-900 mb-2">Identify</h1>
        <p className="dark:text-white/40 text-zinc-500 text-sm uppercase tracking-widest">Secure Prompt Access</p>
      </div>

      <GlassCard className="p-8" intensity="high">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center animate-pulse-slow shadow-sm">
              <Fingerprint className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs dark:text-white/30 text-zinc-500 uppercase tracking-wider ml-4">Codename</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your alias..."
              className="w-full bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-full py-4 px-6 dark:text-white text-zinc-900 placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/50 dark:focus:bg-white/5 transition-all text-center"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="group relative w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-full font-medium overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            <span className="flex items-center justify-center space-x-2">
              <span>Initialize System</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default AuthScreen;