<template>
	<div id="sankey-container"></div>
</template>

<script>
import * as d3 from "d3";
import { sankeyRankColumns } from "./rankUtils.js";
import TaxoView from "./TaxoView.js"

export default {
	name: "TaxoView",
	props: {
		figureHeight: { type: Number, default: 700, required: false },
		figureWidth: { type: Number, default: 1100, required: false },
		labelOption: { type: Number, default: 1, required: false },
		marginBottom: { type: Number, default: 50, required: false },
		marginRight: { type: Number, default: 150, required: false },
		minThreshold: { type: Number, default: 0.001, required: false },
		minThresholdMode: { type: Number, default: 1, required: false },
		nodeLabelFontSize: { type: Number, default: 10, required: false },
		nodeValueFontSize: { type: Number, default: 10, required: false },
		nodePadding: { type: Number, default: 13, required: false },
		nodeWidth: { type: Number, default: 20, required: false },
		lowlightTextOpacity: { type: Number, default: 0.1, required: false },
		lowlightShapeOpacity: { type: Number, default: 0.1, required: false },
		linkPathOpacity: { type: Number, default: 0.3, required: false },
		fontWeight: { type: String, default: 'normal', required: false },
		fontFamily: { type: String, default: 'Arial, sans-serif', required: false },
		fontFill: { type: String, default: 'black', required: false },
		rankLabelFontSize: { type: Number, default: 14, required: false },
		rawData: { type: String, required: true },
		showAll: { type: Boolean, default: false, required: false },
		taxaLimit: { type: Number, default: 10, required: false },
		cladeReadsLabel: { type: String, default: "Clade Reads", required: false },
		searchQuery: { type: String, required: false },
		colorScheme: {
			type: Array,
      default: () => ([
        '#8CB5B5', // light teal
        '#785EF0', // purple
        '#E59579', // salmon
        '#506432', // dark green
        '#BC7576', // dark salmon
        '#6C3400', // light brown
        '#C14C32', // dark red
        '#648FFF', // blue
        '#FFCD73', // yellow
        '#41222A', // dark brown
      ]),
			validator: (arr) => Array.isArray(arr) && arr.every(color => typeof color === 'string' && CSS.supports('color', color))
		},
		ranksToShow: {
			type: Array,
			default: () => ["root", ...sankeyRankColumns],
			required: false
		},
	},
	data: () => ({
		sankeyRankColumns,
		sankeyRankColumnsWithRoot: ["root", ...sankeyRankColumns],
	}),
	watch: {
		figureHeight: 'updateSankey',
		figureWidth: 'updateSankey',
		labelOption: 'updateSankey',
		marginBottom: 'updateSankey',
		marginRight: 'updateSankey',
		minThreshold: 'updateSankey',
		minThresholdMode: 'updateSankey',
		nodeLabelFontSize: 'updateSankey',
		nodeValueFontSize: 'updateSankey',
		nodePadding: 'updateSankey',
		nodeWidth: 'updateSankey',
		lowlightTextOpacity: 'updateSankey',
		lowlightShapeOpacity: 'updateSankey',
		linkPathOpacity: 'updateSankey',
		fontWeight: 'updateSankey',
		fontFamily: 'updateSankey',
		fontFill: 'updateSankey',
		rankLabelFontSize: 'updateSankey',
		rawData: 'updateSankey',
		showAll: 'updateSankey',
		taxaLimit: 'updateSankey',
		cladeReadsLabel: 'updateSankey',
		colorScheme: 'updateSankey',
		ranksToShow: 'updateSankey',
		searchQuery: 'searchQueryFn'
	},
	computed: {
		sortedRanksToShow() {
			return this.sankeyRankColumnsWithRoot.filter(rank =>
				this.ranksToShow.includes(rank)
			);
		},
		chartFn() {
			return TaxoView()
				.onNodeClick(d => {
					this.$emit('node-clicked', d);
				})
				.onRanksPresent(ranks => this.$emit('ranks-present', ranks))
				.searchQuery(this.searchQuery)
				.height(this.figureHeight)
				.width(this.figureWidth)
				.labelOption(this.labelOption)
				.marginBottom(this.marginBottom)
				.marginRight(this.marginRight)
				.minThreshold(this.minThreshold)
				.minThresholdMode(this.minThresholdMode)
				.nodeLabelFontSize(this.nodeLabelFontSize)
				.nodeValueFontSize(this.nodeValueFontSize)
				.nodePadding(this.nodePadding)
				.nodeWidth(this.nodeWidth)
				.lowlightTextOpacity(this.lowlightTextOpacity)
				.lowlightShapeOpacity(this.lowlightShapeOpacity)
				.linkPathOpacity(this.linkPathOpacity)
				.fontWeight(this.fontWeight)
				.fontFamily(this.fontFamily)
				.fontFill(this.fontFill)
				.rankLabelFontSize(this.rankLabelFontSize)
				.data(this.rawData)
				.showAll(this.showAll)
				.taxaLimit(this.taxaLimit)
				.cladeReadsLabel(this.cladeReadsLabel)
				.colorScheme(this.colorScheme)
				.ranksToShow(this.sortedRanksToShow)
				.rankList(this.sankeyRankColumns);
		}
	},
	methods: {
		searchQueryFn(newVal) {
			if (!this.chart) return;
			this.chart.searchQuery(newVal);
			this.chart.searchQueryExternal(newVal);
		},
		createSankey() {
			const container = this.$el;
			if (!container) return;
			this.chart = this.chartFn;
			d3.select(container).transition().call(this.chart);
		},
		async updateSankey() {
			this.loading = true;
			setTimeout(() => {
				this.createSankey();
				this.loading = false;
			}, 100); // Small delay to ensure DOM updates
		}
	},
	async mounted() {
		this.createSankey();
	}
};
</script>

<style scoped>
svg.hide {
	display: none;
}

.node {
	cursor: grab;
}

.node:active {
	cursor: grabbing;
}
</style>