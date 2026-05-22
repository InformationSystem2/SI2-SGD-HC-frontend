import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Step {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full mb-10">
      <div class="flex items-center justify-between relative">
        <!-- Line background -->
        <div class="absolute top-5 left-0 right-0 h-0.5 bg-hc-border"></div>
        
        <!-- Progress line (completed) -->
        <div class="absolute top-5 left-0 h-0.5 bg-hc-primary transition-all duration-500"
             [style.width.%]="progressWidth"></div>

        <!-- Steps -->
        @for (step of steps; track step.label; let i = $index) {
          <div class="relative flex flex-col items-center z-10">
            <!-- Circle -->
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2"
                 [class.bg-hc-primary]="currentStep >= i + 1"
                 [class.border-hc-primary]="currentStep >= i + 1"
                 [class.text-white]="currentStep >= i + 1"
                 [class.bg-hc-surface]="currentStep < i + 1"
                 [class.border-hc-border]="currentStep < i + 1"
                 [class.text-hc-text-3]="currentStep < i + 1"
                 [class.scale-110]="currentStep === i + 1"
                 [class.shadow-lg]="currentStep === i + 1"
                 [class.shadow-hc-primary/40]="currentStep === i + 1">
              @if (currentStep > i + 1) {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              } @else {
                {{ i + 1 }}
              }
            </div>
            
            <!-- Label -->
            <span class="mt-2 text-xs font-medium whitespace-nowrap transition-colors duration-300"
                  [class.text-hc-primary]="currentStep >= i + 1"
                  [class.text-hc-text-3]="currentStep < i + 1">
              {{ step.label }}
            </span>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressStepperComponent {
  @Input() steps: Step[] = [
    { label: 'Plan', icon: 'fa-credit-card' },
    { label: 'Datos', icon: 'fa-hospital' },
    { label: 'Pago', icon: 'fa-credit-card' },
    { label: 'Listo', icon: 'fa-check' }
  ];
  @Input() currentStep = 1;

  get progressWidth(): number {
    return ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
  }
}