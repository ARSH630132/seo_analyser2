import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Extensions we want to ignore during a crawl
const IGNORE_EXTENSIONS = /\.(zip|pdf|jpg|jpeg|png|gif|svg|webp|css|js|mp4|mp3|wav|json|xml)$/i;

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

    try {
      const parsedUrl = new URL(targetUrl);
      // Ensure we start with a clean origin + path
      targetUrl = parsedUrl.origin + parsedUrl.pathname; 
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch home page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const links = new Set<string>();
    const baseUrl = new URL(targetUrl);
    const domain = baseUrl.hostname;

    // Start with the home page
    links.add(targetUrl); 

    $('a').each((_, el) => {
      let href = $(el).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      let absoluteUrl = '';
      if (href.startsWith('/')) {
        absoluteUrl = new URL(href, baseUrl.origin).href;
      } else if (href.startsWith('http')) {
        try {
          const linkUrl = new URL(href);
          // Only crawl links on the same domain
          if (linkUrl.hostname === domain || linkUrl.hostname.endsWith('.' + domain)) {
            absoluteUrl = linkUrl.href;
          }
        } catch (e) {}
      }

      if (absoluteUrl) {
        const cleaned = cleanUrl(absoluteUrl);
        // Filter out non-HTML assets
        if (!IGNORE_EXTENSIONS.test(cleaned)) {
          links.add(cleaned);
        }
      }
    });

    // Return unique links, capped at 15 for performance
    const uniqueLinks = Array.from(links).slice(0, 15);
    return NextResponse.json({ links: uniqueLinks });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Crawl Failed' }, { status: 500 });
  }
}

function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = ''; // Remove fragments
    return u.origin + u.pathname.replace(/\/$/, ''); // Normalize trailing slash
  } catch (e) {
    return url;
  }
}