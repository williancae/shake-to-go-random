import { NextRequest, NextResponse } from 'next/server'
import { SpinService } from '@/lib/db-operations'

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Record the spin
    const spin = await SpinService.create({
      productId,
      ipAddress: clientIP
    })

    return NextResponse.json(spin)
  } catch (error) {
    console.error('Failed to record spin:', error)
    return NextResponse.json({ error: 'Failed to record spin' }, { status: 500 })
  }
}