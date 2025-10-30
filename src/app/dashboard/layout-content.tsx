'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import {
  Home,
  Menu,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Coffee,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Menu', href: '/dashboard/menu', icon: Menu },
  { name: 'New Order', href: '/dashboard/orders/new', icon: ShoppingCart },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const userRole = session?.user?.role || 'CASHIER'

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <div className="flex items-center space-x-2">
              <Coffee className="h-8 w-8 text-amber-600" />
              {sidebarOpen && <span className="text-xl font-bold text-gray-800">My Cafe</span>}
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                >
                  <Icon className="h-5 w-5" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="border-t p-4">
            <div className="mb-4 flex items-center space-x-3 rounded-lg px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-amber-500"></div>
              {sidebarOpen && (
                <div>
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {sidebarOpen && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}

