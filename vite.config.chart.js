import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
	plugins: [
		vue(),
	],
	build: {
		lib: {
			// The main entry point
			entry: path.resolve(__dirname, "src/taxoview.js"),
			name: "TaxoView",
			fileName: (format) => `taxoview-chart.${format}.js`,
		},
		rollupOptions: {
			external: ["vue"],
			output: {
				globals: {
					vue: "Vue",
				},
			},
		},
	},
});
