'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Download, Printer } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

interface OrderLine {
  id: string
  menuItem: {
    id: string
    name: string
    price: number
  }
  quantity: number
  unitPrice: number
  subtotal: number
}

interface Order {
  id: string
  orderNumber: string
  orderType: string
  paymentMethod: string
  customerName?: string
  tableNumber?: string
  subtotal: number
  tax: number
  discount: number
  total: number
  createdAt: string
  orderLines: OrderLine[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobile, setMobile] = useState('')
  const { toast } = useToast()
  const [qrCodePath, setQrCodePath] = useState<string | null>(null)

  // Fetch QR code path for WhatsApp message
  useEffect(() => {
    fetch('/api/settings/qr-code')
      .then((res) => res.json())
      .then((data) => setQrCodePath(data.qrCodePath))
  }, [])

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) throw new Error('Order not found')
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load order', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const handlePrint = () => {
    if (!order) return

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Error',
        description: 'Please allow popups to print',
        variant: 'destructive',
      })
      return
    }

    // Build items HTML
    const itemsHtml = order.orderLines
      .map(
        (line) => `
            <div class="item-row">
              <span class="item-name">${line.menuItem.name}</span>
              <span class="item-qty">×${line.quantity}</span>
              <span class="item-total">${formatCurrency(line.subtotal)}</span>
            </div>
          `
      )
      .join('')

    const discountHtml =
      order.discount > 0
        ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-${formatCurrency(order.discount)}</span>
            </div>
          `
        : ''

    // Build the receipt HTML
    const receiptHTML = `<!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            padding: 10px;
            background: white;
            color: black;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #000;
          }
          .header h1 {
            font-size: 16px;
            margin: 5px 0;
          }
          .header p {
            font-size: 11px;
            margin: 2px 0;
          }
          .section {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #000;
          }
          .info-row {
            font-size: 11px;
            margin-bottom: 5px;
          }
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            padding-bottom: 5px;
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            font-size: 11px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11px;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 40px;
            text-align: center;
          }
          .item-total {
            width: 60px;
            text-align: right;
          }
          .totals {
            padding: 10px 0;
            font-size: 11px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .total-amount {
            text-align: center;
            padding: 10px 0;
            border-bottom: 1px dashed #000;
          }
          .total-amount .label {
            font-size: 11px;
            margin-bottom: 5px;
          }
          .total-amount .amount {
            font-size: 16px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            padding-top: 10px;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MY CAFE</h1>
          <p>Receipt</p>
          <p>Order #${order.orderNumber}</p>
          <p>${formatDateTime(order.createdAt)}</p>
        </div>

        <div class="section">
          <div class="info-row"><strong>Order Type:</strong> ${order.orderType}</div>
          ${order.tableNumber ? `<div class="info-row"><strong>Table:</strong> ${order.tableNumber}</div>` : ''}
          ${order.customerName ? `<div class="info-row"><strong>Customer:</strong> ${order.customerName}</div>` : ''}
        </div>

        <div class="section">
          <div class="items-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Total</span>
          </div>
          ${itemsHtml}
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(order.subtotal)}</span>
          </div>
          ${discountHtml}
          <div class="total-row">
            <span>Tax (18%):</span>
            <span>${formatCurrency(order.tax)}</span>
          </div>
        </div>

        <div class="total-amount">
          <div class="label">Total Amount</div>
          <div class="amount">${formatCurrency(order.total)}</div>
        </div>

        <div class="footer">
          <p>Thank you for your order!</p>
          <p>Visit us again soon</p>
          <p>My Cafe</p>
        </div>
      </body>
      </html>`

    printWindow.document.write(receiptHTML)
    printWindow.document.close()

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleDownload = () => {
    toast({ title: 'Download', description: 'PDF download coming soon!' })
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading order...</div>
  }
  if (!order) {
    return <div className="p-8 text-center text-red-500">Order not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Order {order.orderNumber}</h1>
            <p className="text-gray-600">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex space-x-2">
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="tel"
                placeholder="Enter WhatsApp number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="rounded border-2 border-gray-500 px-3 py-2 text-base w-56 focus:border-green-700 focus:outline-none"
                maxLength={10}
              />
              <Button
                className="bg-green-900 hover:bg-green-950 text-white font-semibold px-5 py-2 text-base"
                disabled={!/^\d{10}$/.test(mobile)}
                onClick={() => {
                  const itemsList = order.orderLines
                    .map(
                      (line) =>
                        `• ${line.menuItem.name} x${line.quantity} - ${formatCurrency(line.subtotal)}`
                    )
                    .join('%0A')
                  let msg =
                    `🍽️ *Thank you for ordering with My Cafe!*\n\n` +
                    `*Order No:* ${order.orderNumber}\n` +
                    `*Date:* ${formatDateTime(order.createdAt)}\n` +
                    `*Order Type:* ${order.orderType}\n` +
                    `*Items:*\n${itemsList}\n\n` +
                    `*Subtotal:* ${formatCurrency(order.subtotal)}\n` +
                    `*Tax:* ${formatCurrency(order.tax)}\n` +
                    `*Discount:* -${formatCurrency(order.discount)}\n` +
                    `*Total:* ${formatCurrency(order.total)}\n\n`
                  if (qrCodePath) {
                    msg += `Scan to pay: ${window.location.origin}${qrCodePath}\n`
                  }
                  msg += `Thank you for choosing My Cafe!`
                  const encodedMsg = encodeURIComponent(msg)
                  window.open(`https://wa.me/91${mobile}?text=${encodedMsg}`, '_blank')
                }}
              >
                Send on WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{order.orderType}</span>
              </div>
              {order.tableNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Table:</span>
                  <span className="font-medium">{order.tableNumber}</span>
                </div>
              )}
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
              )}
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.orderLines.map((line) => (
                  <div key={line.id} className="flex justify-between">
                    <div>
                      <span className="font-medium">{line.menuItem.name}</span>
                      <span className="ml-2 text-sm text-gray-600">× {line.quantity}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(line.subtotal)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
