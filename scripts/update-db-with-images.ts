import { ProductService } from '../src/lib/db-operations'
import { redis } from '../src/lib/redis'
import { promises as fs } from 'fs'
import { join } from 'path'
import { downloadImages } from './download-images'

async function updateDatabaseWithImages() {
  console.log('🗄️ Iniciando atualização do banco de dados...')
  
  try {
    // Test Redis connection
    await redis.ping()
    console.log('✅ Conectado ao Redis')
    
    // Download images first
    console.log('📥 Baixando imagens...')
    const imagePaths = await downloadImages()
    
    if (imagePaths.length === 0) {
      console.error('❌ Nenhuma imagem foi baixada')
      process.exit(1)
    }
    
    // Get all products from database
    console.log('📋 Buscando produtos do banco...')
    const products = await ProductService.findAll()
    
    if (products.length === 0) {
      console.error('❌ Nenhum produto encontrado no banco')
      process.exit(1)
    }
    
    console.log(`📊 Encontrados ${products.length} produtos`)
    console.log(`🖼️ Temos ${imagePaths.length} imagens disponíveis`)
    
    // Update each product with a random image
    console.log('🔄 Atualizando produtos com imagens...')
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      // Use modulo to cycle through images if we have fewer images than products
      const imageIndex = i % imagePaths.length
      const imagePath = imagePaths[imageIndex]
      
      try {
        const updatedProduct = await ProductService.update(product.id, {
          ...product,
          image: imagePath
        })
        
        console.log(`✅ Produto atualizado: "${product.name}" -> ${imagePath}`)
        
      } catch (error) {
        console.error(`❌ Erro ao atualizar produto ${product.name}:`, error)
      }
    }
    
    // Verify updates
    console.log('\n🔍 Verificando atualizações...')
    const updatedProducts = await ProductService.findAll()
    const productsWithImages = updatedProducts.filter(p => p.image && p.image.startsWith('/images/'))
    
    console.log(`\n🎯 Resumo da atualização:`)
    console.log(`📊 Total de produtos: ${updatedProducts.length}`)
    console.log(`🖼️ Produtos com imagens locais: ${productsWithImages.length}`)
    console.log(`📈 Taxa de sucesso: ${Math.round((productsWithImages.length / updatedProducts.length) * 100)}%`)
    
    console.log('\n📝 Produtos atualizados:')
    productsWithImages.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ${product.image}`)
    })
    
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error)
    process.exit(1)
  } finally {
    await redis.disconnect()
    console.log('🔌 Conexão com Redis encerrada')
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  updateDatabaseWithImages()
    .then(() => {
      console.log('🎪 Atualização do banco concluída com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error)
      process.exit(1)
    })
}

export { updateDatabaseWithImages }