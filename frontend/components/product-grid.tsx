import { ProductCard } from '@/components/product-card'
import { Product } from '@/lib/types'

interface ProductGridProps {
  products: Product[]
  onDeleteProduct: (id: string) => void 
}

export function ProductGrid({ products, onDeleteProduct }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhum produto monitorado. Adicione um produto para começar!
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard 
            key={product.id} 
            product={product} 
            onDelete={onDeleteProduct} 
        />
      ))}
    </div>
  )
}