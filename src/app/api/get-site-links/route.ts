import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

/**
 * Common file extensions to ignore during site-wide SEO crawling.
 * We only want to audit HTML pages, not static assets or binary files.
 */
const IGNORE_EXTENSIONS = /\.(zip|pdf|jpg|jpeg|png|gif|svg|webp|css|js|mp4|mp3|wav|json|xml|exe|dmg|iso|gz|tar|xlsx|docx)$/i;

/**
 * API Route: Extracts unique internal links from a home page.
 * Used for initiating the site-wide audit flow (Sequential crawling).
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

    try {
      const parsedUrl = new URL(targetUrl);
      // Normalize target URL to ensure we start from a clean origin + path
      targetUrl = parsedUrl.origin + (parsedUrl.pathname === '/' ? '' : parsedUrl.pathname);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(12000), // Standard 12s timeout for crawlers
    });

    if (!response.ok) {
      throw new Error(`Primary page fetch failed: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const links = new Set<string>();
    const baseUrl = new URL(targetUrl);
    const domain = baseUrl.hostname;

    // The current page is always included as the first audit target
    links.add(cleanUrl(targetUrl)); 

    $('a').each((_, el) => {
      let href = $(el).attr('href');
      
      // Skip empty, fragments, and non-navigational links
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      let absoluteUrl = '';
      if (href.startsWith('/')) {
        // Handle relative links by joining with origin
        absoluteUrl = new URL(href, baseUrl.origin).href;
      } else if (href.startsWith('http')) {
        try {
          const linkUrl = new URL(href);
          // Only crawl internal links (same domain or subdomain)
          if (linkUrl.hostname === domain || linkUrl.hostname.endsWith('.' + domain)) {
            absoluteUrl = linkUrl.href;
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }

      if (absoluteUrl) {
        const cleaned = cleanUrl(absoluteUrl);
        // Ensure we don't crawl non-HTML assets based on extension filtering
        if (!IGNORE_EXTENSIONS.test(cleaned)) {
          links.add(cleaned);
        }
      }
    });

    // Return unique internal links, capped at 15 for crawler performance and politeness
    const uniqueLinks = Array.from(links).slice(0, 15);

    return NextResponse.json({ 
      links: uniqueLinks,
      count: uniqueLinks.length,
      domain: domain
    });

  } catch (error: any) {
    console.error('Link Extraction Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to crawl site links' 
    }, { status: 500 });
  }
}

/**
 * Normalizes URLs by removing fragments and trailing slashes for canonical comparison.
 */
function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = ''; // Remove fragments (SEO treats them as the same page)
    // Remove trailing slash for consistency (canonicalization)
    return u.origin + u.pathname.replace(/\/$/, '');
  } catch (e) {
    return url;
  }
}