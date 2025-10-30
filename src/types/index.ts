export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  imageUrl?: string
  available: boolean
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
  }
}

export interface OrderLine {
  id: string
  menuItemId: string
  quantity: number
  unitPrice: number
  subtotal: number
  menuItem: MenuItem
  specialInstructions?: string
}

export interface Order {
  id: string
  orderNumber: string
  orderType: OrderType
  paymentMethod?: PaymentMethod
  customerName?: string
  tableNumber?: string
  subtotal: number
  tax: number
  discount: number
  total: number
  status: string
  createdAt: Date
  updatedAt: Date
  orderLines: OrderLine[]
}

