import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'will', 'have',
  'was', 'are', 'not', 'but', 'can', 'all', 'out', 'into', 'been', 'were',
  'should', 'when', 'what', 'which', 'their', 'about', 'more', 'some', 'than',
  'other', 'then', 'them', 'these', 'only', 'also'
]);

/**
 * API Route: Scrapes a single URL and returns raw SEO data.
 * Optimized for Site-wide Audits and Deep Diagnostics.
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    // Basic URL validation
    try {
      new URL(targetUrl);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const startTime = Date.now();
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(12000), // Extended timeout for reliability
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const loadTime = Date.now() - startTime;
    const $ = cheerio.load(html);
    const baseUrl = new URL(targetUrl);

    // Meta Data Extraction with absolute URL normalization
    const meta = {
      title: $('title').text().trim() || '',
      description: $('meta[name="description"]').attr('content')?.trim() || '',
      canonical: $('link[rel="canonical"]').attr('href') || '',
      favicon: normalizeUrl($('link[rel="icon"], link[rel="shortcut icon"]').attr('href'), baseUrl),
      language: $('html').attr('lang') || '',
    };

    // Header Audit Extraction (Complete H1-H6 range)
    const headers = {
      h1: $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h2: $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h3: $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h4: $('h4').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h5: $('h5').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h6: $('h6').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    };

    // Image Audit Logic
    const allImages = $('img');
    const images = {
      total: allImages.length,
      missingAlt: allImages.filter((_, el) => !$(el).attr('alt')).length,
      missingTitle: allImages.filter((_, el) => !$(el).attr('title')).length,
    };

    // Link Audit Logic (Internal vs External separation)
    const allLinks = $('a');
    let internal = 0, external = 0, nofollow = 0;
    const domain = baseUrl.hostname;

    allLinks.each((_, el) => {
      const href = $(el).attr('href');
      const rel = $(el).attr('rel');

      if (rel?.includes('nofollow')) nofollow++;

      if (href) {
        if (href.startsWith('/') || href.startsWith('#') || href.includes(domain)) {
          internal++;
        } else if (href.startsWith('http')) {
          external++;
        }
      }
    });

    // Technical Metrics Calculation
    const textContent = $('body').text() || '';
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
    const textToHtmlRatio = (textContent.length / html.length) * 100;

    // Top Keywords Density logic
    const words = textContent.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w));
      
    const wordFreq: Record<string, number> = {};
    words.forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    // Comprehensive Social SEO Extraction
    const social = {
      ogTitle: $('meta[property="og:title"]').attr('content') || '',
      ogDescription: $('meta[property="og:description"]').attr('content') || '',
      ogImage: normalizeUrl($('meta[property="og:image"]').attr('content'), baseUrl),
      twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
      twitterTitle: $('meta[name="twitter:title"]').attr('content') || '',
      twitterDescription: $('meta[name="twitter:description"]').attr('content') || '',
      twitterImage: normalizeUrl($('meta[name="twitter:image"]').attr('content'), baseUrl),
    };

    return NextResponse.json({
      url: targetUrl,
      meta,
      headers,
      images,
      links: { total: allLinks.length, internal, external, nofollow },
      social,
      metrics: { loadTime, textToHtmlRatio, wordCount, topKeywords },
    });

  } catch (error: any) {
    console.error('Audit Scraper Error:', error);
    return NextResponse.json({ error: error.message || 'Scraper Internal Error' }, { status: 500 });
  }
}

/**
 * Normalizes relative URLs into absolute URLs using the base page domain.
 */
function normalizeUrl(url: string | undefined, base: URL): string {
  if (!url) return '';
  try {
    return new URL(url, base.origin).href;
  } catch (e) {
    return url;
  }
}