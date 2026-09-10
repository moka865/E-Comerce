import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/analytics`;

  trackEvent(eventType: string, productId?: string, categoryId?: string, subcategoryId?: string): Observable<any> {
    const sessionId = this.getOrCreateSessionId();
    return this.http.post(`${this.baseUrl}/events`, {
      eventType,
      productId,
      categoryId,
      subcategoryId,
      sessionId
    });
  }

  getRecommendations(): Observable<Product[]> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.baseUrl}/recommendations`).pipe(
      map(res => res.data || [])
    );
  }

  getInsights(from?: string, to?: string): Observable<any> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<{ success: boolean; data: any }>(`${this.baseUrl}/insights`, { params }).pipe(
      map(res => res.data)
    );
  }

  getTopProducts(limit = 5, from?: string, to?: string): Observable<any[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/top-products`, { params }).pipe(
      map(res => res.data || [])
    );
  }

  getTopCustomers(limit = 5, from?: string, to?: string): Observable<any[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/top-customers`, { params }).pipe(
      map(res => res.data || [])
    );
  }

  private getOrCreateSessionId(): string {
    let sid = sessionStorage.getItem('maison_session');
    if (!sid) {
      sid = 'ses_' + Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem('maison_session', sid);
    }
    return sid;
  }
}
