import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeliveryFee } from '../models/delivery-fee.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryFeeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/delivery-fees`;

  getActiveDeliveryFees(): Observable<DeliveryFee[]> {
    return this.http.get<{ success: boolean; data: DeliveryFee[] }>(this.baseUrl).pipe(
      map(res => res.data || [])
    );
  }

  getAllDeliveryFeesAdmin(): Observable<DeliveryFee[]> {
    return this.http.get<{ success: boolean; data: DeliveryFee[] }>(`${this.baseUrl}/admin`).pipe(
      map(res => res.data || [])
    );
  }

  createDeliveryFee(data: Partial<DeliveryFee>): Observable<DeliveryFee> {
    return this.http.post<{ success: boolean; data: DeliveryFee }>(this.baseUrl, data).pipe(
      map(res => res.data)
    );
  }

  updateDeliveryFee(id: string, data: Partial<DeliveryFee>): Observable<DeliveryFee> {
    return this.http.put<{ success: boolean; data: DeliveryFee }>(`${this.baseUrl}/${id}`, data).pipe(
      map(res => res.data)
    );
  }

  toggleActive(id: string): Observable<DeliveryFee> {
    return this.http.patch<{ success: boolean; data: DeliveryFee }>(`${this.baseUrl}/${id}/toggle-active`, {}).pipe(
      map(res => res.data)
    );
  }

  deleteDeliveryFee(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
