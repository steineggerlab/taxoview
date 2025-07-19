import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import path from "path";

export default defineConfig({
	plugins: [
		vue(),
		cssInjectedByJsPlugin({
			// Add the CSS-injection helper to both library bundles.
			jsAssetsFilterFunction(outputChunk) {
				return outputChunk.fileName === "taxoview.es.js" || outputChunk.fileName === "taxoview.ce.js";
			},
		}),
	],
	build: {
		lib: {
			// The main entry point
			entry: {
				index: path.resolve(__dirname, "src/index.js"),
				ce: path.resolve(__dirname, "src/TaxoView.ce.ts"), // Vue 3 Custom-Element build → registers <taxo-view>, can be used in React
			},
			name: "TaxoView",
			fileName: (format) => `taxoview.${format}.js`,
			formats: ["es"],
		},
		rollupOptions: {
			external: ["vue"],
			output: {
				entryFileNames: ({ name }) => (name === "ce" ? "taxoview.ce.js" : "taxoview.es.js"),
				globals: {
					vue: "Vue",
				},
			},
		},
	},
});
