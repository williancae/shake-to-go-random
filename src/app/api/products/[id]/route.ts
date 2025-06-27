import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/db-operations'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { name, image, probability, isActive, rotation } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image
    if (probability !== undefined) updateData.probability = parseFloat(probability)
    if (isActive !== undefined) updateData.isActive = isActive
    if (rotation !== undefined) updateData.rotation = parseInt(rotation)

    const product = await ProductService.update(resolvedParams.id, updateData)
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const deleted = await ProductService.delete(resolvedParams.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}