/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.licdn.com" },
      { protocol: "https", hostname: "**.linkedin.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async redirects() {
    // In development, we skip the waitlist redirect so we can work on the site
    if (process.env.NODE_ENV === 'development') {
      return [];
    }

    return [
      {
        source: '/',
        destination: '/waitlist',
        permanent: false, // Temporary redirect
      },
    ];
  },
  // Proxy PostHog through our own domain to bypass ad blockers
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
    ];
  },
};

export default nextConfig;
