#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    const items = await prisma.menuItem.findMany({
      where: {
        imageUrl: {
          not: null,
        },
      },
      select: {
        name: true,
        imageUrl: true,
      },
      take: 5,
    });

    console.log(`✅ Items with images: ${items.length}\n`);
    items.forEach(item => {
      console.log(`Name: ${item.name}`);
      console.log(`URL: ${item.imageUrl}\n`);
    });

    // Check a specific item
    const specific = await prisma.menuItem.findFirst({
      where: { name: '4 Aloo Tikki Burger + 2 Fries' },
      select: { name: true, imageUrl: true },
    });

    console.log('\nSpecific Item: 4 Aloo Tikki Burger + 2 Fries');
    console.log(`Found: ${specific ? 'Yes' : 'No'}`);
    if (specific) {
      console.log(`URL: ${specific.imageUrl || 'NO URL SET'}`);
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkImages();
