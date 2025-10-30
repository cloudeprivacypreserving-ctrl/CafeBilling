'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Download, Printer } from 'lucide-react'
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
  const { toast } = useToast()

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) throw new Error('Order not found')
      const data = await res.json()
      setOrder(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = async () => {
    try {
      const res = await fetch(`/api/receipt/${orderId}`)
      if (!res.ok) throw new Error('Failed to generate receipt')
      const data = await res.json()
      
      // Decode base64 and create blob
      const binaryString = atob(data.pdf)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      // Open in new window
      const pdfWindow = window.open(url, '_blank')
      if (pdfWindow) {
        pdfWindow.document.write('<html><body style="margin:0;"><iframe src="' + url + '" width="100%" height="100%"></iframe></body></html>')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate receipt',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/receipt/${orderId}`)
      if (!res.ok) throw new Error('Failed to generate receipt')
      const data = await res.json()
      
      // Decode base64 and create blob
      const binaryString = atob(data.pdf)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `order-${order?.orderNumber || orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({ title: 'Success', description: 'Receipt downloaded' })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download receipt',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center">
        <p>Order not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order {order.orderNumber}</h1>
          <p className="text-gray-600">{formatDateTime(order.createdAt)}</p>
        </div>
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
  )
}

