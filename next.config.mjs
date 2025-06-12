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
    // Only include specific export files from these packages
  },
  
  // Improve image loading
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
    domains: [
      'api.dicebear.com',    // For placeholder avatars
      'avatars.githubusercontent.com', // For GitHub avatars
      'lh3.googleusercontent.com',    // For Google avatars
      'robohash.org',        // For RoboHash avatars
      'gravatar.com',        // For Gravatar
      'i.pravatar.cc',       // For Pravatar
      'res.cloudinary.com',  // For Cloudinary
      'images.unsplash.com', // For Unsplash
      'imgur.com',           // For Imgur
      'i.imgur.com',         // For Imgur
      'cdn.jsdelivr.net',    // For jsDelivr
      'avatar.iran.liara.run'
    ],
  },
  
  // Cache and reduce server computation
  poweredByHeader: false,
  compress: true, // Enable gzip compression
  
  // Add webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Only add Beasties plugin in production build
    if (!dev && !isServer) {
      config.plugins.push(createBeastiesPlugin());
    }
    return config;
  },
};

export default nextConfig;
