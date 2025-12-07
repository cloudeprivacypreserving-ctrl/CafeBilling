#!/usr/bin/env node

/**
 * Test upload - Single menu item with blob image URL
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    },
  },
});

async function testUploadSingleMenu() {
  try {
    console.log('🧪 Testing single menu item upload...\n');

    // Get all categories to see what we have
    const categories = await prisma.category.findMany({
      select: { id: true, name: true }
    });

    console.log('📋 Available categories:');
    categories.forEach((cat, i) => {
      console.log(`  ${i + 1}. ${cat.name}`);
    });
    console.log('');

    // Test item - Aloo Tikki Burger with image
    const testItem = {
      name: 'Aloo Tikki Burger',
      description: 'A scrumptious fusion of Indian flavors and burger goodness.',
      price: 7000,
      categoryName: "Today's Exclusive Dishes",
      imageUrl: 'https://i2bdndgexv7dx4eo.public.blob.vercel-storage.com/menus/aloo_single.png'
    };

    console.log('📦 Test item details:');
    console.log(`  Name: ${testItem.name}`);
    console.log(`  Price: ₹${testItem.price / 100}`);
    console.log(`  Category: ${testItem.categoryName}`);
    console.log(`  Image URL: ${testItem.imageUrl}`);
    console.log('');

    // Find the category
    const category = await prisma.category.findFirst({
      where: {
        name: {
          equals: testItem.categoryName,
          mode: 'insensitive'
        }
      }
    });

    if (!category) {
      throw new Error(`Category "${testItem.categoryName}" not found`);
    }

    console.log(`✅ Found category: ${category.name} (ID: ${category.id})\n`);

    // Create the menu item
    const createdItem = await prisma.menuItem.create({
      data: {
        name: testItem.name,
        description: testItem.description,
        price: testItem.price,
        categoryId: category.id,
        imageUrl: testItem.imageUrl,
        available: true,
      },
      include: {
        category: true
      }
    });

    console.log('✨ Menu item created successfully!\n');
    console.log('📊 Created item details:');
    console.log(`  ID: ${createdItem.id}`);
    console.log(`  Name: ${createdItem.name}`);
    console.log(`  Price: ${createdItem.price}`);
    console.log(`  Category: ${createdItem.category.name}`);
    console.log(`  Image URL: ${createdItem.imageUrl}`);
    console.log(`  Available: ${createdItem.available}`);
    console.log(`  Created: ${createdItem.createdAt}`);
    console.log('');

    console.log('✅ Test upload complete!');
    console.log('\n💡 Next steps:');
    console.log('  1. Deploy your app to Vercel');
    console.log('  2. Check if the image loads on the menu page');
    console.log('  3. If it works, run upload-menus-with-images.js for all items');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testUploadSingleMenu();
