import Redis from 'ioredis'
import { nanoid } from 'nanoid'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis = globalForRedis.redis ?? new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
})

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Helper functions for Redis operations
export const RedisKeys = {
  PRODUCTS_LIST: 'products:list',
  PRODUCTS_ACTIVE: 'products:active',
  SPINS_LIST: 'spins:list',
  product: (id: string) => `product:${id}`,
  spin: (id: string) => `spin:${id}`,
}

export const generateId = () => nanoid()