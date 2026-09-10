import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Testimonial } from '../models/content.model';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/testimonials`;

  getApprovedTestimonials(): Observable<Testimonial[]> {
    return this.http.get<{ success: boolean; data: Testimonial[] }>(this.baseUrl).pipe(
      map(res => res.data || [])
    );
  }

  submitTestimonial(data: { clientName: string; rating: number; message: string }): Observable<Testimonial> {
    return this.http.post<{ success: boolean; data: Testimonial }>(this.baseUrl, data).pipe(
      map(res => res.data)
    );
  }

  getAllTestimonialsAdmin(): Observable<Testimonial[]> {
    return this.http.get<{ success: boolean; data: Testimonial[] }>(`${this.baseUrl}/admin`).pipe(
      map(res => res.data || [])
    );
  }

  getPendingTestimonialsAdmin(): Observable<Testimonial[]> {
    return this.http.get<{ success: boolean; data: Testimonial[] }>(`${this.baseUrl}/pending`).pipe(
      map(res => res.data || [])
    );
  }

  approveTestimonial(id: string): Observable<Testimonial> {
    return this.http.patch<{ success: boolean; data: Testimonial }>(`${this.baseUrl}/${id}/approve`, {}).pipe(
      map(res => res.data)
    );
  }

  declineTestimonial(id: string): Observable<Testimonial> {
    return this.http.patch<{ success: boolean; data: Testimonial }>(`${this.baseUrl}/${id}/decline`, {}).pipe(
      map(res => res.data)
    );
  }
}
