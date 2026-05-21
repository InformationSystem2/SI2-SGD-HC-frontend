import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef,
  inject, NgZone, OnDestroy, OnInit, signal, ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faRotateLeft,
  faMagnifyingGlassPlus, faMagnifyingGlassMinus, faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { DicomService } from '../../services/dicom.service';
import { DicomStudy } from '../../models/dicom.model';

import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';

// Bandera de módulo: cornerstone-wado-image-loader solo se inicializa una vez
let cornerstoneReady = false;

function setupCornerstoneLoader(token: string): void {
  if (!cornerstoneReady) {
    (cornerstoneWADOImageLoader as any).external.cornerstone  = cornerstone;
    (cornerstoneWADOImageLoader as any).external.dicomParser  = dicomParser;
    cornerstoneReady = true;
  }
  // El token se actualiza en cada apertura del visor
  (cornerstoneWADOImageLoader as any).configure({
    beforeSend: (xhr: XMLHttpRequest) => {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    },
  });
}

@Component({
  selector: 'app-dicom-viewer',
  imports: [FontAwesomeModule],
  templateUrl: './dicom-viewer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DicomViewer implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('viewerCanvas') canvasRef!: ElementRef<HTMLDivElement>;

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private zone   = inject(NgZone);
  private auth   = inject(AuthService);
  readonly dicomService = inject(DicomService);

  readonly faArrowLeft            = faArrowLeft;
  readonly faRotateLeft           = faRotateLeft;
  readonly faMagnifyingGlassPlus  = faMagnifyingGlassPlus;
  readonly faMagnifyingGlassMinus = faMagnifyingGlassMinus;
  readonly faSpinner              = faSpinner;

  readonly loading = signal(true);
  readonly error   = signal<string | null>(null);
  readonly study   = signal<DicomStudy | null>(null);

  private studyId     = '';
  private csEnabled   = false;

  ngOnInit(): void {
    this.studyId = this.route.snapshot.paramMap.get('studyId')!;

    // Carga metadatos para mostrar en la barra (no bloquea el visor)
    this.dicomService.getById(this.studyId).subscribe({
      next: s  => this.study.set(s),
      error: () => { /* no crítico, el visor sigue funcionando */ },
    });
  }

  ngAfterViewInit(): void {
    const token = this.auth.accessToken();
    if (!token) {
      this.zone.run(() => {
        this.error.set('Sin sesión activa. Vuelve a iniciar sesión.');
        this.loading.set(false);
      });
      return;
    }

    setupCornerstoneLoader(token);
    this.renderImage();
  }

  private renderImage(): void {
    const el        = this.canvasRef.nativeElement;
    const streamUrl = this.dicomService.getStreamUrl(this.studyId);

    // Esquema wadouri: → cornerstone-wado-image-loader descarga y decodifica
    const imageId = `wadouri:${streamUrl}`;

    (cornerstone as any).enable(el);
    this.csEnabled = true;

    (cornerstone as any).loadImage(imageId)
      .then((image: any) => {
        (cornerstone as any).displayImage(el, image);
        this.zone.run(() => this.loading.set(false));
      })
      .catch(() => {
        this.zone.run(() => {
          this.error.set('No se pudo renderizar la imagen DICOM.');
          this.loading.set(false);
        });
      });
  }

  // ── Controles del visor ─────────────────────────────────────────────────

  zoomIn(): void {
    const el = this.canvasRef.nativeElement;
    const vp = (cornerstone as any).getViewport(el);
    if (!vp) return;
    vp.scale += 0.15;
    (cornerstone as any).setViewport(el, vp);
  }

  zoomOut(): void {
    const el = this.canvasRef.nativeElement;
    const vp = (cornerstone as any).getViewport(el);
    if (!vp) return;
    vp.scale = Math.max(0.1, vp.scale - 0.15);
    (cornerstone as any).setViewport(el, vp);
  }

  resetView(): void {
    if (this.csEnabled) {
      (cornerstone as any).reset(this.canvasRef.nativeElement);
    }
  }

  // ── Ciclo de vida ───────────────────────────────────────────────────────

  ngOnDestroy(): void {
    if (this.csEnabled) {
      try {
        (cornerstone as any).disable(this.canvasRef.nativeElement);
      } catch {
        // El elemento ya fue eliminado del DOM
      }
    }
  }

  back(): void {
    const s = this.study();
    if (s) {
      this.router.navigate(['/dicom/patient', s.patientId]);
    } else {
      this.router.navigate(['/pacientes/list']);
    }
  }
}
