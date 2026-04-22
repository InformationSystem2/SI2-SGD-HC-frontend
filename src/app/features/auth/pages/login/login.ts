import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {

  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  hidePassword = signal(true);

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
