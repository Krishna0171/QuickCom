
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, User, DashboardStats, Category, OrderStatus, Address, SupportTicket, TicketStatus, TicketReply, Review } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

// Safety utility to access process.env without throwing ReferenceError in browsers
const getEnv = (key: string): string => {
  try {
    // Check if process and process.env exist before accessing
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key] || '';
    }
    return '';
  } catch (e) {
    return '';
  }
};

const SUPABASE_URL = getEnv('SUPABASE_URL').trim();
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY').trim();

const STORES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  TICKETS: 'tickets',
  REVIEWS: 'reviews',
  FAVORITES: 'favorites'
};

const SCHEMA_SQL = `
-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT,
  image TEXT,
  stock INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  mobile TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT,
  role TEXT DEFAULT 'customer',
  name TEXT,
  address JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(id),
  "customerName" TEXT,
  "customerMobile" TEXT,
  "customerEmail" TEXT,
  items JSONB,
  total NUMERIC,
  status TEXT,
  "paymentMethod" TEXT,
  "shippingAddress" JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  "productId" TEXT REFERENCES products(id),
  "userId" TEXT REFERENCES users(id),
  "userName" TEXT,
  rating INTEGER,
  comment TEXT,
  "isVerifiedPurchase" BOOLEAN,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(id),
  name TEXT,
  email TEXT,
  subject TEXT,
  "orderId" TEXT,
  message TEXT,
  status TEXT,
  replies JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(id),
  "productId" TEXT REFERENCES products(id),
  UNIQUE("userId", "productId")
);
`;

class SupabaseApiService {
  private supabase: SupabaseClient | null = null;
  public isReady = false;
  public needsSetup = false;

  constructor() {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (e) {
        console.error("Supabase client failed to initialize:", e);
      }
    } else {
      console.warn("Supabase credentials missing in process.env.");
    }
  }

  // Helper to check if configuration is actually present
  getConfigStatus() {
    return {
      api_key: !!getEnv('API_KEY'),
      supabase_url: !!SUPABASE_URL,
      supabase_anon_key: !!SUPABASE_ANON_KEY
    };
  }

  async initializeDatabase(): Promise<{ success: boolean; error?: string }> {
    if (!this.supabase) return { success: false, error: 'Supabase credentials missing or invalid.' };
    
    try {
      // 1. Check if tables exist by querying products
      const { error } = await this.supabase.from(STORES.PRODUCTS).select('id').limit(1);
      
      // If error code is 42P01, table does not exist
      if (error && (error as any).code === '42P01') {
        this.needsSetup = true;
        return { success: false, error: 'Database structure not found.' };
      }

      await this.seedIfNeeded();
      this.isReady = true;
      this.needsSetup = false;
      return { success: true };
    } catch (err) {
      console.error("Connection Check Failed:", err);
      this.needsSetup = true;
      return { success: false, error: 'Connection failed. Check your Supabase URL and Keys.' };
    }
  }

  async runAutoSetup(): Promise<boolean> {
    if (!this.supabase) return false;
    try {
      const { error } = await this.supabase.rpc('exec_sql', { sql_query: SCHEMA_SQL });
      if (error) throw error;
      
      await this.seedIfNeeded();
      this.isReady = true;
      this.needsSetup = false;
      return true;
    } catch (err) {
      console.error("Auto-setup failed. Manual setup required.", err);
      return false;
    }
  }

  getSchemaSQL() { return SCHEMA_SQL; }
  getRPCSetupSQL() {
    return `CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;
  }

  private async seedIfNeeded() {
    if (!this.supabase) return;
    try {
      const { count } = await this.supabase.from(STORES.PRODUCTS).select('id', { count: 'exact', head: true });
      if (count === 0) {
        await this.supabase.from(STORES.PRODUCTS).insert(INITIAL_PRODUCTS);
      }

      const { data: admin } = await this.supabase.from(STORES.USERS).select('id').eq('mobile', '9999999999').single();
      if (!admin) {
        await this.supabase.from(STORES.USERS).insert({ 
          id: 'u1', 
          mobile: '9999999999', 
          email: 'admin@quickstore.com', 
          name: 'Admin User', 
          role: 'admin',
          password: 'password123' 
        });
      }
    } catch (e) {
      console.error("Seeding failed:", e);
    }
  }

  // --- CRUD METHODS (Safely check for client) ---

  async getReviews(productId?: string): Promise<Review[]> {
    if (!this.supabase) return [];
    let query = this.supabase.from(STORES.REVIEWS).select('*').order('createdAt', { ascending: false });
    if (productId) query = query.eq('productId', productId);
    const { data } = await query;
    return data || [];
  }

  async addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    if (!this.supabase) throw new Error("DB Not Ready");
    const newReview: Review = {
      ...review,
      id: `REV-${Math.random().toString(36).toUpperCase().substr(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    await this.supabase.from(STORES.REVIEWS).insert(newReview);
    return newReview;
  }

  async deleteReview(id: string): Promise<void> {
    await this.supabase?.from(STORES.REVIEWS).delete().eq('id', id);
  }

  async canUserReviewProduct(userId: string, productId: string): Promise<boolean> {
    const orders = await this.getOrders();
    return orders.some(o => 
      o.userId === userId && 
      o.status === 'Delivered' && 
      o.items.some(item => item.id === productId)
    );
  }

  async getFavorites(): Promise<string[]> {
    const user = this.getCurrentUser();
    if (!user || !this.supabase) return [];
    const { data } = await this.supabase.from(STORES.FAVORITES).select('productId').eq('userId', user.id);
    return (data || []).map(f => f.productId);
  }

  async toggleFavorite(productId: string): Promise<string[]> {
    const user = this.getCurrentUser();
    if (!user || !this.supabase) return [];
    const current = await this.getFavorites();
    const isFav = current.includes(productId);
    if (!isFav) {
      await this.supabase.from(STORES.FAVORITES).insert({ id: `${user.id}_${productId}`, userId: user.id, productId: productId });
    } else {
      await this.supabase.from(STORES.FAVORITES).delete().match({ userId: user.id, productId: productId });
    }
    return this.getFavorites();
  }

  async getTickets(): Promise<SupportTicket[]> {
    const { data } = await this.supabase?.from(STORES.TICKETS).select('*').order('createdAt', { ascending: false }) || { data: [] };
    return data || [];
  }

  async createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'replies'>): Promise<SupportTicket> {
    if (!this.supabase) throw new Error("DB Not Ready");
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TIC-${Math.random().toString(36).toUpperCase().substr(2, 6)}`,
      status: 'Open',
      replies: [],
      createdAt: new Date().toISOString()
    };
    await this.supabase.from(STORES.TICKETS).insert(newTicket);
    return newTicket;
  }

  async addTicketReply(ticketId: string, sender: 'User' | 'Admin', message: string): Promise<SupportTicket> {
    if (!this.supabase) throw new Error("DB Not Ready");
    const { data: ticket } = await this.supabase.from(STORES.TICKETS).select('*').eq('id', ticketId).single();
    if (!ticket) throw new Error('Ticket not found');
    const reply: TicketReply = { id: Math.random().toString(36).substr(2, 9), sender, message, createdAt: new Date().toISOString() };
    const updatedReplies = [...ticket.replies, reply];
    let updatedStatus = ticket.status;
    if (sender === 'Admin' && ticket.status === 'Open') updatedStatus = 'Pending';
    else if (sender === 'User' && ticket.status === 'Resolved') updatedStatus = 'Open';
    const { data } = await this.supabase.from(STORES.TICKETS).update({ replies: updatedReplies, status: updatedStatus }).eq('id', ticketId).select().single();
    return data;
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<SupportTicket> {
    const { data } = await this.supabase?.from(STORES.TICKETS).update({ status }).eq('id', id).select().single() || { data: null };
    return data;
  }

  async getProducts(): Promise<Product[]> {
    const { data } = await this.supabase?.from(STORES.PRODUCTS).select('*') || { data: [] };
    return data || [];
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = { ...product, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    await this.supabase?.from(STORES.PRODUCTS).insert(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data } = await this.supabase?.from(STORES.PRODUCTS).update(updates).eq('id', id).select().single() || { data: null };
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.supabase?.from(STORES.PRODUCTS).delete().eq('id', id);
  }

  async getOrders(): Promise<Order[]> {
    const { data } = await this.supabase?.from(STORES.ORDERS).select('*').order('createdAt', { ascending: false }) || { data: [] };
    return data || [];
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    if (!this.supabase) throw new Error("DB Not Ready");
    const newOrder: Order = { ...orderData, id: `ORD-${Math.random().toString(36).toUpperCase().substr(2, 6)}`, status: 'Processing', createdAt: new Date().toISOString() };
    await this.supabase.from(STORES.ORDERS).insert(newOrder);
    for (const item of newOrder.items) {
      const { data: p } = await this.supabase.from(STORES.PRODUCTS).select('stock').eq('id', item.id).single();
      if (p) await this.supabase.from(STORES.PRODUCTS).update({ stock: Math.max(0, p.stock - item.quantity) }).eq('id', item.id);
    }
    return newOrder;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await this.supabase?.from(STORES.ORDERS).update({ status }).eq('id', id).select().single() || { data: null };
    return data;
  }

  async login(mobile: string, password?: string, email?: string): Promise<User> {
    if (!this.supabase) throw new Error("DB Not Ready");
    const { data: user } = await this.supabase.from(STORES.USERS).select('*').eq('mobile', mobile).single();
    if (user) {
      if (password && user.password && user.password !== password) throw new Error('Invalid password');
      localStorage.setItem('qs_current_user', JSON.stringify(user));
      return user;
    }
    const newUser: User = { id: Math.random().toString(36).substr(2, 9), mobile, email, name: `User ${mobile.slice(-4)}`, role: 'customer', password: password || 'default123' };
    await this.supabase.from(STORES.USERS).insert(newUser);
    localStorage.setItem('qs_current_user', JSON.stringify(newUser));
    return newUser;
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !this.supabase) throw new Error('Not logged in');
    const { data } = await this.supabase.from(STORES.USERS).update(updates).eq('id', currentUser.id).select().single();
    localStorage.setItem('qs_current_user', JSON.stringify(data));
    return data;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('qs_current_user');
    return user ? JSON.parse(user) : null;
  }

  logout() { localStorage.removeItem('qs_current_user'); }

  async getDashboardStats(): Promise<DashboardStats> {
    const [products, orders, tickets, reviews] = await Promise.all([
      this.getProducts(), this.getOrders(), this.getTickets(), this.getReviews()
    ]);
    const totalRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
    return {
      totalOrders: orders.length,
      totalRevenue,
      activeProducts: products.filter(p => p.isActive).length,
      lowStockCount: products.filter(p => p.stock < 10).length,
      openTicketsCount: tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved').length,
      totalReviews: reviews.length
    };
  }
}

export const api = new SupabaseApiService();
