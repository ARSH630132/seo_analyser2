'use client';

import React, { useState } from 'react';
import { SEOReport } from '@/types/seo';
import ScoreCircle from './ScoreCircle';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Layout, 
  Share2, 
  Clock, 
  Link2, 
  Image as ImageIcon,
  Type,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Globe,
  X,
  Info,
  AlertTriangle
} from 'lucide-react';

interface AuditResultsProps { report: SEOReport; }

export default function AuditResults({ report }: AuditResultsProps) {
  const { analysis, meta, metrics, images, links, headers, social } = report;
  const [showHeaders, setShowHeaders] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Overview Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-12">
        <ScoreCircle score={analysis.score} />
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 break-all">{report.url}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             <MetricBox label="Load Time" value={`${metrics.loadTime}ms`} />
             <MetricBox label="Words" value={metrics.wordCount} />
             <MetricBox label="Images" value={images.total} />
             <MetricBox label="Links" value={links.total} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Critical Issues with Detailed H1 Diagnostic */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={20} />
              Critical Issues ({analysis.criticalIssues.length})
            </h3>
            {analysis.criticalIssues.length > 0 ? (
              <ul className="space-y-4">
                {analysis.criticalIssues.map((issue, i) => (
                  <li key={i} className="flex flex-col gap-2 p-4 bg-rose-50 rounded-2xl">
                    <div className="flex items-start gap-3 text-rose-700 text-sm font-medium">
                      <ChevronRight size={16} className="mt-0.5 shrink-0" />
                      {issue}
                    </div>
                    {/* H1 Deep-Dive: Shows exactly which headers are causing the 'Multiple H1' issue */}
                    {issue.includes('H1') && headers.h1.length > 1 && (
                      <div className="ml-7 mt-1 space-y-1.5">
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Extra H1 Tags Detected:</p>
                        {headers.h1.map((h, idx) => (
                          <div key={idx} className="text-xs text-rose-600 bg-white/50 p-2 rounded-lg border border-rose-100 italic truncate">
                             &quot;{h}&quot;
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm bg-emerald-50 p-4 rounded-2xl">No critical issues found! Great job.</p>
            )}
          </section>

          {/* Passed Checks */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} />
              Passed Checks ({analysis.passedChecks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.passedChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  {check}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Categories with 'Why the Score?' Reasoning */}
        <div className="space-y-6">
          <CategoryCard 
            title="Technical" 
            score={analysis.categories.technical.score} 
            issues={analysis.categories.technical.issues}
            icon={<ShieldCheck className="text-blue-500" size={20} />} 
          />
          <CategoryCard 
            title="Content" 
            score={analysis.categories.content.score} 
            issues={analysis.categories.content.issues}
            icon={<Layout className="text-purple-500" size={20} />} 
          />
          <CategoryCard 
            title="Social" 
            score={analysis.categories.social.score} 
            issues={analysis.categories.social.issues}
            icon={<Share2 className="text-pink-500" size={20} />} 
          />
        </div>
      </div>

      {/* Detailed Data View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Meta Data with Smart Validation and Character Counter */}
        <DataCard title="Meta Data" icon={<Layout size={18} className="text-slate-400" />}>
          <DataItem label="Title" value={meta.title} />
          
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2">
              Description
              {analysis.descriptionLengthStatus === 'perfect' ? (
                <CheckCircle2 size={12} className="text-emerald-500" />
              ) : analysis.descriptionLengthStatus === 'missing' ? (
                <X size={12} className="text-rose-500" />
              ) : (
                <AlertTriangle size={12} className="text-amber-500" />
              )}
            </p>
            <div className={`p-3 rounded-xl border text-sm ${
              analysis.descriptionLengthStatus === 'perfect' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              analysis.descriptionLengthStatus === 'missing' ? 'bg-rose-50 border-rose-100 text-rose-800' :
              'bg-amber-50 border-amber-100 text-amber-800'
            }`}>
              {meta.description || <span className="italic opacity-60">Not found</span>}
              {meta.description && (
                <p className="text-[10px] mt-2 font-bold opacity-60 uppercase tracking-widest">
                  Length: {meta.description.length} chars (Ideal: 120-160)
                </p>
              )}
            </div>
          </div>
          
          <DataItem label="Canonical" value={meta.canonical} />
        </DataCard>

        {/* Headers and Top Keywords */}
        <DataCard title="Headers" icon={<Type size={18} className="text-slate-400" />}>
          <div className="grid grid-cols-3 gap-2">
            <HeaderCount label="H1" count={headers.h1.length} warning={headers.h1.length > 1} critical={headers.h1.length === 0} />
            <HeaderCount label="H2" count={headers.h2.length} />
            <HeaderCount label="H3" count={headers.h3.length} />
          </div>
          
          <button 
            onClick={() => setShowHeaders(!showHeaders)}
            className="w-full mt-4 py-2 px-4 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-between"
          >
            {showHeaders ? 'Hide Detailed Info' : 'Show Header Content'}
            {showHeaders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHeaders && (
            <div className="mt-4 space-y-3 pt-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
               {headers.h1.length > 0 && <DataItem label="Primary H1" value={headers.h1[0]} />}
               {headers.h2.length > 0 && <DataItem label="Top H2" value={headers.h2[0]} />}
               <DataItem label="Top Keywords" value={metrics.topKeywords.map(k => `${k.keyword} (${k.count})`).join(', ')} />
            </div>
          )}
        </DataCard>

        {/* Media & Links Audit */}
        <DataCard title="Media & Links" icon={<ImageIcon size={18} className="text-slate-400" />}>
          <DataRow label="Missing Alt Text" value={images.missingAlt} critical={images.missingAlt > 0} />
          <DataRow label="Missing Title Tags" value={images.missingTitle} warning={images.missingTitle > 0} />
          <DataRow label="Internal Links" value={links.internal} />
          <DataRow label="External Links" value={links.external} />
          <DataRow label="Nofollow Links" value={links.nofollow} />
        </DataCard>
      </div>
    </div>
  );
}

// --- Helper UI Components ---

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl">
      <p className="text-xs font-semibold text-slate-400 uppercase">{label}</p>
      <p className="text-lg font-bold text-slate-700">{value}</p>
    </div>
  );
}

function CategoryCard({ title, score, icon, issues }: { title: string; score: number; icon: React.ReactNode; issues: string[] }) {
  const [showIssues, setShowIssues] = useState(false);
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-bold text-slate-700">{title}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-lg font-bold ${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{score}%</span>
          <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
      {issues.length > 0 && (
        <div className="pt-2 border-t border-slate-50">
          <button onClick={() => setShowIssues(!showIssues)} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase hover:text-blue-500 transition-colors">
            <Info size={12} /> {showIssues ? 'Hide Reasoning' : 'Why the Score?'}
          </button>
          {showIssues && (
            <ul className="mt-3 space-y-2 animate-in slide-in-from-top-2">
              {issues.map((issue, i) => (
                <li key={i} className="text-xs text-slate-500 flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1 shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function DataCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
      <h4 className="font-bold text-slate-800 flex items-center gap-2">{icon} {title}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-sm text-slate-600 line-clamp-3 break-all">{value || <span className="italic opacity-40">Not found</span>}</p>
    </div>
  );
}

function DataRow({ label, value, critical, warning }: { label: string; value: number | string; critical?: boolean; warning?: boolean }) {
  const colorClass = critical ? 'text-rose-500' : warning ? 'text-amber-500' : 'text-slate-700';
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}

function HeaderCount({ label, count, warning, critical }: { label: string; count: number; warning?: boolean; critical?: boolean }) {
  const colorClass = critical ? 'text-rose-500 bg-rose-50 border-rose-200' : warning ? 'text-amber-500 bg-amber-50 border-amber-200' : 'text-slate-700 bg-slate-50 border-transparent';
  return (
    <div className={`p-2 rounded-xl flex flex-col items-center border transition-all ${colorClass}`}>
      <span className="text-[10px] font-bold opacity-60 uppercase">{label}</span>
      <span className="font-bold">{count}</span>
    </div>
  );
}
