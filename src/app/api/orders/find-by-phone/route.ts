import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Find existing active orders by customer phone number
 * Used to determine if customer can add items to existing order
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, orderType } = await req.json()

    // Validate phone number
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      return NextResponse.json(
        { error: 'Valid phone number required (minimum 10 digits)' },
        { status: 400 }
      )
    }

    // Find active order (PENDING or IN_PROGRESS status)
    const existingOrder = await prisma.order.findFirst({
      where: {
        customerPhoneNumber: phoneNumber.trim(),
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
        // Optionally filter by order type (DINE_IN or TAKEAWAY)
        ...(orderType && { orderType }),
      },
      include: {
        orderLines: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    if (existingOrder) {
      return NextResponse.json({
        found: true,
        order: {
          id: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          customerName: existingOrder.customerName,
          subtotal: existingOrder.subtotal,
          tax: existingOrder.tax,
          total: existingOrder.total,
          itemCount: existingOrder.orderLines.length,
          status: existingOrder.status,
          createdAt: existingOrder.createdAt,
        },
      })
    }

    return NextResponse.json({
      found: false,
      message: 'No active order found for this phone number',
    })
  } catch (error) {
    console.error('Error finding order:', error)
    return NextResponse.json({ error: 'Failed to search for existing order' }, { status: 500 })
  }
}
