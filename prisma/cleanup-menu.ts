import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting cleanup...')

  // Find all menu items not used in any orders
  const allMenuItems = await prisma.menuItem.findMany()

  let deletedCount = 0
  let keptCount = 0

  for (const item of allMenuItems) {
    // Check if used in any orders
    const orderLinesCount = await prisma.orderLine.count({
      where: { menuItemId: item.id },
    })

    if (orderLinesCount === 0) {
      // Safe to delete
      await prisma.inventoryItem.deleteMany({
        where: { menuItemId: item.id },
      })
      await prisma.menuItem.delete({
        where: { id: item.id },
      })
      console.log(`Deleted: ${item.name}`)
      deletedCount++
    } else {
      console.log(`Kept: ${item.name} (used in ${orderLinesCount} order(s))`)
      keptCount++
    }
  }

  console.log(`\nCleanup complete!`)
  console.log(`Deleted: ${deletedCount} items`)
  console.log(`Kept: ${keptCount} items (used in orders)`)
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
