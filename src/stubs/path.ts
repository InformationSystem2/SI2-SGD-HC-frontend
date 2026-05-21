export default {};
export const join    = (...parts: string[]) => parts.join('/');
export const resolve = (...parts: string[]) => parts.join('/');
export const dirname = (p: string) => p.substring(0, p.lastIndexOf('/'));
export const basename = (p: string) => p.substring(p.lastIndexOf('/') + 1);
export const extname  = (p: string) => { const b = basename(p); const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i) : ''; };
