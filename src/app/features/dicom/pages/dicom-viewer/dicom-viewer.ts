import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  LucideAngularModule,
  LucideIconData,
  SlidersHorizontal,
  ZoomIn,
  Move,
  Ruler,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Layers,
  Info,
  Play,
  Pause,
  Gauge,
  PanelLeftClose,
  PanelLeftOpen,
  Repeat,
  Palette,
  Search,
  Maximize,
  Minimize,
} from 'lucide-angular';

// Types es un namespace de solo-tipos: import estático que TypeScript borra en runtime
import type { Types } from '@cornerstonejs/core';

import { DicomApiService } from '../../services/dicom-api.service';
import { DicomViewerService } from '../../services/dicom-viewer.service';
import { DicomInstance, DicomSeries, DicomStudy, ToolName } from '../../models/dicom.model';
import { environment } from '../../../../../environments/environment';

interface ToolDef {
  name: ToolName;
  label: string;
  icon: LucideIconData;
  tooltip: string;
}

@Component({
  selector: 'app-dicom-viewer',
  standalone: true,
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './dicom-viewer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DicomViewer implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('viewport') viewportRef!: ElementRef<HTMLDivElement>;
  @ViewChild('viewerContainer') viewerContainerRef!: ElementRef<HTMLDivElement>;

  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private apiSvc     = inject(DicomApiService);
  private viewerSvc  = inject(DicomViewerService);
  private zone       = inject(NgZone);
  private cdr        = inject(ChangeDetectorRef);
  private translate  = inject(TranslateService);

  // IDs únicos por instancia
  private readonly engineId    = `cs-engine-${crypto.randomUUID()}`;
  private readonly viewportId  = 'stack-vp';
  private readonly toolGroupId = `cs-tools-${crypto.randomUUID()}`;

  // Módulo de Cornerstone cacheado después del primer import dinámico
  private cs: Awaited<typeof import('@cornerstonejs/core')> | null = null;
  private renderingEngine: Awaited<ReturnType<DicomViewerService['createRenderingEngine']>> | null = null;

  // Nombres de eventos cacheados (se llenan al montar el viewport)
  private stackNewImageEventName = '';
  private voiModifiedEventName   = '';

  private pendingStudy: DicomStudy | null = null;
  private viewportReady = false;
  private applyAutoVoiOnNextImage = false;

  // ── Estado ────────────────────────────────────────────────────────────────
  readonly study           = signal<DicomStudy | null>(null);
  readonly activeSeries    = signal<DicomSeries | null>(null);
  readonly activeInstances = signal<DicomInstance[]>([]);
  readonly loading         = signal(true);
  readonly viewerLoading = signal(false);
  readonly error         = signal<string | null>(null);
  readonly currentIndex  = signal(0);
  readonly totalImages   = signal(0);
  readonly windowWidth   = signal<number>(0);
  readonly windowCenter  = signal<number>(0);
  readonly activeTool    = signal<ToolName>('WindowLevel');

  // ── Iconos ────────────────────────────────────────────────────────────────
  readonly ArrowLeft      = ArrowLeft;
  readonly Layers         = Layers;
  readonly ChevronLeft    = ChevronLeft;
  readonly ChevronRight   = ChevronRight;
  readonly ChevronDown    = ChevronDown;
  readonly RotateCcw      = RotateCcw;
  readonly Info           = Info;
  readonly Play           = Play;
  readonly Pause          = Pause;
  readonly Gauge          = Gauge;
  readonly PanelLeftClose = PanelLeftClose;
  readonly PanelLeftOpen  = PanelLeftOpen;
  readonly Repeat         = Repeat;
  readonly Palette        = Palette;
  readonly Search         = Search;
  readonly Maximize       = Maximize;
  readonly Minimize       = Minimize;

  // ── LUT / Colormap ────────────────────────────────────────────────────────
  /**
   * Catálogo curado de Look-Up Tables (LUTs).
   *
   * <p>Cada entrada mapea una etiqueta visible al nombre exacto del preset
   * vtk.js que Cornerstone3D resuelve internamente. {@code Grayscale} es un
   * caso especial: representa la ausencia de colormap (se llama {@code unsetColormap()}).
   *
   * <p>Las paletas elegidas son las más útiles para imagen médica:
   * <ul>
   *   <li><b>Rainbow / HSV / jet</b>: cubren todo el espectro, ideales para
   *       resaltar variaciones de intensidad sutiles (PET, perfusión).</li>
   *   <li><b>Hot Iron / Hot Metal Blue / Black-Body Radiation</b>: térmicos,
   *       habituales en medicina nuclear y termografía.</li>
   *   <li><b>Cool to Warm / Spectral</b>: divergentes, útiles para resaltar
   *       desviaciones respecto a una línea base.</li>
   *   <li><b>X Ray</b>: realza tejidos óseos en radiografía.</li>
   * </ul>
   */
  readonly lutPresets: { id: string; label: string; vtkName: string | null }[] = [
    { id: 'Grayscale',          label: 'Escala de grises',     vtkName: 'Grayscale' },
    { id: 'Rainbow',            label: 'Rainbow',              vtkName: 'rainbow' },
    { id: 'RainbowDesaturated', label: 'Rainbow desaturado',   vtkName: 'Rainbow Desaturated' },
    { id: 'HSV',                label: 'HSV',                  vtkName: 'hsv' },
    { id: 'Jet',                label: 'Jet',                  vtkName: 'jet' },
    { id: 'HotIron',            label: 'Hot Iron',             vtkName: 'Black-Body Radiation' },
    { id: 'CoolToWarm',         label: 'Cool to Warm',         vtkName: 'Cool to Warm' },
    { id: 'Spectral',           label: 'Spectral',             vtkName: 'Cold and Hot' },
    { id: 'XRay',               label: 'X Ray',                vtkName: 'X Ray' },
  ];

  /** LUT actualmente aplicada. */
  readonly colormap = signal<string>('Grayscale');

  /**
   * Aplica al viewport el colormap actualmente seleccionado. Se invoca tras
   * cargar una serie / cambiar de frame para sobrevivir re-renders internos
   * de Cornerstone que resetean propiedades.
   */
  private applyCurrentColormap(viewport: Types.IStackViewport | null | undefined): void {
    if (!viewport) return;
    try {
      const preset = this.lutPresets.find(p => p.id === this.colormap());
      if (!preset || preset.vtkName === null) {
        (viewport as any).unsetColormap?.();
      } else {
        viewport.setProperties({ colormap: { name: preset.vtkName } });
      }
    } catch { /* no soportado en la imagen actual */ }
  }

  /** Selecciona una LUT por su id (etiqueta del preset). */
  setColormap(id: string): void {
    this.colormap.set(id);
    if (!this.renderingEngine) return;
    const viewport = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    this.applyCurrentColormap(viewport);
    viewport?.render();
  }

  // ── Sidebar (lista de series) ─────────────────────────────────────────────
  /** Visibilidad del sidebar. En móvil arranca cerrado; en ≥ md, abierto. */
  readonly sidebarOpen = signal<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  );

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar(): void  { this.sidebarOpen.set(false); }

  /** IDs de las series cuya lista de instancias está expandida. */
  readonly expandedSeries = signal<Set<string>>(new Set());

  isSeriesExpanded(id: string): boolean {
    return this.expandedSeries().has(id);
  }

  toggleSeries(id: string): void {
    this.expandedSeries.update(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Reproducción automática (cine-mode) ───────────────────────────────────
  /** Si el cine-mode está corriendo. */
  readonly playing = signal(false);
  /** Velocidad de reproducción (frames por segundo). */
  readonly fps = signal(10);
  /** Si al llegar al final vuelve a la primera imagen. */
  readonly loop = signal(true);

  /** Velocidades disponibles para el selector. */
  readonly speedOptions: number[] = [2, 5, 10, 15, 24, 30];

  private playInterval: ReturnType<typeof setInterval> | null = null;

  togglePlay(): void {
    if (this.playing()) this.pause();
    else this.play();
  }

  play(): void {
    if (this.totalImages() <= 1) return;
    this.playing.set(true);
    this.scheduleTick();
  }

  pause(): void {
    this.playing.set(false);
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
  }

  /** Cambia FPS sin interrumpir: si está corriendo, reinicia el intervalo. */
  setFps(fps: number): void {
    this.fps.set(fps);
    if (this.playing()) this.scheduleTick();
  }

  toggleLoop(): void { this.loop.update(v => !v); }

  private scheduleTick(): void {
    if (this.playInterval) clearInterval(this.playInterval);
    const intervalMs = Math.max(20, Math.round(1000 / this.fps()));
    this.playInterval = setInterval(() => this.zone.run(() => this.advanceFrame()), intervalMs);
  }

  private advanceFrame(): void {
    const total = this.totalImages();
    if (total <= 1) { this.pause(); return; }

    const next = this.currentIndex() + 1;
    if (next >= total) {
      if (this.loop()) {
        this.jumpTo(0);
      } else {
        this.pause();
      }
      return;
    }
    this.jumpTo(next);
  }

  readonly tools: ToolDef[] = [
    { name: 'WindowLevel', label: 'DICOM.TOOL_WL',      icon: SlidersHorizontal, tooltip: 'DICOM.TOOL_WL_TOOLTIP'      },
    { name: 'Zoom',        label: 'DICOM.TOOL_ZOOM',    icon: ZoomIn,            tooltip: 'DICOM.TOOL_ZOOM_TOOLTIP'    },
    { name: 'Pan',         label: 'DICOM.TOOL_PAN',     icon: Move,              tooltip: 'DICOM.TOOL_PAN_TOOLTIP'     },
    { name: 'Length',      label: 'DICOM.TOOL_LENGTH',  icon: Ruler,             tooltip: 'DICOM.TOOL_LENGTH_TOOLTIP'  },
    { name: 'Magnify',     label: 'DICOM.TOOL_MAGNIFY', icon: Search,            tooltip: 'DICOM.TOOL_MAGNIFY_TOOLTIP' },
  ];

  // ── Lupa personalizada (persistente) ───────────────────────────────────────
  readonly magnifyZoom = signal(4);
  readonly magnifyZoomOptions: number[] = [2, 3, 4, 6, 8, 10];

  private readonly MAGNIFY_SIZE = 220;
  private magnifyOverlay: HTMLDivElement | null = null;
  private magnifyCtx: CanvasRenderingContext2D | null = null;
  private lastMagnifyPos = { x: 0, y: 0 };

  setMagnifyZoom(zoom: number): void {
    this.magnifyZoom.set(zoom);
    this.drawMagnifier();
  }

  private createMagnifyOverlay(): void {
    if (this.magnifyOverlay) return;
    const container = this.viewportRef?.nativeElement?.parentElement;
    if (!container) return;

    const size = this.MAGNIFY_SIZE;
    const dpr = window.devicePixelRatio || 1;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:absolute; width:${size}px; height:${size}px;
      display:none; pointer-events:none; z-index:50;
      border-radius:50%;
      border:3px solid rgba(13,148,136,0.8);
      box-shadow:0 0 0 2px rgba(0,0,0,0.5),0 0 24px 4px rgba(13,148,136,0.3),0 8px 32px rgba(0,0,0,0.4);
      overflow:hidden;
    `;

    const canvas = document.createElement('canvas');
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;`;
    overlay.appendChild(canvas);
    container.appendChild(overlay);

    this.magnifyOverlay = overlay;
    this.magnifyCtx = canvas.getContext('2d');
    this.magnifyCtx?.scale(dpr, dpr);
  }

  private destroyMagnifyOverlay(): void {
    this.magnifyOverlay?.remove();
    this.magnifyOverlay = null;
    this.magnifyCtx = null;
  }

  private attachMagnify(): void {
    const el = this.viewportRef?.nativeElement;
    if (!el) return;
    this.createMagnifyOverlay();
    el.addEventListener('mousemove', this.onMagnifyMove);
    el.addEventListener('mouseenter', this.onMagnifyEnter);
    el.addEventListener('mouseleave', this.onMagnifyLeave);
    el.style.cursor = 'none';
  }

  private detachMagnify(): void {
    const el = this.viewportRef?.nativeElement;
    if (!el) return;
    el.removeEventListener('mousemove', this.onMagnifyMove);
    el.removeEventListener('mouseenter', this.onMagnifyEnter);
    el.removeEventListener('mouseleave', this.onMagnifyLeave);
    el.style.cursor = '';
    if (this.magnifyOverlay) this.magnifyOverlay.style.display = 'none';
  }

  private readonly onMagnifyMove = (e: MouseEvent): void => {
    const el = this.viewportRef?.nativeElement;
    if (!el || !this.magnifyOverlay) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.lastMagnifyPos = { x, y };

    const parentRect = el.parentElement!.getBoundingClientRect();
    const size = this.MAGNIFY_SIZE;
    this.magnifyOverlay.style.left = `${e.clientX - parentRect.left - size / 2}px`;
    this.magnifyOverlay.style.top  = `${e.clientY - parentRect.top  - size / 2}px`;
    this.magnifyOverlay.style.display = 'block';

    this.drawMagnifier();
  };

  private readonly onMagnifyEnter = (): void => {
    if (this.magnifyOverlay) this.magnifyOverlay.style.display = 'block';
  };

  private readonly onMagnifyLeave = (): void => {
    if (this.magnifyOverlay) this.magnifyOverlay.style.display = 'none';
  };

  private drawMagnifier(): void {
    const el = this.viewportRef?.nativeElement;
    const ctx = this.magnifyCtx;
    if (!el || !ctx) return;

    const sourceCanvas = el.querySelector('canvas') as HTMLCanvasElement;
    if (!sourceCanvas) return;

    const size = this.MAGNIFY_SIZE;
    const zoom = this.magnifyZoom();
    const { x, y } = this.lastMagnifyPos;

    const rect = el.getBoundingClientRect();
    const sx = sourceCanvas.width  / rect.width;
    const sy = sourceCanvas.height / rect.height;

    const cx = x * sx;
    const cy = y * sy;
    const srcW = (size / zoom) * sx;
    const srcH = (size / zoom) * sy;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sourceCanvas,
      cx - srcW / 2, cy - srcH / 2, srcW, srcH,
      0, 0, size, size,
    );

    // Crosshair
    ctx.strokeStyle = 'rgba(13,148,136,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);  ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);  ctx.lineTo(size, size / 2);
    ctx.stroke();

    // Zoom label
    ctx.setLineDash([]);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(13,148,136,0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(`${zoom}×`, size / 2, size - 12);

    ctx.restore();
  }

  // ── Pantalla completa ──────────────────────────────────────────────────────
  readonly isFullscreen = signal(false);

  /** Listener del evento fullscreenchange para sincronizar el signal. */
  private onFullscreenChange = (): void => {
    this.zone.run(() => {
      this.isFullscreen.set(!!document.fullscreenElement);

      // Al entrar/salir de fullscreen, Cornerstone necesita un resize para
      // recalcular las dimensiones del canvas interno.
      setTimeout(() => {
        if (this.renderingEngine) {
          this.renderingEngine.resize(true, true);
        }
      }, 200);

      this.cdr.markForCheck();
    });
  };

  toggleFullscreen(): void {
    const container = this.viewerContainerRef?.nativeElement;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      container.requestFullscreen().catch(() => {});
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const studyId = this.route.snapshot.paramMap.get('studyId');
    if (!studyId) {
      this.error.set('ID de estudio no especificado.');
      this.loading.set(false);
      return;
    }

    this.apiSvc.getStudyById(studyId).subscribe({
      next: async study => {
        this.study.set(study);
        this.loading.set(false);
        this.cdr.markForCheck();
        if (this.viewportReady) {
          await this.initViewerWithStudy(study);
        } else {
          this.pendingStudy = study;
        }
      },
      error: e => {
        this.error.set(e.error?.message ?? 'Error al cargar el estudio DICOM');
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  async ngAfterViewInit(): Promise<void> {
    this.viewportReady = true;
    if (this.pendingStudy) {
      await this.initViewerWithStudy(this.pendingStudy);
      this.pendingStudy = null;
    }
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  ngOnDestroy(): void {
    this.pause(); // detiene el cine-mode si quedó activo
    this.detachMagnify();
    this.destroyMagnifyOverlay();
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);

    try {
      this.renderingEngine?.disableElement(this.viewportId);
      this.renderingEngine?.destroy();
    } catch { /* silencioso */ }

    this.viewerSvc.destroyToolGroup(this.toolGroupId);

    const el = this.viewportRef?.nativeElement;
    if (el && this.stackNewImageEventName) {
      el.removeEventListener(this.stackNewImageEventName, this.onNewImage);
      el.removeEventListener(this.voiModifiedEventName,   this.onVoiModified);
    }
  }

  // ── Inicialización de Cornerstone ─────────────────────────────────────────

  private async initViewerWithStudy(study: DicomStudy): Promise<void> {
    this.viewerLoading.set(true);
    this.cdr.markForCheck();

    try {
      await this.viewerSvc.init();

      // Cachear el módulo para usarlo en métodos síncronos posteriores
      this.cs = await import('@cornerstonejs/core');
      const { Enums } = this.cs;

      this.renderingEngine = await this.viewerSvc.createRenderingEngine(this.engineId);

      const el = this.viewportRef.nativeElement;
      this.renderingEngine.enableElement({
        viewportId: this.viewportId,
        type: Enums.ViewportType.STACK,
        element: el as HTMLDivElement,
        defaultOptions: { background: [0, 0, 0] as Types.Point3 },
      });

      await this.viewerSvc.createToolGroup(this.toolGroupId, this.viewportId, this.engineId);

      // Cachear nombres de eventos para el cleanup en ngOnDestroy
      this.stackNewImageEventName = Enums.Events.STACK_NEW_IMAGE;
      this.voiModifiedEventName   = Enums.Events.VOI_MODIFIED;
      el.addEventListener(this.stackNewImageEventName, this.onNewImage);
      el.addEventListener(this.voiModifiedEventName,   this.onVoiModified);

      const firstSeries = study.series[0];
      if (firstSeries) {
        await this.loadSeries(firstSeries);
      }
    } catch (err) {
      console.error('[DICOM Viewer] Error al inicializar Cornerstone:', err);
      this.error.set('Error al inicializar el visor DICOM.');
    } finally {
      this.viewerLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  // ── Carga de serie ────────────────────────────────────────────────────────

  async loadSeries(series: DicomSeries): Promise<void> {
    if (!this.renderingEngine) return;

    // Detener cualquier reproducción en curso al cambiar de serie.
    this.pause();

    const sorted = [...series.instances].sort(
      (a, b) => (a.instanceNumber ?? 0) - (b.instanceNumber ?? 0),
    );

    this.activeSeries.set(series);
    this.activeInstances.set(sorted);
    this.currentIndex.set(0);
    this.totalImages.set(sorted.length);

    // Auto-expandir la serie sólo cuando se selecciona desde colapsada.
    // El toggle del chevron es independiente de loadSeries, por lo que respetar
    // un colapso explícito del usuario no requiere lógica adicional aquí.
    this.expandedSeries.update(prev => {
      if (prev.has(series.id)) return prev;
      const next = new Set(prev);
      next.add(series.id);
      return next;
    });

    // En móvil, ocultar el sidebar tras seleccionar serie para ver la imagen.
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.sidebarOpen.set(false);
    }

    this.cdr.markForCheck();

    const imageIds = sorted.map(
      inst => `wadouri:${environment.apiUrl}/dicom/instances/${inst.id}/file`,
    );

    const viewport = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    if (!viewport) return;

    this.applyAutoVoiOnNextImage = true;
    await viewport.setStack(imageIds, 0);
    this.applyCurrentColormap(viewport);
    viewport.render();
  }

  async jumpTo(index: number): Promise<void> {
    if (!this.renderingEngine) return;
    if (index < 0 || index >= this.activeInstances().length) return;
    const viewport = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    if (!viewport) return;
    await viewport.setImageIdIndex(index);
    viewport.render();
  }

  instanceLabel(inst: DicomInstance, idx: number): string {
    const label = this.translate.instant('DICOM.IMAGE_PREFIX');
    return inst.instanceNumber != null
      ? `${label} ${inst.instanceNumber}`
      : `${label} ${idx + 1}`;
  }

  // ── Herramientas ──────────────────────────────────────────────────────────

  async selectTool(toolName: ToolName): Promise<void> {
    // Limpiar lupa si cambiamos a otra herramienta
    if (this.activeTool() === 'Magnify' && toolName !== 'Magnify') {
      this.detachMagnify();
    }

    this.activeTool.set(toolName);
    await this.viewerSvc.activateTool(this.toolGroupId, toolName);

    if (toolName === 'Magnify') {
      this.attachMagnify();
    }

    this.cdr.markForCheck();
  }

  async resetView(): Promise<void> {
    if (!this.renderingEngine) return;
    const viewport = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    if (!viewport) return;
    viewport.resetCamera();
    this.applyAutoVoi(viewport);
    viewport.render();
  }

  /**
   * Aplica windowing automático a partir del píxel data real de la imagen.
   * Necesario para modalidades sin WW/WC en el header (OT, SC, etc.) que de
   * otro modo se renderizan completamente negras con los defaults de Cornerstone.
   */
  private applyAutoVoi(viewport: Types.IStackViewport): void {
    try {
      const image = viewport.getCornerstoneImage();
      if (!image) return;

      const { windowWidth, windowCenter } = image;

      // Si la imagen tiene WW/WC válidos en el header DICOM, los usamos directamente.
      const ww = Array.isArray(windowWidth)  ? windowWidth[0]  : windowWidth;
      const wc = Array.isArray(windowCenter) ? windowCenter[0] : windowCenter;

      if (ww && ww > 0) {
        viewport.setProperties({ voiRange: { lower: wc - ww / 2, upper: wc + ww / 2 } });
        return;
      }

      // Sin WW/WC (OT, SC, capturas de pantalla…): calcular desde min/max del pixel data.
      const pixels = image.getPixelData();
      if (!pixels || pixels.length === 0) return;

      let min = pixels[0];
      let max = pixels[0];
      for (let i = 1; i < pixels.length; i++) {
        if (pixels[i] < min) min = pixels[i];
        if (pixels[i] > max) max = pixels[i];
      }

      // Evitar rango plano (imagen constante) — usar bitDepth como fallback.
      if (min === max) {
        const bits = (image as any).bitsAllocated ?? 8;
        min = 0;
        max = (1 << bits) - 1;
      }

      viewport.setProperties({ voiRange: { lower: min, upper: max } });
    } catch {
      // Si falla por cualquier motivo (imagen aún no cargada), Cornerstone usará sus defaults.
    }
  }

  // ── Navegación de instancias ──────────────────────────────────────────────

  async navigate(delta: number): Promise<void> {
    if (!this.renderingEngine) return;
    const next = this.currentIndex() + delta;
    if (next < 0 || next >= this.totalImages()) return;

    const viewport = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    if (!viewport) return;

    await viewport.setImageIdIndex(next);
    viewport.render();
  }

  // ── Listeners de eventos Cornerstone → signals ────────────────────────────

  private readonly onNewImage = (evt: Event): void => {
    const { imageIdIndex } = (evt as CustomEvent).detail;
    this.zone.run(() => {
      this.currentIndex.set(imageIdIndex ?? 0);

      const viewport = this.renderingEngine?.getViewport(this.viewportId) as Types.IStackViewport | undefined;

      if (this.applyAutoVoiOnNextImage && viewport) {
        this.applyAutoVoiOnNextImage = false;
        this.applyAutoVoi(viewport);
        viewport.render();
      }

      // Reaplicar la LUT en cada frame: Cornerstone reconstruye el actor al
      // cambiar de imagen y eso revierte el colormap al default (grayscale).
      // Sin esto, el cine-mode "pierde" la LUT tras unas pocas imágenes.
      if (viewport) {
        this.applyCurrentColormap(viewport);
        viewport.render();
      }

      this.syncWwWc();
      this.cdr.markForCheck();
    });
  };

  private readonly onVoiModified = (evt: Event): void => {
    const { range } = (evt as CustomEvent).detail;
    if (!range) return;
    const ww = Math.round(range.upper - range.lower);
    const wc = Math.round(range.lower + ww / 2);
    this.zone.run(() => {
      this.windowWidth.set(ww);
      this.windowCenter.set(wc);
      this.cdr.markForCheck();
    });
  };

  private syncWwWc(): void {
    if (!this.renderingEngine) return;
    const viewport = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    const props = viewport?.getProperties() as any;
    if (props?.voiRange) {
      const ww = Math.round(props.voiRange.upper - props.voiRange.lower);
      const wc = Math.round(props.voiRange.lower + ww / 2);
      this.windowWidth.set(ww);
      this.windowCenter.set(wc);
    }
  }

  // ── Helpers de template ───────────────────────────────────────────────────

  modalityBadgeClass(modality: string): string {
    const map: Record<string, string> = {
      CT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
      MR: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
      US: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300',
      CR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
      DX: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
      PT: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
    };
    return map[modality] ?? 'bg-hc-muted text-hc-text-2';
  }

  seriesLabel(s: DicomSeries): string {
    return s.seriesDescription ?? `${this.translate.instant('DICOM.SERIE_PREFIX')} ${s.seriesNumber ?? '?'}`;
  }

  back(): void {
    this.router.navigate(['/dicom/viewer']);
  }
}
