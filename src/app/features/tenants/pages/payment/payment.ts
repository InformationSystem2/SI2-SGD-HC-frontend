import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TenantService } from '../../services/tenant.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './payment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payment {
  private route = inject(ActivatedRoute);
  readonly tenantService = inject(TenantService);

  readonly tenantId = signal<string | null>(null);
  readonly adminUsername = signal<string | null>(null);
  readonly processing = signal(false);

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.tenantId.set(params['id']);
      this.adminUsername.set(params['username']);
    });
  }

  confirmPayment(): void {
    const id = this.tenantId();
    if (!id) return;

    this.processing.set(true);
    // Simulamos un pequeño retardo para dar sensación de procesamiento real
    setTimeout(() => {
      this.tenantService.processPayment(id).subscribe({
        next: () => this.processing.set(false),
        error: () => this.processing.set(false)
      });
    }, 2000);
  }
}
