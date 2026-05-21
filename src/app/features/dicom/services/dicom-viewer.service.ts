import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../../core/auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class DicomViewerService {

  private auth = inject(AuthService);
  private initialized = false;

  // ── Inicialización única de Cornerstone3D ─────────────────────────────────

  async init(): Promise<void> {
    if (this.initialized) return;

    const [cs, csTools, dicomLoaderMod] = await Promise.all([
      import('@cornerstonejs/core'),
      import('@cornerstonejs/tools'),
      import('@cornerstonejs/dicom-image-loader'),
    ]);

    await cs.init();

    // En v2, init() registra los loaders y el web worker; no hay external.cornerstone
    dicomLoaderMod.init({
      beforeSend: (xhr: XMLHttpRequest) => {
        const token = this.auth.accessToken();
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        const slug = localStorage.getItem('tenantSlug');
        if (slug)  xhr.setRequestHeader('X-Tenant-ID', slug);
      },
    } as any);

    // El worker que registra dicomLoaderMod.init() usa `new Worker(new URL('./decodeImageFrameWorker.js', import.meta.url))`,
    // patrón que ni el optimizador de Vite ni el bundle de esbuild del dev-server de Angular 21 resuelven a una URL servible.
    // Lo sustituimos por un bundle autónomo pre-construido (scripts/build-dicom-worker.mjs → public/cornerstonejs/).
    cs.getWebWorkerManager().registerWorker(
      'dicomImageLoader',
      () => new Worker(
        new URL('cornerstonejs/decodeImageFrameWorker.js', document.baseURI),
        { type: 'module' },
      ),
      {
        maxWorkerInstances: navigator.hardwareConcurrency || 1,
        overwrite: true,
      },
    );

    await csTools.init();

    // Registrar herramientas globalmente — solo una vez por sesión
    csTools.addTool(csTools.WindowLevelTool);
    csTools.addTool(csTools.ZoomTool);
    csTools.addTool(csTools.PanTool);
    csTools.addTool(csTools.LengthTool);
    csTools.addTool(csTools.MagnifyTool);
    csTools.addTool(csTools.StackScrollTool);

    this.initialized = true;
  }

  // ── Carga de archivos DICOM locales ───────────────────────────────────────

  /** Registra un File local en el fileManager wadouri y devuelve el imageId `dicomfile:N`. */
  async addLocalFile(file: File): Promise<string> {
    const { wadouri } = await import('@cornerstonejs/dicom-image-loader');
    return wadouri.fileManager.add(file);
  }

  /** Libera todos los archivos cargados localmente. */
  async purgeLocalFiles(): Promise<void> {
    const { wadouri } = await import('@cornerstonejs/dicom-image-loader');
    wadouri.fileManager.purge();
  }

  // ── Gestión del RenderingEngine ───────────────────────────────────────────

  async createRenderingEngine(engineId: string) {
    const { RenderingEngine } = await import('@cornerstonejs/core');
    return new RenderingEngine(engineId);
  }

  // ── Gestión del ToolGroup ─────────────────────────────────────────────────

  async createToolGroup(
    toolGroupId: string,
    viewportId: string,
    engineId: string,
  ): Promise<void> {
    const {
      ToolGroupManager,
      Enums: ToolsEnums,
      WindowLevelTool,
      ZoomTool,
      PanTool,
      LengthTool,
      MagnifyTool,
      StackScrollTool,
    } = await import('@cornerstonejs/tools');

    const toolGroup = ToolGroupManager.createToolGroup(toolGroupId)!;
    toolGroup.addTool(WindowLevelTool.toolName);
    toolGroup.addTool(ZoomTool.toolName);
    toolGroup.addTool(PanTool.toolName);
    toolGroup.addTool(LengthTool.toolName);
    toolGroup.addTool(MagnifyTool.toolName, {
      magnifySize: 10,
      magnifyWidth: 200,
      magnifyHeight: 200,
    });
    toolGroup.addTool(StackScrollTool.toolName);

    toolGroup.addViewport(viewportId, engineId);

    toolGroup.setToolActive(WindowLevelTool.toolName, {
      bindings: [{ mouseButton: ToolsEnums.MouseBindings.Primary }],
    });
    // La rueda del mouse siempre navega el stack (estilo Weasis/RadiAnt).
    toolGroup.setToolActive(StackScrollTool.toolName, {
      bindings: [{ mouseButton: ToolsEnums.MouseBindings.Wheel }],
    });
    toolGroup.setToolPassive(ZoomTool.toolName);
    toolGroup.setToolPassive(PanTool.toolName);
    toolGroup.setToolPassive(LengthTool.toolName);
    toolGroup.setToolPassive(MagnifyTool.toolName);
  }

  async activateTool(toolGroupId: string, toolName: string): Promise<void> {
    const { ToolGroupManager, Enums: ToolsEnums } = await import('@cornerstonejs/tools');
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) return;

    const allTools = ['WindowLevel', 'Zoom', 'Pan', 'Length', 'Magnify'];

    // Magnify se maneja con una lupa personalizada en el componente;
    // cuando está seleccionada, desactivamos todas las herramientas de
    // Cornerstone para que el mouse quede libre.
    if (toolName === 'Magnify') {
      for (const t of allTools) toolGroup.setToolPassive(t);
      return;
    }

    for (const t of allTools) {
      if (t === toolName) {
        toolGroup.setToolActive(t, {
          bindings: [{ mouseButton: ToolsEnums.MouseBindings.Primary }],
        });
      } else {
        toolGroup.setToolPassive(t);
      }
    }
  }

  async destroyToolGroup(toolGroupId: string): Promise<void> {
    const { ToolGroupManager } = await import('@cornerstonejs/tools');
    ToolGroupManager.destroyToolGroup(toolGroupId);
  }
}
