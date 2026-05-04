'use client';

import React, { useState } from 'react';
import { Search, Loader2, Globe, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSearch(url.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Animated gradient background glow on focus */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
        
        <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden ring-offset-2 focus-within:ring-2 ring-blue-500/20 transition-all">
          <div className="absolute left-5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-blue-500" />
            ) : (
              <Globe size={20} className="group-focus-within:scale-110 transition-transform duration-300" />
            )}
          </div>
          
          <input
            type="text"
            placeholder="Enter website domain (e.g., apple.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            className="w-full pl-14 pr-40 py-5 bg-transparent focus:outline-none text-slate-700 font-medium placeholder:text-slate-400 text-lg"
          />
          
          <div className="absolute right-2 flex items-center">
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:active:scale-100 ${
                isLoading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                  Auditing
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Audit Site</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      
      {/* Feature tags to showcase the new diagnostic capabilities */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <Sparkles size={12} className="text-amber-500" />
          Full Site Crawl
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-200" />
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <Sparkles size={12} className="text-blue-500" />
          H1 Diagnostics
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-200" />
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <Sparkles size={12} className="text-emerald-500" />
          Smart Meta Validation
        </div>
      </div>
    </div>
  );
}