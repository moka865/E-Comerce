import { Product } from './product.model';

export interface CartItem {
  _id?: string;
  product: Product;
  quantity: number;
  priceAtCart: number;
  isPriceChanged?: boolean;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
  totalPrice?: number;
}

export interface GuestCartItem {
  productId: string;
  quantity: number;
  product?: Product;
}
