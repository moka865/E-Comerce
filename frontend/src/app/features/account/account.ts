import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { DeliveryFeeService } from '../../core/services/delivery-fee.service';
import { TestimonialService } from '../../core/services/testimonial.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductService } from '../../core/services/product.service';
import { Order } from '../../core/models/order.model';
import { Address } from '../../core/models/user.model';
import { DeliveryFee } from '../../core/models/delivery-fee.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class AccountComponent implements OnInit {
  public authService = inject(AuthService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private deliveryFeeService = inject(DeliveryFeeService);
  private testimonialService = inject(TestimonialService);
  private toast = inject(ToastService);
  public productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  public activeTab = signal<'orders' | 'addresses' | 'profile' | 'testimonial'>('orders');
  public orders = signal<Order[]>([]);
  public addresses = signal<Address[]>([]);
  public deliveryFees = signal<DeliveryFee[]>([]);
  public loadingOrders = signal<boolean>(false);
  public showNewAddress = signal<boolean>(false);
  public savingProfile = signal<boolean>(false);
  public submittingTestimonial = signal<boolean>(false);
  public addressSubmitted = signal<boolean>(false);
  public profileSubmitted = signal<boolean>(false);
  public testimonialSubmitted = signal<boolean>(false);
  public refundSubmitted = signal<boolean>(false);

  isValidEmail(emailStr: string): boolean {
    const trimmed = emailStr ? emailStr.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  }

  public profileData = {
    name: '',
    email: '',
    dateOfBirth: ''
  };

  public testimonialData = {
    clientName: '',
    rating: 5,
    message: ''
  };

  public newAddressData: Address = {
    address: '',
    governorate: '',
    city: '',
    area: '',
    buildingDetails: '',
    isDefault: false
  };

  public refundModalOpen = signal<boolean>(false);
  public refundOrderId = '';
  public refundReason = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab.set(params['tab']);
      }
    });

    const user = this.authService.currentUser();
    if (user) {
      this.profileData.name = user.name;
      this.profileData.email = user.email;
      this.profileData.dateOfBirth = user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '';
      this.testimonialData.clientName = user.name;
    }

    this.loadOrders();
    this.loadAddresses();
    this.deliveryFeeService.getActiveDeliveryFees().subscribe(fees => this.deliveryFees.set(fees));
  }

  setTab(tab: 'orders' | 'addresses' | 'profile' | 'testimonial') {
    this.activeTab.set(tab);
  }

  loadOrders() {
    this.loadingOrders.set(true);
    this.orderService.getUserOrders(1, 20).subscribe({
      next: res => {
        this.orders.set(res.data || []);
        this.loadingOrders.set(false);
      },
      error: () => this.loadingOrders.set(false)
    });
  }

  loadAddresses() {
    this.userService.getAddresses().subscribe(addrs => {
      this.addresses.set(addrs);
    });
  }

  getItemImage(it: any): string {
    return it.product?.image || '';
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-neutral',
      preparing: 'badge-new',
      confirmed: 'badge-new',
      shipped: 'badge-new',
      received: 'badge-save',
      canceled: 'badge-sale',
      rejected: 'badge-sale'
    };
    return map[status] || 'badge-neutral';
  }

  isStepDone(currentStatus: string, stepStatus: string): boolean {
    const order = ['pending', 'preparing', 'confirmed', 'shipped', 'received'];
    const curIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepStatus);
    if (curIdx === -1) return false;
    return curIdx >= stepIdx;
  }

  onCancelOrder(orderId: string) {
    if (confirm('Are you certain you wish to cancel this acquisition?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          this.toast.info('Order has been canceled.');
          this.loadOrders();
        },
        error: err => {
          this.toast.error(err.error?.message || 'Cancellation failed');
        }
      });
    }
  }

  openRefundModal(orderId: string) {
    this.refundOrderId = orderId;
    this.refundReason = '';
    this.refundSubmitted.set(false);
    this.refundModalOpen.set(true);
  }

  closeRefundModal() {
    this.refundSubmitted.set(false);
    this.refundModalOpen.set(false);
  }

  submitRefundRequest(e: Event) {
    e.preventDefault();
    this.refundSubmitted.set(true);
    if (!this.refundReason.trim()) return;

    this.orderService.requestRefund(this.refundOrderId, this.refundReason.trim()).subscribe({
      next: () => {
        this.toast.success('Atelier refund request submitted for inspection.');
        this.refundSubmitted.set(false);
        this.closeRefundModal();
        this.loadOrders();
      },
      error: err => {
        this.toast.error(err.error?.message || 'Refund request failed');
      }
    });
  }

  saveNewAddress(e: Event) {
    e.preventDefault();
    this.addressSubmitted.set(true);

    if (!this.newAddressData.governorate || !this.newAddressData.city.trim() || !this.newAddressData.address.trim()) {
      return;
    }

    this.userService.addAddress(this.newAddressData).subscribe({
      next: addrs => {
        this.addresses.set(addrs);
        this.showNewAddress.set(false);
        this.addressSubmitted.set(false);
        this.newAddressData = { address: '', governorate: '', city: '', area: '', buildingDetails: '', isDefault: false };
        this.toast.success('Address saved.');
      },
      error: err => this.toast.error(err.error?.message || 'Failed to save address')
    });
  }

  onDeleteAddress(id: string) {
    if (confirm('Remove this address?')) {
      this.userService.deleteAddress(id).subscribe({
        next: addrs => {
          this.addresses.set(addrs);
          this.toast.info('Address removed.');
        },
        error: err => this.toast.error(err.error?.message || 'Failed to delete address')
      });
    }
  }

  onSetDefaultAddress(id: string) {
    this.userService.setDefaultAddress(id).subscribe({
      next: addrs => {
        this.addresses.set(addrs);
        this.toast.success('Default address updated.');
      },
      error: err => this.toast.error(err.error?.message || 'Failed to update default address')
    });
  }

  onUpdateProfile(e: Event) {
    e.preventDefault();
    this.profileSubmitted.set(true);

    if (!this.profileData.name.trim() || !this.profileData.email.trim() || !this.isValidEmail(this.profileData.email)) {
      return;
    }

    this.savingProfile.set(true);

    this.userService.updateProfile(this.profileData).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.profileSubmitted.set(false);
        this.toast.success('Profile details saved.');
      },
      error: err => {
        this.savingProfile.set(false);
        this.toast.error(err.error?.message || 'Failed to update profile');
      }
    });
  }

  onSubmitTestimonial(e: Event) {
    e.preventDefault();
    this.testimonialSubmitted.set(true);

    if (!this.testimonialData.clientName.trim() || !this.testimonialData.message.trim() || this.testimonialData.message.trim().length < 10) {
      return;
    }

    this.submittingTestimonial.set(true);

    this.testimonialService.submitTestimonial(this.testimonialData).subscribe({
      next: () => {
        this.submittingTestimonial.set(false);
        this.testimonialSubmitted.set(false);
        this.toast.success('Your review has been submitted for publication in the Gazette.');
        this.testimonialData.message = '';
      },
      error: err => {
        this.submittingTestimonial.set(false);
        this.toast.error(err.error?.message || 'Submission failed');
      }
    });
  }
}
