import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import worker, { withSecurityHeaders, type Env } from './index';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');

function responseFor(pathname: string, contentType = 'text/html; charset=utf-8') {
  return withSecurityHeaders(
    new Request(`https://mgclimabnu.com.br${pathname}`),
    new Response('<!doctype html>', { headers: { 'Content-Type': contentType } }),
  );
}

describe('Cloudflare Worker', () => {
  it('adds the required security headers without replacing the asset response', async () => {
    const response = responseFor('/');

    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
    expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('Permissions-Policy')).toBe('accelerometer=(), camera=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin-allow-popups');
  });

  it('authorizes exactly the current JSON-LD and rejects unsafe script directives', () => {
    const jsonLd = html.split('<script type="application/ld+json">')[1]?.split('</script>')[0];
    expect(jsonLd).toBeTruthy();
    const expectedHash = createHash('sha256').update(jsonLd).digest('base64');
    const csp = responseFor('/').headers.get('Content-Security-Policy') ?? '';

    expect(csp).toContain(`'sha256-${expectedHash}'`);
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toMatch(/(?:^|\s)\*(?:\s|;|$)/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain('https://*.supabase.co');
    expect(csp).toContain('wss://*.supabase.co');
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

  it.each(['/login', '/admin', '/admin/portfolio'])('prevents indexing of private route %s', (pathname) => {
    expect(responseFor(pathname).headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('does not prevent indexing of the public page', () => {
    expect(responseFor('/').headers.get('X-Robots-Tag')).toBeNull();
  });

  it('sets immutable caching only for versioned build assets', () => {
    const asset = responseFor('/assets/index-abc123.js', 'application/javascript');
    const document = responseFor('/');

    expect(asset.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    expect(document.headers.get('Cache-Control')).toBe('no-cache');
  });
});
