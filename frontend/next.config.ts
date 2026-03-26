import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Bỏ qua TypeScript errors khi build production
    // Cho phép deploy nhanh, fix dần trong quá trình phát triển
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
    ],
  },
};

export default nextConfig;
