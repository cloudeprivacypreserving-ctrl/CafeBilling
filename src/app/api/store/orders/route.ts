import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, total } = body

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        orderType: 'TAKEAWAY',
        subtotal: Math.round(total),
        tax: Math.round(total * 0.18), // 18% GST
        total: Math.round(total * 1.18), // Including tax
        status: 'pending',
        orderLines: {
          create: items.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        orderLines: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}