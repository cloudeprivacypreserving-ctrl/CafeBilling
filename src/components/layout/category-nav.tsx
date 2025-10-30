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
    name: "Today's Exclusive Dishes",
    href: '/store/today-s-exclusive-dishes',
    icon: Gift,
  },
  {
    name: 'Value Meals',
    href: '/store/value-meals',
    icon: Pizza,
  },
  {
    name: 'Combos',
    href: '/store/combos',
    icon: Cookie,
  },
  {
    name: 'Quick Bites',
    href: '/store/quick-bites',
    icon: Cookie,
  },
  {
    name: 'Cosy Special Snacks',
    href: '/store/cosy-special-snacks',
    icon: Cookie,
  },
  {
    name: 'Paneer Burgers',
    href: '/store/burgers-and-sandwiches-paneer-burgers',
    icon: BurgerIcon,
  },
  {
    name: 'Grilled Sandwiches',
    href: '/store/burgers-and-sandwiches-grilled-sandwiches',
    icon: SandwichIcon,
  },
  {
    name: 'Burgers',
    href: '/store/burgers-and-sandwiches-burgers',
    icon: BurgerIcon,
  },
  {
    name: 'Pizza',
    href: '/store/pizza',
    icon: Pizza,
  },
  {
    name: 'Fries',
    href: '/store/fries',
    icon: Cookie,
  },
  {
    name: 'Hot Brew',
    href: '/store/hot-brew',
    icon: Coffee,
  },
  {
    name: 'Cold Brews',
    href: '/store/drinks-beverages-cold-brews',
    icon: Beer,
  },
  {
    name: 'Shakes',
    href: '/store/drinks-beverages-shakes',
    icon: IceCream,
  },
  {
    name: 'Mocktails',
    href: '/store/mocktails',
    icon: Beer,
  },
  {
    name: 'Pasta',
    href: '/store/pasta',
    icon: Pizza,
  },
  {
    name: 'Maggi',
    href: '/store/maggi',
    icon: Pizza,
  },
]

// Add missing icons for Burger and Sandwich if not already imported
function BurgerIcon(props: any) {
  return <span role="img" aria-label="burger">🍔</span>;
}
function SandwichIcon(props: any) {
  return <span role="img" aria-label="sandwich">🥪</span>;
}

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