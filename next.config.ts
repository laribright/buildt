import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: "/@:username/:projectSlug",
        destination: "/project/:username/:projectSlug",
      },
    ];
  },
};

export default nextConfig;
