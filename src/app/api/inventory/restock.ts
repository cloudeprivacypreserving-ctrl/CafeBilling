import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { id, restockTo } = await request.json()
    if (!id || typeof restockTo !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: restockTo },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to restock inventory' }, { status: 500 })
  }
}
