/** @type {import('next').NextConfig} */
const nextConfig = {
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
