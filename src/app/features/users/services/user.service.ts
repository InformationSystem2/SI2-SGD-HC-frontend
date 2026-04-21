import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CreateUserRequest, CreateUserResponse, User } from '../models/user.model';
import { environment } from '../../../../environments/environment';
import { catchError, EMPTY, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
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


  createUser(data: CreateUserRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);


    return this.http.post<CreateUserResponse>(this.BASE, data)
      .pipe(
        tap(() => {
          this.loading.set(false);
          this.success.set(true);
        }),
        catchError(err => {
          const msg = err.error?.message ?? 'Error al crear el usuario';
          this.error.set(msg);
          this.loading.set(false);
          return EMPTY;
        })
      )
  }

}
