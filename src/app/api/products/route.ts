import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/db-operations'

export async function GET() {
  try {
    const products = await ProductService.findAll()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, image, probability, isActive, rotation } = body

    if (!name || probability === undefined) {
      return NextResponse.json({ error: 'Name and probability are required' }, { status: 400 })
    }

    const product = await ProductService.create({
      name,
      image: image || null,
      probability: parseFloat(probability),
      isActive: isActive !== undefined ? isActive : true,
      rotation: rotation !== undefined ? parseInt(rotation) : 0
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}