import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Permission } from '../models/permission.model';
import { catchError, EMPTY, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PermissionsService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/module_users/permissions`;

  readonly permissions = signal<Permission[]>([]);
  readonly loading     = signal(false);
  readonly error       = signal<string | null>(null);

  loadPermissions() {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Permission[]>(this.BASE).pipe(
      tap(data => {
        this.permissions.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar permisos');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }
}
