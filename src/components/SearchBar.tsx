'use client';

import React, { useState } from 'react';
import { Search, Loader2, Globe } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative group">
        {/* Decorative background blur on focus */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
        
        <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="absolute left-5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Globe size={20} />}
          </div>
          
          <input
            type="text"
            placeholder="Enter domain to audit (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full pl-14 pr-40 py-5 bg-transparent focus:outline-none text-slate-700 font-medium placeholder:text-slate-400"
          />
          
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="absolute right-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Auditing...
              </>
            ) : (
              <>
                <Search size={18} />
                Audit Site
              </>
            )}
          </button>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-xs mt-4 font-medium uppercase tracking-widest">
        Full site crawl & SEO analysis powered by SEO Auditor Pro
      </p>
    </form>
  );
}