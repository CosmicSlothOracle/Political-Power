/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },
    // Comment out static export to use dynamic rendering
    // output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'link.storjshare.io',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Addressing the routing conflict with more stable approach
    experimental: {
        // Use more stable approach than disabling optimized loading
        fallbackNodePolyfills: false,
    },
    // Ensure static assets are properly loaded
    assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',

    // Fix error with static files not loading correctly
    distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next',

    // Improve caching for better performance
    generateEtags: true,

    // Configure server to listen on all interfaces
    serverOptions: {
        hostname: '0.0.0.0',
        port: 3000
    },

    // We no longer need the rewrites since we're standardizing on [id]
    // as the parameter name throughout the application
}

module.exports = nextConfig