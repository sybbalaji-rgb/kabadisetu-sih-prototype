import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel builds the app with native Next.js. Keep Cloudflare/Sites-only
  // worker files out of that build's type-check without changing the Vinext
  // configuration used by the existing hosted Site.
  typescript: {
    tsconfigPath: process.env.VERCEL
      ? "./tsconfig.vercel.json"
      : "./tsconfig.json",
  },
};

export default nextConfig;
