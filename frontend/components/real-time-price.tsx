'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface RealTimePriceProps {
  price: number
  size?: 'default' | 'large'
}

type PriceState = 'default' | 'drop' | 'rise'

export function RealTimePrice({ price, size = 'default' }: RealTimePriceProps) {
  const [priceState, setPriceState] = useState<PriceState>('default')
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random()
      if (random > 0.95) {
        setPriceState('drop')
        setTimeout(() => setPriceState('default'), 2000)
      } else if (random < 0.05) {
        setPriceState('rise')
        setTimeout(() => setPriceState('default'), 2000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'font-bold transition-colors duration-300',
          size === 'large' ? 'text-4xl' : 'text-2xl',
          priceState === 'default' && 'text-foreground',
          priceState === 'drop' && 'text-primary animate-pulse',
          priceState === 'rise' && 'text-destructive animate-pulse'
        )}
      >
        R$ {price.toFixed(2)}
      </div>
      
      {isConnected && (
        <div className="relative">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 bg-primary rounded-full animate-ping" />
        </div>
      )}
    </div>
  )
}
