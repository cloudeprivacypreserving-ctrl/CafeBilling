import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, total, customerPhoneNumber, existingOrderId, orderType } = body

    // If adding to existing order
    if (existingOrderId) {
      const existingOrder = await prisma.order.findUnique({
        where: { id: existingOrderId },
        include: { orderLines: true },
      })

      if (!existingOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Add new items to existing order
      await prisma.orderLine.createMany({
        data: items.map((item: any) => ({
          orderId: existingOrderId,
          menuItemId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.price * item.quantity,
        })),
      })

      // Recalculate totals for the order
      const allOrderLines = await prisma.orderLine.findMany({
        where: { orderId: existingOrderId },
      })

      const newSubtotal = allOrderLines.reduce((sum, line) => sum + line.subtotal, 0)
      const newTax = Math.round(newSubtotal * 0.18)
      const newTotal = newSubtotal + newTax

      const updatedOrder = await prisma.order.update({
        where: { id: existingOrderId },
        data: {
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal,
          status: 'IN_PROGRESS',
        },
        include: {
          orderLines: {
            include: {
              menuItem: true,
            },
          },
        },
      })

      return NextResponse.json({
        order: updatedOrder,
        isExistingOrder: true,
        message: 'Items added to existing order',
      })
    }

    // Create new order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        orderType: orderType || 'TAKEAWAY',
        customerPhoneNumber: customerPhoneNumber?.trim() || null,
        subtotal: Math.round(total),
        tax: Math.round(total * 0.18), // 18% GST
        total: Math.round(total * 1.18), // Including tax
        status: 'PENDING',
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

    return NextResponse.json({
      order,
      isExistingOrder: false,
      message: 'New order created',
    })
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
