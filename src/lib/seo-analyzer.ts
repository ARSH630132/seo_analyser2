import { SEOReport } from '@/types/seo';

/**
 * Analyzes raw scraped data and generates a comprehensive SEO report with deep-dive diagnostics.
 * This function handles scoring and populates reasonings for every deduction.
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
    const issue = 'Missing Canonical tag';
    technicalIssues.push(issue);
    technicalScore -= 10;
    criticalIssues.push(issue);
  } else {
    passedChecks.push('Canonical tag present');
  }

  if (!data.meta.favicon) {
    technicalIssues.push('Missing Favicon');
    technicalScore -= 5;
  }

  if (data.metrics.loadTime > 2000) {
    const issue = `Page load time is slow (${data.metrics.loadTime}ms)`;
    technicalIssues.push(issue);
    technicalScore -= 15;
  } else {
    passedChecks.push('Good page load speed');
  }

  // --- Content Analysis: Detailed H1 Audit ---
  if (data.headers.h1.length === 0) {
    const issue = 'Exactly one H1 tag is required (None found)';
    contentIssues.push(issue);
    contentScore -= 20;
    criticalIssues.push(issue);
  } else if (data.headers.h1.length > 1) {
    const issue = `Exactly one H1 tag is required (${data.headers.h1.length} found)`;
    contentIssues.push(issue);
    contentScore -= 15;
    criticalIssues.push(issue);
  } else {
    passedChecks.push('Exactly one H1 tag found');
  }

  // --- Meta Description: Smart Validation ---
  let descriptionLengthStatus: 'short' | 'long' | 'perfect' | 'missing' = 'missing';
  if (!data.meta.description) {
    const issue = 'Missing Meta Description';
    contentIssues.push(issue);
    contentScore -= 15;
    criticalIssues.push(issue);
    descriptionLengthStatus = 'missing';
  } else {
    const len = data.meta.description.length;
    if (len < 120) {
      contentIssues.push(`Meta Description is too short (${len} chars)`);
      contentScore -= 5;
      descriptionLengthStatus = 'short';
    } else if (len > 160) {
      contentIssues.push(`Meta Description is too long (${len} chars)`);
      contentScore -= 5;
      descriptionLengthStatus = 'long';
    } else {
      passedChecks.push('Perfect Meta Description length');
      descriptionLengthStatus = 'perfect';
    }
  }

  if (data.images.missingAlt > 0) {
    contentIssues.push(`${data.images.missingAlt} images are missing alt text`);
    contentScore -= Math.min(data.images.missingAlt * 2, 10);
  }

  // Normalize Scores
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
      descriptionLengthStatus,
      categories: {
        technical: { score: technicalScore, issues: technicalIssues },
        content: { score: contentScore, issues: contentIssues },
        social: { score: socialScore, issues: socialIssues },
      },
    },
  };
}