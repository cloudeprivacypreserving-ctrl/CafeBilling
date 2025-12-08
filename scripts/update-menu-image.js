// Script to update menu item image URL from Vercel Blob
// Usage: node scripts/update-menu-image.js "menu-item-name" "blob-url"

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateMenuImage(itemName, imageUrl) {
  try {
    console.log(`Looking for menu item: "${itemName}"`);
    
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        name: {
          contains: itemName,
          mode: 'insensitive'
        }
      }
    });

    if (!menuItem) {
      console.log('❌ Menu item not found');
      return;
    }

    console.log(`✅ Found menu item: ${menuItem.name} (ID: ${menuItem.id})`);
    
    const updated = await prisma.menuItem.update({
      where: {
        id: menuItem.id
      },
      data: {
        imageUrl: imageUrl
      }
    });

    console.log(`✅ Updated image URL to: ${updated.imageUrl}`);
    console.log('✅ Menu item image updated successfully!');

  } catch (error) {
    console.error('❌ Error updating menu item:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const [,, itemName, imageUrl] = process.argv;

if (!itemName || !imageUrl) {
  console.log('Usage: node scripts/update-menu-image.js "menu-item-name" "blob-url"');
  console.log('Example: node scripts/update-menu-image.js "Aloo Tikki Burger" "https://....blob.vercel-storage.com/..."');
  process.exit(1);
}

updateMenuImage(itemName, imageUrl);