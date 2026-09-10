import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { SubcategoryService } from '../../core/services/subcategory.service';
import { SeasonService } from '../../core/services/season.service';
import { Product, ProductFilters, PaginationMeta, ProductListResponse } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Subcategory } from '../../core/models/subcategory.model';
import { Season } from '../../core/models/season.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './shop.html',
  styleUrl: './shop.css'
})
export class ShopComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private subcategoryService = inject(SubcategoryService);
  private seasonService = inject(SeasonService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public products = signal<Product[]>([]);
  public categories = signal<Category[]>([]);
  public subcategories = signal<Subcategory[]>([]);
  public seasons = signal<Season[]>([]);
  public paginationMeta = signal<PaginationMeta | null>(null);
  public loading = signal<boolean>(false);
  public mobileFilterOpen = signal<boolean>(false);

  public selectedCategory = signal<string>('');
  public selectedSubcategory = signal<string>('');
  public selectedSeason = signal<string>('');
  public onlyInStock = signal<boolean>(false);
  public minPrice = signal<number | null>(null);
  public maxPrice = signal<number | null>(null);
  public searchQuery = signal<string>('');
  public currentSort = signal<string>('newest');
  public currentPage = signal<number>(1);

  ngOnInit() {
    this.categoryService.getActiveCategories().subscribe(cats => this.categories.set(cats));
    this.seasonService.getActiveSeasons().subscribe(seas => this.seasons.set(seas));

    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
        this.loadSubcategoriesForCategory(params['category']);
      } else {
        this.selectedCategory.set('');
        this.loadAllSubcategories();
      }

      if (params['subcategory']) {
        this.selectedSubcategory.set(params['subcategory']);
      } else {
        this.selectedSubcategory.set('');
      }

      if (params['season']) {
        this.selectedSeason.set(params['season']);
      }

      if (params['search']) {
        this.searchQuery.set(params['search']);
      }

      if (params['page']) {
        this.currentPage.set(parseInt(params['page']) || 1);
      }

      this.fetchProducts();
    });
  }

  fetchProducts() {
    this.loading.set(true);

    const filters: ProductFilters = {
      page: this.currentPage(),
      limit: 9
    };

    if (this.selectedCategory()) filters.category = this.selectedCategory();
    if (this.selectedSubcategory()) filters.subcategory = this.selectedSubcategory();
    if (this.selectedSeason()) filters.season = this.selectedSeason();
    if (this.onlyInStock()) filters.availability = 'in_stock';
    if (this.minPrice() !== null && this.minPrice()! > 0) filters.minPrice = this.minPrice()!;
    if (this.maxPrice() !== null && this.maxPrice()! > 0) filters.maxPrice = this.maxPrice()!;
    if (this.searchQuery()) filters.search = this.searchQuery();

    if (this.currentSort() === 'price-asc') {
      filters.sortBy = 'price';
      filters.order = 'asc';
    } else if (this.currentSort() === 'price-desc') {
      filters.sortBy = 'price';
      filters.order = 'desc';
    } else if (this.currentSort() === 'top-sales') {
      filters.sortBy = 'sold';
      filters.order = 'desc';
    } else {
      filters.sortBy = 'createdAt';
      filters.order = 'desc';
    }

    this.productService.getAllProducts(filters).subscribe({
      next: (res: ProductListResponse) => {
        this.products.set(res.data);
        this.paginationMeta.set(res.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadAllSubcategories() {
    this.subcategoryService.getActiveSubcategories().subscribe((subs: Subcategory[]) => {
      this.subcategories.set(subs);
    });
  }

  loadSubcategoriesForCategory(catId: string) {
    this.subcategoryService.getByCategory(catId).subscribe((subs: Subcategory[]) => {
      this.subcategories.set(subs);
    });
  }

  selectCategory(catId: string) {
    this.selectedCategory.set(catId);
    this.selectedSubcategory.set('');
    this.currentPage.set(1);
    if (catId) {
      this.loadSubcategoriesForCategory(catId);
    } else {
      this.loadAllSubcategories();
    }
    this.updateQueryParams();
  }

  selectSubcategory(subId: string) {
    this.selectedSubcategory.set(subId);
    this.currentPage.set(1);
    this.updateQueryParams();
  }

  selectSeason(seasonId: string) {
    this.selectedSeason.set(seasonId);
    this.currentPage.set(1);
    this.updateQueryParams();
  }

  toggleInStock(e: any) {
    this.onlyInStock.set(e.target.checked);
    this.currentPage.set(1);
    this.fetchProducts();
  }

  onMinPriceChange(val: number | null) {
    this.minPrice.set(val);
    this.currentPage.set(1);
    this.fetchProducts();
  }

  onMaxPriceChange(val: number | null) {
    this.maxPrice.set(val);
    this.currentPage.set(1);
    this.fetchProducts();
  }

  clearPriceFilter() {
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.fetchProducts();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.updateQueryParams();
  }

  onSortChange(sort: string) {
    this.currentSort.set(sort);
    this.fetchProducts();
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.updateQueryParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  hasActiveFilters(): boolean {
    return (
      !!this.selectedCategory() ||
      !!this.selectedSubcategory() ||
      !!this.selectedSeason() ||
      this.onlyInStock() ||
      !!this.searchQuery() ||
      this.minPrice() !== null ||
      this.maxPrice() !== null
    );
  }

  clearAllFilters() {
    this.selectedCategory.set('');
    this.selectedSubcategory.set('');
    this.selectedSeason.set('');
    this.onlyInStock.set(false);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadAllSubcategories();
    this.updateQueryParams();
  }

  updateQueryParams() {
    const q: any = {};
    if (this.selectedCategory()) q.category = this.selectedCategory();
    if (this.selectedSubcategory()) q.subcategory = this.selectedSubcategory();
    if (this.selectedSeason()) q.season = this.selectedSeason();
    if (this.searchQuery()) q.search = this.searchQuery();
    if (this.currentPage() > 1) q.page = this.currentPage();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: q
    });
  }

  getCategoryName(id: string): string {
    return this.categories().find(c => c._id === id)?.name || id;
  }

  getSubcategoryName(id: string): string {
    return this.subcategories().find(s => s._id === id)?.name || id;
  }

  getSeasonName(id: string): string {
    return this.seasons().find(s => s._id === id)?.name || id;
  }

  toggleMobileFilters() {
    this.mobileFilterOpen.update(v => !v);
  }
}
