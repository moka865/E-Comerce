import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { SubcategoryService } from '../../../core/services/subcategory.service';
import { Category } from '../../../core/models/category.model';
import { Subcategory } from '../../../core/models/subcategory.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private categoryService = inject(CategoryService);
  private subcategoryService = inject(SubcategoryService);

  public categories = signal<Category[]>([]);
  public subcategories = signal<Subcategory[]>([]);
  public activeCategory = signal<string | null>(null);
  public isAccountHovered = signal<boolean>(false);
  public mobileMenuOpen = signal<boolean>(false);
  public isScrolled = signal<boolean>(false);

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  ngOnInit() {
    this.categoryService.getActiveCategories().subscribe(cats => {
      this.categories.set(cats);
    });

    this.subcategoryService.getActiveSubcategories().subscribe(subs => {
      this.subcategories.set(subs);
    });
  }

  setActiveCategory(catId: string | null) {
    this.activeCategory.set(catId);
  }

  getSubcategoriesFor(categoryId: string): Subcategory[] {
    return this.subcategories().filter(s => {
      if (typeof s.category === 'object' && s.category !== null) {
        return s.category._id === categoryId;
      }
      return s.category === categoryId;
    });
  }

  openSearch() {
    const searchModal = (window as any).__OPEN_SEARCH_MODAL;
    if (typeof searchModal === 'function') searchModal();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
