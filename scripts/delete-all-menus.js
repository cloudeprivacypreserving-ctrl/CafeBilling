#!/usr/bin/env node

/**
 * Delete all menu items from database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllMenus() {
  try {
    console.log('⚠️  Deleting all menu items...\n');

    // First delete all OrderLines that reference MenuItems
    const deletedOrderLines = await prisma.orderLine.deleteMany({});
    console.log(`✅ Deleted ${deletedOrderLines.count} order lines`);

    // Delete all InventoryItems
    const deletedInventory = await prisma.inventoryItem.deleteMany({});
    console.log(`✅ Deleted ${deletedInventory.count} inventory items`);

    // Delete all MenuItems
    const deletedMenus = await prisma.menuItem.deleteMany({});
    console.log(`✅ Deleted ${deletedMenus.count} menu items\n`);

    console.log('✅ Database cleared! Ready to add menus from UI');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAllMenus();
