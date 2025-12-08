import jsPDF from 'jspdf'
import { formatCurrency } from '@/lib/utils'

interface ReceiptItem {
  name: string
  quantity: number
  subtotal: number
}

interface ReceiptData {
  orderNumber: string
  orderType: string
  createdAt: string
  tableNumber?: string
  customerName?: string
  items: ReceiptItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
}

export const generateThermalReceipt = (data: ReceiptData) => {
  // 80mm thermal printer = 80mm width (about 226 points in jsPDF)
  const pageWidth = 80 // mm
  const lineHeight = 5 // mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageWidth, 297], // A4 height, will auto-fit
  })

  let yPos = 5

  // Set font for entire receipt
  doc.setFont('courier')

  // Header
  doc.setFontSize(12)
  doc.setFont('courier', 'bold')
  doc.text('MY CAFE', pageWidth / 2, yPos, { align: 'center' })
  yPos += lineHeight

  doc.setFontSize(9)
  doc.setFont('courier', 'normal')
  doc.text('Receipt', pageWidth / 2, yPos, { align: 'center' })
  yPos += lineHeight

  doc.text(`Order #${data.orderNumber}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += lineHeight

  doc.text(data.createdAt, pageWidth / 2, yPos, { align: 'center' })
  yPos += lineHeight

  // Dashed line
  doc.setDrawColor(0)
  doc.line(2, yPos, pageWidth - 2, yPos)
  yPos += 3

  // Order Details
  doc.setFontSize(8)
  doc.setFont('courier', 'normal')
  doc.text(`Order Type: ${data.orderType}`, 3, yPos)
  yPos += lineHeight

  if (data.tableNumber) {
    doc.text(`Table: ${data.tableNumber}`, 3, yPos)
    yPos += lineHeight
  }

  if (data.customerName) {
    doc.text(`Customer: ${data.customerName}`, 3, yPos)
    yPos += lineHeight
  }

  // Dashed line
  doc.line(2, yPos, pageWidth - 2, yPos)
  yPos += 3

  // Items header
  doc.setFont('courier', 'bold')
  doc.setFontSize(7)

  const colPositions = {
    name: 3,
    qty: pageWidth - 20,
    total: pageWidth - 10,
  }

  doc.text('Item', colPositions.name, yPos)
  doc.text('Qty', colPositions.qty, yPos)
  doc.text('Total', colPositions.total, yPos, { align: 'right' })
  yPos += lineHeight

  // Item separator line
  doc.setDrawColor(100)
  doc.line(2, yPos, pageWidth - 2, yPos)
  yPos += 2

  // Items
  doc.setFont('courier', 'normal')
  data.items.forEach((item) => {
    // Item name (with wrapping for long names)
    const itemName = item.name.length > 40 ? item.name.substring(0, 40) : item.name
    doc.text(itemName, colPositions.name, yPos)

    const qtyText = `×${item.quantity}`
    doc.text(qtyText, colPositions.qty, yPos)

    const totalText = formatCurrency(item.subtotal)
    doc.text(totalText, colPositions.total, yPos, { align: 'right' })

    yPos += lineHeight
  })

  // Dashed line
  doc.line(2, yPos, pageWidth - 2, yPos)
  yPos += 3

  // Totals section
  doc.setFontSize(8)
  doc.setFont('courier', 'normal')

  doc.text('Subtotal:', 3, yPos)
  doc.text(formatCurrency(data.subtotal), pageWidth - 3, yPos, { align: 'right' })
  yPos += lineHeight

  if (data.discount > 0) {
    doc.text('Discount:', 3, yPos)
    doc.text(`-${formatCurrency(data.discount)}`, pageWidth - 3, yPos, { align: 'right' })
    yPos += lineHeight
  }

  doc.text('Tax (18%):', 3, yPos)
  doc.text(formatCurrency(data.tax), pageWidth - 3, yPos, { align: 'right' })
  yPos += lineHeight

  // Dashed line
  doc.line(2, yPos, pageWidth - 2, yPos)
  yPos += 3

  // Grand Total
  doc.setFontSize(10)
  doc.setFont('courier', 'bold')
  doc.text('Total Amount', pageWidth / 2, yPos, { align: 'center' })
  yPos += lineHeight

  doc.setFontSize(14)
  doc.text(formatCurrency(data.total), pageWidth / 2, yPos, { align: 'center' })
  yPos += lineHeight

  // Dashed line
  doc.line(2, yPos, pageWidth - 2, yPos)
  yPos += 3

  // Footer
  doc.setFontSize(7)
  doc.setFont('courier', 'normal')
  doc.text('Thank you for your order!', pageWidth / 2, yPos, { align: 'center' })
  yPos += lineHeight
  doc.text('Visit us again soon', pageWidth / 2, yPos, { align: 'center' })
  yPos += lineHeight
  doc.text('My Cafe', pageWidth / 2, yPos, { align: 'center' })

  return doc
}

export const printThermalReceipt = (data: ReceiptData) => {
  const doc = generateThermalReceipt(data)
  doc.autoPrint()
  window.open(doc.output('bloburi'), '_blank')
}

export const downloadThermalReceipt = (data: ReceiptData, filename: string) => {
  const doc = generateThermalReceipt(data)
  doc.save(filename)
}
