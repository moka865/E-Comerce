import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductListResponse, ProductSingleResponse, ProductFilters } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/products`;

  getAllProducts(filters: ProductFilters = {}): Observable<ProductListResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.order) params = params.set('order', filters.order);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.subcategory) params = params.set('subcategory', filters.subcategory);
    if (filters.season) params = params.set('season', filters.season);
    if (filters.minPrice !== undefined && filters.minPrice !== null) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.availability) params = params.set('availability', filters.availability);
    if (filters.search) params = params.set('search', filters.search);

    return this.http.get<ProductListResponse>(this.baseUrl, { params });
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<ProductSingleResponse>(`${this.baseUrl}/slug/${slug}`).pipe(
      map(res => res.data)
    );
  }

  getNewArrivals(limit = 8): Observable<Product[]> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.baseUrl}/new-arrivals?limit=${limit}`).pipe(
      map(res => res.data || [])
    );
  }

  getTopSales(limit = 8): Observable<Product[]> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.baseUrl}/top-sales?limit=${limit}`).pipe(
      map(res => res.data || [])
    );
  }

  adminGetAllProducts(page = 1, limit = 20, isDeleted?: boolean, category?: string): Observable<ProductListResponse> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (isDeleted !== undefined) params = params.set('isDeleted', isDeleted.toString());
    if (category) params = params.set('category', category);

    return this.http.get<ProductListResponse>(`${this.baseUrl}/admin`, { params });
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<{ success: boolean; data: Product }>(this.baseUrl, formData).pipe(
      map(res => res.data)
    );
  }

  updateProduct(id: string, formData: FormData): Observable<Product> {
    return this.http.put<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}`, formData).pipe(
      map(res => res.data)
    );
  }

  toggleActive(id: string): Observable<Product> {
    return this.http.patch<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}/toggle-active`, {}).pipe(
      map(res => res.data)
    );
  }

  softDelete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  restoreProduct(id: string): Observable<Product> {
    return this.http.patch<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}/restore`, {}).pipe(
      map(res => res.data)
    );
  }

  setTopSale(id: string): Observable<Product> {
    return this.http.patch<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}/top-sale`, {}).pipe(
      map(res => res.data)
    );
  }

  setNewArrival(id: string): Observable<Product> {
    return this.http.patch<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}/new-arrival`, {}).pipe(
      map(res => res.data)
    );
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1200&q=85';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${environment.filesUrl}/${imagePath}`;
  }
}
