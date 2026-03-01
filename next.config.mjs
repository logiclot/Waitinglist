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
};

export default nextConfig;
