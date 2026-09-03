interface AssetBinding {
  fetch(request: Request): Promise<Response>;
}

export interface Env {
  ASSETS: AssetBinding;
}

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'sha256-6NSMXHWX/XazqzdHUMkhVYLQ3PkwPfZsyHhVx3tnMok='",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-src 'none'",
  "media-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'accelerometer=(), camera=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

const VERSIONED_ASSET_PATH = /^\/assets\/[^/]+-[a-z0-9_-]{8,}\.(?:css|js|mjs|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf)$/i;
const ASSET_CONTENT_TYPE = /^(?:application\/(?:javascript|wasm)|text\/(?:css|javascript)|image\/(?:png|jpeg|webp|gif|svg\+xml|x-icon)|font\/(?:woff2?|ttf|otf))(?:;|$)/i;

function isVersionedBuildAsset(pathname: string, response: Response, contentType: string): boolean {
  return response.ok
    && VERSIONED_ASSET_PATH.test(pathname)
    && !contentType.includes('text/html')
    && ASSET_CONTENT_TYPE.test(contentType);
}

export function withSecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  const pathname = new URL(request.url).pathname;
  const contentType = headers.get('Content-Type')?.toLowerCase() ?? '';
  if (isVersionedBuildAsset(pathname, response, contentType)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (contentType.includes('text/html')) {
    headers.set('Cache-Control', 'no-cache');
  }

  if (pathname === '/login' || pathname === '/admin' || pathname.startsWith('/admin/')) {
    headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return withSecurityHeaders(request, await env.ASSETS.fetch(request));
  },
};
