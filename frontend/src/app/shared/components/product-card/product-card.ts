import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() index = 0;

  public cartService = inject(CartService);
  public productService = inject(ProductService);

  private romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];

  getRomanIndex(i: number): string {
    return this.romanNumerals[i % this.romanNumerals.length];
  }

  onAddToCartClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (this.product.stock > 0) {
      this.cartService.addToCart(this.product, 1);
    }
  }

  onQuickViewClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const openQuickView = (window as any).__OPEN_QUICK_VIEW;
    if (typeof openQuickView === 'function') {
      openQuickView(this.product);
    }
  }
}
