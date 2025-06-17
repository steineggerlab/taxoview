import { defineConfig } from "vite";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import path from "path";

export default defineConfig({
	plugins: [
		cssInjectedByJsPlugin(),
	],
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/taxoview.js"),
			name: "TaxoView",
			fileName: (format) => `taxoview-chart.${format}.js`,
		}
	},
});
