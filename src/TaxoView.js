/**
 * Reusable D3 sankey chart for TaxoView Vue component
 */

import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyJustify } from "d3-sankey";
import { sankeyRankColumns, rankLabels } from "./rankUtils.js";
import TSVParser from "./tsvParser.js";
import "./stylesheet.css";

let chartId = 0;

function generateChartId() {
	return chartId++;
}

function createAccessors(chart, config) {
	Object.keys(config).forEach((key) => {
		chart[key] = function (_) {
			if (!arguments.length) return config[key];
			config[key] = _;
			return chart;
		};
	});
}

export default function TaxoView() {
	const chartUniqueId = generateChartId();
	const config = {
		width: 800,
		height: 600,
		marginBottom: 50, // Margin for rank labels
		marginRight: 150,
		nodeWidth: 20,
		nodePadding: 13,
		data: null,
		taxaLimit: 10,
		minThresholdMode: 0,
		minThreshold: 0.001,
		labelOption: 1,
		showAll: false,
		nodeLabelFontSize: 10,
		nodeValueFontSize: 10,
		rankLabelFontSize: 14,
		lowlightTextOpacity: 0.2,
		lowlightShapeOpacity: 0.1,
		linkPathOpacity: 0.3,
		fontWeight: "normal",
		fontFamily: "Arial, sans-serif",
		fontFill: "black",
		// superkingdom --> domain
		rankList: sankeyRankColumns,
		ranksToShow: ["no rank", ...sankeyRankColumns],
		colorScheme: [
			"#8CB5B5", // light teal
			"#785EF0", // purple
			"#E59579", // salmon
			"#506432", // dark green
			"#BC7576", // dark salmon
			"#6C3400", // light brown
			"#C14C32", // dark red
			"#648FFF", // blue
			"#FFCD73", // yellow
			"#41222A", // dark brown
		],
		unclassifiedLabelColor: "#696B7E",
		rootColor: "#41222A",
		cladeReadsLabel: "Clade Reads",
		data: null,
		searchQuery: "",
		searchQueryMatchNodes: new Set(),
		onNodeClick: null,
		onRanksPresent: null,
	};

	let nodesByDepth = {};
	let selectionCache = null;

	function filterThreshold(allData) {
		// Filter raw based on minimum thresholds
		if (config.showAll) return allData;
		if (!allData) return [];
		return allData.filter((entry) => {
			return config.minThresholdMode === 1 ? parseFloat(entry.proportion) >= config.minThreshold : parseFloat(entry.clade_reads) >= config.minThreshold;
		});
	}

	function isRootNode(node) {
		return parseInt(node.taxon_id) === 1;
	}

	function isUnclassifiedNode(node) {
		return parseInt(node.taxon_id) === 0;
	}

	function nodeHeight(d) {
		// FIXME
		let height = d.y1 - d.y0;
		if (height < 1) {
			return 1.5;
		} else {
			return d.y1 - d.y0;
		}
	}

	function formatCladeReads(value) {
		if (value >= 1000) {
			return `${(value / 1000).toFixed(2)}k`;
		}
		return value.toString();
	}

	function formatProportion(value) {
		return `${value.toFixed(3)}%`;
	}

	function parseData(data, isFullGraph = false) {
		nodesByDepth = {}; // overwrite data

		const selectedNodes = [];
		const allNodes = [];
		const selectedLinks = [];
		const allLinks = [];

		const nodesByRank = {}; // Store nodes by rank
		let currentLineage = [];

		// Step 1: Create nodes and save lineage data for all nodes
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
				isRootNode: false,
				children: [], // FIXME: change to null?
			};

			// Add node to its corresponding depth collection
			if (!Object.keys(nodesByDepth).map(Number).includes(node.hierarchy)) {
				nodesByDepth[node.hierarchy] = [];
			}
			nodesByDepth[node.hierarchy].push(node);

			// Add node to its corresponding rank collection
			// Consider root node and unclassified node separately
			if (config.rankList.includes(d.rank)) {
				if (!nodesByRank[d.rank]) {
					nodesByRank[d.rank] = [];
				}
				nodesByRank[d.rank].push(node);
			} else if (isUnclassifiedNode(node)) {
				// FIXME: figure out which rank to put unclassified node in
				if (!nodesByRank["no rank"]) {
					nodesByRank["no rank"] = [];
				}
				nodesByRank["no rank"].push(node);

				// Reassign some attributes specific to unclassified node
				node.rank = "no rank";
				node.rankDisplayName = node.name;
				node.isUnclassifiedNode = true;
			} else if (isRootNode(node)) {
				if (!nodesByRank["no rank"]) {
					nodesByRank["no rank"] = [];
				}
				nodesByRank["no rank"].push(node);

				// Reassign some attributes specific to root node
				node.rank = "no rank"; // FIXME: remove this after fixing logic to leave it as "no rank", same as taxonomyreport
				node.rankDisplayName = node.name;
				node.isRootNode = true;
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

        // Collect and emit ranks present in the original data
		const rankListWithRoot = ["no rank", ...sankeyRankColumns];
		const ranksPresent = Object.keys(nodesByRank).filter((rank) => rankListWithRoot.includes(rank));
		config.onRanksPresent(ranksPresent);

		// Step 2: Store all nodes and store rank-filtered nodes separately
		config.ranksToShow
			.slice()
			.reverse() // Iterating from the higher ranks helps with node overlapping
			.forEach((rank) => {
				if (nodesByRank[rank]) {
					// Store all nodes
					allNodes.push(...nodesByRank[rank]);

					// Sort nodes by clade_reads in descending order and select the top nodes based on max limit value
					const topNodes = nodesByRank[rank].sort((a, b) => b.clade_reads - a.clade_reads).slice(0, isFullGraph ? nodesByRank[rank].length : config.taxaLimit);
					selectedNodes.push(...topNodes);
				}
			});

		// Step 3: Create links and store each node to its parent's children collection
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
		generateLinks(selectedNodes, selectedLinks, config.ranksToShow);
		generateLinks(allNodes, allLinks, config.ranksToShow);

		return { nodes: selectedNodes, links: selectedLinks };
	}

	function highlightNodes(query) {
		const svg = selectionCache.select("svg");
		config.searchQueryMatchNodes.clear(); // Clear previous matches

		// If the query is empty, reset all nodes and links to full opacity
		if (query === "" || !query) {
			svg.selectAll("rect").style("fill-opacity", (d) => d.opacity);
			svg.selectAll(".link-path").style("stroke-opacity", (d) => d.target.opacity * config.linkPathOpacity);
			svg.selectAll("text.node").style("opacity", 1);
			svg.selectAll(".clade-reads").style("opacity", 1);
			return;
		}

		// Iterate over nodes to find those that match the query
		svg.selectAll(".node-group").each((d) => {
			if (d.name.toLowerCase().includes(query.toLowerCase()) || d.taxon_id.startsWith(query)) {
				config.searchQueryMatchNodes.add(d.id);
			}
		});

		// Set opacity for nodes and links
		svg.selectAll("rect").style("fill-opacity", (d) => (config.searchQueryMatchNodes.has(d.id) ? d.opacity : config.lowlightShapeOpacity));
		svg.selectAll(".link-path").style("stroke-opacity", (d) => d.target.opacity * config.lowlightShapeOpacity);
		svg.selectAll("text.node").style("opacity", (d) => (config.searchQueryMatchNodes.has(d.id) ? 1 : config.lowlightTextOpacity));
		svg.selectAll(".clade-reads").style("opacity", (d) => (config.searchQueryMatchNodes.has(d.id) ? 1 : config.lowlightTextOpacity));
	}

	function createSankey(fileContent) {
		// Data processing
		// Filter data based on min read criteria after parsing
		const jsonData = TSVParser.tsvToJSON(fileContent).results;
		const filteredData = filterThreshold(jsonData);
		const { nodes, links } = parseData(filteredData, config.showAll); // Convert to graph data format for d3.js

		// Check if nodes and links are not empty
		if (!nodes.length || !links.length) {
			console.warn("No data to create Sankey diagram"); // FIMXE: remove
			return;
		}

		const container = selectionCache;
		if (!container) {
			// Ensure the container and its parent are accessible
			return;
		}
		container.selectAll("*").remove(); // Clear the previous diagram

		let height = config.height + config.marginBottom;
		const svg = container.append("svg").attr("viewBox", `0 0 ${config.width} ${height}`).attr("width", "100%").attr("height", height).classed("hide", false); // FIXME: fix to svg

		const sankeyGenerator = sankey()
			.nodeId((d) => d.id)
			.nodeAlign(sankeyJustify)
			.nodeWidth(config.nodeWidth)
			.nodePadding(config.nodePadding)
			.iterations(100)
			.extent([
				[10, 10],
				[config.width - config.marginRight, config.height - 6],
			]);

		const graph = sankeyGenerator({
			nodes: nodes.map((d) => Object.assign({}, d)),
			links: links.map((d) => Object.assign({}, d)),
		});

		// Manually adjust nodes position to align by rank
		const columnWidth = (config.width - config.marginRight) / config.ranksToShow.length;
		const columnMap = config.ranksToShow.reduce((acc, rank, index) => {
			const leftMargin = 10;
			acc[rank] = index * columnWidth + leftMargin;
			return acc;
		}, {});

		// Extract kingdom/domain/rank names for color grouping
		const colorGroupNames = Array.from(
			new Set(
				graph.nodes.map((node) => {
					// find the first matching ancestor in priority order
					const ancestor = node.lineage.reverse().find((a) => a.rank === "domain");
					return ancestor ? ancestor.name : "root";
				})
			)
		);

		// Build color scale from group names
		const groupColor = d3.scaleOrdinal().domain(colorGroupNames).range(config.colorScheme);

		// Compute opacity scale based on node position
		const opacityScale = d3
			.scaleLinear()
			.domain([1, config.width - config.marginRight])
			.range([1, 0.3]);

		// Update node positions (based on rank) and color
		graph.nodes.forEach((node) => {
			// Set node position and width
			node.x0 = columnMap[node.rank];
			node.x1 = node.x0 + sankeyGenerator.nodeWidth();

			// Assign color based on group color
			if (node.isUnclassifiedNode) {
				node.color = config.unclassifiedLabelColor;
			} else if (node.isRootNode) {
				node.color = config.rootColor;
			} else {
				const ancestor = node.lineage.reverse().find((a) => a.rank === "domain");
				node.color = ancestor ? groupColor(ancestor.name) : config.rootColor;
			}

			// Set opacity based on node position
			node.opacity = opacityScale(columnMap[node.rank]);
		});

		// Re-run the layout to ensure correct vertical positioning
		sankeyGenerator.update(graph);

		svg
			.append("g")
			.selectAll("text")
			.data(config.ranksToShow)
			.join("text")
			.text((rank) => rankLabels[rank])
			.attr("x", (rank) => columnMap[rank] + sankeyGenerator.nodeWidth() / 2)
			.attr("y", config.height + config.marginBottom / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
			.attr("class", "rank-label")
			.attr("font-weight", config.fontWeight)
			.attr("font-family", config.fontFamily)
			.attr("font-size", `${config.rankLabelFontSize}px`);

		// Draw rank label divider link
		svg
			.append("line")
			.classed("rank-axis", true)
			.attr("x1", 0)
			.attr("y1", config.height + 10)
			.attr("x2", config.width)
			.attr("y2", config.height + 10)
			.attr("stroke", config.fontFill)
			.attr("stroke-width", 1);

		// Function to highlight lineage
		const highlightLineage = (node) => {
			const lineageIds = new Set(node.lineage.map((n) => n.id));
			lineageIds.add(node.id);
			svg.selectAll("rect").style("fill-opacity", (d) => (lineageIds.has(d.id) ? d.opacity : config.lowlightShapeOpacity));
			svg
				.selectAll(".link-path")
				.style("stroke-opacity", (d) => (lineageIds.has(d.source.id) && lineageIds.has(d.target.id) ? d.target.opacity * config.linkPathOpacity : d.target.opacity * config.lowlightShapeOpacity));
			svg.selectAll("text.node").style("opacity", (d) => (lineageIds.has(d.id) ? 1 : config.lowlightTextOpacity));
			svg.selectAll(".clade-reads").style("opacity", (d) => (lineageIds.has(d.id) ? 1 : config.lowlightTextOpacity));
		};

		// Function to reset highlight
		const resetHighlight = () => {
			svg.selectAll("rect").style("fill-opacity", (d) => d.opacity);
			svg.selectAll(".link-path").style("stroke-opacity", (d) => d.target.opacity * config.linkPathOpacity);
			svg.selectAll("text.node").style("opacity", 1);
			svg.selectAll(".clade-reads").style("opacity", 1);
		};

		// Define a clipping path for each link (crops out curve when links are too thick)
		svg
			.append("defs")
			.selectAll("clipPath")
			.data(graph.links)
			.join("clipPath")
			.attr("id", (_, i) => `clip-path-${chartUniqueId}-${i}`)
			.append("rect")
			.attr("x", (d) => d.source.x1)
			.attr("y", 0)
			.attr("width", (d) => d.target.x0 - d.source.x1)
			.attr("height", config.height);

		// Add links
		const linkGroup = svg.append("g").attr("class", "link-group");

		linkGroup
			.selectAll("path")
			.data(graph.links)
			.join("path")
			.attr("class", "link-path")
			.attr("d", sankeyLinkHorizontal())
			.attr("fill", "none")
			.attr("stroke-opacity", (d) => d.target.opacity * config.linkPathOpacity)
			.attr("stroke", (d) => (d.target.isUnclassifiedNode ? config.unclassifiedLabelColor : d.target.isRootNode ? config.rootColor : d3.color(d.target.color))) // Set link color to source node color with reduced opacity
			.attr("stroke-width", (d) => Math.max(1, d.width))
			.attr("clip-path", (_, i) => `url(#clip-path-${chartUniqueId}-${i})`);

		// Create node group (node + labels) and add mouse events
		const nodeGroup = svg
			.append("g")
			.selectAll(".node-group")
			.data(graph.nodes)
			.join("g")
			.style("cursor", "pointer")
			.attr("class", (d) => `node-group taxid-${d.id}`)
			.attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
			.on("mouseover", (event, d) => {
				if (!config.searchQuery || config.searchQueryMatchNodes.has(d.id)) {
					// If there's no search query, or if the node matches the search query, highlight
					highlightLineage(d);

					const tooltipHTML = `
                        <div class="tooltip-inner">
                          ${d.type !== "unclassified" ? `<p class="tooltip-id">#${d.taxon_id}</p>` : ""}
                          <div class="tooltip-header">
                            <div>${d.name}</div>
                            ${d.type !== "unclassified" ? `<span class="tooltip-badge">${d.rankDisplayName}</span>` : ""}
                          </div>
                          <hr>
                          <div class="tooltip-row">
                            <div class="tooltip-label">${config.cladeReadsLabel}</div>
                            <div>${d.clade_reads}</div>
                          </div>
                        </div>
                    `;
					// Append tooltip to the body
					const tooltip = d3.select("body").append("div").attr("class", "tooltip").html(tooltipHTML);

					// Position the tooltip
					tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY + 10}px`);
				}
			})
			.on("mousemove", (event) => {
				// Move tooltip
				d3.select(".tooltip")
					.style("left", `${event.pageX + 10}px`)
					.style("top", `${event.pageY + 10}px`);
			})
			.on("mouseout", () => {
				if (!config.searchQuery) {
					// If there's no search query, reset all highlights
					resetHighlight();
				} else {
					highlightNodes(config.searchQuery);
				}
				// Remove the tooltip when mouse leaves
				d3.select(".tooltip").remove();
			})
			.on("click", (_, d) => {
				if (typeof config.onNodeClick === "function") {
					config.onNodeClick(d);
				}
			});

		// Create node rectangles
		nodeGroup
			.append("rect")
			.attr("width", (d) => d.x1 - d.x0)
			.attr("height", (d) => nodeHeight(d))
			.attr("class", (d) => `node taxid-${d.id}`)
			.attr("fill", (d) => `${d.isUnclassifiedNode ? config.unclassifiedLabelColor : d.isRootNode ? config.rootColor : d.color}`)
			.attr("fill-opacity", (d) => d.opacity);

		// Add node name labels next to node
		nodeGroup
			.append("text")
			.text((d) => d.name)
			.attr("id", (d) => `nodeName-${d.id}`)
			.attr("class", (d) => "node-name taxid-" + d.id)
			.attr("x", (d) => d.x1 - d.x0 + 3)
			.attr("y", (d) => nodeHeight(d) / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", "start")
			.attr("class", (d) => `node taxid-${d.id}`)
			.attr("fill", (d) => `${d.isUnclassifiedNode ? config.unclassifiedLabelColor : config.fontFill}`)
			.attr("font-weight", config.fontWeight)
			.attr("font-family", config.fontFamily)
			.attr("font-size", `${config.nodeLabelFontSize}px`);

		// Add label above node (proportion/clade reads)
		nodeGroup
			.append("text")
			.text((d) => (config.labelOption === 1 ? formatProportion(d.proportion) : formatCladeReads(d.clade_reads)))
			.attr("id", (d) => `cladeReads-${d.id}`)
			.attr("class", (d) => `clade-reads taxid-${d.id}`)
			.attr("fill", (d) => `${d.isUnclassifiedNode ? config.unclassifiedLabelColor : config.fontFill}`)
			.attr("x", (d) => (d.x1 - d.x0) / 2)
			.attr("y", -5)
			.attr("dy", "0.35em")
			.attr("text-anchor", "middle")
			.attr("font-weight", config.fontWeight)
			.attr("font-family", config.fontFamily)
			.attr("font-size", `${config.nodeValueFontSize}px`);

		if (config.searchQuery) highlightNodes(config.searchQuery);
	}

	function chart(selection) {
		selection.each(function () {
			selectionCache = d3.select(this);
			createSankey(config.data);
		});
	}

	chart.searchQueryExternal = (query) => {
		highlightNodes(query);
	};

	// Setters/getters for all configurables
	createAccessors(chart, config);

	return chart;
}
