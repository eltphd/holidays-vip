import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The home route reads the static Winter Light page from disk at request time.
  outputFileTracingIncludes: { "/": ["./src/winter-light/**"] },
};

export default nextConfig;
