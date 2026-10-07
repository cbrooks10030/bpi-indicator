/** @type {import('next').NextConfig} */

// Note: the Content-Security-Policy is set per-request in `src/middleware.ts`
// with a fresh nonce, so Next.js can attach that nonce to its own inline
// hydration scripts. A static `script-src 'self'` here would block those
// scripts and break hydration (blank pages), so CSP is intentionally NOT set
// in this static header list.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
