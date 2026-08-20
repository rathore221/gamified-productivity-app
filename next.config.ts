import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__clerk/:path*",
        destination: "https://frontend-api.clerk.dev/:path*",
      },
    ]
  },
}

export default nextConfig