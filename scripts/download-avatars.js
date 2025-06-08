// Script to download avatars from Dicebear API
// Run with: node scripts/download-avatars.js

const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directory if it doesn't exist
const avatarDir = path.join(__dirname, '../public/images/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
  console.log('Created directory:', avatarDir);
}

// Dicebear API URL for avatars
// We'll use a mix of different styles: adventurer, bottts, fun-emoji, pixel-art, etc.
const styles = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'big-ears',
  'bottts',
  'croodles',
  'fun-emoji',
  'pixel-art',
  'identicon',
  'thumbs'
];

// Download an avatar from the given URL and save it to the given path
function downloadAvatar(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download avatar: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', reject);
  });
}

// Generate and download avatars
async function generateAvatars() {
  const totalAvatars = 8; // We'll generate 8 avatars
  
  for (let i = 1; i <= totalAvatars; i++) {
    // Select a random style for each avatar
    const style = styles[Math.floor(Math.random() * styles.length)];
    const seed = `sst-hackers-${i}`; // Use a consistent seed for reproducible results
    
    const url = `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&size=128`;
    const filePath = path.join(avatarDir, `avatar${i}.png`);
    
    try {
      console.log(`Downloading avatar ${i} (style: ${style})...`);
      await downloadAvatar(url, filePath);
      console.log(`Saved avatar ${i} to ${filePath}`);
    } catch (error) {
      console.error(`Error downloading avatar ${i}:`, error.message);
    }
  }
  
  console.log('Done downloading avatars!');
}

// Run the script
generateAvatars().catch(console.error); 