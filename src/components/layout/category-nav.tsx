import Link from 'next/link'
import { Coffee, CoffeeIcon, IceCream, Beer, Cookie, Pizza, Gift, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  {
    name: 'All',
    href: '/store',
    icon: ShoppingBag,
  },
  {
    name: 'Hot Beverages',
    href: '/store/hot-beverages',
    icon: Coffee,
  },
  {
    name: 'Cold Drinks',
    href: '/store/cold-drinks',
    icon: Beer,
  },
  {
    name: 'Desserts',
    href: '/store/desserts',
    icon: IceCream,
  },
  {
    name: 'Snacks',
    href: '/store/snacks',
    icon: Cookie,
  },
  {
    name: 'Meals',
    href: '/store/meals',
    icon: Pizza,
  },
  {
    name: 'Specials',
    href: '/store/specials',
    icon: Gift,
  },
]

interface CategoryNavProps {
  className?: string
}

export function CategoryNav({ className }: CategoryNavProps) {
  return (
    <nav className={cn('border-t', className)}>
      <div className="container mx-auto px-4">
        <div className="no-scrollbar flex items-center space-x-8 overflow-x-auto py-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="flex shrink-0 flex-col items-center space-y-1 text-sm font-medium hover:text-primary"
            >
              <category.icon className="h-5 w-5" />
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}