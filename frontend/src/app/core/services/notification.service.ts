import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminNotification } from '../models/content.model';
import { PaginationMeta } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/notifications`;

  public unreadCount = signal<number>(0);

  getNotifications(page = 1, limit = 20): Observable<{ data: AdminNotification[]; pagination: PaginationMeta }> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<{ success: boolean; data: AdminNotification[]; pagination: PaginationMeta }>(this.baseUrl, { params });
  }

  fetchUnreadCount(): Observable<number> {
    return this.http.get<{ success: boolean; data: { unreadCount: number } }>(`${this.baseUrl}/unread-count`).pipe(
      map(res => res.data?.unreadCount || 0),
      tap(count => this.unreadCount.set(count))
    );
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/read`, {}).pipe(
      tap(() => this.fetchUnreadCount().subscribe())
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.baseUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }
}
