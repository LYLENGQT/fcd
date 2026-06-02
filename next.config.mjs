/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage public bucket (logos, athlete photos, content images)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
