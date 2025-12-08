import { User } from 'lucide-react'
import Link from 'next/link'
import { SearchBar } from './search-bar'
import { CartSidebar } from './cart-sidebar'
import { CategoryNav } from './category-nav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      {/* Main Header */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">CafeMate</span>
        </Link>

        {/* Search */}
        <div className="flex-1 items-center justify-center px-4 lg:px-8">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-1 text-sm hover:text-primary"
          >
            <User className="h-5 w-5" />
            <span className="hidden lg:inline">Login</span>
          </Link>
          <CartSidebar />
        </div>
      </div>

      {/* Category Navigation */}
      <CategoryNav />
    </header>
  )
}
