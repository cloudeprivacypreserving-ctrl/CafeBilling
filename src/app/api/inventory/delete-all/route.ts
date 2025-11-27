import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const deleted = await prisma.inventoryItem.deleteMany({})
    return NextResponse.json({ deleted: deleted.count })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete inventory items' }, { status: 500 })
  }
}
