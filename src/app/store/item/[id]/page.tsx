'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  category: { id: string; name: string }
  imageUrl?: string
  available: boolean
  rating?: number
  ratingCount?: number
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [relatedItems, setRelatedItems] = useState<MenuItem[]>([])
  const { dispatch } = useCart()

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/menu/${params.id}`)
        if (!res.ok) {
          notFound()
        }
        const data = await res.json()
        setItem(data)

        // Fetch related items from the same category
        const relatedRes = await fetch('/api/menu')
        const allItems = await relatedRes.json()
        setRelatedItems(
          allItems
            .filter((i: MenuItem) => i.categoryId === data.categoryId && i.id !== data.id)
            .slice(0, 6)
        )
      } catch (error) {
        console.error('Failed to fetch item:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [params.id])

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

  if (!item) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        {item.imageUrl && (
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={true}
            />
          </div>
        )}

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{item.name}</h1>
          {item.description && <p className="text-lg text-gray-600">{item.description}</p>}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">₹{(item.price / 100).toFixed(2)}</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category: {item.category.name}</p>
          </div>
          {/* Add to Cart */}
          {item.available ? (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-md border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <span className="text-lg font-semibold">−</span>
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <span className="text-lg font-semibold">+</span>
                  </button>
                </div>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    dispatch({
                      type: 'ADD_ITEM',
                      payload: {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity,
                        imageUrl: item.imageUrl,
                      },
                    })
                  }}
                >
                  Add to Cart
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Total: ₹{((item.price * quantity) / 100).toFixed(2)}
              </p>
            </div>
          ) : (
            <Button size="lg" variant="secondary" className="w-full" disabled>
              Out of Stock
            </Button>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedItems.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Related Items</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedItems.map((item) => (
              <ProductCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
