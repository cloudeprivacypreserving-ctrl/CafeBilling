#!/usr/bin/env node

/**
 * Simple script to download all blob URLs using Vercel Blob client
 */

const { list } = require('@vercel/blob');

async function getBlobUrls() {
  try {
    console.log('📡 Fetching all blob URLs from Vercel Blob storage...\n');

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('❌ BLOB_READ_WRITE_TOKEN not set');
      process.exit(1);
    }

    // Use the @vercel/blob client
    const blobs = await list({ token });
    
    console.log(`✅ Found ${blobs.blobs.length} total files\n`);

    if (blobs.blobs.length === 0) {
      console.log('⚠️  No files found');
      process.exit(1);
    }

    // Display all URLs
    console.log('📋 All Blob URLs:\n');
    const urls = [];
    blobs.blobs.forEach((blob, index) => {
      console.log(`${index + 1}. ${blob.pathname}`);
      console.log(`   ${blob.url}\n`);
      urls.push({ pathname: blob.pathname, url: blob.url });
    });

    // Save to file
    const fs = require('fs');
    const path = require('path');
    
    const urlsFile = path.join(process.cwd(), 'blob-urls-list.txt');
    const urlsContent = urls
      .map(item => `${item.pathname}=${item.url}`)
      .join('\n');
    
    fs.writeFileSync(urlsFile, urlsContent);
    console.log(`📁 URLs saved to: blob-urls-list.txt\n`);

    // Try to create mapping
    try {
      const menuItems = require('../prisma/menu-items.js').menuItemsData;
      const mapping = {};
      const unmatchedFiles = [];

      urls.forEach(item => {
        const filename = item.pathname.split('/').pop().toLowerCase();
        
        const matchedItem = menuItems.find(menu => {
          const itemName = menu.name.toLowerCase();
          const cleanExt = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');
          if (itemName === cleanExt) return true;
          
          const cleanName = itemName.replace(/[^a-z0-9]/g, '');
          const cleanFilename = cleanExt.replace(/[^a-z0-9]/g, '');
          
          return cleanName === cleanFilename || 
                 cleanName.includes(cleanFilename) || 
                 cleanFilename.includes(cleanName);
        });

        if (matchedItem) {
          mapping[matchedItem.name] = item.url;
        } else {
          unmatchedFiles.push(filename);
        }
      });

      const mappingFile = path.join(process.cwd(), 'image-mapping.json');
      fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));

      console.log(`✅ Mapping file created: image-mapping.json`);
      console.log(`   Matched: ${Object.keys(mapping).length} items`);
      console.log(`   Unmatched: ${unmatchedFiles.length} files\n`);

      if (unmatchedFiles.length > 0) {
        console.log('⚠️  Unmatched files:');
        unmatchedFiles.forEach(file => console.log(`   - ${file}`));
        console.log('');
      }

      console.log('📝 Next: node scripts/bulk-update-images.js image-mapping.json\n');

    } catch (menuError) {
      console.log('⚠️  Could not auto-match files');
      console.log('   Manually create image-mapping.json using blob-urls-list.txt\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure @vercel/blob is installed:');
    console.log('npm install @vercel/blob');
    process.exit(1);
  }
}

getBlobUrls();
