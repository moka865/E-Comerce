import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);

  public loggedIn$ = new Subject<User>();
  public loggedOut$ = new Subject<void>();

  private getStoredUser(): User | null {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('maison_user') : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private currentUserSignal = signal<User | null>(this.getStoredUser());
  private tokenSignal = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem('maison_token') : null);

  public currentUser = this.currentUserSignal.asReadonly();
  public token = this.tokenSignal.asReadonly();
  public isAuthenticated = computed(() => !!this.tokenSignal() && !!this.currentUserSignal());
  public isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  constructor() {
    if (this.tokenSignal()) {
      this.fetchCurrentUser().subscribe();
    }
  }

  fetchCurrentUser(): Observable<any> {
    return this.http.get<{ success: boolean; data: User }>(`${environment.apiUrl}/auth/me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUserSignal.set(res.data);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('maison_user', JSON.stringify(res.data));
          }
        }
      }),
      catchError(err => {
        this.clearSession();
        return of(null);
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data.token, res.data.user);
          this.toast.success(`Welcome back, ${res.data.user.name}`);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data.token, res.data.user);
          this.toast.success(`Welcome to Maison Élégance, ${res.data.user.name}`);
        }
      })
    );
  }

  logout() {
    this.clearSession();
    this.toast.info('You have signed out.');
    this.router.navigate(['/']);
  }

  private setSession(token: string, user: User) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('maison_token', token);
      localStorage.setItem('maison_user', JSON.stringify(user));
    }
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
    this.loggedIn$.next(user);
  }

  private clearSession() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('maison_token');
      localStorage.removeItem('maison_user');
    }
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.loggedOut$.next();
  }

  updateUserSignal(user: User) {
    this.currentUserSignal.set(user);
  }
}
