import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService, SalesItem } from '../../services/api';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatTableModule, MatProgressSpinnerModule
  ],
  templateUrl: './explore.html',
  styleUrls: ['./explore.scss'],
  providers: [DecimalPipe]
})
export class Explore {
  
  private api = inject(ApiService);

  displayedColumns = ['year','make','model','region','color','price_usd','sales_volume','fuel_type','transmission','engine_size_l'];
  data: SalesItem[] = [];
  total = 0;
  limit = 20;
  offset = 0;
  sort = 'year_desc';

  year?: number;
  region?: string;
  model?: string;
  color?: string;
  fuelType?: string;
  transmission?: string;

  loading = false;

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.api.getSales({ limit: this.limit, offset: this.offset, sort: this.sort, year: this.year, region: this.region, model: this.model })
      .subscribe({
        next: (res: { items: SalesItem[]; total: number }) => { this.data = res.items; this.total = res.total; this.loading = false; },
        error: () => { this.loading = false; }
      });
  }

  onPaginate(direction: 'prev'|'next') {
    if (direction === 'prev') this.offset = Math.max(0, this.offset - this.limit);
    if (direction === 'next') this.offset = this.offset + this.limit;
    this.fetch();
  }

  resetFilters() {
    this.year = undefined; this.region = undefined; this.model = undefined; this.color = undefined; this.fuelType = undefined; this.transmission = undefined; this.offset = 0;
    this.fetch();
  }

}
