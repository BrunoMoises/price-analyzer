'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface AddAlertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  productId: string
}

export function AddAlertModal({
  open,
  onOpenChange,
  productName,
  productId,
}: AddAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!targetPrice) {
      toast.error('Preço inválido', {
        description: 'Por favor, insira um valor para o alerta.',
      })
      return
    }

    const priceFloat = parseFloat(targetPrice.replace(',', '.'))
    
    if (isNaN(priceFloat) || priceFloat <= 0) {
        toast.error('Valor incorreto', {
            description: 'Digite um número positivo válido.',
        })
        return
    }

    setIsLoading(true)

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        
        const res = await fetch(`${apiUrl}/product/alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: Number(productId),
                target_price: priceFloat
            })
        })

        if (!res.ok) {
            throw new Error('Erro na comunicação com servidor')
        }

        toast.success('Alerta configurado!', {
            description: `Você será notificado no WhatsApp quando chegar em R$ ${targetPrice}`,
        })

        onOpenChange(false)
        setTargetPrice('')

    } catch (error) {
        console.error(error)
        toast.error('Erro ao salvar', {
            description: 'Não foi possível criar o alerta. Tente novamente.',
        })
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Alerta</DialogTitle>
          <DialogDescription>
             Receba uma notificação quando o preço cair.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Avise-me quando <strong className="text-foreground">{productName}</strong> estiver abaixo de:
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="price">Preço Alvo (R$)</Label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="pl-9"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Alerta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}