<template>
    <svg
      ref="sankeyContainer"

    ></svg>
</template>

<script>
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyJustify } from "d3-sankey";
import { sankeyRankColumns } from "./rankUtils.js";
import TSVParser from "./tsvParser.js";
 
export default {
  name: "SankeyDiagram",
  props: {
    rawData: {
      type: String,
      required: true
    },

    // Configuration Options
	taxaLimit: {
		type: Number,
		default: 10,
		required: false,
	},
	minThresholdMode: {
		type: Number,
		default: 1,
		required: false,
	},
	minThreshold: {
		type: Number,
		default: 0.001,
		required: false,
	},
	figureHeight: {
		type: Number,
		default: 700,
		required: false,
	},
	labelOption: {
		type: Number,
		default: 1,
		required: false,
	},
	showAll: {
		type: Boolean,
		default: false,
		required: false,
	},
  },
  data: () => ({
    parsedData: [], // Holds the parsed JSON data
    allNodesByRank: {},
    nodesByDepth: {},

    sankeyRankColumns,
    sankeyRankColumnsWithRoot: ["no rank", ...sankeyRankColumns],
			autumnColors: [
				"#57291F",
				"#C0413B",
				"#D77B5F",
				"#FF9200",
				"#FFCD73",
				"#F7E5BF",
				"#C87505",
				"#F18E3F",
				"#E59579",
				"#C14C32",
				"#80003A",
				"#506432",
				"#FFC500",
				"#B30019",
				"#EC410B",
				"#E63400",
				"#8CB5B5",
				"#6C3400",
				"#FFA400",
				"#41222A",
				"#FFB27B",
				"#FFCD87",
				"#BC7576",
			], // Define color scale (https://wondernote.org/color-palettes-for-web-digital-blog-graphic-design-with-hexadecimal-codes/)
  }),

  watch: {
    rawData: {
      immediate: true,
      handler(newValue) {
        this.$nextTick(() => {
					if (newValue) {
						this.createSankey(newValue);
					}
				});
      }
    },
    // Configuration Options
	taxaLimit() {
		this.updateSankey();
	},
    minThresholdMode() {
		this.updateSankey();
	},
	minThreshold() {
		this.updateSankey();
	},
    figureHeight() {
		this.updateSankey();
	},
	labelOption() {
		this.updateSankey();
	},
	showAll() {
		this.updateSankey();
	},
  },
  methods: {
    filteredData(allData) {
      // Filter data based on configurations
      if (this.showAll) {
        return allData;
      }

      if (!allData) {
        return [];
      }

      return allData.filter((entry) => {
        let passesMinReads = false;
        if (this.minThresholdMode === 1) {
          passesMinReads = parseFloat(entry.proportion) >= this.minThreshold;
        } else if (this.minThresholdMode === 0) {
          passesMinReads = parseFloat(entry.clade_reads) >= this.minThreshold;
        }
        return passesMinReads;
      });
    },
    parseData(data, isFullGraph = false) {
			const selectedNodes = [];
			const allNodes = [];
			const selectedLinks = [];
			const allLinks = [];

			const nodesByRank = {}; // Store nodes by rank
			let currentLineage = [];
			this.nodesByDepth = {};

			let rootNode = null;
			let unclassifiedNode = null;
			/*
			Step 1: Create nodes and save lineage data for all nodes
			*/
			data.forEach((d) => {
				let node = {
					id: d.taxon_id,
					taxon_id: d.taxon_id,
					name: d.name,
					nameWithIndentation: d.nameWithIndentation,
					rank: d.rank,
					rankDisplayName: d.rank,
					hierarchy: parseInt(d.depth),
					proportion: parseFloat(d.proportion),
					clade_reads: parseInt(d.clade_reads),
					taxon_reads: d.taxon_reads,
					lineage: null,
					isUnclassifiedNode: false,
					children: [], // FIXME: change to null?
				};

				// Add node to its corresponding depth collection
				if (!Object.keys(this.nodesByDepth).map(Number).includes(node.hierarchy)) {
					this.nodesByDepth[node.hierarchy] = [];
				}
				this.nodesByDepth[node.hierarchy].push(node);

				// Add node to its corresponding rank collection
				// Consider root node and unclassified node separately
				if (this.sankeyRankColumns.includes(d.rank)) {
					if (!nodesByRank[d.rank]) {
						nodesByRank[d.rank] = [];
					}
					nodesByRank[d.rank].push(node);
				} else if (this.isUnclassifiedNode(node)) {
					// FIXME: figure out which rank to put unclassified node in
					if (!nodesByRank["no rank"]) {
						nodesByRank["no rank"] = [];
					}
					// nodesByRank["root"].push(node); // FIXME: overlapping issue with root node when i put this in
					
					// Reassign some attributes specific to unclassified node
					node.rank = "no rank";
					node.rankDisplayName = node.name;
					node.isUnclassifiedNode = true;
					
					unclassifiedNode = node;
				} else if (this.isRootNode(node)) {
					if (!nodesByRank["no rank"]) {
						nodesByRank["no rank"] = [];
					}
					nodesByRank["no rank"].push(node);

					// Reassign some attributes specific to root node
					node.rank = "no rank"; // FIXME: remove this after fixing logic to leave it as "no rank", same as taxonomyreport
					node.rankDisplayName = node.name;
					
					rootNode = node;
					allNodes.push(rootNode);
					selectedNodes.push(rootNode);
				} 
				
				// Store lineage for each node
				let lastLineageNode = currentLineage[currentLineage.length - 1];
				if (lastLineageNode) {
					let currentDepth = node.hierarchy;
					let lastDepth = lastLineageNode.hierarchy; 
					
					while (lastLineageNode && currentDepth <= lastDepth) {
						currentLineage.pop();
						
						lastLineageNode = currentLineage[currentLineage.length - 1];
						if (!lastLineageNode) {
							break; // Exit the loop if no more nodes in the lineage (i.e. traced back to root node)
						}
						
						lastDepth = lastLineageNode.hierarchy; // Update lastRank for the next iteration comparison
					}
				}
				// Append current node to currentLineage array + store lineage data
				currentLineage.push(node);
				node.lineage = [...currentLineage];
				
				// Store current node to parent's children collection (for sankey verification taxonomyreport regeneration)
				const parent = node.lineage[node.lineage.length - 2];
				if (parent) {
					parent.children.push(node);
				}
			});

			/* 
			Step 2: Store all nodes and store rank-filtered nodes separately
			*/
			this.sankeyRankColumns.forEach((rank) => {
				if (nodesByRank[rank]) {
					// Store all nodes
					allNodes.push(...nodesByRank[rank]);

					// Sort nodes by clade_reads in descending order and select the top nodes based on max limit value
					const topNodes = nodesByRank[rank].sort((a, b) => b.clade_reads - a.clade_reads).slice(0, !this.taxaLimit ? nodesByRank[rank].length : this.taxaLimit); // Show all when taxaLimit === 0
					selectedNodes.push(...topNodes);
				}
			});

			/* 
			Step 3: Create links and store each node to its parent's children collection
			*/ 
			// Define function to add links
			function generateLinks(nodes, targetArray, sankeyRankColumns) {
				nodes.forEach((node) => {
					// Find the previous node in the lineage that is in sankeyRankColumns
					const lineage = node.lineage;

					let previousNode = lineage[lineage.length - 2];
					while (previousNode) {
						const linkEntry = {
							sourceName: previousNode.name,
							source: previousNode.id,
							targetName: node.name,
							target: node.id,
							value: node.clade_reads,
						};

						if (sankeyRankColumns.includes(previousNode.rank) && nodes.includes(previousNode)) {
							targetArray.push(linkEntry);
							break;
						}

						previousNode = lineage[lineage.indexOf(previousNode) - 1];
					}
				});
			}

			// Call function to generate links for selected and all nodes
			generateLinks(selectedNodes, selectedLinks, this.sankeyRankColumnsWithRoot);
			generateLinks(allNodes, allLinks, this.sankeyRankColumnsWithRoot);

			/* 
			Step 4: Create node for Unclassified Sequences linked to the root node
			*/
			if (unclassifiedNode && rootNode) { // FIXME: remove rootNode if unneeded
					// Add to selected and all nodes (always present, excluded from taxa limit)
					selectedNodes.push(unclassifiedNode);
					allNodes.push(unclassifiedNode);

					// Add link from root node to unclassified node
					// selectedLinks.push({
					// 	sourceName: rootNode.name,
					// 	source: rootNode.id,
					// 	targetName: unclassifiedNode.name,
					// 	target: unclassifiedNode.id,
					// 	value: totalUnclassifiedCladeReads,
					// });
					// allLinks.push({
					// 	sourceName: rootNode.name,
					// 	source: rootNode.id,
					// 	targetName: unclassifiedNode.name,
					// 	target: unclassifiedNode.id,
					// 	value: totalUnclassifiedCladeReads,
					// });
				// }
			}

			return { nodes: selectedNodes, links: selectedLinks };
		},
		isRootNode(node) {
			// Check if the node is the root node
			return parseInt(node.taxon_id) === 1;
		},
		isUnclassifiedNode(node) {
			// Check if the node is the unclassified node
			return parseInt(node.taxon_id) === 0;
		},
    // Main function for drawing Sankey
		createSankey(fileContent) {
      // Data processing
      const jsonData = TSVParser.tsvToJSON(fileContent).results;

      // Filter data based on min read criteria after parsing
      const filteredData = this.filteredData(jsonData);


			const { nodes, links } = this.parseData(filteredData); // Convert to graph data format for d3.js

			// Check if nodes and links are not empty
			if (!nodes.length || !links.length) {
				console.warn("No data to create Sankey diagram"); // FIMXE: remove
				return;
			}

			const container = this.$refs.sankeyContainer;
			if (!container || !container.parentElement) {
				// Ensure the container and its parent are accessible
				return;
			}
			d3.select(container).selectAll("*").remove(); // Clear the previous diagram
			
			const width = 1100;
			const height = this.figureHeight;
			const marginBottom = 50; // Margin for rank labels
			const marginRight = 150;
			const nodeWidth = 20;
			const nodePadding = 13;

			const svg = d3
				.select(container)
				.attr("viewBox", `0 0 ${width} ${height+marginBottom}`)
				.attr("width", "100%")
				.attr("height", height + marginBottom)
				.classed("hide", false); // FIXME: fix to svg

			const sankeyGenerator = sankey()
				.nodeId((d) => d.id)
				.nodeAlign(sankeyJustify)
				.nodeWidth(nodeWidth)
				.nodePadding(nodePadding)
				.iterations(100)
				.extent([
					[10, 10],
					[width - marginRight, height - 6],
				]);

			const graph = sankeyGenerator({
				nodes: nodes.map((d) => Object.assign({}, d)),
				links: links.map((d) => Object.assign({}, d)),
			});
			const color = d3.scaleOrdinal().range(this.autumnColors);
			const unclassifiedLabelColor = "#696B7E";

			// Manually adjust nodes position to align by rank
			const columnWidth = (width - marginRight) / this.sankeyRankColumnsWithRoot.length;
			const columnMap = this.sankeyRankColumnsWithRoot.reduce((acc, rank, index) => {
				const leftMargin = 10;
				acc[rank] = index * columnWidth + leftMargin;
				return acc;
			}, {});

			// Update node positions (based on rank) and color
			graph.nodes.forEach((node) => {
				node.x0 = columnMap[node.rank];
				node.x1 = node.x0 + sankeyGenerator.nodeWidth();

				if (node.isUnclassifiedNode) {
					node.color = unclassifiedLabelColor;
				} else {
					node.color = color(node.id); // Assign color to node
				}
			});

			// Re-run the layout to ensure correct vertical positioning
			sankeyGenerator.update(graph);

			// Add rank column labels
			const rankLabels = [" ", "D", "K", "P", "C", "O", "F", "G", "S"];
			svg
				.append("g")
				.selectAll("text")
				.data(this.sankeyRankColumnsWithRoot)
				.enter()
				.append("text")
				.attr("x", (rank) => columnMap[rank] + sankeyGenerator.nodeWidth() / 2)
				.attr("y", height + marginBottom / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
        .style("font-family", "Arial, sans-serif") 
				.text((rank, index) => rankLabels[index]);

			// Draw rank label divider link
			svg
				.append("line")
				.attr("x1", 0)
				.attr("y1", height + 10)
				.attr("x2", width)
				.attr("y2", height + 10)
				.attr("stroke", "#000")
				.attr("stroke-width", 1);

			// Function to highlight lineage
			const highlightLineage = (node) => {
				const lineageIds = new Set(node.lineage.map((n) => n.id));
				lineageIds.add(node.id);

				svg.selectAll("rect").style("opacity", (d) => (lineageIds.has(d.id) ? 1 : 0.2));
				svg.selectAll("path").style("opacity", (d) => (lineageIds.has(d.source.id) && lineageIds.has(d.target.id) ? 1 : 0.2));
				svg.selectAll(".node-name").style("opacity", (d) => (lineageIds.has(d.id) ? 1 : 0.1));
				svg.selectAll(".clade-reads").style("opacity", (d) => (lineageIds.has(d.id) ? 1 : 0.1));
			};

			// Function to reset highlight
			const resetHighlight = () => {
				svg.selectAll("rect").style("opacity", 1);
				svg.selectAll("path").style("opacity", 1);
				svg.selectAll(".node-name").style("opacity", 1);
				svg.selectAll(".clade-reads").style("opacity", 1);
			};

			// Define a clipping path for each link (crops out curve when links are too thick)
			svg
				.append("defs")
				.selectAll("clipPath")
				.data(graph.links)
				.enter()
				.append("clipPath")
				.attr("id", (d, i) => `clip-path-${this.instanceId}-${i}`)
				.append("rect")
				.attr("x", (d) => d.source.x1)
				.attr("y", 0)
				.attr("width", (d) => d.target.x0 - d.source.x1)
				.attr("height", height);

			// Add links
			svg
				.append("g")
				.attr("fill", "none")
				.attr("stroke-opacity", 0.3)
				.selectAll("path")
				.data(graph.links)
				.enter()
				.append("path")
				.attr("d", sankeyLinkHorizontal())
				.attr("stroke", (d) => (d.target.isUnclassifiedNode ? unclassifiedLabelColor : d3.color(d.source.color))) // Set link color to source node color with reduced opacity
				.attr("stroke-width", (d) => Math.max(1, d.width))
				.attr("clip-path", (d, i) => `url(#clip-path-${this.instanceId}-${i})`);

			// Create node group (node + labels) and add mouse events
			const nodeGroup = svg
				.append("g")
				.selectAll(".node-group")
				.data(graph.nodes)
				.enter()
				.append("g")
				.attr("class", (d) => "node-group taxid-" + d.id)
				.attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
				.on("mouseover", (event, d) => {
					if (!this.searchQuery || this.searchQueryMatchNodes.has(d.id)) {
						// If there's no search query, or if the node matches the search query, highlight
						highlightLineage(d);

            // Append tooltip to the body
					const tooltip = d3.select("body")
						.append("div")
						.attr("class", "tooltip")
						.style("position", "absolute")
						.style("background-color", "rgba(38, 50, 56, 0.95)")
						.style("color", "white")
            .style("font-family", "Arial, sans-serif") 
						.style("border-radius", "8px")
						.style("padding", "10px")
						.style("box-shadow", "0 2px 6px rgba(0, 0, 0, 0.1)")
						.style("opacity", 1)
						.html(`
							<div style="padding-top: 4px; padding-bottom: 4px; padding-left: 8px; padding-right: 8px;">
								${d.type !== "unclassified" ? `<p style="font-size: 0.6rem; margin-bottom: 0px;">#${d.taxon_id}</p>` : ""}
								<div style="display: flex; justify-content: space-between; align-items: center;">
									<div style="font-weight: bold; font-size: 0.875rem;">${d.name}</div>
									${d.type !== "unclassified" ? `<span style="background-color: rgba(255, 167, 38, 0.25); color: #ffa726; 
																				font-weight: bold; padding: 4px 8px; border-radius: 12px; 
																				font-size: 0.875rem; margin-left: 10px;">${d.rankDisplayName}</span>` : ''}
								</div>
								<hr style="margin: 8px 0; border: none; border-top: 1px solid #fff; opacity: 0.2;">
								<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
									<div style="font-weight: bold;">Clade Reads</div>
									<div style="margin-left: 10px;">${d.clade_reads}</div>
								</div>
							</div>
						`);

					// Position the tooltip
					tooltip
					.style("left", `${event.pageX + 10}px`)
					.style("top", `${event.pageY + 10}px`);
					}
				})
				.on("mousemove", (event) => {
					// Move tooltip
          d3.select(".tooltip")
						.style("left", `${event.pageX + 10}px`)
						.style("top", `${event.pageY + 10}px`);
				})
				.on("mouseout", () => {
					if (!this.searchQuery) {
						// If there's no search query, reset all highlights
						resetHighlight();
					} else {
						this.highlightNodes(this.searchQuery);
					}
          // Remove the tooltip when mouse leaves
					d3.select(".tooltip").remove();
				});


			// Create node rectangles
			nodeGroup
				.append("rect")
				.attr("width", (d) => d.x1 - d.x0)
				.attr("height", (d) => this.nodeHeight(d))
				.attr("fill", (d) => (d.isUnclassifiedNode ? unclassifiedLabelColor : d.color))
				.attr("class", (d) => "node taxid-" + d.id)
				.style("cursor", "pointer");

			// Add node name labels next to node
			nodeGroup
				.append("text")
				.attr("id", (d) => `nodeName-${d.id}`)
				.attr("class", (d) => "node-name taxid-" + d.id)
				.attr("x", (d) => d.x1 - d.x0 + 3)
				.attr("y", (d) => this.nodeHeight(d) / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "start")
				.text((d) => d.name)
				.style("font-size", "10px")
				.style("font-weight", "normal")
        .style("font-family", "Arial, sans-serif") 
				.style("fill", (d) => (d.isUnclassifiedNode ? unclassifiedLabelColor : "black"))
				.style("cursor", "pointer");

			// Add label above node (proportion/clade reads)
			nodeGroup
				.append("text")
				.attr("id", (d) => `cladeReads-${d.id}`)
				.attr("class", (d) => "clade-reads taxid-" + d.id)
				.attr("x", (d) => (d.x1 - d.x0) / 2)            
				.attr("y", -5)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
				.style("font-size", "10px")
				.style("font-weight", "normal")
        .style("font-family", "Arial, sans-serif") 
				.style("fill", (d) => (d.isUnclassifiedNode ? unclassifiedLabelColor : "black"))
				.text((d) => (this.labelOption === 1 ? this.formatProportion(d.proportion) : this.formatCladeReads(d.clade_reads)))
				.style("cursor", "pointer");
		},

    // Functions for rerendering/updating Sankey
		async updateSankey() {
			// Start loading, show loading display
			this.loading = true;

			try {
				await this.fetchSankey();
			} catch (error) {
				console.error("Error in updateSankey:", error);
			} finally {
				setTimeout(() => {
					this.loading = false;
				}, 100); // Small delay to ensure DOM updates
			}
		},
		async fetchSankey() {
			await new Promise((resolve) => {
				setTimeout(() => {
					this.createSankey(this.rawData); // Create the Sankey diagram immediately after getting data
					resolve();
				}, 50); // Immediate execution after fetching data
			});
		},

    // Helper functions for drawing Sankey
		nodeHeight(d) {
			// FIXME
			let nodeHeight = d.y1 - d.y0;
			if (nodeHeight < 1) {
				return 1.5;
			} else {
				return d.y1 - d.y0;
			}
		},
		formatCladeReads(value) {
			if (value >= 1000) {
				return `${(value / 1000).toFixed(2)}k`;
			}
			return value.toString();
		},
		formatProportion(value) {
			return `${value.toFixed(3)}%`;
		},
		updateDiagramWidth() {
			this.diagramWidth = window.innerWidth;
		},
  },
  async mounted() {
		// Listener for screen resizing event
		window.addEventListener("resize", this.updateDiagramWidth);
	},
	beforeUnmount() {
		window.removeEventListener("resize", this.updateDiagramWidth);
	},
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
