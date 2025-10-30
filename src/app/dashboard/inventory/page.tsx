'use client'
import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Edit2 } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
}

interface InventoryItem {
  id: string
  menuItem: MenuItem
  quantity: number
  lowStockThreshold: number
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Store input values for all items by id
  const [inputValues, setInputValues] = useState<{ [id: string]: string }>({})
  // Track loading state for each item
  const [loadingIds, setLoadingIds] = useState<{ [id: string]: boolean }>({})
  // Search state
  const [search, setSearch] = useState('')

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inventory')
      const data = await res.json()
      setItems(data)
      // Sync input values with fetched data
      const newInputValues: { [id: string]: string } = {}
      data.forEach((item: InventoryItem) => {
        newInputValues[item.id] = String(item.quantity)
      })
      setInputValues(newInputValues)
    } catch (e) {
      setError('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const updateStock = async (itemId: string, newQtyStr: string) => {
    // Clean input: remove leading zeros, empty string becomes 0
    const cleaned = newQtyStr.replace(/^0+(?!$)/, '')
    const newQty = cleaned === '' ? 0 : Number(cleaned)
    setInputValues((prev) => ({ ...prev, [itemId]: String(newQty) }))
    setLoadingIds((prev) => ({ ...prev, [itemId]: true }))
    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, quantity: newQty }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast({
          title: 'Error',
          description: err.error || 'Failed to update inventory',
          variant: 'destructive',
        })
      } else {
        // Optimistically update UI
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)))
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update inventory', variant: 'destructive' })
    } finally {
      setLoadingIds((prev) => ({ ...prev, [itemId]: false }))
      fetchInventory()
    }
  }

  const createAllInventory = async () => {
    await fetch('/api/inventory/create-all', { method: 'POST' })
    fetchInventory()
  }

  const lowStockItems = items.filter((item) => item.quantity <= item.lowStockThreshold)
  // Filtered items by search
  const filteredItems =
    search.trim() === ''
      ? items
      : items.filter((item) =>
          item.menuItem.name.toLowerCase().includes(search.trim().toLowerCase())
        )

  if (loading) return <div className="p-8 text-center">Loading inventory...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
        <p className="text-gray-600">Manage inventory and track stock levels</p>
        <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-right text-sm text-gray-700 font-medium">
            Total Inventory Items: {items.length}
          </div>
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded border px-3 py-1 text-sm w-full md:w-64"
          />
        </div>
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
        {filteredItems.map((item) => {
          const isLowStock = item.quantity <= item.lowStockThreshold
          return (
            <Card key={item.id} className={isLowStock ? 'border-amber-300 bg-amber-50' : ''}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  {item.menuItem.name}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={inputValues[item.id] ?? String(item.quantity)}
                      onChange={(e) => {
                        // Remove leading zeros as user types
                        let val = e.target.value.replace(/^0+(?!$)/, '')
                        if (val === '') val = '0'
                        setInputValues((prev) => ({ ...prev, [item.id]: val }))
                      }}
                      className="w-16 rounded border px-2 py-1 text-sm"
                      inputMode="numeric"
                    />
                    <button
                      onClick={() =>
                        updateStock(item.id, inputValues[item.id] ?? String(item.quantity))
                      }
                      className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 flex items-center gap-1 disabled:opacity-50"
                      disabled={loadingIds[item.id]}
                    >
                      <Edit2 className="h-3 w-3" /> Update
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span
                      className={`font-bold ${isLowStock ? 'text-amber-600' : 'text-green-600'}`}
                    >
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Low Stock Threshold</span>
                    <span>{item.lowStockThreshold}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 space-y-2">
              <p>No inventory items found.</p>
              <button
                onClick={createAllInventory}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Create Inventory Records for All Menu Items
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
