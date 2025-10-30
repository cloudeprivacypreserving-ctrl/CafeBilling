import { Header } from '@/components/layout/header'
import { CartProvider } from '@/lib/cart'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {children}
      </div>
    </CartProvider>
  )
}