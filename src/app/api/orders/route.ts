import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      include: {
        orderLines: {
          include: {
            menuItem: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderType, customerName, tableNumber, items, paymentMethod, discount } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 })
    }

    const orderLines = items.map((item: any) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
      specialInstructions: item.specialInstructions,
    }))

    const subtotal = orderLines.reduce((sum: number, line: any) => sum + line.subtotal, 0)
    const discountAmount = Math.round((discount || 0) * 100)
    const afterDiscount = subtotal - discountAmount
    const settings = await prisma.settings.findFirst()
    const taxRate = settings?.taxRate || 0.18
    const tax = Math.round(afterDiscount * taxRate)
    const total = afterDiscount + tax

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        orderType,
        customerName,
        tableNumber,
        paymentMethod,
        subtotal,
        tax,
        discount: discountAmount,
        total,
        status: 'completed',
        userId: session.user.id,
        orderLines: {
          create: orderLines,
        },
      },
      include: {
        orderLines: {
          include: {
            menuItem: {
              include: { category: true },
            },
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

