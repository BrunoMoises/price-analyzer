'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/header'
import { AddProductBar } from '@/components/add-product-bar'
import { ProductGrid } from '@/components/product-grid'
import { Product, ApiProduct } from '@/lib/types'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth, getAuthHeader, createAuthHeaders } from '@/app/context/AuthContext'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, token, login } = useAuth()

  const adaptProduct = (apiData: ApiProduct): Product => {
    return {
      id: String(apiData.id),
      name: apiData.name,
      currentPrice: apiData.price,
      imageUrl: apiData.image_url || '/placeholder.svg',
      lowestPrice: apiData.price,
      priceHistory: [],
      stores: []
    }
  }

  useEffect(() => {
    const jwtToken = searchParams.get('token')

    if (jwtToken) {
      login(jwtToken)
    }
  }, [searchParams, login])

  const fetchProducts = useCallback(async () => {
    if (!token) {
        setIsLoading(false);
        return;
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      
      const res = await fetch(`${apiUrl}/products`, {
        headers: createAuthHeaders(),
      })
      
      if (!res.ok) {
          if (res.status === 401) {
              throw new Error("Sessão expirada. Faça login novamente.");
          }
          throw new Error('Falha ao buscar dados do servidor');
      }
      
      const data = await res.json()

      const safeData = Array.isArray(data) ? data : []

      const richProducts = safeData.map(adaptProduct)
      setProducts(richProducts)

    } catch (error) {
      console.error("Erro ao conectar no Backend:", error)
      toast.error('Erro de Conexão', { description: "Sua sessão pode ter expirado ou o backend não está rodando." });
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated) {
        fetchProducts()
    }
  }, [isAuthenticated, fetchProducts])


  const handleAddProduct = async (url: string) => {
    if (!url || !token) return;

    try {
      console.log("Enviando URL para o backend...", url)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: createAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        throw new Error('Erro ao adicionar produto. Verifique se a URL é válida.')
      }

      const newApiProduct: ApiProduct = await res.json()
      const newProduct = adaptProduct(newApiProduct)
      
      setProducts((prevProducts) => [...prevProducts, newProduct])

      toast.success('Produto adicionado!', {
        description: `${newProduct.name} está sendo monitorado`,
      })
    } catch (error) {
      console.error("Falha ao adicionar produto:", error)
      toast.error('Falha ao adicionar produto!', {
        description: 'Erro ao adicionar produto. Tente uma URL válida.',
      })
    }
  }

  if (!isAuthenticated && !searchParams.get('token')) {
    router.push('/auth/login')
    return null
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Carregando sessão e produtos...</p>
      </div>
    )
  }

  const handleDeleteProduct = (deletedId: string) => {
      setProducts((currentProducts) => 
        currentProducts.filter(p => p.id !== deletedId)
      )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <AddProductBar onAddProduct={handleAddProduct} />
        <ProductGrid products={products} onDeleteProduct={handleDeleteProduct} />
      </main>
    </div>
  )
}