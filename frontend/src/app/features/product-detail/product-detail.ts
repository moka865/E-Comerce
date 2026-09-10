import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  public productService = inject(ProductService);
  private cartService = inject(CartService);
  private analyticsService = inject(AnalyticsService);
  private route = inject(ActivatedRoute);

  public product = signal<Product | null>(null);
  public relatedProducts = signal<Product[]>([]);
  public quantity = signal<number>(1);
  public loading = signal<boolean>(true);
  public error = signal<boolean>(false);
  public openAccordion = signal<string>('delivery');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchProduct(slug);
      }
    });
  }

  fetchProduct(slug: string) {
    this.loading.set(true);
    this.error.set(false);
    this.quantity.set(1);

    this.productService.getProductBySlug(slug).subscribe({
      next: p => {
        this.product.set(p);
        this.loading.set(false);

        this.analyticsService.trackEvent(
          'product_view',
          p._id,
          p.category?._id || p.category as any,
          p.subcategory?._id || p.subcategory as any
        ).subscribe();

        if (p.category?._id) {
          this.productService.getAllProducts({ category: p.category._id, limit: 4 }).subscribe(res => {
            const related = (res.data || []).filter(item => item._id !== p._id).slice(0, 3);
            this.relatedProducts.set(related);
          });
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  incrementQty() {
    const p = this.product();
    if (p && this.quantity() < p.stock) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQty() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToBag() {
    const p = this.product();
    if (p && p.stock > 0) {
      this.cartService.addToCart(p, this.quantity());
    }
  }

  toggleAccordion(tab: string) {
    if (this.openAccordion() === tab) {
      this.openAccordion.set('');
    } else {
      this.openAccordion.set(tab);
    }
  }
}
