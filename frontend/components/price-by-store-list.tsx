import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StoreIcon, ExternalLink } from 'lucide-react'
import { Store } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface PriceByStoreListProps {
  stores: Store[]
}

export function PriceByStoreList({ stores }: PriceByStoreListProps) {
  const sortedStores = [...stores].sort((a, b) => a.price - b.price)
  const lowestPrice = sortedStores[0]?.price

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StoreIcon className="w-5 h-5" />
          Preços por Loja
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedStores.map((store, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
            >
              <div className="flex-1">
                <p className="font-semibold">{store.name}</p>
                <p className="text-2xl font-bold mt-1">
                  ${store.price.toFixed(2)}
                </p>
                {store.price === lowestPrice && (
                  <span className="text-xs text-primary font-semibold">
                    Melhor preço
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                Ver Oferta
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
