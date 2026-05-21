declare module 'cornerstone-core' {
  export function enable(element: HTMLElement): void;
  export function disable(element: HTMLElement): void;
  export function loadImage(imageId: string): Promise<any>;
  export function displayImage(element: HTMLElement, image: any): void;
  export function getViewport(element: HTMLElement): any;
  export function setViewport(element: HTMLElement, viewport: any): void;
  export function reset(element: HTMLElement): void;
  export function resize(element: HTMLElement, resetViewport?: boolean): void;
}

declare module 'cornerstone-wado-image-loader' {
  export const external: { cornerstone: any; dicomParser: any };
  export function configure(options: { beforeSend?: (xhr: XMLHttpRequest) => void }): void;
  export const webWorkerManager: { initialize(config: any): void };
}

declare module 'dicom-parser' {
  const dicomParser: any;
  export = dicomParser;
}
