'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface MenuItem {
  id: string
  name: string
  price: number
}

interface OrderItem {
  id: string
  menuItem: MenuItem
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  total: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'pending' | 'completed' | 'cancelled'
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [toast])

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Failed to update order status')

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      })

      // Refresh orders
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-500">No orders found</p>
            </div>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">{formatDate(new Date(order.createdAt))}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        order.status && order.status.toUpperCase() === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : order.status && order.status.toUpperCase() === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status ? order.status.toUpperCase() : ''}
                    </span>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="mb-2 font-medium">Items</h4>
                  <ul className="space-y-2">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between text-sm">
                          <span>
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span className="text-gray-600">{formatCurrency(item.price)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 text-sm">No items</li>
                    )}
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div>
                    <span className="font-medium">Total:</span>
                    <span className="ml-2 text-lg font-bold">{formatCurrency(order.total)}</span>
                  </div>

                  {order.status && order.status.toUpperCase() === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}>
                        Complete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
