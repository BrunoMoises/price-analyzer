'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { Header } from '@/components/header'
import { AddProductBar } from '@/components/add-product-bar'
import { ProductGrid } from '@/components/product-grid'
import { Product, ApiProduct } from '@/lib/types'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth, getAuthHeader } from '@/app/context/AuthContext'

function HomeContent() {
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
        headers: getAuthHeader() as HeadersInit,
      })
      
      if (!res.ok) {
          if (res.status === 401) throw new Error("Sessão expirada.");
          throw new Error('Falha ao buscar dados');
      }
      
      const data = await res.json()
      const safeData = Array.isArray(data) ? data : []
      const richProducts = safeData.map(adaptProduct)
      setProducts(richProducts)

    } catch (error) {
      console.error("Erro ao conectar no Backend:", error)
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          ...(getAuthHeader() as HeadersInit),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) throw new Error('Erro ao adicionar produto.')
      const newApiProduct: ApiProduct = await res.json()
      const newProduct = adaptProduct(newApiProduct)
      setProducts((prevProducts) => [...prevProducts, newProduct])
      toast.success('Produto adicionado!')
    } catch (error) {
      toast.error('Falha ao adicionar produto!')
    }
  }
  
  const handleDeleteProduct = (deletedId: string) => {
      setProducts((currentProducts) => currentProducts.filter(p => p.id !== deletedId))
  }

  if (!isAuthenticated && !searchParams.get('token')) {
    router.push('/auth/login')
    return null
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Carregando...</p>
      </div>
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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Carregando app...</div>}>
      <HomeContent />
    </Suspense>
  )
}