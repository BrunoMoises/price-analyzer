'use client'

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PriceHistory } from '@/lib/types'

interface PriceHistoryChartProps {
  data: PriceHistory[]
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const formattedData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    price: item.price,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Preço']}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
