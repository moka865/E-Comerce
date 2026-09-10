import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { StoreContent } from '../../core/models/content.model';

@Component({
  selector: 'app-content-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './content-page.html',
  styleUrl: './content-page.css'
})
export class ContentPageComponent implements OnInit {
  private contentService = inject(ContentService);
  private route = inject(ActivatedRoute);

  public content = signal<StoreContent | null>(null);
  public loading = signal<boolean>(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const key = params.get('key') as any;
      if (key) {
        this.loading.set(true);
        this.contentService.getContentByKey(key).subscribe({
          next: c => {
            this.content.set(c);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      }
    });
  }

  getParagraphs(body?: string): string[] {
    if (!body) return [];
    return body.split('\n\n').filter(p => p.trim().length > 0);
  }
}
