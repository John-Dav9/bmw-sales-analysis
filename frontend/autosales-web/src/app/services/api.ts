import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface SalesItem {
  sales_key: string;
  year: number;
  make: string;
  model: string;
  region: string | null;
  color: string | null;
  price_usd: number | null;
  sales_volume: number | null;
  fuel_type: string | null;
  transmission: string | null;
  engine_size_l: number | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  getKpi(params?: { year?: number; region?: string; model?: string, fuelType?: string, transmission?: string }): Observable<any> {
    let p = new HttpParams();
    if (params?.year)   p = p.set('year', params.year);
    if (params?.region) p = p.set('region', params.region);
    if (params?.model)  p = p.set('model', params.model);
    if (params?.fuelType)  p = p.set('fuelType', params.fuelType);
    if (params?.transmission)  p = p.set('transmission', params.transmission);
    return this.http.get(`${this.base}/sales/kpi`, { params: p });
  }

  getSales(q: {
    limit?: number; offset?: number; sort?: string; year?: number; region?: string; model?: string; color?: string; fuelType?: string; transmission?: string
      }): Observable<{ items: SalesItem[]; total: number; params: any }> {
    let p = new HttpParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<{ items: SalesItem[]; total: number; params: any }>(`${this.base}/sales`, { params: p });
  }

  getTopModels(params: { top?: number; year?: number; region?: string }): Observable<any[]> {
    let p = new HttpParams();
    if (params?.top)    p = p.set('top', params.top);
    if (params?.year)   p = p.set('year', params.year);
    if (params?.region) p = p.set('region', params.region);
    return this.http.get<any[]>(`${this.base}/sales/insights/top-models`, { params: p });
  }

  getTrend(params: { fromYear?: number; toYear?: number; region?: string; model?: string }): Observable<any[]> {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<any[]>(`${this.base}/sales/insights/trend`, { params: p });
  }

  getTopRegions(params: { top?: number; year?: number }) {
    let p = new HttpParams();
    if (params.top) p = p.set('top', params.top);
    if (params.year) p = p.set('year', params.year);
    return this.http.get<any[]>(`${this.base}/sales/insights/top-regions`, { params: p });
  }
  getFuelByYear(params: { year?: number }): Observable<any[]> {
    let p = new HttpParams();
    if (params.year) p = p.set('year', params.year);
    return this.http.get<any[]>(`${this.base}/sales/insights/fuel-by-year`, { params: p });
  }

  getPriceVsEngine(params: { year?: number; region?: string; model?: string, fuelType?: string, transmission?: string }): Observable<any[]> {
    let p = new HttpParams();
    if (params.year) p = p.set('year', params.year);
    if (params.region) p = p.set('region', params.region);
    if (params.model) p = p.set('model', params.model);
    if (params.fuelType) p = p.set('fuelType', params.fuelType);
    if (params.transmission) p = p.set('transmission', params.transmission);
    return this.http.get<any[]>(`${this.base}/sales/insights/price-vs-engine`, { params: p });
  }
}
