import SankeyDiagram from "./SankeyDiagram.vue";

export default {
	install: (app, options = {}) => {

		// Register component
		app.component("SankeyDiagram", SankeyDiagram);
	},
};