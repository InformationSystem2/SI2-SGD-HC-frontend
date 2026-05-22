import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { BrandingService } from '../../../../core/services/branding.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {

  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  branding = inject(BrandingService);  
  hidePassword = signal(true);

  readonly features = [
    { label: 'Gestión centralizada de historias clínicas' },
    { label: 'Control de acceso por roles y permisos' },
    { label: 'Documentos digitales con firma electrónica' },
  ];

  protected form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected onSubmit() {
    if (this.form.invalid) return;
    const {username, password} = this.form.getRawValue();
    this.auth.login({ username: username!, password: password! }).subscribe();
  }

}
