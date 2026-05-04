'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import AuditResults from '@/components/AuditResults';
import { SEOReport } from '@/types/seo';
import { analyzeSEO } from '@/lib/seo-analyzer';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Zap, 
  List, 
  ChevronRight, 
  Globe 
} from 'lucide-react';

export default function Home() {
  const [siteAuditResults, setSiteAuditResults] = useState<SEOReport[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSearch = async (url: string) => {
    setLoading(true);
    setError(null);
    setSiteAuditResults([]);
    setSelectedIndex(0);
    setProgress({ current: 0, total: 0 });

    try {
      // Step 1: Find all internal links via Crawler API
      const linksResponse = await fetch('/api/get-site-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const linksData = await linksResponse.json();
      if (!linksResponse.ok) throw new Error(linksData.error || 'Failed to crawl site');

      const links: string[] = linksData.links;
      setProgress({ current: 0, total: links.length });

      const results: SEOReport[] = [];

      // Step 2: Loop through each link and perform deep-dive audit
      for (let i = 0; i < links.length; i++) {
        const currentUrl = links[i];
        let success = false;
        let retries = 0;

        while (!success && retries <= 2) {
          try {
            const auditResponse = await fetch('/api/audit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: currentUrl }),
            });

            const auditData = await auditResponse.json();
            if (!auditResponse.ok) throw new Error(auditData.error);

            // Turn raw data into diagnostic report
            const analyzedReport = analyzeSEO(auditData);
            results.push(analyzedReport);
            
            // Update UI state with new results as they arrive
            setSiteAuditResults([...results]);
            success = true;
          } catch (err) {
            retries++;
            if (retries > 2) {
               success = true; // Move on if max retries reached
            } else {
               await delay(1000); // Wait before retry
            }
          }
        }

        setProgress(prev => ({ ...prev, current: i + 1 }));
        if (i < links.length - 1) await delay(500); // Politeness delay
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedReport = siteAuditResults[selectedIndex];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Sticky Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">SEO Auditor <span className="text-blue-600">Pro</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Suite</p>
              </div>
            </div>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md active:scale-95">
              Upgrade Plan
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Search & Audit Progress */}
        <div className={`${selectedReport ? 'max-w-4xl mx-auto mb-10' : 'pt-16 text-center'}`}>
           {!selectedReport && !loading && (
             <div className="mb-10 space-y-4">
               <h2 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                 Site-wide <span className="text-blue-600">SEO Intelligence</span>
               </h2>
               <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                 Perform deep-dive diagnostics across your entire domain. Detect H1 issues and validate meta tags instantly.
               </p>
             </div>
           )}
           
           <SearchBar onSearch={handleSearch} isLoading={loading} />
           
           {loading && progress.total > 0 && (
             <div className="mt-10 space-y-4 max-w-2xl mx-auto animate-in">
               <div className="flex justify-between items-end">
                 <div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Live Analysis</p>
                    <p className="text-sm font-bold text-slate-500 mt-1">Auditing Internal Pages...</p>
                 </div>
                 <div className="text-right">
                    <span className="text-2xl font-black text-slate-800 tabular-nums">{progress.current}</span>
                    <span className="text-slate-400 font-bold ml-1 text-sm">/ {progress.total}</span>
                 </div>
               </div>
               <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner p-0.5">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                   style={{ width: `${(progress.current / progress.total) * 100}%` }}
                 />
               </div>
             </div>
           )}
        </div>

        {error && (
          <div className="mt-10 p-5 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-700 text-center animate-in max-w-2xl mx-auto">
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Dynamic Multi-page Dashboard */}
        {siteAuditResults.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-10 mt-10 animate-in">
            {/* Results Sidebar */}
            <aside className="lg:w-80 shrink-0">
              <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-28 max-h-[calc(100vh-10rem)] flex flex-col">
                <div className="flex items-center justify-between px-3 mb-6">
                   <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                     <List size={14} className="text-blue-500" /> Scanned URLs
                   </h3>
                   <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-lg">
                     {siteAuditResults.length}
                   </span>
                </div>
                <div className="overflow-y-auto space-y-3 flex-1 custom-scrollbar">
                  {siteAuditResults.map((res, index) => (
                    <button
                      key={res.url}
                      onClick={() => setSelectedIndex(index)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group overflow-hidden relative ${
                        selectedIndex === index 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20' 
                        : 'bg-white border-transparent hover:bg-slate-50 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1 relative z-10">
                        <p className={`text-[10px] font-black truncate mb-1.5 tracking-wider ${selectedIndex === index ? 'text-blue-100' : 'text-slate-400'}`}>
                          {new URL(res.url).pathname === '/' ? 'DOMAIN HOME' : new URL(res.url).pathname.split('/').pop()?.toUpperCase() || 'PAGE'}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-black px-2 py-1 rounded-lg tabular-nums ${
                            selectedIndex === index 
                            ? 'bg-white/20 text-white' 
                            : res.analysis.score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>{res.analysis.score}</span>
                          <span className={`text-[11px] font-bold truncate italic ${selectedIndex === index ? 'text-blue-50 opacity-80' : 'text-slate-400'}`}>
                             {res.meta.title || 'Untitled Page'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className={`relative z-10 transition-transform ${selectedIndex === index ? 'translate-x-1' : 'opacity-0 group-hover:opacity-40'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Selected Page Details View */}
            <div className="flex-1 min-w-0">
               {selectedReport && <AuditResults report={selectedReport} />}
            </div>
          </div>
        )}

        {/* Feature Cards - Initial State */}
        {!selectedReport && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-24">
            <FeatureCard 
              icon={<Zap className="text-amber-500" />} 
              title="Site-wide Crawl" 
              description="Automatically discovers up to 15 internal links and audits each page sequentially for deep patterns." 
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-500" />} 
              title="Header Diagnostics" 
              description="Identifies multiple H1 tags and extracts their text content so you know exactly what to fix." 
            />
            <FeatureCard 
              icon={<LayoutDashboard className="text-blue-500" />} 
              title="Smart Validation" 
              description="Advanced meta description length checks with real-time status indicators and scoring reasoning." 
            />
          </div>
        )}
      </div>

      <footer className="mt-auto border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            © 2026 SEO Analyser Pro · Next-Gen Performance Analysis
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-50 transition-all duration-500">
        {icon}
      </div>
      <h3 className="font-black text-slate-800 text-xl mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
    </div>
  );
}