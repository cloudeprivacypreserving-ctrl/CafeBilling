#!/usr/bin/env node

/**
 * Bulk Update Menu Images Script
 * 
 * Usage:
 * 1. Create a JSON file with mapping of menu items to blob URLs
 * 2. Run: node scripts/bulk-update-images.js path/to/mapping.json
 * 
 * Example mapping.json:
 * {
 *   "Aloo Tikki Burger": "https://backend-files.public.blob.vercel-storage.com/menus/AlooTikkiBurger.png",
 *   "Pav Bhaji with Hot Coffee": "https://backend-files.public.blob.vercel-storage.com/menus/PavBhaji.png",
 *   ...
 * }
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function bulkUpdateImages(mappingFile) {
  try {
    // Read the mapping file
    const absolutePath = path.resolve(mappingFile);
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ Mapping file not found: ${absolutePath}`);
      process.exit(1);
    }

    const mappingData = fs.readFileSync(absolutePath, 'utf-8');
    const mapping = JSON.parse(mappingData);

    console.log(`📋 Found ${Object.keys(mapping).length} items to update\n`);

    let updated = 0;
    let failed = 0;
    const results = [];

    for (const [itemName, imageUrl] of Object.entries(mapping)) {
      try {
        // Find menu item by name
        const menuItem = await prisma.menuItem.findFirst({
          where: {
            name: {
              equals: itemName,
              mode: 'insensitive',
            },
          },
        });

        if (!menuItem) {
          console.log(`⚠️  Skipped: "${itemName}" - Menu item not found`);
          results.push({
            name: itemName,
            status: 'skipped',
            reason: 'Menu item not found',
          });
          failed++;
          continue;
        }

        // Update the menu item
        const updated_item = await prisma.menuItem.update({
          where: { id: menuItem.id },
          data: { imageUrl },
        });

        console.log(`✅ Updated: "${itemName}"`);
        results.push({
          name: itemName,
          status: 'updated',
          imageUrl,
          id: menuItem.id,
        });
        updated++;
      } catch (error) {
        console.log(`❌ Error updating "${itemName}": ${error.message}`);
        results.push({
          name: itemName,
          status: 'error',
          error: error.message,
        });
        failed++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed/Skipped: ${failed}`);
    console.log(`${'='.repeat(60)}\n`);

    // Save results to file
    const resultsFile = path.join(
      path.dirname(absolutePath),
      'update-results.json'
    );
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`📁 Results saved to: ${resultsFile}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get mapping file path from command line
const mappingFile = process.argv[2];

if (!mappingFile) {
  console.log(`
Usage: node scripts/bulk-update-images.js <mapping-file>

Example mapping.json file:
{
  "Aloo Tikki Burger": "https://backend-files.public.blob.vercel-storage.com/menus/AlooTikkiBurger.png",
  "Pav Bhaji with Hot Coffee": "https://backend-files.public.blob.vercel-storage.com/menus/PavBhaji.png",
  "4 Aloo Tikki Burger + 2 Fries": "https://backend-files.public.blob.vercel-storage.com/menus/ComboFries.png"
}
`);
  process.exit(1);
}

bulkUpdateImages(mappingFile);
