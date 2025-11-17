'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { AddProductBar } from '@/components/add-product-bar'
import { ProductGrid } from '@/components/product-grid'
import { Product, ApiProduct } from '@/lib/types'
import { toast } from 'sonner'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const adaptProduct = (apiData: ApiProduct): Product => {
    return {
      id: apiData.id,
      name: apiData.name,
      currentPrice: apiData.price,
      imageUrl: apiData.image_url || '/placeholder.svg', 
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

  const handleAddProduct = async (url: string) => {
    if (!url) return;

    try {
      console.log("Enviando URL para o backend...", url)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        throw new Error('Erro ao adicionar produto. Tente novamente mais tarde.')
      }

      const newApiProduct: ApiProduct = await res.json()

      const newProduct = adaptProduct(newApiProduct)
      
      setProducts((prevProducts) => [...prevProducts, newProduct])

      toast.success('Produto adicionado!', {
        description: 'O produto está sendo monitorado',
      })
    } catch (error) {
      
      console.error("Falha ao adicionar produto:", error)

      toast.error('Falha ao adicionar produto!', {
        description: 'Erro ao adicionar produto. Tente uma URL válida.',
      })
    }
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