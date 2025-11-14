import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = environment.apiBase; // ex: http://localhost:3000

  createUser(body: {name: string; surname: string; email: string; password: string; role: 'admin'|'visitor' }) {
    return this.http.post(`${this.base}/admin/users`, body);
  }
  listUsers() {
    return this.http.get(`${this.base}/admin/users`);
  }
  updateUser(id: number, patch: Partial<{name: string; surname: string; email: string; password: string; role: 'admin'|'visitor'}>) {
    return this.http.patch(`${this.base}/admin/users/${id}`, patch);
  }
  deleteUser(id: number) {
    return this.http.delete(`${this.base}/admin/users/${id}`);
  }
  setActive(id: number, is_active: boolean) {
  return this.http.patch(`${this.base}/admin/users/${id}/active`, { is_active });
  }

}
