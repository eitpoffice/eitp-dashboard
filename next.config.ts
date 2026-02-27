import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // This acts as a bridge. The user's ISP sees your domain, 
        // but Vercel secretly forwards the request to Supabase.
        source: '/api/supabase/:path*',
        destination: 'https://segxzbqltuumivgqpkcb.supabase.co/:path*',
      },
    ];
  },
};

export default nextConfig;
