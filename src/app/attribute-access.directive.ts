import { Directive, Input, ElementRef, Renderer2, OnInit, inject } from '@angular/core';
import { AuthService } from './core/auth/services/auth.service';

@Directive({
  selector: '[attributeAccess]',
  standalone: true
})
export class AttributeAccessDirective implements OnInit {
  // Ej: "Patient.phone"
  @Input('attributeAccess') attributePath: string = '';

  private authService = inject(AuthService);

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.applyAccessLevel();
  }

  private applyAccessLevel() {
    const accessLevel = this.getSimulatedAccess(this.attributePath);

    if (accessLevel === 'NO_VISIBLE') {
      // Remover elemento del DOM
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    } else if (accessLevel === 'READ_ONLY') {
      // Bloquear input/select para que no sea editable
      this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.7');
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'not-allowed');
    }
    // Si es 'EDITABLE', no hacemos nada, dejamos que funcione normal.
  }

  private getSimulatedAccess(path: string): string {
    const state: any = (this.authService as any)._state();
    const perms = state.attributePermissions || {};
    return perms[path] || 'EDITABLE';
  }
}
