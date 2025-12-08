#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

console.log('🔍 Debug Database Connection Info\n');
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
console.log('PRISMA_DATABASE_URL:', process.env.PRISMA_DATABASE_URL?.substring(0, 50) + '...');
console.log('\n');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkDatabase() {
  try {
    console.log('⏳ Connecting to database...\n');
    
    // Get counts from all tables
    const menuItems = await prisma.menuItem.findMany({ select: { id: true } });
    const orderLines = await prisma.orderLine.findMany({ select: { id: true } });
    const inventoryItems = await prisma.inventoryItem.findMany({ select: { id: true } });
    const categories = await prisma.category.findMany({ select: { id: true } });
    
    console.log('📊 Current Database State:');
    console.log(`  - Menu Items: ${menuItems.length}`);
    console.log(`  - Order Lines: ${orderLines.length}`);
    console.log(`  - Inventory Items: ${inventoryItems.length}`);
    console.log(`  - Categories: ${categories.length}\n`);

    if (menuItems.length > 0) {
      console.log('First 5 menu items:');
      menuItems.slice(0, 5).forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.id}`);
      });
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
