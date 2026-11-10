import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// In development, Next.js requires 'unsafe-eval' for Hot Module Replacement (HMR) and source map callstack reconstruction.
// In production, 'unsafe-eval' is excluded for strict XSS protection.
const scriptSrcDirectives = isDev
  ? "script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  : "script-src 'self' 'unsafe-inline';";

const cspHeader = `
  default-src 'self';
  ${scriptSrcDirectives}
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();


const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

