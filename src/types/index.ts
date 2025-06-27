export interface Product {
  id: string
  name: string
  image?: string | null
  probability: number
  isActive: boolean
  rotation?: number
  createdAt: string
  updatedAt: string
}

export interface Spin {
  id: string
  productId: string
  timestamp: string
  ipAddress?: string | null
  product?: Product
}

export interface CreateProductInput {
  name: string
  image?: string | null
  probability: number
  isActive?: boolean
  rotation?: number
}

export interface UpdateProductInput {
  name?: string
  image?: string | null
  probability?: number
  isActive?: boolean
  rotation?: number
}

export interface CreateSpinInput {
  productId: string
  ipAddress?: string | null
}