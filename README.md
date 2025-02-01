# TaxoSankey

**TaxoSankey** is a Vue.js plugin that generates interactive Sankey diagrams using Kraken report data. This plugin simplifies the process of visualizing taxonomic classification data by directly accepting raw Kraken report content without any pre-processing.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
   - [1. Import and Use the Plugin](#1-import-and-use-the-plugin)
   - [2. Add the `<SankeyDiagram>` Component](#2-add-the-sankeydiagram-component)
4. [Format of the `rawData`](#format-of-the-rawdata)
   - [Example](#example)
   - [Column Descriptions](#column-descriptions)
   - [Important Notes](#important-notes)
5. [Props for `<SankeyDiagram>`](#props-for-sankeydiagram)
6. [Example Project](#example-project)
   - [File Structure](#1-file-structure)
   - [App.vue](#2-appvue)
7. [Development and Testing](#development-and-testing)
8. [Contributing](#contributing)



## Features

- **Raw Kraken Report Parsing**: Accepts raw Kraken report data as input, eliminating the need for manual data formatting.
- **Customizable Sankey Diagrams**: Configure diagram settings such as the number of taxa displayed per rank, filtering thresholds, label options, and dimensions.
- **Easy Integration**: Simple installation and usage with Vue.js.
- **Interactive Visualizations**: Leverage D3.js for rich, dynamic diagrams.


## Installation

You can install the plugin via npm:

```bash
npm install taxosankey
```

## Usage
1. Import and Use the Plugin
To start using the plugin, import it and register it globally in your Vue.js application.
```
// main.js
import { createApp } from "vue";
import App from "./App.vue";

// Import TaxoSankey plugin
import TaxoSankey from "taxosankey";

// Create Vue app
const app = createApp(App);

// Register the plugin globally
app.use(TaxoSankey);

app.mount("#app");
```

2. Add the `<SankeyDiagram>` Component
In your Vue component, use the `<SankeyDiagram>` component to render a Sankey diagram.
```
<template>
  <SankeyDiagram
    :rawData="fileContent"
    :taxaLimit="15"
    :minCladeReadsMode="'#'"
    :minReads="2"
    :figureHeight="1000"
    :labelOption="'proportion'"
    :showAll="false"
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
### Example
```
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
### Column Description
| Column            | Description                                                                        |
|-------------------|------------------------------------------------------------------------------------|
| 1st (percentage)  | Percentage or proportion of reads belonging to this taxon.                         |
| 2nd (clade_reads) | Total number of reads for this taxon and all its descendants (clade reads).        |
| 3rd (taxon_reads) | Number of reads assigned specifically to this taxon.                               |
| 4th (rank)        | Taxonomic rank (e.g., superkingdom, kingdom, phylum, class, order, family, genus). |
| 5th (taxon_id)    | NCBI Taxon ID for the taxon.                                                       |
| 6th (name)        | Scientific name of the taxon.                                                      |

### Important Notes
1. No Headers: The rawData string must not include a header row.
2. First Two Rows:
    - The first row must represent the unclassified node (Taxon ID 0).
    - The second row must represent the root node (Taxon ID 1).
3. The file content must be tab-delimited (\t).


## Props for `<SankeyDiagram>`
| Prop Name         | Type    | Required | Default    | Description                                                             |
|-------------------|---------|----------|------------|-------------------------------------------------------------------------|
| rawData           | String  | Yes      | N/A        | The raw Kraken report content as a string (no pre-processing required). |
| taxaLimit         | Number  | Yes      | 10         | Maximum number of taxa to display per rank in the Sankey diagram.                |
| minCladeReadsMode | String  | Yes      | #          | Filtering mode: "#" for raw counts, "%" for proportions.                |
| minReads          | Number  | Yes      | 1          | Minimum threshold for clade reads (based on minCladeReadsMode).         |
| figureHeight      | Number  | Yes      | 600        | Height of the Sankey diagram in pixels.                                 |
| labelOption       | String  | Yes      | proportion | Labeling option: "proportion" or "clade_reads".                         |
| showAll           | Boolean | Yes      | false      | Whether to show all taxa or apply filtering based on taxaLimit.         |

---
## Example Project
Here’s how to set up an example project to test the plugin:
1. File Structure
```
example/
├── App.vue
├── main.js
├── components/
│   └── SankeyDiagram.vue
├── package.json
```

2. App.vue
```
<template>
  <div id="app">
    <h1>TaxoSankey Example</h1>
    <SankeyDiagram
      :rawData="fileContent2"
      :taxaLimit="15"
      :minCladeReadsMode="'#'"
      :minReads="2"
      :figureHeight="1000"
      :labelOption="'proportion'"
      :showAll="false"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      fileContent2: `
        taxon_id	name	rank	clade_reads	taxon_reads	proportion
        1	Root	no rank	10000	8000	100
        2	CladeA	genus	5000	4000	50
        3	CladeB	genus	5000	4000	50
      `,
    };
  },
};
</script>
```

## Development and Testing
To set up the plugin locally for development and testing:

1. Clone the repository and navigate to the project directory.
2. Install dependencies:

```
npm install
```

3. Run the example project:
```
npm run dev
```

## Contributing
Contributions are welcome! If you encounter issues or have feature requests, please open an issue or submit a pull request.


