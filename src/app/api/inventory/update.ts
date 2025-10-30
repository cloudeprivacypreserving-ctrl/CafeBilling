import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { id, quantity } = await request.json()
    if (!id || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: { quantity },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}
