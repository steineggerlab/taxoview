import { defineCustomElement } from "vue";
import TaxoView from "./TaxoView.vue";

const TaxoViewElement = defineCustomElement(TaxoView);
customElements.define("taxo-view", TaxoViewElement);
