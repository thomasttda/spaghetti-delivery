'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { DEMO_BANNERS } from '@/lib/demo-data'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProductDetail } from './product-detail'

type Banner = {
  id: string
  image_url: string
  title: string
  active: boolean
  order: number
  product_id?: string | null
}

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

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>(DEMO_BANNERS)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('banners')
      .select('*')
      .eq('active', true)
      .neq('title', '__STORE_CONFIG__')
      .order('order')
      .then(({ data }) => {
        if (data && data.length > 0) setBanners(data)
      })
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  const handleBannerClick = async (banner: Banner) => {
    if (banner.product_id) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', banner.product_id)
        .single()
        
      if (data) {
        setSelectedProduct(data)
        setSheetOpen(true)
      }
    }
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-4">
      <div className="overflow-hidden rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-border/40" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`relative flex-[0_0_100%] min-w-0 ${banner.product_id ? 'cursor-pointer' : ''}`}
              onClick={() => handleBannerClick(banner)}
            >
              <div className="relative aspect-[21/9] sm:aspect-[3/1] bg-secondary">
                {/* Use gradient placeholder if image fails */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-primary/10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <h3 className="text-2xl sm:text-4xl font-bold font-display mb-2">{banner.title}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Spaghetti Expresso Delivery</p>
                  </div>
                </div>
                {/* Try loading the actual image */}
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                  <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground shadow-lg">
                    {banner.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {banners.map((_, idx) => (
          <button
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === selectedIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30'
            }`}
            onClick={() => emblaApi?.scrollTo(idx)}
            aria-label={`Ir para banner ${idx + 1}`}
          />
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
