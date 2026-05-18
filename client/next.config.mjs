import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next-build",
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    const backendApiBaseUrl = apiBaseUrl.replace(/\/$/, "");

    return [
      {
        source: "/api/public/:path*",
        destination: `${backendApiBaseUrl}/public/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    // Keep builds compatible with locked-down environments that restrict process spawning.
    cpus: 1,
    workerThreads: true,
  },
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
