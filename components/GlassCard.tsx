import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  border?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  intensity = 'medium',
  border = true 
}) => {
  
  const bgOpacity = {
    low: 'bg-white/[0.03]',
    medium: 'bg-white/[0.07]',
    high: 'bg-white/[0.12]',
  };

  const blurIntensity = {
    low: 'backdrop-blur-md',
    medium: 'backdrop-blur-2xl',
    high: 'backdrop-blur-3xl',
  };

  const borderClass = border ? 'border border-white/10' : '';

  return (
    <div 
      className={`
        relative overflow-hidden
        ${bgOpacity[intensity]} 
        ${blurIntensity[intensity]} 
        ${borderClass}
        rounded-[2rem] 
        shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
        text-white
        transition-all duration-500 ease-out
        ${className}
      `}
    >
      {/* Noise Texture Overlay for realism */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
