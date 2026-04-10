const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v2/:path*",
        destination: `${backendOrigin}/api/v2/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
