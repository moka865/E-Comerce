import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, GuestCartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private baseUrl = `${environment.apiUrl}/cart`;

  private itemsSignal = signal<CartItem[]>(this.getInitialGuestCart());
  public items = this.itemsSignal.asReadonly();

  public isDrawerOpen = signal<boolean>(false);

  public totalCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  public totalPrice = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + (item.priceAtCart || item.product?.price || 0) * item.quantity, 0)
  );

  constructor() {
    if (this.authService.token() && !this.authService.isAdmin()) {
      this.fetchBackendCart().subscribe();
    }

    this.authService.loggedIn$.subscribe(user => {
      this.clearGuestCart();
      if (user.role !== 'admin') {
        this.fetchBackendCart().subscribe();
      } else {
        this.itemsSignal.set([]);
      }
    });

    this.authService.loggedOut$.subscribe(() => {
      this.resetOnLogout();
    });
  }

  private getInitialGuestCart(): CartItem[] {
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('maison_token') : null;
      if (token) {
        return [];
      }
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('maison_guest_cart') : null;
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  fetchBackendCart(): Observable<any> {
    if (this.authService.isAdmin()) return of(null);

    return this.http.get<{ success: boolean; data: Cart }>(this.baseUrl).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.itemsSignal.set(res.data.items || []);
        }
      }),
      catchError(err => {
        return of(null);
      })
    );
  }

  addToCart(product: Product, quantity = 1) {
    if (this.authService.isAdmin()) {
      this.toast.warning('Admins are restricted to store management. Purchasing is disabled.');
      return;
    }

    if (this.authService.isAuthenticated()) {
      this.http.post<{ success: boolean; data: Cart }>(`${this.baseUrl}/items`, {
        productId: product._id,
        quantity
      }).pipe(
        tap(res => {
          if (res.success && res.data) {
            this.itemsSignal.set(res.data.items || []);
            this.toast.success(`Added ${product.name} to Bag`);
            this.openDrawer();
          }
        }),
        catchError(err => {
          const msg = err.error?.message || 'Could not add to cart';
          this.toast.error(msg);
          return of(null);
        })
      ).subscribe();
    } else {
      const current = [...this.itemsSignal()];
      const idx = current.findIndex(i => i.product._id === product._id);

      if (idx > -1) {
        current[idx] = {
          ...current[idx],
          quantity: current[idx].quantity + quantity
        };
      } else {
        current.push({
          product,
          quantity,
          priceAtCart: product.price
        });
      }

      this.itemsSignal.set(current);
      this.saveGuestCart(current);
      this.toast.success(`Added ${product.name} to Bag`);
      this.openDrawer();
    }
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) {
      this.removeItem(item);
      return;
    }

    if (this.authService.isAuthenticated() && item._id) {
      this.http.patch<{ success: boolean; data: Cart }>(`${this.baseUrl}/items/${item._id}/quantity`, {
        quantity
      }).pipe(
        tap(res => {
          if (res.success && res.data) {
            this.itemsSignal.set(res.data.items || []);
          }
        }),
        catchError(err => {
          const msg = err.error?.message || 'Could not update quantity';
          this.toast.error(msg);
          return of(null);
        })
      ).subscribe();
    } else if (!this.authService.isAuthenticated()) {
      const current = this.itemsSignal().map(i => {
        if (i.product._id === item.product._id) {
          return { ...i, quantity };
        }
        return i;
      });
      this.itemsSignal.set(current);
      this.saveGuestCart(current);
    }
  }

  removeItem(item: CartItem) {
    if (this.authService.isAuthenticated() && item._id) {
      this.http.delete<{ success: boolean; data: Cart }>(`${this.baseUrl}/items/${item._id}`).pipe(
        tap(res => {
          if (res.success && res.data) {
            this.itemsSignal.set(res.data.items || []);
            this.toast.info('Item removed from Bag');
          }
        }),
        catchError(err => {
          this.toast.error('Could not remove item');
          return of(null);
        })
      ).subscribe();
    } else if (!this.authService.isAuthenticated()) {
      const current = this.itemsSignal().filter(i => i.product._id !== item.product._id);
      this.itemsSignal.set(current);
      this.saveGuestCart(current);
      this.toast.info('Item removed from Bag');
    }
  }

  clearCart() {
    if (this.authService.isAuthenticated()) {
      this.http.delete(this.baseUrl).subscribe(() => {
        this.itemsSignal.set([]);
      });
    } else {
      this.itemsSignal.set([]);
      this.clearGuestCart();
    }
  }

  public resetOnLogout() {
    this.itemsSignal.set([]);
    this.clearGuestCart();
    this.isDrawerOpen.set(false);
  }

  public clearGuestCart() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('maison_guest_cart');
      }
    } catch {}
  }

  acceptPriceChange(itemId: string) {
    this.http.patch<{ success: boolean; data: Cart }>(`${this.baseUrl}/items/${itemId}/accept-price`, {}).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.itemsSignal.set(res.data.items || []);
          this.toast.success('Updated price accepted');
        }
      })
    ).subscribe();
  }

  openDrawer() {
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer() {
    this.isDrawerOpen.update(v => !v);
  }

  private loadGuestCart() {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('maison_guest_cart') : null;
      if (saved) {
        this.itemsSignal.set(JSON.parse(saved));
      } else {
        this.itemsSignal.set([]);
      }
    } catch {
      this.itemsSignal.set([]);
    }
  }

  private saveGuestCart(items: CartItem[]) {
    if (this.authService.isAuthenticated()) {
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('maison_guest_cart', JSON.stringify(items));
    }
  }

  getGuestCartPayload(): { productId: string; quantity: number }[] {
    if (this.authService.isAuthenticated()) return [];
    return this.itemsSignal()
      .filter(i => !!i.product?._id)
      .map(i => ({
        productId: i.product._id,
        quantity: i.quantity
      }));
  }
}
