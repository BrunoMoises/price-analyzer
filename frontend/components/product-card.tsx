'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RealTimePrice } from '@/components/real-time-price'
import { Bell, TrendingDown } from 'lucide-react'
import { Product } from '@/lib/types'
import { useState } from 'react'
import { AddAlertModal } from '@/components/add-alert-modal'
import { formatCurrency } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-square relative bg-secondary/50">
          <img
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-contain p-4"
          />
        </div>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2 text-balance">
            {product.name}
          </h3>
          
          <RealTimePrice price={product.currentPrice} />
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span>Menor: R$ {formatCurrency(product.lowestPrice)}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/product/${product.id}`}>Ver Histórico</Link>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsAlertModalOpen(true)}
          >
            <Bell className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      <AddAlertModal
        open={isAlertModalOpen}
        onOpenChange={setIsAlertModalOpen}
        productName={product.name}
        productId={product.id}
      />
    </>
  )
}
