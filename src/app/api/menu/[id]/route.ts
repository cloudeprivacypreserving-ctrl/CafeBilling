import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { 
        category: true,
        orderLines: true
      },
    })

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    // Calculate rating based on order history (for demo purposes)
    const orderCount = menuItem.orderLines.length
    const rating = orderCount > 0 ? 4 + Math.random() : undefined
    const ratingCount = orderCount > 0 ? orderCount * 2 : undefined

    // Remove orderLines from response
    const { orderLines, ...itemWithoutOrders } = menuItem

    return NextResponse.json({
      ...itemWithoutOrders,
      rating,
      ratingCount,
      orderCount
    })
  } catch (error: any) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch menu item',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, categoryId, imageUrl, available } = body

    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: Math.round(price * 100),
        categoryId,
        imageUrl,
        available: available ?? true,
      },
      include: { category: true },
    })

    return NextResponse.json(menuItem)
  } catch (error: any) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ 
      error: 'Failed to update menu item',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the menu item is used in any orders
    const orderLinesCount = await prisma.orderLine.count({
      where: { menuItemId: params.id },
    })

    if (orderLinesCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete menu item',
        details: `This item has been used in ${orderLinesCount} order(s). Please deactivate it instead.`
      }, { status: 400 })
    }

    // Delete associated inventory item first
    await prisma.inventoryItem.deleteMany({
      where: { menuItemId: params.id },
    })

    // Then delete the menu item
    await prisma.menuItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ 
      error: 'Failed to delete menu item',
      details: error.message 
    }, { status: 500 })
  }
}

