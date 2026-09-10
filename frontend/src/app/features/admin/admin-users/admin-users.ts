import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';
import { PaginationMeta } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private toast = inject(ToastService);

  public users = signal<User[]>([]);
  public pagination = signal<PaginationMeta | null>(null);
  public loading = signal<boolean>(false);

  public searchQuery = '';
  public currentPage = 1;
  public readonly pageSize = 15;

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchQuery = term;
      this.currentPage = 1;
      this.loadUsers();
    });

    this.loadUsers();
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  isSearchActive(): boolean {
    return Boolean(this.searchQuery && this.searchQuery.trim().length > 0);
  }

  onSearchChange(term: string) {
    this.searchQuery = term;
    this.searchSubject.next(term);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  goToPage(page: number) {
    if (page < 1) return;
    const maxPage = this.pagination()?.totalPages || 1;
    if (page > maxPage) return;

    this.currentPage = page;
    this.loadUsers();
  }

  getStartRecord(): number {
    if (!this.pagination() || this.pagination()!.total === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndRecord(): number {
    if (!this.pagination()) return 0;
    return Math.min(this.currentPage * this.pageSize, this.pagination()?.total || 0);
  }

  loadUsers() {
    this.loading.set(true);

    this.userService.getAllUsersAdmin({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchQuery.trim() || undefined
    }).subscribe({
      next: res => {
        this.users.set(res.data || []);
        this.pagination.set(res.pagination || null);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Could not load patron accounts');
      }
    });
  }

  onBlockUser(user: User) {
    if (user.role === 'admin') {
      this.toast.error('Admin accounts cannot be blocked.');
      return;
    }

    if (confirm(`Are you sure you want to block ${user.name} (${user.email}) from accessing their account?`)) {
      this.userService.blockUser(user._id).subscribe({
        next: () => {
          this.toast.success(`Patron ${user.name} has been blocked.`);
          this.loadUsers();
        },
        error: err => {
          this.toast.error(err.error?.message || 'Failed to block user');
        }
      });
    }
  }

  onUnblockUser(user: User) {
    if (confirm(`Re-activate atelier account access for ${user.name} (${user.email})?`)) {
      this.userService.unblockUser(user._id).subscribe({
        next: () => {
          this.toast.success(`Patron ${user.name} has been unblocked.`);
          this.loadUsers();
        },
        error: err => {
          this.toast.error(err.error?.message || 'Failed to unblock user');
        }
      });
    }
  }
}
