import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo root, so globals.css can import the shared brand/tokens.css
  // (D-04). Turbopack refuses files outside its root otherwise.
  turbopack: { root: path.join(__dirname, "..") },
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
