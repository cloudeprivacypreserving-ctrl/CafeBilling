'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Plus, ShoppingCart } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  price: number
  available: boolean
}

interface CartItem {
  menuItemId: string
  quantity: number
  unitPrice: number
  name: string
}

export default function NewOrderPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN')
  const [tableNumber, setTableNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then(setMenuItems)
      .catch(console.error)
  }, [])

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((i) => i.menuItemId === item.id)
    if (existingItem) {
      setCart(
        cart.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
    } else {
      setCart([
        ...cart,
        { menuItemId: item.id, quantity: 1, unitPrice: item.price, name: item.name },
      ])
    }
  }

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((item) => item.menuItemId !== menuItemId))
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId)
    } else {
      setCart(
        cart.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        )
      )
    }
  }

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const tax = subtotal * 0.18
    return { subtotal, tax, total: subtotal + tax }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'Cart is empty',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { subtotal, tax, total } = calculateTotal()
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType,
          customerName,
          tableNumber,
          paymentMethod: 'CASH',
          items: cart.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          subtotal: Math.round(subtotal * 100),
          tax: Math.round(tax * 100),
          total: Math.round(total * 100),
          discount: 0,
        }),
      })

      const order = await response.json()

      if (!response.ok) {
        throw new Error(order.error || 'Failed to create order')
      }

      toast({
        title: 'Success',
        description: 'Order created successfully',
      })

      router.push(`/dashboard/orders/${order.id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create order',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, tax, total } = calculateTotal()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">New Order</h1>
        <p className="text-gray-600">Create a new order</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu Items */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Menu Items</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {menuItems
                .filter((item) => item.available)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="flex items-center justify-between rounded-lg border p-3 text-left hover:bg-amber-50"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(item.price)}</div>
                    </div>
                    <Plus className="h-5 w-5 text-amber-600" />
                  </button>
                ))}
            </div>
          </Card>
        </div>

        {/* Order Details & Cart */}
        <div className="space-y-4">
          {/* Order Info */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Details</h2>
            <div className="space-y-3">
              <div>
                <Label>Order Type</Label>
                <div className="mt-1 flex gap-2">
                  <Button
                    variant={orderType === 'DINE_IN' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setOrderType('DINE_IN')}
                  >
                    Dine In
                  </Button>
                  <Button
                    variant={orderType === 'TAKEAWAY' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setOrderType('TAKEAWAY')}
                  >
                    Takeaway
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="table">Table Number</Label>
                <Input
                  id="table"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Table 1"
                />
              </div>
              <div>
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Guest"
                />
              </div>
            </div>
          </Card>

          {/* Cart */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Cart ({cart.length})</h2>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.menuItemId} className="flex items-center justify-between rounded border p-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.menuItemId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (18%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            <Button
              className="mt-4 w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {loading ? 'Processing...' : 'Checkout'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

