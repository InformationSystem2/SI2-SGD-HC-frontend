import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackupService } from '../../services/backup.service';
import { TenantService } from '../../../tenants/services/tenant.service';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, HardDrive, Database, Upload, Download, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-backup-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex items-center gap-3 mb-8">
        <lucide-icon [img]="HardDrive" [size]="32" class="text-hc-primary"></lucide-icon>
        <h1 class="text-3xl font-bold text-hc-text-1">Gestión de Backups</h1>
      </div>

      <!-- Alertas -->
      <div *ngIf="backupService.error()" class="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
        <lucide-icon [img]="AlertTriangle" [size]="20" class="flex-shrink-0"></lucide-icon>
        <p>{{ backupService.error() }}</p>
      </div>

      <div *ngIf="backupService.successMessage()" class="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
        <p>{{ backupService.successMessage() }}</p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Tarjeta Backup Completo -->
        <div class="bg-hc-card rounded-xl shadow-sm border border-hc-border p-6">
          <div class="flex items-center gap-2 mb-4 border-b border-hc-border pb-4">
            <lucide-icon [img]="Database" [size]="24" class="text-blue-500"></lucide-icon>
            <h2 class="text-xl font-semibold text-hc-text-1">Backup Global (Completo)</h2>
          </div>
          
          <p class="text-sm text-hc-text-3 mb-6">
            Genera un respaldo completo de toda la base de datos (todos los tenants). El formato generado será .dump.
          </p>

          <button 
            (click)="onGenerateFull()" 
            [disabled]="backupService.loading()"
            class="w-full mb-8 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <lucide-icon *ngIf="!backupService.loading()" [img]="Download" [size]="18"></lucide-icon>
            <svg *ngIf="backupService.loading()" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ backupService.loading() ? 'Generando...' : 'Generar Backup Global' }}
          </button>

          <div class="border-t border-hc-border pt-6">
            <h3 class="text-sm font-medium text-hc-text-2 mb-3">Restaurar Base de Datos Global</h3>
            <p class="text-xs text-red-500 mb-4 flex gap-1 items-start">
              <lucide-icon [img]="AlertTriangle" [size]="12" class="mt-0.5 flex-shrink-0"></lucide-icon>
              Atención: Esta acción eliminará y reemplazará toda la base de datos actual.
            </p>
            <input 
              type="file" 
              accept=".dump"
              #fullFileInput
              (change)="onFullFileSelected($event)"
              class="block w-full text-sm text-hc-text-3 mb-3
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-hc-bg-2 file:text-hc-text-2
                hover:file:bg-hc-bg-3"
            />
            <button 
              (click)="onRestoreFull()" 
              [disabled]="!selectedFullFile || backupService.loading()"
              class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <lucide-icon [img]="Upload" [size]="18"></lucide-icon>
              Restaurar DB Global
            </button>
          </div>
        </div>

        <!-- Tarjeta Backup por Tenant -->
        <div class="bg-hc-card rounded-xl shadow-sm border border-hc-border p-6">
          <div class="flex items-center gap-2 mb-4 border-b border-hc-border pb-4">
            <lucide-icon [img]="HardDrive" [size]="24" class="text-purple-500"></lucide-icon>
            <h2 class="text-xl font-semibold text-hc-text-1">Backup por Tenant</h2>
          </div>
          
          <p class="text-sm text-hc-text-3 mb-6">
            Genera o restaura un respaldo exclusivo de los datos de un inquilino específico (.sql).
          </p>

          <div class="mb-6">
            <label class="block text-sm font-medium text-hc-text-2 mb-2">Seleccionar Tenant</label>
            <select 
              [(ngModel)]="selectedTenantSlug"
              class="w-full rounded-lg border-hc-border bg-hc-card text-hc-text-1 shadow-sm focus:border-hc-primary focus:ring-hc-primary sm:text-sm p-2.5 border">
              <option value="" disabled selected>Elige un tenant...</option>
              <option *ngFor="let tenant of tenantService.tenants()" [value]="tenant.slug">
                {{ tenant.name }} ({{ tenant.slug }})
              </option>
            </select>
          </div>

          <button 
            (click)="onGenerateTenant()" 
            [disabled]="!selectedTenantSlug || backupService.loading()"
            class="w-full mb-8 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <lucide-icon *ngIf="!backupService.loading()" [img]="Download" [size]="18"></lucide-icon>
            <svg *ngIf="backupService.loading()" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ backupService.loading() ? 'Generando...' : 'Generar Backup del Tenant' }}
          </button>

          <div class="border-t border-hc-border pt-6">
            <h3 class="text-sm font-medium text-hc-text-2 mb-3">Restaurar Tenant</h3>
            <p class="text-xs text-orange-500 mb-4 flex gap-1 items-start">
              <lucide-icon [img]="AlertTriangle" [size]="12" class="mt-0.5 flex-shrink-0"></lucide-icon>
              Atención: Esta acción reemplazará todos los datos del tenant que provenga en el script SQL.
            </p>
            <input 
              type="file" 
              accept=".sql"
              #tenantFileInput
              (change)="onTenantFileSelected($event)"
              class="block w-full text-sm text-hc-text-3 mb-3
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-hc-bg-2 file:text-hc-text-2
                hover:file:bg-hc-bg-3"
            />
            <button 
              (click)="onRestoreTenant()" 
              [disabled]="!selectedTenantFile || backupService.loading()"
              class="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <lucide-icon [img]="Upload" [size]="18"></lucide-icon>
              Restaurar Tenant
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class BackupManagement implements OnInit {
  backupService = inject(BackupService);
  tenantService = inject(TenantService);

  // Lucide icons
  readonly HardDrive = HardDrive;
  readonly Database = Database;
  readonly Upload = Upload;
  readonly Download = Download;
  readonly AlertTriangle = AlertTriangle;

  selectedTenantSlug: string = '';
  selectedFullFile: File | null = null;
  selectedTenantFile: File | null = null;

  ngOnInit() {
    this.tenantService.getTenants(0, 1000).subscribe();
  }

  onGenerateFull() {
    this.backupService.generateFullBackup().subscribe();
  }

  onGenerateTenant() {
    if (this.selectedTenantSlug) {
      this.backupService.generateTenantBackup(this.selectedTenantSlug).subscribe();
    }
  }

  onFullFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFullFile = file;
    }
  }

  onTenantFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedTenantFile = file;
    }
  }

  onRestoreFull() {
    if (this.selectedFullFile && confirm('¿Estás SEGURO de restaurar la base de datos completa? Esta acción es destructiva e irreversible.')) {
      this.backupService.restoreFullBackup(this.selectedFullFile).subscribe({
        next: () => {
          this.selectedFullFile = null;
        }
      });
    }
  }

  onRestoreTenant() {
    if (this.selectedTenantFile && confirm('¿Estás seguro de restaurar este tenant? Los datos actuales serán reemplazados.')) {
      this.backupService.restoreTenantBackup(this.selectedTenantFile).subscribe({
        next: () => {
          this.selectedTenantFile = null;
        }
      });
    }
  }
}
