import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TenantService } from '../../../services/tenant.service';
import { TenantSettings } from '../../../models/tenant.model';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './preferences.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Preferences implements OnInit {
  private tenantService = inject(TenantService);
  protected translate = inject(TranslateService);

  loading = signal(true);
  saving = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  settings = signal<TenantSettings | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.tenantService.getSettings().subscribe({
      next: (data) => {
        this.settings.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  save() {
    this.saving.set(true);
    this.message.set(null);
    setTimeout(() => {
      this.saving.set(false);
      this.showMessage(this.translate.instant('PREFERENCES.COMING_SOON'), 'success');
    }, 1500);
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}