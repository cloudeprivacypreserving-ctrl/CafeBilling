import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { search } = Object.fromEntries(request.nextUrl.searchParams.entries())

    let where = {}
    if (search && search.trim() !== '') {
      where = {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, categoryId, imageUrl, available } = body

    // Create the menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Math.round(price * 100), // Convert to paise/cents
        categoryId,
        imageUrl,
        available: available ?? true,
      },
      include: { category: true },
    })

    // Create associated inventory item
    await prisma.inventoryItem.create({
      data: {
        menuItemId: menuItem.id,
        quantity: 0,
        lowStockThreshold: 10,
      },
    })

    return NextResponse.json(menuItem)
  } catch (error: any) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      {
        error: 'Failed to create menu item',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
