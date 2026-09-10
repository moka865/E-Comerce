import { Address } from './user.model';
import { Product } from './product.model';

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'confirmed'
  | 'shipped'
  | 'received'
  | 'canceled'
  | 'rejected';

export type RefundStatus = 'none' | 'requested' | 'approved' | 'rejected';

export interface OrderItem {
  _id?: string;
  product: Product | { _id: string; name: string; slug: string; image?: string };
  productName: string;
  priceAtOrder: number;
  quantity: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedBy?: { _id: string; name: string };
  changedAt: string;
  note?: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  deliveryAddress: Address;
  deliveryFee: number;
  subtotal: number;
  totalPrice: number;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  paymentMethod: 'cash_on_delivery';
  refundStatus: RefundStatus;
  refundReason?: string;
  refundRequestedAt?: string;
  createdAt: string;
  updatedAt: string;
}
