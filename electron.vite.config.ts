import { resolve } from 'path';
import { defineConfig } from 'electron-vite';

export default defineConfig({
  main: {
    build: {
      rollupOptions: { input: { index: resolve(__dirname, 'src/main.ts') } },
    },
  },
  preload: {
    build: {
      rollupOptions: { input: { index: resolve(__dirname, 'src/preload.ts') } },
    },
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          canvas: resolve(__dirname, 'src/app/renderers/canvas.html'),
          dashboard: resolve(__dirname, 'src/app/renderers/dashboard.html'),
        },
      },
    },
    css: {
      preprocessorOptions: {
        // Bootstrap 5.3 still uses Sass features deprecated in Dart Sass; only our own code should warn
        scss: { quietDeps: true, silenceDeprecations: ['import', 'global-builtin', 'color-functions'] },
      },
    },
    root: resolve(__dirname, 'src/app/renderers'),
  },
});
