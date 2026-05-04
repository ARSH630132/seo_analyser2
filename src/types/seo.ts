/**
 * The core data structure for a single page SEO report.
 * This interface ensures type safety across the Scraper API and the React Frontend.
 */
export interface SEOReport {
  url: string;
  meta: {
    title: string;
    description: string;
    canonical: string;
    favicon: string;
    language: string;
  };
  headers: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  images: {
    total: number;
    missingAlt: number;
    missingTitle: number;
  };
  links: {
    total: number;
    internal: number;
    external: number;
    nofollow: number;
  };
  social: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
  };
  metrics: {
    loadTime: number;
    textToHtmlRatio: number;
    wordCount: number;
    topKeywords: { keyword: string; count: number }[];
  };
  analysis: {
    score: number;
    criticalIssues: string[];
    passedChecks: string[];
    // Added for deep-dive diagnostics
    descriptionLengthStatus: 'short' | 'long' | 'perfect' | 'missing'; 
    categories: {
      technical: { score: number; issues: string[] };
      content: { score: number; issues: string[] };
      social: { score: number; issues: string[] };
    };
  };
}