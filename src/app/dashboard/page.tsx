import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, DollarSign, ShoppingCart, Package, Plus, Clock } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedStatus = ['COMPLETED', 'completed']
  try {
    const [totalOrders, todayRevenue, menuItemsCount, lowStockItems, recentOrders] =
      await Promise.all([
        prisma.order.count({
          where: { status: { in: completedStatus }, createdAt: { gte: today } },
        }),
        prisma.order.aggregate({
          where: { status: { in: completedStatus }, createdAt: { gte: today } },
          _sum: { total: true },
        }),
        prisma.menuItem.count({ where: { available: true } }),
        prisma.inventoryItem.count({ where: { quantity: { lte: 10 } } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            orderLines: true,
          },
        }),
      ])

    return {
      totalOrders,
      todayRevenue: todayRevenue._sum.total || 0,
      menuItemsCount,
      lowStockItems,
      recentOrders,
    }
  } catch (err) {
    // If the database is not reachable during a build/prerender, return safe defaults
    // so the Next.js build/prerender can complete in CI/local environments without a DB.
    // The dashboard will show zeros until runtime DB connection is available.
    // eslint-disable-next-line no-console
    console.warn('getDashboardStats: failed to query database during build/prerender', err)
    return {
      totalOrders: 0,
      todayRevenue: 0,
      menuItemsCount: 0,
      lowStockItems: 0,
      recentOrders: [],
    }
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to My Cafe POS System</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Completed orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total revenue today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.menuItemsCount}</div>
            <p className="text-xs text-muted-foreground">Available items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Orders
            </CardTitle>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">Order #{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(new Date(order.createdAt))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.orderLines.length} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/dashboard/orders/new">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Order
                </Button>
              </Link>
              <Link href="/dashboard/menu">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Menu
                </Button>
              </Link>
              <Link href="/dashboard/inventory">
                <Button className="w-full justify-start" variant="outline">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Manage Inventory
                </Button>
              </Link>
              <Link href="/dashboard/orders">
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
