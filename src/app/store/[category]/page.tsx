'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { SectionHeader } from '@/components/section-header'

const categoryMap: Record<string, { title: string; description: string }> = {
  'hot-beverages': {
    title: 'Hot Beverages',
    description: 'Warm up with our selection of freshly brewed coffee and tea'
  },
  'cold-beverages': {
    title: 'Cold Beverages',
    description: 'Cool down with our refreshing cold drinks'
  },
  'snacks': {
    title: 'Snacks',
    description: 'Perfect bites for any time of day'
  },
  'sandwiches': {
    title: 'Sandwiches',
    description: 'Freshly made sandwiches with premium ingredients'
  }
}

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  category: { id: string; name: string }
  imageUrl?: string
  available: boolean
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  
  const category = categoryMap[params.category]
  
  // If category doesn't exist in our map, show 404
  if (!category) {
    notFound()
  }

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Fetch all items and filter by category
        const res = await fetch('/api/menu')
        const data = await res.json()
        
        // Filter items by category (you might want to add proper category filtering in your API)
        const filteredItems = data.filter((item: MenuItem) => 
          item.category.name.toLowerCase() === params.category.replace(/-/g, ' ')
        )
        
        setItems(filteredItems)
      } catch (error) {
        console.error('Failed to fetch items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [params.category])

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
    <div className="container mx-auto px-4 py-8">
      <SectionHeader 
        title={category.title}
        description={category.description}
      />
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            {...item}
            rating={4.5}
            ratingCount={Math.floor(Math.random() * 100) + 10}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          <p>No items found in this category.</p>
        </div>
      )}
    </div>
  )
}