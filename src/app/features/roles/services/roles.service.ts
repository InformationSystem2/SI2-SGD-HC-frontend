import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CreateRoleRequest, Role, UpdateRoleRequest } from '../models/role.models';
import { catchError, EMPTY, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private http = inject(HttpClient);

  private readonly BASE = `${environment.apiUrl}/module_users/roles`;
  readonly roles   = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);



  loadRoles() {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Role[]>(this.BASE).pipe(
      tap(data => {
        this.roles.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar roles');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }


  getRole(id: number) {
    return this.http.get<Role>(`${this.BASE}/${id}`);
  }


  createRole(data: CreateRoleRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Role>(this.BASE, data).pipe(
      tap(created => {
        this.roles.update(list => [...list, created]);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al crear el rol');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }


  updateRole(id: number, data: UpdateRoleRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<Role>(`${this.BASE}/${id}`, data).pipe(
      tap(updated => {
        this.roles.update(list =>
          list.map(r => (r.id === id ? updated : r)),
        );
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al actualizar el rol');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }


  deleteRole(id: number) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
      tap(() => {
        this.roles.update(list => list.filter(r => r.id !== id));
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al eliminar el rol');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }
}
