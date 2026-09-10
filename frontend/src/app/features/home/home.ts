import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { TestimonialService } from '../../core/services/testimonial.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Testimonial } from '../../core/models/content.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private testimonialService = inject(TestimonialService);
  private analyticsService = inject(AnalyticsService);

  public newArrivals = signal<Product[]>([]);
  public topSales = signal<Product[]>([]);
  public categories = signal<Category[]>([]);
  public testimonials = signal<Testimonial[]>([]);
  public recommendations = signal<Product[]>([]);

  ngOnInit() {
    this.productService.getNewArrivals(6).subscribe(prods => this.newArrivals.set(prods));
    this.productService.getTopSales(3).subscribe(prods => this.topSales.set(prods));
    this.categoryService.getActiveCategories().subscribe(cats => this.categories.set(cats.slice(0, 4)));
    this.testimonialService.getApprovedTestimonials().subscribe(t => this.testimonials.set(t.slice(0, 3)));
    this.analyticsService.getRecommendations().subscribe(recs => this.recommendations.set(recs.slice(0, 3)));
  }

  getCategoryBg(slug: string): string {
    const map: Record<string, string> = {
      'outerwear-coats': 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1200&q=85',
      'architectural-tailoring': 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1200&q=85',
      'luxury-knitwear': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85',
      'selvedge-denim': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85',
      'evening-atelier': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85'
    };
    return map[slug] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85';
  }
}
