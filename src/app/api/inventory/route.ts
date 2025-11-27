import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      include: { menuItem: true },
    })
    console.log('Inventory items fetched:', inventory.length)
    console.log('Sample item:', inventory[0] || 'No items')
    // Filter out items with missing menuItem
    const validInventory = inventory.filter((item) => item.menuItem !== null)
    console.log('Valid items (with menuItem):', validInventory.length)
    return NextResponse.json(validInventory)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 })
  }
}
