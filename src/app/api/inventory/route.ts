import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      include: { menuItem: true },
    })
    return NextResponse.json(inventory)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 })
  }
}
