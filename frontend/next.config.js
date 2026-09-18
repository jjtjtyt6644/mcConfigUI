/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    // When deploying to Vercel, set NEXT_PUBLIC_API_URL to your Oracle VM public IP/Domain
    // e.g. http://129.153.x.x:4000
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'
  }
};

module.exports = nextConfig;
