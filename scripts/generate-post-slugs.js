const { MongoClient } = require('mongodb');

// Utility function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50) // Limit to 50 characters
}

// Utility function to generate random string
function generateRandomString(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generatePostSlugs() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const postsCollection = db.collection('posts');

    // Find all posts without slugs
    const postsWithoutSlugs = await postsCollection.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    }).toArray();

    console.log(`Found ${postsWithoutSlugs.length} posts without slugs`);

    if (postsWithoutSlugs.length === 0) {
      console.log('All posts already have slugs!');
      return;
    }

    const usedSlugs = new Set();
    let updatedCount = 0;

    for (const post of postsWithoutSlugs) {
      const baseSlug = generateSlug(post.title);
      let finalSlug = `${baseSlug}-${generateRandomString()}`;
      
      // Ensure uniqueness
      let counter = 0;
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${generateRandomString()}`;
        counter++;
        if (counter > 10) {
          // After 10 attempts, add timestamp to ensure uniqueness
          finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
          break;
        }
      }
      
      usedSlugs.add(finalSlug);

      // Update the post with the new slug
      await postsCollection.updateOne(
        { _id: post._id },
        { $set: { slug: finalSlug } }
      );

      updatedCount++;
      console.log(`Updated post "${post.title}" with slug: ${finalSlug}`);
    }

    console.log(`Successfully updated ${updatedCount} posts with slugs!`);

  } catch (error) {
    console.error('Error generating post slugs:', error);
  } finally {
    await client.close();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env' });

generatePostSlugs(); 