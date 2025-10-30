'use client'

import { ProductCard } from '@/components/product-card'
import { MenuSection } from '@/components/menu-section'
import { useEffect, useState } from 'react'
import { menuCategories } from '@/lib/constants'
import { SearchBar } from '@/components/search-bar'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  category: { id: string; name: string }
  imageUrl?: string
  available: boolean
  createdAt?: string
  orderCount?: number
}

export default function StorefrontPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu')
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Group items by category
  const itemsByCategory = items.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
    const categoryName = item.category.name
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(item)
    return acc
  }, {})

  // Get newly launched items (most recently added)
  const newlyLaunched = [...items]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 8)

  // Get bestsellers (most ordered items)
  const bestsellers = [...items]
    .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
    .slice(0, 8)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto space-y-12 px-4 py-8">
      {/* Bestsellers Section */}
      <MenuSection
        title="Bestsellers ⭐"
        items={bestsellers}
        seeAllHref="/store/category/bestsellers"
      />

      {/* Newly Launched Section */}
      <MenuSection
        title="Newly Launched ✨"
        items={newlyLaunched}
        seeAllHref="/store/category/new"
      />

      {/* Hot Beverages Section */}
      {itemsByCategory[menuCategories.HOT_BREW]?.length > 0 && (
        <MenuSection
          title="Hot Beverages ☕"
          items={itemsByCategory[menuCategories.HOT_BREW]}
          seeAllHref="/store/category/hot-brew"
        />
      )}

      {/* Cold Beverages Section */}
      {itemsByCategory[menuCategories.COLD_BREWS]?.length > 0 && (
        <MenuSection
          title="Cold Beverages 🥤"
          items={itemsByCategory[menuCategories.COLD_BREWS]}
          seeAllHref="/store/category/cold-brews"
        />
      )}

      {/* Shakes Section */}
      {itemsByCategory[menuCategories.SHAKES]?.length > 0 && (
        <MenuSection
          title="Shakes 🥤"
          items={itemsByCategory[menuCategories.SHAKES]}
          seeAllHref="/store/category/shakes"
        />
      )}

      {/* Quick Bites Section */}
      {itemsByCategory[menuCategories.QUICK_BITES]?.length > 0 && (
        <MenuSection
          title="Quick Bites 🍿"
          items={itemsByCategory[menuCategories.QUICK_BITES]}
          seeAllHref="/store/category/quick-bites"
        />
      )}

      {/* Burgers Section */}
      {itemsByCategory[menuCategories.BURGERS]?.length > 0 && (
        <MenuSection
          title="Burgers �"
          items={itemsByCategory[menuCategories.BURGERS]}
          seeAllHref="/store/category/burgers"
        />
      )}

      {/* Pizza Section */}
      {itemsByCategory[menuCategories.PIZZA]?.length > 0 && (
        <MenuSection
          title="Pizza 🍕"
          items={itemsByCategory[menuCategories.PIZZA]}
          seeAllHref="/store/category/pizza"
        />
      )}

      {/* Value Meals Section */}
      {itemsByCategory[menuCategories.VALUE_MEALS]?.length > 0 && (
        <MenuSection
          title="Value Meals 🍽️"
          items={itemsByCategory[menuCategories.VALUE_MEALS]}
          seeAllHref="/store/category/value-meals"
        />
      )}
    </main>
  )
}
