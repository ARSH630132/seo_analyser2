'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import AuditResults from '@/components/AuditResults';
import { SEOReport } from '@/types/seo';
import { analyzeSEO } from '@/lib/seo-analyzer';
import { LayoutDashboard, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const [report, setReport] = useState<SEOReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (url: string) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze website');
      }

      const analyzedReport = analyzeSEO(data);
      setReport(analyzedReport);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">SEO Auditor</h1>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <span className="text-sm font-medium text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">Documentation</span>
              <span className="text-sm font-medium text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">API</span>
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Hero */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Optimize your website for <span className="text-blue-600">Search Engines</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get a comprehensive SEO audit in seconds. Identify critical issues, analyze content, and improve your ranking.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={loading} />

        {/* Error State */}
        {error && (
          <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-center animate-in slide-in-from-top-4 duration-300">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Results Area */}
        <div className="mt-12">
          {loading && !report && (
            <div className="space-y-8">
              <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 bg-slate-200 rounded-3xl animate-pulse" />
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {report && <AuditResults report={report} />}

          {!report && !loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <FeatureCard 
                icon={<Zap className="text-amber-500" />}
                title="Lightning Fast"
                description="Our scraper analyzes your website in milliseconds using high-performance Node.js logic."
              />
              <FeatureCard 
                icon={<ShieldCheck className="text-emerald-500" />}
                title="Comprehensive"
                description="Analyzes meta data, header structure, images, links, and social SEO tags."
              />
              <FeatureCard 
                icon={<LayoutDashboard className="text-blue-500" />}
                title="Detailed Insights"
                description="Receive a scoring breakdown and a list of critical issues to fix immediately."
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 SEO Auditor Tool. Built with Next.js, Tailwind, and Cheerio.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
