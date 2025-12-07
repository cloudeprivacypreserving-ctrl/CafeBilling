import { useState, useEffect, useCallback } from 'react'

interface PhoneNumberInputProps {
  onPhoneChange: (phone: string) => void
  onExistingOrderFound?: (orderId: string, orderDetails: any) => void
  orderType: 'DINE_IN' | 'TAKEAWAY'
}

export function PhoneNumberInput({
  onPhoneChange,
  onExistingOrderFound,
  orderType,
}: PhoneNumberInputProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingOrder, setExistingOrder] = useState<any | null>(null)
  const [error, setError] = useState('')

  const checkExistingOrder = useCallback(
    async (phone: string) => {
      if (phone.length < 10) return

      setLoading(true)
      try {
        const response = await fetch('/api/orders/find-by-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: phone.trim(),
            orderType,
          }),
        })

        const data = await response.json()

        if (data.found) {
          setExistingOrder(data.order)
          if (onExistingOrderFound) {
            onExistingOrderFound(data.order.id, data.order)
          }
        } else {
          setExistingOrder(null)
        }
      } catch (err) {
        console.error('Error checking for existing order:', err)
        setError('Failed to check existing orders')
      } finally {
        setLoading(false)
      }
    },
    [orderType, onExistingOrderFound]
  )

  // Check for existing order when phone number changes
  useEffect(() => {
    if (phoneNumber.length >= 10) {
      checkExistingOrder(phoneNumber)
    }
  }, [phoneNumber, checkExistingOrder])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhoneNumber(value)
    onPhoneChange(value)
    setError('')
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="Enter 10-digit mobile number"
          maxLength={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          We use this to track your orders and allow you to add items later
        </p>
      </div>

      {/* Show if existing order found */}
      {existingOrder && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-medium text-blue-900">✓ Found Active Order</p>
              <p className="text-sm text-blue-800 mt-1">
                Order #{existingOrder.orderNumber} created{' '}
                {new Date(existingOrder.createdAt).toLocaleTimeString()}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Items: {existingOrder.itemCount} | Total: ₹{(existingOrder.total / 100).toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                You can add more items to this order or create a new order
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-500 animate-pulse">Checking for existing orders...</div>
      )}
    </div>
  )
}
