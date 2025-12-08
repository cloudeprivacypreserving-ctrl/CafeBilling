'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  placeOrder: (
    phoneNumber?: string,
    existingOrderId?: string | null,
    orderType?: 'DINE_IN' | 'TAKEAWAY'
  ) => Promise<void>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          total: state.total + action.payload.price * action.payload.quantity,
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price * action.payload.quantity,
      }
    }
    case 'REMOVE_ITEM': {
      const item = state.items.find((i) => i.id === action.payload)
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        total: state.total - (item ? item.price * item.quantity : 0),
      }
    }
    case 'UPDATE_QUANTITY': {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (!item) return state

      const quantityDiff = action.payload.quantity - item.quantity
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
        total: state.total + item.price * quantityDiff,
      }
    }
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize cart state from localStorage (if available)
  const [state, dispatch] = useReducer(cartReducer, undefined, () => {
    const savedCart = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
    if (savedCart) {
      try {
        return JSON.parse(savedCart)
      } catch {
        return { items: [], total: 0 }
      }
    }
    return { items: [], total: 0 }
  })

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state))
  }, [state])

  const placeOrder = async (
    phoneNumber?: string,
    existingOrderId?: string | null,
    orderType?: 'DINE_IN' | 'TAKEAWAY'
  ) => {
    try {
      const response = await fetch('/api/store/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items,
          total: state.total,
          customerPhoneNumber: phoneNumber,
          existingOrderId: existingOrderId || undefined,
          orderType: orderType || 'TAKEAWAY',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to place order')
      }

      // Clear the cart after successful order
      dispatch({ type: 'CLEAR_CART' })

      // You might want to redirect to an order confirmation page
      // or show a success message
    } catch (error) {
      console.error('Error placing order:', error)
      throw error
    }
  }

  return (
    <CartContext.Provider value={{ state, dispatch, placeOrder }}>{children}</CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
