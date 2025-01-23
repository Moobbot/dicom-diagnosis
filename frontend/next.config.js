/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // swcMinify: true,

    webpack: (config) => {
        // resolve fs for one of the dependencies
        config.resolve.fallback = {
          fs: false,
        }
    
        // loading our wasm files as assets
        config.module.rules.push({
          test: /\.wasm/,
          type: "asset/resource",
        })
    
        return config
    },

    experimental: {
      serverActions: {
        bodySizeLimit: '1024mb',
      },
    },
}

module.exports = nextConfig