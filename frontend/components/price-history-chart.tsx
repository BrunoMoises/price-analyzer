'use client'

import { useEffect, useState } from 'react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface PriceHistoryChartProps {
  productId: string
}

interface ChartDataPoint {
  date: string
  price: number
  originalDate: string
}

export function PriceHistoryChart({ productId }: PriceHistoryChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (!productId) return

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        const res = await fetch(`${apiUrl}/product?id=${productId}`)
        
        if (!res.ok) throw new Error("Erro ao buscar histórico")

        const history = await res.json()

        const formatted = history.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: item.price,
          originalDate: item.date
        }))

        setData(formatted)
      } catch (error) {
        console.error("Erro ao carregar gráfico:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [productId])

  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse">Carregando histórico...</div>
  }

  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Sem histórico suficiente para exibir gráfico.</div>
  }

  return (
    <div className="w-full h-[350px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCurrency(value)}
            width={80}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value: number) => [formatCurrency(value), 'Preço']}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}
          />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}