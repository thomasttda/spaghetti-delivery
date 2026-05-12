// Demo data used when Supabase tables aren't populated yet
// This ensures the app works out of the box for demonstration

export const DEMO_CATEGORIES = [
  { id: 'cat-1', name: 'Hambúrgueres', slug: 'hamburgueres', order: 1 },
  { id: 'cat-2', name: 'Combos', slug: 'combos', order: 2 },
  { id: 'cat-3', name: 'Bebidas', slug: 'bebidas', order: 3 },
  { id: 'cat-4', name: 'Sobremesas', slug: 'sobremesas', order: 4 },
]

export const DEMO_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'CROCKS',
    description: 'BURGUER CROCKS',
    price: 37.99,
    image_url: 'https://i.postimg.cc/zBcjSTc1/CROCKS.jpg',
    category: 'hamburgueres',
    ingredients: ['PÃO BRIOCHE', 'BLEND DE CARNE 130G', '16OG DE MUSSARELA EMPANADA', 'FAROFA DE BACON', 'BARBECUE'],
    available: true,
  }
]

export const DEMO_BANNERS = [
  {
    id: 'banner-1',
    image_url: '/banners/banner1.jpg',
    title: 'Promoção de Inauguração',
    active: true,
    order: 1,
  },
  {
    id: 'banner-2',
    image_url: '/banners/banner2.jpg',
    title: 'Combo Premium Duplo',
    active: true,
    order: 2,
  },
  {
    id: 'banner-3',
    image_url: '/banners/banner3.jpg',
    title: 'Delivery Grátis',
    active: true,
    order: 3,
  },
]

export const DELIVERY_FEE = 5.99
