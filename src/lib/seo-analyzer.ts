import { SEOReport } from '@/types/seo';

export function analyzeSEO(data: any): SEOReport {
  const criticalIssues: string[] = [];
  const passedChecks: string[] = [];
  
  const technicalIssues: string[] = [];
  const contentIssues: string[] = [];
  const socialIssues: string[] = [];

  let technicalScore = 100;
  let contentScore = 100;
  let socialScore = 100;

  // Technical Analysis
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

  if (data.metrics.loadTime > 2000) {
    technicalIssues.push(`Page load time is slow (${data.metrics.loadTime}ms)`);
    technicalScore -= 15;
  } else {
    passedChecks.push('Good page load speed');
  }

  // Content Analysis
  if (data.headers.h1.length === 0) {
    contentScore -= 20;
    criticalIssues.push('Exactly one H1 tag is required (None found)');
  } else if (data.headers.h1.length > 1) {
    contentIssues.push(`Multiple H1 tags found (${data.headers.h1.length})`);
    contentScore -= 15;
    criticalIssues.push(`Exactly one H1 tag is required (${data.headers.h1.length} found)`);
  } else {
    passedChecks.push('Exactly one H1 tag');
  }

  if (!data.meta.title) {
    contentIssues.push('Missing Meta Title');
    contentScore -= 20;
    criticalIssues.push('Missing Meta Title');
  } else if (data.meta.title.length < 30 || data.meta.title.length > 60) {
    contentIssues.push('Meta Title length is not optimal (should be 30-60 chars)');
    contentScore -= 5;
  } else {
    passedChecks.push('Good Meta Title');
  }

  if (!data.meta.description) {
    contentIssues.push('Missing Meta Description');
    contentScore -= 15;
    criticalIssues.push('Missing Meta Description');
  } else if (data.meta.description.length < 120 || data.meta.description.length > 160) {
    contentIssues.push('Meta Description length is not optimal (should be 120-160 chars)');
    contentScore -= 5;
  } else {
    passedChecks.push('Good Meta Description');
  }

  if (data.images.missingAlt > 0) {
    contentIssues.push(`${data.images.missingAlt} images are missing alt text`);
    contentScore -= Math.min(data.images.missingAlt * 2, 10);
  } else if (data.images.total > 0) {
    passedChecks.push('All images have alt text');
  }

  if (data.metrics.wordCount < 300) {
    contentIssues.push('Word count is low (less than 300 words)');
    contentScore -= 10;
  } else {
    passedChecks.push('Sufficient word count');
  }

  // Social Analysis
  if (!data.social.ogTitle || !data.social.ogImage) {
    socialIssues.push('Missing Open Graph tags');
    socialScore -= 20;
  } else {
    passedChecks.push('Open Graph tags present');
  }

  if (!data.social.twitterCard) {
    socialIssues.push('Missing Twitter Card tags');
    socialScore -= 10;
  } else {
    passedChecks.push('Twitter Card tags present');
  }

  technicalScore = Math.max(0, technicalScore);
  contentScore = Math.max(0, contentScore);
  socialScore = Math.max(0, socialScore);

  const totalScore = Math.round((technicalScore + contentScore + socialScore) / 3);

  criticalIssues.push(...technicalIssues.filter(i => (i.includes('Missing') || i.includes('slow')) && !criticalIssues.includes(i)));
  criticalIssues.push(...contentIssues.filter(i => i.includes('Missing') && !criticalIssues.includes(i)));

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
