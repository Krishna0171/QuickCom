
export type Category = 'Home & Kitchen' | 'Toys' | 'Electronics' | 'Lifestyle' | 'Utility';

export type PaymentMethod = 'UPI' | 'Card' | 'COD';

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  mobile: string;
  email?: string;
  password?: string;
  role: 'admin' | 'customer';
  name: string;
  address?: Address;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export type TicketStatus = 'Open' | 'Pending' | 'Resolved' | 'Closed';

export interface TicketReply {
  id: string;
  sender: 'User' | 'Admin';
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  orderId?: string;
  message: string;
  status: TicketStatus;
  replies: TicketReply[];
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  lowStockCount: number;
  openTicketsCount: number;
  totalReviews: number;
}
