'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Download, Calendar } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  total: number
  createdAt: string
  orderType: string
  status: string
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchOrders()
  }, [dateRange])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      // Only include orders with status COMPLETED (case-insensitive)
      setOrders(
        data.filter(
          (o: Order) => o.status && (o.status === 'COMPLETED' || o.status === 'completed')
        )
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const ordersInRange = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      return orderDate >= startDate && orderDate <= endDate
    })

    const totalRevenue = ordersInRange.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = ordersInRange.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return { totalRevenue, totalOrders, avgOrderValue, ordersInRange }
  }

  const { totalRevenue, totalOrders, avgOrderValue, ordersInRange } = calculateStats()

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600">Sales reports and analytics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1 rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1 rounded border px-3 py-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(avgOrderValue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Order #</th>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Type</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {ordersInRange.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => (window.location.href = `/dashboard/orders/${order.id}`)}
                  >
                    <td className="py-2">{order.orderNumber}</td>
                    <td className="py-2">{formatDate(order.createdAt)}</td>
                    <td className="py-2">{order.orderType}</td>
                    <td className="py-2 text-right font-semibold">{formatCurrency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
