
import React, { useState, useEffect, useRef } from 'react';
import { PromptAnalysis, SessionItem } from '../types';
import GlassCard from './GlassCard';
import { Copy, Check, Aperture, Palette, Zap, Box, Layers, Film, Code, Save, Edit2, RotateCcw, History, Clock } from 'lucide-react';

interface ResultViewProps {
  analysis: PromptAnalysis;
  imagePreview: string;
  onReset: () => void;
  onSave: (analysis: PromptAnalysis, fullPrompt: string) => void;
  sessionHistory?: SessionItem[];
  onRestoreHistory?: (item: SessionItem) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ 
    analysis, 
    imagePreview, 
    onReset, 
    onSave,
    sessionHistory = [],
    onRestoreHistory 
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnalysis, setEditedAnalysis] = useState<PromptAnalysis>(analysis);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // Sync internal state when prop changes (e.g. from History Restore)
  useEffect(() => {
    setEditedAnalysis(analysis);
  }, [analysis]);

  // Update prompt string whenever analysis components change
  useEffect(() => {
    const p = `${editedAnalysis.subject}. ${editedAnalysis.medium}, ${editedAnalysis.lighting}, ${editedAnalysis.camera}, ${editedAnalysis.palette}, ${editedAnalysis.vibe}. ${editedAnalysis.techParams}`;
    setGeneratedPrompt(p);
  }, [editedAnalysis]);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (key: keyof PromptAnalysis, value: string) => {
    setEditedAnalysis(prev => ({
        ...prev,
        [key]: value
    }));
  };

  const categories = [
    { key: 'subject', icon: <Box size={14} />, label: 'Subject', col: 'col-span-2' },
    { key: 'medium', icon: <Layers size={14} />, label: 'Medium', col: 'col-span-1' },
    { key: 'lighting', icon: <Zap size={14} />, label: 'Lighting', col: 'col-span-1' },
    { key: 'camera', icon: <Aperture size={14} />, label: 'Camera', col: 'col-span-1' },
    { key: 'palette', icon: <Palette size={14} />, label: 'Palette', col: 'col-span-1' },
    { key: 'vibe', icon: <Film size={14} />, label: 'Vibe', col: 'col-span-1' },
    { key: 'techParams', icon: <Code size={14} />, label: 'Params', col: 'col-span-1' },
  ];

  const formatTime = (ms: number) => {
    const mins = Math.floor((Date.now() - ms) / 60000);
    if (mins < 1) return 'Just now';
    return `${mins}m ago`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-float pb-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Image Preview */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <GlassCard className="aspect-[3/4] p-2 relative group" intensity="low">
             <img 
               src={imagePreview} 
               alt="Reference" 
               className="w-full h-full object-cover rounded-2xl opacity-90"
             />
             <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none"></div>
          </GlassCard>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={onReset}
                className="py-3 px-4 rounded-full bg-white/5 border border-white/10 
                        text-xs text-white/60 hover:text-white hover:bg-white/10 
                        transition-all duration-300 backdrop-blur-md flex items-center justify-center space-x-2"
            >
                <RotateCcw size={14} />
                <span>New</span>
            </button>
            <button 
                onClick={() => onSave(editedAnalysis, generatedPrompt)}
                className="py-3 px-4 rounded-full bg-white/5 border border-white/10 
                        text-xs text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 
                        transition-all duration-300 backdrop-blur-md flex items-center justify-center space-x-2"
            >
                <Save size={14} />
                <span>Save</span>
            </button>
          </div>
        </div>

        {/* Right Column: Data */}
        <div className="md:col-span-2 flex flex-col gap-4">
          
          {/* Main Prompt Display */}
          <GlassCard className="p-6 md:p-8" intensity="high">
            <div className="flex justify-between items-start mb-6 relative">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Prompt DNA</h2>
                <p className="text-white/40 text-sm flex items-center gap-2">
                    {isEditing ? 'Customization Mode' : 'Reverse-engineered syntax'}
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-1 rounded-md transition-colors ${isEditing ? 'text-blue-400 bg-blue-400/10' : 'text-white/30 hover:text-white'}`}
                        title="Edit prompt parts"
                    >
                        <Edit2 size={12} />
                    </button>
                </p>
              </div>

              <div className="flex items-center space-x-2" ref={historyRef}>
                {/* History Button */}
                <div className="relative">
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`
                            p-2 rounded-full border transition-all duration-200
                            ${showHistory ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/60 hover:text-white'}
                        `}
                        title="Session History"
                    >
                        <History size={16} />
                    </button>

                    {/* History Popover */}
                    {showHistory && (
                        <div className="absolute right-0 top-12 w-80 z-50 animate-in fade-in slide-in-from-top-2">
                            <GlassCard className="max-h-96 overflow-y-auto" intensity="high">
                                <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-xl z-10">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Session History</span>
                                    <Clock size={12} className="text-white/40" />
                                </div>
                                <div className="p-2 space-y-1">
                                    {sessionHistory.length === 0 && (
                                        <div className="p-4 text-center text-white/30 text-xs">No history yet</div>
                                    )}
                                    {sessionHistory.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (onRestoreHistory) onRestoreHistory(item);
                                                setShowHistory(false);
                                            }}
                                            className="w-full text-left p-2 rounded-xl hover:bg-white/10 transition-colors group flex items-start gap-3"
                                        >
                                            <div className="w-10 h-10 rounded-md overflow-hidden bg-white/5 flex-shrink-0 ring-1 ring-white/10">
                                                <img src={item.imagePreview} className="w-full h-full object-cover" alt="thumb" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="text-[10px] text-blue-300 font-medium truncate max-w-[100px]">{item.analysis.subject}</span>
                                                    <span className="text-[9px] text-white/20">{formatTime(item.timestamp)}</span>
                                                </div>
                                                <p className="text-[10px] text-white/50 line-clamp-2 leading-tight group-hover:text-white/80 transition-colors">
                                                    {item.fullPrompt}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleCopy}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/5 
                            px-4 py-2 rounded-full transition-all duration-200 group"
                >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    <span className="text-xs font-medium uppercase tracking-wider">
                    {copied ? 'Copied' : 'Copy'}
                    </span>
                </button>
              </div>
            </div>
            
            <p className="text-lg leading-relaxed font-light text-white/90 selection:bg-blue-500/30">
              {generatedPrompt}
            </p>
          </GlassCard>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, idx) => (
              <GlassCard 
                key={idx} 
                className={`p-4 flex flex-col justify-between min-h-[100px] ${cat.col} ${isEditing ? 'ring-1 ring-blue-500/30 bg-blue-500/5' : ''}`}
                intensity="low"
              >
                <div className="flex items-center space-x-2 text-white/30 mb-2">
                  {cat.icon}
                  <span className="text-[10px] uppercase tracking-widest font-bold">{cat.label}</span>
                </div>
                
                {isEditing ? (
                    <textarea 
                        value={editedAnalysis[cat.key as keyof PromptAnalysis]}
                        onChange={(e) => handleInputChange(cat.key as keyof PromptAnalysis, e.target.value)}
                        className={`w-full bg-transparent border-b border-white/20 text-sm font-medium text-white/90 focus:outline-none focus:border-blue-400 p-0 resize-none h-auto overflow-hidden ${cat.key === 'techParams' ? 'font-mono text-xs' : ''}`}
                        rows={cat.col === 'col-span-2' ? 2 : 1}
                    />
                ) : (
                    <div className={`text-sm font-medium text-white/80 leading-snug ${cat.key === 'techParams' ? 'font-mono text-xs opacity-80 text-blue-300' : ''}`}>
                        {editedAnalysis[cat.key as keyof PromptAnalysis]}
                    </div>
                )}
              </GlassCard>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ResultView;
