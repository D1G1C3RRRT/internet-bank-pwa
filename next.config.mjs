/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-label',
      'clsx',
      'tailwind-merge'
    ],
  },
}

export default nextConfig
