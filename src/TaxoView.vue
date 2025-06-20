<template>
	<div ref="sankeyContainer"></div>
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
		colorScheme: {
			type: Array,
			default: () => ([
				"#57291F", "#C0413B", "#D77B5F", "#FF9200", "#FFCD73", "#F7E5BF", "#C87505",
				"#F18E3F", "#E59579", "#C14C32", "#80003A", "#506432", "#FFC500", "#B30019",
				"#EC410B", "#E63400", "#8CB5B5", "#6C3400", "#FFA400", "#41222A", "#FFB27B",
				"#FFCD87", "#BC7576",
			]),
			validator: (arr) => Array.isArray(arr) && arr.every(color => typeof color === 'string' && CSS.supports('color', color))
		}
	},
	data: () => ({
		sankeyRankColumns,
		sankeyRankColumnsWithRoot: ["no rank", ...sankeyRankColumns],
	}),
	watch: {
		rawData: 'updateSankey',
		taxaLimit: 'updateSankey',
		minThresholdMode: 'updateSankey',
		minThreshold: 'updateSankey',
		figureHeight: 'updateSankey',
		labelOption: 'updateSankey',
		showAll: 'updateSankey',
		figureWidth: 'updateSankey',
		marginBottom: 'updateSankey',
		marginRight: 'updateSankey',
		nodeWidth: 'updateSankey',
		nodePadding: 'updateSankey',
		nodeLabelFontSize: 'updateSankey',
		nodeValueFontSize: 'updateSankey',
		rankLabelFontSize: 'updateSankey',
		linkPathOpacity: 'updateSankey',
		fontWeight: 'updateSankey',
		fontFill: 'updateSankey',
		fontFamily: 'updateSankey',
		lowlightShapeOpacity: 'updateSankey',
		lowlightTextOpacity: 'updateSankey',
	},
	computed: {
		chartFn() {
			return TaxoView()
				.cladeReadsLabel(this.cladeReadsLabel)
				.colorScheme(this.colorScheme)
				.fontFamily(this.fontFamily)
				.fontFill(this.fontFill)
				.fontWeight(this.fontWeight)
				.height(this.figureHeight)
				.labelOption(this.labelOption)
				.linkPathOpacity(this.linkPathOpacity)
				.lowlightShapeOpacity(this.lowlightShapeOpacity)
				.lowlightTextOpacity(this.lowlightTextOpacity)
				.marginBottom(this.marginBottom)
				.marginRight(this.marginRight)
				.minThreshold(this.minThreshold)
				.minThresholdMode(this.minThresholdMode)
				.nodeLabelFontSize(this.nodeLabelFontSize)
				.nodePadding(this.nodePadding)
				.nodeValueFontSize(this.nodeValueFontSize)
				.nodeWidth(this.nodeWidth)
				.rankLabelFontSize(this.rankLabelFontSize)
				.rankList(this.sankeyRankColumns)
				.rankListWithRoot(this.sankeyRankColumnsWithRoot)
				.showAll(this.showAll)
				.taxaLimit(this.taxaLimit)
				.width(this.figureWidth)
				.data(this.rawData);
		}
	},
	methods: {
		createSankey() {
			const container = this.$refs.sankeyContainer;
			if (!container || !container.parentElement) return;
			d3.select(container).transition().call(this.chartFn);
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