import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ProgressStepperComponent } from '../../../components/progress-stepper/progress-stepper';
import { TenantService } from '../../../services/tenant.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ProgressStepperComponent],
  templateUrl: './success.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Success implements OnInit {
  private router = inject(Router);
  private tenantService = inject(TenantService);

  adminUsername = '';

  ngOnInit(): void {
    this.adminUsername = localStorage.getItem('registeredAdminUsername') || '';
    
    if (!this.adminUsername) {
      this.router.navigate(['/tenants/select-plan']);
      return;
    }

    this.tenantService.clearLocalStorage();
  }

  goToLogin(): void {
    localStorage.removeItem('registeredAdminUsername');
    this.router.navigate(['/auth/login']);
  }
}