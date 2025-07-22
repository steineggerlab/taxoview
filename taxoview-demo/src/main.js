/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'

// TaxoView
import TaxoView from "taxoview";

const app = createApp(App)

registerPlugins(app)

// Register TaxoView globally, so <TaxoView /> is available
app.use(TaxoView);

app.mount('#app')
