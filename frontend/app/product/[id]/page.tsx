'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { RealTimePrice } from '@/components/real-time-price'
import { PriceHistoryChart } from '@/components/price-history-chart'
import { AlertSetup } from '@/components/alert-setup'
import { PriceByStoreList } from '@/components/price-by-store-list'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Product, ApiProduct } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id
  
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProductData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        
        const res = await fetch(`${apiUrl}/product/info?id=${productId}`)
        
        if (!res.ok) throw new Error('Produto não encontrado')
        
        const apiData: ApiProduct = await res.json()

        const adaptedProduct: Product = {
          id: String(apiData.id),
          name: apiData.name,
          imageUrl: apiData.image_url || '/placeholder.svg',
          currentPrice: apiData.price,
          lowestPrice: apiData.price,
          priceHistory: [],
          stores: []
        }

        setProduct(adaptedProduct)
      } catch (error) {
        console.error("Erro ao carregar produto:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      fetchProductData()
    }
  }, [productId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center text-white animate-pulse">
          Carregando informações do produto...
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Produto não encontrado no sistema.</p>
          <Button variant="link" onClick={() => router.push('/')}>
            Voltar para o início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <div className="bg-card rounded-lg border border-border p-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-white p-4 flex items-center justify-center border border-border">
            {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
            />
            ) : (
                <div className="text-muted-foreground">Sem Imagem</div>
            )}
            </div>
            
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-balance leading-tight">{product.name}</h1>
              
              <RealTimePrice price={product.currentPrice} size="large" />
              
              <div className="text-sm text-muted-foreground">
                Última verificação:{' '}
                <span className="text-foreground font-semibold">Agora mesmo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-6">Histórico de Preços</h2>
          
          <PriceHistoryChart productId={product.id} />
          
        </div>

        <AlertSetup productName={product.name} productId={product.id} />

        {product.stores && product.stores.length > 0 && (
          <PriceByStoreList stores={product.stores} />
        )}
      </main>
    </div>
  )
}