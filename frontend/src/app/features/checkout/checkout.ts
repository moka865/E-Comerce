import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../../core/services/order.service';
import { DeliveryFeeService } from '../../core/services/delivery-fee.service';
import { ToastService } from '../../core/services/toast.service';
import { Address } from '../../core/models/user.model';
import { DeliveryFee } from '../../core/models/delivery-fee.model';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private deliveryFeeService = inject(DeliveryFeeService);
  private toast = inject(ToastService);
  private router = inject(Router);

  public addresses = signal<Address[]>([]);
  public deliveryFees = signal<DeliveryFee[]>([]);
  public selectedAddressId = signal<string>('');
  public selectedGovernorate = signal<string>('');
  public showNewAddressForm = signal<boolean>(false);
  public addressFormSubmitted = signal<boolean>(false);
  public submittingAddress = signal<boolean>(false);
  public placingOrder = signal<boolean>(false);
  public confirmedOrder = signal<Order | null>(null);

  public addressTouched = {
    governorate: false,
    city: false,
    address: false
  };

  public newAddress: Address = {
    address: '',
    governorate: '',
    city: '',
    area: '',
    buildingDetails: '',
    isDefault: false
  };

  public currentDeliveryFee = computed(() => {
    const gov = this.selectedGovernorate();
    if (!gov) return 0;
    const feeObj = this.deliveryFees().find(f => f.governorate.toLowerCase() === gov.toLowerCase());
    return feeObj ? feeObj.fee : 50;
  });

  public grandTotal = computed(() => {
    return this.cartService.totalPrice() + this.currentDeliveryFee();
  });

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadAddresses();
    }
    this.deliveryFeeService.getActiveDeliveryFees().subscribe(fees => {
      this.deliveryFees.set(fees);
    });
  }

  loadAddresses() {
    this.userService.getAddresses().subscribe(addrs => {
      this.addresses.set(addrs);
      if (addrs.length > 0) {
        const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
        this.selectAddress(defaultAddr);
      } else {
        this.showNewAddressForm.set(true);
      }
    });
  }

  selectAddress(addr: Address) {
    if (addr._id) {
      this.selectedAddressId.set(addr._id);
      this.selectedGovernorate.set(addr.governorate);
      this.showNewAddressForm.set(false);
    }
  }

  getFeeForGovernorate(gov: string): number {
    const feeObj = this.deliveryFees().find(f => f.governorate.toLowerCase() === gov.toLowerCase());
    return feeObj ? feeObj.fee : 50;
  }

  toggleNewAddressForm() {
    this.addressFormSubmitted.set(false);
    this.addressTouched = {
      governorate: false,
      city: false,
      address: false
    };
    this.showNewAddressForm.update(v => !v);
  }

  onGovernorateSelect() {
    this.selectedGovernorate.set(this.newAddress.governorate);
  }

  onSaveNewAddress(e: Event) {
    e.preventDefault();
    this.addressFormSubmitted.set(true);

    if (!this.newAddress.governorate || !this.newAddress.city.trim() || !this.newAddress.address.trim()) {
      return;
    }

    this.submittingAddress.set(true);

    this.userService.addAddress(this.newAddress).subscribe({
      next: addrs => {
        this.addresses.set(addrs);
        const added = addrs[addrs.length - 1];
        if (added) this.selectAddress(added);
        this.submittingAddress.set(false);
        this.addressFormSubmitted.set(false);
        this.showNewAddressForm.set(false);
        this.toast.success('Destination address recorded');
      },
      error: err => {
        this.submittingAddress.set(false);
        this.toast.error(err.error?.message || 'Could not save address');
      }
    });
  }

  placeOrder() {
    const addrId = this.selectedAddressId();
    if (!addrId) {
      this.toast.error('Please select a delivery address');
      return;
    }

    this.placingOrder.set(true);

    this.orderService.createOrder(addrId).subscribe({
      next: ord => {
        this.confirmedOrder.set(ord);
        this.cartService.clearCart();
        this.placingOrder.set(false);
        this.toast.success('Your atelier order has been placed successfully');
      },
      error: err => {
        this.placingOrder.set(false);
        const msg = err.error?.message || 'Order could not be confirmed';
        this.toast.error(msg);
      }
    });
  }
}
