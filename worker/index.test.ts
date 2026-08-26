import { describe, expect, it } from 'vitest';
import worker, { withSecurityHeaders, type Env } from './index';

describe('Cloudflare Worker', () => {
  it('adds the required security headers without replacing the asset response', async () => {
    const request = new Request('https://mgclimabnu.com.br/login');
    const response = withSecurityHeaders(request, new Response('<!doctype html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }));

    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(response.headers.get('Content-Security-Policy')).toContain('https://*.supabase.co');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('delegates routing and SPA fallback to the configured asset binding', async () => {
    const request = new Request('https://mgclimabnu.com.br/admin');
    const env: Env = {
      ASSETS: { fetch: async () => new Response('SPA shell', { status: 200 }) },
    };

    const response = await worker.fetch(request, env);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('SPA shell');
  });

  it('sets immutable caching only for fingerprinted build assets', () => {
    const asset = withSecurityHeaders(
      new Request('https://mgclimabnu.com.br/assets/index-abc123.js'),
      new Response('asset'),
    );
    const document = withSecurityHeaders(
      new Request('https://mgclimabnu.com.br/'),
      new Response('document'),
    );

    expect(asset.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    expect(document.headers.get('Cache-Control')).toBeNull();
  });
});
