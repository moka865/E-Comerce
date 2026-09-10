import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { RegisterRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public formData: RegisterRequest = {
    name: '',
    email: '',
    mobilePhone: '',
    password: '',
    gender: 'female',
    dateOfBirth: ''
  };

  public submitted = signal<boolean>(false);
  public loading = signal<boolean>(false);
  public returnUrl = '/account';

  public touched = {
    name: false,
    email: false,
    mobilePhone: false,
    password: false,
    gender: false
  };

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/account';
  }

  isValidEmail(emailStr: string): boolean {
    const trimmed = emailStr ? emailStr.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  }

  isValidPhone(phoneStr: string): boolean {
    const trimmed = phoneStr ? phoneStr.trim() : '';
    const phoneRegex = /^01[0125][0-9]{8}$/;
    return phoneRegex.test(trimmed);
  }

  onRegister(e: Event) {
    e.preventDefault();
    this.submitted.set(true);

    const name = this.formData.name.trim();
    const email = this.formData.email.trim();
    const phone = this.formData.mobilePhone.trim();
    const password = this.formData.password;

    if (!name || name.length < 2) return;
    if (!email || !this.isValidEmail(email)) return;
    if (!phone || !this.isValidPhone(phone)) return;
    if (!password || password.length < 8) return;
    if (!this.formData.gender) return;

    this.loading.set(true);

    const guestCart = this.cartService.getGuestCartPayload();
    if (guestCart.length > 0) {
      this.formData.guestCart = guestCart;
    }

    this.authService.register({
      ...this.formData,
      name,
      email,
      mobilePhone: phone
    }).subscribe({
      next: () => {
        this.cartService.clearGuestCart();
        this.loading.set(false);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        this.loading.set(false);
        const msg = err.error?.message || (err.error?.errors && err.error.errors[0]?.msg) || 'Registration failed';
        this.toast.error(msg);
      }
    });
  }
}
