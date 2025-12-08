#!/usr/bin/env node

/**
 * List All Blobs Script
 * 
 * Lists all files and folders in your Vercel Blob storage
 * 
 * Usage:
 * node scripts/list-all-blobs.js
 */

const https = require('https');

async function listAllBlobs() {
  try {
    console.log('📡 Listing all blobs in your Vercel Blob storage...\n');

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable not set');
      process.exit(1);
    }

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

            if (blobs.length === 0) {
              console.log('⚠️  No files found in Blob storage');
              process.exit(0);
            }

            console.log(`✅ Found ${blobs.length} total files\n`);
            console.log('📋 All files and folders:\n');

            // Group by folder
            const folders = {};
            blobs.forEach(blob => {
              const parts = blob.pathname.split('/');
              const folder = parts[0] || 'root';
              
              if (!folders[folder]) {
                folders[folder] = [];
              }
              folders[folder].push(blob);
            });

            // Display organized by folder
            Object.keys(folders).sort().forEach(folder => {
              console.log(`📁 ${folder}/`);
              folders[folder].forEach(blob => {
                const filename = blob.pathname.replace(`${folder}/`, '');
                console.log(`   - ${filename}`);
                console.log(`     ${blob.url}`);
              });
              console.log('');
            });

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

listAllBlobs().catch(error => {
  console.error('❌ Failed to list blobs:', error);
  process.exit(1);
});
