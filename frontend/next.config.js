/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ['localhost', 'api.afrihub.africa', 'afrihub.africa'] },
  env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL }
}
module.exports = nextConfig
