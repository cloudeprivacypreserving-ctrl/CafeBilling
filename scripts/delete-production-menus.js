#!/usr/bin/env node

/**
 * Delete all menu items from Vercel production database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL || process.env.DATABASE_URL, // Uses Vercel production URL from .env
    },
  },
});

async function deleteAllMenus() {
  try {
    console.log('⚠️  Connecting to production database...\n');

    // First delete all OrderLines that reference MenuItems
    const deletedOrderLines = await prisma.orderLine.deleteMany({});
    console.log(`✅ Deleted ${deletedOrderLines.count} order lines`);

    // Delete all InventoryItems
    const deletedInventory = await prisma.inventoryItem.deleteMany({});
    console.log(`✅ Deleted ${deletedInventory.count} inventory items`);

    // Delete all MenuItems
    const deletedMenus = await prisma.menuItem.deleteMany({});
    console.log(`✅ Deleted ${deletedMenus.count} menu items\n`);

    console.log('✅ Production database cleared!');
    console.log('📝 Now you can add menus from the admin UI\n');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAllMenus();
