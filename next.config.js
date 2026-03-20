/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.performance = { hints: false }
    return config
  }
}
module.exports = nextConfig
