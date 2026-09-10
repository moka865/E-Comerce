import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StoreContent } from '../models/content.model';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/content`;

  getContentByKey(key: 'faq' | 'about' | 'policies' | 'delivery_info'): Observable<StoreContent> {
    return this.http.get<{ success: boolean; data: StoreContent }>(`${this.baseUrl}/${key}`).pipe(
      map(res => res.data)
    );
  }

  getAllContentAdmin(): Observable<StoreContent[]> {
    return this.http.get<{ success: boolean; data: StoreContent[] }>(this.baseUrl).pipe(
      map(res => res.data || [])
    );
  }

  updateContent(key: string, data: { title: string; body: string }): Observable<StoreContent> {
    return this.http.put<{ success: boolean; data: StoreContent }>(`${this.baseUrl}/${key}`, data).pipe(
      map(res => res.data)
    );
  }
}
