import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Season } from '../models/season.model';

@Injectable({
  providedIn: 'root'
})
export class SeasonService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/seasons`;

  getActiveSeasons(): Observable<Season[]> {
    return this.http.get<{ success: boolean; data: Season[] }>(this.baseUrl).pipe(
      map(res => res.data || [])
    );
  }

  getAllSeasonsAdmin(): Observable<Season[]> {
    return this.http.get<{ success: boolean; data: Season[] }>(`${this.baseUrl}/admin`).pipe(
      map(res => res.data || [])
    );
  }

  createSeason(data: { name: string }): Observable<Season> {
    return this.http.post<{ success: boolean; data: Season }>(this.baseUrl, data).pipe(
      map(res => res.data)
    );
  }

  updateSeason(id: string, data: { name: string }): Observable<Season> {
    return this.http.put<{ success: boolean; data: Season }>(`${this.baseUrl}/${id}`, data).pipe(
      map(res => res.data)
    );
  }

  toggleActive(id: string): Observable<Season> {
    return this.http.patch<{ success: boolean; data: Season }>(`${this.baseUrl}/${id}/toggle-active`, {}).pipe(
      map(res => res.data)
    );
  }

  deleteSeason(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
