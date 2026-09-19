import site from '../site.config.json';

// ADR 0001: nothing under worker/ imports from astro or from src/. The Worker
// reads site.config.json by relative path, which is why that file is plain JSON.
// scripts/validate.mjs fails the build if this is ever broken.

export interface Env {
  /** The built site in dist/, served before this Worker ever runs. */
  ASSETS: Fetcher;
  DB: D1Database;
  PHOTOS: R2Bucket;
  LEAD_RATE_LIMIT: RateLimit;

  TURNSTILE_SECRET_KEY: string;
  PUSHOVER_APP_TOKEN: string;
  PUSHOVER_USER_KEY: string;
  RESEND_API_KEY: string;
}

function notImplemented(what: string): Response {
  return new Response(
    `${what} is not built yet on ${site.business.name}'s site.\n`,
    { status: 501, headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    // Lead capture: Turnstile, honeypot, time-trap, rate limit, magic-byte photo
    // checks, the R2 stream, the D1 insert, then Pushover and Resend.
    if (pathname === '/api/lead') {
      if (request.method !== 'POST') {
        return new Response(null, { status: 405, headers: { allow: 'POST' } });
      }
      return notImplemented('Lead capture');
    }

    // The Contractor's Lead list: server-rendered HTML, no client framework, no
    // build step, behind Cloudflare Access.
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return notImplemented('The Lead admin page');
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
