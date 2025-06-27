'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types'

interface PrizeModalProps {
  isOpen: boolean
  winner: Product | null
  onClose: () => void
}

export default function PrizeModal({ isOpen, winner, onClose }: PrizeModalProps) {
  const [showAnimation, setShowAnimation] = useState(false)
  const [showProduct, setShowProduct] = useState(false)

  useEffect(() => {
    if (isOpen && winner) {
      setShowAnimation(true)
      // Delay showing the product for dramatic effect
      setTimeout(() => {
        setShowProduct(true)
      }, 1000)
    } else {
      setShowAnimation(false)
      setShowProduct(false)
    }
  }, [isOpen, winner])

  if (!isOpen || !winner) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4">
        {/* Background Animation Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-96 h-96 rounded-full border-4 border-primary-300 opacity-30 ${showAnimation ? 'animate-ping' : ''}`}></div>
          <div className={`absolute w-80 h-80 rounded-full border-4 border-primary-400 opacity-50 ${showAnimation ? 'animate-ping' : ''} delay-200`}></div>
          <div className={`absolute w-64 h-64 rounded-full border-4 border-primary-500 opacity-70 ${showAnimation ? 'animate-ping' : ''} delay-500`}></div>
        </div>

        {/* Main Modal Content */}
        <div className={`relative bg-gradient-to-br from-white to-green-50 rounded-2xl p-8 text-center shadow-2xl transform transition-all duration-1000 ${
          showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          
          {/* Workout-style Energy Burst */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-400 via-transparent to-green-400 opacity-20 ${
              showAnimation ? 'animate-pulse' : ''
            }`}></div>
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-green-200 to-transparent opacity-10 ${
              showAnimation ? 'animate-bounce' : ''
            }`}></div>
          </div>

          {/* Dynamic Sparkle Effects */}
          <div className="absolute top-4 left-4 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-6 w-2 h-2 bg-yellow-300 rounded-full animate-ping delay-300"></div>
          <div className="absolute bottom-6 left-8 w-3 h-3 bg-yellow-500 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-2 w-1 h-1 bg-green-400 rounded-full animate-ping delay-500"></div>
          <div className="absolute top-1/3 right-2 w-1 h-1 bg-green-300 rounded-full animate-bounce delay-800"></div>

          {/* Congratulations Text with Workout Energy */}
          <div className={`mb-6 transform transition-all duration-700 delay-500 ${
            showProduct ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400 mb-2 animate-power-pulse">
              PARABÉNS! 🎉
            </h1>
            <div className="text-lg text-gray-700 font-bold mb-2 animate-victory-bounce">
              🏆 VOCÊ CONQUISTOU! 🏆
            </div>
            <p className="text-base text-gray-600 font-semibold animate-shake-celebration">
              Seu prêmio exclusivo do Shake To Go!
            </p>
          </div>

          {/* Product Reveal */}
          <div className={`transform transition-all duration-1000 delay-1000 ${
            showProduct ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
          }`}>
            
            {/* Product Image */}
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto mb-4 relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-primary-200 rounded-full opacity-50 animate-energy-burst scale-110"></div>
                
                {winner.image ? (
                  <img
                    src={winner.image}
                    alt={winner.name}
                    className="w-full h-full object-cover rounded-full border-4 border-primary-500 shadow-lg relative z-10 animate-glow-intense"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full border-4 border-primary-500 shadow-lg flex items-center justify-center relative z-10 animate-glow-intense">
                    <span className="text-white text-4xl font-bold animate-power-pulse">🥤</span>
                  </div>
                )}

                {/* Floating Stars with enhanced animations */}
                <div className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-energy-burst">
                  ⭐
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-300 animate-victory-bounce delay-500">
                  ✨
                </div>
                <div className="absolute -top-1 -left-1 w-4 h-4 text-yellow-500 animate-power-pulse delay-700">
                  💫
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 text-yellow-200 animate-shake-celebration delay-1000">
                  ⚡
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-full mb-6 shadow-lg">
              <h2 className="text-2xl font-bold animate-pulse" style={{ color: 'oklch(0.448 0.119 151.328)' }}>
                {winner.name}
              </h2>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-lg" style={{ color: 'oklch(44.8% 0.119 151.328)' }}>
                🎊 Seu prêmio está garantido! 🎊
              </p>
              <p className="text-sm mt-1" style={{ color: 'oklch(44.6% 0.03 256.802)' }}>
                Apresente esta tela no balcão para retirar seu prêmio
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`bg-primary-500 hover:bg-primary-600 font-bold py-3 px-8 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg transform ${
              showProduct ? 'translate-y-0 opacity-100 delay-1500' : 'translate-y-4 opacity-0'
            }`}
            style={{ color: 'oklch(37.3% 0.034 259.733)' }}
          >
            Fechar
          </button>
        </div>

        {/* Confetti Effect */}
        {showAnimation && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}