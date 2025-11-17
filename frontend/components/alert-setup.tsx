'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Plus } from 'lucide-react'
import { AddAlertModal } from '@/components/add-alert-modal'

interface AlertSetupProps {
  productName: string
  productId: string
}

export function AlertSetup({ productName, productId }: AlertSetupProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas de Preço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Configure alertas para ser notificado quando o preço mudar
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Alerta
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddAlertModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        productName={productName}
        productId={productId}
      />
    </>
  )
}
