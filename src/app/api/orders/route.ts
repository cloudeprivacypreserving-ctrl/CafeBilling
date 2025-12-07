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
    const {
      orderType,
      customerName,
      customerPhoneNumber,
      tableNumber,
      items,
      paymentMethod,
      discount,
      existingOrderId, // If customer is adding to existing order
    } = body

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

    // If existingOrderId provided, add items to existing order
    if (existingOrderId) {
      // Verify the existing order belongs to same customer
      const existingOrder = await prisma.order.findUnique({
        where: { id: existingOrderId },
        include: { orderLines: true },
      })

      if (!existingOrder) {
        return NextResponse.json({ error: 'Existing order not found' }, { status: 404 })
      }

      // Add new items to existing order
      await prisma.orderLine.createMany({
        data: orderLines.map((line: any) => ({
          ...line,
          orderId: existingOrderId,
        })),
      })

      // Recalculate order totals
      const allOrderLines = await prisma.orderLine.findMany({
        where: { orderId: existingOrderId },
      })

      const newSubtotal = allOrderLines.reduce((sum, line) => sum + line.subtotal, 0)
      const newAfterDiscount = newSubtotal - discountAmount
      const newTax = Math.round(newAfterDiscount * taxRate)
      const newTotal = newAfterDiscount + newTax

      const updatedOrder = await prisma.order.update({
        where: { id: existingOrderId },
        data: {
          subtotal: newSubtotal,
          tax: newTax,
          discount: discountAmount,
          total: newTotal,
          status: 'IN_PROGRESS',
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
        message: 'Items added to existing order successfully',
        isExistingOrder: true,
      })
    }

    // Create new order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        orderType,
        customerName,
        customerPhoneNumber: customerPhoneNumber?.trim() || null,
        tableNumber,
        paymentMethod,
        subtotal,
        tax,
        discount: discountAmount,
        total,
        status: 'PENDING',
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

    return NextResponse.json({
      order,
      message: 'New order created successfully',
      isExistingOrder: false,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
