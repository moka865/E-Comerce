import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quick-view-modal.html',
  styleUrl: './quick-view-modal.css'
})
export class QuickViewModalComponent implements OnInit, OnDestroy {
  public cartService = inject(CartService);
  public productService = inject(ProductService);

  public isOpen = signal<boolean>(false);
  public product = signal<Product | null>(null);
  public selectedQty = signal<number>(1);

  ngOnInit() {
    (window as any).__OPEN_QUICK_VIEW = (p: Product) => {
      this.product.set(p);
      this.selectedQty.set(1);
      this.isOpen.set(true);
    };
  }

  ngOnDestroy() {
    delete (window as any).__OPEN_QUICK_VIEW;
  }

  close() {
    this.isOpen.set(false);
    this.product.set(null);
  }

  incrementQty() {
    const stock = this.product()?.stock || 1;
    if (this.selectedQty() < stock) {
      this.selectedQty.update(q => q + 1);
    }
  }

  decrementQty() {
    if (this.selectedQty() > 1) {
      this.selectedQty.update(q => q - 1);
    }
  }

  addToBag() {
    const p = this.product();
    if (p && p.stock > 0) {
      this.cartService.addToCart(p, this.selectedQty());
      this.close();
    }
  }
}
