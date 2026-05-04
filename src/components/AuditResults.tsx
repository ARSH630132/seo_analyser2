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
  Image as ImageIcon,
  Type,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Globe,
  X
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
          <div>
            <h2 className="text-2xl font-bold text-slate-800 break-all">{report.url}</h2>
            <p className="text-slate-500 mt-1">{meta.title}</p>
          </div>
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
          {/* Critical Issues */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={20} />
              Critical Issues ({analysis.criticalIssues.length})
            </h3>
            {analysis.criticalIssues.length > 0 ? (
              <ul className="space-y-4">
                {analysis.criticalIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl text-rose-700 text-sm font-medium">
                    <ChevronRight size={16} className="mt-0.5 shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm bg-emerald-50 p-4 rounded-2xl">No critical issues found!</p>
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

        {/* Category Scores */}
        <div className="space-y-6">
          <CategoryCard title="Technical" score={analysis.categories.technical.score} icon={<ShieldCheck className="text-blue-500" />} />
          <CategoryCard title="Content" score={analysis.categories.content.score} icon={<Layout className="text-purple-500" />} />
          <CategoryCard title="Social" score={analysis.categories.social.score} icon={<Share2 className="text-pink-500" />} />
        </div>
      </div>

      {/* Detailed Data View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DataCard title="Meta Data" icon={<Layout size={18} />}>
          <DataItem label="Title" value={meta.title} />
          <DataItem label="Description" value={meta.description} />
          <DataItem label="Canonical" value={meta.canonical} />
        </DataCard>

        <DataCard title="Headers" icon={<Type size={18} />}>
          <div className="grid grid-cols-3 gap-2">
            <HeaderCount label="H1" count={headers.h1.length} />
            <HeaderCount label="H2" count={headers.h2.length} />
            <HeaderCount label="H3" count={headers.h3.length} />
          </div>
          <button onClick={() => setShowHeaders(!showHeaders)} className="w-full mt-4 py-2 px-4 text-xs font-semibold bg-slate-50 rounded-xl flex items-center justify-between">
            {showHeaders ? 'Hide Content' : 'Show Content'}
            {showHeaders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showHeaders && <div className="mt-4 text-sm text-slate-600 italic">{headers.h1[0]}</div>}
        </DataCard>

        <DataCard title="Media & Links" icon={<ImageIcon size={18} />}>
          <DataRow label="Missing Alt Text" value={images.missingAlt} critical={images.missingAlt > 0} />
          <DataRow label="Internal Links" value={links.internal} />
          <DataRow label="External Links" value={links.external} />
        </DataCard>
      </div>

      {/* Social SEO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><Share2 size={18} /> Social SEO</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SocialSection title="Open Graph" icon={<Globe size={14} />} items={[{ label: 'OG Title', value: social.ogTitle }]} />
          <SocialSection title="Twitter Card" icon={<X size={14} />} items={[{ label: 'Card Type', value: social.twitterCard }]} />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl">
      <p className="text-xs font-semibold text-slate-400 uppercase">{label}</p>
      <p className="text-lg font-bold text-slate-700">{value}</p>
    </div>
  );
}

function CategoryCard({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">{icon} <span className="font-bold text-slate-700">{title}</span></div>
      <span className="text-lg font-bold text-blue-600">{score}%</span>
    </div>
  );
}

function DataCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
      <h4 className="font-bold text-slate-800 flex items-center gap-2">{icon} {title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-sm text-slate-600 truncate">{value || 'Not found'}</p>
    </div>
  );
}

function DataRow({ label, value, critical }: { label: string; value: number; critical?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${critical ? 'text-rose-500' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}

function HeaderCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-slate-50 p-2 rounded-xl text-center">
      <p className="text-[10px] font-bold text-slate-400">{label}</p>
      <p className="font-bold text-slate-700">{count}</p>
    </div>
  );
}

function SocialSection({ title, icon, items }: { title: string; icon: React.ReactNode; items: { label: string; value: string }[] }) {
  return (
    <div className="space-y-4">
      <h5 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">{icon} {title}</h5>
      {items.map((item, i) => <DataItem key={i} label={item.label} value={item.value} />)}
    </div>
  );
}