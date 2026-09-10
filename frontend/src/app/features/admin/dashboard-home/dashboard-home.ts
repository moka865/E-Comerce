import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHomeComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  public revenueStats = signal<number>(0);
  public totalOrders = signal<number>(0);
  public totalEvents = signal<number>(0);
  public topProducts = signal<any[]>([]);
  public topCustomers = signal<any[]>([]);

  ngOnInit() {
    this.analyticsService.getInsights().subscribe(data => {
      if (data) {
        const rev = data.orders?.overall?.[0]?.totalRevenue || 0;
        const ords = data.orders?.overall?.[0]?.totalOrders || 0;
        const evts = data.analytics?.totalEvents?.[0]?.count || 0;

        this.revenueStats.set(rev);
        this.totalOrders.set(ords);
        this.totalEvents.set(evts);
      }
    });

    this.analyticsService.getTopProducts(5).subscribe(prods => this.topProducts.set(prods));
    this.analyticsService.getTopCustomers(5).subscribe(custs => this.topCustomers.set(custs));
  }
}
