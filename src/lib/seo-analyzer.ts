import { SEOReport } from '@/types/seo';

/**
 * Analyzes raw scraped data and generates a comprehensive SEO report with scores and issues.
 */
export function analyzeSEO(data: any): SEOReport {
  const criticalIssues: string[] = [];
  const passedChecks: string[] = [];
  
  const technicalIssues: string[] = [];
  const contentIssues: string[] = [];
  const socialIssues: string[] = [];

  let technicalScore = 100;
  let contentScore = 100;
  let socialScore = 100;

  // --- Technical Analysis ---
  if (!data.meta.canonical) {
    technicalIssues.push('Missing Canonical tag');
    technicalScore -= 10;
  } else {
    passedChecks.push('Canonical tag present');
  }

  if (!data.meta.favicon) {
    technicalIssues.push('Missing Favicon');
    technicalScore -= 5;
  } else {
    passedChecks.push('Favicon present');
  }

  if (!data.meta.language) {
    technicalIssues.push('Missing HTML language attribute');
    technicalScore -= 5;
  } else {
    passedChecks.push('Language attribute defined');
  }

  if (data.metrics.loadTime > 1500) {
    technicalIssues.push(`Page load time is slow (${data.metrics.loadTime}ms)`);
    technicalScore -= 15;
  } else {
    passedChecks.push('Excellent page load speed');
  }

  if (data.metrics.textToHtmlRatio < 10) {
    technicalIssues.push(`Low text-to-HTML ratio (${data.metrics.textToHtmlRatio.toFixed(2)}%)`);
    technicalScore -= 5;
  } else {
    passedChecks.push('Healthy text-to-HTML ratio');
  }

  // --- Content Analysis ---
  if (data.headers.h1.length === 0) {
    contentScore -= 20;
    criticalIssues.push('Missing H1 tag (Exactly one required)');
  } else if (data.headers.h1.length > 1) {
    contentIssues.push(`Multiple H1 tags found (${data.headers.h1.length})`);
    contentScore -= 15;
    criticalIssues.push(`Too many H1 tags (${data.headers.h1.length} found)`);
  } else {
    passedChecks.push('Perfect H1 tag structure');
  }

  if (!data.meta.title) {
    contentIssues.push('Missing Meta Title');
    contentScore -= 20;
    criticalIssues.push('Missing Meta Title');
  } else if (data.meta.title.length < 30 || data.meta.title.length > 65) {
    contentIssues.push('Meta Title length is not optimal (30-65 characters)');
    contentScore -= 10;
  } else {
    passedChecks.push('Meta Title is optimized');
  }

  if (!data.meta.description) {
    contentIssues.push('Missing Meta Description');
    contentScore -= 15;
    criticalIssues.push('Missing Meta Description');
  } else if (data.meta.description.length < 120 || data.meta.description.length > 160) {
    contentIssues.push('Meta Description length should be 120-160 characters');
    contentScore -= 5;
  } else {
    passedChecks.push('Meta Description is optimized');
  }

  if (data.images.missingAlt > 0) {
    contentIssues.push(`${data.images.missingAlt} images are missing alt text`);
    contentScore -= Math.min(data.images.missingAlt * 2, 15);
    criticalIssues.push('Images missing ALT attributes');
  } else if (data.images.total > 0) {
    passedChecks.push('All images have descriptive alt text');
  }

  if (data.metrics.wordCount < 300) {
    contentIssues.push('Content is too thin (less than 300 words)');
    contentScore -= 15;
  } else {
    passedChecks.push('Substantial content word count');
  }

  // --- Social Analysis ---
  if (!data.social.ogTitle || !data.social.ogImage) {
    socialIssues.push('Missing Open Graph (OG) tags');
    socialScore -= 20;
    criticalIssues.push('Social sharing tags missing');
  } else {
    passedChecks.push('Open Graph tags are present');
  }

  if (!data.social.twitterCard) {
    socialIssues.push('Missing Twitter Card configuration');
    socialScore -= 10;
  } else {
    passedChecks.push('Twitter Card configuration present');
  }

  // Final Scoring
  technicalScore = Math.max(0, technicalScore);
  contentScore = Math.max(0, contentScore);
  socialScore = Math.max(0, socialScore);
  const totalScore = Math.round((technicalScore + contentScore + socialScore) / 3);

  return {
    ...data,
    analysis: {
      score: totalScore,
      criticalIssues: Array.from(new Set(criticalIssues)),
      passedChecks,
      categories: {
        technical: { score: technicalScore, issues: technicalIssues },
        content: { score: contentScore, issues: contentIssues },
        social: { score: socialScore, issues: socialIssues },
      },
    },
  };
}