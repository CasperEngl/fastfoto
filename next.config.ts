import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/RCTzZXemGnZ1AmuAKKJB5DW3SKvZIMPy6Edotmcef1VTGxLg/**",
      },
    ],
  },
};

export default nextConfig;
