import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // applies to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval'
                https://www.gstatic.com
                https://www.googleapis.com
                https://apis.google.com;
              connect-src 'self'
                https://*.googleapis.com
                https://*.firebaseio.com
                https://securetoken.googleapis.com;
              img-src 'self' data: blob:;
              style-src 'self' 'unsafe-inline';
              font-src 'self' https://fonts.gstatic.com;
              frame-src https://*.firebaseapp.com https://apis.google.com;
            `.replace(/\s{2,}/g, " "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
