import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, quantity } = await request.json()
    console.log('Update inventory request:', { id, quantity })

    if (!id || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: { quantity },
    })
    console.log('Inventory updated:', updated)
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating inventory:', error.message)
    return NextResponse.json(
      { error: 'Failed to update inventory', details: error.message },
      { status: 500 }
    )
  }
}
