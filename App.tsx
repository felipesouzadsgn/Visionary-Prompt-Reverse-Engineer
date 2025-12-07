import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import UploadZone from './components/UploadZone';
import ResultView from './components/ResultView';
import GlassCard from './components/GlassCard';
import AuthScreen from './components/AuthScreen';
import Library from './components/Library';
import BottomDock from './components/BottomDock';
import { analyzeImage, fileToBase64 } from './services/geminiService';
import { AppState, PromptAnalysis, User, ViewMode, SessionItem } from './types';
import { loginUser, getCurrentUser, logoutUser, savePrompt } from './services/storageService';
import { Sparkles, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CREATE);
  const [isDark, setIsDark] = useState(true);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [sessionHistory, setSessionHistory] = useState<SessionItem[]>([]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light') {
      setIsDark(false);
    } else if (savedTheme === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(prefersDark);
    }
  }, []);

  // Apply theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Check auth on load
  useEffect(() => {
    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      setAppState(AppState.IDLE);
    }
  }, []);

  const handleLogin = (name: string) => {
    const newUser = loginUser(name);
    setUser(newUser);
    setAppState(AppState.IDLE);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setAppState(AppState.AUTH);
    setViewMode(ViewMode.CREATE);
    handleReset();
    setSessionHistory([]);
  };

  const addToHistory = (newAnalysis: PromptAnalysis, previewUrl: string) => {
    const fullPrompt = `${newAnalysis.subject}. ${newAnalysis.medium}, ${newAnalysis.lighting}, ${newAnalysis.camera}, ${newAnalysis.palette}, ${newAnalysis.vibe}. ${newAnalysis.techParams}`;
    
    const newItem: SessionItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        analysis: newAnalysis,
        fullPrompt,
        imagePreview: previewUrl
    };

    setSessionHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
  };

  const handleRestoreSession = (item: SessionItem) => {
      setAnalysis(item.analysis);
      setImagePreview(item.imagePreview);
      setAppState(AppState.COMPLETE);
  };

  const handleFileSelect = async (file: File) => {
    try {
      setAppState(AppState.ANALYZING);
      setErrorMsg(null);
      
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      const base64Data = await fileToBase64(file);
      const mimeType = file.type;

      const result = await analyzeImage(base64Data, mimeType);
      
      setAnalysis(result);
      setAppState(AppState.COMPLETE);
      addToHistory(result, objectUrl);

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze image visual structure. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setImagePreview(null);
    setAnalysis(null);
    setErrorMsg(null);
  };

  const handleSavePrompt = (analysisToSave: PromptAnalysis, fullPrompt: string) => {
    if (imagePreview) {
      savePrompt(analysisToSave, fullPrompt, imagePreview);
      alert("Prompt saved to Library!");
      setViewMode(ViewMode.LIBRARY);
    }
  };

  const renderContent = () => {
    if (viewMode === ViewMode.LIBRARY) return <Library />;
    
    if (viewMode === ViewMode.PROFILE) {
        return (
            <div className="w-full max-w-md mx-auto animate-float px-4">
                <GlassCard className="p-8 text-center" intensity="high">
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                        <UserIcon size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-light dark:text-white text-zinc-900 mb-1">{user?.name}</h2>
                    <p className="dark:text-white/40 text-zinc-500 text-sm font-mono mb-8">{user?.id.split('-')[0]}</p>
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 mb-6">
                        <div className="text-xs dark:text-white/30 text-zinc-400 uppercase tracking-widest mb-1">Status</div>
                        <div className="text-green-500 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Active Agent
                        </div>
                    </div>
                </GlassCard>
            </div>
        );
    }

    // CREATE VIEW LOGIC
    if (appState === AppState.IDLE) {
      return (
        <div className="w-full max-w-xl animate-float">
           <div className="mb-8 md:mb-12 text-center space-y-2 md:space-y-4 px-4">
              <h2 className="text-4xl md:text-7xl font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-white/40 leading-tight">
                Reverse<br />Engineer.
              </h2>
           </div>
           <UploadZone onFileSelect={handleFileSelect} />
        </div>
      );
    }

    if (appState === AppState.ANALYZING) {
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 animate-pulse-slow px-4">
           <div className="relative w-24 h-24 md:w-32 md:h-32">
               <div className="absolute inset-0 rounded-full border border-zinc-200 dark:border-white/10" />
               <div className="absolute inset-0 rounded-full border-t border-zinc-800 dark:border-white/80 animate-spin" />
               {imagePreview && (
                 <div className="absolute inset-2 rounded-full overflow-hidden opacity-50 blur-sm">
                    <img src={imagePreview} className="w-full h-full object-cover" />
                 </div>
               )}
           </div>
           <div>
              <h3 className="text-xl md:text-2xl font-light dark:text-white text-zinc-900 mb-2">Extracting Visual DNA</h3>
              <p className="dark:text-white/40 text-zinc-500 text-sm font-mono">Identifying lighting, composition, and style...</p>
           </div>
        </div>
      );
    }

    if (appState === AppState.COMPLETE && analysis && imagePreview) {
      return (
        <ResultView 
          analysis={analysis} 
          imagePreview={imagePreview} 
          onReset={handleReset} 
          onSave={handleSavePrompt}
          sessionHistory={sessionHistory}
          onRestoreHistory={handleRestoreSession}
        />
      );
    }

    if (appState === AppState.ERROR) {
      return (
         <div className="px-4 w-full flex justify-center">
            <GlassCard className="p-8 max-w-md w-full text-center" intensity="high">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-500 dark:text-red-400" size={32} />
                </div>
                <h3 className="text-xl dark:text-white text-zinc-900 mb-2">Processing Interrupted</h3>
                <p className="dark:text-white/50 text-zinc-500 mb-8">{errorMsg}</p>
                <button 
                onClick={handleReset}
                className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:scale-105 transition-transform"
                >
                Try Again
                </button>
            </GlassCard>
         </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen w-full relative selection:bg-blue-500/20 flex flex-col overflow-x-hidden transition-colors duration-500">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-zinc-50 dark:bg-[#000000] z-[-2] transition-colors duration-500" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-900/20 blur-[120px] rounded-full z-[-1]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-900/10 blur-[120px] rounded-full z-[-1]" />

      {/* Header */}
      <header className="w-full p-6 md:p-8 flex justify-center items-center z-40">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 dark:border-white/10 shadow-lg">
                <Sparkles size={16} className="md:w-5 md:h-5 text-zinc-900 dark:text-white/80" />
            </div>
            <div className="flex flex-col text-left md:text-center">
                <h1 className="text-base md:text-lg font-semibold tracking-tight dark:text-white text-zinc-900">Visionary</h1>
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] dark:text-white/40 text-zinc-500">
                    {user ? `Agent ${user.name}` : 'Login Required'}
                </span>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative pb-32 md:pb-32 w-full max-w-7xl mx-auto">
        {appState === AppState.AUTH ? (
          <AuthScreen onLogin={handleLogin} />
        ) : (
          renderContent()
        )}
      </main>

      {/* Bottom Navigation Dock (Only if logged in) */}
      {user && (
          <BottomDock 
            currentView={viewMode} 
            onChangeView={(v) => {
                setViewMode(v);
                if (v === ViewMode.CREATE && appState === AppState.COMPLETE) {
                    // Stay on complete view if clicking create while viewing result
                } else if (v === ViewMode.CREATE) {
                    setAppState(AppState.IDLE);
                }
            }}
            onLogout={handleLogout}
            isDark={isDark}
            toggleTheme={() => setIsDark(!isDark)}
          />
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;