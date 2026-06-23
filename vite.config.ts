import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Dev serves from '/', production build targets a GitHub Pages project site
// at /<repo-name>/. Change the build base if you rename the repository.
export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/ui-gallery/' : '/',
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
}));
