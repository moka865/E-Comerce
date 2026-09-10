import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderStatus } from '../models/order.model';
import { PaginationMeta } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/orders`;

  createOrder(addressId: string): Observable<Order> {
    return this.http.post<{ success: boolean; data: Order }>(this.baseUrl, { addressId }).pipe(
      map(res => res.data)
    );
  }

  getUserOrders(page = 1, limit = 10, status?: string): Observable<{ data: Order[]; pagination: PaginationMeta }> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (status) params = params.set('status', status);

    return this.http.get<{ success: boolean; data: Order[]; pagination: PaginationMeta }>(`${this.baseUrl}/my-orders`, { params });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.baseUrl}/my-orders/${id}`).pipe(
      map(res => res.data)
    );
  }

  cancelOrder(id: string): Observable<Order> {
    return this.http.patch<{ success: boolean; data: Order }>(`${this.baseUrl}/${id}/cancel`, {}).pipe(
      map(res => res.data)
    );
  }

  requestRefund(id: string, reason: string): Observable<Order> {
    return this.http.post<{ success: boolean; data: Order }>(`${this.baseUrl}/${id}/refund`, { reason }).pipe(
      map(res => res.data)
    );
  }

  getAllOrdersAdmin(page = 1, limit = 20): Observable<{ data: Order[]; pagination: PaginationMeta }> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<{ success: boolean; data: Order[]; pagination: PaginationMeta }>(this.baseUrl, { params });
  }

  updateOrderStatus(id: string, status: OrderStatus, note?: string): Observable<Order> {
    return this.http.patch<{ success: boolean; data: Order }>(`${this.baseUrl}/${id}/status`, { status, note }).pipe(
      map(res => res.data)
    );
  }

  reviewRefund(id: string, refundStatus: 'approved' | 'rejected'): Observable<Order> {
    return this.http.patch<{ success: boolean; data: Order }>(`${this.baseUrl}/${id}/refund-review`, { refundStatus }).pipe(
      map(res => res.data)
    );
  }
}
