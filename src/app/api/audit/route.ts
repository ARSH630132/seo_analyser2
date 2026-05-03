import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'will', 'have',
  'was', 'are', 'not', 'but', 'can', 'all', 'out', 'into', 'been', 'were',
  'should', 'when', 'what', 'which', 'their', 'about', 'more', 'some', 'than',
  'other', 'then', 'them', 'these', 'only', 'also', 'than', 'into', 'only'
]);

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
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const loadTime = Date.now() - startTime;
    const $ = cheerio.load(html);

    // Meta Data
    const meta = {
      title: $('title').text().trim() || '',
      description: $('meta[name="description"]').attr('content')?.trim() || '',
      canonical: $('link[rel="canonical"]').attr('href') || '',
      favicon: $('link[rel="icon"], link[rel="shortcut icon"]').attr('href') || '',
      language: $('html').attr('lang') || '',
    };

    // Headers
    const headers = {
      h1: $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h2: $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h3: $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h4: $('h4').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h5: $('h5').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      h6: $('h6').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    };

    // Images
    const allImages = $('img');
    const images = {
      total: allImages.length,
      missingAlt: allImages.filter((_, el) => !$(el).attr('alt')).length,
      missingTitle: allImages.filter((_, el) => !$(el).attr('title')).length,
    };

    // Links
    const allLinks = $('a');
    let internal = 0;
    let external = 0;
    let nofollow = 0;

    const targetHostname = new URL(targetUrl).hostname;

    allLinks.each((_, el) => {
      const href = $(el).attr('href');
      const rel = $(el).attr('rel');

      if (rel?.includes('nofollow')) nofollow++;

      if (href) {
        if (href.startsWith('/') || href.startsWith('#') || href.includes(targetHostname)) {
          internal++;
        } else if (href.startsWith('http')) {
          external++;
        }
      }
    });

    const links = {
      total: allLinks.length,
      internal,
      external,
      nofollow,
    };

    // Social
    const social = {
      ogTitle: $('meta[property="og:title"]').attr('content') || '',
      ogDescription: $('meta[property="og:description"]').attr('content') || '',
      ogImage: $('meta[property="og:image"]').attr('content') || '',
      twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
      twitterTitle: $('meta[name="twitter:title"]').attr('content') || '',
      twitterDescription: $('meta[name="twitter:description"]').attr('content') || '',
      twitterImage: $('meta[name="twitter:image"]').attr('content') || '',
    };

    // Metrics
    const textContent = $('body').text();
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
    const textToHtmlRatio = (textContent.length / html.length) * 100;

    // Keyword extraction with stop-word filtering
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

    const metrics = {
      loadTime,
      textToHtmlRatio,
      wordCount,
      topKeywords,
    };

    return NextResponse.json({
      url: targetUrl,
      meta,
      headers,
      images,
      links,
      social,
      metrics,
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    const status = error.name === 'TimeoutError' ? 504 : 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
