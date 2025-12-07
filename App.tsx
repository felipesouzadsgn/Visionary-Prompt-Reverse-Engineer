
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
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [sessionHistory, setSessionHistory] = useState<SessionItem[]>([]);

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
      // For a real app, we would upload the image to cloud storage.
      // Here we will use the local ObjectURL (note: this will break on refresh for the image, 
      // but to persist we would need to store the Base64 string which is heavy for localStorage.
      // For this demo, we'll store a generic placeholder for persistence in this demo context
      // to avoid localStorage quota limits with base64 strings.
      savePrompt(analysisToSave, fullPrompt, imagePreview); // In real app: savePrompt(..., cloudUrl)
      alert("Prompt saved to Library!");
      setViewMode(ViewMode.LIBRARY);
    }
  };

  const renderContent = () => {
    if (viewMode === ViewMode.LIBRARY) return <Library />;
    
    if (viewMode === ViewMode.PROFILE) {
        return (
            <div className="w-full max-w-md mx-auto animate-float">
                <GlassCard className="p-8 text-center" intensity="high">
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                        <UserIcon size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-light text-white mb-1">{user?.name}</h2>
                    <p className="text-white/40 text-sm font-mono mb-8">{user?.id.split('-')[0]}</p>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
                        <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Status</div>
                        <div className="text-green-400 font-medium flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
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
           <div className="mb-12 text-center space-y-4">
              <h2 className="text-5xl md:text-7xl font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                Reverse<br />Engineer.
              </h2>
           </div>
           <UploadZone onFileSelect={handleFileSelect} />
        </div>
      );
    }

    if (appState === AppState.ANALYZING) {
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 animate-pulse-slow">
           <div className="relative w-32 h-32">
               <div className="absolute inset-0 rounded-full border border-white/10" />
               <div className="absolute inset-0 rounded-full border-t border-white/80 animate-spin" />
               {imagePreview && (
                 <div className="absolute inset-2 rounded-full overflow-hidden opacity-50 blur-sm">
                    <img src={imagePreview} className="w-full h-full object-cover" />
                 </div>
               )}
           </div>
           <div>
              <h3 className="text-2xl font-light text-white mb-2">Extracting Visual DNA</h3>
              <p className="text-white/40 text-sm font-mono">Identifying lighting, composition, and style...</p>
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
         <GlassCard className="p-8 max-w-md text-center" intensity="high">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertCircle className="text-red-400" size={32} />
            </div>
            <h3 className="text-xl text-white mb-2">Processing Interrupted</h3>
            <p className="text-white/50 mb-8">{errorMsg}</p>
            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform"
            >
              Try Again
            </button>
         </GlassCard>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen w-full relative selection:bg-white/20 flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[#000000] z-[-2]" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full z-[-1]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full z-[-1]" />

      {/* Header */}
      <header className="w-full p-8 flex justify-between items-center z-40">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
                <Sparkles size={20} className="text-white/80" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg font-semibold tracking-tight text-white">Visionary</h1>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {user ? `Agent ${user.name}` : 'Login Required'}
                </span>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative pb-32">
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
