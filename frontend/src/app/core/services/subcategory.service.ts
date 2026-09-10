import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subcategory } from '../models/subcategory.model';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/subcategories`;

  getActiveSubcategories(categoryId?: string): Observable<Subcategory[]> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('category', categoryId);
    }

    return this.http.get<{ success: boolean; data: Subcategory[] }>(this.baseUrl, { params }).pipe(
      map(res => res.data || [])
    );
  }

  getByCategory(categoryId: string): Observable<Subcategory[]> {
    return this.http.get<{ success: boolean; data: Subcategory[] }>(`${this.baseUrl}/category/${categoryId}`).pipe(
      map(res => res.data || [])
    );
  }

  getAllSubcategoriesAdmin(categoryId?: string): Observable<Subcategory[]> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('category', categoryId);
    }

    return this.http.get<{ success: boolean; data: Subcategory[] }>(`${this.baseUrl}/admin`, { params }).pipe(
      map(res => res.data || [])
    );
  }

  createSubcategory(data: { name: string; category: string }): Observable<Subcategory> {
    return this.http.post<{ success: boolean; data: Subcategory }>(this.baseUrl, data).pipe(
      map(res => res.data)
    );
  }

  updateSubcategory(id: string, data: { name?: string; category?: string }): Observable<Subcategory> {
    return this.http.put<{ success: boolean; data: Subcategory }>(`${this.baseUrl}/${id}`, data).pipe(
      map(res => res.data)
    );
  }

  toggleActive(id: string): Observable<Subcategory> {
    return this.http.patch<{ success: boolean; data: Subcategory }>(`${this.baseUrl}/${id}/toggle-active`, {}).pipe(
      map(res => res.data)
    );
  }

  deleteSubcategory(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
