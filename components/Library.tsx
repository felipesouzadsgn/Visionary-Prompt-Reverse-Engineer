
import React, { useState, useEffect } from 'react';
import { SavedPrompt } from '../types';
import { getPrompts, toggleFavorite, deletePrompt } from '../services/storageService';
import GlassCard from './GlassCard';
import { Heart, Trash2, Copy, Search, Filter } from 'lucide-react';

const Library: React.FC = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPrompts(getPrompts());
  }, []);

  const handleToggleFav = (id: string) => {
    setPrompts(toggleFavorite(id));
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this prompt DNA?')) {
      setPrompts(deletePrompt(id));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filtered = prompts.filter(p => {
    const matchesFilter = filter === 'all' || (filter === 'favorites' && p.isFavorite);
    const matchesSearch = p.fullPrompt.toLowerCase().includes(search.toLowerCase()) || 
                          p.analysis.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto pb-24">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-thin tracking-tight">Archives</h2>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            <input 
              type="text" 
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-white/30"
            />
          </div>
          
          <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'all' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('favorites')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1 ${filter === 'favorites' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
            >
              <Heart size={10} className={filter === 'favorites' ? 'fill-black' : ''} />
              <span>Favs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 opacity-30">
          <Filter className="mx-auto mb-4 w-12 h-12" />
          <p>No prompts found in the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(prompt => (
            <GlassCard key={prompt.id} className="group flex flex-col h-full" intensity="low">
              {/* Image Header */}
              <div className="relative aspect-video w-full overflow-hidden border-b border-white/5">
                <img src={prompt.imageData} alt="Analysis" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 flex space-x-2">
                   <button 
                    onClick={() => handleToggleFav(prompt.id)}
                    className="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-white text-white hover:text-red-500 transition-colors"
                   >
                     <Heart size={14} className={prompt.isFavorite ? 'fill-red-500 text-red-500' : ''} />
                   </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-3">
                    <span className="text-[10px] text-blue-300 uppercase tracking-wider font-mono bg-blue-500/10 px-2 py-0.5 rounded">
                        {prompt.analysis.medium.split(' ')[0]}
                    </span>
                    <h3 className="text-white font-medium mt-2 line-clamp-1">{prompt.analysis.subject}</h3>
                </div>
                
                <p className="text-xs text-white/50 line-clamp-3 mb-4 flex-1">
                    {prompt.fullPrompt}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-[10px] text-white/20">
                        {new Date(prompt.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => handleDelete(prompt.id)}
                            className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button 
                            onClick={() => handleCopy(prompt.fullPrompt)}
                            className="p-1.5 text-white/30 hover:text-white transition-colors"
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
