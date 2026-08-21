// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(__dirname, '..');
const headers = readFileSync(resolve(projectRoot, 'public/_headers'), 'utf8');
const html = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');

describe('headers de segurança do Cloudflare', () => {
  it.each([
    'Content-Security-Policy:',
    'Strict-Transport-Security: max-age=31536000; includeSubDomains',
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy:',
    'X-Frame-Options: DENY',
    'Cross-Origin-Opener-Policy: same-origin-allow-popups',
  ])('inclui %s', (header) => {
    expect(headers).toContain(header);
  });

  it('mantém a CSP sem curingas e sem execução insegura de scripts', () => {
    const csp = headers.split('\n').find(line => line.includes('Content-Security-Policy:')) ?? '';
    expect(csp).not.toMatch(/(?:^|\s)\*(?:\s|;|$)/);
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it('autoriza exatamente o conteúdo atual do JSON-LD por hash SHA-256', () => {
    const jsonLd = html.split('<script type="application/ld+json">')[1]?.split('</script>')[0];
    expect(jsonLd).toBeTruthy();
    const hash = createHash('sha256').update(jsonLd).digest('base64');
    expect(headers).toContain(`'sha256-${hash}'`);
  });
});
