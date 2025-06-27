'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'

interface ProductFormData {
  name: string
  image: string
  probability: number
  isActive: boolean
  rotation?: number
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    image: '',
    probability: 0,
    isActive: true
  })
  const [validationError, setValidationError] = useState<string>('')
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    
    // Validation: Check if probability exceeds available percentage
    if (formData.probability > maxAllowed) {
      setValidationError(`A probabilidade não pode exceder ${maxAllowed.toFixed(1)}%. Restam apenas ${maxAllowed.toFixed(1)}% disponíveis.`)
      return
    }
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProducts()
        setShowForm(false)
        setEditingProduct(null)
        setFormData({ name: '', image: '', probability: 0, isActive: true, rotation: 0 })
        setValidationError('')
        setImageSource('url')
        setUploadedImagePreview('')
      } else {
        console.error('Error saving product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      image: product.image || '',
      probability: product.probability,
      isActive: product.isActive,
      rotation: product.rotation || 0
    })
    // Determine if current image is uploaded or URL
    setImageSource(product.image?.startsWith('/images/') ? 'upload' : 'url')
    setUploadedImagePreview(product.image?.startsWith('/images/') ? product.image : '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchProducts()
        } else {
          console.error('Error deleting product')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    setValidationError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setFormData(prev => ({ ...prev, image: result.path }))
        setUploadedImagePreview(result.path)
      } else {
        setValidationError(result.error || 'Erro ao fazer upload da imagem')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setValidationError('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleRotateImageInModal = () => {
    const currentRotation = formData.rotation || 0
    const newRotation = (currentRotation + 90) % 360
    setFormData(prev => ({ ...prev, rotation: newRotation }))
  }

  const getRotationLabel = (rotation: number) => {
    switch (rotation) {
      case 0: return 'Normal'
      case 90: return 'Direita'
      case 180: return 'Baixo'
      case 270: return 'Esquerda'
      default: return `${rotation}°`
    }
  }

  const handleDistributeRemainder = async () => {
    if (remainingPercentage <= 0 || products.length === 0) return
    
    const activeProducts = products.filter(p => p.isActive)
    if (activeProducts.length === 0) return
    
    const distributionPerProduct = remainingPercentage / activeProducts.length
    
    // Show confirmation dialog
    const confirmMessage = `
Confirmar distribuição automática?

Isso irá distribuir ${remainingPercentage.toFixed(1)}% igualmente entre ${activeProducts.length} produtos ativos.
Cada produto receberá aproximadamente +${distributionPerProduct.toFixed(1)}%.

Produtos que serão afetados:
${activeProducts.map(p => `• ${p.name}: ${p.probability}% → ${(p.probability + distributionPerProduct).toFixed(1)}%`).join('\n')}
    `
    
    if (!confirm(confirmMessage)) return
    
    let remainder = remainingPercentage
    
    try {
      const updatePromises = activeProducts.map((product, index) => {
        // For the last product, give it all the remaining percentage to ensure exact 100%
        const additionalPercentage = index === activeProducts.length - 1 
          ? remainder 
          : Math.floor(distributionPerProduct * 10) / 10
        
        remainder -= additionalPercentage
        
        return fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...product,
            probability: Math.round((product.probability + additionalPercentage) * 10) / 10
          })
        })
      })
      
      await Promise.all(updatePromises)
      await fetchProducts()
    } catch (error) {
      console.error('Error distributing remainder:', error)
    }
  }

  const totalProbability = Array.isArray(products) ? products.filter(p => p.isActive).reduce((sum, p) => sum + p.probability, 0) : 0
  const remainingPercentage = 100 - totalProbability
  
  const calculateMaxAllowedProbability = () => {
    if (editingProduct) {
      // When editing, add back the current product's probability to get available space
      return remainingPercentage + editingProduct.probability
    }
    return remainingPercentage
  }
  
  const maxAllowed = calculateMaxAllowedProbability()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600 mt-1">Shake To Go - Gerenciamento de Produtos</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Adicionar Produto
            </button>
          </div>

          {/* Probability Summary Card */}
          <div className={`border rounded-lg p-4 mb-6 ${
            totalProbability === 100 
              ? 'bg-green-50 border-green-200' 
              : totalProbability > 100 
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${
                  totalProbability === 100 
                    ? 'text-green-800' 
                    : totalProbability > 100 
                      ? 'text-red-800'
                      : 'text-yellow-800'
                }`}>
                  {totalProbability === 100 
                    ? '✅ Probabilidades Balanceadas' 
                    : totalProbability > 100 
                      ? '⚠️ Probabilidades Excedem 100%'
                      : '📊 Distribuição de Probabilidades'}
                </h3>
                <div className={`mt-2 text-sm ${
                  totalProbability === 100 
                    ? 'text-green-700' 
                    : totalProbability > 100 
                      ? 'text-red-700'
                      : 'text-yellow-700'
                }`}>
                  <p>
                    Total atual: <strong>{totalProbability.toFixed(1)}%</strong>
                    {remainingPercentage > 0 && (
                      <span> • Disponível: <strong>{remainingPercentage.toFixed(1)}%</strong></span>
                    )}
                    {remainingPercentage < 0 && (
                      <span> • Excesso: <strong>{Math.abs(remainingPercentage).toFixed(1)}%</strong></span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  totalProbability === 100 
                    ? 'text-green-600' 
                    : totalProbability > 100 
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}>
                  {totalProbability.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">de 100%</div>
              </div>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    totalProbability === 100 
                      ? 'bg-green-500' 
                      : totalProbability > 100 
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(totalProbability, 100)}%` }}
                ></div>
                {totalProbability > 100 && (
                  <div className="text-xs text-red-600 mt-1">
                    Excesso de {(totalProbability - 100).toFixed(1)}% precisa ser redistribuído
                  </div>
                )}
              </div>
              
              {/* Auto-distribute button */}
              {remainingPercentage > 0 && products.filter(p => p.isActive).length > 0 && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleDistributeRemainder}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    Distribuir {remainingPercentage.toFixed(1)}% restante entre produtos ativos
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probabilidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(products) && products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image ? (
                        <div className="relative">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-12 w-12 object-cover rounded"
                            style={{ 
                              transform: `rotate(${product.rotation || 0}deg)`,
                              transition: 'transform 0.3s ease'
                            }}
                          />
                          {product.rotation && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {product.rotation}°
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Sem imagem</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.probability}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar produto"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deletar produto"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                )) || null}
              </tbody>
            </table>
          </div>

          {(!Array.isArray(products) || products.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem do Produto
                  </label>
                  
                  {/* Image Source Selector */}
                  <div className="flex space-x-4 mb-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="url"
                        checked={imageSource === 'url'}
                        onChange={(e) => {
                          setImageSource('url')
                          setUploadedImagePreview('')
                          if (imageSource === 'upload') {
                            setFormData({...formData, image: '', rotation: 0})
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">URL da imagem</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="upload"
                        checked={imageSource === 'upload'}
                        onChange={(e) => {
                          setImageSource('upload')
                          if (imageSource === 'url') {
                            setFormData({...formData, image: '', rotation: 0})
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Upload de arquivo</span>
                    </label>
                  </div>

                  {/* URL Input */}
                  {imageSource === 'url' && (
                    <input
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  )}

                  {/* File Upload */}
                  {imageSource === 'upload' && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(file)
                          }
                        }}
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                      />
                      {uploading && (
                        <div className="mt-2 text-sm text-blue-600">
                          Fazendo upload...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Preview with Rotation Control */}
                  {(formData.image || uploadedImagePreview) && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-start space-x-4">
                        {/* Image Preview */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <img
                              src={formData.image || uploadedImagePreview}
                              alt="Preview"
                              className="w-24 h-24 object-cover rounded-lg border border-gray-300 transition-transform duration-300"
                              style={{
                                transform: `rotate(${formData.rotation || 0}deg)`
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            {formData.rotation !== 0 && (
                              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                {formData.rotation}°
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Rotation Controls */}
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rotação da Imagem
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={handleRotateImageInModal}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                              >
                                <span>🔄</span>
                                <span>Girar 90°</span>
                              </button>
                              <span className="text-sm text-gray-600">
                                <strong>{getRotationLabel(formData.rotation || 0)}</strong>
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Clique para girar a imagem. Atual: {formData.rotation || 0}°
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probabilidade (%) - Máximo disponível: {maxAllowed.toFixed(1)}%
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      max={maxAllowed}
                      step="0.1"
                      value={formData.probability}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setFormData({...formData, probability: value})
                        if (value > maxAllowed) {
                          setValidationError(`Máximo permitido: ${maxAllowed.toFixed(1)}%`)
                        } else if (value < 0) {
                          setValidationError('A probabilidade não pode ser negativa')
                        } else {
                          setValidationError('')
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        formData.probability > maxAllowed 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    />
                    {maxAllowed < 100 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Restam {maxAllowed.toFixed(1)}% disponíveis para distribuição
                      </div>
                    )}
                  </div>
                  {validationError && (
                    <div className="mt-2 text-sm text-red-600">
                      {validationError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Produto Ativo</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingProduct(null)
                      setFormData({ name: '', image: '', probability: 0, isActive: true, rotation: 0 })
                      setValidationError('')
                      setImageSource('url')
                      setUploadedImagePreview('')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-md font-medium transition-colors bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={validationError !== '' || !formData.name.trim()}
                  >
                    {editingProduct ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}