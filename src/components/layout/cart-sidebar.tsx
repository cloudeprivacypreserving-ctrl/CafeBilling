'use client'

import { useState } from 'react'
import { ShoppingCart, X, Plus, Minus, Trash2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCart } from '@/lib/cart'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { PhoneNumberInput } from '@/components/phone-number-input'

export function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showWhatsapp, setShowWhatsapp] = useState(false)
  const [mobile, setMobile] = useState('')
  const [existingOrderId, setExistingOrderId] = useState<string | null>(null)
  const [existingOrderDetails, setExistingOrderDetails] = useState<any | null>(null)
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('TAKEAWAY')
  const { state, dispatch, placeOrder } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const handleCheckout = async () => {
    if (!mobile) {
      toast({
        title: 'Mobile number required',
        description: 'Please enter your mobile number to continue.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      // Call the updated placeOrder with phone number and existing order ID
      await placeOrder(mobile, existingOrderId)
      setShowSuccess(true)
      setShowWhatsapp(true)
    } catch (error) {
      toast({
        title: 'Failed to place order',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExistingOrderFound = (orderId: string, orderDetails: any) => {
    setExistingOrderId(orderId)
    setExistingOrderDetails(orderDetails)
  }

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center space-x-1 text-sm"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="hidden lg:inline">Cart</span>
        {state.items.length > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
            {state.items.length}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity">
          {/* Sidebar */}
          <div className="absolute right-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <button onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Success Animation/Message */}
              {showSuccess ? (
                <div className="flex flex-1 flex-col items-center justify-center">
                  <div className="mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-10 w-10 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold text-green-700 mb-2">
                    Order placed successfully!
                  </div>
                  <div className="text-gray-600 mb-4">Thank you for your order.</div>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  {state.items.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500">Your cart is empty</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto p-4">
                      <ul className="divide-y">
                        {state.items.map((item) => (
                          <li key={item.id} className="flex gap-4 py-4">
                            {item.imageUrl && (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-md object-cover"
                              />
                            )}
                            <div className="flex flex-1 flex-col">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))
                                  }
                                  className="rounded-full p-1 hover:bg-gray-100"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="rounded-full p-1 hover:bg-gray-100"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="ml-auto rounded-full p-1 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer */}
                  {state.items.length > 0 && (
                    <div className="border-t p-4 space-y-4">
                      {/* Order Type Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order Type *
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOrderType('DINE_IN')}
                            className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                              orderType === 'DINE_IN'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            Dine In
                          </button>
                          <button
                            onClick={() => setOrderType('TAKEAWAY')}
                            className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                              orderType === 'TAKEAWAY'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            Takeaway
                          </button>
                        </div>
                      </div>

                      {/* Phone Number Input */}
                      <PhoneNumberInput
                        onPhoneChange={setMobile}
                        onExistingOrderFound={handleExistingOrderFound}
                        orderType={orderType}
                      />

                      {/* Show suggestion for existing order */}
                      {existingOrderDetails && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm font-medium text-amber-900 mb-2">
                            Have existing items?
                          </p>
                          <p className="text-xs text-amber-800 mb-3">
                            These new items will be added to your existing order #
                            {existingOrderDetails.orderNumber}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setExistingOrderId(null)
                                setExistingOrderDetails(null)
                              }}
                              className="flex-1 py-1 px-2 bg-white border border-amber-300 text-amber-800 text-xs rounded hover:bg-amber-50"
                            >
                              Create New Order
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Totals */}
                      <div className="pt-2 border-t">
                        <div className="mb-4 flex items-center justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span>{formatCurrency(state.total)}</span>
                        </div>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleCheckout}
                          disabled={isProcessing || !mobile}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `${existingOrderId ? 'Add to Order' : 'Place Order'}`
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
