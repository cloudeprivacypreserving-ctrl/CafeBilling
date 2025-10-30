'use client'

import { ProductCard } from './product-card'
import Link from 'next/link'
import { Card } from './ui/card'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  available: boolean
  category: {
    id: string
    name: string
  }
  rating?: number
  ratingCount?: number
}

interface MenuSectionProps {
  title: string
  items: MenuItem[]
  seeAllHref: string
}

export function MenuSection({ title, items, seeAllHref }: MenuSectionProps) {
  if (!items?.length) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href={seeAllHref} className="text-sm font-medium text-blue-600 hover:text-blue-800">
          See All &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 4).map((item) => (
          <ProductCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  )
}
