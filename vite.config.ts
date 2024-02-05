import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

// const contentConfigPlugin = () => ({
// 	name: 'content-config-plugin',
// 	config: (config) => {
// 		const ssr = /** @type {boolean} */ config.build?.ssr;
// 		const prefix = `dist/immutable`;

// 		return {
// 			build: {
// 				rollupOptions: {
// 					output: {
// 						entryFileNames(chunkInfo) {
// 							if (chunkInfo.name === 'content') {
// 								return 'content.js';
// 							}
// 							return ssr ? '[name].js' : `${prefix}/[name].[hash].js`;
// 						}
// 					}
// 				}
// 			}
// 		};
// 	}
// });
export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
	// build: {
	// 	rollupOptions: {
	// 		input: {
	// 			content: 'src/content.ts'
	// 		}
	// 	}
	// }
});
