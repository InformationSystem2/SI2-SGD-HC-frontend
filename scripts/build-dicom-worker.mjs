// Pre-bundles `@cornerstonejs/dicom-image-loader`'s `decodeImageFrameWorker.js`
// into a self-contained ES module worker served from `public/cornerstonejs/`.
//
// Why: Angular 21's @angular/build dev server can neither pre-bundle the worker
// (Vite optimizer fails on `new Worker(new URL(..., import.meta.url))`) nor
// transform that URL correctly when the package is excluded via `prebundle`,
// leaving the worker URL resolved at site root (404 → MIME error).
// Pre-bundling the worker and registering it manually with a static URL avoids
// both bundler limitations.

import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const outDir = join(root, 'public', 'cornerstonejs');

const entry = join(
  root,
  'node_modules/@cornerstonejs/dicom-image-loader/dist/esm/decodeImageFrameWorker.js',
);

const wasmFiles = [
  'node_modules/@cornerstonejs/codec-charls/dist/charlswasm_decode.wasm',
  'node_modules/@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm_decode.wasm',
  'node_modules/@cornerstonejs/codec-openjpeg/dist/openjpegwasm_decode.wasm',
  'node_modules/@cornerstonejs/codec-openjph/dist/openjphjs.wasm',
];

await mkdir(outDir, { recursive: true });

// Emscripten codec wrappers reference Node builtins (fs, path, …) inside an
// `if (ENVIRONMENT_IS_NODE)` branch that is dead code in the browser. Stub them
// out so esbuild can resolve the imports without bundling Node polyfills.
const stubNodeBuiltins = {
  name: 'stub-node-builtins',
  setup(build) {
    const builtins = /^(fs|path|crypto|url|os|child_process|worker_threads|stream|util|module)$/;
    build.onResolve({ filter: builtins }, (args) => ({
      path: args.path,
      namespace: 'node-stub',
    }));
    build.onLoad({ filter: /.*/, namespace: 'node-stub' }, () => ({
      contents: 'export default {}; export const promises = {};',
      loader: 'js',
    }));
  },
};

await build({
  entryPoints: [entry],
  outfile: join(outDir, 'decodeImageFrameWorker.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  legalComments: 'none',
  logLevel: 'info',
  plugins: [stubNodeBuiltins],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

for (const rel of wasmFiles) {
  const src = join(root, rel);
  const dst = join(outDir, rel.split('/').pop());
  await cp(src, dst);
}

// The codec wrappers use `new URL('@cornerstonejs/codec-*/decodewasm', import.meta.url)`
// to locate their WASM. After bundling that URL resolves to `/@cornerstonejs/...`
// at runtime — a bogus path that 404s and the SPA fallback returns index.html,
// failing WASM compilation. Rewrite to plain filenames so they resolve relative
// to the worker URL (i.e. `/cornerstonejs/<file>.wasm`).
const outFile = join(outDir, 'decodeImageFrameWorker.js');
let src = await readFile(outFile, 'utf8');
const wasmAliases = [
  ['@cornerstonejs/codec-charls/decodewasm', 'charlswasm_decode.wasm'],
  ['@cornerstonejs/codec-libjpeg-turbo-8bit/decodewasm', 'libjpegturbowasm_decode.wasm'],
  ['@cornerstonejs/codec-openjpeg/decodewasm', 'openjpegwasm_decode.wasm'],
  ['@cornerstonejs/codec-openjph/wasm', 'openjphjs.wasm'],
];
for (const [from, to] of wasmAliases) {
  src = src.split(JSON.stringify(from)).join(JSON.stringify(to));
}
await writeFile(outFile, src);

console.log('✔ DICOM worker bundle written to public/cornerstonejs/');
