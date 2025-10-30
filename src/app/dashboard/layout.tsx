'use client'

import { SessionProvider } from 'next-auth/react'
import DashboardLayoutContent from './layout-content'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  )
}
