import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Login
    await page.fill('input[type="email"]', 'admin@mycafe.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard')
  })

  test('complete checkout flow', async ({ page }) => {
    // Navigate to new order page
    await page.goto('/dashboard/orders/new')
    
    // Wait for menu items to load
    await page.waitForSelector('button[role="button"]')
    
    // Check if at least one menu item is displayed
    const menuItems = page.locator('button').filter({ hasText: 'Espresso' })
    await expect(menuItems.first()).toBeVisible()
    
    // Add item to cart
    await menuItems.first().click()
    
    // Check if cart has items
    const cartItems = page.locator('div:has-text("Cart (1)")')
    await expect(cartItems).toBeVisible()
    
    // Fill order details
    await page.fill('input[placeholder="Guest"]', 'Test Customer')
    await page.fill('input[placeholder="Table 1"]', 'Table 1')
    
    // Click checkout
    const checkoutButton = page.locator('button:has-text("Checkout")')
    await expect(checkoutButton).toBeEnabled()
  })
})

