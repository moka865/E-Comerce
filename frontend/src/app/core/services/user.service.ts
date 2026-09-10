import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Address, UserQueryParams } from '../models/user.model';
import { PaginationMeta } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/users`;

  updateProfile(data: { name?: string; email?: string; dateOfBirth?: string }): Observable<User> {
    return this.http.patch<{ success: boolean; data: User }>(`${this.baseUrl}/profile`, data).pipe(
      map(res => res.data),
      tap(user => {
        this.authService.updateUserSignal(user);
      })
    );
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<{ success: boolean; data: Address[] }>(`${this.baseUrl}/addresses`).pipe(
      map(res => res.data || [])
    );
  }

  addAddress(address: Address): Observable<Address[]> {
    return this.http.post<{ success: boolean; data: Address[] }>(`${this.baseUrl}/addresses`, address).pipe(
      map(res => res.data),
      tap(() => this.authService.fetchCurrentUser().subscribe())
    );
  }

  updateAddress(id: string, address: Partial<Address>): Observable<Address[]> {
    return this.http.patch<{ success: boolean; data: Address[] }>(`${this.baseUrl}/addresses/${id}`, address).pipe(
      map(res => res.data),
      tap(() => this.authService.fetchCurrentUser().subscribe())
    );
  }

  deleteAddress(id: string): Observable<Address[]> {
    return this.http.delete<{ success: boolean; data: Address[] }>(`${this.baseUrl}/addresses/${id}`).pipe(
      map(res => res.data),
      tap(() => this.authService.fetchCurrentUser().subscribe())
    );
  }

  setDefaultAddress(id: string): Observable<Address[]> {
    return this.http.patch<{ success: boolean; data: Address[] }>(`${this.baseUrl}/addresses/${id}/default`, {}).pipe(
      map(res => res.data),
      tap(() => this.authService.fetchCurrentUser().subscribe())
    );
  }

  getAllUsersAdmin(queryParams?: UserQueryParams): Observable<{ data: User[]; pagination: PaginationMeta }>;
  getAllUsersAdmin(page?: number, limit?: number, search?: string): Observable<{ data: User[]; pagination: PaginationMeta }>;
  getAllUsersAdmin(
    paramsOrPage: UserQueryParams | number = 1,
    maybeLimit: number = 20,
    maybeSearch?: string
  ): Observable<{ data: User[]; pagination: PaginationMeta }> {
    let params = new HttpParams();

    if (typeof paramsOrPage === 'object' && paramsOrPage !== null) {
      const q = paramsOrPage;
      if (q.page !== undefined && q.page !== null) params = params.set('page', q.page.toString());
      if (q.limit !== undefined && q.limit !== null) params = params.set('limit', q.limit.toString());
      if (q.search && q.search.trim()) params = params.set('search', q.search.trim());
      if (q.role) params = params.set('role', q.role);
      if (q.isBlocked !== undefined && q.isBlocked !== '') params = params.set('isBlocked', q.isBlocked.toString());
      if (q.sortBy) params = params.set('sortBy', q.sortBy);
      if (q.order) params = params.set('order', q.order);
    } else {
      const page = typeof paramsOrPage === 'number' ? paramsOrPage : 1;
      params = params.set('page', page.toString()).set('limit', maybeLimit.toString());
      if (maybeSearch && maybeSearch.trim()) {
        params = params.set('search', maybeSearch.trim());
      }
    }

    return this.http.get<{ success: boolean; data: User[]; pagination: PaginationMeta }>(this.baseUrl, { params });
  }

  blockUser(id: string): Observable<User> {
    return this.http.patch<{ success: boolean; data: User }>(`${this.baseUrl}/${id}/block`, {}).pipe(
      map(res => res.data)
    );
  }

  unblockUser(id: string): Observable<User> {
    return this.http.patch<{ success: boolean; data: User }>(`${this.baseUrl}/${id}/unblock`, {}).pipe(
      map(res => res.data)
    );
  }
}
