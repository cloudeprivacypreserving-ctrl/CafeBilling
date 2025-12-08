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
    // Print the hidden receipt div
    window.print()
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
      {/* Hidden Receipt for Printing - Thermal Printer Format */}
      <div
        id="thermal-receipt"
        style={{
          display: 'none',
          width: '80mm',
          fontFamily: "'Courier New', monospace",
          fontSize: '12px',
          padding: '0',
          margin: '0',
          textAlign: 'center',
          backgroundColor: 'white',
          color: 'black',
        }}
      >
        <style>{`
          @media print {
            * {
              margin: 0 !important;
              padding: 0 !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: 80mm !important;
            }
            #thermal-receipt {
              display: block !important;
              width: 80mm !important;
              margin: 0 !important;
              padding: 0 !important;
              page-break-after: avoid !important;
            }
            #thermal-receipt * {
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Receipt Header */}
        <div
          style={{
            textAlign: 'center',
            paddingBottom: '8px',
            borderBottom: '1px dashed #000',
            marginBottom: '8px',
          }}
        >
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: '5px 0' }}>MY CAFE</h1>
          <p style={{ fontSize: '11px', margin: '2px 0' }}>Receipt</p>
          <p style={{ fontSize: '11px', margin: '2px 0' }}>Order #{order.orderNumber}</p>
          <p style={{ fontSize: '11px', margin: '2px 0' }}>{formatDateTime(order.createdAt)}</p>
        </div>

        {/* Order Details */}
        <div
          style={{
            paddingBottom: '8px',
            borderBottom: '1px dashed #000',
            marginBottom: '8px',
            textAlign: 'left',
            fontSize: '11px',
          }}
        >
          <div style={{ marginBottom: '3px' }}>
            <strong>Order Type:</strong> {order.orderType}
          </div>
          {order.tableNumber && (
            <div style={{ marginBottom: '3px' }}>
              <strong>Table:</strong> {order.tableNumber}
            </div>
          )}
          {order.customerName && (
            <div style={{ marginBottom: '3px' }}>
              <strong>Customer:</strong> {order.customerName}
            </div>
          )}
        </div>

        {/* Items */}
        <div
          style={{
            paddingBottom: '8px',
            borderBottom: '1px dashed #000',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 'bold',
              paddingBottom: '5px',
              borderBottom: '1px solid #000',
              marginBottom: '5px',
            }}
          >
            <span style={{ flex: 1 }}>Item</span>
            <span style={{ width: '35px', textAlign: 'center' }}>Qty</span>
            <span style={{ width: '50px', textAlign: 'right' }}>Total</span>
          </div>
          {order.orderLines.map((line) => (
            <div
              key={line.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                marginBottom: '3px',
              }}
            >
              <span style={{ flex: 1 }}>{line.menuItem.name}</span>
              <span style={{ width: '35px', textAlign: 'center' }}>×{line.quantity}</span>
              <span style={{ width: '50px', textAlign: 'right' }}>
                {formatCurrency(line.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div
          style={{
            paddingBottom: '8px',
            borderBottom: '1px dashed #000',
            marginBottom: '8px',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>Discount:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tax (18%):</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
        </div>

        {/* Final Total */}
        <div
          style={{
            textAlign: 'center',
            paddingBottom: '8px',
            borderBottom: '1px dashed #000',
            marginBottom: '8px',
          }}
        >
          <div style={{ fontSize: '11px', marginBottom: '3px' }}>Total Amount</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(order.total)}</div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '10px' }}>
          <p style={{ margin: '3px 0' }}>Thank you for your order!</p>
          <p style={{ margin: '3px 0' }}>Visit us again soon</p>
          <p style={{ margin: '3px 0' }}>My Cafe</p>
        </div>
      </div>

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
