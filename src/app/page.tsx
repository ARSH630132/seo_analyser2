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
      // Step 1: Find all internal links via our Crawler API
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

      // Step 2: Loop through each link and audit it
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

            const analyzedReport = analyzeSEO(auditData);
            results.push(analyzedReport);
            
            // Update UI as we get results
            setSiteAuditResults([...results]);
            success = true;
          } catch (err) {
            retries++;
            await delay(1000); // Wait before retry
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
    <main className="min-h-screen bg-slate-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <ShieldCheck size={20} />
              </div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">SEO Auditor Pro</h1>
            </div>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-all">
              Upgrade to Enterprise
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Progress Section */}
        <div className={`${selectedReport ? 'max-w-4xl mx-auto mb-12' : 'pt-12 text-center'}`}>
           {!selectedReport && !loading && (
             <div className="mb-8 space-y-4">
               <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">Site-wide <span className="text-blue-600">SEO Audit</span></h2>
               <p className="text-lg text-slate-500 max-w-2xl mx-auto">Enter a domain to find issues across all your internal pages in one go.</p>
             </div>
           )}
           
           <SearchBar onSearch={handleSearch} isLoading={loading} />
           
           {loading && progress.total > 0 && (
             <div className="mt-8 space-y-3 max-w-2xl mx-auto">
               <div className="flex justify-between text-sm font-bold text-slate-600 uppercase tracking-wider">
                 <span>Crawling & Auditing...</span>
                 <span>{progress.current} / {progress.total} Pages</span>
               </div>
               <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out"
                   style={{ width: `${(progress.current / progress.total) * 100}%` }}
                 />
               </div>
             </div>
           )}
        </div>

        {error && (
          <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-center animate-in">
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Audit Results Dashboard */}
        {siteAuditResults.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8 mt-12 animate-in">
            {/* Sidebar Navigation */}
            <aside className="lg:w-80 shrink-0">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm sticky top-24 max-h-[calc(100vh-10rem)] flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 px-2 uppercase text-xs tracking-widest text-slate-400">
                  <List size={14} /> Scanned Pages
                </h3>
                <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar">
                  {siteAuditResults.map((res, index) => (
                    <button
                      key={res.url}
                      onClick={() => setSelectedIndex(index)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                        selectedIndex === index ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black truncate mb-1">
                          {new URL(res.url).pathname === '/' ? 'HOME' : new URL(res.url).pathname.toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            res.analysis.score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>{res.analysis.score}</span>
                          <span className="text-[10px] text-slate-400 truncate italic">{res.meta.title}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className={selectedIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} />
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Selected Page Details */}
            <div className="flex-1 min-w-0">
               {selectedReport && <AuditResults report={selectedReport} />}
            </div>
          </div>
        )}

        {/* Empty State Features */}
        {!selectedReport && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <FeatureCard icon={<Zap className="text-amber-500" />} title="Full Site Crawl" description="Finds up to 15 internal links automatically and audits each one sequentially." />
            <FeatureCard icon={<ShieldCheck className="text-emerald-500" />} title="Deep SEO Check" description="Every page gets a detailed analysis of headers, meta tags, and social readiness." />
            <FeatureCard icon={<LayoutDashboard className="text-blue-500" />} title="Dynamic Dashboard" description="Switch between pages instantly using the sidebar to identify site-wide patterns." />
          </div>
        )}
      </div>

      <footer className="mt-auto border-t border-slate-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 SEO Analyser Pro. Performance Site-wide Analysis.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">{icon}</div>
      <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
