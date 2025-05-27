import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { parse } from 'node-html-parser';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const CACHE_TTL = 24 * 60 * 60;

const MIN_CONTENT_LENGTH = 100;

export async function POST(request: NextRequest) {
  try {
    const { url, description } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    }

    const key = `scrape:${url}`;
    const cached = await redis.get<{
      title: string | null | undefined;
      content: string | null | undefined;
    }>(key);

    if (cached) {
      return NextResponse.json(cached);
    }

    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        Referer: new URL(url).origin,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      },
      timeout: 10000,
      maxRedirects: 5
    });

    const root = parse(html);

    const title =
      root.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      root.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
      root.querySelector('title')?.text ||
      '';

    let content = '';
    const possibleContentSelectors = [
      'article',
      '.article',
      '.post',
      '.content',
      '#content',
      '.article-container',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main',
      '[role="main"]'
    ];

    for (const selector of possibleContentSelectors) {
      const element = root.querySelector(selector);

      if (element) {
        element
          .querySelectorAll(
            'script, style, nav, header, footer, .comments, .sidebar, .ad, .advertisement'
          )
          .forEach((el) => el.remove());
        content = element.text.trim();
      }

      if (content.length >= MIN_CONTENT_LENGTH) break;
    }

    if (!content || content.length < MIN_CONTENT_LENGTH) {
      const body = root.querySelector('body');
      if (body) {
        body.querySelectorAll('script, style, nav, header, footer').forEach((el) => el.remove());
        content = body.text.trim();
      }
    }

    if (!content) content = description;

    const result = { title, content: content.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim() };

    await redis.set(key, result, { ex: CACHE_TTL });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error scraping URL:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.statusText || error.message;
      return NextResponse.json(
        {
          message: `Failed to scrape URL: ${message}`,
          status,
          url: error.config?.url
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json({ message: 'Error scraping URL' }, { status: 500 });
  }
}
