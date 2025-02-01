import TaxoView from "./TaxoView.vue";

export default {
	install: (app, options = {}) => {

		// Register component
		app.component("TaxoView", TaxoView);
	},
};