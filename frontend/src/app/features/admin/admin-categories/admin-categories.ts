import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { SubcategoryService } from '../../../core/services/subcategory.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { Subcategory } from '../../../core/models/subcategory.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css'
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private subcategoryService = inject(SubcategoryService);
  private toast = inject(ToastService);

  public categories = signal<Category[]>([]);
  public subcategories = signal<Subcategory[]>([]);

  public categorySubmitted = signal<boolean>(false);
  public subcategorySubmitted = signal<boolean>(false);

  public newCategoryName = '';
  public newSubName = '';
  public newSubParent = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.categoryService.getAllCategoriesAdmin().subscribe(cats => this.categories.set(cats));
    this.subcategoryService.getAllSubcategoriesAdmin().subscribe(subs => this.subcategories.set(subs));
  }

  getCategoryName(cat: any): string {
    if (typeof cat === 'object' && cat !== null) {
      return cat.name;
    }
    const found = this.categories().find(c => c._id === cat);
    return found ? found.name : 'Unknown';
  }

  onCreateCategory(e: Event) {
    e.preventDefault();
    this.categorySubmitted.set(true);
    if (!this.newCategoryName.trim()) return;

    this.categoryService.createCategory({ name: this.newCategoryName.trim() }).subscribe({
      next: () => {
        this.toast.success('Category created.');
        this.newCategoryName = '';
        this.categorySubmitted.set(false);
        this.loadData();
      },
      error: err => this.toast.error(err.error?.message || 'Failed to create category')
    });
  }

  onCreateSubcategory(e: Event) {
    e.preventDefault();
    this.subcategorySubmitted.set(true);
    if (!this.newSubName.trim() || !this.newSubParent) {
      return;
    }

    this.subcategoryService.createSubcategory({
      name: this.newSubName.trim(),
      category: this.newSubParent
    }).subscribe({
      next: () => {
        this.toast.success('Subcategory linked and created.');
        this.newSubName = '';
        this.newSubParent = '';
        this.subcategorySubmitted.set(false);
        this.loadData();
      },
      error: err => this.toast.error(err.error?.message || 'Failed to create subcategory')
    });
  }

  onToggleCategory(id: string) {
    this.categoryService.toggleActive(id).subscribe({
      next: () => {
        this.toast.success('Category status updated.');
        this.loadData();
      }
    });
  }

  onToggleSubcategory(id: string) {
    this.subcategoryService.toggleActive(id).subscribe({
      next: () => {
        this.toast.success('Subcategory status updated.');
        this.loadData();
      }
    });
  }
}
