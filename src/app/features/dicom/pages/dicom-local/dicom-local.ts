import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
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
  ArrowLeft,
  Upload,
  X,
  FilePlus,
  Play,
  Pause,
  Gauge,
  Repeat,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Search,
  Maximize,
  Minimize,
} from 'lucide-angular';

import type { Types } from '@cornerstonejs/core';

import { TranslatePipe } from '@ngx-translate/core';

import { DicomViewerService } from '../../services/dicom-viewer.service';
import { ToolName } from '../../models/dicom.model';

interface ToolDef {
  name: ToolName;
  label: string;
  icon: LucideIconData;
  tooltip: string;
}

interface LoadedFile {
  name: string;
  imageId: string;
}

@Component({
  selector: 'app-dicom-local',
  standalone: true,
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './dicom-local.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DicomLocal implements AfterViewInit, OnDestroy {

  @ViewChild('viewport') viewportRef?: ElementRef<HTMLDivElement>;
  @ViewChild('viewerContainer') viewerContainerRef?: ElementRef<HTMLDivElement>;

  private router    = inject(Router);
  private viewerSvc = inject(DicomViewerService);
  private zone      = inject(NgZone);
  private cdr       = inject(ChangeDetectorRef);

  private readonly engineId    = `cs-local-${crypto.randomUUID()}`;
  private readonly viewportId  = 'local-vp';
  private readonly toolGroupId = `cs-local-tools-${crypto.randomUUID()}`;

  private cs: Awaited<typeof import('@cornerstonejs/core')> | null = null;
  private renderingEngine: Awaited<ReturnType<DicomViewerService['createRenderingEngine']>> | null = null;
  private stackNewImageEventName  = '';
  private voiModifiedEventName    = '';
  private applyAutoVoiOnNextImage = false;

  // ── Estado ──────────────────────────────────────────────────────────────
  readonly files         = signal<LoadedFile[]>([]);
  readonly viewerLoading = signal(false);
  readonly error         = signal<string | null>(null);
  readonly currentIndex  = signal(0);
  readonly windowWidth   = signal(0);
  readonly windowCenter  = signal(0);
  readonly activeTool    = signal<ToolName>('WindowLevel');
  readonly dragOver      = signal(false);

  readonly ArrowLeft      = ArrowLeft;
  readonly ChevronLeft    = ChevronLeft;
  readonly ChevronRight   = ChevronRight;
  readonly RotateCcw      = RotateCcw;
  readonly Upload         = Upload;
  readonly X              = X;
  readonly FilePlus       = FilePlus;
  readonly Play           = Play;
  readonly Pause          = Pause;
  readonly Gauge          = Gauge;
  readonly Repeat         = Repeat;
  readonly PanelLeftClose = PanelLeftClose;
  readonly PanelLeftOpen  = PanelLeftOpen;
  readonly Palette        = Palette;
  readonly Search         = Search;
  readonly Maximize       = Maximize;
  readonly Minimize       = Minimize;

  // ── LUT / Colormap ──────────────────────────────────────────────────────
  /** Catálogo curado de Look-Up Tables. Ver explicación en {@link DicomViewer}. */
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

  readonly colormap = signal<string>('Grayscale');

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

  setColormap(id: string): void {
    this.colormap.set(id);
    if (!this.renderingEngine) return;
    const viewport = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    this.applyCurrentColormap(viewport);
    viewport?.render();
  }

  // ── Sidebar (lista de archivos) ─────────────────────────────────────────
  readonly sidebarOpen = signal<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  );
  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar(): void  { this.sidebarOpen.set(false); }

  // ── Reproducción automática (cine-mode) ─────────────────────────────────
  readonly playing = signal(false);
  readonly fps     = signal(10);
  readonly loop    = signal(true);
  readonly speedOptions: number[] = [2, 5, 10, 15, 24, 30];

  private playInterval: ReturnType<typeof setInterval> | null = null;

  togglePlay(): void {
    if (this.playing()) this.pause();
    else this.play();
  }

  play(): void {
    if (this.files().length <= 1) return;
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
    const total = this.files().length;
    if (total <= 1) { this.pause(); return; }

    const next = this.currentIndex() + 1;
    if (next >= total) {
      if (this.loop()) this.jumpTo(0);
      else this.pause();
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

    ctx.strokeStyle = 'rgba(13,148,136,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);  ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);  ctx.lineTo(size, size / 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(13,148,136,0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(`${zoom}×`, size / 2, size - 12);

    ctx.restore();
  }

  // ── Pantalla completa ──────────────────────────────────────────────────────
  readonly isFullscreen = signal(false);

  private onFullscreenChange = (): void => {
    this.zone.run(() => {
      this.isFullscreen.set(!!document.fullscreenElement);
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

  // ── Lifecycle ───────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  ngOnDestroy(): void {
    this.pause();
    this.detachMagnify();
    this.destroyMagnifyOverlay();
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    try {
      this.renderingEngine?.disableElement(this.viewportId);
      this.renderingEngine?.destroy();
    } catch { /* silencioso */ }

    this.viewerSvc.destroyToolGroup(this.toolGroupId);
    this.viewerSvc.purgeLocalFiles();

    const el = this.viewportRef?.nativeElement;
    if (el && this.stackNewImageEventName) {
      el.removeEventListener(this.stackNewImageEventName, this.onNewImage);
      el.removeEventListener(this.voiModifiedEventName,   this.onVoiModified);
    }
  }

  // ── Carga de archivos ───────────────────────────────────────────────────

  async onFilesSelected(input: HTMLInputElement): Promise<void> {
    const list = input.files;
    if (!list || list.length === 0) return;
    await this.loadFiles(Array.from(list));
    input.value = ''; // permite re-seleccionar los mismos archivos
  }

  async onDrop(e: DragEvent): Promise<void> {
    e.preventDefault();
    this.dragOver.set(false);
    const list = e.dataTransfer?.files;
    if (!list || list.length === 0) return;
    await this.loadFiles(Array.from(list));
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void { this.dragOver.set(false); }

  private async loadFiles(rawFiles: File[]): Promise<void> {
    // Acepta solo .dcm o sin extensión (algunos DICOM no la tienen).
    const dicomFiles = rawFiles.filter(f =>
      f.name.toLowerCase().endsWith('.dcm') || !f.name.includes('.'),
    );
    if (dicomFiles.length === 0) {
      this.error.set('No se reconocieron archivos DICOM (.dcm).');
      return;
    }

    this.viewerLoading.set(true);
    this.error.set(null);
    this.cdr.markForCheck();

    try {
      await this.viewerSvc.init();

      // Registrar cada archivo en el fileManager wadouri.
      const newLoaded: LoadedFile[] = [];
      for (const f of dicomFiles) {
        const imageId = await this.viewerSvc.addLocalFile(f);
        newLoaded.push({ name: f.name, imageId });
      }
      // Ordenar por nombre para que la pila quede en orden natural.
      newLoaded.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      this.files.update(prev => [...prev, ...newLoaded]);

      // Inicializar viewport en la primera carga; reusar en cargas posteriores.
      if (!this.renderingEngine) {
        await this.mountViewport();
      }

      await this.renderStack();
    } catch (err) {
      console.error('[DICOM Local] Error al cargar archivos:', err);
      this.error.set('Error al cargar los archivos DICOM seleccionados.');
    } finally {
      this.viewerLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  private async mountViewport(): Promise<void> {
    // Esperar al siguiente tick por si el @if recién montó el #viewport.
    await new Promise(r => setTimeout(r, 0));

    const el = this.viewportRef?.nativeElement;
    if (!el) throw new Error('Viewport DOM no disponible.');

    this.cs = await import('@cornerstonejs/core');
    const { Enums } = this.cs;

    this.renderingEngine = await this.viewerSvc.createRenderingEngine(this.engineId);
    this.renderingEngine.enableElement({
      viewportId: this.viewportId,
      type: Enums.ViewportType.STACK,
      element: el as HTMLDivElement,
      defaultOptions: { background: [0, 0, 0] as Types.Point3 },
    });

    await this.viewerSvc.createToolGroup(this.toolGroupId, this.viewportId, this.engineId);

    this.stackNewImageEventName = Enums.Events.STACK_NEW_IMAGE;
    this.voiModifiedEventName   = Enums.Events.VOI_MODIFIED;
    el.addEventListener(this.stackNewImageEventName, this.onNewImage);
    el.addEventListener(this.voiModifiedEventName,   this.onVoiModified);
  }

  private async renderStack(): Promise<void> {
    if (!this.renderingEngine) return;
    const viewport = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    if (!viewport) return;

    const imageIds = this.files().map(f => f.imageId);
    this.applyAutoVoiOnNextImage = true;
    await viewport.setStack(imageIds, 0);
    this.applyCurrentColormap(viewport);
    viewport.render();
    this.currentIndex.set(0);
  }

  // ── Herramientas / navegación ───────────────────────────────────────────

  async selectTool(name: ToolName): Promise<void> {
    if (this.activeTool() === 'Magnify' && name !== 'Magnify') {
      this.detachMagnify();
    }

    this.activeTool.set(name);
    await this.viewerSvc.activateTool(this.toolGroupId, name);

    if (name === 'Magnify') {
      this.attachMagnify();
    }

    this.cdr.markForCheck();
  }

  async resetView(): Promise<void> {
    if (!this.renderingEngine) return;
    const vp = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    if (!vp) return;
    vp.resetCamera();
    this.applyAutoVoi(vp);
    vp.render();
  }

  private applyAutoVoi(viewport: Types.IStackViewport): void {
    try {
      const image = viewport.getCornerstoneImage();
      if (!image) return;

      const { windowWidth, windowCenter } = image;
      const ww = Array.isArray(windowWidth)  ? windowWidth[0]  : windowWidth;
      const wc = Array.isArray(windowCenter) ? windowCenter[0] : windowCenter;

      if (ww && ww > 0) {
        viewport.setProperties({ voiRange: { lower: wc - ww / 2, upper: wc + ww / 2 } });
        return;
      }

      const pixels = image.getPixelData();
      if (!pixels || pixels.length === 0) return;

      let min = pixels[0];
      let max = pixels[0];
      for (let i = 1; i < pixels.length; i++) {
        if (pixels[i] < min) min = pixels[i];
        if (pixels[i] > max) max = pixels[i];
      }

      if (min === max) {
        const bits = (image as any).bitsAllocated ?? 8;
        min = 0;
        max = (1 << bits) - 1;
      }

      viewport.setProperties({ voiRange: { lower: min, upper: max } });
    } catch { /* imagen aún no cargada, Cornerstone usará sus defaults */ }
  }

  async navigate(delta: number): Promise<void> {
    if (!this.renderingEngine) return;
    const next = this.currentIndex() + delta;
    if (next < 0 || next >= this.files().length) return;
    const vp = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    if (!vp) return;
    await vp.setImageIdIndex(next);
    vp.render();
  }

  async jumpTo(index: number): Promise<void> {
    if (!this.renderingEngine) return;
    const vp = this.renderingEngine.getViewport(this.viewportId) as Types.IStackViewport;
    if (!vp) return;
    await vp.setImageIdIndex(index);
    vp.render();
  }

  removeAll(): void {
    this.pause();
    this.files.set([]);
    this.viewerSvc.purgeLocalFiles();
    try {
      this.renderingEngine?.disableElement(this.viewportId);
      this.renderingEngine?.destroy();
    } catch { /* silencioso */ }
    this.viewerSvc.destroyToolGroup(this.toolGroupId);
    this.renderingEngine = null;
    this.currentIndex.set(0);
    this.windowWidth.set(0);
    this.windowCenter.set(0);
    this.cdr.markForCheck();
  }

  back(): void { this.router.navigate(['/dicom/viewer']); }

  // ── Listeners Cornerstone → signals ─────────────────────────────────────

  private readonly onNewImage = (evt: Event): void => {
    const { imageIdIndex } = (evt as CustomEvent).detail;
    this.zone.run(() => {
      this.currentIndex.set(imageIdIndex ?? 0);

      const vp = this.renderingEngine?.getViewport(this.viewportId) as Types.IStackViewport | undefined;

      if (this.applyAutoVoiOnNextImage && vp) {
        this.applyAutoVoiOnNextImage = false;
        this.applyAutoVoi(vp);
        vp.render();
      }

      // Reaplicar la LUT en cada frame: Cornerstone reconstruye el actor al
      // cambiar de imagen y eso revierte el colormap al default. Sin esto,
      // el cine-mode "pierde" la LUT tras unas pocas imágenes.
      if (vp) {
        this.applyCurrentColormap(vp);
        vp.render();
      }

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
}
