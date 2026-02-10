
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Precision Stainless Steel Kitchen Scale',
    description: 'High-accuracy digital scale with a sleek brushed metal finish. Perfect for precise baking and meal prep.',
    price: 22.99,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=600',
    stock: 45,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Montessori Wooden Building Blocks',
    description: 'Natural, eco-friendly wooden blocks designed to foster creativity and fine motor skills in young children.',
    price: 45.00,
    category: 'Toys',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=600',
    stock: 20,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Self-Watering Intelligent Planter',
    description: 'Modern minimalist planter with an integrated reservoir. Keeps your herbs and indoor plants hydrated for weeks.',
    price: 29.50,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600',
    stock: 15,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Retro Handheld Game Console',
    description: 'Pre-loaded with 400+ classic arcade titles. A nostalgic toy for kids and a collectible for adults.',
    price: 34.99,
    category: 'Toys',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600',
    stock: 80,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Hand-Woven Natural Seagrass Basket',
    description: 'Versatile storage solution for blankets, toys, or laundry. Adds a warm, organic touch to any room.',
    price: 38.00,
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1590736968575-34865147823e?auto=format&fit=crop&q=80&w=600',
    stock: 12,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Silicone Sensory Fidget Toy Set',
    description: 'A 5-piece set of colorful popping toys. Excellent for stress relief and sensory play.',
    price: 15.99,
    category: 'Toys',
    image: 'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?auto=format&fit=crop&q=80&w=600',
    stock: 150,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const APP_THEME = {
  primary: 'indigo-600',
  primaryHover: 'indigo-700',
  secondary: 'slate-800',
  accent: 'emerald-500'
};
