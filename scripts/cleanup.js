const fs = require('fs');
const path = require('path');

// Files to clean up
const filesToCleanup = [
  path.join(__dirname, '../public/index.html'),
  path.join(__dirname, '../public/styles.css'),
  path.join(__dirname, '../public/processed.html')
];

// Clean up files
filesToCleanup.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`Deleted: ${file}`);
    } catch (error) {
      console.error(`Error deleting ${file}:`, error);
    }
  }
});

console.log('Cleanup complete!'); 