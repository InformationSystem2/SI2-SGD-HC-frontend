import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CreateUserRequest, UpdateUserRequest, User } from '../models/user.model';
import { environment } from '../../../../environments/environment';
import { catchError, EMPTY, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/module_users/users`;

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly success = signal(false);
  readonly users   = signal<User[]>([]);


  getUsers() {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<User[]>(this.BASE).pipe(
      tap(data => {
        this.users.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar usuarios');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getUser(id: string) {
    return this.http.get<User>(`${this.BASE}/${id}`);
  }

  createUser(data: CreateUserRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    return this.http.post<User>(this.BASE, data).pipe(
      tap(() => {
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al crear el usuario');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  updateUser(id: string, data: UpdateUserRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    return this.http.put<User>(`${this.BASE}/${id}`, data).pipe(
      tap(updated => {
        this.users.update(list => list.map(u => (u.id === id ? updated : u)));
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al actualizar el usuario');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  deleteUser(id: string) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
      tap(() => {
        this.users.update(list => list.filter(u => u.id !== id));
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al eliminar el usuario');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }
}
