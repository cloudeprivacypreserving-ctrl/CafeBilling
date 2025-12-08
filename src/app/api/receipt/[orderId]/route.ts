import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'
import { formatCurrency } from '@/lib/utils'

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        orderLines: {
          include: {
            menuItem: true,
          },
        },
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const settings = await prisma.settings.findFirst()
    const businessName = settings?.businessName || 'My Cafe'
    const businessAddress = settings?.businessAddress || ''
    const businessPhone = settings?.businessPhone || ''

    // Generate PDF
    const doc = new PDFDocument({ size: [300, 800], margin: 20 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))

    // Header
    doc.fontSize(18).text(businessName, { align: 'center' })
    doc.moveDown(0.5)
    if (businessAddress) doc.fontSize(10).text(businessAddress, { align: 'center' })
    if (businessPhone) doc.fontSize(10).text(`Tel: ${businessPhone}`, { align: 'center' })
    doc.moveDown()
    doc.fontSize(8).text('--------------------------------', { align: 'center' })
    doc.moveDown(0.5)

    // Order Info
    doc.fontSize(10).text(`Order #: ${order.orderNumber}`, { align: 'left' })
    doc.text(`Date: ${order.createdAt.toLocaleString('en-IN')}`, { align: 'left' })
    if (order.customerName) doc.text(`Customer: ${order.customerName}`, { align: 'left' })
    if (order.tableNumber) doc.text(`Table: ${order.tableNumber}`, { align: 'left' })
    doc.moveDown(0.5)
    doc.fontSize(8).text('--------------------------------', { align: 'center' })
    doc.moveDown(0.5)

    // Items
    order.orderLines.forEach((line) => {
      doc
        .fontSize(9)
        .text(`${line.quantity}x ${line.menuItem.name} - ${formatCurrency(line.subtotal)}`)
      if (line.specialInstructions) {
        doc.fontSize(8).text(`  Note: ${line.specialInstructions}`)
      }
    })

    doc.moveDown(0.5)
    doc.fontSize(8).text('--------------------------------', { align: 'center' })
    doc.moveDown(0.5)

    // Totals
    doc.fontSize(10).text(`Subtotal: ${formatCurrency(order.subtotal)}`, { align: 'right' })
    doc.text(`Discount: ${formatCurrency(order.discount)}`, { align: 'right' })
    doc.text(`Tax: ${formatCurrency(order.tax)}`, { align: 'right' })
    doc.moveDown(0.5)
    doc.fontSize(12).text(`Total: ${formatCurrency(order.total)}`, { align: 'right' })
    doc.moveDown()

    // Payment method
    if (order.paymentMethod) {
      doc.fontSize(10).text(`Payment: ${order.paymentMethod}`, { align: 'center' })
    }

    doc.moveDown(2)
    doc.fontSize(8).text('Thank you for visiting!', { align: 'center' })

    // Footer
    if (settings?.receiptFooter) {
      doc.moveDown(0.5)
      doc.fontSize(7).text(settings.receiptFooter, { align: 'center' })
    }

    doc.end()

    // Wait for PDF to finish generating
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdf = Buffer.concat(chunks)
        resolve(
          NextResponse.json({
            pdf: pdf.toString('base64'),
          })
        )
      })
    }) as Promise<NextResponse>
  } catch (error) {
    console.error('Error generating receipt:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
