import { NextRequest, NextResponse } from "next/server";

// Per-request, nonce-based Content Security Policy. Next.js reads the nonce from
// the request's CSP header and applies it to its own inline hydration scripts,
// so `script-src` can stay strict (no 'unsafe-inline') without breaking
// hydration. `'strict-dynamic'` lets those trusted scripts load the chunks they
// need. Style-src keeps 'unsafe-inline' because Tailwind/Next emit inline styles
// that aren't nonced.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "connect-src 'self' https://api.stripe.com https://discord.com",
    "font-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static assets and the favicon; skip prefetches.
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
