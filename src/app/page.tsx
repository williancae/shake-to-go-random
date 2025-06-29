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
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col items-center justify-center p-4 relative overflow-hidden shake-pattern-bg">
      {/* Decorative Shake Images */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <img src="/images/shake_03.png" alt="" className="absolute top-20 right-20 w-14 h-18 -rotate-12 animate-float-delayed" />
        <img src="/images/shake_05.png" alt="" className="absolute bottom-32 left-16 w-12 h-16 rotate-45 animate-float" />
        <img src="/images/shake_07.png" alt="" className="absolute bottom-20 right-32 w-18 h-22 -rotate-6 animate-float-delayed" />
        <img src="/images/shake_12.png" alt="" className="absolute top-1/2 left-8 w-10 h-14 rotate-90 animate-float" />
        <img src="/images/shake_13.png" alt="" className="absolute top-1/3 right-12 w-16 h-20 -rotate-45 animate-float-delayed" />
      </div>

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/images/shake_04.png" alt="Shake" className="w-12 h-16 animate-bounce" />
          <h1 className="text-5xl font-black text-primary-800 drop-shadow-lg">
            Shake To Go
          </h1>
          <img src="/images/shake_06.png" alt="Shake" className="w-12 h-16 animate-bounce delay-300" />
        </div>
        <p className="text-xl text-primary-600 font-semibold">
          🎲 Gire a roleta e ganhe prêmios incríveis! 🎲
        </p>
        <div className="w-24 h-1 bg-primary-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Spin Wheel Section */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Floating Shakes around the wheel */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="/images/shake_04.png" alt="" className="absolute top-16 left-1/4 w-12 h-16 opacity-20 animate-float transform -rotate-12" />
          <img src="/images/shake_06.png" alt="" className="absolute top-16 right-1/4 w-12 h-16 opacity-20 animate-float-delayed transform rotate-12" />
          <img src="/images/shake_de_morango.png" alt="" className="absolute bottom-16 left-1/3 w-10 h-14 opacity-20 animate-float transform rotate-6" />
          <img src="/images/shake_13.png" alt="" className="absolute bottom-16 right-1/3 w-10 h-14 opacity-20 animate-float-delayed transform -rotate-6" />
        </div>
        
        {/* Wheel Container */}
        <div className="relative z-10">
          <SpinWheel products={products} onSpin={handleSpin} />
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/images/shake_03.png" alt="Shake" className="w-8 h-12 opacity-60 animate-pulse" />
          <div className="text-center">
            <p className="text-primary-700 font-semibold mb-2">✨ Sabores incríveis te esperando! ✨</p>
            
            
          </div>
          <img src="/images/shake_05.png" alt="Shake" className="w-8 h-12 opacity-60 animate-pulse delay-300" />
        </div>
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