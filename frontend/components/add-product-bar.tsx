'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface AddProductBarProps {
  onAddProduct: (url: string) => void
}

export function AddProductBar({ onAddProduct }: AddProductBarProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast.error('URL necessária', {
        description: 'Por favor, cole uma URL de produto',
      })
      return
    }

    onAddProduct(url)
    setUrl('')
    
    toast.success('Produto adicionado!', {
      description: 'O produto está sendo monitorado',
    })
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="url"
          placeholder="Cole a URL do produto aqui..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Monitorar
        </Button>
      </form>
    </div>
  )
}
