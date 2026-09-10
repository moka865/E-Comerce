import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialService } from '../../../core/services/testimonial.service';
import { ToastService } from '../../../core/services/toast.service';
import { Testimonial } from '../../../core/models/content.model';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-testimonials.html',
  styleUrl: './admin-testimonials.css'
})
export class AdminTestimonialsComponent implements OnInit {
  private testimonialService = inject(TestimonialService);
  private toast = inject(ToastService);

  public testimonials = signal<Testimonial[]>([]);

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.testimonialService.getAllTestimonialsAdmin().subscribe(list => {
      this.testimonials.set(list);
    });
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));
  }

  getStatusBadge(status: string): string {
    if (status === 'approved') return 'badge-in-stock';
    if (status === 'declined') return 'badge-out-stock';
    return 'badge-low-stock';
  }

  onApprove(id: string) {
    this.testimonialService.approveTestimonial(id).subscribe({
      next: () => {
        this.toast.success('Testimonial approved and published to Gazette.');
        this.loadTestimonials();
      },
      error: err => this.toast.error(err.error?.message || 'Action failed')
    });
  }

  onDecline(id: string) {
    this.testimonialService.declineTestimonial(id).subscribe({
      next: () => {
        this.toast.info('Testimonial declined.');
        this.loadTestimonials();
      },
      error: err => this.toast.error(err.error?.message || 'Action failed')
    });
  }
}
