import { formatCurrency, generateOrderNumber } from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(10000)).toBe('₹10.00')
    expect(formatCurrency(5000)).toBe('₹5.00')
    expect(formatCurrency(199)).toBe('₹1.99')
  })

  it('handles custom currency', () => {
    expect(formatCurrency(10000, '$')).toBe('$10.00')
    expect(formatCurrency(5000, '€')).toBe('€5.00')
  })
})

describe('generateOrderNumber', () => {
  it('generates order number in correct format', () => {
    const orderNumber = generateOrderNumber()
    expect(orderNumber).toMatch(/^ORD-\d+-\d+$/)
  })

  it('generates unique order numbers', () => {
    const order1 = generateOrderNumber()
    const order2 = generateOrderNumber()
    expect(order1).not.toBe(order2)
  })
})

