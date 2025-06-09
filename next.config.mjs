/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
  
};

export default nextConfig;
