import Link from 'next/link'
import { TrendingDown, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-foreground">Price Analyzer</span>
        </Link>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
