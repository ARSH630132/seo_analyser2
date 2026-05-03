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
  X
} from 'lucide-react';

interface AuditResultsProps {
  report: SEOReport;
}

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
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Load Time</p>
              <p className="text-lg font-bold text-slate-700">{metrics.loadTime}ms</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Words</p>
              <p className="text-lg font-bold text-slate-700">{metrics.wordCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Images</p>
              <p className="text-lg font-bold text-slate-700">{images.total}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Links</p>
              <p className="text-lg font-bold text-slate-700">{links.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Critical Issues & Passed Checks */}
        <div className="lg:col-span-2 space-y-8">
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
              <p className="text-slate-500 text-sm bg-emerald-50 p-4 rounded-2xl">No critical issues found! Great job.</p>
            )}
          </section>

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

        {/* Categories Sidebar */}
        <div className="space-y-6">
          <CategoryCard 
            title="Technical" 
            score={analysis.categories.technical.score} 
            icon={<ShieldCheck className="text-blue-500" size={20} />} 
          />
          <CategoryCard 
            title="Content" 
            score={analysis.categories.content.score} 
            icon={<Layout className="text-purple-500" size={20} />} 
          />
          <CategoryCard 
            title="Social" 
            score={analysis.categories.social.score} 
            icon={<Share2 className="text-pink-500" size={20} />} 
          />
        </div>
      </div>

      {/* Detailed Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Meta Data */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Layout size={18} className="text-slate-400" /> Meta Data
          </h4>
          <div className="space-y-3">
            <DataItem label="Title" value={meta.title} />
            <DataItem label="Description" value={meta.description} />
            <DataItem label="Canonical" value={meta.canonical} />
            <DataItem label="Language" value={meta.language} />
            <DataItem label="Favicon" value={meta.favicon} />
          </div>
        </div>

        {/* Content Details */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Type size={18} className="text-slate-400" /> Headers
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <HeaderCount label="H1" count={headers.h1.length} />
            <HeaderCount label="H2" count={headers.h2.length} />
            <HeaderCount label="H3" count={headers.h3.length} />
            <HeaderCount label="H4" count={headers.h4.length} />
            <HeaderCount label="H5" count={headers.h5.length} />
            <HeaderCount label="H6" count={headers.h6.length} />
          </div>
          
          <button 
            onClick={() => setShowHeaders(!showHeaders)}
            className="w-full py-2 px-4 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-between"
          >
            {showHeaders ? 'Hide Header Content' : 'Show Header Content'}
            {showHeaders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHeaders && (
            <div className="space-y-3 pt-2 max-h-60 overflow-y-auto">
              {headers.h1.length > 0 && <DataItem label="H1 Content" value={headers.h1.join(' | ')} />}
              {headers.h2.length > 0 && <DataItem label="H2 Content" value={headers.h2.slice(0, 3).join(' | ') + (headers.h2.length > 3 ? '...' : '')} />}
              <DataItem label="Top Keywords" value={metrics.topKeywords.map(k => `${k.keyword} (${k.count})`).join(', ')} />
            </div>
          )}

          {!showHeaders && (
             <div className="mt-4">
                <DataItem label="Top Keywords" value={metrics.topKeywords.map(k => `${k.keyword} (${k.count})`).join(', ')} />
             </div>
          )}
        </div>

        {/* Images & Links */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
             <ImageIcon size={18} className="text-slate-400" /> Media & Links
          </h4>
          <div className="space-y-3">
            <DataRow label="Missing Alt Text" value={images.missingAlt} critical={images.missingAlt > 0} />
            <DataRow label="Missing Title Tags" value={images.missingTitle} warning={images.missingTitle > 0} />
            <DataRow label="Internal Links" value={links.internal} />
            <DataRow label="External Links" value={links.external} />
            <DataRow label="Nofollow Links" value={links.nofollow} />
          </div>
        </div>
      </div>

      {/* Social SEO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Share2 size={18} className="text-slate-400" /> Social SEO
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h5 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
              <Globe size={14} /> Open Graph (Facebook)
            </h5>
            <div className="space-y-3">
              <DataItem label="OG Title" value={social.ogTitle} />
              <DataItem label="OG Description" value={social.ogDescription} />
              {social.ogImage && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">OG Image</p>
                  <p className="text-xs text-slate-500 break-all">{social.ogImage}</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
              <X size={14} /> Twitter Card
            </h5>
            <div className="space-y-3">
              <DataItem label="Twitter Card Type" value={social.twitterCard} />
              <DataItem label="Twitter Title" value={social.twitterTitle} />
              <DataItem label="Twitter Description" value={social.twitterDescription} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold text-slate-700">{title}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-lg font-bold ${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{score}%</span>
        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
            style={{ width: `${score}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className="text-sm text-slate-600 line-clamp-2 break-all">{value || <span className="text-slate-300 italic">Not found</span>}</p>
    </div>
  );
}

function DataRow({ label, value, critical, warning }: { label: string; value: number | string; critical?: boolean; warning?: boolean }) {
  const colorClass = critical ? 'text-rose-500' : warning ? 'text-amber-500' : 'text-slate-700';
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}

function HeaderCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-slate-50 p-2 rounded-xl flex flex-col items-center">
      <span className="text-[10px] font-bold text-slate-400">{label}</span>
      <span className="font-bold text-slate-700">{count}</span>
    </div>
  );
}
