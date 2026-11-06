import type { NextConfig } from "next";

// Static demo: all data is client-side sample data, so Cache Components / PPR are not needed.
const nextConfig: NextConfig = {
  // `npm run export` builds plain static files into ./out (for Cloudflare Workers static assets / Pages).
  ...(process.env.STATIC_EXPORT ? { output: "export" as const, trailingSlash: true } : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
