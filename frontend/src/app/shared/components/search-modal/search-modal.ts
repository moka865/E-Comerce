import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './search-modal.html',
  styleUrl: './search-modal.css'
})
export class SearchModalComponent implements OnInit, OnDestroy {
  public productService = inject(ProductService);
  private router = inject(Router);

  public isOpen = signal<boolean>(false);
  public searchQuery = '';
  public results = signal<Product[]>([]);
  public loading = signal<boolean>(false);

  private timeoutId: any;

  ngOnInit() {
    (window as any).__OPEN_SEARCH_MODAL = () => {
      this.isOpen.set(true);
      this.searchQuery = '';
      this.results.set([]);
    };
  }

  ngOnDestroy() {
    delete (window as any).__OPEN_SEARCH_MODAL;
  }

  close() {
    this.isOpen.set(false);
  }

  onSearchChange(val: string) {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (!val || val.trim().length < 2) {
      this.results.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.timeoutId = setTimeout(() => {
      this.productService.getAllProducts({ search: val.trim(), limit: 6 }).subscribe({
        next: res => {
          this.results.set(res.data || []);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }, 300);
  }

  onEnter() {
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim();
      this.close();
      this.router.navigate(['/shop'], { queryParams: { search: q } });
    }
  }
}
