'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, Send } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])
  
  if (isAuthenticated) {
      return null
  }

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    router.push(`${apiUrl}/auth/google/login`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bem-vindo ao Price Analyzer</CardTitle>
          <CardDescription>
            Faça login para monitorar seus produtos em seu próprio dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleGoogleLogin} className="w-full gap-2">
            <Send className="w-4 h-4" /> Entrar com Google
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            *Segurança via OAuth 2.0. Seu token de sessão será gerado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}