import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all menu items that do not have an inventory record
    const menuItems = await prisma.menuItem.findMany({
      where: {
        inventory: null,
      },
    })

    // Create inventory records for each menu item without one
    const created = await Promise.all(
      menuItems.map((item: any) =>
        prisma.inventoryItem.create({
          data: {
            menuItemId: item.id,
            quantity: 0,
            lowStockThreshold: 10,
          },
        })
      )
    )

    return NextResponse.json({ created: created.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create inventory records' }, { status: 500 })
  }
}
