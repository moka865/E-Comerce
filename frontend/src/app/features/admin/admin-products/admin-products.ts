import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { SubcategoryService } from '../../../core/services/subcategory.service';
import { SeasonService } from '../../../core/services/season.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { Subcategory } from '../../../core/models/subcategory.model';
import { Season } from '../../../core/models/season.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css'
})
export class AdminProductsComponent implements OnInit {
  public productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private subcategoryService = inject(SubcategoryService);
  private seasonService = inject(SeasonService);
  private toast = inject(ToastService);

  public products = signal<Product[]>([]);
  public categories = signal<Category[]>([]);
  public seasons = signal<Season[]>([]);
  public scopedSubcategories = signal<Subcategory[]>([]);

  public modalOpen = signal<boolean>(false);
  public submitting = signal<boolean>(false);
  public formSubmitted = signal<boolean>(false);
  public selectedImageFile: File | null = null;

  public newProd = {
    name: '',
    description: '',
    price: 500,
    stock: 10,
    category: '',
    subcategory: '',
    season: ''
  };

  ngOnInit() {
    this.loadProducts();
    this.categoryService.getActiveCategories().subscribe(cats => this.categories.set(cats));
    this.seasonService.getActiveSeasons().subscribe(seas => this.seasons.set(seas));
  }

  loadProducts() {
    this.productService.adminGetAllProducts(1, 50).subscribe(res => {
      this.products.set(res.data || []);
    });
  }

  onCategoryChange() {
    if (this.newProd.category) {
      this.subcategoryService.getByCategory(this.newProd.category).subscribe(subs => {
        this.scopedSubcategories.set(subs);
        this.newProd.subcategory = '';
      });
    } else {
      this.scopedSubcategories.set([]);
      this.newProd.subcategory = '';
    }
  }

  onFileSelect(e: any) {
    if (e.target.files && e.target.files[0]) {
      this.selectedImageFile = e.target.files[0];
    }
  }

  openCreateModal() {
    this.newProd = { name: '', description: '', price: 500, stock: 10, category: '', subcategory: '', season: '' };
    this.selectedImageFile = null;
    this.formSubmitted.set(false);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.formSubmitted.set(false);
    this.modalOpen.set(false);
  }

  onSubmitCreate(e: Event) {
    e.preventDefault();
    this.formSubmitted.set(true);

    if (
      !this.newProd.name.trim() ||
      this.newProd.price === null ||
      this.newProd.price === undefined ||
      this.newProd.price < 0 ||
      this.newProd.stock === null ||
      this.newProd.stock === undefined ||
      this.newProd.stock < 0 ||
      !this.newProd.category ||
      !this.newProd.subcategory
    ) {
      return;
    }

    this.submitting.set(true);
    const formData = new FormData();
    formData.append('name', this.newProd.name.trim());
    formData.append('description', this.newProd.description);
    formData.append('price', this.newProd.price.toString());
    formData.append('stock', this.newProd.stock.toString());
    formData.append('category', this.newProd.category);
    formData.append('subcategory', this.newProd.subcategory);
    if (this.newProd.season) formData.append('season', this.newProd.season);
    if (this.selectedImageFile) formData.append('image', this.selectedImageFile);

    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.toast.success('Piece published to atelier catalog.');
        this.submitting.set(false);
        this.formSubmitted.set(false);
        this.closeModal();
        this.loadProducts();
      },
      error: err => {
        this.submitting.set(false);
        this.toast.error(err.error?.message || 'Failed to create piece');
      }
    });
  }

  onToggleActive(id: string) {
    this.productService.toggleActive(id).subscribe({
      next: () => {
        this.toast.success('Status updated.');
        this.loadProducts();
      }
    });
  }

  onToggleTopSale(id: string) {
    this.productService.setTopSale(id).subscribe({
      next: () => {
        this.toast.success('Top Sale status updated.');
        this.loadProducts();
      }
    });
  }

  onToggleNewArrival(id: string) {
    this.productService.setNewArrival(id).subscribe({
      next: () => {
        this.toast.success('New Arrival status updated.');
        this.loadProducts();
      }
    });
  }

  onDeleteProduct(id: string) {
    if (confirm('Archive this piece from catalog?')) {
      this.productService.softDelete(id).subscribe({
        next: () => {
          this.toast.info('Piece archived.');
          this.loadProducts();
        }
      });
    }
  }
}
