import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  public orders = signal<Order[]>([]);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAllOrdersAdmin(1, 50).subscribe(res => {
      this.orders.set(res.data || []);
    });
  }

  onUpdateStatus(id: string, newStatus: string) {
    this.orderService.updateOrderStatus(id, newStatus as OrderStatus).subscribe({
      next: () => {
        this.toast.success(`Order status updated to ${newStatus}.`);
        this.loadOrders();
      },
      error: err => {
        this.toast.error(err.error?.message || 'Status transition not allowed');
        this.loadOrders();
      }
    });
  }

  onReviewRefund(id: string, decision: 'approved' | 'rejected') {
    this.orderService.reviewRefund(id, decision).subscribe({
      next: () => {
        this.toast.success(`Refund request ${decision}.`);
        this.loadOrders();
      },
      error: err => this.toast.error(err.error?.message || 'Refund review failed')
    });
  }
}
