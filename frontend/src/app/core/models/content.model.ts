export interface StoreContent {
  _id?: string;
  key: 'faq' | 'about' | 'policies' | 'delivery_info';
  title: string;
  body: string;
  updatedAt?: string;
}

export interface Testimonial {
  _id: string;
  user: string;
  clientName: string;
  rating: number;
  message: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export interface AdminNotification {
  _id: string;
  type: 'new_order' | 'new_testimonial' | 'refund_request' | 'low_stock';
  title: string;
  message: string;
  referenceId?: string;
  referenceModel?: string;
  isRead: boolean;
  createdAt: string;
}
