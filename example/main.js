import { createApp } from "vue";
import App from "./App.vue";

import TaxoView from "taxoview";

// Create the Vue app
const app = createApp(App);

// Register your plugin globally, so <TaxoView /> is available
app.use(TaxoView);

app.mount("#app");
