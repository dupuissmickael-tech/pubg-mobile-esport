import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'liquipedia.net'
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co'
      }
    ]
  }
};

export default withNextIntl(nextConfig);
