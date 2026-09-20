import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    const backendApi = process.env.API_URL || "http://192.168.100.24:8000/api/v1";

    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendApi}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;
