import { promises as fs } from 'fs'
import { join } from 'path'

async function downloadImages() {
  console.log('🖼️ Iniciando download de imagens...')
  
  try {
    // Create public/images directory if it doesn't exist
    const imagesDir = join(process.cwd(), 'public', 'images')
    await fs.mkdir(imagesDir, { recursive: true })
    console.log('📁 Diretório criado:', imagesDir)
    
    const imagePaths: string[] = []
    
    // Download 10 random images
    for (let i = 0; i < 10; i++) {
      try {
        console.log(`⬇️ Baixando imagem ${i + 1}/10...`)
        
        // Add random parameter to get different images
        const randomId = Math.floor(Math.random() * 1000000)
        const imageUrl = `https://thispersondoesnotexist.com/?${randomId}`
        
        const response = await fetch(imageUrl)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const filename = `person-${i + 1}-${randomId}.jpg`
        const filepath = join(imagesDir, filename)
        
        await fs.writeFile(filepath, buffer)
        
        // Store relative path for database
        const relativePath = `/images/${filename}`
        imagePaths.push(relativePath)
        
        console.log(`✅ Imagem ${i + 1} salva: ${relativePath}`)
        
        // Wait 1 second between downloads to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`❌ Erro ao baixar imagem ${i + 1}:`, error)
      }
    }
    
    console.log('\n🎯 Resumo do download:')
    console.log(`📊 Total de imagens baixadas: ${imagePaths.length}`)
    console.log('📝 Paths das imagens:')
    imagePaths.forEach((path, index) => {
      console.log(`  ${index + 1}. ${path}`)
    })
    
    // Save paths to a JSON file for the update script
    const pathsFile = join(process.cwd(), 'scripts', 'image-paths.json')
    await fs.writeFile(pathsFile, JSON.stringify(imagePaths, null, 2))
    console.log(`💾 Paths salvos em: ${pathsFile}`)
    
    return imagePaths
    
  } catch (error) {
    console.error('❌ Erro durante o download:', error)
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  downloadImages()
    .then(() => {
      console.log('🎪 Download concluído com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error)
      process.exit(1)
    })
}

export { downloadImages }