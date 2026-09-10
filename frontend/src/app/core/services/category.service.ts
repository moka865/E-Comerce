import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/categories`;

  getActiveCategories(): Observable<Category[]> {
    return this.http.get<{ success: boolean; data: Category[] }>(this.baseUrl).pipe(
      map(res => res.data || [])
    );
  }

  getAllCategoriesAdmin(): Observable<Category[]> {
    return this.http.get<{ success: boolean; data: Category[] }>(`${this.baseUrl}/admin`).pipe(
      map(res => res.data || [])
    );
  }

  createCategory(data: { name: string }): Observable<Category> {
    return this.http.post<{ success: boolean; data: Category }>(this.baseUrl, data).pipe(
      map(res => res.data)
    );
  }

  updateCategory(id: string, data: { name: string }): Observable<Category> {
    return this.http.put<{ success: boolean; data: Category }>(`${this.baseUrl}/${id}`, data).pipe(
      map(res => res.data)
    );
  }

  toggleActive(id: string): Observable<Category> {
    return this.http.patch<{ success: boolean; data: Category }>(`${this.baseUrl}/${id}/toggle-active`, {}).pipe(
      map(res => res.data)
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
