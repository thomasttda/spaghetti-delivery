'use client'

import { Header } from '@/components/header'
import { BannerCarousel } from '@/components/banner-carousel'
import { ProductGrid } from '@/components/product-grid'
import { CartButton } from '@/components/cart-button'
import { CartSheet } from '@/components/cart-sheet'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24">
        <BannerCarousel />
        <ProductGrid />
      </main>
      <CartButton />
      <CartSheet />
    </div>
  )
}
