'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { AddProductBar } from '@/components/add-product-bar'
import { ProductGrid } from '@/components/product-grid'
import { Product } from '@/lib/types'

// Mock data for demonstration
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    imageUrl: '/diverse-people-listening-headphones.png',
    currentPrice: 349.99,
    lowestPrice: 299.99,
    priceHistory: [
      { date: '2024-01-01', price: 399.99 },
      { date: '2024-01-15', price: 379.99 },
      { date: '2024-02-01', price: 349.99 },
      { date: '2024-02-15', price: 329.99 },
      { date: '2024-03-01', price: 299.99 },
      { date: '2024-03-15', price: 349.99 },
    ],
    stores: [
      { name: 'Amazon', price: 349.99 },
      { name: 'Best Buy', price: 359.99 },
      { name: 'Walmart', price: 369.99 },
    ]
  },
  {
    id: '2',
    name: 'Apple AirPods Pro (2nd Generation)',
    imageUrl: '/wireless-earbuds.png',
    currentPrice: 199.99,
    lowestPrice: 189.99,
    priceHistory: [
      { date: '2024-01-01', price: 249.99 },
      { date: '2024-01-15', price: 229.99 },
      { date: '2024-02-01', price: 219.99 },
      { date: '2024-02-15', price: 199.99 },
      { date: '2024-03-01', price: 189.99 },
      { date: '2024-03-15', price: 199.99 },
    ],
    stores: [
      { name: 'Apple Store', price: 199.99 },
      { name: 'Amazon', price: 199.99 },
      { name: 'Target', price: 209.99 },
    ]
  },
  {
    id: '3',
    name: 'Samsung Galaxy Watch 6',
    imageUrl: '/modern-smartwatch.png',
    currentPrice: 279.99,
    lowestPrice: 249.99,
    priceHistory: [
      { date: '2024-01-01', price: 329.99 },
      { date: '2024-01-15', price: 309.99 },
      { date: '2024-02-01', price: 289.99 },
      { date: '2024-02-15', price: 279.99 },
      { date: '2024-03-01', price: 249.99 },
      { date: '2024-03-15', price: 279.99 },
    ],
    stores: [
      { name: 'Samsung', price: 279.99 },
      { name: 'Amazon', price: 289.99 },
      { name: 'Best Buy', price: 299.99 },
    ]
  },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  const handleAddProduct = (url: string) => {
    // Mock implementation - in real app would fetch product data from URL
    console.log('Adding product from URL:', url)
    
    // Simulate adding a new product
    const newProduct: Product = {
      id: Date.now().toString(),
      name: 'New Product',
      imageUrl: '/diverse-products-still-life.png',
      currentPrice: Math.random() * 500,
      lowestPrice: Math.random() * 400,
      priceHistory: [],
      stores: []
    }
    
    setProducts([...products, newProduct])
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <AddProductBar onAddProduct={handleAddProduct} />
        <ProductGrid products={products} />
      </main>
    </div>
  )
}
