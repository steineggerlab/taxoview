import { createApp } from "vue";
import App from "./App.vue";

// If your plugin has an `install` method:
import TaxoView from "taxoview";

// Create the Vue app
const app = createApp(App);

// Register your plugin globally, so <SankeyDiagram /> is available:
app.use(TaxoView);

app.mount("#app");
