/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
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
