import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.settings.findFirst()

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      taxRate,
      currency,
      receiptFooter,
    } = body

    const settings = await prisma.settings.upsert({
      where: { id: 'settings' },
      update: {
        businessName,
        businessAddress,
        businessPhone,
        businessEmail,
        taxRate: parseFloat(taxRate),
        currency,
        receiptFooter,
        updatedBy: session.user.id,
      },
      create: {
        id: 'settings',
        businessName,
        businessAddress,
        businessPhone,
        businessEmail,
        taxRate: parseFloat(taxRate),
        currency,
        receiptFooter,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
