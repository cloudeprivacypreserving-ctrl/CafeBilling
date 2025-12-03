'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProductCardProps {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  rating?: number
  ratingCount?: number
  available: boolean
  category: {
    id: string
    name: string
  }
}

export function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  rating,
  ratingCount,
  available,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [showQuickView, setShowQuickView] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { dispatch } = useCart()
  const { toast } = useToast()

  // Debug logging for image URL
  if (name.includes('Aloo Tikki Burger')) {
    console.log(`${name} - imageUrl:`, imageUrl)
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((current) => Math.max(1, current + delta))
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id,
          name,
          price,
          quantity,
          imageUrl,
        },
      })
      toast({
        title: 'Added to cart',
        description: `${quantity} x ${name} added to your cart`,
      })
      setQuantity(1)
      setShowQuickView(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-lg border bg-white transition-all hover:shadow-lg"
        onClick={() => available && setShowQuickView(true)}
      >
        {/* Image */}
        {imageUrl ? (
          <div className="relative h-32 w-full overflow-hidden bg-gray-100 rounded-t-lg">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              onError={(e) => {
                console.error(`Image failed to load for ${name}:`, imageUrl, e)
              }}
            />
            {available && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-all group-hover:bg-opacity-20 group-hover:opacity-100">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium">
                  Quick View
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-32 w-full overflow-hidden bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-500 text-xs text-center p-2">No Image</span>
          </div>
        )}

        {/* Content */}
        <div className="p-2">
          <h3
            className="font-medium text-gray-900 h-8 overflow-hidden text-ellipsis whitespace-nowrap text-sm"
            title={name}
          >
            {name}
          </h3>
          {description && (
            <p
              className="mt-1 text-xs text-gray-500 h-6 overflow-hidden text-ellipsis"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
              title={description}
            >
              {description}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-1">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{formatCurrency(price)}</p>
              {rating && (
                <div className="mt-1 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {ratingCount && (
                    <span className="ml-1 text-xs text-gray-500">({ratingCount})</span>
                  )}
                </div>
              )}
            </div>

            <Button
              variant={available ? 'default' : 'secondary'}
              size="sm"
              className="whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation()
                if (available) handleAddToCart()
              }}
              disabled={!available || isAdding}
            >
              {available ? (isAdding ? 'Adding...' : 'ADD') : 'Notify Me'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick View Dialog */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div className="grid gap-4">
            {imageUrl ? (
              <div className="relative h-40 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 90vw, 400px"
                />
              </div>
            ) : (
              <div className="h-40 w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Price</h4>
                <p className="text-2xl font-bold">{formatCurrency(price)}</p>
              </div>

              {available && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-md border">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button className="flex-1" onClick={handleAddToCart} disabled={isAdding}>
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
