import { NextResponse } from 'next/server'
import { ProductService } from '@/lib/db-operations'

export async function GET() {
  try {
    const products = await ProductService.findActive()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch active products:', error)
    return NextResponse.json({ error: 'Failed to fetch active products' }, { status: 500 })
  }
}