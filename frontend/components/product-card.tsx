'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RealTimePrice } from '@/components/real-time-price'
import { Bell, TrendingDown, Trash2, Loader2 } from 'lucide-react'
import { Product } from '@/lib/types'
import { AddAlertModal } from '@/components/add-alert-modal'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { getAuthHeader } from '@/app/context/AuthContext'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProductCardProps {
  product: Product
  onDelete: (id: string) => void
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        
        const res = await fetch(`${apiUrl}/product/delete?id=${product.id}`, {
            method: 'DELETE',
            headers: getAuthHeader() as HeadersInit
        })

        if (!res.ok) throw new Error("Erro ao deletar")

        toast.success("Produto removido!")
        onDelete(product.id)

    } catch (error) {
        console.error(error)
        toast.error("Erro ao deletar produto.")
        setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-lg relative group flex flex-col h-full">
        
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-sm">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir monitoramento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você vai parar de receber alertas para <strong>{product.name}</strong> e o histórico de preços será apagado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => {
                            e.preventDefault() 
                            handleDelete()
                        }} className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white">
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <div className="aspect-square relative bg-secondary/50 flex justify-center items-center overflow-hidden border-b border-border">
          <img
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-contain p-2 md:p-4" 
          />
        </div>

        <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg line-clamp-2 text-balance h-14">
            {product.name}
          </h3>
          
          <RealTimePrice price={product.currentPrice} />
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span>Menor: {formatCurrency(product.lowestPrice)}</span>
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