/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Turbopack from picking the wrong workspace root (e.g. another lockfile)
  // which can lead to missing internal modules like:
  // "@vercel/turbopack-next/internal/font/google/font"
  turbopack: {
    root: __dirname,
  },
  images: {
    // `images.domains` is deprecated in favor of `images.remotePatterns`
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
}

module.exports = nextConfig

