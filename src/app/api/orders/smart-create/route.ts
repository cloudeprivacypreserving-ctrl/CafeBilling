import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

/**
 * POST /api/orders/smart-create
 *
 * Smart order creation with automatic continuation logic:
 * - If customer phone exists with PENDING order → add items to existing order
 * - If no active order → create new order
 *
 * Body: {
 *   orderType: 'DINE_IN' | 'TAKEAWAY'
 *   customerName: string
 *   customerPhoneNumber: string (required for continuation logic)
 *   tableNumber?: string (for DINE_IN)
 *   items: Array<{menuItemId, quantity, unitPrice, specialInstructions?}>
 *   paymentMethod?: string
 *   discount?: number
 *   continueExisting?: boolean (if true, will merge with existing PENDING order)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      orderType,
      customerName,
      customerPhoneNumber,
      tableNumber,
      items,
      paymentMethod,
      discount,
      continueExisting = false,
    } = body

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 })
    }

    if (!customerPhoneNumber) {
      return NextResponse.json({ error: 'Customer phone number is required' }, { status: 400 })
    }

    // Step 1: Check for existing PENDING order with same phone number
    const existingPendingOrder = await prisma.order.findFirst({
      where: {
        customerPhoneNumber: customerPhoneNumber.trim(),
        status: 'PENDING',
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

    // Step 2: Prepare order lines
    const newOrderLines = items.map((item: any) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
      specialInstructions: item.specialInstructions,
    }))

    // Step 3: If existing order AND continue flag is true → ADD TO EXISTING
    if (existingPendingOrder && continueExisting) {
      // Add new items to existing order
      await prisma.orderLine.createMany({
        data: newOrderLines.map((line: any) => ({
          ...line,
          orderId: existingPendingOrder.id,
        })),
      })

      // Recalculate totals
      const allOrderLines = await prisma.orderLine.findMany({
        where: { orderId: existingPendingOrder.id },
      })

      const subtotal = allOrderLines.reduce((sum, line) => sum + line.subtotal, 0)
      const discountAmount = Math.round((discount || 0) * 100)
      const afterDiscount = subtotal - discountAmount
      const settings = await prisma.settings.findFirst()
      const taxRate = settings?.taxRate || 0.18
      const tax = Math.round(afterDiscount * taxRate)
      const total = afterDiscount + tax

      // Update order with new totals
      const updatedOrder = await prisma.order.update({
        where: { id: existingPendingOrder.id },
        data: {
          subtotal,
          tax,
          discount: discountAmount,
          total,
          updatedAt: new Date(),
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

      return NextResponse.json({
        order: updatedOrder,
        isNewOrder: false,
        message: `Items added to existing order #${updatedOrder.orderNumber}`,
      })
    }

    // Step 4: CREATE NEW ORDER
    const subtotal = newOrderLines.reduce((sum: number, line: any) => sum + line.subtotal, 0)
    const discountAmount = Math.round((discount || 0) * 100)
    const afterDiscount = subtotal - discountAmount
    const settings = await prisma.settings.findFirst()
    const taxRate = settings?.taxRate || 0.18
    const tax = Math.round(afterDiscount * taxRate)
    const total = afterDiscount + tax

    const newOrder = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        orderType,
        customerName: customerName || `Customer-${customerPhoneNumber}`,
        customerPhoneNumber: customerPhoneNumber.trim(),
        tableNumber,
        paymentMethod,
        subtotal,
        tax,
        discount: discountAmount,
        total,
        status: 'PENDING',
        userId: session.user.id,
        orderLines: {
          create: newOrderLines,
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

    return NextResponse.json({
      order: newOrder,
      isNewOrder: true,
      message: `New order created #${newOrder.orderNumber}`,
    })
  } catch (error) {
    console.error('Error in smart order creation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * GET /api/orders/check-active?phone=customerPhoneNumber
 *
 * Check if customer has an active PENDING order
 * Returns the order details if exists
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const phoneNumber = request.nextUrl.searchParams.get('phone')

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        customerPhoneNumber: phoneNumber.trim(),
        status: 'PENDING',
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

    return NextResponse.json({
      hasActiveOrder: !!existingOrder,
      order: existingOrder || null,
    })
  } catch (error) {
    console.error('Error checking active order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
