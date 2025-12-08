const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const total = await prisma.menuItem.count()
  const available = await prisma.menuItem.count({ where: { available: true } })
  const unavailable = await prisma.menuItem.count({ where: { available: false } })

  console.log('\n=== Menu Item Count ===')
  console.log('Total menu items:', total)
  console.log('Available (available: true):', available)
  console.log('Unavailable (available: false):', unavailable)
  console.log('\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
