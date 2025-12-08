'use client'

import { ProductCard } from '@/components/product-card'
import { SearchBar } from '@/components/search-bar'
import { menuCategories } from '@/lib/constants'
import { useEffect, useState } from 'react'

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

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  // Get category name from slug
  const getCategoryName = (slug: string) => {
    switch (slug) {
      case 'all':
        return 'all'
      case 'todays-exclusive-dishes':
        return menuCategories.TODAYS_EXCLUSIVE
      case 'value-meals':
        return menuCategories.VALUE_MEALS
      case 'combos':
        return menuCategories.COMBOS
      case 'quick-bites':
        return menuCategories.QUICK_BITES
      case 'cosy-special-snacks':
        return menuCategories.COSY_SPECIAL_SNACKS
      case 'paneer-burgers':
        return menuCategories.BURGERS_PANEER
      case 'grilled-sandwiches':
        return menuCategories.GRILLED_SANDWICHES
      case 'burgers':
        return menuCategories.BURGERS
      case 'pizza':
        return menuCategories.PIZZA
      case 'fries':
        return menuCategories.FRIES
      case 'hot-brew':
        return menuCategories.HOT_BREW
      case 'cold-brews':
        return menuCategories.COLD_BREWS
      case 'shakes':
        return menuCategories.SHAKES
      case 'mocktails':
        return menuCategories.MOCKTAILS
      case 'pasta':
        return menuCategories.PASTA
      case 'maggi':
        return menuCategories.MAGGI
      case 'bestsellers':
        return 'Bestsellers'
      case 'new':
        return 'Newly Launched'
      default:
        return ''
    }
  }

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/menu')
        const data = await res.json()

        // Filter items based on category
        let filteredItems = [...data]
        const categoryName = getCategoryName(params.slug)

        if (params.slug === 'bestsellers') {
          filteredItems = filteredItems.sort(
            (a: MenuItem, b: MenuItem) => (b.orderCount || 0) - (a.orderCount || 0)
          )
        } else if (params.slug === 'new') {
          filteredItems = filteredItems.sort(
            (a: MenuItem, b: MenuItem) =>
              new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          )
        } else if (categoryName && categoryName !== 'all') {
          filteredItems = filteredItems.filter((item) => item.category.name === categoryName)
        }

        setItems(filteredItems)
      } catch (error) {
        console.error('Failed to fetch items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [params.slug])

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

  const categoryTitle = getCategoryName(params.slug)

  return (
    <main className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="mb-6 text-3xl font-bold">
          {categoryTitle} {params.slug === 'bestsellers' && '⭐'}
          {params.slug === 'new' && '✨'}
          {params.slug === 'hot-beverages' && '☕'}
          {params.slug === 'cold-beverages' && '🥤'}
          {params.slug === 'snacks' && '🍿'}
          {params.slug === 'sandwiches' && '🥪'}
          {params.slug === 'desserts' && '🍰'}
          {params.slug === 'meals' && '🍽️'}
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center text-gray-500">No items found in this category</div>
        )}
      </div>
    </main>
  )
}
