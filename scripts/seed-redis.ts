import { ProductService } from '../src/lib/db-operations'
import { redis } from '../src/lib/redis'

async function main() {
  console.log('🌱 Iniciando seed do Redis...')
  
  try {
    // Test Redis connection
    await redis.ping()
    console.log('✅ Conectado ao Redis')
    
    // Clear existing data
    console.log('🧹 Limpando dados existentes...')
    const keys = await redis.keys('*')
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log(`🗑️ Removidas ${keys.length} chaves`)
    }
    
    // Function to generate random image URL from thispersondoesnotexist.com
    const generateRandomImageUrl = () => {
      // Add a random parameter to ensure different images each time
      const randomId = Math.floor(Math.random() * 1000000)
      return `https://thispersondoesnotexist.com/?${randomId}`
    }

    // Sample products for Shake To Go with random images
    const products = [
      // 🥤 MILKSHAKES (40% total)
      {
        name: '🍫 Milkshake de Chocolate',
        probability: 12,
        isActive: true,
        image: generateRandomImageUrl()
      },
      {
        name: '🍓 Milkshake de Morango',
        probability: 10,
        isActive: true,
        image: generateRandomImageUrl()
      },
      {
        name: '🤍 Milkshake de Baunilha',
        probability: 8,
        isActive: true,
        image: generateRandomImageUrl()
      },
      {
        name: '🍪 Milkshake Cookies & Cream',
        probability: 10,
        isActive: true,
        image: generateRandomImageUrl()
      },
      
      // 🍦 GELATOS (30% total)
      {
        name: '🌰 Gelato de Pistache',
        probability: 8,
        isActive: true,
        image: generateRandomImageUrl()
      },
      {
        name: '🫐 Gelato Frutas Vermelhas',
        probability: 10,
        isActive: true,
        image: generateRandomImageUrl()
      },
      {
        name: '🍯 Gelato Doce de Leite',
        probability: 12,
        isActive: true,
        image: generateRandomImageUrl()
      },
      
      // 🥤 SMOOTHIES (25% total)
      {
        name: '🥬 Smoothie Detox Verde',
        probability: 8,
        isActive: true,
        image: generateRandomImageUrl()
      },
      {
        name: '🫐 Smoothie Açaí com Banana',
        probability: 10,
        isActive: true,
        image: generateRandomImageUrl()
      },
      {
        name: '🥭 Smoothie Tropical',
        probability: 7,
        isActive: true,
        image: generateRandomImageUrl()
      },
      
      // 🎁 PRÊMIOS ESPECIAIS (5% total)
      {
        name: '🎉 Combo Especial - Shake + Gelato',
        probability: 3,
        isActive: true,
        image: generateRandomImageUrl()
      },
      {
        name: '🎊 Desconto 50% na Próxima Compra',
        probability: 2,
        isActive: true,
        image: generateRandomImageUrl()
      }
    ]
    
    console.log('📦 Criando produtos com imagens aleatórias...')
    console.log('🖼️ Usando imagens de: https://thispersondoesnotexist.com/')
    
    for (const productData of products) {
      const created = await ProductService.create(productData)
      console.log(`✅ Criado: ${created.name} (${created.probability}%) - Imagem: ${created.image}`)
    }
    
    const totalProducts = (await ProductService.findAll()).length
    const totalProbability = products.reduce((sum, p) => sum + p.probability, 0)
    
    console.log(`\n🎯 Resumo:`)
    console.log(`📊 Total de produtos: ${totalProducts}`)
    console.log(`🎲 Probabilidade total: ${totalProbability}%`)
    console.log(`🎪 Seed do Redis concluído com sucesso!`)
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    process.exit(1)
  } finally {
    await redis.disconnect()
    console.log('🔌 Conexão com Redis encerrada')
  }
}

main()