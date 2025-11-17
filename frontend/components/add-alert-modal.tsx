'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [condition, setCondition] = useState<'below' | 'above'>('below')
  const [targetPrice, setTargetPrice] = useState('')

  const handleSave = () => {
    if (!targetPrice || parseFloat(targetPrice) <= 0) {
      toast.error('Preço inválido', {
        description: 'Por favor, insira um preço válido',
      })
      return
    }

    // Mock save - would save to database in real app
    console.log('Saving alert:', { productId, condition, targetPrice })

    toast.success('Alerta configurado!', {
      description: `Você será notificado quando o preço estiver ${
        condition === 'below' ? 'abaixo de' : 'acima de'
      } $${targetPrice}`,
    })

    onOpenChange(false)
    setTargetPrice('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Alerta</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Avise-me quando <strong className="text-foreground">{productName}</strong> estiver...
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="condition">Condição</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as 'below' | 'above')}>
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="below">Abaixo de</SelectItem>
                <SelectItem value="above">Acima de</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço Alvo ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alerta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}