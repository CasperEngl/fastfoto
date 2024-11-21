import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "development",
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      ...(process.env.NODE_ENV !== "production"
        ? [
            {
              protocol: "https",
              hostname: "picsum.photos",
              pathname: "/**",
            } as const,
          ]
        : []),
    ],
  },
  compress: false,
  experimental: {
    typedRoutes: true,
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn", "info", "debug", "trace"],
          }
        : undefined,
  },
};

export default withPayload(nextConfig);
