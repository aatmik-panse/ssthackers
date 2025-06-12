/** @type {import('next').NextConfig} */
import Beasties from 'beasties';

// Create a custom Beasties plugin for Next.js
function createBeastiesPlugin(options = {}) {
  const defaultOptions = {
    // Only include critical CSS
    pruneSource: true,
    // Reduce the size of the critical CSS
    compress: true,
    // Preload strategy
    preload: 'media',
    // Add noscript fallback
    noscriptFallback: true,
    // Inline critical fonts
    fonts: true,
    // Log level
    logLevel: 'info'
  };
  
  const beastiesOptions = { ...defaultOptions, ...options };
  
  return {
    name: 'beasties-plugin',
    apply(compiler) {
      compiler.hooks.emit.tapPromise('BeastiesPlugin', async compilation => {
        try {
          const beasties = new Beasties(beastiesOptions);
          
          // Find HTML assets
          const htmlAssets = Object.keys(compilation.assets).filter(file => file.endsWith('.html'));
          
          for (const htmlFile of htmlAssets) {
            const asset = compilation.assets[htmlFile];
            const html = asset.source().toString();
            
            // Find CSS assets
            const cssAssets = Object.keys(compilation.assets)
              .filter(file => file.endsWith('.css'))
              .map(file => compilation.assets[file].source().toString());
            
            // Process with Beasties
            const processed = await beasties.process(html, { css: cssAssets });
            
            // Update the asset
            compilation.assets[htmlFile] = {
              source: () => processed,
              size: () => processed.length
            };
          }
        } catch (error) {
          console.error('Beasties plugin error:', error);
        }
      });
    }
  };
}

const nextConfig = {
  // Enable experimental server/client components
  experimental: {
    // Enable optimizeCss with Beasties
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Improve image loading
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'robohash.org' },
      { protocol: 'https', hostname: 'gravatar.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'imgur.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'avatar.iran.liara.run' },
    ],
  },
  
  // Cache and reduce server computation
  poweredByHeader: false,
  compress: true, // Enable gzip compression
};

// Only add webpack config when not using Turbopack
if (process.env.NEXT_RUNTIME !== 'edge') {
  nextConfig.webpack = (config, { dev, isServer }) => {
    // Only add Beasties plugin in production build
    if (!dev && !isServer) {
      config.plugins.push(createBeastiesPlugin());
    }
    return config;
  };
}

export default nextConfig;
