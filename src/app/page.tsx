'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import SpinWheel from '@/components/SpinWheel'
import PrizeModal from '@/components/PrizeModal'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [winner, setWinner] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchActiveProducts()
  }, [])

  const fetchActiveProducts = async () => {
    try {
      const response = await fetch('/api/products/active')
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpin = async (winnerProduct: Product) => {
    try {
      // Record the spin in the database
      await fetch('/api/spin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: winnerProduct.id }),
      })

      setWinner(winnerProduct)
      setShowModal(true)
    } catch (error) {
      console.error('Error recording spin:', error)
      // Still show the modal even if recording fails
      setWinner(winnerProduct)
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setWinner(null)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-primary-600 text-xl">Carregando roleta...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black text-primary-800 mb-2 drop-shadow-lg">
          Shake To Go
        </h1>
        <p className="text-xl text-primary-600 font-semibold">
          🎲 Gire a roleta e ganhe prêmios incríveis! 🎲
        </p>
        <div className="w-24 h-1 bg-primary-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Spin Wheel */}
      <div className="flex-1 flex items-center justify-center">
        <SpinWheel products={products} onSpin={handleSpin} />
      </div>

      {/* Admin Link */}
      <div className="mt-8">
        <a
          href="/admin"
          className="text-sm text-primary-600 hover:text-primary-800 underline font-medium"
        >
          Acesso Administrativo
        </a>
      </div>

      {/* Prize Modal */}
      <PrizeModal
        isOpen={showModal}
        winner={winner}
        onClose={handleCloseModal}
      />
    </main>
  )
}