/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Mongoose and other Node.js packages need to stay server-side
  serverExternalPackages: ['mongoose'],

  // Optimize images if needed in future
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
