import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],

	build: {
		emptyOutDir: false,
		rollupOptions: {
			input: 'src/content.ts',
			output: {
				dir: 'build',
				entryFileNames: '[name].js',
				chunkFileNames: '[name].js',
				assetFileNames: '[name].[ext]',
				sourcemap: true
			}
		}
	}
});
