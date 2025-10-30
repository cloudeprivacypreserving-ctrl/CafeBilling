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
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState('');
  const { toast } = useToast();
  const [qrCodePath, setQrCodePath] = useState<string | null>(null);

  // Fetch QR code path for WhatsApp message
  useEffect(() => {
    fetch('/api/settings/qr-code')
      .then(res => res.json())
      .then(data => setQrCodePath(data.qrCodePath));
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load order', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({ title: 'Download', description: 'PDF download coming soon!' });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading order...</div>;
  }
  if (!order) {
    return <div className="p-8 text-center text-red-500">Order not found.</div>;
  }

  return (
    <div className="space-y-6">
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
              onChange={e => setMobile(e.target.value)}
              className="rounded border-2 border-gray-500 px-3 py-2 text-base w-56 focus:border-green-700 focus:outline-none"
              maxLength={10}
            />
            <Button
              className="bg-green-900 hover:bg-green-950 text-white font-semibold px-5 py-2 text-base"
              disabled={!/^\d{10}$/.test(mobile)}
              onClick={() => {
                const itemsList = order.orderLines.map(line => `• ${line.menuItem.name} x${line.quantity} - ${formatCurrency(line.subtotal)}`).join('%0A');
                let msg =
                  `🍽️ *Thank you for ordering with My Cafe!*\n\n` +
                  `*Order No:* ${order.orderNumber}\n` +
                  `*Date:* ${formatDateTime(order.createdAt)}\n` +
                  `*Order Type:* ${order.orderType}\n` +
                  `*Items:*\n${itemsList}\n\n` +
                  `*Subtotal:* ${formatCurrency(order.subtotal)}\n` +
                  `*Tax:* ${formatCurrency(order.tax)}\n` +
                  `*Discount:* -${formatCurrency(order.discount)}\n` +
                  `*Total:* ${formatCurrency(order.total)}\n\n`;
                if (qrCodePath) {
                  msg += `Scan to pay: ${window.location.origin}${qrCodePath}\n`;
                }
                msg += `Thank you for choosing My Cafe!`;
                const encodedMsg = encodeURIComponent(msg);
                window.open(`https://wa.me/91${mobile}?text=${encodedMsg}`, '_blank');
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
  )
}

