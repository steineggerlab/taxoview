# TaxoView

**TaxoView** is a Vue.js plugin that generates interactive Sankey diagrams using Kraken report data. This plugin simplifies the process of visualizing taxonomic classification data by directly accepting raw Kraken report content without any pre-processing.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
    - [1. Import and Use the Plugin](#1-import-and-use-the-plugin)
    - [2. Add the `<SankeyDiagram>` Component](#2-add-the-sankeydiagram-component)
4. [Format of the `rawData`](#format-of-the-rawdata)
    - [Fields](#fields)
    - [Important Notes](#important-notes)
    - [Example](#example)
5. [Props for `<SankeyDiagram>`](#props-for-sankeydiagram)
6. [Run the Example Project](#run-the-example-project)
7. [Contributing](#contributing)


## Features

- **Easy Kraken Report Parsing**: Directly accepts raw Kraken report data, eliminating the need for manual formatting.
- **Customizable Sankey Diagrams**: Fine-tune visualization settings such as the number of taxa displayed per rank, filtering of taxa based on read counts or percentages, label options, and figure dimensions.
- **Easy Integration**: Simple installation and usage with Vue.js projects.
- **Interactive Visualizations**: Hover over specific taxa to highlight lineage relationships and view detailed taxonomic information at a glance.


## Installation

You can install the plugin via npm:

```bash
npm install taxoview
```

## Usage
1. Import and Register the Plugin

To start using the plugin, import it and register it globally in your Vue.js application.
```
// main.js
import { createApp } from "vue";
import App from "./App.vue";

// Import TaxoView plugin
import TaxoView from "taxoview";

// Create Vue app
const app = createApp(App);

// Register the plugin globally
app.use(TaxoView);

app.mount("#app");
```

2. Add the `<SankeyDiagram>` Component
In your Vue component, use the `<SankeyDiagram>` component to render a Sankey diagram.
```
<template>
  <SankeyDiagram
    :rawData="fileContent"
    :taxaLimit=10
    :minThresholdMode=1
    :minThreshold=0.001
    :figureHeight=700
    :labelOption=1
    :showAll=false
  />
</template>

<script>
export default {
  data() {
    return {
      // Read the content of the Kraken report file
      fileContent: `
         5.9001         32656	32656	no rank	0	unclassified
         94.0999	520822	4	no rank	1	root
         90.8851	503029	0	superkingdom	10239	Viruses
      `,
    };
  },
};
</script>
```
## Format of the `rawData`
The `rawData` prop must be a **string** containing raw Kraken report data. The format is as follows:

### Fields
Fields must be **tab-separated,** and all fields in each feature line must contain a value otherwise they will be filtered out.
1. `proportion` - Percentage or proportion of reads belonging to this taxon.
2. `clade_reads` - Total number of reads for this taxon and all its descendants.
3. `taxon_reads` - Number of reads assigned specifically to this taxon.
4. `rank` - Taxonomic rank of the taxon *(superkingdom, kingdom, phylum, class, order, family, genus, species, no rank)*.
5. `taxon_id` - NCBI Taxon ID for the taxon.
6. `name` - Scientific name of the taxon.

### Important Notes
1. **No Headers**: The rawData string must not include a header row.
2. **First Two Rows**:
    - The first row must represent the *unclassified node* (Taxon ID 0).
    - The second row must represent the *root node* (Taxon ID 1).

### Example
```
# proportion  clade_reads taxon_reads rank taxon_id name // Don't have this header in your actual report file
5.9001	32656	32656	no rank	0	unclassified
94.0999	520822	4	no rank	1	root
90.8851	503029	0	superkingdom	10239	Viruses
90.8511	502841	0	clade	2559587	Riboviria
90.8511	502841	0	kingdom	2732396	Orthornavirae
90.8110	502619	0	phylum	2732408	Pisuviricota
90.8110	502619	0	class	2732506	Pisoniviricetes
90.8108	502618	0	order	76804	Nidovirales
90.8108	502618	0	suborder	2499399	Cornidovirineae
90.8108	502618	1	family	11118	Coronaviridae
90.8101	502614	4	subfamily	2501931	Orthocoronavirinae
```


## Props for `<SankeyDiagram>`
| Prop Name         | Type    | Required | Default    | Description                                                             |
|-------------------|---------|----------|------------|-------------------------------------------------------------------------|
| `rawData`          | String  | Yes      | N/A        | The raw Kraken report content as a string (no pre-processing required). |
| `taxaLimit`         | Number  | No      | 10         | Maximum number of taxa to display per rank in the Sankey diagram.                |
| `minThresholdMode` | Number  | No      | 1          | Filtering mode: 1 for proportions, 0 for raw counts.                |
| `minThreshold`          | Number  | No      | 0.001          | Minimum threshold for filtering taxa (based on minThresholdMode).         |
| `figureHeight`      | Number  | No      | 700        | Height of the Sankey diagram in pixels.                                 |
| `labelOption`       | Number  | No      | 1 | Labeling option: 1 for proportion, 0 for clade_reads.                         |
| `showAll`           | Boolean | No      | false      | Whether to show all taxa or apply filtering based on taxaLimit and minThreshold.         |


## Run the Example Project

To quickly test TaxoView, clone this repo and run the example:

```bash
git clone https://github.com/your-username/taxoview.git
cd taxoview/example
npm install
npm run dev
```
This will launch a Vue app showcasing the plugin in action.

## Contributing
Contributions are welcome! If you encounter issues or have feature requests, please open an issue or submit a pull request.


