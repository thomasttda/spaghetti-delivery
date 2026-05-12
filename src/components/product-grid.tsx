'use client'

import { useState, useEffect } from 'react'
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from '@/lib/demo-data'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { ProductDetail } from './product-detail'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  ingredients: string[]
  available: boolean
}

type Category = {
  id: string
  name: string
  slug: string
  order: number
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS)
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    // Try loading from Supabase
    supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .then(({ data }) => {
        if (data && data.length > 0) setProducts(data)
      })

    supabase
      .from('categories')
      .select('*')
      .order('order')
      .then(({ data }) => {
        if (data && data.length > 0) setCategories(data)
      })
  }, [])

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border border-border/40 ${
            activeCategory === null
              ? 'bg-primary text-primary-foreground shadow-primary/20'
              : 'bg-card text-foreground hover:bg-secondary/80'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border border-border/40 ${
              activeCategory === cat.slug
                ? 'bg-primary text-primary-foreground shadow-primary/20'
                : 'bg-card text-foreground hover:bg-secondary/80'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 2x2 Product Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {filtered.map((product) => (
          <button
            key={product.id}
            className="rounded-2xl overflow-hidden border border-border/50 bg-card shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-left cursor-pointer group transition-all duration-300 hover:-translate-y-1"
            onClick={() => {
              setSelectedProduct(product)
              setSheetOpen(true)
            }}
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-secondary">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-primary/5 flex items-center justify-center">
                <span className="text-4xl">🍔</span>
              </div>
              <img
                src={product.image_url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Price badge */}
              <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                {formatCurrency(product.price)}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h3 className="font-bold text-sm sm:text-base leading-tight line-clamp-2 mb-1">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Product Detail Sheet */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
    </section>
  )
}
