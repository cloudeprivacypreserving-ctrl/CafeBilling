import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { menuItemsData } from './menu-items.js'

const menuCategories = {
  TODAYS_EXCLUSIVE: "Today's Exclusive Dishes",
  VALUE_MEALS: 'Value Meals',
  COMBOS: 'Combos',
  QUICK_BITES: 'Quick Bites',
  COSY_SPECIAL_SNACKS: 'Cosy Special Snacks',
  BURGERS_PANEER: 'Burgers and Sandwiches - Paneer Burgers',
  GRILLED_SANDWICHES: 'Burgers and Sandwiches - Grilled Sandwiches',
  BURGERS: 'Burgers and Sandwiches - Burgers',
  PIZZA: 'Pizza',
  FRIES: 'Fries',
  HOT_BREW: 'Hot Brew',
  COLD_BREWS: 'Drinks (Beverages) - Cold Brews',
  SHAKES: 'Drinks (Beverages) - Shakes',
  MOCKTAILS: 'Drinks (Beverages) - Mocktails',
  PASTA: 'Pasta',
  MAGGI: 'Maggi',
} as const

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mycafe.com' },
    update: {},
    create: {
      email: 'admin@mycafe.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  })
  console.log('Created admin user:', admin.email)

  // Create cashier user
  const cashierPassword = await bcrypt.hash('cashier123', 10)
  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@mycafe.com' },
    update: {},
    create: {
      email: 'cashier@mycafe.com',
      password: cashierPassword,
      name: 'Cashier',
      role: UserRole.CASHIER,
    },
  })
  console.log('Created cashier user:', cashier.email)

  // Delete existing menu items and categories
  await prisma.orderLine.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()

  // Create categories based on constants
  const categories = []
  let order = 1

  for (const [key, name] of Object.entries(menuCategories)) {
    const category = await prisma.category.create({
      data: {
        name,
        order: order++,
      },
    })
    categories.push(category)
  }

  // Create a map of category names to their IDs
  const categoryMap = categories.reduce<Record<string, string>>((acc, category) => {
    acc[category.name] = category.id
    return acc
  }, {})


  // Add a placeholder image URL for all items
  const placeholderImage = 'https://placehold.co/400x400?text=Coming+Soon'

  // Create all menu items with the placeholder image
  // Create all menu items with the placeholder image
  for (const item of menuItemsData) {
    const { categoryName, ...itemData } = item
    await prisma.menuItem.create({
      data: {
        ...itemData,
        categoryId: categoryMap[categoryName],
        imageUrl: placeholderImage,
      },
    })
    console.log(`Created menu item: ${item.name}`)
  }

  console.log('Created all menu items successfully!')

  // Create settings
  const settings = await prisma.settings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      businessName: 'My Cafe',
      businessAddress: '123 Main Street, City, State 12345',
      businessPhone: '+1 234 567 8900',
      businessEmail: 'info@mycafe.com',
      taxRate: 0.18,
      currency: '₹',
      receiptFooter: 'Thank you for visiting! Visit us again soon.',
      allowDiscounts: true,
    },
  })
  console.log('Created settings')

  console.log('Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
