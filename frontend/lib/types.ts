export interface PriceHistory {
  date: string
  price: number
}

export interface Store {
  name: string
  price: number
}

export interface ApiProduct {
  id: string
  name: string
  price: number
}

export interface Product {
  id: string
  name: string
  imageUrl: string
  currentPrice: number
  lowestPrice: number
  priceHistory: PriceHistory[]
  stores: Store[]
}
