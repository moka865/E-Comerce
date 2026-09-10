import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public email = '';
  public password = '';
  public submitted = signal<boolean>(false);
  public loading = signal<boolean>(false);
  public returnUrl = '/account';

  public touched = {
    email: false,
    password: false
  };

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/account';
  }

  isValidEmail(emailStr: string): boolean {
    const trimmed = emailStr ? emailStr.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  }

  onLogin(e: Event) {
    e.preventDefault();
    this.submitted.set(true);

    const trimmedEmail = this.email.trim();
    if (!trimmedEmail || !this.isValidEmail(trimmedEmail) || !this.password) {
      return;
    }

    this.loading.set(true);

    const guestCart = this.cartService.getGuestCartPayload();

    this.authService.login({
      email: trimmedEmail,
      password: this.password,
      guestCart: guestCart.length > 0 ? guestCart : undefined
    }).subscribe({
      next: () => {
        this.cartService.clearGuestCart();
        this.loading.set(false);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        this.loading.set(false);
        const msg = err.error?.message || (err.error?.errors && err.error.errors[0]?.msg) || 'Invalid email or password';
        this.toast.error(msg);
      }
    });
  }
}
