/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // swcMinify: true,
    webpack: (config) => {
        config.module.rules.push({
          test: /\.node/,
          use: 'raw-loader',
        });
     
        return config;
    },
    async rewrites() {
        return [
            {
                source: '/dicom/files',
                destination: 'http://localhost:5000/dicom/files', // Proxy đến backend
            },
        ];
    },
    experimental: {
      proxyTimeout: 600000,
    }
}

module.exports = nextConfig
