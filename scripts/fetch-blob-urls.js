#!/usr/bin/env node

/**
 * Fetch All Blob URLs Script
 * 
 * This script fetches all images from your Vercel Blob storage
 * and creates a mapping file for bulk image updates
 * 
 * Usage:
 * node scripts/fetch-blob-urls.js
 * 
 * Requirements:
 * - BLOB_READ_WRITE_TOKEN environment variable must be set
 * - Run this in your project root
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

async function fetchBlobUrls() {
  try {
    console.log('📡 Fetching all blob URLs from Vercel Blob storage...\n');

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable not set');
      console.log('\nTo get your token:');
      console.log('1. Go to https://vercel.com → Storage → Blob');
      console.log('2. Click "Settings" on your blob store');
      console.log('3. Copy the "Read/Write Token"');
      console.log('4. Run: set BLOB_READ_WRITE_TOKEN=your_token_here');
      process.exit(1);
    }

    // List all blobs in the menus folder
    const url = 'https://blob.vercel-storage.com/list';
    
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      https.get(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            const blobs = response.blobs || [];

            console.log(`✅ Found ${blobs.length} total blobs\n`);

            if (blobs.length === 0) {
              console.log('⚠️  No images found in Blob storage');
              process.exit(1);
            }

            // Extract URLs (handle all blobs, remove folder prefix if present)
            const urls = blobs.map(blob => ({
              filename: blob.pathname.includes('/') 
                ? blob.pathname.split('/').pop() 
                : blob.pathname,
              fullPath: blob.pathname,
              url: blob.url,
            }));

            // Display all URLs
            console.log('📋 All Blob URLs:\n');
            urls.forEach((item, index) => {
              console.log(`${index + 1}. ${item.filename}`);
              console.log(`   ${item.url}\n`);
            });

            // Create URLs list file
            const urlsFile = path.join(process.cwd(), 'blob-urls-list.txt');
            const urlsContent = urls
              .map(item => `${item.filename}=${item.url}`)
              .join('\n');
            
            fs.writeFileSync(urlsFile, urlsContent);
            console.log(`📁 URLs saved to: blob-urls-list.txt\n`);

            // Create a template mapping file
            try {
              const menuItems = require('../prisma/menu-items.js').menuItemsData;
              const mapping = {};
              const unmatchedFiles = [];

              // Try to match filenames to menu items
              urls.forEach(urlItem => {
                const filename = urlItem.filename.toLowerCase();
                
                // Find matching menu item
                const matchedItem = menuItems.find(item => {
                  const itemName = item.name.toLowerCase();
                  // Try exact match first
                  const cleanExt = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');
                  if (itemName === cleanExt) return true;
                  
                  // Try to match by removing special characters
                  const cleanName = itemName.replace(/[^a-z0-9]/g, '');
                  const cleanFilename = cleanExt.replace(/[^a-z0-9]/g, '');
                  
                  return cleanName === cleanFilename || 
                         cleanName.includes(cleanFilename) || 
                         cleanFilename.includes(cleanName);
                });

                if (matchedItem) {
                  mapping[matchedItem.name] = urlItem.url;
                } else {
                  unmatchedFiles.push(urlItem.filename);
                }
              });

              // Save mapping file
              const mappingFile = path.join(process.cwd(), 'image-mapping.json');
              fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));

              console.log(`✅ Mapping file created: image-mapping.json`);
              console.log(`   Matched: ${Object.keys(mapping).length} items`);
              console.log(`   Unmatched: ${unmatchedFiles.length} files\n`);

              if (unmatchedFiles.length > 0) {
                console.log('⚠️  Unmatched files (you may need to map manually):');
                unmatchedFiles.forEach(file => console.log(`   - ${file}`));
                console.log('');
              }
            } catch (menuError) {
              // If menu-items.js doesn't exist, just save URLs
              console.log('⚠️  Could not load menu items for auto-matching');
              console.log('   Manually create image-mapping.json using blob-urls-list.txt as reference\n');
            }

            console.log('📝 Next steps:');
            console.log('1. Review image-mapping.json');
            console.log('2. Run: node scripts/bulk-update-images.js image-mapping.json\n');

          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fetchBlobUrls().catch(error => {
  console.error('❌ Failed to fetch blob URLs:', error);
  process.exit(1);
});
