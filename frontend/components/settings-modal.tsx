'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth, getAuthHeader } from '@/app/context/AuthContext'
import { Send, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user } = useAuth()
  const [chatId, setChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const BOT_USERNAME = "price_analyzer_monitor_bot"
  const telegramLink = `https://t.me/${BOT_USERNAME}?start=connect_${user?.id}`

  const checkConnectionStatus = async () => {
    setIsLoading(true)
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        const res = await fetch(`${apiUrl}/auth/me`, {
            headers: getAuthHeader() as HeadersInit
        })
        
        if (res.ok) {
            const userData = await res.json()
            setChatId(userData.telegram_chat_id)
            
            if (userData.telegram_chat_id && !chatId) {
                 toast.success("Telegram conectado com sucesso!")
            }
        }
    } catch (error) {
        console.error("Erro ao verificar status", error)
    } finally {
        setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
        setChatId(user?.telegram_chat_id || null) 
        checkConnectionStatus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Notificações</DialogTitle>
          <DialogDescription>
            Gerencie a conexão com o Telegram para receber alertas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 text-center min-h-[150px] flex flex-col justify-center">
            {isLoading && !chatId ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Verificando conexão...</p>
                </div>
            ) : chatId ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="bg-green-500/15 text-green-700 dark:text-green-400 p-4 rounded-lg border border-green-500/20 flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-semibold">Telegram Vinculado</p>
                            <p className="text-xs opacity-80">Chat ID: {chatId}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Precisa reconectar ou mudar de conta?
                        </p>
                        <Button variant="outline" className="w-full gap-2" asChild>
                            <a href={telegramLink} target="_blank" rel="noopener noreferrer">
                                <RefreshCw className="w-4 h-4" />
                                Reconectar Telegram
                            </a>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground px-2">
                            1. Clique no botão abaixo para abrir o Telegram.<br/>
                            2. Clique em <strong>Começar</strong> (Start) no nosso Bot.<br/>
                            3. Volte aqui e clique em "Verificar Conexão".
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <Button className="w-full gap-2 bg-[#24A1DE] hover:bg-[#24A1DE]/90 text-white" size="lg" asChild>
                            <a href={telegramLink} target="_blank" rel="noopener noreferrer">
                                <Send className="w-4 h-4" />
                                Conectar Automaticamente
                            </a>
                        </Button>
                        
                        <Button variant="secondary" onClick={checkConnectionStatus} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Verificar Conexão
                        </Button>
                    </div>
                </div>
            )}
        </div>

        <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Fechar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}