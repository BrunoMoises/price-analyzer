'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { RealTimePrice } from '@/components/real-time-price'
import { PriceHistoryChart } from '@/components/price-history-chart'
import { AlertSetup } from '@/components/alert-setup'
import { PriceByStoreList } from '@/components/price-by-store-list'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

// Mock data - would come from database/API in real app
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    imageUrl: '/diverse-people-listening-headphones.png',
    currentPrice: 349.99,
    lowestPrice: 299.99,
    priceHistory: [
      { date: '2024-01-01', price: 399.99 },
      { date: '2024-01-15', price: 379.99 },
      { date: '2024-02-01', price: 349.99 },
      { date: '2024-02-15', price: 329.99 },
      { date: '2024-03-01', price: 299.99 },
      { date: '2024-03-15', price: 349.99 },
    ],
    stores: [
      { name: 'Amazon', price: 349.99 },
      { name: 'Best Buy', price: 359.99 },
      { name: 'Walmart', price: 369.99 },
    ]
  },
  {
    id: '2',
    name: 'Apple AirPods Pro (2nd Generation)',
    imageUrl: '/wireless-earbuds.png',
    currentPrice: 199.99,
    lowestPrice: 189.99,
    priceHistory: [
      { date: '2024-01-01', price: 249.99 },
      { date: '2024-01-15', price: 229.99 },
      { date: '2024-02-01', price: 219.99 },
      { date: '2024-02-15', price: 199.99 },
      { date: '2024-03-01', price: 189.99 },
      { date: '2024-03-15', price: 199.99 },
    ],
    stores: [
      { name: 'Apple Store', price: 199.99 },
      { name: 'Amazon', price: 199.99 },
      { name: 'Target', price: 209.99 },
    ]
  },
  {
    id: '3',
    name: 'Samsung Galaxy Watch 6',
    imageUrl: '/modern-smartwatch.png',
    currentPrice: 279.99,
    lowestPrice: 249.99,
    priceHistory: [
      { date: '2024-01-01', price: 329.99 },
      { date: '2024-01-15', price: 309.99 },
      { date: '2024-02-01', price: 289.99 },
      { date: '2024-02-15', price: 279.99 },
      { date: '2024-03-01', price: 249.99 },
      { date: '2024-03-15', price: 279.99 },
    ],
    stores: [
      { name: 'Samsung', price: 279.99 },
      { name: 'Amazon', price: 289.99 },
      { name: 'Best Buy', price: 299.99 },
    ]
  },
]

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    // Simulate fetching product data
    const foundProduct = mockProducts.find(p => p.id === params.id)
    setProduct(foundProduct || null)
  }, [params.id])

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Hero Section */}
        <div className="bg-card rounded-lg border border-border p-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-secondary/50">
              <img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-balance">{product.name}</h1>
              <RealTimePrice price={product.currentPrice} size="large" />
              <div className="text-sm text-muted-foreground">
                Menor preço registrado:{' '}
                <span className="text-foreground font-semibold">
                  R$ {formatCurrency(product.lowestPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price History Chart */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-6">Histórico de Preços</h2>
          <PriceHistoryChart data={product.priceHistory} />
        </div>

        {/* Alert Setup */}
        <AlertSetup productName={product.name} productId={product.id} />

        {/* Price by Store */}
        {product.stores && product.stores.length > 0 && (
          <PriceByStoreList stores={product.stores} />
        )}
      </main>
    </div>
  )
}
