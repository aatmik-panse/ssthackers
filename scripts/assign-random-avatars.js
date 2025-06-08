// Script to assign random avatars to users in the database
// Run with: node scripts/assign-random-avatars.js

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Define User schema
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  image: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Get avatar paths
const avatarDir = path.join(__dirname, '../public/images/avatars');
const avatarFiles = fs.readdirSync(avatarDir)
  .filter(file => file.startsWith('avatar') && file.endsWith('.png'))
  .map(file => `/images/avatars/${file}`);

// Function to assign random avatars to users
async function assignRandomAvatars() {
  try {
    // Get all users without an avatar
    const users = await User.find({ $or: [{ image: null }, { image: { $exists: false } }] });
    
    console.log(`Found ${users.length} users without avatars`);
    
    if (users.length === 0) {
      console.log('No users to update');
      return;
    }
    
    // Update each user with a random avatar
    for (const user of users) {
      const randomAvatar = avatarFiles[Math.floor(Math.random() * avatarFiles.length)];
      
      await User.updateOne(
        { _id: user._id },
        { $set: { image: randomAvatar } }
      );
      
      console.log(`Assigned ${randomAvatar} to user ${user.name} (${user.email})`);
    }
    
    console.log('Done assigning avatars!');
  } catch (error) {
    console.error('Error assigning avatars:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the script
assignRandomAvatars(); 