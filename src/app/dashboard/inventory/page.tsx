import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertCircle } from 'lucide-react'

async function getInventoryItems() {
  const items = await prisma.inventoryItem.findMany({
    include: {
      menuItem: true,
    },
    orderBy: {
      quantity: 'asc',
    },
  })

  return items
}

export default async function InventoryPage() {
  const items = await getInventoryItems()
  const lowStockItems = items.filter((item) => item.quantity <= item.lowStockThreshold)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
        <p className="text-gray-600">Manage inventory and track stock levels</p>
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Low Stock Alert</h3>
          </div>
          <p className="mt-2 text-sm text-amber-700">
            {lowStockItems.length} item(s) need restocking
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const isLowStock = item.quantity <= item.lowStockThreshold
          return (
            <Card key={item.id} className={isLowStock ? 'border-amber-300 bg-amber-50' : ''}>
              <CardHeader>
                <CardTitle className="text-lg">{item.menuItem.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span
                      className={`font-bold ${
                        isLowStock ? 'text-amber-600' : 'text-green-600'
                      }`}
                    >
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Low Stock Threshold</span>
                    <span>{item.lowStockThreshold}</span>
                  </div>
                  {isLowStock && (
                    <div className="mt-2 rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                      ⚠️ Low Stock
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>No inventory items found.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

