import { redis, RedisKeys, generateId } from './redis'
import { Product, Spin, CreateProductInput, UpdateProductInput, CreateSpinInput } from '@/types'

// Product operations
export class ProductService {
  static async create(data: CreateProductInput): Promise<Product> {
    const id = generateId()
    const now = new Date().toISOString()
    
    const product: Product = {
      id,
      name: data.name,
      image: data.image || null,
      probability: data.probability,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now
    }

    // Store product hash
    await redis.hset(RedisKeys.product(id), product)
    
    // Add to products list
    await redis.lpush(RedisKeys.PRODUCTS_LIST, id)
    
    // Add to active list if active
    if (product.isActive) {
      await redis.lpush(RedisKeys.PRODUCTS_ACTIVE, id)
    }

    return product
  }

  static async findAll(): Promise<Product[]> {
    const productIds = await redis.lrange(RedisKeys.PRODUCTS_LIST, 0, -1)
    const products: Product[] = []

    for (const id of productIds) {
      const productData = await redis.hgetall(RedisKeys.product(id))
      if (Object.keys(productData).length > 0) {
        products.push({
          ...productData,
          probability: parseFloat(productData.probability),
          isActive: productData.isActive === 'true',
          rotation: productData.rotation ? parseInt(productData.rotation) : 0
        } as Product)
      }
    }

    return products.reverse() // Most recent first
  }

  static async findActive(): Promise<Product[]> {
    const productIds = await redis.lrange(RedisKeys.PRODUCTS_ACTIVE, 0, -1)
    const products: Product[] = []

    for (const id of productIds) {
      const productData = await redis.hgetall(RedisKeys.product(id))
      if (Object.keys(productData).length > 0 && productData.isActive === 'true') {
        products.push({
          ...productData,
          probability: parseFloat(productData.probability),
          isActive: true,
          rotation: productData.rotation ? parseInt(productData.rotation) : 0
        } as Product)
      }
    }

    return products.reverse() // Most recent first
  }

  static async findById(id: string): Promise<Product | null> {
    const productData = await redis.hgetall(RedisKeys.product(id))
    
    if (Object.keys(productData).length === 0) {
      return null
    }

    return {
      ...productData,
      probability: parseFloat(productData.probability),
      isActive: productData.isActive === 'true',
      rotation: productData.rotation ? parseInt(productData.rotation) : 0
    } as Product
  }

  static async update(id: string, data: UpdateProductInput): Promise<Product | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const updated: Product = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    }

    // Update hash
    await redis.hset(RedisKeys.product(id), updated)

    // Update active list
    if (data.isActive !== undefined) {
      if (data.isActive) {
        // Add to active list if not already there
        const isInActiveList = await redis.lpos(RedisKeys.PRODUCTS_ACTIVE, id)
        if (isInActiveList === null) {
          await redis.lpush(RedisKeys.PRODUCTS_ACTIVE, id)
        }
      } else {
        // Remove from active list
        await redis.lrem(RedisKeys.PRODUCTS_ACTIVE, 0, id)
      }
    }

    return updated
  }

  static async delete(id: string): Promise<boolean> {
    const exists = await redis.exists(RedisKeys.product(id))
    if (!exists) return false

    // Remove from all lists
    await redis.lrem(RedisKeys.PRODUCTS_LIST, 0, id)
    await redis.lrem(RedisKeys.PRODUCTS_ACTIVE, 0, id)
    
    // Delete hash
    await redis.del(RedisKeys.product(id))

    return true
  }
}

// Spin operations
export class SpinService {
  static async create(data: CreateSpinInput): Promise<Spin> {
    const id = generateId()
    const now = new Date().toISOString()
    
    const spin: Spin = {
      id,
      productId: data.productId,
      timestamp: now,
      ipAddress: data.ipAddress || null
    }

    // Store spin hash
    await redis.hset(RedisKeys.spin(id), spin)
    
    // Add to spins list
    await redis.lpush(RedisKeys.SPINS_LIST, id)

    // Get product details
    const product = await ProductService.findById(data.productId)
    if (product) {
      spin.product = product
    }

    return spin
  }

  static async findAll(): Promise<Spin[]> {
    const spinIds = await redis.lrange(RedisKeys.SPINS_LIST, 0, -1)
    const spins: Spin[] = []

    for (const id of spinIds) {
      const spinData = await redis.hgetall(RedisKeys.spin(id))
      if (Object.keys(spinData).length > 0) {
        const spin: Spin = {
          id: spinData.id,
          productId: spinData.productId,
          timestamp: spinData.timestamp,
          ipAddress: spinData.ipAddress || null
        }
        
        // Get product details
        const product = await ProductService.findById(spin.productId)
        if (product) {
          spin.product = product
        }
        
        spins.push(spin)
      }
    }

    return spins.reverse() // Most recent first
  }
}