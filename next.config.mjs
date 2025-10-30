import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Avoid __dirname in ESM; use the current working directory instead
    root: process.cwd(),
  }
};

export default nextConfig;
