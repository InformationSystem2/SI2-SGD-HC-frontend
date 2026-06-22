import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHandshake, faPlus, faXmark, faSpinner, faRotateRight, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { DelegationService } from '../../services/delegation.service';
import { UserService } from '../../../users/services/user.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-delegation-page',
  imports: [CommonModule, FormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './delegation-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelegationPage implements OnInit {

  private delegationSvc = inject(DelegationService);
  private userSvc = inject(UserService);
  private authSvc = inject(AuthService);

  readonly faHandshake = faHandshake;
  readonly faPlus = faPlus;
  readonly faXmark = faXmark;
  readonly faSpinner = faSpinner;
  readonly faRotateRight = faRotateRight;
  readonly faTrash = faTrash;

  readonly delegations = this.delegationSvc.delegations;
  readonly loading = this.delegationSvc.loading;
  readonly users = this.userSvc.users;

  readonly showModal = signal(false);
  readonly actionLoading = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly selectedDelegateId = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');

  readonly availableUsers = computed(() => {
    const current = this.authSvc.username();
    return this.users().filter(u => u.username !== current);
  });

  ngOnInit(): void {
    this.delegationSvc.getActiveDelegations().subscribe();
    this.userSvc.getUsers().subscribe();
  }

  refresh(): void {
    this.delegationSvc.getActiveDelegations().subscribe();
  }

  openModal(): void {
    this.selectedDelegateId.set('');
    const today = new Date().toISOString().split('T')[0];
    this.startDate.set(today);
    this.endDate.set('');
    this.actionError.set(null);
    this.showModal.set(true);
  }

  submitCreate(): void {
    if (!this.selectedDelegateId() || !this.startDate()) return;
    this.actionLoading.set(true);
    this.actionError.set(null);

    this.delegationSvc.createDelegation({
      delegateId: this.selectedDelegateId(),
      startDate: this.startDate(),
      endDate: this.endDate() || undefined,
    }).subscribe({
      next: () => {
        this.showModal.set(false);
        this.actionLoading.set(false);
        this.delegationSvc.getActiveDelegations().subscribe();
      },
      error: e => {
        this.actionError.set(e.error?.message ?? 'Error creating delegation');
        this.actionLoading.set(false);
      },
    });
  }

  cancelDelegation(id: string): void {
    this.actionLoading.set(true);
    this.delegationSvc.cancelDelegation(id).subscribe({
      next: () => {
        this.delegationSvc.getActiveDelegations().subscribe();
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  displayName(user: { firstName?: string; lastName?: string; username: string } | undefined): string {
    if (!user) return '—';
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username;
  }
}
