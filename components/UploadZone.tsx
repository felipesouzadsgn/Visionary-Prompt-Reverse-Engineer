import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const SAMPLES = [
  { 
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', 
    label: 'Abstract Oil' 
  },
  { 
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 
    label: 'Cinematic Portrait' 
  },
  { 
    url: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=600&auto=format&fit=crop', 
    label: 'Cyberpunk' 
  },
  { 
    url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop', 
    label: 'Neon Abstract' 
  }
];

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleSampleClick = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || loadingSample) return;
    
    setLoadingSample(url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "sample-image.jpg", { type: blob.type });
      onFileSelect(file);
    } catch (error) {
      console.error("Error loading sample:", error);
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div 
      className="group w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInput} 
        accept="image/*" 
        className="hidden" 
      />
      
      <GlassCard 
        intensity={isDragging ? 'high' : 'medium'}
        className={`
          flex flex-col items-center justify-center text-center 
          p-6 md:p-8
          border-dashed 
          ${isDragging 
            ? 'border-blue-400 dark:border-white/40 scale-[1.02]' 
            : 'border-zinc-300 dark:border-white/10'}
          transition-all duration-300
        `}
      >
        {/* Main Click Area Content */}
        <div 
            onClick={handleClick} 
            className="w-full flex flex-col items-center cursor-pointer pb-6 md:pb-8 border-b border-black/5 dark:border-white/5"
        >
            <div className={`
            w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-gray-200 to-white dark:from-gray-800 dark:to-black
            flex items-center justify-center mb-4 md:mb-6 shadow-2xl
            ${isDragging ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform duration-300
            `}>
            {isDragging ? (
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-blue-500 dark:text-blue-400" />
            ) : (
                <Upload className="w-6 h-6 md:w-8 md:h-8 text-zinc-400 dark:text-white/80" />
            )}
            </div>

            <h3 className="text-xl md:text-2xl font-light tracking-tight dark:text-white text-zinc-900 mb-2">
            {isDragging ? "Release to Analyze" : "Drop visual reference"}
            </h3>
            
            <p className="text-sm dark:text-white/40 text-zinc-500 font-light max-w-xs mx-auto mb-4 leading-relaxed">
            Upload an image to extract its DNA and generate a professional prompt.
            </p>
            
            <div className="flex items-center space-x-2 text-[10px] md:text-xs font-medium dark:text-white/30 text-zinc-400 uppercase tracking-widest">
                <ImageIcon className="w-3 h-3" />
                <span>JPG • PNG • WEBP</span>
            </div>
        </div>

        {/* Sample Images Section */}
        <div className="w-full mt-6">
            <p className="text-[10px] dark:text-white/20 text-zinc-400 uppercase tracking-[0.2em] mb-4 font-semibold">
                Or select a sample
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-md mx-auto">
                {SAMPLES.map((sample, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => handleSampleClick(sample.url, e)}
                        disabled={disabled || loadingSample !== null}
                        className="group/sample relative aspect-square rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 hover:ring-blue-400 dark:hover:ring-white/40 transition-all focus:outline-none shadow-sm"
                    >
                        <img 
                            src={sample.url} 
                            alt={sample.label}
                            className={`
                                w-full h-full object-cover 
                                transition-all duration-500
                                ${loadingSample === sample.url ? 'scale-100 opacity-40 blur-sm' : 'opacity-80 dark:opacity-60 grayscale-[0.5] group-hover/sample:grayscale-0 group-hover/sample:opacity-100 group-hover/sample:scale-110'}
                            `} 
                        />
                        
                        {/* Loading State Overlay */}
                        {loadingSample === sample.url && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <Loader2 className="w-5 h-5 text-white animate-spin" />
                             </div>
                        )}

                        {/* Hover Label Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/sample:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                            <span className="text-[9px] text-white font-medium uppercase tracking-wide truncate px-1">{sample.label}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default UploadZone;