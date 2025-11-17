'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { AddProductBar } from '@/components/add-product-bar'
import { ProductGrid } from '@/components/product-grid'
import { Product, ApiProduct } from '@/lib/types'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const adaptProduct = (apiData: ApiProduct): Product => {
    return {
      id: apiData.id,
      name: apiData.name,
      currentPrice: apiData.price,
      imageUrl: '/placeholder.svg',
      lowestPrice: apiData.price,   
      priceHistory: [],             
      stores: []                    
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        
        const res = await fetch(`${apiUrl}/products`)
        
        if (!res.ok) throw new Error('Falha ao buscar dados do Go')
        
        const data: ApiProduct[] = await res.json()
        
        const richProducts = data.map(adaptProduct)
        
        setProducts(richProducts)
      } catch (error) {
        console.error("Erro ao conectar no Backend:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddProduct = (url: string) => {
    console.log('TODO: Enviar URL para o Go processar:', url)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <AddProductBar onAddProduct={handleAddProduct} />
        
        {isLoading ? (
          <div className="text-center mt-20 text-muted-foreground">
            Carregando produtos do servidor...
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </main>
    </div>
  )
}