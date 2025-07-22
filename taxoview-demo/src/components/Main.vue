<template>
  <div style="margin: 2rem;">
    <h1>Sankey Plugin Demo</h1>

    <v-card variant="outlined">
      <v-tabs
        v-model="mode"
        align-tabs="start"
        color="deep-purple-accent-4"
      >
        <v-tab :value="1">Sample Data</v-tab>
        <v-tab :value="2">File Input</v-tab>
        <v-tab :value="3">Uniprot ID</v-tab>
      </v-tabs>

      <v-tabs-window v-model="mode">
        <!-- Sample -->
        <v-tabs-window-item :value="1">
          <v-card-text>
            <select class="setting-input" id="input-data" v-model="inputData" @change="setSampleData">
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <label for="input-data">{{ `Input data` }}</label>
          </v-card-text>
        </v-tabs-window-item>

        <!-- File Input -->
        <v-tabs-window-item :value="2">
          <v-card-text>
            <v-file-input label="Input Kraken report" accept=".tsv" density="compact" show-size prepend-icon="mdi-upload" v-model="file" @change="readFile(file)">
            </v-file-input>
          </v-card-text>
        </v-tabs-window-item>

        <!-- Uniprot ID -->
        <v-tabs-window-item :value="3">
          <v-card-text>
            <v-text-field label="Uniprot ID" v-model="uniprotId"></v-text-field>
          </v-card-text>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>

    <div class="settings-panel">
      <div class="setting-panel">
        <input class="setting-input" id="node-padding" type="range" v-model.number="nodePadding" value="13" min="1"
          max="20" />
        <label for="node-padding">{{ `Node padding: ${nodePadding}` }}</label>
      </div>
      <div class="setting-panel">
        <input class="setting-input" id="figure-height" type="range" v-model.number="figureHeight" value="700" min="100"
          max="1500" />
        <label for="figure-height">{{ `Figure height: ${figureHeight}` }}</label>
      </div>
      <div class="setting-panel">
        <input class="setting-input" id="figure-width" type="range" v-model.number="figureWidth" value="700" min="100"
          max="1500" />
        <label for="figure-width">{{ `Figure width: ${figureWidth}` }}</label>
      </div>
      <div class="setting-panel">
        <input class="setting-input" id="taxa-limit" type="range" v-model.number="taxaLimit" value="10" min="1"
          max="100" />
        <label for="figure-width">{{ `Taxa limit: ${taxaLimit}` }}</label>
      </div>
      <div class="setting-panel">
        <input class="setting-input" id="show-all" type="checkbox" v-model.number="showAll" />
        <label for="show-all">{{ `Show full graph` }}</label>
      </div>
      <div>
        <label>Ranks to show: </label>
        <label v-for="rank in rankOptions" :key="rank">
          <input type="checkbox" :value="rank" v-model="ranksToShow" />{{ rank }}
        </label>
      </div>
      <div class="settings-panel">
        <input
        type="text"
        v-model="searchQuery"
        placeholder="🔍 Search name or tax ID…"
        style="width: 200px;"
      />
      </div>
    </div>

    <!-- Create TaxoView Component -->
    <TaxoView :rawData="rawReport" :taxaLimit="taxaLimit" :showAll="showAll" :fontFill="fontFill" :minThresholdMode=0
      :minThreshold=1 :figureHeight="figureHeight" :figureWidth="figureWidth" :labelOption=1 :nodePadding="nodePadding"
      :colorScheme="[
        '#8CB5B5' , // light teal
        '#785EF0', // purple
        '#E59579', // salmon
        '#506432', // dark green
        '#BC7576', // dark salmon
        '#6C3400', // light brown
        '#C14C32', // dark red
        '#648FFF', // blue
        '#FFCD73', // yellow
        '#41222A' , // dark brown
      ]" 
      :ranksToShow="ranksToShow"
      :searchQuery="searchQuery" 
      />

  </div>
</template>

<script>

export default {
  name: 'Main',
  computed: {
  },

  created () {
    // load default sample so TaxoView has valid data on first render
    this.rawReport = this.samples[this.inputData]
  },

  mounted() {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    query.addEventListener('change', e => {
      this.fontFill = e.matches ? 'white' : 'black';
      this.linkPathOpacity = e.matches ? 0.6 : 0.3;
    })
  },
  data() {
    return {
      // Tab (mode of data input)
      mode: 1, // 1 = sample data, 2 = file input, 3 = uniprot ids
      inputData: 1, // selected sample # in sample data tab (1)
      file: null, // File object from file input tab (2)
      
      // Sample Data Content
      samples: {
        1: `#clade_proportion	clade_count	taxon_count	rank	taxID	name
  5.9001	32656	32656	no rank	0	unclassified
  94.0999	520822	4	no rank	1	root
  90.8851	503029	0	superkingdom	10239	  Viruses
  90.8511	502841	0	clade	2559587	    Riboviria
  90.8511	502841	0	kingdom	2732396	      Orthornavirae
  90.8110	502619	0	phylum	2732408	        Pisuviricota
  90.8110	502619	0	class	2732506	          Pisoniviricetes
  90.8108	502618	0	order	76804	            Nidovirales
  90.8108	502618	0	suborder	2499399	              Cornidovirineae
  90.8108	502618	1	family	11118	                Coronaviridae
  90.8101	502614	4	subfamily	2501931	                  Orthocoronavirinae
  90.8063	502593	2	genus	694002	                    Betacoronavirus
  90.8034	502577	897	subgenus	2509511	                      Sarbecovirus
  90.6358	501649	2102	species	694009	                        Severe acute respiratory syndrome-related coronavirus
  90.2115	499301	499301	no rank	2697049	                          Severe acute respiratory syndrome coronavirus 2
  0.0444	246	0	no rank	2901879	                          Severe acute respiratory syndrome coronavirus
  0.0444	246	246	no rank	227984	                            SARS coronavirus Tor2
  0.0056	31	0	no rank	2720068	                        unclassified Sarbecovirus
  0.0056	31	31	species	864596	                          Bat coronavirus BM48-31/BGR/2008
  0.0009	5	0	subgenus	2509486	                      Hibecovirus
  0.0009	5	0	species	2501961	                        Bat Hp-betacoronavirus Zhejiang2013
  0.0009	5	5	no rank	1541205	                          Bat Hp-betacoronavirus/Zhejiang2013
  0.0007	4	2	subgenus	2509481	                      Embecovirus
  0.0002	1	0	species	694003	                        Betacoronavirus 1
  0.0002	1	1	no rank	31631	                          Human coronavirus OC43
  0.0002	1	0	species	694005	                        Murine coronavirus
  0.0002	1	0	no rank	31632	                          Rat coronavirus
  0.0002	1	1	no rank	502102	                            Rat coronavirus Parker
  0.0005	3	0	subgenus	2509494	                      Merbecovirus
  0.0002	1	1	species	694007	                        Tylonycteris bat coronavirus HKU4
  0.0002	1	1	species	694008	                        Pipistrellus bat coronavirus HKU5
  0.0002	1	1	species	1335626	                        Middle East respiratory syndrome-related coronavirus
  0.0004	2	0	subgenus	2509502	                      Nobecovirus
  0.0004	2	0	species	2501962	                        Rousettus bat coronavirus GCCDC1
  0.0004	2	2	no rank	1892416	                          Rousettus bat coronavirus
  0.0018	10	2	genus	693996	                    Alphacoronavirus
  0.0004	2	0	no rank	366617	                      unclassified Alphacoronavirus
  0.0004	2	2	species	1906673	                        Alphacoronavirus sp.
  0.0004	2	0	subgenus	2509492	                      Luchacovirus
  0.0004	2	0	no rank	2724758	                        unclassified Luchacovirus
  0.0004	2	2	species	1964806	                          Coronavirus AcCoV-JC34
  0.0002	1	0	subgenus	2509477	                      Colacovirus
  0.0002	1	0	species	1913643	                        Bat coronavirus CDPHE15
  0.0002	1	1	no rank	1384461	                          Bat coronavirus CDPHE15/USA/2006
  0.0002	1	0	subgenus	2509480	                      Duvinacovirus
  0.0002	1	0	species	11137	                        Human coronavirus 229E
  0.0002	1	1	no rank	1699095	                          Camel alphacoronavirus
  0.0002	1	0	subgenus	2509496	                      Minacovirus
  0.0002	1	1	species	1264898	                        Ferret coronavirus
  0.0002	1	0	subgenus	2509505	                      Pedacovirus
  0.0002	1	1	species	28295	                        Porcine epidemic diarrhea virus
  0.0011	6	0	genus	1159901	                    Deltacoronavirus
  0.0007	4	0	subgenus	2509474	                      Buldecovirus
  0.0005	3	3	species	1159902	                        Common moorhen coronavirus HKU21
  0.0002	1	1	species	1159907	                        White-eye coronavirus HKU16
  0.0004	2	0	subgenus	2509469	                      Andecovirus
  0.0004	2	2	species	1159908	                        Wigeon coronavirus HKU20
  0.0002	1	0	genus	694013	                    Gammacoronavirus
  0.0002	1	0	no rank	1433214	                      unclassified Gammacoronavirus
  0.0002	1	1	species	2569586	                        Canada goose coronavirus
  0.0005	3	0	subfamily	693995	                  Coronavirinae
  0.0005	3	0	no rank	2664420	                    unclassified Coronavirinae
  0.0005	3	3	species	1508220	                      Bat coronavirus
  0.0002	1	0	order	464095	            Picornavirales
  0.0002	1	0	family	232795	              Dicistroviridae
  0.0002	1	0	genus	144051	                Cripavirus
  0.0002	1	0	species	3048297	                  Cripavirus ropadi
  0.0002	1	1	no rank	66834	                    Rhopalosiphum padi virus
  0.0401	222	0	phylum	2732407	        Lenarviricota
  0.0401	222	0	class	2842243	          Leviviricetes
  0.0401	222	0	order	2842249	            Timlovirales
  0.0401	222	0	family	2842332	              Steitzviridae
  0.0202	112	0	genus	2842702	                Gihfavirus
  0.0202	112	0	species	2844652	                  Gihfavirus pelohabitans
  0.0202	112	112	no rank	2786405	                    ssRNA phage SRR5466369_2
  0.0199	110	0	genus	2842802	                Kinglevirus
  0.0199	110	0	species	2845070	                  Kinglevirus lutadaptatum
  0.0199	110	110	no rank	2786389	                    ssRNA phage SRR5466337_3
  0.0193	107	0	clade	2731342	    Monodnaviria
  0.0193	107	0	kingdom	2732092	      Shotokuvirae
  0.0193	107	0	phylum	2732415	        Cossaviricota
  0.0193	107	0	class	2732422	          Quintoviricetes
  0.0193	107	0	order	2732534	            Piccovirales
  0.0193	107	0	family	10780	              Parvoviridae
  0.0193	107	0	subfamily	2732887	                Hamaparvovirinae
  0.0193	107	0	genus	2733231	                  Chaphamaparvovirus
  0.0193	107	0	species	3052108	                    Chaphamaparvovirus galliform3
  0.0193	107	107	no rank	2849623	                      chicken chapparvovirus HK
  0.0145	80	0	clade	2731341	    Duplodnaviria
  0.0145	80	0	kingdom	2731360	      Heunggongvirae
  0.0145	80	0	phylum	2731618	        Uroviricota
  0.0145	80	1	class	2731619	          Caudoviricetes
  0.0060	33	0	genus	2560142	            Gorganvirus
  0.0060	33	0	species	2560650	              Gorganvirus isfahan
  0.0060	33	33	no rank	1969841	                Proteus phage VB_PmiS-Isfahan
  0.0016	9	0	genus	186789	            Punavirus
  0.0014	8	0	species	2560452	              Punavirus RCS47
  0.0014	8	8	no rank	1590550	                Escherichia phage RCS47
  0.0002	1	0	species	2560732	              Punavirus SJ46
  0.0002	1	1	no rank	1815968	                Salmonella phage SJ46
  0.0013	7	0	family	2731643	            Autographiviridae
  0.0013	7	1	subfamily	2731652	              Slopekvirinae
  0.0009	5	0	genus	2732938	                Koutsourovirus
  0.0009	5	0	species	2733608	                  Koutsourovirus KDA1
  0.0009	5	5	no rank	1147139	                    Enterobacter phage phiKDA1
  0.0002	1	1	genus	1920774	                Drulisvirus
  0.0007	4	0	genus	2843425	            Muldoonvirus
  0.0007	4	0	species	2846182	              Muldoonvirus muldoon
  0.0007	4	4	no rank	2601678	                Serratia phage Muldoon
  0.0005	3	0	genus	1982104	            Decurrovirus
  0.0005	3	0	species	1982105	              Decurrovirus decurro
  0.0005	3	3	no rank	1698361	                Arthrobacter phage Decurro
  0.0005	3	0	no rank	2788787	            unclassified Caudoviricetes
  0.0002	1	1	species	1150991	              Sphingomonas phage PAU
  0.0002	1	1	species	1327993	              Cellulophaga phage phi39:1
  0.0002	1	1	species	2851069	              Curtobacterium phage Reje
  0.0004	2	0	genus	2843376	            Donellivirus
  0.0004	2	0	species	1084719	              Donellivirus gee
  0.0004	2	2	no rank	2884420	                Bacillus phage G
  0.0004	2	0	family	2946167	            Peduoviridae
  0.0002	1	0	genus	2732990	              Seongnamvirus
  0.0002	1	0	species	2734073	                Seongnamvirus ESSI2
  0.0002	1	1	no rank	947842	                  Cronobacter phage ESSI-2
  0.0002	1	0	genus	2948723	              Gegevirus
  0.0002	1	0	species	2955944	                Gegevirus ST437OXA245phi41
  0.0002	1	1	no rank	2510486	                  Klebsiella phage ST437-OXA245phi4.1
  0.0004	2	0	genus	3044690	            Cobrasixvirus
  0.0004	2	0	species	3059893	              Cobrasixvirus cobrasix
  0.0004	2	2	no rank	2894794	                Enterobacter phage vB_EclS_CobraSix
  0.0002	1	1	genus	1623292	            Omegavirus
  0.0002	1	0	genus	1921525	            Kleczkowskavirus
  0.0002	1	1	species	1921526	              Kleczkowskavirus RHEph4
  0.0002	1	0	genus	1982367	            Pepyhexavirus
  0.0002	1	0	species	1982369	              Pepyhexavirus poco6
  0.0002	1	1	no rank	691964	                Rhodococcus phage ReqiPoco6
  0.0002	1	0	family	2560065	            Herelleviridae
  0.0002	1	0	subfamily	857473	              Spounavirinae
  0.0002	1	0	genus	1918721	                Siminovitchvirus
  0.0002	1	0	species	1918722	                  Siminovitchvirus CP51
  0.0002	1	1	no rank	1391188	                    Bacillus phage CP-51
  0.0002	1	0	genus	2560237	            Thornevirus
  0.0002	1	0	species	2560336	              Thornevirus SP15
  0.0002	1	1	no rank	1792032	                Bacillus phage SP-15
  0.0002	1	0	family	2731690	            Demerecviridae
  0.0002	1	0	subfamily	2732012	              Ermolyevavirinae
  0.0002	1	0	genus	2948922	                Thalassavirus
  0.0002	1	0	species	2956515	                  Thalassavirus river4
  0.0002	1	1	no rank	2736288	                    Vibrio phage River4
  0.0002	1	0	genus	2733127	            Rosemountvirus
  0.0002	1	0	species	2846142	              Rosemountvirus yarpen
  0.0002	1	1	no rank	2713327	                Salmonella phage yarpen
  0.0002	1	0	subfamily	2842523	            Bronfenbrennervirinae
  0.0002	1	1	genus	2842946	              Peeveelvirus
  0.0002	1	0	genus	2843375	            Dinavirus
  0.0002	1	0	species	2846739	              Dinavirus dina
  0.0002	1	1	no rank	2759732	                Ralstonia phage Dina
  0.0002	1	0	family	2943001	            Casjensviridae
  0.0002	1	0	genus	2943003	              Cenphatecvirus
  0.0002	1	0	species	2955599	                Cenphatecvirus saba
  0.0002	1	1	no rank	2596672	                  Proteus phage Saba
  0.0002	1	0	family	2946160	            Kyanoviridae
  0.0002	1	0	genus	2948904	              Shandvirus
  0.0002	1	0	species	2956438	                Shandvirus sb64
  0.0002	1	1	no rank	2163901	                  Synechococcus phage S-B64
  0.0002	1	0	genus	2948642	            Buchananvirus
  0.0002	1	0	species	2955547	              Buchananvirus Sa179lw
  0.0002	1	1	no rank	2126819	                Escherichia phage vB_EcoS Sa179lw
  0.0002	1	0	genus	2948764	            Immutovirus
  0.0002	1	0	species	2955989	              Immutovirus immuto
  0.0002	1	1	no rank	2801477	                Flavobacterium phage vB_FspM_immuto_2-6A
  0.0002	1	1	family	3044479	            Stanwilliamsviridae
  0.0002	1	0	clade	2732004	    Varidnaviria
  0.0002	1	0	kingdom	2732005	      Bamfordvirae
  0.0002	1	0	phylum	2732007	        Nucleocytoviricota
  0.0002	1	0	class	2732523	          Megaviricetes
  0.0002	1	0	order	2732524	            Algavirales
  0.0002	1	0	family	10501	              Phycodnaviridae
  0.0002	1	0	genus	181086	                Prymnesiovirus
  0.0002	1	0	no rank	358403	                  unclassified Prymnesiovirus
  0.0002	1	1	species	251749	                    Phaeocystis globosa virus
  3.2140	17789	0	no rank	131567	  cellular organisms
  3.2140	17789	0	superkingdom	2759	    Eukaryota
  3.2140	17789	0	clade	33154	      Opisthokonta
  3.2140	17789	0	kingdom	33208	        Metazoa
  3.2140	17789	0	clade	6072	          Eumetazoa
  3.2140	17789	0	clade	33213	            Bilateria
  3.2140	17789	0	clade	33511	              Deuterostomia
  3.2140	17789	0	phylum	7711	                Chordata
  3.2140	17789	0	subphylum	89593	                  Craniata
  3.2140	17789	0	clade	7742	                    Vertebrata
  3.2140	17789	0	clade	7776	                      Gnathostomata
  3.2140	17789	0	clade	117570	                        Teleostomi
  3.2140	17789	0	clade	117571	                          Euteleostomi
  3.2140	17789	0	superclass	8287	                            Sarcopterygii
  3.2140	17789	0	clade	1338369	                              Dipnotetrapodomorpha
  3.2140	17789	0	clade	32523	                                Tetrapoda
  3.2140	17789	0	clade	32524	                                  Amniota
  3.2140	17789	0	class	40674	                                    Mammalia
  3.2140	17789	0	clade	32525	                                      Theria
  3.2140	17789	0	clade	9347	                                        Eutheria
  3.2140	17789	0	clade	1437010	                                          Boreoeutheria
  3.2140	17789	0	superorder	314146	                                            Euarchontoglires
  3.2140	17789	0	order	9443	                                              Primates
  3.2140	17789	0	suborder	376913	                                                Haplorrhini
  3.2140	17789	0	infraorder	314293	                                                  Simiiformes
  3.2140	17789	0	parvorder	9526	                                                    Catarrhini
  3.2140	17789	0	superfamily	314295	                                                      Hominoidea
  3.2140	17789	0	family	9604	                                                        Hominidae
  3.2140	17789	0	subfamily	207598	                                                          Homininae
  3.2140	17789	0	genus	9605	                                                            Homo
  3.2140	17789	17789	species	9606	                                                              Homo sapiens
  `,
        2: `0.0038	563	563	no rank	0	unclassified
  99.9962	14636437	0	no rank	1	root
  98.0635	14353554	7805	superkingdom	8034	  d__Bacteria
  47.5493	6959786	1361	phylum	8035	    p__Proteobacteria
  38.8869	5691882	12523	class	8036	      c__Gammaproteobacteria
  16.1816	2368503	3879	order	8037	        o__Enterobacterales
  10.1294	1482636	30531	family	8038	          f__Enterobacteriaceae
  1.0468	153214	5406	genus	107742	            g__Enterobacter
  0.0825	12074	1875	species	180915	              s__Enterobacter cancerogenus
  0.0349	5102	5102	subspecies	180925	                RS_GCF_002850575.1
  0.0348	5097	5097	subspecies	180918	                RS_GCF_009648915.1
  0.0819	11993	10469	species	153922	              s__Enterobacter ludwigii
  0.0100	1457	1457	subspecies	153928	                RS_GCF_003010695.1
  0.0001	11	11	subspecies	153992	                RS_GCF_001750725.1
  0.0001	9	9	subspecies	153932	                RS_GCF_000512375.1
  0.0001	8	8	subspecies	153930	                RS_GCF_011463635.1
  0.0001	8	8	subspecies	153936	                RS_GCF_005518115.1
  0.0000	6	6	subspecies	153953	                RS_GCF_000239975.1
  0.0000	6	6	subspecies	153991	                RS_GCF_002025685.1
  0.0000	4	4	subspecies	153985	                RS_GCF_013615235.1
  0.0000	4	4	subspecies	153995	                RS_GCF_013375975.1
  0.0000	3	3	subspecies	153935	                RS_GCF_003071645.1
  0.0000	3	3	subspecies	153964	                RS_GCF_001029645.1
  0.0000	2	2	subspecies	153969	                RS_GCF_005848825.1
  0.0000	1	1	subspecies	153926	                RS_GCF_005890075.1
  0.0000	1	1	subspecies	153979	                RS_GCF_013784105.1
  0.0000	1	1	subspecies	153982	                RS_GCF_006385915.1
  0.0815	11928	1635	species	229737	              s__Enterobacter cloacae_O
  0.0354	5187	5187	subspecies	229740	                RS_GCF_013376835.1
  0.0349	5106	5106	subspecies	229738	                RS_GCF_013375935.1
  0.0814	11912	4184	species	155221	              s__Enterobacter bugandensis
  0.0267	3913	3913	subspecies	155235	                RS_GCF_900324475.1
  0.0258	3778	3778	subspecies	155245	                RS_GCF_004804375.1
  0.0002	27	27	subspecies	155274	                RS_GCF_001562175.1
  0.0001	10	10	subspecies	155264	                RS_GCF_004804395.1
  0.0806	11794	921	species	180563	              s__Enterobacter sichuanensis
  0.0380	5566	5566	subspecies	180568	                RS_GCF_009036245.1
  0.0363	5307	5307	subspecies	180569	                RS_GCF_002197345.1
  0.0805	11784	1933	species	185854	              s__Enterobacter sp000568095
  0.0337	4936	4936	subspecies	185860	                GB_GCA_011765665.1
  0.0336	4915	4915	subspecies	185855	                RS_GCF_009755685.1
  0.0788	11529	10990	species	146531	              s__Enterobacter cloacae
  0.0027	388	388	subspecies	146533	                RS_GCF_000770155.1
  0.0002	36	36	subspecies	146572	                RS_GCF_000235765.1
  0.0002	35	35	subspecies	146540	                RS_GCF_013376815.1
  0.0002	29	29	subspecies	146571	                RS_GCF_000025565.1
  0.0002	26	26	subspecies	146633	                GB_GCA_006228165.1
  0.0000	7	7	subspecies	146595	                RS_GCF_002982195.1
  0.0000	7	7	subspecies	146616	                RS_GCF_009707405.1
  0.0000	6	6	subspecies	146597	                GB_GCA_001708345.1
  0.0000	5	5	subspecies	146589	                RS_GCF_002303275.1
  0.0780	11418	9021	species	143535	              s__Enterobacter roggenkampii
  0.0124	1814	1814	subspecies	143540	                RS_GCF_013403545.1
  0.0028	414	414	subspecies	143556	                RS_GCF_013728935.1
  0.0003	48	48	subspecies	143590	                RS_GCF_002952735.2
  0.0001	15	15	subspecies	143630	                RS_GCF_001729805.1
  0.0001	15	15	subspecies	143678	                RS_GCF_000807415.2
  0.0001	15	15	subspecies	143634	                RS_GCF_004135955.1
  0.0001	11	11	subspecies	143605	                GB_GCA_003573505.1
  0.0001	11	11	subspecies	143642	                RS_GCF_004684365.1
  0.0001	8	8	subspecies	143562	                RS_GCF_013725995.1
  0.0000	7	7	subspecies	143608	                RS_GCF_013733395.1
  0.0000	6	6	subspecies	143655	                GB_GCA_013750175.1
  0.0000	6	6	subspecies	143657	                RS_GCF_014490825.1
  0.0000	5	5	subspecies	143636	                RS_GCF_013635755.1
  0.0000	4	4	subspecies	143625	                RS_GCF_013742615.1
  0.0000	4	4	subspecies	143569	                RS_GCF_013389415.1
  0.0000	4	4	subspecies	143659	                RS_GCF_004138605.1
  0.0000	4	4	subspecies	143676	                RS_GCF_009184765.2
  0.0000	2	2	subspecies	143624	                RS_GCF_003812145.1
  0.0000	1	1	subspecies	143600	                GB_GCA_013736615.1
  0.0000	1	1	subspecies	143631	                RS_GCF_002211685.1
  0.0000	1	1	subspecies	143557	                RS_GCF_014524505.1
  0.0000	1	1	subspecies	143682	                RS_GCF_014490845.1
  0.0779	11403	6217	species	193979	              s__Enterobacter cloacae_K
  0.0184	2689	2689	subspecies	193980	                RS_GCF_007035975.1
  0.0169	2473	2473	subspecies	193986	                RS_GCF_004355165.1
  0.0002	24	24	subspecies	193987	                RS_GCF_004006055.1
  0.0741	10839	8292	species	147103	              s__Enterobacter kobei
  0.0144	2107	2107	subspecies	147117	                RS_GCF_008365235.1
  0.0027	392	392	subspecies	147115	                RS_GCF_003665375.1
  0.0001	14	14	subspecies	147129	                RS_GCF_001729765.1
  0.0001	10	10	subspecies	147206	                RS_GCF_001623605.1
  0.0001	9	9	subspecies	147191	                RS_GCF_014041955.1
  0.0000	5	5	subspecies	147194	                RS_GCF_000286275.1
  0.0000	3	3	subspecies	147119	                GB_GCA_010692925.1
  0.0000	2	2	subspecies	147175	                RS_GCF_008931545.1
  0.0000	2	2	subspecies	147188	                RS_GCF_011604705.1
  0.0000	2	2	subspecies	147209	                RS_GCF_014169295.1
  0.0000	1	1	subspecies	147172	                GB_GCA_000784865.1
  0.0711	10413	7464	species	160888	              s__Enterobacter asburiae_B
  0.0174	2548	2548	subspecies	160893	                RS_GCF_004151605.1
  0.0019	277	277	subspecies	160896	                RS_GCF_002863825.1
  0.0002	32	32	subspecies	160906	                RS_GCF_007035645.1
  0.0002	27	27	subspecies	160904	                RS_GCF_000801755.2
  0.0002	25	25	subspecies	160899	                RS_GCF_014169635.1
  0.0002	22	22	subspecies	160900	                RS_GCF_001719105.1
  0.0001	16	16	subspecies	160932	                RS_GCF_011396735.1
  0.0000	2	2	subspecies	160909	                RS_GCF_007035805.1
  0.0706	10330	5799	species	153325	              s__Enterobacter cloacae_M
  0.0162	2368	2368	subspecies	153332	                GB_GCA_001617645.1
  0.0140	2044	2044	subspecies	153326	                RS_GCF_001022095.1
  0.0003	49	49	subspecies	153335	                RS_GCF_013784425.1
  0.0002	27	27	subspecies	153365	                RS_GCF_000783675.2
  0.0001	21	21	subspecies	153395	                RS_GCF_002208095.1
  0.0001	13	13	subspecies	153351	                RS_GCF_003940765.1
  0.0001	8	8	subspecies	153391	                GB_GCA_001620245.1
  0.0000	1	1	subspecies	153378	                RS_GCF_013740195.1
  0.0702	10280	9073	species	180368	              s__Enterobacter asburiae
  0.0062	902	902	subspecies	180376	                RS_GCF_001521715.1
  0.0017	243	243	subspecies	180372	                RS_GCF_013782005.1
  0.0004	60	60	subspecies	180378	                RS_GCF_000632395.1
  0.0000	2	2	subspecies	180382	                GB_GCA_013705185.1
  0.0007	101	40	species	107743	              s__Enterobacter hormaechei_A
  0.0000	6	6	subspecies	108580	                RS_GCF_003719615.1
  0.0000	3	3	subspecies	108946	                RS_GCF_013635495.1
  0.0000	3	3	subspecies	108018	                RS_GCF_001729705.1
  0.0000	3	3	subspecies	108132	                RS_GCF_011044215.1
  0.0000	2	2	subspecies	107803	                RS_GCF_008505035.1
  0.0000	2	2	subspecies	109189	                RS_GCF_003031755.1
  0.0000	2	2	subspecies	109068	                RS_GCF_013873515.1
  0.0000	2	2	subspecies	108941	                GB_GCA_000210775.1
  0.0000	2	2	subspecies	108925	                RS_GCF_003408575.1
  0.0000	2	2	subspecies	108501	                RS_GCF_001729745.1
  0.0000	2	2	subspecies	108208	                RS_GCF_003264955.1
  0.0000	2	2	subspecies	108087	                RS_GCF_013738375.1
  0.0000	1	1	subspecies	109226	                RS_GCF_002237465.1
  0.0000	1	1	subspecies	108121	                RS_GCF_002968455.1
  0.0000	1	1	subspecies	107753	                RS_GCF_902166405.1
  0.0000	1	1	subspecies	109173	                RS_GCF_012974405.1
  0.0000	1	1	subspecies	109139	                RS_GCF_013734275.1
  0.0000	1	1	subspecies	109119	                RS_GCF_014333255.1
  0.0000	1	1	subspecies	109075	                RS_GCF_003660125.1
  0.0000	1	1	subspecies	109070	                RS_GCF_900322715.1
  0.0000	1	1	subspecies	107839	                RS_GCF_900497145.1
  0.0000	1	1	subspecies	107847	                RS_GCF_013744415.1
  0.0000	1	1	subspecies	107884	                RS_GCF_902166375.1
  0.0000	1	1	subspecies	107960	                RS_GCF_009834325.1
  0.0000	1	1	subspecies	108924	                RS_GCF_008931785.1
  0.0000	1	1	subspecies	108697	                RS_GCF_003288475.1
  0.0000	1	1	subspecies	108669	                RS_GCF_902166455.1
  0.0000	1	1	subspecies	108644	                GB_GCA_013747975.1
  0.0000	1	1	subspecies	108630	                RS_GCF_007556795.1
  0.0000	1	1	subspecies	108598	                RS_GCF_003408595.1
  0.0000	1	1	subspecies	108050	                RS_GCF_013375955.1
  0.0000	1	1	subspecies	108574	                RS_GCF_001729725.1
  0.0000	1	1	subspecies	108511	                RS_GCF_013739595.1
  0.0000	1	1	subspecies	108054	                RS_GCF_008931645.1
  0.0000	1	1	subspecies	108498	                RS_GCF_013629455.1
  0.0000	1	1	subspecies	108367	                RS_GCF_001729785.1
  0.0000	1	1	subspecies	108357	                RS_GCF_902166485.1
  0.0000	1	1	subspecies	108340	                RS_GCF_009738085.1
  0.0000	1	1	subspecies	108337	                RS_GCF_014109705.1
  0.0000	1	1	subspecies	108296	                RS_GCF_900635705.1
  0.0000	1	1	subspecies	108074	                RS_GCF_009905155.1
  0.0000	1	1	subspecies	108155	                GB_GCA_002142555.1
  0.0000	4	0	species	184496	              s__Enterobacter cloacae_I
  0.0000	4	4	subspecies	184507	                RS_GCF_004193715.1
  0.0000	2	0	species	180994	              s__Enterobacter hormaechei
  0.0000	2	2	subspecies	181007	                RS_GCF_000814205.1
  0.0000	2	0	species	184522	              s__Enterobacter mori
  0.0000	2	2	subspecies	184532	                RS_GCF_014169815.1
  0.0000	1	0	species	191394	              s__Enterobacter quasihormaechei
  0.0000	1	1	subspecies	191401	                RS_GCF_900322725.1
  0.0000	1	0	species	240914	              s__Enterobacter cloacae_P
  0.0000	1	1	subspecies	240915	                RS_GCF_014169315.1
  0.9156	134021	6125	genus	128394	            g__Serratia
  0.0837	12252	1016	species	191750	              s__Serratia symbiotica
  0.0387	5668	5668	subspecies	191757	                RS_GCF_000821185.2
  0.0380	5568	5568	subspecies	191756	                RS_GCF_008370165.1
  0.0834	12205	6896	species	205698	              s__Serratia ficaria
  0.0189	2769	2769	subspecies	205699	                RS_GCF_003641105.1
  0.0174	2540	2540	subspecies	205701	                RS_GCF_900187015.1
  0.0834	12202	4116	species	194704	              s__Serratia quinivorans
  0.0281	4117	4117	subspecies	194706	                RS_GCF_900638135.1
  0.0269	3933	3933	subspecies	194705	                RS_GCF_004684265.1
  0.0002	24	24	subspecies	194708	                RS_GCF_009660185.1
  0.0001	12	12	subspecies	194707	                RS_GCF_000018085.1
  0.0827	12104	6429	species	174958	              s__Serratia liquefaciens
  0.0196	2862	2862	subspecies	174962	                RS_GCF_014495865.1
  0.0190	2775	2775	subspecies	174964	                RS_GCF_000975245.1
  0.0001	10	10	subspecies	174969	                RS_GCF_001559135.2
  0.0001	9	9	subspecies	174970	                RS_GCF_003691565.1
  0.0001	9	9	subspecies	174978	                RS_GCF_000422085.1
  0.0000	6	6	subspecies	174972	                RS_GCF_008364325.2
  0.0000	4	4	subspecies	174973	                RS_GCF_006970665.1
  0.0825	12072	11237	species	173753	              s__Serratia plymuthica
  0.0048	709	709	subspecies	173754	                RS_GCF_001663135.1
  0.0004	57	57	subspecies	173769	                RS_GCF_900478125.1
  0.0002	31	31	subspecies	173764	                RS_GCF_013122215.1
  0.0001	16	16	subspecies	173763	                RS_GCF_000176835.2
  0.0001	11	11	subspecies	173770	                GB_GCA_000648575.1
  0.0000	4	4	subspecies	173757	                RS_GCF_001663115.1
  0.0000	3	3	subspecies	173759	                RS_GCF_000438825.1
  0.0000	3	3	subspecies	173765	                RS_GCF_000478545.1
  0.0000	1	1	subspecies	173755	                RS_GCF_000214195.1
  0.0817	11956	7519	species	214704	              s__Serratia plymuthica_A
  0.0147	2148	2148	subspecies	214705	                RS_GCF_900635625.1
  0.0145	2126	2126	subspecies	214707	                RS_GCF_900637965.1
  0.0011	163	163	subspecies	214708	                RS_GCF_000261045.2
  0.0772	11300	4180	species	151728	              s__Serratia nematodiphila
  0.0285	4177	4177	subspecies	151730	                RS_GCF_013122155.1
  0.0194	2834	2834	subspecies	151729	                RS_GCF_000695995.1
  0.0003	51	51	subspecies	151770	                RS_GCF_013112395.1
  0.0001	14	14	subspecies	151745	                GB_GCA_001672055.1
  0.0001	11	11	subspecies	151741	                RS_GCF_012273115.1
  0.0000	7	7	subspecies	151757	                RS_GCF_002205475.1
  0.0000	6	6	subspecies	151788	                RS_GCF_001417865.2
  0.0000	5	5	subspecies	151794	                RS_GCF_000336425.1
  0.0000	4	4	subspecies	151751	                RS_GCF_011602465.1
  0.0000	4	4	subspecies	151760	                RS_GCF_013377375.1
  0.0000	4	4	subspecies	151801	                RS_GCF_004768745.1
  0.0000	2	2	subspecies	151779	                RS_GCF_003516185.1
  0.0000	1	1	subspecies	151752	                RS_GCF_003516165.1
  0.0769	11258	8455	species	164788	              s__Serratia marcescens_B
  0.0098	1438	1438	subspecies	164790	                GB_GCA_009905295.1
  0.0089	1298	1298	subspecies	164791	                RS_GCF_002220615.1
  0.0001	18	18	subspecies	164821	                GB_GCA_006711145.1
  0.0001	14	14	subspecies	164801	                RS_GCF_000513215.1
  0.0001	13	13	subspecies	164814	                GB_GCA_003032415.1
  0.0001	13	13	subspecies	164815	                GB_GCA_013256815.1
  0.0001	9	9	subspecies	164805	                RS_GCF_011769885.1
  0.0741	10851	8357	species	155964	              s__Serratia ureilytica
  0.0079	1163	1163	subspecies	155966	                RS_GCF_002220515.1
  0.0077	1131	1131	subspecies	155972	                RS_GCF_009909345.1
  0.0004	57	57	subspecies	156014	                RS_GCF_014333375.1
  0.0002	31	31	subspecies	155984	                RS_GCF_000747565.1
  0.0001	19	19	subspecies	155989	                RS_GCF_003071585.1
  0.0001	18	18	subspecies	156018	                RS_GCF_002220675.1
  0.0001	14	14	subspecies	156001	                RS_GCF_006716725.1
  0.0001	13	13	subspecies	156012	                RS_GCF_006711245.1
  0.0001	13	13	subspecies	156019	                RS_GCF_002220715.1
  0.0001	12	12	subspecies	155993	                RS_GCF_014304635.1
  0.0001	9	9	subspecies	156009	                GB_GCA_002872515.1
  0.0000	7	7	subspecies	156023	                RS_GCF_001280365.1
  0.0000	7	7	subspecies	156024	                RS_GCF_900215455.1
  0.0734	10742	7614	species	145425	              s__Serratia marcescens_I
  0.0111	1621	1621	subspecies	145430	                RS_GCF_014333335.1
  0.0088	1285	1285	subspecies	145437	                RS_GCF_002935055.1
  0.0007	98	98	subspecies	145475	                RS_GCF_003812745.1
  0.0003	41	41	subspecies	145491	                RS_GCF_003186475.1
  0.0002	25	25	subspecies	145539	                GB_GCA_006711525.1
  0.0001	15	15	subspecies	145490	                GB_GCA_002007925.2
  0.0001	15	15	subspecies	145503	                RS_GCF_013426155.1
  0.0001	9	9	subspecies	145547	                RS_GCF_001932655.1
  0.0000	7	7	subspecies	145538	                RS_GCF_008931425.1
  0.0000	6	6	subspecies	145537	                RS_GCF_002220635.1
  0.0000	5	5	subspecies	145544	                RS_GCF_009834305.1
  0.0000	1	1	subspecies	145500	                RS_GCF_003031545.1
  0.0733	10736	6564	species	164135	              s__Serratia marcescens
  0.0154	2248	2248	subspecies	164136	                GB_GCA_006974205.1
  0.0125	1824	1824	subspecies	164146	                RS_GCF_003967055.1
  0.0003	41	41	subspecies	164173	                RS_GCF_013367735.1
  0.0001	20	20	subspecies	164160	                RS_GCF_003355135.1
  0.0001	18	18	subspecies	164152	                RS_GCF_003182655.1
  0.0001	11	11	subspecies	164164	                RS_GCF_002220535.1
  0.0001	10	10	subspecies	164165	                RS_GCF_009936295.1
  0.0015	213	72	species	128395	              s__Serratia marcescens_K
  0.0006	90	90	subspecies	128753	                RS_GCF_008364265.2
  0.0001	8	8	subspecies	128667	                RS_GCF_002220555.1
  0.0000	6	6	subspecies	128513	                RS_GCF_902166755.1
  0.0000	6	6	subspecies	128748	                RS_GCF_002996885.1
  0.0000	6	6	subspecies	128762	                RS_GCF_002810285.1
  0.0000	5	5	subspecies	128665	                GB_GCA_013425845.1
  0.0000	5	5	subspecies	128679	                RS_GCF_002220655.1
  0.0000	4	4	subspecies	128530	                RS_GCF_000828775.1
  0.0000	3	3	subspecies	128563	                RS_GCF_003071565.1
  0.0000	2	2	subspecies	128740	                RS_GCF_001294565.1
  0.0000	2	2	subspecies	128751	                RS_GCF_002997125.1
  0.0000	1	1	subspecies	128464	                RS_GCF_009858195.1
  0.0000	1	1	subspecies	128657	                RS_GCF_900029885.1
  0.0000	1	1	subspecies	128730	                GB_GCA_013425865.1
  0.0000	1	1	subspecies	128732	                GB_GCA_013425885.1
  0.0000	4	0	species	197313	              s__Serratia surfactantfaciens
  0.0000	4	4	subspecies	197315	                RS_GCF_001642805.2
  0.0000	1	0	species	197337	              s__Serratia grimesii
  0.0000	1	1	subspecies	197342	                RS_GCF_900186025.1
  0.6693	97959	961	genus	166746	            g__Dickeya
  0.0836	12232	11894	species	219436	              s__Dickeya aquatica
  0.0019	284	284	subspecies	219438	                RS_GCF_900095885.1
  0.0003	43	43	subspecies	219437	                RS_GCF_000406085.2
  0.0001	11	11	subspecies	219439	                RS_GCF_000406285.1
  0.0836	12231	11935	species	245845	              s__Dickeya paradisiaca
  0.0013	191	191	subspecies	245846	                RS_GCF_000023545.1
  0.0007	105	105	subspecies	245847	                RS_GCF_000400505.1
  0.0834	12206	11609	species	220900	              s__Dickeya poaceiphila
  0.0023	336	336	subspecies	220902	                RS_GCF_007858975.2
  0.0018	261	261	subspecies	220903	                RS_GCF_000406125.1
  0.0831	12157	5982	species	202286	              s__Dickeya chrysanthemi
  0.0411	6023	6023	subspecies	202289	                RS_GCF_000406105.1
  0.0007	101	101	subspecies	202288	                RS_GCF_000023565.1
  0.0003	40	40	subspecies	202292	                RS_GCF_000406065.1
  0.0001	11	11	subspecies	202290	                RS_GCF_000406245.1
  0.0825	12079	7104	species	184827	              s__Dickeya fangzhongdai
  0.0165	2409	2409	subspecies	184832	                RS_GCF_002812485.1
  0.0157	2291	2291	subspecies	184831	                RS_GCF_003049805.1
  0.0012	171	171	subspecies	184836	                RS_GCF_000406205.1
  0.0003	45	45	subspecies	184834	                RS_GCF_000758345.1
  0.0003	41	41	subspecies	184833	                RS_GCF_000406305.1
  0.0001	18	18	subspecies	184839	                RS_GCF_003628775.1
  0.0822	12028	2392	species	193650	              s__Dickeya zeae
  0.0400	5855	5855	subspecies	193651	                RS_GCF_012278555.1
  0.0254	3718	3718	subspecies	193652	                RS_GCF_002887555.1
  0.0002	34	34	subspecies	193657	                RS_GCF_000025065.1
  0.0001	19	19	subspecies	193654	                RS_GCF_000406325.1
  0.0000	6	6	subspecies	193653	                RS_GCF_000400525.1
  0.0000	4	4	subspecies	193658	                RS_GCF_000406165.1
  0.0813	11902	1015	species	197195	              s__Dickeya zeae_A
  0.0378	5534	5534	subspecies	197197	                RS_GCF_000816045.1
  0.0364	5335	5335	subspecies	197196	                RS_GCF_012278405.1
  0.0001	14	14	subspecies	197199	                RS_GCF_000406225.1
  0.0000	4	4	subspecies	197198	                RS_GCF_000406045.1
  0.0418	6115	299	species	183329	              s__Dickeya dadantii
  0.0397	5810	5810	subspecies	183332	                RS_GCF_000406185.1
  0.0000	4	4	subspecies	183339	                RS_GCF_000147055.1
  0.0000	2	2	subspecies	183341	                RS_GCF_000406265.1
  0.0413	6047	5313	species	178267	              s__Dickeya dianthicola
  0.0048	698	698	subspecies	178271	                RS_GCF_000430955.1
  0.0002	23	23	subspecies	178273	                RS_GCF_000365365.1
  0.0000	5	5	subspecies	178269	                RS_GCF_000365405.2
  0.0000	4	4	subspecies	178275	                RS_GCF_002706485.1
  0.0000	3	3	subspecies	178278	                RS_GCF_003403135.1
  0.0000	1	1	subspecies	178283	                RS_GCF_000365305.1
  0.0000	1	1	species	166747	              s__Dickeya solani
  0.5855	85693	464	genus	125829	            g__Yersinia
  0.0836	12233	10209	species	155083	              s__Yersinia ruckeri
  0.0072	1056	1056	subspecies	155095	                RS_GCF_002442495.2
  0.0060	883	883	subspecies	155107	                RS_GCF_000964565.1
  0.0004	64	64	subspecies	155124	                RS_GCF_000834255.1
  0.0001	16	16	subspecies	155113	                RS_GCF_002192595.1
  0.0000	5	5	subspecies	155135	                RS_GCF_000775355.2
  0.0833	12188	8246	species	173023	              s__Yersinia massiliensis
  0.0239	3499	3499	subspecies	173030	                RS_GCF_002591095.1
  0.0030	442	442	subspecies	173032	                RS_GCF_003048255.1
  0.0000	1	1	subspecies	173039	                RS_GCF_013282765.1
  0.0832	12173	12077	species	168468	              s__Yersinia intermedia
  0.0003	51	51	subspecies	168488	                RS_GCF_000834515.1
  0.0003	42	42	subspecies	168484	                RS_GCF_900635455.1
  0.0000	2	2	subspecies	168478	                RS_GCF_002983625.1
  0.0000	1	1	subspecies	168492	                RS_GCF_009730055.1
  0.0831	12169	5483	species	177863	              s__Yersinia bercovieri
  0.0230	3365	3365	subspecies	177872	                RS_GCF_005937895.2
  0.0227	3321	3321	subspecies	177869	                RS_GCF_013282745.1
  0.0831	12161	12045	species	141149	              s__Yersinia enterocolitica
  0.0002	34	34	subspecies	141163	                RS_GCF_001305635.1
  0.0002	24	24	subspecies	141194	                RS_GCF_901472495.1
  0.0002	23	23	subspecies	141267	                RS_GCF_000834195.1
  0.0001	8	8	subspecies	141331	                RS_GCF_000192105.1
  0.0000	6	6	subspecies	141183	                RS_GCF_000009345.1
  0.0000	5	5	subspecies	141186	                RS_GCF_000968115.1
  0.0000	5	5	subspecies	141247	                RS_GCF_000834735.1
  0.0000	3	3	subspecies	141190	                RS_GCF_000253175.1
  0.0000	2	2	subspecies	141318	                RS_GCF_001708555.1
  0.0000	2	2	subspecies	141329	                RS_GCF_001708575.1
  0.0000	2	2	subspecies	141330	                RS_GCF_902385945.1
  0.0000	1	1	subspecies	141272	                RS_GCF_900635745.1
  0.0000	1	1	subspecies	141281	                RS_GCF_000834795.1
  0.0830	12155	1924	species	217041	              s__Yersinia hibernica
  0.0351	5132	5132	subspecies	217043	                RS_GCF_000597945.1
  0.0348	5099	5099	subspecies	217044	                RS_GCF_004124235.1
  0.0829	12134	11761	species	183766	              s__Yersinia kristensenii_B
  0.0015	216	216	subspecies	183767	                RS_GCF_000750355.1
  0.0005	78	78	subspecies	183773	                RS_GCF_000834215.1
  0.0005	77	77	subspecies	183774	                RS_GCF_003600645.1
  0.0000	2	2	subspecies	183777	                RS_GCF_000834865.1
  0.0001	9	5	species	125830	              s__Yersinia pestis
  0.0000	2	2	subspecies	125872	                RS_GCF_000834945.1
  0.0000	1	1	subspecies	126266	                RS_GCF_900636705.1
  0.0000	1	1	subspecies	126314	                RS_GCF_000834275.1
  0.0000	3	0	species	173518	              s__Yersinia kristensenii
  0.0000	3	3	subspecies	173540	                RS_GCF_013282785.1
  0.0000	2	0	species	187028	              s__Yersinia aldovae
  0.0000	2	2	subspecies	187029	                RS_GCF_000834395.1
  0.0000	1	0	species	228143	              s__Yersinia canariae
  0.0000	1	1	subspecies	228146	                RS_GCF_009831415.1
  0.0000	1	0	species	229156	              s__Yersinia entomophaga
  0.0000	1	1	subspecies	229159	                RS_GCF_001656035.1
  0.5762	84341	1041	genus	165383	            g__Providencia
  0.0833	12199	4800	species	204001	              s__Providencia heimbachae
  0.0259	3797	3797	subspecies	204002	                RS_GCF_005157325.1
  0.0246	3602	3602	subspecies	204004	                RS_GCF_900475855.1
  0.0820	12007	8407	species	171314	              s__Providencia rettgeri_D
  0.0156	2279	2279	subspecies	171316	                RS_GCF_010318885.1
  0.0086	1256	1256	subspecies	171315	                RS_GCF_014489375.1
  0.0003	44	44	subspecies	171323	                RS_GCF_013694385.1
  0.0001	15	15	subspecies	171331	                RS_GCF_010320145.1
  0.0000	5	5	subspecies	171321	                RS_GCF_013423885.1
  0.0000	1	1	subspecies	171324	                RS_GCF_005155965.1
  0.0819	11981	7327	species	172835	              s__Providencia alcalifaciens
  0.0304	4444	4444	subspecies	172841	                RS_GCF_013702185.1
  0.0014	200	200	subspecies	172836	                RS_GCF_002393505.1
  0.0001	10	10	subspecies	172846	                RS_GCF_900478095.1
  0.0816	11951	1667	species	190810	              s__Providencia rustigianii
  0.0352	5149	5149	subspecies	190817	                RS_GCF_900637755.1
  0.0351	5135	5135	subspecies	190812	                RS_GCF_900635875.1
  0.0814	11917	8989	species	172568	              s__Providencia rettgeri_A
  0.0182	2657	2657	subspecies	172579	                RS_GCF_013702025.1
  0.0018	267	267	subspecies	172570	                RS_GCF_002984195.1
  0.0000	4	4	subspecies	172580	                RS_GCF_001874625.1
  0.0800	11716	11594	species	189605	              s__Providencia rettgeri
  0.0003	48	48	subspecies	189606	                RS_GCF_011045635.1
  0.0003	44	44	subspecies	189611	                RS_GCF_000314835.2
  0.0002	22	22	subspecies	189612	                RS_GCF_003204135.1
  0.0001	8	8	subspecies	189610	                RS_GCF_011045615.1
  0.0787	11523	10026	species	230053	              s__Providencia sp002843235
  0.0061	888	888	subspecies	230054	                RS_GCF_002843235.3
  0.0042	609	609	subspecies	230055	                RS_GCF_013702245.1
  0.0000	3	0	species	165384	              s__Providencia stuartii
  0.0000	2	2	subspecies	165385	                RS_GCF_001888205.1
  0.0000	1	1	subspecies	165408	                RS_GCF_000259175.1
  0.0000	3	0	species	219566	              s__Providencia rettgeri_F
  0.0000	3	3	subspecies	219568	                RS_GCF_013702265.1
  0.5615	82187	26135	genus	8039	            g__Escherichia
  0.0769	11263	8912	species	152707	              s__Escherichia marmotae
  0.0081	1179	1179	subspecies	152735	                RS_GCF_013745515.1
  0.0077	1127	1127	subspecies	152728	                RS_GCF_900636405.1
  0.0002	25	25	subspecies	152765	                RS_GCF_002900365.1
  0.0001	9	9	subspecies	152745	                RS_GCF_013732895.1
  0.0000	7	7	subspecies	152744	                RS_GCF_013636235.1
  0.0000	3	3	subspecies	152763	                RS_GCF_900637015.1
  0.0000	1	1	subspecies	152760	                RS_GCF_013746655.1
  0.0748	10945	8368	species	148706	              s__Escherichia albertii
  0.0106	1547	1547	subspecies	148714	                RS_GCF_002895205.1
  0.0064	940	940	subspecies	148710	                RS_GCF_002872455.1
  0.0003	37	37	subspecies	148783	                GB_GCA_003864075.1
  0.0001	11	11	subspecies	148797	                RS_GCF_003864095.1
  0.0001	8	8	subspecies	148777	                RS_GCF_000512125.1
  0.0000	7	7	subspecies	148743	                RS_GCF_003312545.2
  0.0000	6	6	subspecies	148739	                RS_GCF_003860385.1
  0.0000	5	5	subspecies	148803	                RS_GCF_002741375.1
  0.0000	4	4	subspecies	148716	                RS_GCF_003312525.2
  0.0000	4	4	subspecies	148746	                RS_GCF_003312485.2
  0.0000	4	4	subspecies	148775	                RS_GCF_003316815.1
  0.0000	2	2	subspecies	148780	                RS_GCF_002285455.1
  0.0000	1	1	subspecies	148734	                RS_GCF_001549955.1
  0.0000	1	1	subspecies	148737	                RS_GCF_003860365.1
  0.0671	9820	8766	species	153774	              s__Escherichia fergusonii
  0.0063	917	917	subspecies	153777	                RS_GCF_013829265.1
  0.0006	93	93	subspecies	153826	                GB_GCA_003382705.1
  0.0000	6	6	subspecies	153801	                RS_GCF_008064915.1
  0.0000	6	6	subspecies	153798	                RS_GCF_008064875.1
  0.0000	5	5	subspecies	153845	                RS_GCF_003944565.2
  0.0000	5	5	subspecies	153817	                RS_GCF_013812875.1
  0.0000	4	4	subspecies	153825	                RS_GCF_013820845.1
  0.0000	3	3	subspecies	153841	                RS_GCF_013836325.1
  0.0000	2	2	subspecies	153796	                RS_GCF_013892435.1
  0.0000	2	2	subspecies	153818	                RS_GCF_013591455.1
  0.0000	2	2	subspecies	153828	                RS_GCF_013825725.1
  0.0000	1	1	subspecies	153792	                RS_GCF_000026225.1
  0.0000	1	1	subspecies	153790	                RS_GCF_013821535.1
  0.0000	1	1	subspecies	153787	                RS_GCF_000191665.1
  0.0000	1	1	subspecies	153808	                RS_GCF_013714535.1
  0.0000	1	1	subspecies	153814	                RS_GCF_013819565.1
  0.0000	1	1	subspecies	153783	                RS_GCF_013171325.1
  0.0000	1	1	subspecies	153823	                RS_GCF_013834165.1
  0.0000	1	1	subspecies	153781	                RS_GCF_013886335.1
  0.0000	1	1	subspecies	153775	                RS_GCF_013886195.1
  0.0481	7034	4961	species	156552	              s__Escherichia coli_C
  0.0131	1913	1913	subspecies	156559	                RS_GCF_009931435.1
  0.0009	136	136	subspecies	156563	                GB_GCA_007109445.1
  0.0002	23	23	subspecies	156568	                GB_GCA_003018335.1
  0.0000	1	1	subspecies	156595	                RS_GCF_003018295.1
  0.0458	6706	6380	species	81043	              s__Escherichia coli
  0.0002	33	33	subspecies	81883	                RS_GCF_003018255.1
  0.0002	27	27	subspecies	81096	                RS_GCF_001577325.1
  0.0001	21	21	subspecies	84786	                GB_GCA_013315915.1
  0.0001	20	20	subspecies	82277	                GB_GCA_013315895.1
  0.0001	18	18	subspecies	81805	                GB_GCA_013315855.1
  0.0001	16	16	subspecies	81110	                RS_GCF_014217155.1
  0.0001	11	11	subspecies	81576	                GB_GCA_013341335.1
  0.0001	8	8	subspecies	84383	                GB_GCA_003491265.1
  0.0000	7	7	subspecies	82553	                RS_GCF_002951855.1
  0.0000	7	7	subspecies	82457	                RS_GCF_002310635.1
  0.0000	7	7	subspecies	82319	                GB_GCA_013341355.1
  0.0000	6	6	subspecies	81520	                RS_GCF_012955465.1
  0.0000	6	6	subspecies	81794	                GB_GCA_014170595.1
  0.0000	6	6	subspecies	81555	                GB_GCA_013315875.1
  0.0000	5	5	subspecies	83588	                GB_GCA_001513655.1
  0.0000	5	5	subspecies	81783	                RS_GCF_000026305.1
  0.0000	5	5	subspecies	83744	                GB_GCA_014170695.1
  0.0000	4	4	subspecies	83317	                RS_GCF_007833295.1
  0.0000	4	4	subspecies	82424	                RS_GCF_013085205.1
  0.0000	4	4	subspecies	81490	                GB_GCA_900635985.1
  0.0000	4	4	subspecies	83604	                RS_GCF_013315715.1
  0.0000	4	4	subspecies	83382	                RS_GCF_000813165.1
  0.0000	3	3	subspecies	84036	                RS_GCF_012934555.1
  0.0000	3	3	subspecies	83258	                RS_GCF_902825195.1
  0.0000	3	3	subspecies	85063	                GB_GCA_002215115.1
  0.0000	3	3	subspecies	85282	                RS_GCF_011044355.1
  0.0000	3	3	subspecies	81671	                RS_GCF_002944935.1
  0.0000	3	3	subspecies	84661	                RS_GCF_900622635.1
  0.0000	3	3	subspecies	81779	                RS_GCF_010668985.1
  0.0000	3	3	subspecies	81696	                RS_GCF_003044015.1
  0.0000	2	2	subspecies	84830	                RS_GCF_012934515.1
  0.0000	2	2	subspecies	84554	                RS_GCF_002237305.1
  0.0000	2	2	subspecies	84543	                RS_GCF_000931565.1
  0.0000	2	2	subspecies	84449	                RS_GCF_001566655.1
  0.0000	2	2	subspecies	82653	                RS_GCF_900635195.1
  0.0000	2	2	subspecies	83610	                RS_GCF_003571825.1
  0.0000	2	2	subspecies	84244	                RS_GCF_003346835.1
  0.0000	2	2	subspecies	81125	                RS_GCF_003999775.1
  0.0000	2	2	subspecies	81591	                RS_GCF_014262945.1
  0.0000	2	2	subspecies	84887	                RS_GCF_012934635.1
  0.0000	2	2	subspecies	84941	                RS_GCF_003076395.1
  0.0000	2	2	subspecies	85115	                RS_GCF_003019095.1
  0.0000	2	2	subspecies	81961	                RS_GCF_003571665.1
  0.0000	1	1	subspecies	85026	                RS_GCF_003043915.1
  0.0000	1	1	subspecies	83947	                RS_GCF_002012085.1
  0.0000	1	1	subspecies	85310	                RS_GCF_012974805.1
  0.0000	1	1	subspecies	85279	                RS_GCF_004564035.1
  0.0000	1	1	subspecies	83979	                RS_GCF_007108505.1
  0.0000	1	1	subspecies	84028	                RS_GCF_000493595.2
  0.0000	1	1	subspecies	85265	                RS_GCF_900520395.1
  0.0000	1	1	subspecies	85156	                RS_GCF_900119685.1
  0.0000	1	1	subspecies	84716	                RS_GCF_007108085.1
  0.0000	1	1	subspecies	84264	                RS_GCF_002142715.1
  0.0000	1	1	subspecies	84318	                RS_GCF_007109005.1
  0.0000	1	1	subspecies	85014	                RS_GCF_002796585.1
  0.0000	1	1	subspecies	84433	                RS_GCF_002056635.1
  0.0000	1	1	subspecies	85387	                RS_GCF_001469815.1
  0.0000	1	1	subspecies	84820	                RS_GCF_000007445.1
  0.0000	1	1	subspecies	84809	                RS_GCF_002763995.1
  0.0000	1	1	subspecies	84727	                RS_GCF_013084945.1
  0.0000	1	1	subspecies	82460	                RS_GCF_001663475.1
  0.0000	1	1	subspecies	81391	                RS_GCF_902164715.1
  0.0000	1	1	subspecies	81652	                RS_GCF_009577985.1
  0.0000	1	1	subspecies	81681	                RS_GCF_900636215.1
  0.0000	1	1	subspecies	81721	                RS_GCF_001566635.1
  0.0000	1	1	subspecies	81816	                RS_GCF_002357915.1
  0.0000	1	1	subspecies	81900	                RS_GCF_001420955.1
  0.0000	1	1	subspecies	82019	                RS_GCF_002863845.1
  0.0000	1	1	subspecies	82058	                RS_GCF_000148605.1
  0.0000	1	1	subspecies	82112	                RS_GCF_900520345.1
  0.0000	1	1	subspecies	82204	                RS_GCF_003288455.1
  0.0000	1	1	subspecies	82284	                RS_GCF_902810395.1
  0.0000	1	1	subspecies	82313	                RS_GCF_007108845.1
  0.0000	1	1	subspecies	82376	                RS_GCF_007109165.1
  0.0000	1	1	subspecies	82442	                RS_GCF_002202175.1
  0.0000	1	1	subspecies	82456	                RS_GCF_900520365.1
  0.0000	1	1	subspecies	83933	                RS_GCF_004804185.1
  0.0000	1	1	subspecies	82470	                RS_GCF_003856995.1
  0.0000	1	1	subspecies	82541	                RS_GCF_013372405.1
  0.0000	1	1	subspecies	82620	                RS_GCF_004193755.1
  0.0000	1	1	subspecies	82625	                RS_GCF_003856615.1
  0.0000	1	1	subspecies	82634	                RS_GCF_000014845.1
  0.0000	1	1	subspecies	82648	                RS_GCF_001617565.1
  0.0000	1	1	subspecies	82749	                RS_GCF_004804205.1
  0.0000	1	1	subspecies	82976	                RS_GCF_003194345.1
  0.0000	1	1	subspecies	82995	                RS_GCF_007833255.1
  0.0000	1	1	subspecies	83108	                RS_GCF_002012305.1
  0.0000	1	1	subspecies	83131	                RS_GCF_012934785.1
  0.0000	1	1	subspecies	83321	                RS_GCF_014169015.1
  0.0000	1	1	subspecies	83521	                RS_GCF_003018475.1
  0.0000	1	1	subspecies	83540	                RS_GCF_902703415.1
  0.0343	5020	4611	species	87551	              s__Escherichia coli_D
  0.0004	58	58	subspecies	87621	                RS_GCF_013459175.1
  0.0002	33	33	subspecies	89308	                GB_GCA_007997855.1
  0.0002	28	28	subspecies	87605	                RS_GCF_011045295.1
  0.0002	26	26	subspecies	89204	                GB_GCA_007998065.1
  0.0002	22	22	subspecies	88616	                GB_GCA_900636225.1
  0.0001	17	17	subspecies	89109	                GB_GCA_900636275.1
  0.0001	15	15	subspecies	88534	                RS_GCF_002950055.1
  0.0001	14	14	subspecies	88717	                GB_GCA_013358385.1
  0.0001	13	13	subspecies	88109	                GB_GCA_013315935.1
  0.0001	12	12	subspecies	89505	                RS_GCF_003410275.1
  0.0001	11	11	subspecies	89335	                GB_GCA_013368055.1
  0.0001	8	8	subspecies	89057	                RS_GCF_000599705.1
  0.0000	7	7	subspecies	88870	                GB_GCA_014217115.1
  0.0000	7	7	subspecies	89161	                RS_GCF_012934815.1
  0.0000	7	7	subspecies	88162	                GB_GCA_012934735.1
  0.0000	6	6	subspecies	89299	                RS_GCF_000026345.1
  0.0000	6	6	subspecies	88008	                RS_GCF_001485455.1
  0.0000	5	5	subspecies	88113	                RS_GCF_902810335.1
  0.0000	5	5	subspecies	87756	                GB_GCA_014217035.1
  0.0000	5	5	subspecies	87907	                RS_GCF_002310615.1
  0.0000	5	5	subspecies	89254	                RS_GCF_003018235.1
  0.0000	4	4	subspecies	89012	                RS_GCF_013315695.1
  0.0000	4	4	subspecies	88020	                RS_GCF_001938625.2
  0.0000	4	4	subspecies	88006	                RS_GCF_900636065.1
  0.0000	4	4	subspecies	88873	                RS_GCF_002948655.1
  0.0000	4	4	subspecies	89260	                RS_GCF_902825185.1
  0.0000	3	3	subspecies	88475	                RS_GCF_014216695.1
  0.0000	3	3	subspecies	87711	                RS_GCF_010092965.1
  0.0000	3	3	subspecies	89608	                RS_GCF_003095635.1
  0.0000	3	3	subspecies	89185	                RS_GCF_003018095.1
  0.0000	3	3	subspecies	89197	                RS_GCF_001890365.1
  0.0000	3	3	subspecies	88022	                GB_GCA_014217015.1
  0.0000	3	3	subspecies	89412	                RS_GCF_002946715.1
  0.0000	3	3	subspecies	88011	                RS_GCF_014216895.1
  0.0000	2	2	subspecies	88478	                RS_GCF_002009315.1
  0.0000	2	2	subspecies	87970	                RS_GCF_003194125.1
  0.0000	2	2	subspecies	87950	                RS_GCF_000227625.1
  0.0000	2	2	subspecies	88815	                RS_GCF_006351885.1
  0.0000	2	2	subspecies	89639	                RS_GCF_003571785.1
  0.0000	2	2	subspecies	88222	                GB_GCA_014216815.1
  0.0000	2	2	subspecies	88595	                RS_GCF_007109365.1
  0.0000	2	2	subspecies	88603	                RS_GCF_003571685.1
  0.0000	2	2	subspecies	88612	                RS_GCF_007107705.1
  0.0000	2	2	subspecies	88169	                RS_GCF_014171015.1
  0.0000	2	2	subspecies	88676	                RS_GCF_002214205.1
  0.0000	2	2	subspecies	87793	                RS_GCF_003030245.1
  0.0000	2	2	subspecies	89069	                RS_GCF_002925525.1
  0.0000	1	1	subspecies	89198	                RS_GCF_002310695.1
  0.0000	1	1	subspecies	89113	                RS_GCF_012934715.1
  0.0000	1	1	subspecies	89207	                RS_GCF_003204955.1
  0.0000	1	1	subspecies	89246	                RS_GCF_012934435.1
  0.0000	1	1	subspecies	89671	                RS_GCF_011045275.1
  0.0000	1	1	subspecies	89427	                RS_GCF_002012045.1
  0.0000	1	1	subspecies	88307	                RS_GCF_007108305.1
  0.0000	1	1	subspecies	87683	                RS_GCF_008949495.1
  0.0000	1	1	subspecies	87685	                RS_GCF_013085025.1
  0.0000	1	1	subspecies	87940	                GB_GCA_004011015.1
  0.0000	1	1	subspecies	88000	                RS_GCF_003180995.1
  0.0000	1	1	subspecies	88025	                RS_GCF_004759025.1
  0.0000	1	1	subspecies	88210	                RS_GCF_012934695.1
  0.0000	1	1	subspecies	88234	                RS_GCF_002357875.1
  0.0000	1	1	subspecies	88259	                GB_GCA_014216835.1
  0.0000	1	1	subspecies	88263	                RS_GCF_013282275.1
  0.0000	1	1	subspecies	88268	                GB_GCA_014216875.1
  0.0000	1	1	subspecies	88279	                RS_GCF_013402895.1
  0.0000	1	1	subspecies	89046	                RS_GCF_014168855.1
  0.0000	1	1	subspecies	88377	                RS_GCF_013347985.1
  0.0000	1	1	subspecies	88422	                RS_GCF_003194265.1
  0.0000	1	1	subspecies	88508	                RS_GCF_013282335.1
  0.0000	1	1	subspecies	88540	                GB_GCA_014169415.1
  0.0000	1	1	subspecies	88563	                RS_GCF_004377995.2
  0.0000	1	1	subspecies	88590	                RS_GCF_002278115.2
  0.0000	1	1	subspecies	88659	                RS_GCF_002966755.1
  0.0000	1	1	subspecies	88713	                RS_GCF_003813145.1
  0.0000	1	1	subspecies	88765	                RS_GCF_012934455.1
  0.0000	1	1	subspecies	88785	                RS_GCF_013388275.1
  0.0259	3796	3650	species	91749	              s__Escherichia dysenteriae
  0.0001	16	16	subspecies	91760	                RS_GCF_001890225.1
  0.0001	13	13	subspecies	93248	                GB_GCA_900635225.1
  0.0001	8	8	subspecies	91756	                RS_GCF_005221525.1
  0.0001	8	8	subspecies	93215	                RS_GCF_006514375.1
  0.0000	7	7	subspecies	93428	                RS_GCF_011045215.1
  0.0000	7	7	subspecies	92855	                GB_GCA_009873355.1
  0.0000	6	6	subspecies	93543	                GB_GCA_014216795.1
  0.0000	4	4	subspecies	93294	                RS_GCF_000497505.1
  0.0000	4	4	subspecies	92713	                RS_GCF_001650295.1
  0.0000	3	3	subspecies	93528	                RS_GCF_001644745.1
  0.0000	3	3	subspecies	93719	                RS_GCF_002949715.1
  0.0000	3	3	subspecies	93309	                RS_GCF_010669025.1
  0.0000	3	3	subspecies	93603	                RS_GCF_013167495.1
  0.0000	3	3	subspecies	93646	                RS_GCF_013343615.1
  0.0000	3	3	subspecies	92884	                RS_GCF_013167995.1
  0.0000	3	3	subspecies	93666	                RS_GCF_011045235.1
  0.0000	3	3	subspecies	92434	                RS_GCF_002854065.1
  0.0000	3	3	subspecies	91871	                RS_GCF_013167535.1
  0.0000	2	2	subspecies	93100	                RS_GCF_000155125.1
  0.0000	2	2	subspecies	92315	                RS_GCF_003019235.1
  0.0000	2	2	subspecies	92174	                RS_GCF_900635185.1
  0.0000	2	2	subspecies	92931	                RS_GCF_001753525.1
  0.0000	2	2	subspecies	91915	                RS_GCF_013315755.1
  0.0000	2	2	subspecies	92845	                RS_GCF_002220265.1
  0.0000	1	1	subspecies	93366	                RS_GCF_001612475.1
  0.0000	1	1	subspecies	93181	                RS_GCF_005037815.1
  0.0000	1	1	subspecies	92109	                RS_GCF_004010635.1
  0.0000	1	1	subspecies	92064	                RS_GCF_002741615.1
  0.0000	1	1	subspecies	91963	                RS_GCF_000730345.1
  0.0000	1	1	subspecies	93355	                RS_GCF_000732965.1
  0.0000	1	1	subspecies	93364	                RS_GCF_900635325.1
  0.0000	1	1	subspecies	93051	                RS_GCF_002058765.1
  0.0000	1	1	subspecies	93400	                RS_GCF_014623225.1
  0.0000	1	1	subspecies	93411	                RS_GCF_004010715.1
  0.0000	1	1	subspecies	91896	                RS_GCF_001890205.1
  0.0000	1	1	subspecies	91888	                RS_GCF_001890265.1
  0.0000	1	1	subspecies	91886	                RS_GCF_001705405.1
  0.0000	1	1	subspecies	91777	                RS_GCF_013168015.1
  0.0000	1	1	subspecies	93676	                RS_GCF_014623185.1
  0.0000	1	1	subspecies	91772	                RS_GCF_000025165.1
  0.0000	1	1	subspecies	92672	                RS_GCF_008462425.1
  0.0000	1	1	subspecies	92308	                RS_GCF_009738455.1
  0.0000	1	1	subspecies	92446	                RS_GCF_000006665.1
  0.0000	1	1	subspecies	92478	                RS_GCF_009931235.1
  0.0000	1	1	subspecies	92488	                RS_GCF_000827105.1
  0.0000	1	1	subspecies	92525	                RS_GCF_008925965.1
  0.0000	1	1	subspecies	92570	                RS_GCF_008727175.1
  0.0000	1	1	subspecies	92649	                RS_GCF_003308955.1
  0.0000	1	1	subspecies	92661	                RS_GCF_005221905.1
  0.0000	1	1	subspecies	93174	                RS_GCF_014623405.1
  0.0000	1	1	subspecies	92297	                RS_GCF_001651925.2
  0.0000	1	1	subspecies	92730	                RS_GCF_002949755.1
  0.0000	1	1	subspecies	92742	                RS_GCF_002952095.1
  0.0000	1	1	subspecies	92266	                RS_GCF_007922655.1
  0.0000	1	1	subspecies	92188	                RS_GCF_013168115.1
  0.0000	1	1	subspecies	92912	                RS_GCF_002208865.2
  0.0000	1	1	subspecies	92948	                RS_GCF_001806265.1
  0.0000	1	1	subspecies	92962	                RS_GCF_013167935.1
  0.0100	1465	846	species	8040	              s__Escherichia flexneri
  0.0002	36	36	subspecies	12821	                RS_GCF_013122565.1
  0.0002	23	23	subspecies	12882	                RS_GCF_002812545.1
  0.0001	21	21	subspecies	18535	                GB_GCA_013341375.1
  0.0001	19	19	subspecies	20678	                GB_GCA_007998105.1
  0.0001	16	16	subspecies	19054	                GB_GCA_900636085.1
  0.0001	12	12	subspecies	9092	                RS_GCF_013112335.1
  0.0001	12	12	subspecies	12755	                GB_GCA_007998085.1
  0.0001	11	11	subspecies	17548	                RS_GCF_004924275.1
  0.0001	10	10	subspecies	15940	                GB_GCA_007998125.1
  0.0001	8	8	subspecies	17991	                GB_GCA_002949875.1
  0.0000	7	7	subspecies	11043	                GB_GCA_002950375.1
  0.0000	7	7	subspecies	20971	                GB_GCA_003019195.1
  0.0000	6	6	subspecies	15087	                RS_GCF_001660565.1
  0.0000	6	6	subspecies	8296	                RS_GCF_003956265.1
  0.0000	6	6	subspecies	19197	                RS_GCF_000814145.2
  0.0000	5	5	subspecies	14817	                RS_GCF_900184875.1
  0.0000	5	5	subspecies	10773	                RS_GCF_009909505.1
  0.0000	5	5	subspecies	13485	                RS_GCF_009762365.1
  0.0000	5	5	subspecies	11007	                RS_GCF_011996085.1
  0.0000	5	5	subspecies	17778	                GB_GCA_013315835.1
  0.0000	5	5	subspecies	20630	                GB_GCA_002949915.1
  0.0000	4	4	subspecies	17084	                GB_GCA_011292655.2
  0.0000	4	4	subspecies	14829	                RS_GCF_003017765.1
  0.0000	4	4	subspecies	18306	                RS_GCF_002855415.1
  0.0000	4	4	subspecies	11594	                RS_GCF_900635235.1
  0.0000	4	4	subspecies	15845	                GB_GCA_007998005.1
  0.0000	4	4	subspecies	8279	                RS_GCF_002950135.1
  0.0000	4	4	subspecies	15064	                GB_GCA_014216775.1
  0.0000	4	4	subspecies	9227	                GB_GCA_900635685.1
  0.0000	4	4	subspecies	19948	                RS_GCF_002949955.1
  0.0000	4	4	subspecies	22536	                GB_GCA_003018595.1
  0.0000	4	4	subspecies	13717	                GB_GCA_009762475.1
  0.0000	3	3	subspecies	12283	                GB_GCA_000257275.1
  0.0000	3	3	subspecies	21466	                RS_GCF_009950125.1
  0.0000	3	3	subspecies	21350	                RS_GCF_008370755.1
  0.0000	3	3	subspecies	21170	                RS_GCF_002946735.1
  0.0000	3	3	subspecies	21157	                RS_GCF_009762495.1
  0.0000	3	3	subspecies	18637	                RS_GCF_002879975.1
  0.0000	3	3	subspecies	17073	                RS_GCF_009762415.1
  0.0000	3	3	subspecies	22642	                RS_GCF_002163695.1
  0.0000	3	3	subspecies	17358	                RS_GCF_004771235.1
  0.0000	3	3	subspecies	20094	                RS_GCF_003111785.1
  0.0000	3	3	subspecies	16813	                RS_GCF_902810305.1
  0.0000	3	3	subspecies	16429	                RS_GCF_009762385.1
  0.0000	3	3	subspecies	19863	                RS_GCF_014216355.1
  0.0000	3	3	subspecies	15251	                RS_GCF_002853965.1
  0.0000	3	3	subspecies	18572	                RS_GCF_003017555.1
  0.0000	3	3	subspecies	15138	                RS_GCF_002903105.1
  0.0000	2	2	subspecies	19913	                RS_GCF_002860085.1
  0.0000	2	2	subspecies	12788	                RS_GCF_003956345.1
  0.0000	2	2	subspecies	19735	                RS_GCF_004799585.1
  0.0000	2	2	subspecies	12710	                GB_GCA_009931495.2
  0.0000	2	2	subspecies	12950	                RS_GCF_001721225.1
  0.0000	2	2	subspecies	19077	                RS_GCF_012044775.1
  0.0000	2	2	subspecies	19638	                RS_GCF_002949455.1
  0.0000	2	2	subspecies	13893	                RS_GCF_013694345.1
  0.0000	2	2	subspecies	14928	                RS_GCF_003018135.1
  0.0000	2	2	subspecies	13896	                RS_GCF_009671045.1
  0.0000	2	2	subspecies	15748	                RS_GCF_003351385.1
  0.0000	2	2	subspecies	17237	                RS_GCF_000167875.2
  0.0000	2	2	subspecies	17418	                RS_GCF_003019015.1
  0.0000	2	2	subspecies	17504	                RS_GCF_002949935.1
  0.0000	2	2	subspecies	16778	                RS_GCF_900636115.1
  0.0000	2	2	subspecies	16627	                RS_GCF_010365345.1
  0.0000	2	2	subspecies	17563	                GB_GCA_014170735.1
  0.0000	2	2	subspecies	17607	                RS_GCF_003204155.1
  0.0000	2	2	subspecies	16273	                RS_GCF_003018735.1
  0.0000	2	2	subspecies	16272	                RS_GCF_001900335.1
  0.0000	2	2	subspecies	15887	                RS_GCF_003018495.1
  0.0000	2	2	subspecies	15820	                RS_GCF_900747785.1
  0.0000	2	2	subspecies	13932	                RS_GCF_001677515.1
  0.0000	2	2	subspecies	15476	                RS_GCF_002949495.1
  0.0000	2	2	subspecies	15469	                RS_GCF_002057245.1
  0.0000	2	2	subspecies	18652	                RS_GCF_003017615.1
  0.0000	2	2	subspecies	18655	                GB_GCA_002950175.1
  0.0000	2	2	subspecies	12594	                RS_GCF_000017745.1
  0.0000	2	2	subspecies	14780	                RS_GCF_011306375.1
  0.0000	2	2	subspecies	18812	                RS_GCF_001900905.1
  0.0000	2	2	subspecies	18909	                RS_GCF_009905115.1
  0.0000	2	2	subspecies	14284	                RS_GCF_002741395.1
  0.0000	2	2	subspecies	14264	                RS_GCF_003956405.1
  0.0000	2	2	subspecies	14070	                RS_GCF_002950115.1
  0.0000	2	2	subspecies	11256	                RS_GCF_002741575.1
  0.0000	2	2	subspecies	22548	                RS_GCF_008065435.1
  0.0000	2	2	subspecies	8925	                RS_GCF_009671105.1
  0.0000	2	2	subspecies	20751	                RS_GCF_004135855.1
  0.0000	2	2	subspecies	21124	                RS_GCF_001886935.1
  0.0000	2	2	subspecies	9163	                RS_GCF_002966145.1
  0.0000	2	2	subspecies	9976	                RS_GCF_003571765.1
  0.0000	2	2	subspecies	9233	                RS_GCF_900636795.1
  0.0000	2	2	subspecies	10816	                RS_GCF_009905355.1
  0.0000	2	2	subspecies	8686	                GB_GCA_002950295.1
  0.0000	2	2	subspecies	20042	                GB_GCA_002215155.1
  0.0000	2	2	subspecies	20929	                RS_GCF_003703795.1
  0.0000	2	2	subspecies	21107	                RS_GCF_900636295.1
  0.0000	2	2	subspecies	9422	                RS_GCF_900747775.1
  0.0000	2	2	subspecies	11049	                GB_GCA_002073875.2
  0.0000	2	2	subspecies	21495	                GB_GCA_003018955.1
  0.0000	2	2	subspecies	9439	                RS_GCF_011765445.1
  0.0000	2	2	subspecies	20694	                RS_GCF_011404595.1
  0.0000	2	2	subspecies	11476	                GB_GCA_014170945.1
  0.0000	2	2	subspecies	9867	                RS_GCF_001542675.2
  0.0000	2	2	subspecies	10665	                RS_GCF_009671125.1
  0.0000	2	2	subspecies	11695	                GB_GCA_000725265.1
  0.0000	2	2	subspecies	9801	                RS_GCF_002803805.1
  0.0000	2	2	subspecies	9795	                RS_GCF_005153645.1
  0.0000	2	2	subspecies	11770	                RS_GCF_011045475.1
  0.0000	2	2	subspecies	9538	                RS_GCF_003112205.1
  0.0000	2	2	subspecies	22639	                GB_GCA_014170915.1
  0.0000	2	2	subspecies	8246	                RS_GCF_000220005.1
  0.0000	2	2	subspecies	8231	                RS_GCF_002943855.1
  0.0000	2	2	subspecies	12175	                RS_GCF_000012025.1
  0.0000	2	2	subspecies	9479	                GB_GCA_003018015.1
  0.0000	2	2	subspecies	10316	                RS_GCF_900635895.1
  0.0000	1	1	subspecies	18128	                RS_GCF_002741595.1
  0.0000	1	1	subspecies	22345	                RS_GCF_013201215.1
  0.0000	1	1	subspecies	22220	                RS_GCF_014169195.1
  0.0000	1	1	subspecies	18040	                RS_GCF_014217095.1
  0.0000	1	1	subspecies	22383	                RS_GCF_002951775.1
  0.0000	1	1	subspecies	22127	                RS_GCF_003018855.1
  0.0000	1	1	subspecies	18349	                RS_GCF_013085865.1
  0.0000	1	1	subspecies	18395	                RS_GCF_011404755.1
  0.0000	1	1	subspecies	18404	                RS_GCF_004801575.1
  0.0000	1	1	subspecies	17895	                RS_GCF_002741275.1
  0.0000	1	1	subspecies	17825	                RS_GCF_005156265.1
  0.0000	1	1	subspecies	17793	                RS_GCF_010231685.1
  0.0000	1	1	subspecies	22377	                RS_GCF_003627195.1
  0.0000	1	1	subspecies	21594	                RS_GCF_003956465.1
  0.0000	1	1	subspecies	22394	                RS_GCF_002741515.1
  0.0000	1	1	subspecies	17714	                RS_GCF_001901445.1
  0.0000	1	1	subspecies	22487	                RS_GCF_002764175.1
  0.0000	1	1	subspecies	22513	                RS_GCF_012934675.1
  0.0000	1	1	subspecies	17537	                RS_GCF_009720605.1
  0.0000	1	1	subspecies	22603	                RS_GCF_002950355.1
  0.0000	1	1	subspecies	17479	                RS_GCF_000013585.1
  0.0000	1	1	subspecies	22636	                RS_GCF_002156845.1
  0.0000	1	1	subspecies	17371	                RS_GCF_002950215.1
  0.0000	1	1	subspecies	17314	                RS_GCF_002741435.1
  0.0000	1	1	subspecies	22667	                RS_GCF_004116595.1
  0.0000	1	1	subspecies	20637	                RS_GCF_002163955.1
  0.0000	1	1	subspecies	19103	                RS_GCF_001900555.1
  0.0000	1	1	subspecies	20875	                RS_GCF_002950155.1
  0.0000	1	1	subspecies	19137	                RS_GCF_013201255.1
  0.0000	1	1	subspecies	19157	                RS_GCF_001900965.1
  0.0000	1	1	subspecies	19224	                GB_GCA_013146805.1
  0.0000	1	1	subspecies	19338	                RS_GCF_900474445.1
  0.0000	1	1	subspecies	19444	                RS_GCF_001901005.1
  0.0000	1	1	subspecies	20647	                RS_GCF_000968515.1
  0.0000	1	1	subspecies	19080	                RS_GCF_009914295.1
  0.0000	1	1	subspecies	20561	                RS_GCF_014117405.1
  0.0000	1	1	subspecies	20163	                RS_GCF_009650035.1
  0.0000	1	1	subspecies	20158	                RS_GCF_004358385.1
  0.0000	1	1	subspecies	20134	                RS_GCF_013166915.1
  0.0000	1	1	subspecies	15492	                RS_GCF_014169275.1
  0.0000	1	1	subspecies	19926	                GB_GCA_002950315.1
  0.0000	1	1	subspecies	19976	                RS_GCF_003443795.1
  0.0000	1	1	subspecies	19995	                RS_GCF_002934025.1
  0.0000	1	1	subspecies	21487	                RS_GCF_013340825.1
  0.0000	1	1	subspecies	21979	                RS_GCF_012537835.1
  0.0000	1	1	subspecies	18527	                RS_GCF_013376575.1
  0.0000	1	1	subspecies	21959	                RS_GCF_013456775.1
  0.0000	1	1	subspecies	21788	                RS_GCF_001682305.2
  0.0000	1	1	subspecies	21720	                RS_GCF_014216415.1
  0.0000	1	1	subspecies	21586	                RS_GCF_009949705.1
  0.0000	1	1	subspecies	18671	                RS_GCF_000765435.1
  0.0000	1	1	subspecies	18689	                RS_GCF_900474625.1
  0.0000	1	1	subspecies	22087	                RS_GCF_002741255.1
  0.0000	1	1	subspecies	21179	                RS_GCF_002855325.1
  0.0000	1	1	subspecies	18754	                RS_GCF_008761535.2
  0.0000	1	1	subspecies	18943	                RS_GCF_009951245.1
  0.0000	1	1	subspecies	18964	                RS_GCF_002844165.1
  0.0000	1	1	subspecies	21075	                RS_GCF_003018575.1
  0.0000	1	1	subspecies	21056	                RS_GCF_000166535.2
  0.0000	1	1	subspecies	20991	                RS_GCF_900635175.1
  0.0000	1	1	subspecies	20916	                RS_GCF_003031775.1
  0.0000	1	1	subspecies	11348	                RS_GCF_002393365.1
  0.0000	1	1	subspecies	10479	                RS_GCF_003018215.1
  0.0000	1	1	subspecies	10626	                RS_GCF_002996665.1
  0.0000	1	1	subspecies	10695	                RS_GCF_013391825.1
  0.0000	1	1	subspecies	10705	                RS_GCF_001901315.1
  0.0000	1	1	subspecies	10817	                RS_GCF_001455385.1
  0.0000	1	1	subspecies	10885	                RS_GCF_000819645.1
  0.0000	1	1	subspecies	11050	                RS_GCF_004006545.1
  0.0000	1	1	subspecies	11106	                RS_GCF_011404895.1
  0.0000	1	1	subspecies	11172	                RS_GCF_002077195.1
  0.0000	1	1	subspecies	11240	                RS_GCF_003017885.1
  0.0000	1	1	subspecies	11244	                RS_GCF_003030025.1
  0.0000	1	1	subspecies	11265	                GB_GCA_014216455.1
  0.0000	1	1	subspecies	10417	                RS_GCF_002968935.1
  0.0000	1	1	subspecies	11363	                RS_GCF_014216935.1
  0.0000	1	1	subspecies	11384	                RS_GCF_003956165.1
  0.0000	1	1	subspecies	11540	                RS_GCF_011045455.1
  0.0000	1	1	subspecies	11625	                RS_GCF_002946695.1
  0.0000	1	1	subspecies	11643	                RS_GCF_000026245.1
  0.0000	1	1	subspecies	11717	                RS_GCF_009952125.1
  0.0000	1	1	subspecies	11749	                RS_GCF_900497095.1
  0.0000	1	1	subspecies	11786	                RS_GCF_000831565.1
  0.0000	1	1	subspecies	11836	                RS_GCF_008124285.1
  0.0000	1	1	subspecies	12065	                RS_GCF_011044235.1
  0.0000	1	1	subspecies	12343	                RS_GCF_013394515.1
  0.0000	1	1	subspecies	12365	                RS_GCF_002011945.1
  0.0000	1	1	subspecies	9691	                RS_GCF_002180095.1
  0.0000	1	1	subspecies	8126	                RS_GCF_002949695.1
  0.0000	1	1	subspecies	8270	                RS_GCF_003017455.1
  0.0000	1	1	subspecies	8293	                RS_GCF_003112165.1
  0.0000	1	1	subspecies	8518	                RS_GCF_900636245.1
  0.0000	1	1	subspecies	8530	                RS_GCF_003667425.1
  0.0000	1	1	subspecies	8750	                RS_GCF_000212715.2
  0.0000	1	1	subspecies	8935	                RS_GCF_008727235.1
  0.0000	1	1	subspecies	9077	                RS_GCF_013085185.1
  0.0000	1	1	subspecies	9229	                RS_GCF_009913455.1
  0.0000	1	1	subspecies	9265	                RS_GCF_000010385.1
  0.0000	1	1	subspecies	9268	                GB_GCA_003018435.1
  0.0000	1	1	subspecies	9423	                RS_GCF_001900615.1
  0.0000	1	1	subspecies	12366	                RS_GCF_002863885.1
  0.0000	1	1	subspecies	9743	                RS_GCF_012221565.1
  0.0000	1	1	subspecies	9748	                RS_GCF_014295295.1
  0.0000	1	1	subspecies	9778	                RS_GCF_003367575.1
  0.0000	1	1	subspecies	9792	                RS_GCF_005037715.1
  0.0000	1	1	subspecies	9820	                RS_GCF_900636125.1
  0.0000	1	1	subspecies	9877	                RS_GCF_009648495.1
  0.0000	1	1	subspecies	10021	                RS_GCF_013167035.1
  0.0000	1	1	subspecies	10136	                RS_GCF_014075475.1
  0.0000	1	1	subspecies	10141	                RS_GCF_013282315.1
  0.0000	1	1	subspecies	10144	                RS_GCF_003667405.1
  0.0000	1	1	subspecies	10244	                RS_GCF_002949175.1
  0.0000	1	1	subspecies	10355	                RS_GCF_000801165.1
  0.0000	1	1	subspecies	15876	                RS_GCF_003956245.1
  0.0000	1	1	subspecies	15196	                RS_GCF_002741215.1
  0.0000	1	1	subspecies	15374	                RS_GCF_001900455.1
  0.0000	1	1	subspecies	15414	                RS_GCF_000599645.1
  0.0000	1	1	subspecies	8113	                RS_GCF_013364115.1
  0.0000	1	1	subspecies	15517	                RS_GCF_900618295.1
  0.0000	1	1	subspecies	15528	                RS_GCF_014216435.1
  0.0000	1	1	subspecies	15539	                GB_GCA_002949895.1
  0.0000	1	1	subspecies	15569	                RS_GCF_004328685.1
  0.0000	1	1	subspecies	15695	                RS_GCF_003956185.1
  0.0000	1	1	subspecies	15767	                RS_GCF_013315995.1
  0.0000	1	1	subspecies	15844	                RS_GCF_013374315.1
  0.0000	1	1	subspecies	15852	                RS_GCF_003018875.1
  0.0000	1	1	subspecies	15145	                GB_GCA_009873435.1
  0.0000	1	1	subspecies	16186	                RS_GCF_003112145.1
  0.0000	1	1	subspecies	16294	                RS_GCF_002811555.3
  0.0000	1	1	subspecies	16359	                GB_GCA_009729995.1
  0.0000	1	1	subspecies	16396	                RS_GCF_004006575.1
  0.0000	1	1	subspecies	16687	                RS_GCF_004792495.1
  0.0000	1	1	subspecies	16843	                RS_GCF_003413625.1
  0.0000	1	1	subspecies	16851	                RS_GCF_900636195.1
  0.0000	1	1	subspecies	16955	                RS_GCF_003018795.1
  0.0000	1	1	subspecies	16962	                RS_GCF_001888075.1
  0.0000	1	1	subspecies	17004	                RS_GCF_003018515.1
  0.0000	1	1	subspecies	17029	                RS_GCF_009867015.2
  0.0000	1	1	subspecies	17202	                GB_GCA_002290265.1
  0.0000	1	1	subspecies	13489	                RS_GCF_003031225.1
  0.0000	1	1	subspecies	12517	                RS_GCF_014216915.1
  0.0000	1	1	subspecies	12580	                RS_GCF_900520285.1
  0.0000	1	1	subspecies	12801	                GB_GCA_014216735.1
  0.0000	1	1	subspecies	12869	                GB_GCA_002290225.1
  0.0000	1	1	subspecies	12911	                GB_GCA_009738345.1
  0.0000	1	1	subspecies	12974	                RS_GCF_002494365.2
  0.0000	1	1	subspecies	13103	                RS_GCF_002057355.1
  0.0000	1	1	subspecies	13144	                RS_GCF_002950075.1
  0.0000	1	1	subspecies	13260	                RS_GCF_012974525.1
  0.0000	1	1	subspecies	13381	                RS_GCF_902810365.1
  0.0000	1	1	subspecies	13429	                RS_GCF_008727255.1
  0.0000	1	1	subspecies	13442	                RS_GCF_001900575.1
  0.0000	1	1	subspecies	17269	                RS_GCF_004135815.1
  0.0000	1	1	subspecies	13596	                RS_GCF_003336405.1
  0.0000	1	1	subspecies	13786	                RS_GCF_002945135.3
  0.0000	1	1	subspecies	13826	                RS_GCF_014216675.1
  0.0000	1	1	subspecies	14105	                RS_GCF_011383205.1
  0.0000	1	1	subspecies	14199	                RS_GCF_004116935.1
  0.0000	1	1	subspecies	14309	                RS_GCF_900636595.1
  0.0000	1	1	subspecies	14620	                RS_GCF_003971215.1
  0.0000	1	1	subspecies	14627	                GB_GCA_002150905.1
  0.0000	1	1	subspecies	14839	                RS_GCF_900096825.1
  0.0000	1	1	subspecies	14892	                RS_GCF_002201835.1
  0.0000	1	1	subspecies	15017	                RS_GCF_003956365.1
  0.0000	1	1	subspecies	15096	                RS_GCF_003017955.1
  0.0000	3	0	species	164599	              s__Escherichia sp005843885
  0.0000	3	3	subspecies	164623	                RS_GCF_005843885.1
  0.5042	73800	69	genus	191479	            g__Buchnera
  0.0840	12302	7	species	238262	              s__Buchnera aphidicola_R
  0.0420	6149	6149	subspecies	238263	                GB_GCA_011752455.1
  0.0420	6146	6146	subspecies	238264	                RS_GCF_005083345.1
  0.0840	12294	12234	species	254894	              s__Buchnera aphidicola_J
  0.0003	40	40	subspecies	254896	                RS_GCF_900128595.1
  0.0001	20	20	subspecies	254895	                RS_GCF_900699025.1
  0.0840	12291	11961	species	241908	              s__Buchnera aphidicola_O
  0.0015	223	223	subspecies	241909	                RS_GCF_003099975.1
  0.0007	107	107	subspecies	241910	                RS_GCF_000007365.1
  0.0839	12280	11967	species	208705	              s__Buchnera aphidicola_C
  0.0016	238	238	subspecies	208708	                RS_GCF_000521585.1
  0.0004	57	57	subspecies	208706	                RS_GCF_000521545.1
  0.0001	11	11	subspecies	208710	                RS_GCF_000521525.1
  0.0000	7	7	subspecies	208709	                RS_GCF_000521565.1
  0.0839	12279	6728	species	253594	              s__Buchnera aphidicola_AZ
  0.0193	2819	2819	subspecies	253595	                RS_GCF_013394915.1
  0.0187	2732	2732	subspecies	253596	                RS_GCF_009068925.1
  0.0839	12278	11625	species	235112	              s__Buchnera aphidicola_U
  0.0024	344	344	subspecies	235114	                RS_GCF_013487785.1
  0.0021	309	309	subspecies	235113	                RS_GCF_005082145.1
  0.0000	2	0	species	289249	              s__Buchnera aphidicola_B
  0.0000	2	2	subspecies	289250	                RS_GCF_000225465.1
  0.0000	1	0	species	259063	              s__Buchnera aphidicola_BB
  0.0000	1	1	subspecies	259064	                RS_GCF_009069125.1
  0.0000	1	0	species	266877	              s__Buchnera aphidicola_AK
  0.0000	1	1	subspecies	266878	                RS_GCF_005082825.1
  0.0000	1	0	species	291392	              s__Buchnera aphidicola_AI
  0.0000	1	1	subspecies	291393	                RS_GCF_900698975.1
  0.0000	1	0	species	297458	              s__Buchnera aphidicola_AO
  0.0000	1	1	subspecies	297459	                RS_GCF_005080845.1
  0.0000	1	0	species	314873	              s__Buchnera aphidicola_AL
  0.0000	1	1	subspecies	314874	                RS_GCF_003671935.1
  0.4738	69343	1578	genus	133670	            g__Citrobacter
  0.0803	11754	4893	species	168703	              s__Citrobacter youngae
  0.0236	3448	3448	subspecies	168727	                RS_GCF_003665575.1
  0.0232	3390	3390	subspecies	168717	                RS_GCF_001559235.2
  0.0002	23	23	subspecies	168731	                RS_GCF_900638065.1
  0.0793	11606	5797	species	163856	              s__Citrobacter gillenii
  0.0294	4305	4305	subspecies	163857	                RS_GCF_013815045.1
  0.0101	1481	1481	subspecies	163858	                RS_GCF_013792125.1
  0.0000	4	4	subspecies	163889	                RS_GCF_004792475.1
  0.0000	4	4	subspecies	163890	                RS_GCF_013785085.1
  0.0000	3	3	subspecies	163870	                RS_GCF_013925325.1
  0.0000	2	2	subspecies	163859	                RS_GCF_013821695.1
  0.0000	2	2	subspecies	163860	                RS_GCF_013784225.1
  0.0000	2	2	subspecies	163876	                RS_GCF_013801705.1
  0.0000	2	2	subspecies	163884	                RS_GCF_013786205.1
  0.0000	1	1	subspecies	163869	                RS_GCF_013828645.1
  0.0000	1	1	subspecies	163873	                RS_GCF_013745755.1
  0.0000	1	1	subspecies	163887	                RS_GCF_013726215.1
  0.0000	1	1	subspecies	163894	                RS_GCF_013738135.1
  0.0790	11567	8728	species	183894	              s__Citrobacter europaeus
  0.0104	1522	1522	subspecies	183897	                RS_GCF_002786865.1
  0.0089	1304	1304	subspecies	183895	                RS_GCF_002073755.2
  0.0000	7	7	subspecies	183903	                RS_GCF_013614655.1
  0.0000	3	3	subspecies	183905	                RS_GCF_001922445.1
  0.0000	1	1	subspecies	183899	                RS_GCF_013267145.1
  0.0000	1	1	subspecies	183902	                RS_GCF_902387635.1
  0.0000	1	1	subspecies	183904	                RS_GCF_013798115.1
  0.0762	11147	8775	species	146646	              s__Citrobacter braakii
  0.0146	2138	2138	subspecies	146647	                RS_GCF_009648935.1
  0.0011	160	160	subspecies	146654	                RS_GCF_013727235.1
  0.0001	15	15	subspecies	146754	                RS_GCF_013615435.1
  0.0001	9	9	subspecies	146755	                RS_GCF_013747755.1
  0.0001	8	8	subspecies	146738	                RS_GCF_013797345.1
  0.0000	5	5	subspecies	146707	                RS_GCF_013816515.1
  0.0000	5	5	subspecies	146697	                RS_GCF_002208845.2
  0.0000	4	4	subspecies	146658	                GB_GCA_013728515.1
  0.0000	3	3	subspecies	146715	                RS_GCF_013738915.1
  0.0000	3	3	subspecies	146669	                RS_GCF_002903215.1
  0.0000	3	3	subspecies	146743	                RS_GCF_013784065.1
  0.0000	3	3	subspecies	146744	                RS_GCF_012524235.2
  0.0000	3	3	subspecies	146751	                RS_GCF_013458095.1
  0.0000	2	2	subspecies	146682	                RS_GCF_013781945.1
  0.0000	2	2	subspecies	146681	                RS_GCF_013728095.1
  0.0000	2	2	subspecies	146670	                RS_GCF_013739755.1
  0.0000	2	2	subspecies	146737	                RS_GCF_013783065.1
  0.0000	1	1	subspecies	146757	                RS_GCF_013781985.1
  0.0000	1	1	subspecies	146749	                RS_GCF_013814485.1
  0.0000	1	1	subspecies	146748	                GB_GCA_013733095.1
  0.0000	1	1	subspecies	146723	                RS_GCF_013741155.1
  0.0000	1	1	subspecies	146687	                RS_GCF_013786345.1
  0.0742	10856	5637	species	165013	              s__Citrobacter werkmanii
  0.0183	2682	2682	subspecies	165025	                RS_GCF_008693645.1
  0.0167	2448	2448	subspecies	165024	                RS_GCF_003204265.1
  0.0005	69	69	subspecies	165048	                RS_GCF_002025225.1
  0.0001	11	11	subspecies	165046	                RS_GCF_003665555.1
  0.0001	9	9	subspecies	165045	                RS_GCF_000648515.1
  0.0733	10736	8869	species	152383	              s__Citrobacter portucalensis
  0.0122	1784	1784	subspecies	152387	                RS_GCF_002903305.1
  0.0001	17	17	subspecies	152447	                RS_GCF_013724765.1
  0.0001	8	8	subspecies	152391	                RS_GCF_001281005.1
  0.0000	7	7	subspecies	152461	                GB_GCA_013899035.1
  0.0000	7	7	subspecies	152452	                RS_GCF_004801555.1
  0.0000	7	7	subspecies	152445	                GB_GCA_002215605.1
  0.0000	7	7	subspecies	152393	                GB_GCA_013826265.1
  0.0000	6	6	subspecies	152437	                RS_GCF_003255895.1
  0.0000	5	5	subspecies	152448	                GB_GCA_013899425.1
  0.0000	5	5	subspecies	152394	                GB_GCA_013826505.1
  0.0000	4	4	subspecies	152402	                GB_GCA_013899325.1
  0.0000	3	3	subspecies	152439	                GB_GCA_009856695.1
  0.0000	2	2	subspecies	152410	                RS_GCF_900636015.1
  0.0000	2	2	subspecies	152395	                RS_GCF_008693605.1
  0.0000	1	1	subspecies	152411	                GB_GCA_013899405.1
  0.0000	1	1	subspecies	152415	                RS_GCF_009730355.1
  0.0000	1	1	subspecies	152417	                RS_GCF_010319905.2
  0.0006	92	48	species	133671	              s__Citrobacter freundii
  0.0000	5	5	subspecies	133871	                RS_GCF_002215385.1
  0.0000	5	5	subspecies	133866	                RS_GCF_003571565.1
  0.0000	4	4	subspecies	133749	                RS_GCF_001702455.1
  0.0000	4	4	subspecies	133778	                RS_GCF_013748855.1
  0.0000	4	4	subspecies	133806	                RS_GCF_013791615.1
  0.0000	2	2	subspecies	133702	                RS_GCF_013782845.1
  0.0000	2	2	subspecies	133814	                RS_GCF_900520375.1
  0.0000	1	1	subspecies	133926	                RS_GCF_013786565.1
  0.0000	1	1	subspecies	133672	                RS_GCF_003665655.1
  0.0000	1	1	subspecies	133898	                RS_GCF_003019835.1
  0.0000	1	1	subspecies	133889	                RS_GCF_013589875.1
  0.0000	1	1	subspecies	133888	                RS_GCF_002211705.1
  0.0000	1	1	subspecies	133874	                RS_GCF_013899365.1
  0.0000	1	1	subspecies	133873	                GB_GCA_900635425.1
  0.0000	1	1	subspecies	133863	                RS_GCF_013731955.1
  0.0000	1	1	subspecies	133840	                RS_GCF_000783755.2
  0.0000	1	1	subspecies	133823	                RS_GCF_013751655.1
  0.0000	1	1	subspecies	133822	                RS_GCF_006385635.1
  0.0000	1	1	subspecies	133820	                RS_GCF_013751895.1
  0.0000	1	1	subspecies	133805	                RS_GCF_004103775.1
  0.0000	1	1	subspecies	133802	                RS_GCF_013739375.1
  0.0000	1	1	subspecies	133792	                RS_GCF_013726615.1
  0.0000	1	1	subspecies	133774	                RS_GCF_003665675.1
  0.0000	1	1	subspecies	133766	                RS_GCF_013390245.1
  0.0000	1	1	subspecies	133751	                RS_GCF_013781965.1
  0.0000	6	0	species	250226	              s__Citrobacter freundii_E
  0.0000	6	6	subspecies	250227	                RS_GCF_004353845.1
  0.0000	1	0	species	318278	              s__Citrobacter sp004684345
  0.0000	1	1	subspecies	318279	                RS_GCF_004684345.1
  0.4165	60962	201	genus	148806	            g__Pantoea
  0.0834	12213	8939	species	154940	              s__Pantoea ananatis
  0.0110	1608	1608	subspecies	154942	                RS_GCF_000283875.1
  0.0105	1536	1536	subspecies	154954	                RS_GCF_000270125.2
  0.0003	49	49	subspecies	154999	                RS_GCF_013364135.1
  0.0003	46	46	subspecies	154967	                RS_GCF_003184965.2
  0.0001	8	8	subspecies	154971	                RS_GCF_004028255.1
  0.0001	8	8	subspecies	154991	                RS_GCF_002952035.2
  0.0000	6	6	subspecies	154981	                RS_GCF_001543055.1
  0.0000	5	5	subspecies	154982	                RS_GCF_002224585.2
  0.0000	4	4	subspecies	154972	                RS_GCF_000025405.2
  0.0000	4	4	subspecies	154977	                RS_GCF_000233595.1
  0.0833	12199	6552	species	181735	              s__Pantoea eucalypti
  0.0195	2861	2861	subspecies	181742	                RS_GCF_009646115.1
  0.0189	2764	2764	subspecies	181741	                RS_GCF_014495885.1
  0.0002	22	22	subspecies	181745	                RS_GCF_003203695.1
  0.0833	12197	908	species	185298	              s__Pantoea vagans
  0.0386	5645	5645	subspecies	185299	                RS_GCF_001558735.2
  0.0385	5632	5632	subspecies	185300	                RS_GCF_004792415.1
  0.0001	9	9	subspecies	185305	                RS_GCF_003032455.1
  0.0000	3	3	subspecies	185301	                RS_GCF_000148935.1
  0.0831	12167	1759	species	176274	              s__Pantoea stewartii
  0.0356	5215	5215	subspecies	176279	                RS_GCF_011044475.1
  0.0355	5193	5193	subspecies	176285	                RS_GCF_002082215.1
  0.0818	11977	58	species	167246	              s__Pantoea dispersa
  0.0416	6090	6090	subspecies	167268	                RS_GCF_000180175.2
  0.0398	5829	5829	subspecies	167247	                RS_GCF_009362975.1
  0.0000	5	0	species	179347	              s__Pantoea eucrina
  0.0000	5	5	subspecies	179350	                RS_GCF_000784875.1
  0.0000	3	1	species	148807	              s__Pantoea agglomerans
  0.0000	1	1	subspecies	148814	                RS_GCF_003860325.1
  0.0000	1	1	subspecies	148878	                RS_GCF_003704305.1
  0.3349	49016	624	genus	156294	            g__Pectobacterium
  0.0833	12193	9860	species	185311	              s__Pectobacterium atrosepticum
  0.0151	2216	2216	subspecies	185317	                RS_GCF_000011605.1
  0.0007	97	97	subspecies	185316	                RS_GCF_000740965.1
  0.0001	13	13	subspecies	185318	                RS_GCF_002804265.1
  0.0000	7	7	subspecies	185319	                RS_GCF_000696465.1
  0.0831	12157	11989	species	174937	              s__Pectobacterium parmentieri
  0.0006	82	82	subspecies	174939	                RS_GCF_003628675.1
  0.0004	52	52	subspecies	174941	                RS_GCF_003628695.1
  0.0001	15	15	subspecies	174956	                RS_GCF_000260925.1
  0.0001	12	12	subspecies	174942	                RS_GCF_009931535.1
  0.0000	3	3	subspecies	174943	                RS_GCF_003628635.1
  0.0000	3	3	subspecies	174949	                RS_GCF_000024645.1
  0.0000	1	1	subspecies	174946	                RS_GCF_003628575.1
  0.0821	12022	2741	species	163976	              s__Pectobacterium brasiliense
  0.0321	4704	4704	subspecies	163981	                RS_GCF_000294535.1
  0.0310	4531	4531	subspecies	163979	                RS_GCF_002764035.1
  0.0002	32	32	subspecies	163988	                RS_GCF_009873295.1
  0.0000	7	7	subspecies	163993	                RS_GCF_001932635.1
  0.0000	6	6	subspecies	163995	                GB_GCA_009931555.1
  0.0000	1	1	subspecies	164001	                RS_GCF_002068115.1
  0.0818	11970	702	species	176456	              s__Pectobacterium polaris
  0.0386	5652	5652	subspecies	176458	                RS_GCF_002288545.1
  0.0383	5602	5602	subspecies	176463	                RS_GCF_002307355.1
  0.0001	14	14	subspecies	176474	                RS_GCF_009931575.1
  0.0003	42	20	species	156295	              s__Pectobacterium carotovorum
  0.0000	7	7	subspecies	156319	                RS_GCF_003031305.1
  0.0000	6	6	subspecies	156322	                RS_GCF_000769535.1
  0.0000	3	3	subspecies	156298	                RS_GCF_003571485.1
  0.0000	2	2	subspecies	156304	                RS_GCF_009931295.1
  0.0000	2	2	subspecies	156317	                RS_GCF_009931195.1
  0.0000	1	1	subspecies	156344	                RS_GCF_003932035.1
  0.0000	1	1	subspecies	156348	                RS_GCF_009931215.1
  0.0000	6	0	species	212891	              s__Pectobacterium wasabiae
  0.0000	6	6	subspecies	212895	                RS_GCF_001742185.1
  0.0000	2	0	species	236614	              s__Pectobacterium punjabense
  0.0000	2	2	subspecies	236615	                RS_GCF_012427845.1
  0.3324	48657	5057	genus	34812	            g__Salmonella
  0.0820	11999	6360	species	168167	              s__Salmonella bongori
  0.0207	3026	3026	subspecies	168169	                RS_GCF_006051015.1
  0.0177	2597	2597	subspecies	168171	                RS_GCF_006113225.1
  0.0001	12	12	subspecies	168191	                RS_GCF_000709535.1
  0.0000	4	4	subspecies	168173	                RS_GCF_013138145.1
  0.0789	11552	9150	species	155628	              s__Salmonella arizonae
  0.0093	1358	1358	subspecies	155634	                GB_GCA_900635595.1
  0.0064	939	939	subspecies	155650	                RS_GCF_000018625.1
  0.0003	47	47	subspecies	155661	                RS_GCF_013162485.1
  0.0002	32	32	subspecies	155692	                GB_GCA_900478105.1
  0.0001	9	9	subspecies	155658	                RS_GCF_002234855.1
  0.0000	7	7	subspecies	155678	                GB_GCA_900635075.1
  0.0000	5	5	subspecies	155681	                RS_GCF_003324775.1
  0.0000	3	3	subspecies	155670	                RS_GCF_000756465.1
  0.0000	2	2	subspecies	155671	                RS_GCF_006364755.1
  0.0780	11415	5322	species	156929	              s__Salmonella houtenae
  0.0310	4531	4531	subspecies	156944	                RS_GCF_013162165.1
  0.0104	1519	1519	subspecies	156932	                GB_GCA_013161805.1
  0.0001	14	14	subspecies	156976	                RS_GCF_013162025.1
  0.0000	7	7	subspecies	156977	                RS_GCF_013348865.1
  0.0000	6	6	subspecies	156958	                RS_GCF_003325115.1
  0.0000	6	6	subspecies	156973	                RS_GCF_900635725.1
  0.0000	4	4	subspecies	156974	                RS_GCF_000251025.1
  0.0000	3	3	subspecies	156970	                RS_GCF_900478215.1
  0.0000	2	2	subspecies	156983	                RS_GCF_009648815.1
  0.0000	1	1	subspecies	156951	                RS_GCF_003325315.1
  0.0548	8027	7620	species	149875	              s__Salmonella diarizonae
  0.0011	158	158	subspecies	149882	                RS_GCF_002794415.1
  0.0009	130	130	subspecies	149881	                GB_GCA_003994555.1
  0.0002	30	30	subspecies	149929	                RS_GCF_002211865.1
  0.0002	28	28	subspecies	149967	                GB_GCA_900635675.1
  0.0001	16	16	subspecies	149946	                RS_GCF_900475895.1
  0.0001	15	15	subspecies	149949	                RS_GCF_003325035.1
  0.0001	11	11	subspecies	149919	                RS_GCF_003324815.1
  0.0000	6	6	subspecies	149939	                GB_GCA_003324895.1
  0.0000	3	3	subspecies	149896	                RS_GCF_003324755.1
  0.0000	3	3	subspecies	149942	                RS_GCF_002211825.1
  0.0000	2	2	subspecies	149885	                RS_GCF_003325215.1
  0.0000	2	2	subspecies	149911	                RS_GCF_900478155.1
  0.0000	1	1	subspecies	149894	                GB_GCA_013162305.1
  0.0000	1	1	subspecies	149958	                RS_GCF_014123145.1
  0.0000	1	1	subspecies	149963	                RS_GCF_004126495.1
  0.0041	607	352	species	34813	              s__Salmonella enterica
  0.0001	20	20	subspecies	39252	                GB_GCA_900635535.1
  0.0001	18	18	subspecies	37326	                RS_GCF_013161625.1
  0.0001	13	13	subspecies	46106	                RS_GCF_900477985.1
  0.0001	12	12	subspecies	35886	                RS_GCF_002234475.1
  0.0001	12	12	subspecies	36186	                RS_GCF_003324795.1
  0.0001	11	11	subspecies	42758	                GB_GCA_900478435.1
  0.0001	9	9	subspecies	45674	                GB_GCA_900635525.1
  0.0001	9	9	subspecies	37462	                GB_GCA_900635585.1
  0.0000	7	7	subspecies	36565	                GB_GCA_900635085.1
  0.0000	6	6	subspecies	45388	                GB_GCA_900635545.1
  0.0000	6	6	subspecies	36567	                GB_GCA_900635655.1
  0.0000	6	6	subspecies	43773	                GB_GCA_900635605.1
  0.0000	6	6	subspecies	36740	                GB_GCA_000272795.2
  0.0000	5	5	subspecies	36259	                RS_GCF_900478225.1
  0.0000	5	5	subspecies	43280	                RS_GCF_002211585.1
  0.0000	4	4	subspecies	36023	                GB_GCA_900478345.1
  0.0000	4	4	subspecies	40634	                GB_GCA_900635555.1
  0.0000	3	3	subspecies	37974	                GB_GCA_003931815.1
  0.0000	3	3	subspecies	41885	                GB_GCA_900635565.1
  0.0000	3	3	subspecies	43530	                GB_GCA_003296145.1
  0.0000	3	3	subspecies	39532	                RS_GCF_900478195.1
  0.0000	3	3	subspecies	36317	                GB_GCA_011302735.1
  0.0000	3	3	subspecies	42590	                GB_GCA_002208195.1
  0.0000	2	2	subspecies	40184	                RS_GCF_002386325.1
  0.0000	2	2	subspecies	42794	                RS_GCF_001441245.1
  0.0000	2	2	subspecies	39710	                RS_GCF_002504105.1
  0.0000	2	2	subspecies	41501	                RS_GCF_002238275.1
  0.0000	2	2	subspecies	42474	                GB_GCA_000626315.1
  0.0000	2	2	subspecies	39255	                GB_GCA_900635615.1
  0.0000	2	2	subspecies	35131	                GB_GCA_900636165.1
  0.0000	2	2	subspecies	39163	                RS_GCF_002211565.1
  0.0000	2	2	subspecies	38922	                GB_GCA_011302515.1
  0.0000	2	2	subspecies	38645	                GB_GCA_902825525.1
  0.0000	2	2	subspecies	35539	                RS_GCF_001975365.1
  0.0000	2	2	subspecies	44854	                GB_GCA_001597795.2
  0.0000	2	2	subspecies	36702	                GB_GCA_011301495.1
  0.0000	2	2	subspecies	36749	                RS_GCF_000271905.2
  0.0000	2	2	subspecies	44339	                RS_GCF_000486445.2
  0.0000	1	1	subspecies	45658	                RS_GCF_003030105.1
  0.0000	1	1	subspecies	42460	                RS_GCF_012169275.1
  0.0000	1	1	subspecies	46219	                RS_GCF_000625835.2
  0.0000	1	1	subspecies	35023	                GB_GCA_006740725.1
  0.0000	1	1	subspecies	46163	                RS_GCF_001409135.1
  0.0000	1	1	subspecies	46067	                RS_GCF_005890095.1
  0.0000	1	1	subspecies	45882	                GB_GCA_900635645.1
  0.0000	1	1	subspecies	42823	                RS_GCF_003325095.1
  0.0000	1	1	subspecies	43077	                RS_GCF_004136175.1
  0.0000	1	1	subspecies	45832	                RS_GCF_000272775.4
  0.0000	1	1	subspecies	45597	                RS_GCF_003571625.1
  0.0000	1	1	subspecies	43792	                RS_GCF_900635695.1
  0.0000	1	1	subspecies	45457	                RS_GCF_009729955.1
  0.0000	1	1	subspecies	43842	                RS_GCF_002762135.3
  0.0000	1	1	subspecies	45372	                GB_GCA_900478405.1
  0.0000	1	1	subspecies	44002	                RS_GCF_001448705.2
  0.0000	1	1	subspecies	44919	                RS_GCF_000624035.2
  0.0000	1	1	subspecies	44737	                RS_GCF_002863765.1
  0.0000	1	1	subspecies	44127	                RS_GCF_003325135.1
  0.0000	1	1	subspecies	44220	                RS_GCF_900477995.1
  0.0000	1	1	subspecies	44717	                GB_GCA_013344545.1
  0.0000	1	1	subspecies	37390	                RS_GCF_000020705.1
  0.0000	1	1	subspecies	38241	                RS_GCF_002224405.1
  0.0000	1	1	subspecies	38064	                RS_GCF_001975325.1
  0.0000	1	1	subspecies	38041	                RS_GCF_008386295.1
  0.0000	1	1	subspecies	37982	                RS_GCF_001975445.1
  0.0000	1	1	subspecies	37861	                GB_GCA_003994595.1
  0.0000	1	1	subspecies	37616	                GB_GCA_900635855.1
  0.0000	1	1	subspecies	37527	                GB_GCA_003994735.1
  0.0000	1	1	subspecies	37414	                GB_GCA_900478385.1
  0.0000	1	1	subspecies	38399	                RS_GCF_001104165.2
  0.0000	1	1	subspecies	37154	                RS_GCF_011057955.1
  0.0000	1	1	subspecies	37094	                RS_GCF_900086565.1
  0.0000	1	1	subspecies	36586	                RS_GCF_012273275.1
  0.0000	1	1	subspecies	36515	                GB_GCA_014218055.1
  0.0000	1	1	subspecies	36378	                GB_GCA_001278275.1
  0.0000	1	1	subspecies	36294	                RS_GCF_008244785.1
  0.0000	1	1	subspecies	35563	                GB_GCA_900635515.1
  0.0000	1	1	subspecies	42302	                RS_GCF_002946675.1
  0.0000	1	1	subspecies	39079	                RS_GCF_002761115.1
  0.0000	1	1	subspecies	39119	                RS_GCF_001188125.2
  0.0000	1	1	subspecies	39511	                GB_GCA_902825515.1
  0.0000	1	1	subspecies	39703	                RS_GCF_900477895.1
  0.0000	1	1	subspecies	39792	                GB_GCA_900478375.1
  0.0000	1	1	subspecies	39856	                RS_GCF_001975625.1
  0.0000	1	1	subspecies	40087	                RS_GCF_001975245.1
  0.0000	1	1	subspecies	40850	                RS_GCF_002234515.1
  0.0000	1	1	subspecies	40942	                GB_GCA_006402875.1
  0.0000	1	1	subspecies	40957	                RS_GCF_009664795.1
  0.0000	1	1	subspecies	40974	                RS_GCF_002234795.1
  0.0000	1	1	subspecies	41269	                RS_GCF_000626455.1
  0.0000	1	1	subspecies	41502	                RS_GCF_009664655.1
  0.0000	1	1	subspecies	41767	                RS_GCF_002234755.2
  0.0000	1	1	subspecies	42281	                GB_GCA_003994815.1
  0.3194	46753	3149	genus	46337	            g__Klebsiella
  0.0787	11516	6128	species	132889	              s__Klebsiella aerogenes
  0.0361	5286	5286	subspecies	132911	                RS_GCF_011067245.1
  0.0003	40	40	subspecies	133124	                RS_GCF_013925105.1
  0.0001	13	13	subspecies	132896	                RS_GCF_009732835.1
  0.0001	11	11	subspecies	132951	                GB_GCA_900635435.1
  0.0000	6	6	subspecies	132932	                RS_GCF_902164615.1
  0.0000	3	3	subspecies	133014	                RS_GCF_002591115.1
  0.0000	3	3	subspecies	132955	                RS_GCF_001021995.1
  0.0000	3	3	subspecies	132926	                RS_GCF_011604725.1
  0.0000	3	3	subspecies	132923	                RS_GCF_014169215.1
  0.0000	3	3	subspecies	132915	                RS_GCF_007632255.1
  0.0000	2	2	subspecies	132937	                RS_GCF_010509815.1
  0.0000	2	2	subspecies	132931	                RS_GCF_900637945.1
  0.0000	2	2	subspecies	133051	                RS_GCF_008931665.1
  0.0000	2	2	subspecies	133127	                RS_GCF_000334515.1
  0.0000	1	1	subspecies	132979	                RS_GCF_009732795.1
  0.0000	1	1	subspecies	133057	                RS_GCF_002796425.1
  0.0000	1	1	subspecies	133061	                RS_GCF_006874725.1
  0.0000	1	1	subspecies	133062	                RS_GCF_003546885.1
  0.0000	1	1	subspecies	133078	                RS_GCF_008727695.1
  0.0000	1	1	subspecies	133087	                RS_GCF_009909445.1
  0.0000	1	1	subspecies	133098	                RS_GCF_001571545.2
  0.0000	1	1	subspecies	133132	                RS_GCF_001559215.2
  0.0000	1	1	subspecies	133150	                RS_GCF_000215745.1
  0.0755	11047	10924	species	124778	              s__Klebsiella quasipneumoniae
  0.0001	10	10	subspecies	124844	                RS_GCF_014169135.1
  0.0001	9	9	subspecies	125069	                RS_GCF_013408885.1
  0.0001	8	8	subspecies	125170	                RS_GCF_009387795.1
  0.0001	8	8	subspecies	125135	                RS_GCF_003020825.1
  0.0000	7	7	subspecies	125025	                RS_GCF_008632435.1
  0.0000	6	6	subspecies	125059	                RS_GCF_013624775.1
  0.0000	6	6	subspecies	125282	                RS_GCF_014189265.1
  0.0000	6	6	subspecies	125123	                RS_GCF_014168875.1
  0.0000	6	6	subspecies	125095	                RS_GCF_902164625.1
  0.0000	6	6	subspecies	124892	                RS_GCF_014189245.1
  0.0000	5	5	subspecies	124991	                RS_GCF_901422025.1
  0.0000	5	5	subspecies	125232	                RS_GCF_900187335.1
  0.0000	5	5	subspecies	125191	                RS_GCF_900635925.1
  0.0000	5	5	subspecies	124940	                RS_GCF_003815095.1
  0.0000	4	4	subspecies	125116	                RS_GCF_003443835.1
  0.0000	3	3	subspecies	125129	                GB_GCA_900635945.1
  0.0000	3	3	subspecies	125192	                RS_GCF_014169255.1
  0.0000	3	3	subspecies	124817	                RS_GCF_004010915.1
  0.0000	3	3	subspecies	125165	                RS_GCF_013426775.1
  0.0000	3	3	subspecies	124948	                RS_GCF_014169495.1
  0.0000	2	2	subspecies	124987	                RS_GCF_013706815.1
  0.0000	2	2	subspecies	125042	                GB_GCA_014333295.1
  0.0000	2	2	subspecies	125263	                RS_GCF_003181175.1
  0.0000	1	1	subspecies	124882	                RS_GCF_001278905.1
  0.0000	1	1	subspecies	124798	                RS_GCF_002240335.1
  0.0000	1	1	subspecies	124960	                RS_GCF_003990375.1
  0.0000	1	1	subspecies	125217	                RS_GCF_014169355.1
  0.0000	1	1	subspecies	125016	                RS_GCF_003063705.1
  0.0000	1	1	subspecies	124816	                RS_GCF_002953295.1
  0.0734	10743	8910	species	126328	              s__Klebsiella variicola
  0.0059	865	865	subspecies	126339	                RS_GCF_900622615.1
  0.0056	816	816	subspecies	126355	                RS_GCF_003790505.1
  0.0002	35	35	subspecies	126568	                GB_GCA_901421915.1
  0.0001	18	18	subspecies	126508	                RS_GCF_010365565.1
  0.0001	14	14	subspecies	126446	                RS_GCF_001548315.1
  0.0001	9	9	subspecies	126645	                RS_GCF_902166725.1
  0.0001	8	8	subspecies	126688	                GB_GCA_000714635.1
  0.0000	6	6	subspecies	126384	                RS_GCF_003429625.1
  0.0000	6	6	subspecies	126525	                RS_GCF_008693465.1
  0.0000	6	6	subspecies	126585	                RS_GCF_009648975.1
  0.0000	6	6	subspecies	126715	                RS_GCF_900636185.1
  0.0000	5	5	subspecies	126493	                RS_GCF_000812205.2
  0.0000	5	5	subspecies	126504	                RS_GCF_000828055.2
  0.0000	4	4	subspecies	126449	                RS_GCF_002164805.3
  0.0000	4	4	subspecies	126761	                RS_GCF_900622595.1
  0.0000	4	4	subspecies	126749	                RS_GCF_902166565.1
  0.0000	3	3	subspecies	126443	                RS_GCF_900622625.1
  0.0000	3	3	subspecies	126382	                RS_GCF_000019565.1
  0.0000	3	3	subspecies	126696	                RS_GCF_014217415.1
  0.0000	2	2	subspecies	126765	                RS_GCF_014489395.1
  0.0000	2	2	subspecies	126680	                RS_GCF_000025465.1
  0.0000	2	2	subspecies	126669	                RS_GCF_012273075.1
  0.0000	2	2	subspecies	126542	                RS_GCF_013728275.1
  0.0000	2	2	subspecies	126518	                RS_GCF_004014895.1
  0.0000	1	1	subspecies	126609	                RS_GCF_011784425.1
  0.0000	1	1	subspecies	126732	                RS_GCF_002156765.1
  0.0000	1	1	subspecies	126417	                RS_GCF_003290425.1
  0.0679	9945	5705	species	172859	              s__Klebsiella quasivariicola
  0.0146	2133	2133	subspecies	172872	                RS_GCF_002186515.2
  0.0144	2107	2107	subspecies	172873	                RS_GCF_002269255.1
  0.0024	353	157	species	46338	              s__Klebsiella pneumoniae
  0.0001	10	10	subspecies	52818	                GB_GCA_011765425.1
  0.0000	6	6	subspecies	46880	                GB_GCA_900636095.1
  0.0000	6	6	subspecies	53228	                RS_GCF_001663455.1
  0.0000	5	5	subspecies	52486	                GB_GCA_009740225.1
  0.0000	5	5	subspecies	55028	                GB_GCA_009740085.1
  0.0000	5	5	subspecies	53824	                GB_GCA_009740025.1
  0.0000	4	4	subspecies	55939	                RS_GCF_005377825.1
  0.0000	4	4	subspecies	50736	                GB_GCA_011765385.1
  0.0000	4	4	subspecies	49697	                RS_GCF_003368345.1
  0.0000	4	4	subspecies	55182	                GB_GCA_901421965.1
  0.0000	4	4	subspecies	55043	                GB_GCA_000346145.1
  0.0000	3	3	subspecies	54171	                GB_GCA_900635975.1
  0.0000	3	3	subspecies	50992	                GB_GCA_007999005.1
  0.0000	3	3	subspecies	55338	                RS_GCF_004119975.1
  0.0000	3	3	subspecies	51164	                GB_GCA_900636025.1
  0.0000	3	3	subspecies	51852	                RS_GCF_003855315.1
  0.0000	3	3	subspecies	52119	                RS_GCF_003860645.1
  0.0000	3	3	subspecies	52767	                GB_GCA_009740245.1
  0.0000	3	3	subspecies	53113	                RS_GCF_002251875.2
  0.0000	3	3	subspecies	54710	                GB_GCA_003368025.1
  0.0000	3	3	subspecies	53232	                RS_GCF_012944055.1
  0.0000	3	3	subspecies	53974	                GB_GCA_009740065.1
  0.0000	2	2	subspecies	53107	                RS_GCF_003443755.1
  0.0000	2	2	subspecies	53076	                RS_GCF_005853785.1
  0.0000	2	2	subspecies	53437	                RS_GCF_008632935.2
  0.0000	2	2	subspecies	52321	                GB_GCA_009740045.1
  0.0000	2	2	subspecies	54270	                RS_GCF_003429545.1
  0.0000	2	2	subspecies	51983	                RS_GCF_008369685.1
  0.0000	2	2	subspecies	53927	                RS_GCF_003812105.1
  0.0000	2	2	subspecies	54031	                RS_GCF_013729075.1
  0.0000	2	2	subspecies	51038	                RS_GCF_001952835.1
  0.0000	2	2	subspecies	54182	                RS_GCF_008693425.1
  0.0000	2	2	subspecies	46620	                RS_GCF_013704985.1
  0.0000	2	2	subspecies	48380	                RS_GCF_003692695.1
  0.0000	2	2	subspecies	47369	                RS_GCF_006364295.1
  0.0000	2	2	subspecies	48836	                RS_GCF_002202195.1
  0.0000	1	1	subspecies	53938	                RS_GCF_002909775.1
  0.0000	1	1	subspecies	54499	                RS_GCF_005944305.1
  0.0000	1	1	subspecies	54426	                RS_GCF_000981845.1
  0.0000	1	1	subspecies	47199	                RS_GCF_900622605.1
  0.0000	1	1	subspecies	54252	                RS_GCF_014169375.1
  0.0000	1	1	subspecies	47282	                RS_GCF_002009075.1
  0.0000	1	1	subspecies	54085	                RS_GCF_013407605.1
  0.0000	1	1	subspecies	54064	                RS_GCF_012113615.1
  0.0000	1	1	subspecies	47481	                RS_GCF_002211665.1
  0.0000	1	1	subspecies	47507	                RS_GCF_003957455.1
  0.0000	1	1	subspecies	54526	                RS_GCF_001750805.1
  0.0000	1	1	subspecies	47522	                RS_GCF_901422065.1
  0.0000	1	1	subspecies	47549	                RS_GCF_012167385.1
  0.0000	1	1	subspecies	53697	                RS_GCF_003368365.1
  0.0000	1	1	subspecies	53591	                RS_GCF_013407965.1
  0.0000	1	1	subspecies	53444	                RS_GCF_004137665.1
  0.0000	1	1	subspecies	47839	                RS_GCF_009387815.1
  0.0000	1	1	subspecies	53430	                RS_GCF_000294365.1
  0.0000	1	1	subspecies	55114	                RS_GCF_003031325.1
  0.0000	1	1	subspecies	46615	                RS_GCF_008931565.1
  0.0000	1	1	subspecies	55853	                RS_GCF_011682835.2
  0.0000	1	1	subspecies	55794	                RS_GCF_011006575.1
  0.0000	1	1	subspecies	55792	                RS_GCF_000967845.1
  0.0000	1	1	subspecies	55590	                RS_GCF_013811845.1
  0.0000	1	1	subspecies	55423	                RS_GCF_001908515.1
  0.0000	1	1	subspecies	46937	                RS_GCF_009387775.1
  0.0000	1	1	subspecies	55337	                RS_GCF_002948565.1
  0.0000	1	1	subspecies	47120	                RS_GCF_013376555.1
  0.0000	1	1	subspecies	55135	                RS_GCF_001663195.1
  0.0000	1	1	subspecies	48165	                RS_GCF_013708685.1
  0.0000	1	1	subspecies	47161	                RS_GCF_002812665.1
  0.0000	1	1	subspecies	47176	                RS_GCF_003429065.3
  0.0000	1	1	subspecies	54964	                RS_GCF_002786755.1
  0.0000	1	1	subspecies	54907	                RS_GCF_005854025.1
  0.0000	1	1	subspecies	54891	                RS_GCF_000742755.1
  0.0000	1	1	subspecies	54857	                GB_GCA_008122305.1
  0.0000	1	1	subspecies	47189	                RS_GCF_001936035.1
  0.0000	1	1	subspecies	54655	                RS_GCF_003432185.1
  0.0000	1	1	subspecies	54628	                RS_GCF_003363735.1
  0.0000	1	1	subspecies	49667	                RS_GCF_001902335.1
  0.0000	1	1	subspecies	51838	                RS_GCF_000598005.1
  0.0000	1	1	subspecies	51786	                RS_GCF_002833465.1
  0.0000	1	1	subspecies	51778	                RS_GCF_013724605.1
  0.0000	1	1	subspecies	51747	                RS_GCF_001455995.1
  0.0000	1	1	subspecies	51585	                RS_GCF_014168655.1
  0.0000	1	1	subspecies	51482	                RS_GCF_009884395.1
  0.0000	1	1	subspecies	51432	                RS_GCF_003285145.1
  0.0000	1	1	subspecies	51363	                RS_GCF_003574235.1
  0.0000	1	1	subspecies	51350	                RS_GCF_000016305.1
  0.0000	1	1	subspecies	49468	                RS_GCF_002850275.3
  0.0000	1	1	subspecies	51145	                RS_GCF_013730675.1
  0.0000	1	1	subspecies	51093	                RS_GCF_003031345.1
  0.0000	1	1	subspecies	49755	                RS_GCF_003812085.1
  0.0000	1	1	subspecies	49764	                RS_GCF_013745295.1
  0.0000	1	1	subspecies	50922	                RS_GCF_013792545.1
  0.0000	1	1	subspecies	50916	                RS_GCF_004209795.1
  0.0000	1	1	subspecies	50778	                RS_GCF_000739495.1
  0.0000	1	1	subspecies	49832	                RS_GCF_013735895.1
  0.0000	1	1	subspecies	50564	                RS_GCF_001952915.1
  0.0000	1	1	subspecies	52338	                RS_GCF_013408505.1
  0.0000	1	1	subspecies	49865	                RS_GCF_007833555.1
  0.0000	1	1	subspecies	48330	                RS_GCF_009937845.1
  0.0000	1	1	subspecies	48551	                RS_GCF_012113655.1
  0.0000	1	1	subspecies	53033	                RS_GCF_010586985.1
  0.0000	1	1	subspecies	53025	                RS_GCF_002951595.1
  0.0000	1	1	subspecies	48780	                RS_GCF_002848605.1
  0.0000	1	1	subspecies	52661	                RS_GCF_003660205.1
  0.0000	1	1	subspecies	48841	                RS_GCF_003186535.1
  0.0000	1	1	subspecies	52463	                RS_GCF_001648215.1
  0.0000	1	1	subspecies	48005	                RS_GCF_006304565.1
  0.0000	1	1	subspecies	49060	                RS_GCF_007833575.1
  0.0000	1	1	subspecies	52293	                RS_GCF_011065345.1
  0.0000	1	1	subspecies	52224	                RS_GCF_002903005.1
  0.0000	1	1	subspecies	52186	                RS_GCF_006974165.1
  0.0000	1	1	subspecies	52181	                RS_GCF_012167215.1
  0.0000	1	1	subspecies	49189	                RS_GCF_900635125.1
  0.0000	1	1	subspecies	52003	                RS_GCF_013826045.1
  0.0000	1	1	subspecies	49244	                GB_GCA_011765405.1
  0.2488	36422	531	genus	172323	            g__Edwardsiella
  0.0828	12116	4985	species	176821	              s__Edwardsiella tarda
  0.0249	3647	3647	subspecies	176832	                RS_GCF_002504285.1
  0.0238	3484	3484	subspecies	176836	                RS_GCF_001011055.1
  0.0818	11976	8821	species	191878	              s__Edwardsiella ictaluri
  0.0209	3066	3066	subspecies	191883	                RS_GCF_002076875.1
  0.0006	86	86	subspecies	191881	                RS_GCF_003054425.1
  0.0000	3	3	subspecies	191884	                RS_GCF_000022885.2
  0.0805	11786	9559	species	190777	              s__Edwardsiella anguillarum
  0.0135	1971	1971	subspecies	190781	                RS_GCF_000800725.1
  0.0016	231	231	subspecies	190782	                RS_GCF_000264765.2
  0.0002	25	25	subspecies	190784	                RS_GCF_001186215.1
  0.0001	12	4	species	172324	              s__Edwardsiella piscicida
  0.0000	3	3	subspecies	172331	                RS_GCF_001729265.1
  0.0000	2	2	subspecies	172346	                RS_GCF_002075835.1
  0.0000	1	1	subspecies	172329	                GB_GCA_010061665.1
  0.0000	1	1	subspecies	172334	                RS_GCF_000348565.1
  0.0000	1	1	subspecies	172345	                RS_GCF_004153325.1
  0.0000	1	0	species	220908	              s__Edwardsiella hoshinae
  0.0000	1	1	subspecies	220909	                RS_GCF_001761405.1
  0.2468	36126	175	genus	178381	            g__Kosakonia
  0.0828	12118	2967	species	210336	              s__Kosakonia sacchari
  0.0316	4623	4623	subspecies	210338	                RS_GCF_000300455.3
  0.0309	4528	4528	subspecies	210337	                RS_GCF_001683395.1
  0.0825	12078	1500	species	208660	              s__Kosakonia sp000410515
  0.0361	5291	5291	subspecies	208662	                RS_GCF_009914275.1
  0.0361	5287	5287	subspecies	208663	                RS_GCF_000410515.1
  0.0802	11745	8018	species	182099	              s__Kosakonia radicincitans
  0.0132	1935	1935	subspecies	182104	                RS_GCF_900168185.1
  0.0121	1771	1771	subspecies	182105	                RS_GCF_000280495.2
  0.0001	15	15	subspecies	182110	                RS_GCF_001887675.1
  0.0000	6	6	subspecies	182111	                RS_GCF_008330085.1
  0.0001	9	0	species	234472	              s__Kosakonia sacchari_B
  0.0001	9	9	subspecies	234474	                GB_GCA_013085925.1
  0.0000	1	0	species	255774	              s__Kosakonia arachidis
  0.0000	1	1	subspecies	255776	                RS_GCF_009363135.1
  0.2465	36073	671	genus	132334	            g__Proteus
  0.0825	12069	8068	species	181182	              s__Proteus vulgaris
  0.0146	2130	2130	subspecies	181186	                RS_GCF_003812525.1
  0.0128	1871	1871	subspecies	181190	                RS_GCF_901472505.1
  0.0809	11842	756	species	225481	              s__Proteus sp003144505
  0.0384	5620	5620	subspecies	225482	                GB_GCA_013283955.1
  0.0373	5466	5466	subspecies	225483	                RS_GCF_009914335.1
  0.0782	11452	11270	species	178345	              s__Proteus cibarius
  0.0006	87	87	subspecies	178350	                RS_GCF_002591155.1
  0.0002	34	34	subspecies	178347	                RS_GCF_013171305.1
  0.0002	23	23	subspecies	178349	                RS_GCF_013122195.1
  0.0001	18	18	subspecies	178360	                RS_GCF_009856995.1
  0.0001	12	12	subspecies	178362	                GB_GCA_009931275.1
  0.0001	8	8	subspecies	178358	                RS_GCF_011045835.1
  0.0002	22	7	species	132335	              s__Proteus mirabilis
  0.0000	2	2	subspecies	132352	                RS_GCF_000783575.2
  0.0000	1	1	subspecies	132351	                RS_GCF_003855615.1
  0.0000	1	1	subspecies	132383	                RS_GCF_900635965.1
  0.0000	1	1	subspecies	132395	                RS_GCF_011149675.1
  0.0000	1	1	subspecies	132403	                RS_GCF_000444425.1
  0.0000	1	1	subspecies	132428	                RS_GCF_002180115.1
  0.0000	1	1	subspecies	132432	                RS_GCF_013256075.1
  0.0000	1	1	subspecies	132457	                RS_GCF_011383025.1
  0.0000	1	1	subspecies	132507	                RS_GCF_008705195.1
  0.0000	1	1	subspecies	132529	                RS_GCF_011045855.1
  0.0000	1	1	subspecies	132540	                RS_GCF_003204115.1
  0.0000	1	1	subspecies	132549	                RS_GCF_003073935.1
  0.0000	1	1	subspecies	132550	                RS_GCF_013255765.1
  0.0000	1	1	subspecies	132565	                RS_GCF_008630655.1
  0.0001	8	0	species	289622	              s__Proteus sp011046025
  0.0001	8	8	subspecies	289623	                RS_GCF_011046025.1
  0.0000	7	0	species	224292	              s__Proteus sp003144395
  0.0000	7	7	subspecies	224293	                RS_GCF_014250535.1
  0.0000	2	0	species	225257	              s__Proteus vulgaris_B
  0.0000	2	2	subspecies	225260	                RS_GCF_011045815.1
  0.2334	34165	665	genus	138118	            g__Klebsiella_A
  0.0778	11393	9705	species	146299	              s__Klebsiella_A oxytoca
  0.0101	1476	1476	subspecies	146301	                RS_GCF_013750595.1
  0.0005	71	71	subspecies	146303	                RS_GCF_900635105.1
  0.0003	45	45	subspecies	146375	                GB_GCA_900478285.1
  0.0003	39	39	subspecies	146347	                GB_GCA_902166465.1
  0.0001	21	21	subspecies	146355	                RS_GCF_003073975.1
  0.0001	16	16	subspecies	146314	                RS_GCF_013826985.1
  0.0001	10	10	subspecies	146369	                RS_GCF_002984395.1
  0.0000	7	7	subspecies	146351	                RS_GCF_003812925.1
  0.0000	2	2	subspecies	146337	                RS_GCF_900636985.1
  0.0000	1	1	subspecies	146317	                RS_GCF_001022115.1
  0.0753	11019	5216	species	190881	              s__Klebsiella_A huaxiensis
  0.0396	5795	5795	subspecies	190882	                RS_GCF_003261575.2
  0.0000	7	7	subspecies	190883	                RS_GCF_013736875.1
  0.0000	1	1	subspecies	190884	                RS_GCF_013705725.1
  0.0753	11017	4716	species	143069	              s__Klebsiella_A grimontii
  0.0378	5536	5536	subspecies	143071	                RS_GCF_003812845.1
  0.0048	708	708	subspecies	143073	                GB_GCA_013737895.1
  0.0002	23	23	subspecies	143122	                RS_GCF_013734595.1
  0.0001	9	9	subspecies	143215	                RS_GCF_013707575.1
  0.0000	4	4	subspecies	143213	                GB_GCA_003205795.1
  0.0000	3	3	subspecies	143076	                RS_GCF_013730235.1
  0.0000	3	3	subspecies	143078	                RS_GCF_013590775.1
  0.0000	2	2	subspecies	143221	                GB_GCA_902166735.1
  0.0000	2	2	subspecies	143219	                GB_GCA_013737205.1
  0.0000	2	2	subspecies	143211	                RS_GCF_002090195.1
  0.0000	2	2	subspecies	143119	                GB_GCA_902164675.1
  0.0000	1	1	subspecies	143143	                RS_GCF_013606065.1
  0.0000	1	1	subspecies	143152	                RS_GCF_013926505.1
  0.0000	1	1	subspecies	143167	                RS_GCF_013635015.1
  0.0000	1	1	subspecies	143127	                RS_GCF_009905335.1
  0.0000	1	1	subspecies	143101	                GB_GCA_013733775.1
  0.0000	1	1	subspecies	143094	                RS_GCF_902166545.1
  0.0000	1	1	subspecies	143088	                RS_GCF_901542455.1
  0.0005	70	23	species	138119	              s__Klebsiella_A michiganensis
  0.0001	8	8	subspecies	138198	                RS_GCF_002906435.1
  0.0000	5	5	subspecies	138239	                RS_GCF_010093005.1
  0.0000	4	4	subspecies	138264	                RS_GCF_003074075.1
  0.0000	3	3	subspecies	138127	                RS_GCF_013926025.1
  0.0000	3	3	subspecies	138227	                RS_GCF_002906395.1
  0.0000	2	2	subspecies	138133	                RS_GCF_002906415.1
  0.0000	2	2	subspecies	138153	                RS_GCF_004102625.1
  0.0000	2	2	subspecies	138176	                RS_GCF_002072655.1
  0.0000	2	2	subspecies	138125	                RS_GCF_009930855.1
  0.0000	2	2	subspecies	138293	                RS_GCF_902166415.1
  0.0000	2	2	subspecies	138209	                RS_GCF_002947505.1
  0.0000	2	2	subspecies	138255	                GB_GCA_902166425.1
  0.0000	2	2	subspecies	138228	                GB_GCA_013283995.1
  0.0000	2	2	subspecies	138231	                RS_GCF_008693565.1
  0.0000	1	1	subspecies	138322	                RS_GCF_902164635.1
  0.0000	1	1	subspecies	138230	                RS_GCF_013732655.1
  0.0000	1	1	subspecies	138217	                GB_GCA_902166555.1
  0.0000	1	1	subspecies	138210	                RS_GCF_000632415.1
  0.0000	1	1	subspecies	138205	                RS_GCF_000240325.1
  0.0000	1	1	subspecies	138182	                RS_GCF_013636415.1
  0.0000	1	0	species	296998	              s__Klebsiella_A oxytoca_C
  0.0000	1	1	subspecies	296999	                RS_GCF_009707385.1
  0.1672	24468	20	genus	143979	            g__Erwinia
  0.0836	12236	6423	species	214076	              s__Erwinia pyrifoliae
  0.0380	5562	5562	subspecies	214077	                RS_GCF_000165815.1
  0.0017	247	247	subspecies	214078	                RS_GCF_002952315.1
  0.0000	2	2	subspecies	214079	                RS_GCF_000027265.1
  0.0000	2	2	subspecies	214080	                RS_GCF_000026985.1
  0.0834	12208	2155	species	199572	              s__Erwinia billingiae
  0.0374	5473	5473	subspecies	199576	                RS_GCF_008728215.1
  0.0312	4571	4571	subspecies	199574	                RS_GCF_000196615.1
  0.0001	9	9	subspecies	199578	                RS_GCF_004551645.1
  0.0000	3	3	species	143980	              s__Erwinia amylovora
  0.0000	1	0	species	188056	              s__Erwinia persicina
  0.0000	1	1	subspecies	188065	                RS_GCF_003485445.1
  0.1655	24222	435	genus	127601	            g__Cronobacter
  0.0827	12103	2811	species	194035	              s__Cronobacter muytjensii
  0.0325	4752	4752	subspecies	194037	                RS_GCF_008932145.1
  0.0310	4540	4540	subspecies	194041	                RS_GCF_001277195.1
  0.0796	11650	10801	species	159251	              s__Cronobacter malonaticus
  0.0030	437	437	subspecies	159260	                RS_GCF_000504545.1
  0.0028	412	412	subspecies	159252	                RS_GCF_001277215.2
  0.0002	22	11	species	127602	              s__Cronobacter sakazakii
  0.0000	7	7	subspecies	127739	                RS_GCF_000982825.1
  0.0000	2	2	subspecies	128009	                RS_GCF_000263215.1
  0.0000	1	1	subspecies	127753	                RS_GCF_000339015.1
  0.0000	1	1	subspecies	127923	                RS_GCF_003955925.1
  0.0000	5	0	species	162643	              s__Cronobacter dublinensis
  0.0000	5	5	subspecies	162668	                RS_GCF_001277235.1
  0.0000	5	0	species	215900	              s__Cronobacter universalis
  0.0000	5	5	subspecies	215902	                RS_GCF_001277175.1
  0.0000	2	0	species	176621	              s__Cronobacter turicensis
  0.0000	2	2	subspecies	176636	                RS_GCF_000027065.2
  0.1616	23654	7	genus	190745	            g__Kluyvera
  0.0824	12058	854	species	224044	              s__Kluyvera georgiana_A
  0.0383	5608	5608	subspecies	224047	                RS_GCF_011765685.1
  0.0382	5596	5596	subspecies	224046	                GB_GCA_002211745.1
  0.0792	11588	7147	species	213813	              s__Kluyvera intermedia
  0.0303	4441	4441	subspecies	213814	                RS_GCF_900635475.1
  0.0000	1	0	species	190746	              s__Kluyvera ascorbata_B
  0.0000	1	1	subspecies	190749	                RS_GCF_014169755.1
  0.1581	23145	441	genus	151893	            g__Raoultella
  0.0805	11787	5894	species	155289	              s__Raoultella terrigena
  0.0198	2896	2896	subspecies	155302	                RS_GCF_012029655.1
  0.0197	2879	2879	subspecies	155291	                RS_GCF_900636285.1
  0.0004	55	55	subspecies	155322	                RS_GCF_000829965.1
  0.0003	47	47	subspecies	155326	                RS_GCF_900631595.1
  0.0001	16	16	subspecies	155325	                RS_GCF_902109485.1
  0.0744	10892	7733	species	163442	              s__Raoultella planticola
  0.0112	1634	1634	subspecies	163449	                RS_GCF_013462275.1
  0.0102	1497	1497	subspecies	163448	                RS_GCF_008694045.1
  0.0001	18	18	subspecies	163454	                RS_GCF_002906195.1
  0.0001	9	9	subspecies	163478	                RS_GCF_000783935.2
  0.0000	1	1	subspecies	163452	                RS_GCF_003699975.1
  0.0002	25	7	species	151894	              s__Raoultella ornithinolytica
  0.0001	8	8	subspecies	151915	                RS_GCF_001455225.1
  0.0000	6	6	subspecies	151919	                GB_GCA_900636135.1
  0.0000	2	2	subspecies	151971	                RS_GCF_014170855.1
  0.0000	1	1	subspecies	151969	                RS_GCF_003798165.1
  0.0000	1	1	subspecies	151975	                RS_GCF_013457615.1
  0.1557	22786	90	genus	151560	            g__Leclercia
  0.0801	11718	2821	species	183595	              s__Leclercia adecarboxylata_C
  0.0306	4475	4475	subspecies	183597	                RS_GCF_009734485.1
  0.0302	4422	4422	subspecies	183600	                RS_GCF_006874705.1
  0.0749	10965	4537	species	180467	              s__Leclercia sp002902985
  0.0277	4053	4053	subspecies	180471	                RS_GCF_003336325.1
  0.0159	2334	2334	subspecies	180470	                RS_GCF_002902985.1
  0.0002	28	28	subspecies	180478	                RS_GCF_009734465.1
  0.0001	8	8	subspecies	180481	                RS_GCF_003336345.1
  0.0000	5	5	subspecies	180477	                RS_GCF_009740165.1
  0.0001	10	8	species	151561	              s__Leclercia adecarboxylata
  0.0000	2	2	subspecies	151605	                GB_GCA_014489435.1
  0.0000	3	0	species	216974	              s__Leclercia adecarboxylata_A
  0.0000	3	3	subspecies	216978	                RS_GCF_006171285.1
  0.0840	12300	0	genus	179965	            g__Hamiltonella
  0.0840	12300	11785	species	179966	              s__Hamiltonella defensa
  0.0014	203	203	subspecies	179968	                RS_GCF_003122445.1
  0.0009	138	138	subspecies	179970	                RS_GCF_002777215.1
  0.0005	77	77	subspecies	179973	                RS_GCF_002285855.1
  0.0002	32	32	subspecies	179976	                RS_GCF_003590545.1
  0.0002	29	29	subspecies	179971	                RS_GCF_002777235.1
  0.0001	16	16	subspecies	179978	                RS_GCF_002269405.1
  0.0000	7	7	subspecies	179974	                RS_GCF_000021705.1
  0.0000	7	7	subspecies	179981	                RS_GCF_002777295.1
  0.0000	6	6	subspecies	179980	                RS_GCF_002777195.1
  0.0839	12282	0	genus	238099	            g__ATCC-39006
  0.0839	12282	12280	species	238100	              s__ATCC-39006 sp002847015
  0.0000	1	1	subspecies	238101	                RS_GCF_000463345.2
  0.0000	1	1	subspecies	238102	                RS_GCF_002847015.1
  0.0839	12278	0	genus	210493	            g__Leminorella
  0.0839	12278	12278	species	256146	              s__Leminorella richardii
  0.0838	12259	0	genus	208441	            g__Pragia
  0.0838	12259	2556	species	208442	              s__Pragia fontium
  0.0332	4865	4865	subspecies	208445	                RS_GCF_900638655.1
  0.0331	4838	4838	subspecies	208447	                RS_GCF_001026985.1
  0.0837	12249	122	genus	167696	            g__Hafnia
  0.0827	12112	3910	species	168791	              s__Hafnia alvei
  0.0402	5890	5890	subspecies	168797	                RS_GCF_001636255.1
  0.0157	2298	2298	subspecies	168793	                RS_GCF_002355555.1
  0.0000	7	7	subspecies	168808	                RS_GCF_004328605.1
  0.0000	5	5	subspecies	168802	                RS_GCF_000597785.2
  0.0000	2	2	subspecies	168817	                RS_GCF_011617105.1
  0.0001	15	0	species	207016	              s__Hafnia proteus
  0.0001	15	15	subspecies	207018	                RS_GCF_001586165.1
  0.0837	12244	0	genus	171599	            g__Plesiomonas
  0.0837	12244	1331	species	171600	              s__Plesiomonas shigelloides
  0.0374	5471	5471	subspecies	171613	                RS_GCF_012273295.1
  0.0371	5435	5435	subspecies	171612	                RS_GCF_900087055.1
  0.0000	7	7	subspecies	171615	                RS_GCF_003019855.1
  0.0836	12238	0	genus	166546	            g__Serratia_A
  0.0836	12238	2812	species	166547	              s__Serratia_A fonticola
  0.0352	5153	5153	subspecies	166561	                RS_GCF_011691375.1
  0.0291	4253	4253	subspecies	166559	                RS_GCF_013284015.1
  0.0000	7	7	subspecies	166563	                RS_GCF_002588845.1
  0.0000	6	6	subspecies	166576	                RS_GCF_005489985.1
  0.0000	4	4	subspecies	166571	                RS_GCF_003668775.1
  0.0000	2	2	subspecies	166574	                RS_GCF_001006005.1
  0.0000	1	1	subspecies	166565	                RS_GCF_900638145.1
  0.0834	12208	45	genus	186170	            g__Lelliottia
  0.0831	12161	11401	species	200661	              s__Lelliottia amnigena
  0.0027	389	389	subspecies	200667	                RS_GCF_002393405.1
  0.0025	371	371	subspecies	200666	                RS_GCF_900635465.1
  0.0000	2	0	species	248795	              s__Lelliottia sp000016325
  0.0000	2	2	subspecies	248797	                RS_GCF_000016325.1
  0.0834	12201	0	genus	250344	            g__Sodalis
  0.0834	12201	10657	species	250345	              s__Sodalis glossinidius
  0.0054	784	784	subspecies	250346	                RS_GCF_000010085.1
  0.0052	760	760	subspecies	250347	                RS_GCF_900004845.1
  0.0831	12164	0	genus	210198	            g__Shimwellia
  0.0831	12164	12058	species	210199	              s__Shimwellia blattae
  0.0007	97	97	subspecies	210201	                RS_GCF_900635135.1
  0.0001	9	9	subspecies	210200	                RS_GCF_900636035.1
  0.0829	12133	0	genus	240495	            g__Enterobacter_B
  0.0829	12133	1978	species	240496	              s__Enterobacter_B lignolyticus
  0.0351	5131	5131	subspecies	240498	                RS_GCF_000164865.1
  0.0343	5024	5024	subspecies	240497	                RS_GCF_001461805.1
  0.0825	12077	46	genus	197811	            g__Serratia_B
  0.0821	12022	7233	species	209952	              s__Serratia_B rubidaea_A
  0.0163	2393	2393	subspecies	209954	                RS_GCF_014298095.1
  0.0159	2332	2332	subspecies	209953	                RS_GCF_900478395.1
  0.0003	41	41	subspecies	209955	                RS_GCF_009817885.1
  0.0002	23	23	subspecies	209956	                RS_GCF_002966855.1
  0.0001	9	4	species	197812	              s__Serratia_B rubidaea
  0.0000	2	2	subspecies	197815	                RS_GCF_901472405.1
  0.0000	1	1	subspecies	197813	                RS_GCF_900638005.1
  0.0000	1	1	subspecies	197817	                RS_GCF_001572725.1
  0.0000	1	1	subspecies	197818	                RS_GCF_900635665.1
  0.0823	12048	0	genus	152058	            g__Morganella
  0.0823	12048	10525	species	152059	              s__Morganella morganii
  0.0094	1378	1378	subspecies	152064	                RS_GCF_010748915.1
  0.0003	49	49	subspecies	152103	                GB_GCA_900635025.1
  0.0003	47	47	subspecies	152129	                RS_GCF_003071325.1
  0.0001	9	9	subspecies	152137	                RS_GCF_003573445.1
  0.0001	8	8	subspecies	152072	                RS_GCF_010365245.1
  0.0000	6	6	subspecies	152071	                RS_GCF_013378135.1
  0.0000	6	6	subspecies	152125	                RS_GCF_002386305.1
  0.0000	5	5	subspecies	152092	                RS_GCF_000286435.2
  0.0000	5	5	subspecies	152110	                RS_GCF_002891475.1
  0.0000	4	4	subspecies	152126	                RS_GCF_001558895.2
  0.0000	3	3	subspecies	152121	                RS_GCF_002968775.1
  0.0000	2	2	subspecies	152084	                RS_GCF_000783955.2
  0.0000	1	1	subspecies	152099	                RS_GCF_011465095.1
  0.0814	11914	5	genus	161327	            g__Citrobacter_A
  0.0814	11908	11903	species	208865	              s__Citrobacter_A sedlakii
  0.0000	3	3	subspecies	208869	                RS_GCF_013889875.1
  0.0000	2	2	subspecies	208868	                RS_GCF_013889015.1
  0.0000	1	0	species	161328	              s__Citrobacter_A amalonaticus
  0.0000	1	1	subspecies	161356	                RS_GCF_002880615.1
  0.0807	11810	0	genus	161605	            g__Citrobacter_B
  0.0807	11810	11443	species	161606	              s__Citrobacter_B koseri
  0.0011	156	156	subspecies	161610	                RS_GCF_005406305.1
  0.0009	127	127	subspecies	161608	                RS_GCF_000018045.1
  0.0004	57	57	subspecies	161633	                RS_GCF_900635885.1
  0.0002	22	22	subspecies	161648	                GB_GCA_001931885.1
  0.0000	1	1	subspecies	161618	                RS_GCF_002947035.1
  0.0000	1	1	subspecies	161621	                RS_GCF_012955585.1
  0.0000	1	1	subspecies	161626	                RS_GCF_002947675.1
  0.0000	1	1	subspecies	161641	                RS_GCF_014333315.1
  0.0000	1	1	subspecies	161649	                RS_GCF_002393245.1
  0.0804	11768	0	genus	174002	            g__Pluralibacter
  0.0804	11768	11588	species	174003	              s__Pluralibacter gergoviae
  0.0012	180	180	subspecies	174024	                RS_GCF_000757785.1
  0.0746	10918	182	genus	179456	            g__Phytobacter
  0.0733	10725	115	species	199177	              s__Phytobacter ursingii
  0.0366	5355	5355	subspecies	199181	                RS_GCF_002903065.1
  0.0359	5255	5255	subspecies	199183	                RS_GCF_001022135.1
  0.0001	11	3	species	179457	              s__Phytobacter diazotrophicus
  0.0000	3	3	subspecies	179462	                RS_GCF_003925915.1
  0.0000	2	2	subspecies	179472	                RS_GCF_002903045.1
  0.0000	2	2	subspecies	179473	                RS_GCF_011064805.1
  0.0000	1	1	subspecies	179471	                RS_GCF_002903085.1
  0.0000	3	0	genus	169083	            g__Atlantibacter
  0.0000	2	1	species	169084	              s__Atlantibacter hermannii
  0.0000	1	1	subspecies	169107	                RS_GCF_900635495.1
  0.0000	1	0	species	193802	              s__Atlantibacter subterranea
  0.0000	1	1	subspecies	193810	                RS_GCF_008931465.1
  0.0000	2	0	genus	175004	            g__Mixta
  0.0000	2	0	species	175005	              s__Mixta calida
  0.0000	2	2	subspecies	175024	                GB_GCA_000784965.1
  0.0000	1	0	genus	169227	            g__Lonsdalea
  0.0000	1	0	species	228207	              s__Lonsdalea britannica
  0.0000	1	1	subspecies	228208	                RS_GCF_003515985.1
  0.0000	1	0	genus	180756	            g__Rahnella
  0.0000	1	1	species	180757	              s__Rahnella aquatilis_B
  1.9288	282320	293	family	109280	          f__Vibrionaceae
  1.8435	269833	7949	genus	109281	            g__Vibrio
  0.0838	12267	554	species	182648	              s__Vibrio mediterranei
  0.0400	5860	5860	subspecies	182652	                RS_GCF_002214345.1
  0.0400	5853	5853	subspecies	182655	                RS_GCF_003726935.1
  0.0836	12243	3504	species	164825	              s__Vibrio coralliilyticus
  0.0303	4434	4434	subspecies	164828	                RS_GCF_002073995.1
  0.0293	4286	4286	subspecies	164826	                RS_GCF_000763535.1
  0.0000	7	7	subspecies	164860	                RS_GCF_001693615.1
  0.0000	6	6	subspecies	164830	                RS_GCF_000772065.1
  0.0000	5	5	subspecies	164834	                RS_GCF_011212705.1
  0.0000	1	1	subspecies	164849	                RS_GCF_009363455.1
  0.0836	12237	900	species	256562	              s__Vibrio taketomensis
  0.0388	5683	5683	subspecies	256563	                RS_GCF_009938185.1
  0.0386	5654	5654	subspecies	256564	                RS_GCF_009938165.1
  0.0833	12199	4479	species	175116	              s__Vibrio metschnikovii
  0.0283	4142	4142	subspecies	175119	                RS_GCF_009763765.1
  0.0243	3557	3557	subspecies	175117	                RS_GCF_009763925.1
  0.0001	21	21	subspecies	175135	                RS_GCF_009665235.1
  0.0831	12169	10467	species	140387	              s__Vibrio vulnificus
  0.0109	1593	1593	subspecies	140395	                RS_GCF_004319645.1
  0.0001	13	13	subspecies	140509	                RS_GCF_012275045.1
  0.0001	12	12	subspecies	140576	                GB_GCA_009763305.1
  0.0001	8	8	subspecies	140412	                RS_GCF_002850455.1
  0.0000	7	7	subspecies	140400	                RS_GCF_009764115.1
  0.0000	6	6	subspecies	140391	                RS_GCF_001653775.1
  0.0000	6	6	subspecies	140574	                RS_GCF_003047125.1
  0.0000	6	6	subspecies	140454	                RS_GCF_014107515.1
  0.0000	5	5	subspecies	140541	                RS_GCF_001433435.1
  0.0000	5	5	subspecies	140552	                RS_GCF_002215135.1
  0.0000	5	5	subspecies	140413	                RS_GCF_001558515.2
  0.0000	5	5	subspecies	140408	                RS_GCF_000186585.1
  0.0000	4	4	subspecies	140479	                RS_GCF_009764095.1
  0.0000	4	4	subspecies	140500	                RS_GCF_009665475.1
  0.0000	4	4	subspecies	140445	                RS_GCF_014211935.1
  0.0000	4	4	subspecies	140531	                RS_GCF_009665455.1
  0.0000	3	3	subspecies	140463	                RS_GCF_000746665.1
  0.0000	3	3	subspecies	140546	                RS_GCF_002863725.1
  0.0000	2	2	subspecies	140446	                RS_GCF_000039765.1
  0.0000	2	2	subspecies	140472	                RS_GCF_002204915.1
  0.0000	2	2	subspecies	140538	                RS_GCF_001675245.1
  0.0000	1	1	subspecies	140504	                RS_GCF_000009745.1
  0.0000	1	1	subspecies	140523	                RS_GCF_002224265.1
  0.0000	1	1	subspecies	140540	                RS_GCF_004355205.1
  0.0830	12151	11674	species	200185	              s__Vibrio cincinnatiensis
  0.0020	291	291	subspecies	200187	                RS_GCF_009763885.1
  0.0012	169	169	subspecies	200186	                RS_GCF_009665395.1
  0.0001	11	11	subspecies	200189	                RS_GCF_009763705.1
  0.0000	6	6	subspecies	200188	                RS_GCF_009763485.1
  0.0829	12140	4193	species	187065	              s__Vibrio natriegens
  0.0275	4030	4030	subspecies	187068	                RS_GCF_001680085.1
  0.0266	3891	3891	subspecies	187066	                RS_GCF_000241385.1
  0.0001	12	12	subspecies	187073	                RS_GCF_003443775.1
  0.0001	8	8	subspecies	187072	                RS_GCF_001680045.1
  0.0000	6	6	subspecies	187070	                RS_GCF_001680065.1
  0.0828	12125	2414	species	208253	              s__Vibrio scophthalmi
  0.0333	4880	4880	subspecies	208257	                RS_GCF_001687805.1
  0.0330	4831	4831	subspecies	208256	                RS_GCF_001685465.1
  0.0828	12124	10486	species	166480	              s__Vibrio fluvialis
  0.0091	1330	1330	subspecies	166482	                RS_GCF_009764195.1
  0.0014	202	202	subspecies	166481	                RS_GCF_009763005.1
  0.0001	16	16	subspecies	166509	                RS_GCF_002953375.1
  0.0001	12	12	subspecies	166505	                RS_GCF_001952955.1
  0.0001	10	10	subspecies	166488	                RS_GCF_012275125.1
  0.0001	9	9	subspecies	166487	                RS_GCF_009764215.1
  0.0001	8	8	subspecies	166486	                RS_GCF_012275025.1
  0.0001	8	8	subspecies	166492	                RS_GCF_009763465.1
  0.0000	7	7	subspecies	166496	                RS_GCF_012274925.1
  0.0000	7	7	subspecies	166503	                RS_GCF_001558415.2
  0.0000	7	7	subspecies	166511	                RS_GCF_009763185.1
  0.0000	6	6	subspecies	166499	                RS_GCF_009763685.1
  0.0000	5	5	subspecies	166498	                RS_GCF_012274945.1
  0.0000	4	4	subspecies	166485	                RS_GCF_013181325.1
  0.0000	4	4	subspecies	166491	                RS_GCF_009763785.1
  0.0000	3	3	subspecies	166512	                RS_GCF_009665355.1
  0.0824	12057	4772	species	184840	              s__Vibrio furnissii
  0.0263	3855	3855	subspecies	184843	                RS_GCF_009763225.1
  0.0230	3370	3370	subspecies	184842	                RS_GCF_009763345.1
  0.0001	15	15	subspecies	184852	                RS_GCF_009665335.1
  0.0001	14	14	subspecies	184844	                RS_GCF_012274905.1
  0.0001	12	12	subspecies	184851	                RS_GCF_000184325.1
  0.0001	11	11	subspecies	184849	                RS_GCF_006364355.1
  0.0001	8	8	subspecies	184850	                RS_GCF_009764175.1
  0.0821	12015	11809	species	112202	              s__Vibrio cholerae
  0.0001	13	13	subspecies	113032	                RS_GCF_008369625.1
  0.0001	11	11	subspecies	113557	                RS_GCF_900538065.1
  0.0001	10	10	subspecies	112762	                RS_GCF_009763045.1
  0.0001	10	10	subspecies	113133	                RS_GCF_009763065.1
  0.0001	9	9	subspecies	112959	                RS_GCF_002216685.1
  0.0001	9	9	subspecies	112995	                RS_GCF_004117115.1
  0.0001	9	9	subspecies	112655	                GB_GCA_009763985.1
  0.0001	8	8	subspecies	112232	                RS_GCF_000021625.1
  0.0001	8	8	subspecies	112819	                RS_GCF_012275105.1
  0.0000	7	7	subspecies	112354	                RS_GCF_004328575.1
  0.0000	7	7	subspecies	113526	                RS_GCF_000818865.1
  0.0000	7	7	subspecies	112506	                RS_GCF_900185995.1
  0.0000	6	6	subspecies	113214	                RS_GCF_009762965.1
  0.0000	6	6	subspecies	113403	                RS_GCF_009763825.1
  0.0000	5	5	subspecies	112547	                RS_GCF_000969235.1
  0.0000	5	5	subspecies	113184	                RS_GCF_000195065.1
  0.0000	5	5	subspecies	112407	                RS_GCF_013357865.1
  0.0000	5	5	subspecies	113621	                RS_GCF_009762895.1
  0.0000	4	4	subspecies	112646	                RS_GCF_002313025.1
  0.0000	4	4	subspecies	113274	                RS_GCF_013357745.1
  0.0000	4	4	subspecies	113275	                RS_GCF_008369605.1
  0.0000	3	3	subspecies	112365	                RS_GCF_000275645.1
  0.0000	3	3	subspecies	112993	                RS_GCF_013357885.1
  0.0000	3	3	subspecies	112984	                RS_GCF_009763665.1
  0.0000	3	3	subspecies	112272	                RS_GCF_000006745.1
  0.0000	3	3	subspecies	112981	                RS_GCF_001887615.1
  0.0000	2	2	subspecies	113188	                RS_GCF_013357765.1
  0.0000	2	2	subspecies	113223	                RS_GCF_009762915.1
  0.0000	2	2	subspecies	112250	                RS_GCF_013357645.1
  0.0000	2	2	subspecies	113325	                RS_GCF_013357605.1
  0.0000	2	2	subspecies	112902	                RS_GCF_000969265.1
  0.0000	2	2	subspecies	112393	                RS_GCF_013357725.1
  0.0000	2	2	subspecies	112759	                RS_GCF_009763105.1
  0.0000	2	2	subspecies	112440	                RS_GCF_900324435.1
  0.0000	2	2	subspecies	112740	                RS_GCF_001683415.1
  0.0000	2	2	subspecies	112669	                GB_GCA_009764135.1
  0.0000	2	2	subspecies	112455	                RS_GCF_000829215.1
  0.0000	1	1	subspecies	112584	                RS_GCF_000250855.1
  0.0000	1	1	subspecies	112360	                RS_GCF_009799825.1
  0.0000	1	1	subspecies	113597	                RS_GCF_003063885.1
  0.0000	1	1	subspecies	113565	                RS_GCF_900324445.1
  0.0000	1	1	subspecies	113542	                RS_GCF_000338075.1
  0.0000	1	1	subspecies	113360	                RS_GCF_003574155.1
  0.0000	1	1	subspecies	113329	                RS_GCF_009646135.1
  0.0000	1	1	subspecies	112497	                RS_GCF_013357665.1
  0.0000	1	1	subspecies	112551	                RS_GCF_001887475.1
  0.0000	1	1	subspecies	112923	                RS_GCF_009762945.1
  0.0000	1	1	subspecies	113238	                RS_GCF_000963555.1
  0.0000	1	1	subspecies	113198	                RS_GCF_009763945.1
  0.0000	1	1	subspecies	112817	                RS_GCF_013357685.1
  0.0000	1	1	subspecies	112818	                RS_GCF_013462495.1
  0.0000	1	1	subspecies	112846	                RS_GCF_001887415.1
  0.0000	1	1	subspecies	112866	                RS_GCF_003591575.1
  0.0000	1	1	subspecies	112987	                RS_GCF_013085125.1
  0.0821	12015	11759	species	147771	              s__Vibrio anguillarum
  0.0011	165	165	subspecies	147781	                RS_GCF_003031205.1
  0.0001	18	18	subspecies	147832	                RS_GCF_002310335.1
  0.0001	14	14	subspecies	147802	                GB_GCA_001997225.1
  0.0001	12	12	subspecies	147845	                RS_GCF_003595585.1
  0.0001	9	9	subspecies	147821	                GB_GCA_001989695.1
  0.0000	7	7	subspecies	147789	                RS_GCF_002212005.1
  0.0000	7	7	subspecies	147852	                RS_GCF_002212025.1
  0.0000	6	6	subspecies	147814	                RS_GCF_002211985.1
  0.0000	5	5	subspecies	147872	                RS_GCF_002291265.1
  0.0000	3	3	subspecies	147779	                GB_GCA_003390615.1
  0.0000	3	3	subspecies	147869	                RS_GCF_000786425.1
  0.0000	3	3	subspecies	147874	                GB_GCA_003391235.1
  0.0000	1	1	subspecies	147825	                RS_GCF_000217675.1
  0.0000	1	1	subspecies	147857	                GB_GCA_003391215.1
  0.0000	1	1	subspecies	147865	                RS_GCF_000462975.1
  0.0000	1	1	subspecies	147871	                RS_GCF_003399575.2
  0.0817	11963	8282	species	164862	              s__Vibrio campbellii
  0.0235	3439	3439	subspecies	164863	                RS_GCF_002906455.1
  0.0008	110	110	subspecies	164865	                RS_GCF_000464435.1
  0.0003	42	42	subspecies	164877	                RS_GCF_003691485.1
  0.0001	18	18	subspecies	164888	                RS_GCF_002163755.1
  0.0001	15	15	subspecies	164895	                RS_GCF_003312585.1
  0.0001	14	14	subspecies	164898	                RS_GCF_002142655.1
  0.0001	13	13	subspecies	164894	                RS_GCF_002893865.1
  0.0001	11	11	subspecies	164884	                RS_GCF_002906475.1
  0.0001	10	10	subspecies	164870	                RS_GCF_001991055.1
  0.0001	9	9	subspecies	164876	                RS_GCF_000017705.1
  0.0813	11902	3580	species	169908	              s__Vibrio mimicus
  0.0285	4178	4178	subspecies	169917	                RS_GCF_009764025.1
  0.0281	4112	4112	subspecies	169912	                RS_GCF_009764005.1
  0.0001	15	15	subspecies	169929	                RS_GCF_001558475.2
  0.0001	8	8	subspecies	169930	                RS_GCF_009763965.1
  0.0000	5	5	subspecies	169925	                RS_GCF_009665195.1
  0.0000	4	4	subspecies	169920	                RS_GCF_001767355.1
  0.0813	11898	3701	species	192259	              s__Vibrio navarrensis
  0.0332	4858	4858	subspecies	192263	                RS_GCF_009763725.1
  0.0226	3301	3301	subspecies	192260	                RS_GCF_009665215.1
  0.0002	22	22	subspecies	192265	                RS_GCF_012274885.1
  0.0001	16	16	subspecies	192267	                RS_GCF_012275065.1
  0.0806	11795	1153	species	181891	              s__Vibrio rotiferianus
  0.0365	5337	5337	subspecies	181902	                RS_GCF_007182835.1
  0.0362	5305	5305	subspecies	181896	                RS_GCF_002214395.1
  0.0800	11711	6556	species	163610	              s__Vibrio harveyi
  0.0178	2608	2608	subspecies	163614	                RS_GCF_001558435.2
  0.0171	2497	2497	subspecies	163616	                RS_GCF_012275085.1
  0.0002	22	22	subspecies	163632	                RS_GCF_001908435.2
  0.0001	13	13	subspecies	163633	                RS_GCF_002850295.1
  0.0000	7	7	subspecies	163648	                RS_GCF_009184745.1
  0.0000	4	4	subspecies	163630	                RS_GCF_009665315.1
  0.0000	4	4	subspecies	163637	                RS_GCF_000770115.1
  0.0793	11600	9836	species	154220	              s__Vibrio alginolyticus
  0.0113	1651	1651	subspecies	154222	                RS_GCF_009763845.1
  0.0002	35	35	subspecies	154223	                RS_GCF_003613065.1
  0.0001	11	11	subspecies	154273	                RS_GCF_001679745.1
  0.0001	9	9	subspecies	154272	                RS_GCF_013368735.1
  0.0001	8	8	subspecies	154269	                RS_GCF_002953515.1
  0.0000	7	7	subspecies	154264	                GB_GCA_011801415.1
  0.0000	6	6	subspecies	154277	                RS_GCF_001469735.1
  0.0000	6	6	subspecies	154242	                RS_GCF_009665435.1
  0.0000	5	5	subspecies	154238	                RS_GCF_012274965.1
  0.0000	4	4	subspecies	154291	                RS_GCF_005239365.1
  0.0000	4	4	subspecies	154289	                RS_GCF_014274185.1
  0.0000	4	4	subspecies	154265	                GB_GCA_009762875.1
  0.0000	3	3	subspecies	154227	                RS_GCF_009763745.1
  0.0000	2	2	subspecies	154255	                RS_GCF_009763085.1
  0.0000	2	2	subspecies	154254	                RS_GCF_000354175.2
  0.0000	2	2	subspecies	154246	                RS_GCF_002149105.1
  0.0000	2	2	subspecies	154281	                RS_GCF_002119545.1
  0.0000	1	1	subspecies	154258	                RS_GCF_011801435.1
  0.0000	1	1	subspecies	154235	                RS_GCF_002149085.1
  0.0000	1	1	subspecies	154224	                RS_GCF_002119585.1
  0.0789	11549	1515	species	199312	              s__Vibrio cidicii
  0.0344	5041	5041	subspecies	199314	                RS_GCF_009763805.1
  0.0341	4993	4993	subspecies	199318	                GB_GCA_009665415.1
  0.0774	11333	7816	species	163275	              s__Vibrio diabolicus
  0.0236	3452	3452	subspecies	163283	                RS_GCF_002953395.1
  0.0002	31	31	subspecies	163291	                RS_GCF_000024825.1
  0.0001	13	13	subspecies	163305	                RS_GCF_002953335.1
  0.0001	11	11	subspecies	163302	                RS_GCF_011801455.1
  0.0001	10	10	subspecies	163284	                RS_GCF_002953355.1
  0.0769	11254	10670	species	172907	              s__Vibrio owensii
  0.0020	290	290	subspecies	172915	                RS_GCF_003691505.1
  0.0012	170	170	subspecies	172913	                RS_GCF_001310575.2
  0.0004	53	53	subspecies	172920	                RS_GCF_002887655.1
  0.0003	42	42	subspecies	172925	                RS_GCF_003691545.1
  0.0002	29	29	subspecies	172924	                RS_GCF_002021755.1
  0.0753	11020	3017	species	170190	              s__Vibrio metoecus
  0.0274	4008	4008	subspecies	170201	                RS_GCF_009665275.1
  0.0272	3982	3982	subspecies	170211	                RS_GCF_009763865.1
  0.0001	13	13	subspecies	170216	                RS_GCF_009763905.1
  0.0006	82	30	species	109282	              s__Vibrio parahaemolyticus
  0.0000	7	7	subspecies	109519	                RS_GCF_003691525.1
  0.0000	5	5	subspecies	109608	                RS_GCF_006517795.1
  0.0000	4	4	subspecies	110614	                RS_GCF_009763025.1
  0.0000	4	4	subspecies	110229	                RS_GCF_001879585.1
  0.0000	3	3	subspecies	109538	                RS_GCF_009734325.1
  0.0000	3	3	subspecies	109780	                RS_GCF_014217295.1
  0.0000	3	3	subspecies	109785	                RS_GCF_002504185.1
  0.0000	3	3	subspecies	110072	                RS_GCF_001558495.2
  0.0000	2	2	subspecies	110018	                RS_GCF_001636035.1
  0.0000	2	2	subspecies	110631	                RS_GCF_009763625.1
  0.0000	2	2	subspecies	110109	                RS_GCF_001996365.2
  0.0000	2	2	subspecies	110497	                RS_GCF_009763605.1
  0.0000	2	2	subspecies	110406	                RS_GCF_013393845.1
  0.0000	1	1	subspecies	110639	                RS_GCF_001700835.1
  0.0000	1	1	subspecies	110632	                RS_GCF_000430425.1
  0.0000	1	1	subspecies	110397	                RS_GCF_009883855.1
  0.0000	1	1	subspecies	110358	                RS_GCF_003351885.1
  0.0000	1	1	subspecies	110286	                RS_GCF_003612695.1
  0.0000	1	1	subspecies	110156	                GB_GCA_012274985.1
  0.0000	1	1	subspecies	110130	                RS_GCF_009883815.1
  0.0000	1	1	subspecies	110031	                RS_GCF_009764055.1
  0.0000	1	1	subspecies	110020	                RS_GCF_003047085.1
  0.0000	1	1	subspecies	109547	                RS_GCF_012275005.1
  0.0001	14	0	species	233673	              s__Vibrio metoecus_B
  0.0001	14	14	subspecies	233675	                RS_GCF_009665255.1
  0.0001	11	0	species	234481	              s__Vibrio ordalii
  0.0001	11	11	subspecies	234483	                RS_GCF_002257545.1
  0.0000	4	0	species	170818	              s__Vibrio jasicida
  0.0000	4	4	subspecies	170827	                RS_GCF_002887615.1
  0.0000	3	0	species	276289	              s__Vibrio tapetis
  0.0000	3	3	subspecies	276290	                RS_GCF_900233005.1
  0.0000	1	0	species	215869	              s__Vibrio panuliri
  0.0000	1	1	subspecies	215872	                RS_GCF_009938205.1
  0.0000	1	0	species	217677	              s__Vibrio fortis
  0.0000	1	1	subspecies	217679	                RS_GCF_009363355.1
  0.0000	1	0	species	302739	              s__Vibrio sp011306175
  0.0000	1	1	subspecies	302740	                RS_GCF_011306175.1
  0.0833	12194	16	genus	158189	            g__Aliivibrio
  0.0832	12176	11155	species	205003	              s__Aliivibrio salmonicida_A
  0.0037	539	539	subspecies	205007	                RS_GCF_003942025.1
  0.0033	482	482	subspecies	205005	                RS_GCF_000196495.1
  0.0000	2	0	species	265672	              s__Aliivibrio wodanis
  0.0000	2	2	subspecies	265673	                RS_GCF_000953695.1
  1.4259	208715	1493	family	125322	          f__Pasteurellaceae
  0.4149	60733	24262	genus	125323	            g__Haemophilus
  0.0815	11927	107	species	168820	              s__Haemophilus haemolyticus
  0.0404	5911	5911	subspecies	168841	                RS_GCF_003351405.1
  0.0403	5903	5903	subspecies	168836	                RS_GCF_003351625.1
  0.0000	6	6	subspecies	168846	                RS_GCF_900477945.1
  0.0558	8161	6318	species	155152	              s__Haemophilus influenzae_D
  0.0095	1389	1389	subspecies	155158	                RS_GCF_900475755.1
  0.0018	259	259	subspecies	155156	                RS_GCF_003352345.1
  0.0005	68	68	subspecies	155204	                RS_GCF_003352365.1
  0.0003	43	43	subspecies	155192	                RS_GCF_000465255.1
  0.0002	34	34	subspecies	155203	                GB_GCA_003184385.1
  0.0001	12	12	subspecies	155167	                RS_GCF_900478735.1
  0.0001	11	11	subspecies	155162	                RS_GCF_900475535.1
  0.0001	11	11	subspecies	155163	                RS_GCF_901472485.1
  0.0001	11	11	subspecies	155200	                RS_GCF_003351425.1
  0.0000	5	5	subspecies	155159	                RS_GCF_003352405.1
  0.0496	7257	7086	species	167951	              s__Haemophilus aegyptius
  0.0005	78	78	subspecies	167955	                RS_GCF_008586745.1
  0.0003	37	37	subspecies	167975	                GB_GCA_008586785.1
  0.0002	28	28	subspecies	167965	                GB_GCA_008586765.1
  0.0001	13	13	subspecies	167971	                RS_GCF_001856725.1
  0.0001	9	9	subspecies	167973	                RS_GCF_003351585.1
  0.0000	3	3	subspecies	167969	                RS_GCF_000197875.1
  0.0000	2	2	subspecies	167958	                RS_GCF_008586805.1
  0.0000	1	1	subspecies	167967	                RS_GCF_008586825.1
  0.0292	4278	782	species	150790	              s__Haemophilus influenzae_E
  0.0118	1732	1732	subspecies	150817	                RS_GCF_000698365.1
  0.0118	1731	1731	subspecies	150799	                RS_GCF_900635805.1
  0.0001	16	16	subspecies	150821	                RS_GCF_003425645.1
  0.0001	12	12	subspecies	150863	                RS_GCF_003691655.1
  0.0000	5	5	subspecies	150837	                RS_GCF_002966675.1
  0.0264	3866	2067	species	153550	              s__Haemophilus influenzae_F
  0.0081	1191	1191	subspecies	153583	                RS_GCF_013394405.1
  0.0041	600	600	subspecies	153562	                GB_GCA_003184405.1
  0.0001	8	8	subspecies	153604	                RS_GCF_000968335.1
  0.0067	975	652	species	125324	              s__Haemophilus influenzae
  0.0002	27	27	subspecies	125777	                RS_GCF_000931605.1
  0.0002	24	24	subspecies	125583	                RS_GCF_000165575.1
  0.0001	21	21	subspecies	125656	                RS_GCF_000931575.1
  0.0001	21	21	subspecies	125646	                RS_GCF_003425625.1
  0.0001	20	20	subspecies	125628	                RS_GCF_003351445.1
  0.0001	16	16	subspecies	125392	                RS_GCF_003425505.1
  0.0001	16	16	subspecies	125404	                RS_GCF_000165525.1
  0.0001	14	14	subspecies	125784	                RS_GCF_000012185.1
  0.0001	14	14	subspecies	125522	                RS_GCF_003351605.1
  0.0001	14	14	subspecies	125699	                RS_GCF_900478275.1
  0.0001	13	13	subspecies	125702	                RS_GCF_000931625.1
  0.0001	13	13	subspecies	125493	                RS_GCF_900638105.1
  0.0001	12	12	subspecies	125489	                RS_GCF_003425955.1
  0.0001	12	12	subspecies	125599	                RS_GCF_000027305.1
  0.0001	12	12	subspecies	125622	                GB_GCA_000016465.1
  0.0001	12	12	subspecies	125428	                GB_GCA_000016485.1
  0.0001	11	11	subspecies	125750	                RS_GCF_003351465.1
  0.0001	10	10	subspecies	125507	                RS_GCF_000767075.1
  0.0001	9	9	subspecies	125682	                RS_GCF_002073475.2
  0.0001	8	8	subspecies	125533	                RS_GCF_002966735.1
  0.0000	7	7	subspecies	125828	                RS_GCF_001457655.1
  0.0000	5	5	subspecies	125364	                RS_GCF_900478325.1
  0.0000	2	2	subspecies	125518	                RS_GCF_900635795.1
  0.0000	2	2	subspecies	125450	                RS_GCF_900475995.1
  0.0000	2	2	subspecies	125370	                RS_GCF_008831525.1
  0.0000	1	1	subspecies	125639	                RS_GCF_003425485.1
  0.0000	1	1	subspecies	125496	                RS_GCF_003691635.1
  0.0000	1	1	subspecies	125718	                RS_GCF_003425585.1
  0.0000	1	1	subspecies	125746	                RS_GCF_000210875.1
  0.0000	1	1	subspecies	125758	                RS_GCF_003425715.1
  0.0000	1	1	subspecies	125384	                RS_GCF_003425525.1
  0.0000	6	0	species	176881	              s__Haemophilus sp002998595
  0.0000	6	6	subspecies	176897	                RS_GCF_002998595.1
  0.0000	1	0	species	177636	              s__Haemophilus haemolyticus_I
  0.0000	1	1	subspecies	177638	                RS_GCF_003352385.1
  0.2502	36617	361	genus	140190	            g__Mannheimia
  0.0830	12153	4274	species	198703	              s__Mannheimia varigena
  0.0313	4581	4581	subspecies	198704	                RS_GCF_013390325.1
  0.0223	3260	3260	subspecies	198705	                RS_GCF_000521695.1
  0.0001	14	14	subspecies	198708	                RS_GCF_003261035.1
  0.0001	13	13	subspecies	198706	                RS_GCF_000521655.1
  0.0000	6	6	subspecies	198710	                RS_GCF_013377235.1
  0.0000	5	5	subspecies	198707	                RS_GCF_000521685.1
  0.0829	12129	150	species	205704	              s__Mannheimia granulomatis
  0.0409	5992	5992	subspecies	205708	                RS_GCF_013377215.1
  0.0409	5987	5987	subspecies	205705	                RS_GCF_013377255.1
  0.0816	11945	4664	species	213934	              s__Mannheimia sp009828705
  0.0327	4787	4787	subspecies	213936	                RS_GCF_009828705.1
  0.0169	2468	2468	subspecies	213935	                RS_GCF_013377995.1
  0.0001	18	18	subspecies	213938	                RS_GCF_013377975.1
  0.0001	8	8	subspecies	213937	                RS_GCF_013378015.1
  0.0001	17	12	species	140191	              s__Mannheimia haemolytica
  0.0000	3	3	subspecies	140366	                RS_GCF_900638155.1
  0.0000	1	1	subspecies	140344	                GB_GCA_003261415.1
  0.0000	1	1	subspecies	140345	                RS_GCF_007974525.1
  0.0000	7	0	species	274927	              s__Mannheimia granulomatis_A
  0.0000	7	7	subspecies	274928	                RS_GCF_011455695.1
  0.0000	3	0	species	298617	              s__Mannheimia sp000521605
  0.0000	3	3	subspecies	298618	                RS_GCF_000521605.1
  0.0000	2	0	species	265634	              s__Mannheimia sp014541205
  0.0000	2	2	subspecies	265635	                RS_GCF_014541205.1
  0.1667	24407	807	genus	167278	            g__Actinobacillus
  0.0815	11931	11896	species	227067	              s__Actinobacillus equuli
  0.0001	20	20	subspecies	227068	                RS_GCF_900636745.1
  0.0001	15	15	subspecies	227069	                RS_GCF_000801145.1
  0.0796	11649	11190	species	196920	              s__Actinobacillus suis
  0.0031	453	453	subspecies	196923	                RS_GCF_000307145.1
  0.0000	6	6	subspecies	196926	                RS_GCF_900187155.1
  0.0001	20	10	species	167279	              s__Actinobacillus lignieresii
  0.0001	8	8	subspecies	167287	                RS_GCF_900635785.1
  0.0000	1	1	subspecies	167283	                RS_GCF_900638445.1
  0.0000	1	1	subspecies	167295	                RS_GCF_900475195.1
  0.1665	24376	7414	genus	133411	            g__Pasteurella
  0.0836	12235	2750	species	228288	              s__Pasteurella dagmatis
  0.0324	4743	4743	subspecies	228291	                RS_GCF_900638095.1
  0.0324	4742	4742	subspecies	228290	                RS_GCF_900186835.1
  0.0286	4181	4024	species	184934	              s__Pasteurella multocida_D
  0.0011	154	154	subspecies	184937	                RS_GCF_001874445.1
  0.0000	2	2	subspecies	184943	                RS_GCF_014338465.1
  0.0000	1	1	subspecies	184940	                RS_GCF_900638665.1
  0.0037	546	437	species	133412	              s__Pasteurella multocida
  0.0001	10	10	subspecies	133471	                RS_GCF_000973565.1
  0.0001	9	9	subspecies	133658	                RS_GCF_003061265.1
  0.0001	9	9	subspecies	133550	                RS_GCF_900636625.1
  0.0001	9	9	subspecies	133650	                RS_GCF_010443215.1
  0.0000	7	7	subspecies	133611	                RS_GCF_009739575.1
  0.0000	6	6	subspecies	133491	                RS_GCF_002948995.1
  0.0000	6	6	subspecies	133603	                RS_GCF_001956675.1
  0.0000	6	6	subspecies	133580	                RS_GCF_006232125.1
  0.0000	5	5	subspecies	133449	                RS_GCF_003428945.1
  0.0000	5	5	subspecies	133643	                RS_GCF_006232065.1
  0.0000	5	5	subspecies	133564	                RS_GCF_004792555.1
  0.0000	4	4	subspecies	133433	                RS_GCF_002891845.2
  0.0000	3	3	subspecies	133654	                RS_GCF_009739555.1
  0.0000	3	3	subspecies	133463	                RS_GCF_000234745.1
  0.0000	3	3	subspecies	133543	                RS_GCF_000259545.1
  0.0000	2	2	subspecies	133518	                RS_GCF_011149495.1
  0.0000	2	2	subspecies	133536	                RS_GCF_000255915.1
  0.0000	2	2	subspecies	133417	                RS_GCF_003402895.1
  0.0000	2	2	subspecies	133461	                RS_GCF_008693845.1
  0.0000	2	2	subspecies	133418	                RS_GCF_002068175.1
  0.0000	1	1	subspecies	133530	                RS_GCF_900638315.1
  0.0000	1	1	subspecies	133529	                RS_GCF_001663095.1
  0.0000	1	1	subspecies	133556	                RS_GCF_900478175.1
  0.0000	1	1	subspecies	133500	                RS_GCF_002859925.1
  0.0000	1	1	subspecies	133499	                RS_GCF_002859325.1
  0.0000	1	1	subspecies	133495	                RS_GCF_001578435.2
  0.0000	1	1	subspecies	133484	                RS_GCF_002859425.1
  0.0000	1	1	subspecies	133465	                RS_GCF_009646155.1
  0.0000	1	1	subspecies	133462	                GB_GCA_003261335.1
  0.0839	12280	0	genus	160089	            g__Histophilus
  0.0839	12280	11911	species	160090	              s__Histophilus somni
  0.0011	161	161	subspecies	160095	                RS_GCF_008085815.1
  0.0010	140	140	subspecies	160091	                RS_GCF_008087605.1
  0.0002	25	25	subspecies	160130	                RS_GCF_000011785.1
  0.0001	18	18	subspecies	160102	                RS_GCF_000019405.1
  0.0001	13	13	subspecies	160100	                RS_GCF_008085775.1
  0.0000	4	4	subspecies	160099	                RS_GCF_008086425.1
  0.0000	4	4	subspecies	160132	                RS_GCF_008085875.1
  0.0000	3	3	subspecies	160137	                RS_GCF_008085855.1
  0.0000	1	1	subspecies	160138	                RS_GCF_008085715.1
  0.0837	12246	0	genus	212449	            g__Basfia
  0.0837	12246	2721	species	212450	              s__Basfia succiniciproducens
  0.0327	4780	4780	subspecies	212451	                RS_GCF_000007745.1
  0.0324	4745	4745	subspecies	212454	                RS_GCF_011455875.1
  0.0835	12225	0	genus	167084	            g__Haemophilus_B
  0.0835	12225	12128	species	167085	              s__Haemophilus_B ducreyi
  0.0004	54	54	subspecies	167086	                GB_GCA_001043315.1
  0.0001	15	15	subspecies	167101	                RS_GCF_002208665.2
  0.0001	8	8	subspecies	167089	                GB_GCA_001043355.1
  0.0000	4	4	subspecies	167100	                RS_GCF_001647835.1
  0.0000	3	3	subspecies	167090	                GB_GCA_001043395.1
  0.0000	3	3	subspecies	167098	                GB_GCA_001043415.1
  0.0000	3	3	subspecies	167116	                GB_GCA_001043335.1
  0.0000	2	2	subspecies	167112	                GB_GCA_001043155.1
  0.0000	2	2	subspecies	167115	                GB_GCA_001043375.1
  0.0000	1	1	subspecies	167088	                RS_GCF_001647735.1
  0.0000	1	1	subspecies	167095	                GB_GCA_001043435.1
  0.0000	1	1	subspecies	167113	                GB_GCA_001043455.1
  0.0834	12200	36	genus	153996	            g__Aggregatibacter
  0.0831	12161	6683	species	175963	              s__Aggregatibacter aphrophilus
  0.0367	5369	5369	subspecies	175964	                RS_GCF_001262035.1
  0.0003	50	50	subspecies	175974	                RS_GCF_001188835.1
  0.0003	44	44	subspecies	175981	                RS_GCF_900478265.1
  0.0001	9	9	subspecies	175979	                RS_GCF_900636915.1
  0.0000	6	6	subspecies	175977	                RS_GCF_000022985.1
  0.0000	3	3	species	153997	              s__Aggregatibacter actinomycetemcomitans
  0.0829	12134	0	genus	196388	            g__Bibersteinia
  0.0829	12134	10426	species	196389	              s__Bibersteinia trehalosi
  0.0098	1435	1435	subspecies	196394	                RS_GCF_000521725.1
  0.0015	213	213	subspecies	196391	                RS_GCF_000521745.1
  0.0004	58	58	subspecies	196395	                RS_GCF_000521765.1
  0.0000	2	2	subspecies	196396	                RS_GCF_000347595.1
  0.0000	3	0	genus	174488	            g__Haemophilus_D
  0.0000	2	0	species	321785	              s__Haemophilus_D parainfluenzae_A
  0.0000	2	2	subspecies	321786	                RS_GCF_000210895.1
  0.0000	1	1	species	216655	              s__Haemophilus_D parainfluenzae_J
  0.0000	1	0	genus	147444	            g__Glaesserella
  0.0000	1	0	species	147445	              s__Glaesserella parasuis
  0.0000	1	1	subspecies	147516	                RS_GCF_013373555.1
  1.3424	196489	150	family	159304	          f__Alteromonadaceae
  1.0078	147512	1641	genus	165710	            g__Pseudoalteromonas
  0.0840	12295	12240	species	230967	              s__Pseudoalteromonas tunicata
  0.0003	38	38	subspecies	230970	                RS_GCF_003568825.1
  0.0001	17	17	subspecies	230969	                RS_GCF_002310815.1
  0.0839	12284	715	species	177464	              s__Pseudoalteromonas ruthenica
  0.0397	5817	5817	subspecies	177473	                RS_GCF_008808095.1
  0.0393	5752	5752	subspecies	177471	                RS_GCF_009363775.1
  0.0837	12256	6510	species	189900	              s__Pseudoalteromonas lipolytica
  0.0203	2972	2972	subspecies	189906	                RS_GCF_003515105.1
  0.0188	2757	2757	subspecies	189907	                RS_GCF_013423925.1
  0.0001	17	17	subspecies	189909	                RS_GCF_014117385.1
  0.0837	12245	12202	species	205080	              s__Pseudoalteromonas luteoviolacea_G
  0.0003	38	38	subspecies	205085	                RS_GCF_001750405.1
  0.0000	3	3	subspecies	205081	                RS_GCF_001750165.1
  0.0000	2	2	subspecies	205082	                RS_GCF_001750185.1
  0.0836	12240	263	species	214893	              s__Pseudoalteromonas spongiae
  0.0410	5995	5995	subspecies	214895	                RS_GCF_000238255.3
  0.0409	5982	5982	subspecies	214897	                RS_GCF_002814155.1
  0.0832	12180	1106	species	188286	              s__Pseudoalteromonas marina
  0.0379	5552	5552	subspecies	188294	                RS_GCF_001468205.2
  0.0377	5522	5522	subspecies	188288	                RS_GCF_002407085.1
  0.0831	12163	11872	species	221297	              s__Pseudoalteromonas piscicida_A
  0.0009	134	134	subspecies	221298	                RS_GCF_003429325.1
  0.0008	116	116	subspecies	221299	                RS_GCF_002208135.1
  0.0003	41	41	subspecies	221300	                RS_GCF_003429305.1
  0.0828	12123	1869	species	189963	              s__Pseudoalteromonas fuliginea
  0.0351	5144	5144	subspecies	189968	                RS_GCF_002407505.1
  0.0349	5110	5110	subspecies	189965	                RS_GCF_000310105.2
  0.0828	12115	11672	species	207803	              s__Pseudoalteromonas carrageenovora
  0.0016	229	229	subspecies	207806	                RS_GCF_900239935.1
  0.0015	214	214	subspecies	207808	                RS_GCF_004328865.1
  0.0819	11987	6112	species	169744	              s__Pseudoalteromonas tetraodonis
  0.0203	2974	2974	subspecies	169759	                RS_GCF_002310835.1
  0.0198	2899	2899	subspecies	169761	                RS_GCF_000184065.1
  0.0000	2	2	subspecies	169766	                RS_GCF_002310795.1
  0.0819	11987	11976	species	185220	              s__Pseudoalteromonas undina
  0.0000	6	6	subspecies	185225	                RS_GCF_013394165.1
  0.0000	5	5	subspecies	185227	                RS_GCF_013394125.1
  0.0816	11942	3293	species	189501	              s__Pseudoalteromonas nigrifaciens
  0.0302	4418	4418	subspecies	189510	                RS_GCF_002221505.1
  0.0289	4231	4231	subspecies	189505	                RS_GCF_000026085.1
  0.0001	9	0	species	312407	              s__Pseudoalteromonas translucida
  0.0001	9	9	subspecies	312408	                RS_GCF_001465295.1
  0.0000	7	6	species	168438	              s__Pseudoalteromonas atlantica
  0.0000	1	1	subspecies	168453	                RS_GCF_002310855.1
  0.0000	6	0	species	220667	              s__Pseudoalteromonas sp002850255
  0.0000	6	6	subspecies	220670	                RS_GCF_002850255.1
  0.0000	6	0	species	165711	              s__Pseudoalteromonas distincta
  0.0000	6	6	subspecies	165741	                RS_GCF_005877035.1
  0.0000	5	0	species	182899	              s__Pseudoalteromonas piscicida
  0.0000	5	5	subspecies	182900	                RS_GCF_000238315.3
  0.0000	5	0	species	175759	              s__Pseudoalteromonas arctica
  0.0000	5	5	subspecies	175770	                RS_GCF_000238395.3
  0.0000	3	0	species	206676	              s__Pseudoalteromonas sp001974855
  0.0000	3	3	subspecies	206677	                RS_GCF_004328665.1
  0.0000	3	0	species	214589	              s__Pseudoalteromonas sp002685175
  0.0000	3	3	subspecies	214591	                RS_GCF_013391845.1
  0.0000	3	0	species	300921	              s__Pseudoalteromonas piratica
  0.0000	3	3	subspecies	300922	                RS_GCF_000788395.1
  0.0000	2	0	species	202300	              s__Pseudoalteromonas aliena
  0.0000	2	2	subspecies	202303	                RS_GCF_001999225.1
  0.0000	2	0	species	219924	              s__Pseudoalteromonas luteoviolacea
  0.0000	2	2	subspecies	219926	                RS_GCF_006704145.1
  0.0000	1	0	species	219784	              s__Pseudoalteromonas phenolica
  0.0000	1	1	subspecies	219787	                RS_GCF_001444405.1
  0.0000	1	0	species	234463	              s__Pseudoalteromonas espejiana
  0.0000	1	1	subspecies	234465	                RS_GCF_002221525.1
  0.0000	1	0	species	257135	              s__Pseudoalteromonas sp001282135
  0.0000	1	1	subspecies	257137	                RS_GCF_004014715.1
  0.3336	48826	913	genus	159305	            g__Alteromonas
  0.0830	12143	12045	species	193177	              s__Alteromonas stellipolaris
  0.0002	30	30	subspecies	193184	                RS_GCF_001632825.1
  0.0002	27	27	subspecies	193179	                RS_GCF_001433715.1
  0.0001	21	21	subspecies	193183	                RS_GCF_001562195.1
  0.0001	10	10	subspecies	193178	                GB_GCA_001562155.1
  0.0001	8	8	subspecies	193181	                RS_GCF_001632765.1
  0.0000	2	2	subspecies	193182	                RS_GCF_001562115.1
  0.0828	12113	422	species	206167	              s__Alteromonas naphthalenivorans
  0.0404	5908	5908	subspecies	206172	                RS_GCF_900654235.1
  0.0395	5783	5783	subspecies	206170	                RS_GCF_000213655.1
  0.0812	11880	5785	species	206979	              s__Alteromonas hispanica
  0.0218	3194	3194	subspecies	206983	                RS_GCF_002831605.1
  0.0198	2901	2901	subspecies	206981	                RS_GCF_001886475.1
  0.0803	11752	9260	species	173936	              s__Alteromonas mediterranea
  0.0166	2423	2423	subspecies	173938	                RS_GCF_000439475.1
  0.0001	20	20	subspecies	173937	                RS_GCF_000439575.1
  0.0001	8	8	subspecies	173941	                RS_GCF_001886395.1
  0.0001	8	8	subspecies	173944	                RS_GCF_001886435.1
  0.0001	8	8	subspecies	173957	                RS_GCF_000020585.3
  0.0000	6	6	subspecies	173943	                RS_GCF_000439495.1
  0.0000	5	5	subspecies	173954	                GB_GCA_000439515.1
  0.0000	4	4	subspecies	173955	                RS_GCF_000439595.1
  0.0000	3	3	subspecies	173950	                RS_GCF_006517115.1
  0.0000	3	3	subspecies	173953	                RS_GCF_006517095.1
  0.0000	2	2	subspecies	173952	                RS_GCF_001562295.1
  0.0000	1	1	subspecies	173940	                RS_GCF_001562315.1
  0.0000	1	1	subspecies	173945	                GB_GCA_000439555.1
  0.0002	23	4	species	159306	              s__Alteromonas macleodii
  0.0001	10	10	subspecies	159310	                RS_GCF_001562235.1
  0.0000	5	5	subspecies	159353	                RS_GCF_000300175.1
  0.0000	3	3	subspecies	159341	                RS_GCF_001578515.1
  0.0000	1	1	subspecies	159355	                RS_GCF_002849875.1
  0.0000	1	0	species	168498	              s__Alteromonas australica
  0.0000	1	1	subspecies	168519	                RS_GCF_000730385.1
  0.0000	1	0	species	242602	              s__Alteromonas sp003443615
  0.0000	1	1	subspecies	242604	                RS_GCF_003443615.1
  0.0000	1	0	genus	240041	            g__Salinimonas
  0.0000	1	0	species	240042	              s__Salinimonas sediminis
  0.0000	1	1	subspecies	240044	                RS_GCF_003429285.1
  0.7443	108945	2	family	146176	          f__Aeromonadaceae
  0.7443	108943	3920	genus	146177	            g__Aeromonas
  0.0833	12195	2179	species	216602	              s__Aeromonas schubertii
  0.0344	5033	5033	subspecies	216603	                RS_GCF_004919485.1
  0.0340	4983	4983	subspecies	216606	                RS_GCF_001447335.1
  0.0830	12155	11977	species	154727	              s__Aeromonas salmonicida
  0.0003	40	40	subspecies	154754	                RS_GCF_002764135.1
  0.0001	21	21	subspecies	154742	                RS_GCF_012931585.1
  0.0001	21	21	subspecies	154761	                RS_GCF_002735225.1
  0.0001	18	18	subspecies	154731	                RS_GCF_001643275.2
  0.0001	18	18	subspecies	154757	                GB_GCA_012933685.1
  0.0001	17	17	subspecies	154748	                RS_GCF_002180335.1
  0.0001	11	11	subspecies	154728	                RS_GCF_003692675.1
  0.0001	11	11	subspecies	154790	                RS_GCF_002313065.1
  0.0001	8	8	subspecies	154738	                RS_GCF_000196395.1
  0.0000	5	5	subspecies	154777	                RS_GCF_008370735.1
  0.0000	4	4	subspecies	154791	                RS_GCF_009858135.1
  0.0000	2	2	subspecies	154772	                RS_GCF_009858115.1
  0.0000	1	1	subspecies	154781	                RS_GCF_002214265.1
  0.0000	1	1	subspecies	154793	                RS_GCF_002214245.1
  0.0811	11876	1471	species	183371	              s__Aeromonas rivipollensis
  0.0359	5250	5250	subspecies	183380	                RS_GCF_012273595.1
  0.0348	5100	5100	subspecies	183379	                RS_GCF_003015165.1
  0.0002	29	29	subspecies	183384	                RS_GCF_013085485.1
  0.0002	26	26	subspecies	183381	                RS_GCF_000512185.1
  0.0803	11759	1134	species	165888	              s__Aeromonas dhakensis
  0.0365	5339	5339	subspecies	165899	                GB_GCA_013205705.1
  0.0360	5263	5263	subspecies	165913	                RS_GCF_000612075.2
  0.0002	23	23	subspecies	165920	                RS_GCF_002285935.1
  0.0802	11744	11206	species	149969	              s__Aeromonas hydrophila
  0.0015	222	222	subspecies	149975	                RS_GCF_001019645.1
  0.0003	47	47	subspecies	150047	                GB_GCA_014218195.1
  0.0003	42	42	subspecies	149970	                RS_GCF_004684305.1
  0.0003	39	39	subspecies	150004	                GB_GCA_014217525.1
  0.0002	25	25	subspecies	150041	                RS_GCF_003014775.1
  0.0002	22	22	subspecies	150050	                RS_GCF_002934425.1
  0.0001	20	20	subspecies	150016	                RS_GCF_009791455.1
  0.0001	18	18	subspecies	150013	                RS_GCF_000940915.1
  0.0001	16	16	subspecies	149980	                RS_GCF_000963645.1
  0.0001	14	14	subspecies	149995	                RS_GCF_002850695.3
  0.0001	13	13	subspecies	149998	                RS_GCF_003491245.1
  0.0001	13	13	subspecies	150017	                RS_GCF_000014805.1
  0.0001	12	12	subspecies	150023	                RS_GCF_013085525.1
  0.0001	11	11	subspecies	150037	                RS_GCF_001687125.1
  0.0000	7	7	subspecies	150034	                RS_GCF_013085505.1
  0.0000	6	6	subspecies	150051	                RS_GCF_014161955.1
  0.0000	3	3	subspecies	150001	                RS_GCF_004684325.1
  0.0000	2	2	subspecies	149984	                RS_GCF_011602425.1
  0.0000	2	2	subspecies	150058	                RS_GCF_000819505.1
  0.0000	1	1	subspecies	150003	                RS_GCF_003491225.1
  0.0000	1	1	subspecies	150006	                RS_GCF_001683535.1
  0.0000	1	1	subspecies	149985	                RS_GCF_001895965.1
  0.0000	1	1	subspecies	150042	                RS_GCF_001518775.1
  0.0790	11557	6094	species	153625	              s__Aeromonas caviae
  0.0182	2661	2661	subspecies	153629	                RS_GCF_014168635.1
  0.0180	2634	2634	subspecies	153628	                RS_GCF_014158455.1
  0.0002	27	27	subspecies	153688	                RS_GCF_014169235.1
  0.0001	18	18	subspecies	153637	                GB_GCA_000959705.2
  0.0001	13	13	subspecies	153641	                GB_GCA_003294925.2
  0.0001	13	13	subspecies	153642	                RS_GCF_002903485.1
  0.0001	13	13	subspecies	153643	                RS_GCF_000783775.2
  0.0001	13	13	subspecies	153649	                RS_GCF_002934795.1
  0.0001	11	11	subspecies	153687	                RS_GCF_007179295.1
  0.0001	10	10	subspecies	153689	                RS_GCF_900476005.1
  0.0001	9	9	subspecies	153632	                RS_GCF_002902865.1
  0.0001	9	9	subspecies	153679	                RS_GCF_014169735.1
  0.0001	8	8	subspecies	153640	                RS_GCF_002903405.1
  0.0000	7	7	subspecies	153652	                RS_GCF_013487985.1
  0.0000	5	5	subspecies	153682	                RS_GCF_002934285.1
  0.0000	4	4	subspecies	153693	                RS_GCF_014162015.1
  0.0000	4	4	subspecies	153671	                RS_GCF_013488005.1
  0.0000	2	2	subspecies	153654	                RS_GCF_014168615.1
  0.0000	1	1	subspecies	153673	                RS_GCF_013487965.1
  0.0000	1	1	subspecies	153691	                RS_GCF_003294855.2
  0.0781	11438	1310	species	183567	              s__Aeromonas allosaccharophila
  0.0377	5525	5525	subspecies	183568	                RS_GCF_014169795.1
  0.0313	4586	4586	subspecies	183574	                RS_GCF_014169875.1
  0.0001	17	17	subspecies	183578	                RS_GCF_014168995.1
  0.0770	11264	591	species	186233	              s__Aeromonas jandaei
  0.0382	5593	5593	subspecies	186234	                GB_GCA_014217485.1
  0.0346	5070	5070	subspecies	186235	                RS_GCF_014168715.1
  0.0001	10	10	subspecies	186239	                RS_GCF_014217505.1
  0.0744	10883	6873	species	184429	              s__Aeromonas media
  0.0141	2062	2062	subspecies	184431	                RS_GCF_009931135.1
  0.0128	1876	1876	subspecies	184432	                RS_GCF_000287215.2
  0.0002	27	27	subspecies	184438	                RS_GCF_014161425.1
  0.0001	21	21	subspecies	184439	                RS_GCF_014109865.1
  0.0001	14	14	subspecies	184435	                RS_GCF_013085725.1
  0.0000	7	7	subspecies	184440	                RS_GCF_013085745.1
  0.0000	2	2	subspecies	184441	                RS_GCF_013085785.1
  0.0000	1	1	subspecies	184437	                RS_GCF_013085765.1
  0.0010	148	40	species	146178	              s__Aeromonas veronii
  0.0001	13	13	subspecies	146298	                RS_GCF_001634325.1
  0.0001	13	13	subspecies	146225	                RS_GCF_009755745.1
  0.0001	11	11	subspecies	146237	                GB_GCA_002866885.2
  0.0001	9	9	subspecies	146200	                GB_GCA_001634345.1
  0.0001	8	8	subspecies	146295	                RS_GCF_003722175.1
  0.0000	7	7	subspecies	146184	                RS_GCF_011045495.1
  0.0000	7	7	subspecies	146251	                RS_GCF_000464515.2
  0.0000	7	7	subspecies	146205	                RS_GCF_009834065.1
  0.0000	6	6	subspecies	146210	                RS_GCF_009833025.1
  0.0000	5	5	subspecies	146240	                RS_GCF_002803925.1
  0.0000	5	5	subspecies	146197	                RS_GCF_001593245.1
  0.0000	4	4	subspecies	146215	                RS_GCF_008693705.1
  0.0000	3	3	subspecies	146213	                RS_GCF_002803945.1
  0.0000	3	3	subspecies	146212	                RS_GCF_014169835.1
  0.0000	3	3	subspecies	146259	                RS_GCF_000204115.1
  0.0000	2	2	subspecies	146267	                RS_GCF_013415825.1
  0.0000	2	2	subspecies	146180	                RS_GCF_003491365.1
  0.0000	3	0	species	210504	              s__Aeromonas bestiarum
  0.0000	3	3	subspecies	210508	                RS_GCF_002587065.1
  0.0000	1	0	species	185246	              s__Aeromonas sobria
  0.0000	1	1	subspecies	185254	                RS_GCF_002586745.1
  0.5843	85518	17	family	161746	          f__Shewanellaceae
  0.5841	85501	1691	genus	161747	            g__Shewanella
  0.0838	12268	974	species	226649	              s__Shewanella marisflavi
  0.0387	5669	5669	subspecies	226652	                RS_GCF_002215585.1
  0.0384	5625	5625	subspecies	226651	                RS_GCF_006494755.1
  0.0837	12253	2614	species	248363	              s__Shewanella polaris
  0.0331	4842	4842	subspecies	248365	                RS_GCF_005234075.1
  0.0328	4797	4797	subspecies	248364	                RS_GCF_006385555.1
  0.0834	12207	11989	species	250757	              s__Shewanella oneidensis
  0.0014	200	200	subspecies	250759	                RS_GCF_000146165.2
  0.0001	18	18	subspecies	250758	                RS_GCF_013267215.1
  0.0833	12194	7861	species	179218	              s__Shewanella baltica
  0.0274	4008	4008	subspecies	179219	                RS_GCF_000021665.1
  0.0015	221	221	subspecies	179222	                RS_GCF_000179535.2
  0.0003	51	51	subspecies	179228	                RS_GCF_000147735.2
  0.0001	17	17	subspecies	179233	                RS_GCF_900636855.1
  0.0001	15	15	subspecies	179229	                RS_GCF_003030925.1
  0.0001	9	9	subspecies	179223	                RS_GCF_003052765.1
  0.0001	8	8	subspecies	179226	                RS_GCF_000017325.1
  0.0000	2	2	subspecies	179230	                RS_GCF_000015845.1
  0.0000	1	1	subspecies	179225	                RS_GCF_000018765.1
  0.0000	1	1	subspecies	179232	                RS_GCF_000178875.2
  0.0824	12063	11955	species	188147	              s__Shewanella putrefaciens
  0.0003	47	47	subspecies	188157	                RS_GCF_000169215.2
  0.0002	32	32	subspecies	188156	                RS_GCF_000015185.1
  0.0002	24	24	subspecies	188155	                RS_GCF_003044255.1
  0.0000	3	3	subspecies	188154	                RS_GCF_000016585.1
  0.0000	2	2	subspecies	188153	                RS_GCF_009730575.1
  0.0814	11912	946	species	238894	              s__Shewanella sp000014665
  0.0377	5519	5519	subspecies	238896	                RS_GCF_000014665.1
  0.0372	5447	5447	subspecies	238895	                RS_GCF_000014685.1
  0.0743	10878	678	species	216682	              s__Shewanella bicestrii
  0.0353	5171	5171	subspecies	216684	                RS_GCF_900636665.1
  0.0344	5029	5029	subspecies	216685	                RS_GCF_002216875.1
  0.0001	15	0	species	246510	              s__Shewanella sp000203935
  0.0001	15	15	subspecies	246512	                RS_GCF_000203935.1
  0.0000	4	0	species	171903	              s__Shewanella xiamenensis
  0.0000	4	4	subspecies	171922	                RS_GCF_002209245.2
  0.0000	4	0	species	221318	              s__Shewanella decolorationis
  0.0000	4	4	subspecies	221319	                RS_GCF_004354305.1
  0.0000	4	0	species	237941	              s__Shewanella loihica
  0.0000	4	4	subspecies	237943	                RS_GCF_000016065.1
  0.0000	4	0	species	291537	              s__Shewanella sp002838165
  0.0000	4	4	subspecies	291538	                RS_GCF_002838165.1
  0.0000	2	0	species	201506	              s__Shewanella sp002966515
  0.0000	2	2	subspecies	201507	                RS_GCF_002966515.1
  0.0000	1	0	species	203818	              s__Shewanella frigidimarina
  0.0000	1	1	subspecies	203819	                RS_GCF_000014705.1
  0.0000	1	0	species	221990	              s__Shewanella sp002836315
  0.0000	1	1	subspecies	221993	                RS_GCF_010092445.1
  0.0000	1	0	family	248867	          f__DSM-103792
  0.0000	1	0	genus	248868	            g__Permianibacter
  0.0000	1	0	species	248869	              s__Permianibacter aggregans
  0.0000	1	1	subspecies	248870	                RS_GCF_009756665.1
  10.8025	1581161	112	order	71059	        o__Pseudomonadales
  7.7963	1141144	5378	family	71060	          f__Pseudomonadaceae
  6.7680	990626	16956	genus	113631	            g__Pseudomonas_E
  0.0837	12256	887	species	195477	              s__Pseudomonas_E asplenii
  0.0389	5699	5699	subspecies	195479	                RS_GCF_900105475.1
  0.0387	5670	5670	subspecies	195481	                RS_GCF_900108595.1
  0.0837	12256	2988	species	187137	              s__Pseudomonas_E putida_B
  0.0320	4678	4678	subspecies	187145	                RS_GCF_001636055.1
  0.0314	4590	4590	subspecies	187140	                RS_GCF_003290365.1
  0.0837	12245	152	species	245055	              s__Pseudomonas_E arsenicoxydans
  0.0414	6066	6066	subspecies	245057	                GB_GCA_004135995.1
  0.0412	6027	6027	subspecies	245056	                RS_GCF_900103875.1
  0.0836	12242	6436	species	194142	              s__Pseudomonas_E sp003033885
  0.0199	2916	2916	subspecies	194143	                RS_GCF_900156295.1
  0.0196	2876	2876	subspecies	194144	                RS_GCF_003033885.1
  0.0001	14	14	subspecies	194149	                RS_GCF_013283895.1
  0.0836	12241	12230	species	243301	              s__Pseudomonas_E sp012935755
  0.0000	6	6	subspecies	243303	                RS_GCF_012935675.1
  0.0000	5	5	subspecies	243302	                RS_GCF_012935755.1
  0.0836	12238	12187	species	202358	              s__Pseudomonas_E thivervalensis
  0.0003	37	37	subspecies	202361	                RS_GCF_900102295.1
  0.0001	8	8	subspecies	202360	                GB_GCA_003293395.1
  0.0000	6	6	subspecies	202359	                GB_GCA_003293325.1
  0.0836	12237	12037	species	203052	              s__Pseudomonas_E plecoglossicida
  0.0008	110	110	subspecies	203055	                RS_GCF_013378035.1
  0.0006	90	90	subspecies	203058	                RS_GCF_003391255.1
  0.0836	12235	4016	species	176335	              s__Pseudomonas_E sp001655615
  0.0284	4155	4155	subspecies	176337	                RS_GCF_005938665.2
  0.0276	4039	4039	subspecies	176341	                RS_GCF_001655615.1
  0.0002	25	25	subspecies	176349	                RS_GCF_002355315.1
  0.0836	12233	4120	species	183001	              s__Pseudomonas_E mendocina
  0.0281	4111	4111	subspecies	183002	                RS_GCF_000733715.2
  0.0272	3986	3986	subspecies	183006	                RS_GCF_900636545.1
  0.0001	16	16	subspecies	183007	                RS_GCF_000204295.1
  0.0835	12229	7978	species	157053	              s__Pseudomonas_E protegens
  0.0288	4210	4210	subspecies	157062	                RS_GCF_000828695.1
  0.0001	18	18	subspecies	157068	                RS_GCF_002006545.1
  0.0001	10	10	subspecies	157061	                RS_GCF_009745915.1
  0.0000	5	5	subspecies	157077	                RS_GCF_008807715.1
  0.0000	5	5	subspecies	157093	                RS_GCF_008807695.1
  0.0000	3	3	subspecies	157087	                RS_GCF_008807675.1
  0.0835	12221	7504	species	186107	              s__Pseudomonas_E mosselii
  0.0305	4461	4461	subspecies	186115	                RS_GCF_001515585.1
  0.0017	252	252	subspecies	186112	                RS_GCF_002736065.1
  0.0000	4	4	subspecies	186118	                RS_GCF_002309555.1
  0.0834	12211	6377	species	193313	              s__Pseudomonas_E laurylsulfatiphila
  0.0391	5716	5716	subspecies	193314	                RS_GCF_000316175.1
  0.0008	114	114	subspecies	193318	                GB_GCA_003952645.1
  0.0000	4	4	subspecies	193319	                GB_GCA_003952685.1
  0.0834	12211	7340	species	203138	              s__Pseudomonas_E corrugata
  0.0168	2466	2466	subspecies	203139	                RS_GCF_900106085.1
  0.0164	2405	2405	subspecies	203144	                RS_GCF_001708425.1
  0.0834	12210	1202	species	214776	              s__Pseudomonas_E sichuanensis
  0.0378	5530	5530	subspecies	214778	                RS_GCF_003940825.1
  0.0374	5478	5478	subspecies	214780	                RS_GCF_003940785.1
  0.0834	12201	7095	species	188932	              s__Pseudomonas_E parafulva_B
  0.0172	2514	2514	subspecies	188935	                RS_GCF_002021815.1
  0.0171	2508	2508	subspecies	188939	                GB_GCA_002215625.1
  0.0006	84	84	subspecies	188941	                RS_GCF_002812565.2
  0.0834	12201	3004	species	170979	              s__Pseudomonas_E lurida
  0.0316	4618	4618	subspecies	171002	                RS_GCF_001708485.1
  0.0313	4579	4579	subspecies	170989	                RS_GCF_002966835.1
  0.0833	12198	12149	species	214818	              s__Pseudomonas_E mucidolens
  0.0002	31	31	subspecies	214822	                RS_GCF_900106045.1
  0.0001	18	18	subspecies	214820	                RS_GCF_900475945.1
  0.0833	12197	12030	species	217020	              s__Pseudomonas_E taetrolens
  0.0010	150	150	subspecies	217022	                RS_GCF_900637735.1
  0.0001	17	17	subspecies	217021	                RS_GCF_900475285.1
  0.0833	12193	5739	species	187503	              s__Pseudomonas_E sp003852235
  0.0237	3469	3469	subspecies	187505	                RS_GCF_003851705.1
  0.0199	2915	2915	subspecies	187504	                RS_GCF_003852275.1
  0.0001	15	15	subspecies	187513	                RS_GCF_003852065.1
  0.0001	12	12	subspecies	187509	                RS_GCF_003852255.1
  0.0001	10	10	subspecies	187511	                RS_GCF_003852235.1
  0.0001	9	9	subspecies	187507	                RS_GCF_003852375.1
  0.0000	7	7	subspecies	187506	                RS_GCF_003852295.1
  0.0000	6	6	subspecies	187508	                RS_GCF_003852335.1
  0.0000	6	6	subspecies	187512	                RS_GCF_003851745.1
  0.0000	5	5	subspecies	187510	                RS_GCF_003852355.1
  0.0832	12183	3994	species	202446	              s__Pseudomonas_E orientalis
  0.0373	5453	5453	subspecies	202448	                RS_GCF_003851585.1
  0.0182	2659	2659	subspecies	202449	                RS_GCF_003851645.1
  0.0004	58	58	subspecies	202452	                RS_GCF_900105795.1
  0.0001	16	16	subspecies	202450	                RS_GCF_003852045.1
  0.0000	3	3	subspecies	202451	                RS_GCF_003851605.1
  0.0832	12181	8055	species	194395	              s__Pseudomonas_E umsongensis
  0.0152	2230	2230	subspecies	194399	                RS_GCF_008824165.1
  0.0128	1875	1875	subspecies	194401	                RS_GCF_900105285.1
  0.0001	21	21	subspecies	194402	                RS_GCF_012647205.1
  0.0832	12181	7724	species	179474	              s__Pseudomonas_E simiae
  0.0160	2336	2336	subspecies	179480	                RS_GCF_000963495.1
  0.0144	2111	2111	subspecies	179475	                RS_GCF_000934565.1
  0.0001	10	10	subspecies	179488	                RS_GCF_000698265.1
  0.0832	12180	2430	species	193158	              s__Pseudomonas_E sp003014915
  0.0334	4887	4887	subspecies	193160	                RS_GCF_003852315.1
  0.0332	4863	4863	subspecies	193162	                RS_GCF_012935655.1
  0.0832	12176	287	species	175820	              s__Pseudomonas_E marginalis
  0.0407	5951	5951	subspecies	175827	                RS_GCF_006547025.1
  0.0406	5938	5938	subspecies	175830	                RS_GCF_006517195.1
  0.0832	12173	12171	species	230109	              s__Pseudomonas_E sp900187635
  0.0000	1	1	subspecies	230111	                RS_GCF_009834545.1
  0.0000	1	1	subspecies	230112	                RS_GCF_009866725.1
  0.0832	12173	12115	species	216932	              s__Pseudomonas_E fluorescens_F
  0.0002	31	31	subspecies	216936	                RS_GCF_014117365.1
  0.0002	27	27	subspecies	216934	                RS_GCF_013363935.1
  0.0831	12170	12169	species	202425	              s__Pseudomonas_E fluorescens_AP
  0.0000	1	1	subspecies	202427	                RS_GCF_013407925.2
  0.0831	12168	12164	species	188767	              s__Pseudomonas_E khazarica
  0.0000	4	4	subspecies	188776	                RS_GCF_009363395.1
  0.0831	12163	1377	species	202678	              s__Pseudomonas_E koreensis
  0.0369	5395	5395	subspecies	202681	                RS_GCF_900101415.1
  0.0368	5391	5391	subspecies	202683	                RS_GCF_001654515.1
  0.0831	12161	11578	species	175284	              s__Pseudomonas_E brassicacearum
  0.0026	381	381	subspecies	175297	                RS_GCF_008370715.1
  0.0011	167	167	subspecies	175296	                RS_GCF_000263695.1
  0.0001	18	18	subspecies	175298	                RS_GCF_000194805.1
  0.0001	8	8	subspecies	175304	                RS_GCF_001449085.1
  0.0000	5	5	subspecies	175301	                RS_GCF_001746815.1
  0.0000	4	4	subspecies	175302	                RS_GCF_900103245.1
  0.0831	12160	12097	species	202007	              s__Pseudomonas_E psychrophila
  0.0002	32	32	subspecies	202009	                RS_GCF_900106105.1
  0.0002	31	31	subspecies	202012	                RS_GCF_011040435.1
  0.0831	12157	3138	species	207815	              s__Pseudomonas_E yamanorum
  0.0309	4522	4522	subspecies	207817	                RS_GCF_900105735.1
  0.0307	4497	4497	subspecies	207818	                RS_GCF_001612705.2
  0.0830	12155	4172	species	198147	              s__Pseudomonas_E sp000346225
  0.0277	4051	4051	subspecies	198149	                RS_GCF_001543265.1
  0.0269	3932	3932	subspecies	198153	                RS_GCF_000346225.2
  0.0830	12153	202	species	224092	              s__Pseudomonas_E alkylphenolica
  0.0411	6022	6022	subspecies	224095	                RS_GCF_009755645.1
  0.0405	5929	5929	subspecies	224093	                RS_GCF_000746525.1
  0.0830	12152	7056	species	197120	              s__Pseudomonas_E mediterranea
  0.0175	2563	2563	subspecies	197126	                RS_GCF_900106005.1
  0.0173	2533	2533	subspecies	197127	                RS_GCF_009818265.1
  0.0830	12147	2011	species	187340	              s__Pseudomonas_E poae
  0.0349	5104	5104	subspecies	187344	                RS_GCF_900103965.1
  0.0344	5032	5032	subspecies	187347	                RS_GCF_000336465.1
  0.0830	12146	3565	species	202192	              s__Pseudomonas_E fluorescens_AK
  0.0412	6035	6035	subspecies	202196	                RS_GCF_002865505.1
  0.0172	2524	2524	subspecies	202195	                RS_GCF_010668965.1
  0.0001	12	12	subspecies	202197	                RS_GCF_013347965.1
  0.0001	10	10	subspecies	202198	                RS_GCF_003410335.1
  0.0830	12146	2791	species	210565	              s__Pseudomonas_E sp004011755
  0.0322	4711	4711	subspecies	210567	                RS_GCF_004011755.1
  0.0317	4644	4644	subspecies	210566	                RS_GCF_009866785.1
  0.0830	12142	4157	species	224519	              s__Pseudomonas_E parafulva_A
  0.0277	4061	4061	subspecies	224522	                RS_GCF_003410295.1
  0.0268	3924	3924	subspecies	224521	                RS_GCF_000800255.1
  0.0829	12139	2429	species	212500	              s__Pseudomonas_E sp001547895
  0.0332	4866	4866	subspecies	212504	                RS_GCF_001547915.1
  0.0331	4844	4844	subspecies	212503	                RS_GCF_001547895.1
  0.0829	12137	566	species	234815	              s__Pseudomonas_E granadensis
  0.0395	5786	5786	subspecies	234816	                RS_GCF_900105485.1
  0.0395	5785	5785	subspecies	234817	                RS_GCF_900104975.1
  0.0829	12136	11996	species	182561	              s__Pseudomonas_E fluorescens
  0.0005	76	76	subspecies	182573	                RS_GCF_900475215.1
  0.0004	64	64	subspecies	182567	                RS_GCF_900215245.1
  0.0829	12134	2262	species	165050	              s__Pseudomonas_E sp002874965
  0.0341	4990	4990	subspecies	165069	                RS_GCF_004379315.1
  0.0334	4882	4882	subspecies	165063	                RS_GCF_002874965.1
  0.0828	12126	2446	species	240900	              s__Pseudomonas_E sp000931465
  0.0331	4850	4850	subspecies	240901	                RS_GCF_000963835.1
  0.0330	4830	4830	subspecies	240902	                RS_GCF_000931465.1
  0.0828	12126	4088	species	171827	              s__Pseudomonas_E fragi
  0.0277	4054	4054	subspecies	171837	                RS_GCF_900105835.1
  0.0271	3970	3970	subspecies	171845	                RS_GCF_002128325.1
  0.0001	10	10	subspecies	171850	                RS_GCF_001703595.1
  0.0000	4	4	subspecies	171847	                RS_GCF_002205455.1
  0.0828	12122	8047	species	175714	              s__Pseudomonas_E proteolytica
  0.0276	4046	4046	subspecies	175719	                RS_GCF_002949995.1
  0.0002	23	23	subspecies	175730	                RS_GCF_009873475.1
  0.0000	5	5	subspecies	175718	                RS_GCF_012935735.1
  0.0000	1	1	subspecies	175727	                RS_GCF_012935775.1
  0.0828	12121	2153	species	178193	              s__Pseudomonas_E putida_A
  0.0342	5013	5013	subspecies	178200	                RS_GCF_004526365.1
  0.0339	4955	4955	subspecies	178203	                RS_GCF_004683905.1
  0.0827	12107	336	species	194501	              s__Pseudomonas_E putida_M
  0.0403	5896	5896	subspecies	194503	                RS_GCF_002736125.1
  0.0401	5875	5875	subspecies	194506	                RS_GCF_002736045.1
  0.0826	12090	5419	species	167537	              s__Pseudomonas_E veronii
  0.0231	3384	3384	subspecies	167549	                RS_GCF_002028325.1
  0.0220	3223	3223	subspecies	167542	                GB_GCA_900092355.1
  0.0002	25	25	subspecies	167550	                RS_GCF_004919535.4
  0.0001	20	20	subspecies	167556	                RS_GCF_002949975.1
  0.0001	19	19	subspecies	167558	                GB_GCA_903970695.1
  0.0825	12075	12026	species	183811	              s__Pseudomonas_E kilonensis
  0.0002	36	36	subspecies	183822	                RS_GCF_000237065.1
  0.0001	13	13	subspecies	183817	                RS_GCF_002879715.1
  0.0823	12051	4378	species	164174	              s__Pseudomonas_E mandelii
  0.0268	3928	3928	subspecies	164175	                RS_GCF_000257545.3
  0.0255	3733	3733	subspecies	164179	                RS_GCF_900106065.1
  0.0001	12	12	subspecies	164190	                RS_GCF_013260315.1
  0.0823	12044	1570	species	198547	              s__Pseudomonas_E glycinae
  0.0397	5810	5810	subspecies	198552	                RS_GCF_000012445.1
  0.0317	4642	4642	subspecies	198551	                GB_GCA_001594225.2
  0.0002	22	22	subspecies	198554	                RS_GCF_003055645.1
  0.0822	12025	7452	species	164015	              s__Pseudomonas_E fulva
  0.0183	2685	2685	subspecies	164022	                RS_GCF_002688705.1
  0.0128	1871	1871	subspecies	164030	                RS_GCF_001511775.1
  0.0001	9	9	subspecies	164036	                RS_GCF_002951475.1
  0.0001	8	8	subspecies	164039	                RS_GCF_006351945.1
  0.0820	12004	7069	species	152548	              s__Pseudomonas_E hunanensis
  0.0245	3579	3579	subspecies	152552	                RS_GCF_002953115.1
  0.0085	1240	1240	subspecies	152551	                RS_GCF_014076515.1
  0.0002	25	25	subspecies	152616	                RS_GCF_002948105.1
  0.0001	15	15	subspecies	152624	                RS_GCF_000226035.2
  0.0001	15	15	subspecies	152599	                RS_GCF_013425825.1
  0.0001	12	12	subspecies	152607	                RS_GCF_001655295.1
  0.0001	10	10	subspecies	152556	                RS_GCF_003671955.1
  0.0001	9	9	subspecies	152602	                RS_GCF_014217705.1
  0.0000	7	7	subspecies	152598	                RS_GCF_000281215.1
  0.0000	6	6	subspecies	152595	                RS_GCF_900156185.1
  0.0000	4	4	subspecies	152604	                RS_GCF_013305625.1
  0.0000	3	3	subspecies	152575	                RS_GCF_000016865.1
  0.0000	3	3	subspecies	152605	                RS_GCF_000495455.2
  0.0000	3	3	subspecies	152558	                RS_GCF_000264665.3
  0.0000	1	1	subspecies	152568	                RS_GCF_000183645.1
  0.0000	1	1	subspecies	152574	                RS_GCF_900167985.1
  0.0000	1	1	subspecies	152561	                RS_GCF_000271965.2
  0.0000	1	1	subspecies	152620	                RS_GCF_900636645.1
  0.0820	12002	163	species	175179	              s__Pseudomonas_E sp001655595
  0.0407	5950	5950	subspecies	175186	                RS_GCF_001655595.1
  0.0402	5889	5889	subspecies	175190	                RS_GCF_010448615.1
  0.0819	11995	3455	species	206361	              s__Pseudomonas_E sp001705835
  0.0295	4313	4313	subspecies	206365	                RS_GCF_001705995.2
  0.0289	4227	4227	subspecies	206366	                RS_GCF_003850565.1
  0.0819	11989	8364	species	197128	              s__Pseudomonas_E taiwanensis
  0.0137	2004	2004	subspecies	197134	                RS_GCF_002947915.1
  0.0110	1610	1610	subspecies	197131	                RS_GCF_002947975.1
  0.0001	11	11	subspecies	197135	                RS_GCF_000494915.1
  0.0818	11974	7996	species	172977	              s__Pseudomonas_E fluorescens_AN
  0.0260	3809	3809	subspecies	172980	                RS_GCF_000508205.1
  0.0009	132	132	subspecies	172978	                RS_GCF_001708465.1
  0.0003	37	37	subspecies	172982	                RS_GCF_001708445.1
  0.0817	11965	8821	species	157603	              s__Pseudomonas_E syringae_M
  0.0111	1624	1624	subspecies	157619	                RS_GCF_002905815.2
  0.0099	1449	1449	subspecies	157614	                RS_GCF_000452565.2
  0.0002	26	26	subspecies	157647	                RS_GCF_900235865.1
  0.0001	14	14	subspecies	157639	                RS_GCF_000452525.3
  0.0001	10	10	subspecies	157653	                RS_GCF_009176725.1
  0.0001	8	8	subspecies	157634	                RS_GCF_900235825.1
  0.0000	7	7	subspecies	157623	                RS_GCF_000988485.1
  0.0000	6	6	subspecies	157637	                RS_GCF_000012245.1
  0.0817	11964	6729	species	152942	              s__Pseudomonas_E tremae
  0.0321	4697	4697	subspecies	152990	                RS_GCF_000156995.2
  0.0037	537	537	subspecies	152980	                GB_GCA_009734285.1
  0.0000	1	1	subspecies	153017	                GB_GCA_011765175.1
  0.0817	11958	1972	species	202739	              s__Pseudomonas_E mendocina_A
  0.0341	4998	4998	subspecies	202740	                RS_GCF_002155165.1
  0.0339	4964	4964	subspecies	202743	                RS_GCF_000016565.1
  0.0002	24	24	subspecies	202744	                RS_GCF_002442555.1
  0.0817	11956	4471	species	147981	              s__Pseudomonas_E syringae
  0.0276	4047	4047	subspecies	147998	                RS_GCF_000452445.2
  0.0223	3263	3263	subspecies	148016	                RS_GCF_000412165.1
  0.0009	127	127	subspecies	148067	                RS_GCF_000988395.1
  0.0001	20	20	subspecies	148074	                RS_GCF_000331385.1
  0.0001	16	16	subspecies	148076	                RS_GCF_001482725.1
  0.0001	12	12	subspecies	148042	                RS_GCF_003047185.1
  0.0816	11945	132	species	169658	              s__Pseudomonas_E koreensis_C
  0.0408	5971	5971	subspecies	169676	                RS_GCF_900156235.1
  0.0399	5842	5842	subspecies	169684	                RS_GCF_001605965.1
  0.0813	11895	8352	species	137032	              s__Pseudomonas_E amygdali
  0.0228	3342	3342	subspecies	137071	                RS_GCF_900235885.1
  0.0007	108	108	subspecies	137103	                RS_GCF_000012205.1
  0.0002	36	36	subspecies	137237	                RS_GCF_000164015.3
  0.0002	31	31	subspecies	137247	                RS_GCF_002068135.1
  0.0001	12	12	subspecies	137155	                RS_GCF_000145945.2
  0.0000	6	6	subspecies	137244	                RS_GCF_002905685.2
  0.0000	3	3	subspecies	137109	                RS_GCF_005937945.2
  0.0000	3	3	subspecies	137182	                GB_GCA_900289125.1
  0.0000	2	2	subspecies	137238	                RS_GCF_900235815.1
  0.0810	11863	7448	species	155695	              s__Pseudomonas_E chlororaphis_F
  0.0191	2791	2791	subspecies	155697	                RS_GCF_002355875.1
  0.0104	1520	1520	subspecies	155696	                GB_GCA_003851285.1
  0.0002	23	23	subspecies	155707	                RS_GCF_013466605.1
  0.0001	13	13	subspecies	155701	                RS_GCF_000761195.1
  0.0001	10	10	subspecies	155752	                RS_GCF_900104715.1
  0.0001	10	10	subspecies	155711	                RS_GCF_900104985.1
  0.0000	6	6	subspecies	155706	                RS_GCF_003851165.1
  0.0000	5	5	subspecies	155712	                RS_GCF_003851345.1
  0.0000	5	5	subspecies	155732	                RS_GCF_010092525.1
  0.0000	4	4	subspecies	155700	                GB_GCA_003851425.1
  0.0000	4	4	subspecies	155714	                RS_GCF_003851265.1
  0.0000	3	3	subspecies	155742	                RS_GCF_003851365.1
  0.0000	3	3	subspecies	155734	                RS_GCF_003851225.1
  0.0000	2	2	subspecies	155720	                RS_GCF_003851405.1
  0.0000	2	2	subspecies	155755	                RS_GCF_003850345.1
  0.0000	2	2	subspecies	155739	                RS_GCF_003851305.1
  0.0000	2	2	subspecies	155726	                RS_GCF_900104995.1
  0.0000	2	2	subspecies	155718	                RS_GCF_003008635.1
  0.0000	1	1	subspecies	155722	                RS_GCF_003850525.1
  0.0000	1	1	subspecies	155710	                RS_GCF_003850425.1
  0.0000	1	1	subspecies	155746	                RS_GCF_012029635.1
  0.0000	1	1	subspecies	155751	                RS_GCF_003851385.1
  0.0000	1	1	subspecies	155703	                RS_GCF_000264555.1
  0.0000	1	1	subspecies	155702	                RS_GCF_000698865.1
  0.0000	1	1	subspecies	155758	                RS_GCF_009834495.1
  0.0000	1	1	subspecies	155760	                RS_GCF_003850485.1
  0.0810	11861	10128	species	191553	              s__Pseudomonas_E putida_P
  0.0065	947	947	subspecies	191554	                RS_GCF_000019125.1
  0.0054	786	786	subspecies	191561	                RS_GCF_001886975.1
  0.0808	11833	3850	species	168106	              s__Pseudomonas_E chlororaphis
  0.0267	3908	3908	subspecies	168107	                RS_GCF_000281915.1
  0.0266	3899	3899	subspecies	168108	                RS_GCF_003851145.1
  0.0006	84	84	subspecies	168115	                RS_GCF_001602135.1
  0.0004	54	54	subspecies	168118	                RS_GCF_003851985.1
  0.0001	19	19	subspecies	168129	                RS_GCF_003850605.1
  0.0001	10	10	subspecies	168110	                RS_GCF_002843625.1
  0.0001	9	9	subspecies	168130	                RS_GCF_003945765.1
  0.0808	11829	1645	species	172739	              s__Pseudomonas_E rhodesiae
  0.0357	5221	5221	subspecies	172754	                RS_GCF_013285305.1
  0.0339	4963	4963	subspecies	172744	                RS_GCF_900105575.1
  0.0807	11808	42	species	221769	              s__Pseudomonas_E libanensis
  0.0403	5901	5901	subspecies	221772	                RS_GCF_003851465.1
  0.0401	5865	5865	subspecies	221771	                RS_GCF_900101035.1
  0.0806	11796	11094	species	154436	              s__Pseudomonas_E carnis
  0.0021	310	310	subspecies	154463	                RS_GCF_000698295.1
  0.0012	182	182	subspecies	154446	                RS_GCF_900105085.1
  0.0009	132	132	subspecies	154489	                RS_GCF_002966775.1
  0.0003	49	49	subspecies	154480	                RS_GCF_009827115.1
  0.0001	21	21	subspecies	154503	                RS_GCF_009648855.1
  0.0000	5	5	subspecies	154498	                RS_GCF_001747385.1
  0.0000	3	3	subspecies	154481	                RS_GCF_000262325.2
  0.0801	11722	4826	species	191637	              s__Pseudomonas_E guariconensis
  0.0241	3531	3531	subspecies	191642	                RS_GCF_014162535.1
  0.0230	3365	3365	subspecies	191643	                RS_GCF_014169055.1
  0.0801	11719	8966	species	162772	              s__Pseudomonas_E monteilii
  0.0163	2387	2387	subspecies	162776	                RS_GCF_002943995.1
  0.0023	335	335	subspecies	162779	                RS_GCF_003691445.1
  0.0001	16	16	subspecies	162803	                RS_GCF_009831395.1
  0.0001	14	14	subspecies	162810	                RS_GCF_009938035.1
  0.0000	1	1	subspecies	162792	                RS_GCF_003671975.1
  0.0800	11710	599	species	169853	              s__Pseudomonas_E lactis
  0.0381	5570	5570	subspecies	169867	                RS_GCF_002591235.1
  0.0377	5513	5513	subspecies	169858	                RS_GCF_003952245.1
  0.0002	28	28	subspecies	169879	                RS_GCF_000263675.1
  0.0799	11699	616	species	175242	              s__Pseudomonas_E putida
  0.0384	5623	5623	subspecies	175262	                RS_GCF_000412675.1
  0.0373	5460	5460	subspecies	175251	                RS_GCF_001630725.2
  0.0796	11644	11329	species	187003	              s__Pseudomonas_E synxantha
  0.0017	246	246	subspecies	187004	                RS_GCF_003851555.1
  0.0002	35	35	subspecies	187006	                RS_GCF_000968415.2
  0.0001	14	14	subspecies	187012	                RS_GCF_003852025.1
  0.0001	13	13	subspecies	187007	                RS_GCF_003851525.1
  0.0000	5	5	subspecies	187011	                RS_GCF_001602175.1
  0.0000	1	1	subspecies	187005	                RS_GCF_901482615.1
  0.0000	1	1	subspecies	187008	                RS_GCF_900105675.1
  0.0795	11642	1845	species	165530	              s__Pseudomonas_E juntendi
  0.0379	5550	5550	subspecies	165532	                RS_GCF_013305665.1
  0.0289	4230	4230	subspecies	165536	                RS_GCF_008605605.1
  0.0001	17	17	subspecies	165543	                RS_GCF_007633355.1
  0.0787	11524	9502	species	160193	              s__Pseudomonas_E asiatica
  0.0129	1892	1892	subspecies	160198	                RS_GCF_000831585.1
  0.0003	45	45	subspecies	160219	                RS_GCF_001908395.1
  0.0002	27	27	subspecies	160238	                RS_GCF_000511325.1
  0.0001	19	19	subspecies	160203	                RS_GCF_014656565.1
  0.0001	14	14	subspecies	160209	                RS_GCF_000325725.1
  0.0001	13	13	subspecies	160237	                RS_GCF_000219705.1
  0.0000	6	6	subspecies	160207	                RS_GCF_013305685.1
  0.0000	4	4	subspecies	160196	                RS_GCF_000510325.1
  0.0000	2	2	subspecies	160227	                RS_GCF_000510285.1
  0.0782	11452	4029	species	179097	              s__Pseudomonas_E soli
  0.0249	3640	3640	subspecies	179100	                RS_GCF_002934345.1
  0.0247	3617	3617	subspecies	179109	                RS_GCF_000498975.2
  0.0011	166	166	subspecies	179113	                RS_GCF_001007005.1
  0.0757	11078	6218	species	187113	              s__Pseudomonas_E putida_H
  0.0172	2511	2511	subspecies	187114	                RS_GCF_002356095.1
  0.0159	2332	2332	subspecies	187120	                RS_GCF_000410575.1
  0.0001	17	17	subspecies	187124	                RS_GCF_007833495.1
  0.0740	10833	6567	species	183058	              s__Pseudomonas_E oleovorans
  0.0290	4244	4244	subspecies	183060	                RS_GCF_003408635.1
  0.0001	21	21	subspecies	183064	                RS_GCF_000953455.1
  0.0000	1	1	subspecies	183071	                RS_GCF_000297075.2
  0.0733	10736	8108	species	161086	              s__Pseudomonas_E cerasi
  0.0171	2503	2503	subspecies	161087	                RS_GCF_014524645.1
  0.0006	83	83	subspecies	161090	                RS_GCF_900074915.1
  0.0001	18	18	subspecies	161102	                RS_GCF_900235895.1
  0.0001	15	15	subspecies	161115	                RS_GCF_900105295.1
  0.0001	9	9	subspecies	161100	                RS_GCF_001281365.1
  0.0005	71	48	species	131770	              s__Pseudomonas_E avellanae
  0.0000	6	6	subspecies	131957	                RS_GCF_002905795.2
  0.0000	5	5	subspecies	131855	                RS_GCF_900235835.1
  0.0000	3	3	subspecies	131952	                RS_GCF_001913235.1
  0.0000	3	3	subspecies	132050	                RS_GCF_002763655.1
  0.0000	2	2	subspecies	131784	                RS_GCF_000344475.3
  0.0000	1	1	subspecies	131791	                RS_GCF_004323795.1
  0.0000	1	1	subspecies	131891	                RS_GCF_000658965.1
  0.0000	1	1	subspecies	131978	                RS_GCF_000344335.2
  0.0000	1	1	subspecies	132000	                RS_GCF_000007805.1
  0.0001	17	0	species	303960	              s__Pseudomonas_E sihuiensis
  0.0001	17	17	subspecies	303961	                RS_GCF_900106015.1
  0.0001	14	0	species	210709	              s__Pseudomonas_E sp002255865
  0.0001	14	14	subspecies	210712	                GB_GCA_004000515.1
  0.0001	14	0	species	226533	              s__Pseudomonas_E alcaliphila_B
  0.0001	14	14	subspecies	226536	                RS_GCF_001941865.1
  0.0001	13	0	species	207118	              s__Pseudomonas_E putida_Q
  0.0001	13	13	subspecies	207122	                RS_GCF_000498395.2
  0.0001	12	0	species	247741	              s__Pseudomonas_E fluorescens_G
  0.0001	12	12	subspecies	247742	                GB_GCA_902825215.1
  0.0001	10	0	species	169826	              s__Pseudomonas_E sp005233515
  0.0001	10	10	subspecies	169839	                RS_GCF_000512275.1
  0.0001	9	0	species	252519	              s__Pseudomonas_E fluorescens_BB
  0.0001	9	9	subspecies	252520	                RS_GCF_003851495.1
  0.0001	8	0	species	228280	              s__Pseudomonas_E migulae_A
  0.0001	8	8	subspecies	228283	                RS_GCF_014076455.1
  0.0000	7	0	species	250775	              s__Pseudomonas_E fluorescens_H
  0.0000	7	7	subspecies	250776	                RS_GCF_000292795.1
  0.0000	7	0	species	193659	              s__Pseudomonas_E aestus
  0.0000	7	7	subspecies	193666	                RS_GCF_003850545.1
  0.0000	7	0	species	200726	              s__Pseudomonas_E sp003428805
  0.0000	7	7	subspecies	200731	                GB_GCA_003428805.1
  0.0000	6	0	species	185335	              s__Pseudomonas_E koreensis_B
  0.0000	6	6	subspecies	185343	                GB_GCA_003049825.1
  0.0000	6	0	species	221945	              s__Pseudomonas_E trivialis
  0.0000	6	6	subspecies	221946	                RS_GCF_900104885.1
  0.0000	6	0	species	183666	              s__Pseudomonas_E fluorescens_Q
  0.0000	6	6	subspecies	183676	                RS_GCF_001623525.1
  0.0000	5	0	species	249026	              s__Pseudomonas_E putida_T
  0.0000	5	5	subspecies	249027	                RS_GCF_002741075.1
  0.0000	5	0	species	289151	              s__Pseudomonas_E entomophila
  0.0000	5	5	subspecies	289152	                RS_GCF_000026105.1
  0.0000	4	0	species	191627	              s__Pseudomonas_E protegens_A
  0.0000	4	4	subspecies	191632	                RS_GCF_003363755.1
  0.0000	4	0	species	298753	              s__Pseudomonas_E sp009834515
  0.0000	4	4	subspecies	298754	                RS_GCF_009834515.1
  0.0000	4	0	species	184356	              s__Pseudomonas_E jessenii
  0.0000	4	4	subspecies	184362	                RS_GCF_009866745.1
  0.0000	4	0	species	292714	              s__Pseudomonas_E fluorescens_BF
  0.0000	4	4	subspecies	292715	                RS_GCF_003352875.1
  0.0000	4	0	species	294839	              s__Pseudomonas_E sp004786035
  0.0000	4	4	subspecies	294840	                RS_GCF_004786035.1
  0.0000	3	0	species	240596	              s__Pseudomonas_E antarctica_A
  0.0000	3	3	subspecies	240598	                RS_GCF_001647715.1
  0.0000	3	0	species	284297	              s__Pseudomonas_E sp009866765
  0.0000	3	3	subspecies	284298	                RS_GCF_009866765.1
  0.0000	3	0	species	211301	              s__Pseudomonas_E sp003013355
  0.0000	3	3	subspecies	211302	                RS_GCF_003612935.1
  0.0000	3	0	species	185030	              s__Pseudomonas_E sp002112885
  0.0000	3	3	subspecies	185031	                RS_GCF_004006335.1
  0.0000	3	0	species	243093	              s__Pseudomonas_E fluorescens_X
  0.0000	3	3	subspecies	243094	                RS_GCF_000730425.1
  0.0000	3	0	species	293340	              s__Pseudomonas_E putida_V
  0.0000	3	3	subspecies	293341	                RS_GCF_005080685.1
  0.0000	3	0	species	204979	              s__Pseudomonas_E toyotomiensis
  0.0000	3	3	subspecies	204981	                RS_GCF_002037565.1
  0.0000	2	0	species	198336	              s__Pseudomonas_E sp002843605
  0.0000	2	2	subspecies	198340	                RS_GCF_002843605.1
  0.0000	2	0	species	250580	              s__Pseudomonas_E sp001511755
  0.0000	2	2	subspecies	250582	                RS_GCF_001511755.1
  0.0000	2	0	species	229522	              s__Pseudomonas_E sp002753995
  0.0000	2	2	subspecies	229525	                RS_GCF_002753995.1
  0.0000	2	0	species	233144	              s__Pseudomonas_E fluorescens_S
  0.0000	2	2	subspecies	233146	                RS_GCF_000281895.1
  0.0000	2	0	species	252857	              s__Pseudomonas_E sp000242655
  0.0000	2	2	subspecies	252858	                RS_GCF_012935715.1
  0.0000	2	0	species	234853	              s__Pseudomonas_E sp009834565
  0.0000	2	2	subspecies	234855	                RS_GCF_009834565.1
  0.0000	2	0	species	239637	              s__Pseudomonas_E sp002263605
  0.0000	2	2	subspecies	239638	                RS_GCF_009707325.1
  0.0000	2	0	species	224215	              s__Pseudomonas_E antarctica
  0.0000	2	2	subspecies	224216	                RS_GCF_900103795.1
  0.0000	2	0	species	176214	              s__Pseudomonas_E extremorientalis
  0.0000	2	2	subspecies	176228	                RS_GCF_900104365.1
  0.0000	2	0	species	180547	              s__Pseudomonas_E cannabina
  0.0000	2	2	subspecies	180553	                RS_GCF_000145845.2
  0.0000	2	0	species	181167	              s__Pseudomonas_E tolaasii
  0.0000	2	2	subspecies	181168	                RS_GCF_002072675.1
  0.0000	2	0	species	181498	              s__Pseudomonas_E fluorescens_AA
  0.0000	2	2	subspecies	181509	                RS_GCF_001307275.1
  0.0000	2	0	species	192221	              s__Pseudomonas_E prosekii
  0.0000	2	2	subspecies	192224	                RS_GCF_900105155.1
  0.0000	2	0	species	193784	              s__Pseudomonas_E putida_E
  0.0000	2	2	subspecies	193788	                RS_GCF_000019445.1
  0.0000	2	0	species	193920	              s__Pseudomonas_E azotoformans_A
  0.0000	2	2	subspecies	193922	                RS_GCF_001579805.1
  0.0000	2	0	species	202520	              s__Pseudomonas_E trivialis_B
  0.0000	2	2	subspecies	202524	                RS_GCF_001186335.1
  0.0000	2	0	species	205473	              s__Pseudomonas_E synxantha_A
  0.0000	2	2	subspecies	205475	                RS_GCF_000263715.2
  0.0000	2	0	species	217720	              s__Pseudomonas_E donghuensis
  0.0000	2	2	subspecies	217721	                RS_GCF_009866705.1
  0.0000	2	0	species	215058	              s__Pseudomonas_E chlororaphis_E
  0.0000	2	2	subspecies	215062	                RS_GCF_001023535.1
  0.0000	2	0	species	206421	              s__Pseudomonas_E silesiensis
  0.0000	2	2	subspecies	206426	                RS_GCF_001661075.1
  0.0000	1	0	species	267244	              s__Pseudomonas_E sp003851685
  0.0000	1	1	subspecies	267245	                RS_GCF_003851685.1
  0.0000	1	0	species	318322	              s__Pseudomonas_E mendocina_C
  0.0000	1	1	subspecies	318323	                RS_GCF_003008615.1
  0.0000	1	0	species	311865	              s__Pseudomonas_E fluorescens_BT
  0.0000	1	1	subspecies	311866	                RS_GCF_012974785.1
  0.0000	1	0	species	174251	              s__Pseudomonas_E orientalis_A
  0.0000	1	1	subspecies	174269	                RS_GCF_002934065.1
  0.0000	1	0	species	174339	              s__Pseudomonas_E fluorescens_E
  0.0000	1	1	subspecies	174345	                RS_GCF_001307155.1
  0.0000	1	0	species	227563	              s__Pseudomonas_E sp002356535
  0.0000	1	1	subspecies	227565	                RS_GCF_002356535.1
  0.0000	1	0	species	229783	              s__Pseudomonas_E brassicacearum_A
  0.0000	1	1	subspecies	229785	                RS_GCF_000585995.1
  0.0000	1	0	species	188652	              s__Pseudomonas_E sp900156465
  0.0000	1	1	subspecies	188654	                RS_GCF_900156465.1
  0.0000	1	0	species	280907	              s__Pseudomonas_E putida_S
  0.0000	1	1	subspecies	280908	                RS_GCF_003228315.1
  0.0000	1	0	species	278292	              s__Pseudomonas_E fluorescens_BG
  0.0000	1	1	subspecies	278293	                RS_GCF_900636825.1
  0.0000	1	0	species	262929	              s__Pseudomonas_E sp004803755
  0.0000	1	1	subspecies	262930	                RS_GCF_004803755.1
  0.0000	1	0	species	262733	              s__Pseudomonas_E fluorescens_B
  0.0000	1	1	subspecies	262734	                RS_GCF_000293885.2
  0.0000	1	0	species	191740	              s__Pseudomonas_E kribbensis
  0.0000	1	1	subspecies	191746	                RS_GCF_003352185.1
  0.0000	1	0	species	210871	              s__Pseudomonas_E reinekei
  0.0000	1	1	subspecies	210873	                RS_GCF_900104125.1
  0.0000	1	0	species	210719	              s__Pseudomonas_E azotoformans_B
  0.0000	1	1	subspecies	210721	                RS_GCF_002007785.1
  0.0000	1	0	species	210704	              s__Pseudomonas_E cedrina
  0.0000	1	1	subspecies	210705	                RS_GCF_900104915.1
  0.0000	1	0	species	196998	              s__Pseudomonas_E moraviensis_A
  0.0000	1	1	subspecies	197000	                RS_GCF_900105805.1
  0.0000	1	0	species	199470	              s__Pseudomonas_E palleroniana
  0.0000	1	1	subspecies	199476	                RS_GCF_002953635.1
  0.0000	1	0	species	200654	              s__Pseudomonas_E fluorescens_C
  0.0000	1	1	subspecies	200656	                RS_GCF_000166515.1
  0.0000	1	0	species	209779	              s__Pseudomonas_E extremaustralis
  0.0000	1	1	subspecies	209784	                RS_GCF_900102035.1
  0.0000	1	0	species	209220	              s__Pseudomonas_E agarici
  0.0000	1	1	subspecies	209225	                RS_GCF_001543125.1
  0.3286	48104	887	genus	71061	            g__Pseudomonas
  0.0819	11984	37	species	180773	              s__Pseudomonas nitroreducens
  0.0416	6095	6095	subspecies	180776	                RS_GCF_012971725.1
  0.0400	5852	5852	subspecies	180783	                RS_GCF_011044415.1
  0.0818	11966	2445	species	234718	              s__Pseudomonas knackmussii
  0.0330	4823	4823	subspecies	234719	                RS_GCF_009911755.1
  0.0321	4698	4698	subspecies	234720	                RS_GCF_000689415.1
  0.0809	11845	1237	species	171214	              s__Pseudomonas citronellolis
  0.0375	5482	5482	subspecies	171225	                RS_GCF_001586155.1
  0.0350	5126	5126	subspecies	171230	                RS_GCF_001654435.1
  0.0766	11214	9249	species	162814	              s__Pseudomonas aeruginosa_A
  0.0126	1843	1843	subspecies	162818	                RS_GCF_003025345.2
  0.0005	67	67	subspecies	162841	                RS_GCF_000017205.1
  0.0002	26	26	subspecies	162819	                RS_GCF_003073695.1
  0.0002	26	26	subspecies	162849	                RS_GCF_006971785.1
  0.0000	3	3	subspecies	162821	                RS_GCF_002968755.1
  0.0014	204	100	species	71062	              s__Pseudomonas aeruginosa
  0.0001	12	12	subspecies	74583	                RS_GCF_012276675.1
  0.0000	6	6	subspecies	71821	                RS_GCF_003813025.1
  0.0000	6	6	subspecies	72193	                RS_GCF_002843285.1
  0.0000	4	4	subspecies	75804	                RS_GCF_003952325.1
  0.0000	4	4	subspecies	72010	                GB_GCA_900478745.1
  0.0000	3	3	subspecies	71140	                RS_GCF_013201095.1
  0.0000	3	3	subspecies	73949	                RS_GCF_900636635.1
  0.0000	3	3	subspecies	73399	                RS_GCF_002205375.1
  0.0000	3	3	subspecies	73010	                GB_GCA_009498355.1
  0.0000	3	3	subspecies	72932	                RS_GCF_003798125.1
  0.0000	3	3	subspecies	72520	                RS_GCF_003060845.1
  0.0000	3	3	subspecies	71247	                RS_GCF_003369775.1
  0.0000	2	2	subspecies	73687	                GB_GCA_003952305.1
  0.0000	2	2	subspecies	72709	                RS_GCF_012971705.1
  0.0000	2	2	subspecies	73605	                RS_GCF_002117025.1
  0.0000	2	2	subspecies	73601	                RS_GCF_013375895.1
  0.0000	2	2	subspecies	75206	                GB_GCA_010694505.1
  0.0000	2	2	subspecies	71286	                RS_GCF_000504045.1
  0.0000	2	2	subspecies	74057	                GB_GCA_000531435.1
  0.0000	2	2	subspecies	73830	                RS_GCF_003626935.1
  0.0000	2	2	subspecies	73236	                RS_GCF_013255565.1
  0.0000	2	2	subspecies	75284	                RS_GCF_000473745.2
  0.0000	1	1	subspecies	76159	                RS_GCF_013200975.1
  0.0000	1	1	subspecies	75237	                RS_GCF_900636975.1
  0.0000	1	1	subspecies	74904	                RS_GCF_004010895.1
  0.0000	1	1	subspecies	74730	                RS_GCF_003641125.1
  0.0000	1	1	subspecies	74589	                GB_GCA_003691345.1
  0.0000	1	1	subspecies	76241	                RS_GCF_001722005.2
  0.0000	1	1	subspecies	74933	                RS_GCF_003073735.1
  0.0000	1	1	subspecies	75739	                GB_GCA_001465155.1
  0.0000	1	1	subspecies	75486	                RS_GCF_004355145.1
  0.0000	1	1	subspecies	75533	                RS_GCF_009664165.1
  0.0000	1	1	subspecies	75805	                RS_GCF_013393685.1
  0.0000	1	1	subspecies	75668	                RS_GCF_013341295.1
  0.0000	1	1	subspecies	75677	                RS_GCF_002208645.1
  0.0000	1	1	subspecies	75765	                RS_GCF_002215345.1
  0.0000	1	1	subspecies	73020	                RS_GCF_002997005.1
  0.0000	1	1	subspecies	71195	                RS_GCF_003433235.1
  0.0000	1	1	subspecies	71241	                RS_GCF_014155905.1
  0.0000	1	1	subspecies	71773	                RS_GCF_008195485.1
  0.0000	1	1	subspecies	71809	                RS_GCF_013343395.1
  0.0000	1	1	subspecies	72091	                RS_GCF_007833895.1
  0.0000	1	1	subspecies	72126	                RS_GCF_001870265.1
  0.0000	1	1	subspecies	72748	                RS_GCF_001077475.1
  0.0000	1	1	subspecies	72918	                RS_GCF_002753655.1
  0.0000	1	1	subspecies	74288	                RS_GCF_003073895.1
  0.0000	1	1	subspecies	73051	                RS_GCF_001548135.1
  0.0000	1	1	subspecies	73302	                RS_GCF_002968655.1
  0.0000	1	1	subspecies	73416	                RS_GCF_007567125.1
  0.0000	1	1	subspecies	73461	                RS_GCF_001515915.2
  0.0000	1	1	subspecies	73703	                RS_GCF_900618305.1
  0.0000	1	1	subspecies	74073	                RS_GCF_003950255.1
  0.0000	1	1	subspecies	74117	                RS_GCF_001516185.2
  0.0000	2	0	species	227455	              s__Pseudomonas sp002079985
  0.0000	2	2	subspecies	227456	                RS_GCF_008807415.1
  0.0000	2	0	species	258065	              s__Pseudomonas sp000349845
  0.0000	2	2	subspecies	258066	                RS_GCF_000349845.1
  0.3272	47888	773	genus	143683	            g__Pseudomonas_A
  0.0832	12177	2056	species	189542	              s__Pseudomonas_A sp000765155
  0.0348	5089	5089	subspecies	189544	                RS_GCF_005844005.1
  0.0344	5032	5032	subspecies	189543	                RS_GCF_009740185.1
  0.0805	11788	3781	species	186447	              s__Pseudomonas_A sp004010935
  0.0274	4005	4005	subspecies	186451	                RS_GCF_001648195.1
  0.0272	3986	3986	subspecies	186449	                GB_GCA_000828755.1
  0.0001	16	16	subspecies	186453	                RS_GCF_004010935.1
  0.0792	11591	622	species	174679	              s__Pseudomonas_A sp003205815
  0.0386	5656	5656	subspecies	174691	                RS_GCF_003205815.1
  0.0363	5313	5313	subspecies	174699	                RS_GCF_009363815.1
  0.0785	11490	1643	species	186786	              s__Pseudomonas_A balearica
  0.0338	4950	4950	subspecies	186797	                RS_GCF_000818015.1
  0.0335	4897	4897	subspecies	186790	                RS_GCF_011106855.1
  0.0004	63	21	species	143684	              s__Pseudomonas_A stutzeri
  0.0001	10	10	subspecies	143828	                RS_GCF_000013785.1
  0.0001	8	8	subspecies	143688	                RS_GCF_003008495.1
  0.0000	6	6	subspecies	143758	                RS_GCF_000195105.1
  0.0000	5	5	subspecies	143783	                RS_GCF_001038645.1
  0.0000	5	5	subspecies	143822	                RS_GCF_003047145.2
  0.0000	4	4	subspecies	143686	                RS_GCF_900636845.1
  0.0000	4	4	subspecies	143711	                RS_GCF_000219605.1
  0.0000	2	0	species	237681	              s__Pseudomonas_A stutzeri_U
  0.0000	2	2	subspecies	237683	                RS_GCF_000267545.1
  0.0000	1	0	species	212668	              s__Pseudomonas_A songnenensis
  0.0000	1	1	subspecies	212671	                RS_GCF_003001655.1
  0.0000	1	0	species	241782	              s__Pseudomonas_A stutzeri_R
  0.0000	1	1	subspecies	241784	                RS_GCF_009789555.1
  0.0000	1	0	species	244138	              s__Pseudomonas_A stutzeri_A
  0.0000	1	1	subspecies	244139	                RS_GCF_000661915.1
  0.0000	1	0	species	248263	              s__Pseudomonas_A xanthomarina
  0.0000	1	1	subspecies	248265	                RS_GCF_900108535.1
  0.0840	12300	34	genus	169601	            g__Pseudomonas_B
  0.0838	12262	284	species	202821	              s__Pseudomonas_B oryzihabitans_D
  0.0410	6006	6006	subspecies	202824	                GB_GCA_003293465.1
  0.0408	5972	5972	subspecies	202823	                RS_GCF_014522265.1
  0.0000	3	0	species	178082	              s__Pseudomonas_B luteola
  0.0000	3	3	subspecies	178085	                RS_GCF_008693965.1
  0.0000	1	0	species	218228	              s__Pseudomonas_B oryzihabitans_E
  0.0000	1	1	subspecies	218229	                RS_GCF_001518815.1
  0.0840	12294	0	genus	243552	            g__Entomomonas
  0.0840	12294	391	species	243553	              s__Entomomonas moraniae
  0.0407	5958	5958	subspecies	243555	                RS_GCF_003991975.1
  0.0406	5945	5945	subspecies	243554	                RS_GCF_003151175.1
  0.0839	12281	0	genus	192488	            g__Oblitimonas
  0.0839	12281	11240	species	192489	              s__Oblitimonas alkaliphila
  0.0038	558	558	subspecies	192491	                RS_GCF_001267215.1
  0.0027	396	396	subspecies	192490	                RS_GCF_001267295.1
  0.0003	42	42	subspecies	192496	                RS_GCF_001267255.1
  0.0001	12	12	subspecies	192493	                RS_GCF_001267175.1
  0.0001	12	12	subspecies	192495	                RS_GCF_001267315.1
  0.0001	11	11	subspecies	192492	                RS_GCF_001267275.1
  0.0000	6	6	subspecies	192494	                GB_GCA_001267235.1
  0.0000	4	4	subspecies	192497	                RS_GCF_001267195.1
  0.0838	12268	12	genus	189594	            g__Azotobacter
  0.0837	12253	12246	species	208030	              s__Azotobacter vinelandii
  0.0000	5	5	subspecies	208034	                RS_GCF_000021045.1
  0.0000	2	2	subspecies	208031	                RS_GCF_000380365.1
  0.0000	2	0	species	301138	              s__Azotobacter salinestris
  0.0000	2	2	subspecies	301139	                RS_GCF_009363155.1
  0.0000	1	0	species	189595	              s__Azotobacter chroococcum
  0.0000	1	1	subspecies	189601	                RS_GCF_000817975.1
  0.0000	4	0	genus	174403	            g__Pseudomonas_F
  0.0000	4	3	species	174404	              s__Pseudomonas_F otitidis
  0.0000	1	1	subspecies	174424	                RS_GCF_011397855.1
  0.0000	1	0	genus	170569	            g__Pseudomonas_D
  0.0000	1	0	species	294463	              s__Pseudomonas_D sp012844345
  0.0000	1	1	subspecies	294464	                RS_GCF_012844345.1
  1.9986	292530	373	family	76274	          f__Moraxellaceae
  1.4102	206409	9747	genus	76275	            g__Acinetobacter
  0.0836	12234	412	species	182591	              s__Acinetobacter guillouiae
  0.0404	5913	5913	subspecies	182603	                RS_GCF_002980175.2
  0.0404	5909	5909	subspecies	182604	                RS_GCF_002370525.2
  0.0819	11985	9440	species	153250	              s__Acinetobacter radioresistens
  0.0098	1432	1432	subspecies	153267	                RS_GCF_006757745.1
  0.0072	1047	1047	subspecies	153277	                RS_GCF_002993105.1
  0.0002	31	31	subspecies	153299	                RS_GCF_003258335.1
  0.0002	23	23	subspecies	153290	                RS_GCF_014069095.1
  0.0001	12	12	subspecies	153289	                RS_GCF_005519305.1
  0.0813	11893	510	species	255505	              s__Acinetobacter chinensis
  0.0393	5753	5753	subspecies	255507	                RS_GCF_002165295.2
  0.0385	5630	5630	subspecies	255506	                RS_GCF_002165375.2
  0.0806	11804	7466	species	145042	              s__Acinetobacter indicus
  0.0164	2400	2400	subspecies	145050	                RS_GCF_012278715.1
  0.0124	1822	1822	subspecies	145047	                RS_GCF_009914395.1
  0.0001	20	20	subspecies	145112	                RS_GCF_012278735.1
  0.0001	16	16	subspecies	145061	                RS_GCF_009914375.1
  0.0001	10	10	subspecies	145163	                RS_GCF_009914435.1
  0.0001	9	9	subspecies	145070	                RS_GCF_010918375.1
  0.0001	9	9	subspecies	145109	                GB_GCA_010918035.1
  0.0001	9	9	subspecies	145137	                RS_GCF_009734145.1
  0.0001	8	8	subspecies	145063	                RS_GCF_002953575.2
  0.0001	8	8	subspecies	145118	                RS_GCF_010918195.1
  0.0000	7	7	subspecies	145092	                RS_GCF_009296145.1
  0.0000	7	7	subspecies	145105	                RS_GCF_013378115.1
  0.0000	7	7	subspecies	145166	                RS_GCF_010917815.1
  0.0000	5	5	subspecies	145103	                RS_GCF_009914415.1
  0.0000	1	1	subspecies	145096	                RS_GCF_009914475.1
  0.0805	11781	2030	species	160692	              s__Acinetobacter johnsonii
  0.0351	5143	5143	subspecies	160694	                RS_GCF_003952785.1
  0.0311	4550	4550	subspecies	160704	                RS_GCF_003335165.1
  0.0002	26	26	subspecies	160711	                RS_GCF_013374795.1
  0.0001	21	21	subspecies	160705	                RS_GCF_001484935.1
  0.0001	9	9	subspecies	160706	                RS_GCF_008180305.1
  0.0000	2	2	subspecies	160712	                RS_GCF_004337595.1
  0.0799	11694	2486	species	155762	              s__Acinetobacter junii
  0.0365	5341	5341	subspecies	155793	                RS_GCF_002761875.1
  0.0262	3842	3842	subspecies	155765	                RS_GCF_002165245.3
  0.0002	25	25	subspecies	155825	                RS_GCF_001941805.1
  0.0790	11570	7538	species	158871	              s__Acinetobacter haemolyticus
  0.0208	3043	3043	subspecies	158876	                GB_GCA_003952705.1
  0.0062	906	906	subspecies	158877	                RS_GCF_009892305.1
  0.0001	16	16	subspecies	158883	                RS_GCF_009892285.1
  0.0001	16	16	subspecies	158923	                RS_GCF_002813065.1
  0.0001	13	13	subspecies	158910	                RS_GCF_003323815.1
  0.0001	11	11	subspecies	158916	                RS_GCF_004379355.1
  0.0000	7	7	subspecies	158912	                RS_GCF_003430865.2
  0.0000	6	6	subspecies	158911	                RS_GCF_009892365.1
  0.0000	5	5	subspecies	158887	                RS_GCF_009892325.1
  0.0000	3	3	subspecies	158895	                RS_GCF_009892345.1
  0.0000	3	3	subspecies	158924	                RS_GCF_001932555.1
  0.0000	2	2	subspecies	158886	                RS_GCF_009892385.1
  0.0000	1	1	subspecies	158891	                RS_GCF_009892245.1
  0.0788	11540	658	species	199363	              s__Acinetobacter wuhouensis
  0.0386	5652	5652	subspecies	199367	                RS_GCF_001696605.3
  0.0357	5230	5230	subspecies	199364	                RS_GCF_002165345.2
  0.0787	11524	1955	species	183385	              s__Acinetobacter lactucae
  0.0328	4802	4802	subspecies	183392	                RS_GCF_013122135.1
  0.0326	4767	4767	subspecies	183398	                RS_GCF_002076935.1
  0.0785	11492	5697	species	162293	              s__Acinetobacter towneri
  0.0203	2971	2971	subspecies	162323	                RS_GCF_009676805.1
  0.0191	2793	2793	subspecies	162312	                RS_GCF_012220585.1
  0.0002	31	31	subspecies	162331	                RS_GCF_002946595.1
  0.0783	11454	3794	species	170543	              s__Acinetobacter schindleri
  0.0263	3855	3855	subspecies	170546	                RS_GCF_010918635.1
  0.0256	3747	3747	subspecies	170544	                RS_GCF_003072585.2
  0.0001	18	18	subspecies	170552	                RS_GCF_007833615.1
  0.0001	17	17	subspecies	170548	                RS_GCF_001971565.1
  0.0001	13	13	subspecies	170550	                RS_GCF_010919095.1
  0.0001	10	10	subspecies	170558	                RS_GCF_010918895.1
  0.0781	11429	7892	species	176151	              s__Acinetobacter mesopotamicus
  0.0193	2821	2821	subspecies	176153	                RS_GCF_012516415.1
  0.0045	657	657	subspecies	176156	                RS_GCF_013349125.1
  0.0003	51	51	subspecies	176167	                RS_GCF_013349205.1
  0.0001	8	8	subspecies	176166	                RS_GCF_009730095.1
  0.0778	11387	2874	species	161374	              s__Acinetobacter variabilis
  0.0294	4306	4306	subspecies	161388	                RS_GCF_013364475.1
  0.0287	4207	4207	subspecies	161396	                RS_GCF_002934695.1
  0.0778	11383	7596	species	139174	              s__Acinetobacter nosocomialis
  0.0191	2802	2802	subspecies	139196	                RS_GCF_004295305.1
  0.0055	805	805	subspecies	139191	                GB_GCA_003359435.2
  0.0002	33	33	subspecies	139286	                GB_GCA_003359395.2
  0.0002	27	27	subspecies	139283	                GB_GCA_003359375.2
  0.0002	24	24	subspecies	139248	                GB_GCA_003359505.2
  0.0002	24	24	subspecies	139260	                GB_GCA_003359355.2
  0.0001	20	20	subspecies	139289	                RS_GCF_002082665.1
  0.0001	15	15	subspecies	139327	                RS_GCF_009588945.1
  0.0001	13	13	subspecies	139301	                RS_GCF_000814165.3
  0.0001	10	10	subspecies	139282	                RS_GCF_005281455.1
  0.0000	7	7	subspecies	139198	                RS_GCF_004792395.1
  0.0000	3	3	subspecies	139234	                RS_GCF_008086325.1
  0.0000	3	3	subspecies	139351	                RS_GCF_003143895.1
  0.0000	1	1	subspecies	139304	                RS_GCF_002951295.1
  0.0768	11238	1099	species	203331	              s__Acinetobacter sp002165255
  0.0353	5173	5173	subspecies	203333	                GB_GCA_003945465.1
  0.0339	4966	4966	subspecies	203335	                RS_GCF_002165255.2
  0.0758	11100	460	species	174510	              s__Acinetobacter venetianus
  0.0382	5587	5587	subspecies	174521	                RS_GCF_000308235.1
  0.0345	5053	5053	subspecies	174515	                GB_GCA_014250455.1
  0.0739	10811	6747	species	132613	              s__Acinetobacter pittii
  0.0207	3037	3037	subspecies	132638	                RS_GCF_001577285.1
  0.0056	818	818	subspecies	132650	                GB_GCA_003359315.2
  0.0002	26	26	subspecies	132670	                GB_GCA_003359215.2
  0.0002	23	23	subspecies	132692	                GB_GCA_003354845.1
  0.0002	22	22	subspecies	132773	                GB_GCA_003359275.2
  0.0001	17	17	subspecies	132828	                RS_GCF_003051965.2
  0.0001	16	16	subspecies	132728	                GB_GCA_003359225.2
  0.0001	15	15	subspecies	132783	                RS_GCF_009931315.1
  0.0001	12	12	subspecies	132660	                GB_GCA_003359295.2
  0.0001	9	9	subspecies	132702	                RS_GCF_000191145.1
  0.0001	8	8	subspecies	132835	                GB_GCA_001581975.1
  0.0001	8	8	subspecies	132829	                RS_GCF_002158945.1
  0.0000	7	7	subspecies	132754	                RS_GCF_011996285.1
  0.0000	7	7	subspecies	132804	                RS_GCF_002863745.1
  0.0000	7	7	subspecies	132717	                RS_GCF_002012285.1
  0.0000	6	6	subspecies	132794	                RS_GCF_008694085.1
  0.0000	6	6	subspecies	132675	                RS_GCF_014168695.1
  0.0000	5	5	subspecies	132697	                RS_GCF_001617545.1
  0.0000	4	4	subspecies	132711	                RS_GCF_003956065.1
  0.0000	4	4	subspecies	132833	                RS_GCF_014169935.1
  0.0000	2	2	subspecies	132762	                RS_GCF_007954485.1
  0.0000	2	2	subspecies	132776	                RS_GCF_008121475.1
  0.0000	1	1	subspecies	132784	                RS_GCF_002999115.2
  0.0000	1	1	subspecies	132710	                RS_GCF_002902805.2
  0.0000	1	1	subspecies	132880	                RS_GCF_014171935.1
  0.0021	307	145	species	76276	              s__Acinetobacter baumannii
  0.0001	15	15	subspecies	77436	                RS_GCF_004758865.1
  0.0000	7	7	subspecies	80801	                RS_GCF_008931365.1
  0.0000	7	7	subspecies	78011	                RS_GCF_000069245.1
  0.0000	7	7	subspecies	76812	                RS_GCF_013416275.1
  0.0000	7	7	subspecies	78595	                RS_GCF_012931665.1
  0.0000	6	6	subspecies	79855	                RS_GCF_003812065.1
  0.0000	5	5	subspecies	80260	                RS_GCF_004354165.1
  0.0000	5	5	subspecies	78247	                RS_GCF_013394265.1
  0.0000	5	5	subspecies	80581	                RS_GCF_002999195.2
  0.0000	5	5	subspecies	79201	                RS_GCF_013394285.1
  0.0000	4	4	subspecies	80964	                RS_GCF_014322245.1
  0.0000	4	4	subspecies	76791	                RS_GCF_012931605.1
  0.0000	4	4	subspecies	77730	                RS_GCF_012935005.1
  0.0000	4	4	subspecies	80831	                RS_GCF_004194555.1
  0.0000	4	4	subspecies	77561	                GB_GCA_003359255.2
  0.0000	3	3	subspecies	78819	                RS_GCF_003812245.1
  0.0000	3	3	subspecies	79886	                GB_GCA_002762545.2
  0.0000	3	3	subspecies	81042	                GB_GCA_005280395.1
  0.0000	3	3	subspecies	76584	                RS_GCF_004768705.1
  0.0000	3	3	subspecies	76597	                RS_GCF_004564095.1
  0.0000	3	3	subspecies	76836	                RS_GCF_004354145.1
  0.0000	3	3	subspecies	76507	                RS_GCF_002950495.2
  0.0000	2	2	subspecies	78307	                RS_GCF_900093475.1
  0.0000	2	2	subspecies	79225	                RS_GCF_003547115.1
  0.0000	2	2	subspecies	79332	                RS_GCF_013377175.1
  0.0000	2	2	subspecies	80047	                RS_GCF_001895125.2
  0.0000	2	2	subspecies	76635	                RS_GCF_008802935.1
  0.0000	2	2	subspecies	79426	                RS_GCF_007107525.1
  0.0000	2	2	subspecies	77461	                RS_GCF_002504145.1
  0.0000	2	2	subspecies	76775	                GB_GCA_003012895.2
  0.0000	2	2	subspecies	80939	                RS_GCF_000419405.1
  0.0000	2	2	subspecies	76866	                RS_GCF_009035845.1
  0.0000	2	2	subspecies	77949	                RS_GCF_003431385.1
  0.0000	2	2	subspecies	77927	                RS_GCF_001077555.2
  0.0000	2	2	subspecies	77033	                RS_GCF_014169655.1
  0.0000	2	2	subspecies	79634	                RS_GCF_009740145.1
  0.0000	1	1	subspecies	80230	                RS_GCF_002082885.1
  0.0000	1	1	subspecies	78374	                RS_GCF_008124045.1
  0.0000	1	1	subspecies	80023	                RS_GCF_003431865.1
  0.0000	1	1	subspecies	80209	                GB_GCA_000069205.1
  0.0000	1	1	subspecies	80268	                RS_GCF_013787185.1
  0.0000	1	1	subspecies	80599	                RS_GCF_002210065.1
  0.0000	1	1	subspecies	80761	                GB_GCA_013403505.1
  0.0000	1	1	subspecies	78278	                RS_GCF_002902885.1
  0.0000	1	1	subspecies	76441	                RS_GCF_012974585.1
  0.0000	1	1	subspecies	76659	                RS_GCF_013376855.2
  0.0000	1	1	subspecies	76778	                RS_GCF_001578145.1
  0.0000	1	1	subspecies	77048	                RS_GCF_001896005.1
  0.0000	1	1	subspecies	77511	                RS_GCF_001721705.1
  0.0000	1	1	subspecies	77595	                RS_GCF_003812485.1
  0.0000	1	1	subspecies	77693	                RS_GCF_005280375.1
  0.0000	1	1	subspecies	78217	                RS_GCF_002082745.1
  0.0000	1	1	subspecies	79733	                RS_GCF_014159355.1
  0.0000	1	1	subspecies	78344	                RS_GCF_005280715.1
  0.0000	1	1	subspecies	76302	                RS_GCF_003812385.1
  0.0000	1	1	subspecies	78453	                GB_GCA_000015425.1
  0.0000	1	1	subspecies	79071	                RS_GCF_000814345.1
  0.0000	1	1	subspecies	79099	                RS_GCF_006385075.1
  0.0000	1	1	subspecies	79430	                GB_GCA_002009115.1
  0.0000	1	1	subspecies	79503	                RS_GCF_000828935.1
  0.0001	9	0	species	304699	              s__Acinetobacter sp002165305
  0.0001	9	9	subspecies	304700	                RS_GCF_002165305.2
  0.0000	4	0	species	155425	              s__Acinetobacter ursingii
  0.0000	4	4	subspecies	155463	                RS_GCF_003966675.1
  0.0000	4	0	species	209696	              s__Acinetobacter tandoii
  0.0000	4	4	subspecies	209697	                RS_GCF_002934965.1
  0.0000	4	0	species	284690	              s__Acinetobacter sp008630915
  0.0000	4	4	subspecies	284691	                RS_GCF_008630915.1
  0.0000	3	0	species	204235	              s__Acinetobacter lwoffii_C
  0.0000	3	3	subspecies	204240	                RS_GCF_013343215.1
  0.0000	3	0	species	246379	              s__Acinetobacter albensis
  0.0000	3	3	subspecies	246380	                RS_GCF_001278715.1
  0.0000	2	0	species	165347	              s__Acinetobacter bereziniae
  0.0000	2	2	subspecies	165350	                RS_GCF_002813045.1
  0.0000	1	0	species	166241	              s__Acinetobacter oleivorans
  0.0000	1	1	subspecies	166271	                RS_GCF_000196795.1
  0.0000	1	0	species	207321	              s__Acinetobacter proteolyticus
  0.0000	1	1	subspecies	207323	                RS_GCF_009884295.1
  0.0000	1	0	species	215246	              s__Acinetobacter dispersus
  0.0000	1	1	subspecies	215248	                RS_GCF_009884975.1
  0.0000	1	0	species	221227	              s__Acinetobacter junii_A
  0.0000	1	1	subspecies	221230	                RS_GCF_006965565.1
  0.0000	1	0	species	253960	              s__Acinetobacter sp900323515
  0.0000	1	1	subspecies	253961	                RS_GCF_902825285.1
  0.0000	1	0	species	255256	              s__Acinetobacter defluvii
  0.0000	1	1	subspecies	255258	                RS_GCF_001704615.3
  0.0000	1	0	species	276876	              s__Acinetobacter sp001647675
  0.0000	1	1	subspecies	276877	                RS_GCF_001647675.1
  0.3353	49080	319	genus	189245	            g__Psychrobacter
  0.0835	12223	1562	species	228197	              s__Psychrobacter sanguinis
  0.0367	5365	5365	subspecies	228199	                RS_GCF_003209315.1
  0.0362	5296	5296	subspecies	228200	                RS_GCF_000016885.1
  0.0833	12190	12137	species	219303	              s__Psychrobacter alimentarius
  0.0003	44	44	subspecies	219304	                RS_GCF_001606025.1
  0.0001	9	9	subspecies	219305	                RS_GCF_004795775.1
  0.0832	12174	4398	species	202418	              s__Psychrobacter pacificensis
  0.0333	4880	4880	subspecies	202422	                RS_GCF_014280455.1
  0.0194	2844	2844	subspecies	202421	                RS_GCF_001854065.1
  0.0004	52	52	subspecies	202424	                GB_GCA_007182895.1
  0.0832	12171	1858	species	244590	              s__Psychrobacter sp001593285
  0.0355	5189	5189	subspecies	244592	                RS_GCF_001593285.1
  0.0350	5124	5124	subspecies	244591	                RS_GCF_001593305.1
  0.0000	2	0	species	260340	              s__Psychrobacter sp001435845
  0.0000	2	2	subspecies	260341	                RS_GCF_001435845.1
  0.0000	1	0	species	274363	              s__Psychrobacter sp001435295
  0.0000	1	1	subspecies	274364	                RS_GCF_001435295.1
  0.1676	24531	598	genus	139787	            g__Moraxella
  0.0820	11998	11320	species	192984	              s__Moraxella ovis
  0.0020	298	298	subspecies	192988	                RS_GCF_000988685.1
  0.0014	201	201	subspecies	192991	                RS_GCF_001636015.1
  0.0009	134	134	subspecies	192986	                RS_GCF_000988655.1
  0.0003	40	40	subspecies	192992	                RS_GCF_000988615.1
  0.0000	5	5	subspecies	192989	                RS_GCF_000988705.1
  0.0815	11933	5552	species	205819	              s__Moraxella bovoculi
  0.0232	3391	3391	subspecies	205823	                RS_GCF_000988605.1
  0.0202	2955	2955	subspecies	205822	                RS_GCF_000988745.2
  0.0002	35	35	subspecies	205824	                RS_GCF_000988725.2
  0.0000	2	0	species	226860	              s__Moraxella bovis
  0.0000	2	2	subspecies	226862	                RS_GCF_003287015.1
  0.0829	12137	907	genus	171365	            g__Moraxella_A
  0.0758	11088	173	species	192146	              s__Moraxella_A osloensis
  0.0376	5499	5499	subspecies	192148	                RS_GCF_002753715.1
  0.0370	5416	5416	subspecies	192152	                RS_GCF_001553955.1
  0.0009	135	23	species	171366	              s__Moraxella_A cinereus
  0.0003	45	45	subspecies	171370	                RS_GCF_002752795.2
  0.0003	42	42	subspecies	171374	                RS_GCF_005518075.1
  0.0002	25	25	subspecies	171368	                RS_GCF_002355615.1
  0.0000	7	0	species	217530	              s__Moraxella_A sp002478835
  0.0000	7	7	subspecies	217531	                RS_GCF_009867135.1
  0.6713	98264	32	family	171442	          f__Halomonadaceae
  0.5872	85945	1302	genus	171443	            g__Halomonas
  0.0839	12281	6208	species	228332	              s__Halomonas sp900086985
  0.0209	3066	3066	subspecies	228334	                RS_GCF_900215475.1
  0.0205	3007	3007	subspecies	228335	                RS_GCF_900086985.1
  0.0837	12255	591	species	227533	              s__Halomonas sp003182195
  0.0400	5848	5848	subspecies	227535	                RS_GCF_003547075.1
  0.0397	5816	5816	subspecies	227536	                RS_GCF_013000985.1
  0.0836	12232	12221	species	242957	              s__Halomonas sp003031405
  0.0000	6	6	subspecies	242958	                RS_GCF_002009255.1
  0.0000	5	5	subspecies	242959	                RS_GCF_003031405.1
  0.0829	12138	3464	species	198181	              s__Halomonas alkaliphila_A
  0.0297	4353	4353	subspecies	198184	                RS_GCF_000696485.1
  0.0294	4303	4303	subspecies	198187	                RS_GCF_003612795.1
  0.0001	18	18	subspecies	198188	                RS_GCF_002216165.1
  0.0826	12089	239	species	213579	              s__Halomonas venusta
  0.0406	5949	5949	subspecies	213583	                RS_GCF_003950215.1
  0.0403	5901	5901	subspecies	213580	                RS_GCF_011399095.1
  0.0822	12034	7264	species	179201	              s__Halomonas titanicae
  0.0279	4088	4088	subspecies	179205	                RS_GCF_009728585.1
  0.0045	656	656	subspecies	179204	                RS_GCF_013347205.1
  0.0002	23	23	subspecies	179209	                RS_GCF_006542315.2
  0.0000	3	3	subspecies	179212	                RS_GCF_000982975.1
  0.0793	11602	11601	species	215846	              s__Halomonas ventosae_B
  0.0000	1	1	subspecies	215849	                RS_GCF_002257525.1
  0.0000	5	0	species	220421	              s__Halomonas sp006228115
  0.0000	5	5	subspecies	220422	                RS_GCF_012427705.1
  0.0000	3	0	species	171444	              s__Halomonas aquamarina
  0.0000	2	2	subspecies	171461	                RS_GCF_011764625.1
  0.0000	1	1	subspecies	171445	                RS_GCF_011398715.1
  0.0000	2	0	species	277457	              s__Halomonas sp002082565
  0.0000	2	2	subspecies	277458	                RS_GCF_002082565.1
  0.0000	1	0	species	208197	              s__Halomonas hamiltonii
  0.0000	1	1	subspecies	208200	                RS_GCF_002442575.1
  0.0000	1	0	species	251464	              s__Halomonas glaciei
  0.0000	1	1	subspecies	251466	                RS_GCF_000734975.2
  0.0839	12287	62	genus	184657	            g__Cobetia
  0.0835	12218	9042	species	190069	              s__Cobetia marina
  0.0125	1835	1835	subspecies	190077	                RS_GCF_001720485.1
  0.0087	1270	1270	subspecies	190073	                RS_GCF_004006355.1
  0.0005	71	71	subspecies	190078	                GB_GCA_009931455.1
  0.0000	6	2	species	184658	              s__Cobetia amphilecti
  0.0000	3	3	subspecies	184666	                RS_GCF_003032495.1
  0.0000	1	1	subspecies	184665	                RS_GCF_009617955.1
  0.0000	1	0	species	285794	              s__Cobetia sp009796845
  0.0000	1	1	subspecies	285795	                RS_GCF_009796845.1
  0.2516	36828	0	family	171029	          f__Oleiphilaceae
  0.2516	36828	558	genus	171030	            g__Marinobacter
  0.0840	12297	119	species	256630	              s__Marinobacter psychrophilus
  0.0416	6095	6095	subspecies	256632	                RS_GCF_001043175.1
  0.0416	6083	6083	subspecies	256631	                RS_GCF_000283275.1
  0.0829	12141	3962	species	179689	              s__Marinobacter salarius
  0.0283	4145	4145	subspecies	179696	                RS_GCF_002116735.1
  0.0273	4002	4002	subspecies	179697	                RS_GCF_003986605.1
  0.0002	32	32	subspecies	179701	                RS_GCF_000831005.1
  0.0806	11802	11782	species	197595	              s__Marinobacter shengliensis
  0.0001	13	13	subspecies	197597	                RS_GCF_009363275.1
  0.0000	7	7	subspecies	197601	                RS_GCF_009363515.1
  0.0001	16	0	species	257480	              s__Marinobacter sp001447155
  0.0001	16	16	subspecies	257481	                RS_GCF_001447155.2
  0.0000	6	0	species	211826	              s__Marinobacter adhaerens
  0.0000	6	6	subspecies	211828	                RS_GCF_000166295.1
  0.0000	4	0	species	308118	              s__Marinobacter sp003994855
  0.0000	4	4	subspecies	308119	                RS_GCF_003994855.1
  0.0000	2	0	species	171031	              s__Marinobacter hydrocarbonoclasticus
  0.0000	1	1	subspecies	171037	                RS_GCF_000015365.1
  0.0000	1	1	subspecies	171055	                RS_GCF_000284615.1
  0.0000	2	0	species	182175	              s__Marinobacter flavimaris
  0.0000	2	2	subspecies	182184	                RS_GCF_001266795.1
  0.0839	12276	1	family	195237	          f__Saccharospirillaceae
  0.0839	12275	0	genus	200525	            g__Thalassolituus
  0.0839	12275	4928	species	200526	              s__Thalassolituus oleivorans
  0.0250	3662	3662	subspecies	200529	                RS_GCF_000582555.1
  0.0250	3660	3660	subspecies	200528	                RS_GCF_001932535.1
  0.0002	25	25	subspecies	200532	                RS_GCF_000355675.1
  0.0000	6	0	family	203394	          f__Cellvibrionaceae
  0.0000	6	0	genus	232292	            g__Microbulbifer
  0.0000	6	0	species	317435	              s__Microbulbifer agarilyticus_A
  0.0000	6	6	subspecies	317436	                RS_GCF_001999945.1
  0.0000	1	0	family	182225	          f__Ketobacteraceae
  0.0000	1	0	genus	182226	            g__Ketobacter
  0.0000	1	0	species	292088	              s__Ketobacter alkanivorans
  0.0000	1	1	subspecies	292089	                RS_GCF_002863865.1
  7.4567	1091442	176	order	93813	        o__Burkholderiales
  5.9470	870465	2969	family	101169	          f__Burkholderiaceae
  1.8438	269874	4832	genus	101170	            g__Burkholderia
  0.0838	12265	7323	species	134681	              s__Burkholderia gladioli
  0.0321	4697	4697	subspecies	134775	                RS_GCF_000194745.1
  0.0005	68	68	subspecies	134857	                RS_GCF_014263355.1
  0.0004	64	64	subspecies	134912	                RS_GCF_002393425.1
  0.0004	62	62	subspecies	134893	                RS_GCF_003713105.1
  0.0002	30	30	subspecies	134914	                RS_GCF_000959725.1
  0.0001	12	12	subspecies	134763	                RS_GCF_003613595.1
  0.0001	9	9	subspecies	134794	                RS_GCF_002208175.1
  0.0838	12265	9427	species	182330	              s__Burkholderia glumae
  0.0097	1419	1419	subspecies	182332	                RS_GCF_013122645.1
  0.0083	1217	1217	subspecies	182331	                RS_GCF_012974245.1
  0.0009	136	136	subspecies	182340	                RS_GCF_009578005.1
  0.0002	24	24	subspecies	182342	                RS_GCF_009931375.1
  0.0002	22	22	subspecies	182336	                RS_GCF_009857095.1
  0.0001	15	15	subspecies	182339	                RS_GCF_000960995.1
  0.0000	5	5	subspecies	182341	                RS_GCF_000022645.2
  0.0837	12257	3977	species	218157	              s__Burkholderia plantarii
  0.0284	4163	4163	subspecies	218158	                RS_GCF_001411805.1
  0.0281	4117	4117	subspecies	218160	                RS_GCF_000835205.1
  0.0837	12245	12179	species	191192	              s__Burkholderia dolosa
  0.0003	50	50	subspecies	191195	                RS_GCF_000497165.1
  0.0001	13	13	subspecies	191193	                GB_GCA_000974835.2
  0.0000	3	3	subspecies	191197	                RS_GCF_000959505.1
  0.0835	12224	11980	species	185779	              s__Burkholderia humptydooensis
  0.0008	111	111	subspecies	185790	                RS_GCF_001546925.1
  0.0004	52	52	subspecies	185784	                RS_GCF_000385525.1
  0.0002	34	34	subspecies	185781	                RS_GCF_001513745.1
  0.0002	33	33	subspecies	185786	                RS_GCF_000959325.1
  0.0001	13	13	subspecies	185782	                RS_GCF_002386205.1
  0.0000	1	1	subspecies	185785	                RS_GCF_001462435.1
  0.0835	12221	11287	species	183315	              s__Burkholderia oklahomensis
  0.0045	653	653	subspecies	183326	                RS_GCF_000755985.1
  0.0008	112	112	subspecies	183324	                RS_GCF_001522635.2
  0.0006	85	85	subspecies	183320	                RS_GCF_001522105.2
  0.0006	81	81	subspecies	183321	                RS_GCF_001523745.2
  0.0000	3	3	subspecies	183319	                RS_GCF_000959365.1
  0.0834	12209	420	species	176862	              s__Burkholderia pyrrocinia
  0.0401	5875	5875	subspecies	176863	                RS_GCF_002356275.1
  0.0401	5875	5875	subspecies	176866	                RS_GCF_001028665.1
  0.0003	39	39	subspecies	176867	                RS_GCF_003233675.1
  0.0834	12205	7086	species	186709	              s__Burkholderia sp001524625
  0.0196	2867	2867	subspecies	186710	                RS_GCF_001524625.2
  0.0149	2174	2174	subspecies	186717	                RS_GCF_001532025.2
  0.0005	78	78	subspecies	186719	                RS_GCF_001524445.2
  0.0833	12192	3715	species	221502	              s__Burkholderia latens_A
  0.0293	4284	4284	subspecies	221505	                RS_GCF_000764955.1
  0.0286	4193	4193	subspecies	221504	                RS_GCF_001718795.1
  0.0832	12184	24	species	178009	              s__Burkholderia diffusa
  0.0416	6089	6089	subspecies	178022	                RS_GCF_001524645.2
  0.0415	6071	6071	subspecies	178015	                RS_GCF_001523915.2
  0.0832	12182	7768	species	154292	              s__Burkholderia ambifaria
  0.0292	4272	4272	subspecies	154315	                RS_GCF_000019925.1
  0.0009	139	139	subspecies	154342	                RS_GCF_005937855.2
  0.0000	3	3	subspecies	154317	                RS_GCF_000959545.1
  0.0831	12162	11821	species	159465	              s__Burkholderia thailandensis
  0.0009	134	134	subspecies	159477	                RS_GCF_000012365.1
  0.0006	92	92	subspecies	159473	                RS_GCF_000959605.1
  0.0003	42	42	subspecies	159467	                RS_GCF_003020185.1
  0.0001	19	19	subspecies	159486	                RS_GCF_001718635.1
  0.0001	12	12	subspecies	159501	                RS_GCF_003614815.1
  0.0001	8	8	subspecies	159500	                RS_GCF_000152285.1
  0.0000	7	7	subspecies	159510	                RS_GCF_000765375.1
  0.0000	7	7	subspecies	159503	                RS_GCF_000567945.1
  0.0000	3	3	subspecies	159493	                RS_GCF_003614835.1
  0.0000	2	2	subspecies	159488	                RS_GCF_001718595.1
  0.0000	2	2	subspecies	159497	                RS_GCF_003568605.1
  0.0000	2	2	subspecies	159499	                RS_GCF_003020025.1
  0.0000	2	2	subspecies	159487	                RS_GCF_000706745.1
  0.0000	2	2	subspecies	159481	                RS_GCF_011578485.1
  0.0000	2	2	subspecies	159505	                RS_GCF_000764595.1
  0.0000	2	2	subspecies	159516	                RS_GCF_001718615.1
  0.0000	1	1	subspecies	159484	                RS_GCF_000959425.1
  0.0000	1	1	subspecies	159476	                RS_GCF_000567925.1
  0.0000	1	1	subspecies	159513	                RS_GCF_000808035.2
  0.0829	12141	1042	species	185097	              s__Burkholderia pseudomultivorans
  0.0380	5564	5564	subspecies	185107	                RS_GCF_000755725.1
  0.0378	5535	5535	subspecies	185104	                RS_GCF_001718415.1
  0.0828	12118	145	species	164751	              s__Burkholderia territorii
  0.0411	6013	6013	subspecies	164783	                RS_GCF_001636095.1
  0.0407	5960	5960	subspecies	164761	                RS_GCF_001718335.1
  0.0824	12068	6070	species	156678	              s__Burkholderia contaminans
  0.0395	5783	5783	subspecies	156682	                RS_GCF_002924455.1
  0.0005	79	79	subspecies	156680	                RS_GCF_009755625.1
  0.0004	63	63	subspecies	156736	                RS_GCF_001718575.1
  0.0003	45	45	subspecies	156696	                RS_GCF_001029145.1
  0.0001	17	17	subspecies	156704	                RS_GCF_003704285.1
  0.0000	6	6	subspecies	156695	                RS_GCF_007724625.1
  0.0000	5	5	subspecies	156717	                RS_GCF_009191525.1
  0.0821	12014	8657	species	157958	              s__Burkholderia cenocepacia_B
  0.0193	2825	2825	subspecies	157963	                RS_GCF_001999785.1
  0.0012	172	172	subspecies	158012	                RS_GCF_001999825.1
  0.0009	129	129	subspecies	157961	                RS_GCF_000203955.1
  0.0003	50	50	subspecies	158002	                RS_GCF_012273415.1
  0.0003	43	43	subspecies	157992	                RS_GCF_001718515.1
  0.0002	36	36	subspecies	157990	                RS_GCF_014211915.1
  0.0002	34	34	subspecies	157989	                RS_GCF_000019505.1
  0.0002	32	32	subspecies	157993	                RS_GCF_000014085.1
  0.0001	21	21	subspecies	157984	                RS_GCF_003076415.1
  0.0001	15	15	subspecies	158003	                RS_GCF_002007585.1
  0.0818	11967	1381	species	203214	              s__Burkholderia stabilis
  0.0365	5343	5343	subspecies	203220	                RS_GCF_001742165.1
  0.0358	5243	5243	subspecies	203219	                RS_GCF_900240005.1
  0.0814	11914	11679	species	141693	              s__Burkholderia cepacia
  0.0008	118	118	subspecies	141853	                RS_GCF_001718395.1
  0.0007	108	108	subspecies	141865	                RS_GCF_009586235.1
  0.0000	6	6	subspecies	141729	                RS_GCF_006094315.1
  0.0000	2	2	subspecies	141841	                RS_GCF_002407525.2
  0.0000	1	1	subspecies	141836	                RS_GCF_001411495.1
  0.0812	11892	8233	species	134180	              s__Burkholderia cenocepacia
  0.0131	1923	1923	subspecies	134182	                RS_GCF_001999885.1
  0.0111	1619	1619	subspecies	134193	                RS_GCF_001606115.1
  0.0002	22	22	subspecies	134324	                RS_GCF_014357995.1
  0.0001	21	21	subspecies	134418	                RS_GCF_001718895.1
  0.0001	19	19	subspecies	134422	                RS_GCF_000236215.2
  0.0001	18	18	subspecies	134320	                RS_GCF_000755805.1
  0.0001	15	15	subspecies	134380	                RS_GCF_001999805.1
  0.0001	13	13	subspecies	134315	                RS_GCF_001606135.1
  0.0000	6	6	subspecies	134205	                RS_GCF_001484665.1
  0.0000	2	2	subspecies	134414	                RS_GCF_013349105.1
  0.0000	1	1	subspecies	134201	                RS_GCF_000009485.1
  0.0812	11881	5132	species	150248	              s__Burkholderia vietnamiensis
  0.0336	4922	4922	subspecies	150267	                RS_GCF_001718495.1
  0.0117	1716	1716	subspecies	150255	                RS_GCF_000262695.1
  0.0002	33	33	subspecies	150291	                RS_GCF_013822785.1
  0.0002	22	22	subspecies	150279	                GB_GCA_000016205.1
  0.0001	21	21	subspecies	150293	                RS_GCF_001718815.1
  0.0001	19	19	subspecies	150327	                RS_GCF_001718915.1
  0.0001	14	14	subspecies	150284	                RS_GCF_001718775.1
  0.0000	2	2	subspecies	150290	                RS_GCF_003019945.1
  0.0811	11871	7755	species	136813	              s__Burkholderia multivorans
  0.0233	3414	3414	subspecies	136859	                RS_GCF_003812365.1
  0.0031	459	459	subspecies	136880	                RS_GCF_000756005.1
  0.0005	77	77	subspecies	136892	                RS_GCF_001718755.1
  0.0003	43	43	subspecies	136951	                RS_GCF_003812585.1
  0.0002	28	28	subspecies	136914	                RS_GCF_009730035.1
  0.0002	28	28	subspecies	136973	                RS_GCF_009730175.1
  0.0001	21	21	subspecies	136990	                RS_GCF_012272655.1
  0.0001	17	17	subspecies	136923	                RS_GCF_009730195.1
  0.0001	15	15	subspecies	136975	                RS_GCF_001718995.1
  0.0001	10	10	subspecies	136980	                RS_GCF_000010545.1
  0.0000	3	3	subspecies	137011	                RS_GCF_000018505.1
  0.0000	1	1	subspecies	137014	                RS_GCF_000959525.1
  0.0712	10425	2288	species	131155	              s__Burkholderia ubonensis
  0.0348	5095	5095	subspecies	131217	                RS_GCF_003812965.1
  0.0194	2838	2838	subspecies	131206	                RS_GCF_001718855.1
  0.0005	70	70	subspecies	131275	                RS_GCF_001718695.1
  0.0002	36	36	subspecies	131308	                RS_GCF_001718655.1
  0.0002	30	30	subspecies	131381	                RS_GCF_001718975.1
  0.0002	29	29	subspecies	131441	                RS_GCF_001546975.1
  0.0001	21	21	subspecies	131414	                RS_GCF_001718355.1
  0.0001	18	18	subspecies	131417	                RS_GCF_000959245.1
  0.0004	54	31	species	101171	              s__Burkholderia mallei
  0.0000	4	4	subspecies	102669	                RS_GCF_002111125.1
  0.0000	2	2	subspecies	102011	                RS_GCF_006542585.1
  0.0000	2	2	subspecies	102255	                RS_GCF_002111325.1
  0.0000	2	2	subspecies	102387	                RS_GCF_002111285.1
  0.0000	1	1	subspecies	102827	                RS_GCF_000970955.1
  0.0000	1	1	subspecies	101203	                RS_GCF_002111305.1
  0.0000	1	1	subspecies	102667	                RS_GCF_005853645.1
  0.0000	1	1	subspecies	102587	                RS_GCF_003852635.1
  0.0000	1	1	subspecies	102447	                RS_GCF_002110925.1
  0.0000	1	1	subspecies	102415	                RS_GCF_002110945.1
  0.0000	1	1	subspecies	102338	                RS_GCF_000755845.1
  0.0000	1	1	subspecies	102209	                RS_GCF_000959185.1
  0.0000	1	1	subspecies	102150	                RS_GCF_000193475.1
  0.0000	1	1	subspecies	102012	                RS_GCF_000756185.1
  0.0000	1	1	subspecies	101812	                RS_GCF_004323015.1
  0.0000	1	1	subspecies	101746	                RS_GCF_000770565.1
  0.0000	1	1	subspecies	101358	                RS_GCF_000494855.1
  0.0002	28	0	species	265846	              s__Burkholderia cepacia_F
  0.0002	28	28	subspecies	265847	                RS_GCF_001718835.1
  0.0001	11	0	species	184697	              s__Burkholderia diffusa_B
  0.0001	11	11	subspecies	184709	                RS_GCF_001718315.1
  0.0000	5	0	species	176436	              s__Burkholderia anthina
  0.0000	5	5	subspecies	176439	                RS_GCF_003366075.1
  0.0000	5	0	species	239011	              s__Burkholderia mesoacidophila
  0.0000	5	5	subspecies	239012	                RS_GCF_002097715.1
  0.0000	5	0	species	187745	              s__Burkholderia cepacia_E
  0.0000	5	5	subspecies	187747	                RS_GCF_003711145.1
  0.0000	5	0	species	223382	              s__Burkholderia arboris
  0.0000	5	5	subspecies	223384	                RS_GCF_000701165.1
  0.0000	4	0	species	286224	              s__Burkholderia cepacia_D
  0.0000	4	4	subspecies	286225	                RS_GCF_000292915.1
  0.0000	4	0	species	291795	              s__Burkholderia pyrrocinia_B
  0.0000	4	4	subspecies	291796	                RS_GCF_003330765.1
  0.0000	4	0	species	182462	              s__Burkholderia anthina_A
  0.0000	4	4	subspecies	182463	                RS_GCF_001547525.1
  0.0000	4	0	species	173329	              s__Burkholderia sp002223185
  0.0000	4	4	subspecies	173339	                RS_GCF_003966315.1
  0.0000	3	0	species	199902	              s__Burkholderia metallica
  0.0000	3	3	subspecies	199906	                RS_GCF_001718555.1
  0.0000	3	0	species	191059	              s__Burkholderia seminalis
  0.0000	3	3	subspecies	191063	                RS_GCF_001718535.1
  0.0000	3	0	species	188516	              s__Burkholderia lata
  0.0000	3	3	subspecies	188519	                RS_GCF_000012945.1
  0.0000	1	0	species	177102	              s__Burkholderia sp001522585
  0.0000	1	1	subspecies	177116	                RS_GCF_001522585.2
  0.0000	1	0	species	146989	              s__Burkholderia stagnalis
  0.0000	1	1	subspecies	147002	                RS_GCF_001718955.1
  0.7520	110070	6201	genus	177246	            g__Cupriavidus
  0.0838	12269	6853	species	222540	              s__Cupriavidus malaysiensis
  0.0198	2895	2895	subspecies	222541	                RS_GCF_001854285.1
  0.0167	2445	2445	subspecies	222542	                RS_GCF_001854325.1
  0.0005	76	76	subspecies	222543	                RS_GCF_001854305.1
  0.0837	12246	5923	species	188320	              s__Cupriavidus necator
  0.0430	6299	6299	subspecies	188324	                RS_GCF_000219215.1
  0.0001	20	20	subspecies	188323	                RS_GCF_004798725.1
  0.0000	4	4	subspecies	188325	                RS_GCF_000009285.1
  0.0810	11856	2852	species	200067	              s__Cupriavidus gilardii
  0.0308	4508	4508	subspecies	200071	                RS_GCF_001281465.1
  0.0307	4496	4496	subspecies	200069	                RS_GCF_013347325.1
  0.0778	11381	10782	species	182145	              s__Cupriavidus taiwanensis_B
  0.0036	524	524	subspecies	182148	                RS_GCF_900249735.1
  0.0002	34	34	subspecies	182157	                RS_GCF_900249985.1
  0.0001	21	21	subspecies	182151	                RS_GCF_900250115.1
  0.0000	6	6	subspecies	182159	                RS_GCF_900250045.1
  0.0000	5	5	subspecies	182153	                RS_GCF_900249865.1
  0.0000	3	3	subspecies	182146	                RS_GCF_900249955.1
  0.0000	2	2	subspecies	182147	                RS_GCF_900249885.1
  0.0000	1	1	subspecies	182149	                RS_GCF_900249765.1
  0.0000	1	1	subspecies	182150	                RS_GCF_900249715.1
  0.0000	1	1	subspecies	182152	                RS_GCF_900249945.1
  0.0000	1	1	subspecies	182156	                RS_GCF_900249995.1
  0.0776	11365	4476	species	202664	              s__Cupriavidus taiwanensis_C
  0.0225	3287	3287	subspecies	202665	                RS_GCF_900250075.1
  0.0221	3239	3239	subspecies	202666	                RS_GCF_900250025.1
  0.0019	283	283	subspecies	202668	                RS_GCF_900250055.1
  0.0003	38	38	subspecies	202667	                RS_GCF_900249775.1
  0.0003	38	38	subspecies	202669	                RS_GCF_900250085.1
  0.0000	4	4	subspecies	202670	                RS_GCF_900249825.1
  0.0774	11330	7671	species	191331	              s__Cupriavidus taiwanensis
  0.0213	3113	3113	subspecies	191332	                RS_GCF_000069785.1
  0.0019	281	281	subspecies	191334	                RS_GCF_900250035.1
  0.0013	188	188	subspecies	191339	                RS_GCF_900249795.1
  0.0003	41	41	subspecies	191335	                RS_GCF_900249705.1
  0.0001	13	13	subspecies	191333	                RS_GCF_900249835.1
  0.0001	11	11	subspecies	191340	                RS_GCF_900250105.1
  0.0001	9	9	subspecies	191338	                RS_GCF_900249815.1
  0.0000	3	3	subspecies	191337	                RS_GCF_900249805.1
  0.0771	11292	28	species	223707	              s__Cupriavidus nantongensis
  0.0392	5742	5742	subspecies	223709	                RS_GCF_001598055.1
  0.0377	5522	5522	subspecies	223708	                RS_GCF_900249745.1
  0.0760	11119	11002	species	179042	              s__Cupriavidus alkaliphilus
  0.0006	89	89	subspecies	179053	                RS_GCF_900249965.1
  0.0001	12	12	subspecies	179050	                RS_GCF_900250005.1
  0.0001	8	8	subspecies	179043	                RS_GCF_900249925.1
  0.0000	5	5	subspecies	179049	                RS_GCF_900249845.1
  0.0000	2	2	subspecies	179058	                RS_GCF_900249905.1
  0.0000	1	1	subspecies	179052	                RS_GCF_900249915.1
  0.0751	10994	10293	species	222076	              s__Cupriavidus neocaledonicus
  0.0027	398	398	subspecies	222079	                RS_GCF_900250125.1
  0.0021	303	303	subspecies	222077	                RS_GCF_900249875.1
  0.0000	7	0	species	220720	              s__Cupriavidus oxalaticus
  0.0000	7	7	subspecies	220723	                RS_GCF_008807855.1
  0.0000	4	0	species	207595	              s__Cupriavidus campinensis
  0.0000	4	4	subspecies	207597	                RS_GCF_008271425.1
  0.0000	4	0	species	232514	              s__Cupriavidus taiwanensis_D
  0.0000	4	4	subspecies	232515	                RS_GCF_900249755.1
  0.0000	1	1	species	177247	              s__Cupriavidus metallidurans
  0.0000	1	0	species	258892	              s__Cupriavidus pickettii_A
  0.0000	1	1	subspecies	258893	                GB_GCA_000471925.1
  0.4152	60778	905	genus	145298	            g__Ralstonia
  0.0839	12276	11791	species	155357	              s__Ralstonia solanacearum
  0.0019	273	273	subspecies	155359	                RS_GCF_001587155.1
  0.0003	39	39	subspecies	155416	                GB_GCA_009832805.1
  0.0002	32	32	subspecies	155397	                RS_GCF_002549815.1
  0.0002	32	32	subspecies	155408	                GB_GCA_009832785.1
  0.0002	22	22	subspecies	155365	                RS_GCF_002501565.1
  0.0001	21	21	subspecies	155370	                RS_GCF_003860765.1
  0.0001	20	20	subspecies	155415	                RS_GCF_012562465.1
  0.0001	12	12	subspecies	155418	                RS_GCF_003860705.1
  0.0001	10	10	subspecies	155392	                RS_GCF_003860685.1
  0.0001	8	8	subspecies	155417	                RS_GCF_001587135.1
  0.0000	7	7	subspecies	155423	                GB_GCA_000197855.1
  0.0000	4	4	subspecies	155409	                RS_GCF_003860665.1
  0.0000	2	2	subspecies	155376	                RS_GCF_003590605.1
  0.0000	2	2	subspecies	155387	                RS_GCF_003860745.1
  0.0000	1	1	subspecies	155412	                RS_GCF_003860725.1
  0.0823	12050	11752	species	181876	              s__Ralstonia solanacearum_A
  0.0014	201	201	subspecies	181882	                RS_GCF_002012345.1
  0.0003	49	49	subspecies	181888	                RS_GCF_003515385.1
  0.0001	20	20	subspecies	181878	                RS_GCF_003515445.1
  0.0001	12	12	subspecies	181889	                RS_GCF_003515325.1
  0.0001	9	9	subspecies	181890	                RS_GCF_000283475.1
  0.0000	3	3	subspecies	181877	                RS_GCF_003515505.1
  0.0000	2	2	subspecies	181880	                RS_GCF_003515485.1
  0.0000	1	1	subspecies	181883	                RS_GCF_003515185.1
  0.0000	1	1	subspecies	181885	                RS_GCF_003515425.1
  0.0815	11931	638	species	189666	              s__Ralstonia insidiosa
  0.0389	5696	5696	subspecies	189669	                RS_GCF_001663855.1
  0.0382	5597	5597	subspecies	189667	                RS_GCF_001653935.1
  0.0810	11857	7002	species	184217	              s__Ralstonia mannitolilytica
  0.0267	3914	3914	subspecies	184220	                RS_GCF_001628775.1
  0.0053	780	780	subspecies	184218	                RS_GCF_000954135.1
  0.0006	93	93	subspecies	184223	                RS_GCF_002863525.1
  0.0004	59	59	subspecies	184226	                RS_GCF_002393485.1
  0.0001	9	9	subspecies	184222	                RS_GCF_011044515.1
  0.0801	11726	3252	species	175373	              s__Ralstonia pickettii_B
  0.0299	4372	4372	subspecies	175387	                RS_GCF_000023425.1
  0.0280	4102	4102	subspecies	175383	                RS_GCF_000020205.1
  0.0002	33	24	species	145299	              s__Ralstonia pseudosolanacearum
  0.0000	3	3	subspecies	145402	                GB_GCA_003515465.1
  0.0000	2	2	subspecies	145379	                RS_GCF_003515605.1
  0.0000	1	1	subspecies	145311	                RS_GCF_003515545.1
  0.0000	1	1	subspecies	145320	                RS_GCF_003576625.1
  0.0000	1	1	subspecies	145384	                RS_GCF_000427195.1
  0.0000	1	1	subspecies	145393	                RS_GCF_003999715.1
  0.3356	49129	126	genus	173843	            g__Pandoraea
  0.0840	12295	12287	species	236652	              s__Pandoraea thiooxydans
  0.0000	4	4	subspecies	236653	                RS_GCF_001931675.1
  0.0000	4	4	subspecies	236654	                RS_GCF_001017775.3
  0.0837	12245	12192	species	209804	              s__Pandoraea sputorum
  0.0002	28	28	subspecies	209806	                RS_GCF_000814845.2
  0.0002	25	25	subspecies	209807	                RS_GCF_900187205.1
  0.0836	12230	9854	species	184204	              s__Pandoraea pnomenusa
  0.0078	1146	1146	subspecies	184206	                RS_GCF_000504585.2
  0.0076	1110	1110	subspecies	184205	                RS_GCF_000604065.3
  0.0004	56	56	subspecies	184215	                RS_GCF_007833125.1
  0.0001	19	19	subspecies	184208	                RS_GCF_000767615.3
  0.0001	17	17	subspecies	184207	                RS_GCF_001636275.1
  0.0001	15	15	subspecies	184213	                RS_GCF_006547005.1
  0.0001	13	13	subspecies	184209	                RS_GCF_000590495.2
  0.0835	12228	12115	species	226495	              s__Pandoraea fibrosis
  0.0004	64	64	subspecies	226497	                RS_GCF_000807775.2
  0.0003	49	49	subspecies	226496	                RS_GCF_000807785.2
  0.0000	5	1	species	173844	              s__Pandoraea apista
  0.0000	4	4	subspecies	173853	                RS_GCF_001465595.2
  0.3346	48979	249	genus	117060	            g__Bordetella
  0.0838	12273	9537	species	170244	              s__Bordetella avium
  0.0119	1743	1743	subspecies	170250	                RS_GCF_004009615.1
  0.0067	985	985	subspecies	170248	                RS_GCF_012974605.1
  0.0000	3	3	subspecies	170261	                RS_GCF_004009755.1
  0.0000	3	3	subspecies	170269	                RS_GCF_000070465.1
  0.0000	2	2	subspecies	170256	                RS_GCF_012974645.1
  0.0836	12238	10581	species	181386	              s__Bordetella trematum
  0.0108	1588	1588	subspecies	181393	                RS_GCF_002860045.1
  0.0002	35	35	subspecies	181391	                RS_GCF_900078695.1
  0.0001	20	20	subspecies	181396	                RS_GCF_011463375.1
  0.0001	13	13	subspecies	181395	                RS_GCF_011386965.1
  0.0000	1	1	subspecies	181394	                RS_GCF_003991115.1
  0.0832	12174	9945	species	174182	              s__Bordetella hinzii
  0.0131	1914	1914	subspecies	174184	                RS_GCF_011100485.1
  0.0019	274	274	subspecies	174183	                RS_GCF_006770345.1
  0.0001	16	16	subspecies	174196	                RS_GCF_006770405.1
  0.0001	16	16	subspecies	174197	                RS_GCF_006770325.1
  0.0000	3	3	subspecies	174189	                RS_GCF_006770385.1
  0.0000	3	3	subspecies	174190	                RS_GCF_006770365.1
  0.0000	3	3	subspecies	174191	                RS_GCF_900637615.1
  0.0822	12025	11813	species	151218	              s__Bordetella holmesii
  0.0009	136	136	subspecies	151221	                GB_GCA_009626975.1
  0.0002	24	24	subspecies	151279	                GB_GCA_009627055.1
  0.0001	18	18	subspecies	151227	                GB_GCA_000612485.1
  0.0001	18	18	subspecies	151262	                GB_GCA_000765395.1
  0.0000	6	6	subspecies	151250	                RS_GCF_009627375.1
  0.0000	4	4	subspecies	151243	                RS_GCF_000341485.2
  0.0000	3	3	subspecies	151263	                RS_GCF_012974205.1
  0.0000	1	1	subspecies	151219	                RS_GCF_009625815.1
  0.0000	1	1	subspecies	151284	                RS_GCF_002859945.1
  0.0000	1	1	subspecies	151289	                RS_GCF_009627535.1
  0.0001	20	16	species	117061	              s__Bordetella pertussis
  0.0000	2	2	subspecies	117803	                RS_GCF_002859785.1
  0.0000	1	1	subspecies	117086	                RS_GCF_000317935.1
  0.0000	1	1	subspecies	117893	                RS_GCF_002119705.1
  0.3346	48976	144	genus	181607	            g__Paraburkholderia
  0.0838	12270	1233	species	185347	              s__Paraburkholderia graminis
  0.0380	5562	5562	subspecies	185352	                RS_GCF_003330785.1
  0.0374	5475	5475	subspecies	185356	                GB_GCA_001293045.1
  0.0837	12257	8240	species	190891	              s__Paraburkholderia caribensis
  0.0258	3781	3781	subspecies	190894	                RS_GCF_001611015.1
  0.0007	105	105	subspecies	190898	                RS_GCF_000522545.2
  0.0005	68	68	subspecies	190899	                RS_GCF_001449005.1
  0.0003	41	41	subspecies	190897	                RS_GCF_013378095.1
  0.0002	22	22	subspecies	190896	                RS_GCF_002902945.1
  0.0837	12252	2240	species	182753	              s__Paraburkholderia fungorum
  0.0347	5077	5077	subspecies	182763	                RS_GCF_000961515.1
  0.0337	4935	4935	subspecies	182757	                RS_GCF_013390345.1
  0.0823	12041	11796	species	222771	              s__Paraburkholderia xenovorans
  0.0009	131	131	subspecies	222773	                RS_GCF_000013645.1
  0.0008	114	114	subspecies	222774	                RS_GCF_000756045.1
  0.0000	3	0	species	320923	              s__Paraburkholderia aromaticivorans
  0.0000	3	3	subspecies	320924	                RS_GCF_002278075.1
  0.0000	2	0	species	219992	              s__Paraburkholderia terrae
  0.0000	2	2	subspecies	219993	                RS_GCF_002902925.1
  0.0000	2	0	species	251553	              s__Paraburkholderia sp000178415
  0.0000	2	2	subspecies	251555	                RS_GCF_902459535.1
  0.0000	1	0	species	181608	              s__Paraburkholderia hospita
  0.0000	1	1	subspecies	181615	                RS_GCF_003330805.1
  0.0000	1	0	species	183694	              s__Paraburkholderia tropica
  0.0000	1	1	subspecies	183700	                RS_GCF_014171495.1
  0.0000	1	0	species	219133	              s__Paraburkholderia caffeinilytica
  0.0000	1	1	subspecies	219136	                RS_GCF_003368325.1
  0.0000	1	0	species	228659	              s__Paraburkholderia phytofirmans
  0.0000	1	1	subspecies	228662	                RS_GCF_000020125.1
  0.0000	1	0	species	236799	              s__Paraburkholderia phymatum
  0.0000	1	1	subspecies	236801	                RS_GCF_000020045.1
  0.3336	48828	411	genus	156424	            g__Achromobacter
  0.0833	12194	9410	species	183256	              s__Achromobacter denitrificans
  0.0182	2667	2667	subspecies	183257	                RS_GCF_002205315.1
  0.0004	65	65	subspecies	183262	                RS_GCF_003812265.1
  0.0003	51	51	subspecies	183259	                RS_GCF_013343095.1
  0.0000	1	1	subspecies	183258	                RS_GCF_013267395.1
  0.0832	12183	9005	species	178477	              s__Achromobacter insolitus
  0.0206	3011	3011	subspecies	178481	                RS_GCF_000783435.2
  0.0004	53	53	subspecies	178480	                RS_GCF_900637265.1
  0.0003	50	50	subspecies	178482	                RS_GCF_001971645.1
  0.0003	49	49	subspecies	178488	                RS_GCF_003293535.1
  0.0001	15	15	subspecies	178492	                RS_GCF_008245125.1
  0.0823	12050	12040	species	210844	              s__Achromobacter spanius
  0.0000	7	7	subspecies	210847	                RS_GCF_002812705.1
  0.0000	3	3	subspecies	210845	                RS_GCF_900636675.1
  0.0816	11946	6987	species	175673	              s__Achromobacter ruhlandii
  0.0291	4262	4262	subspecies	175680	                RS_GCF_001514355.1
  0.0039	574	574	subspecies	175676	                RS_GCF_002082135.1
  0.0008	117	117	subspecies	175681	                RS_GCF_001558915.1
  0.0000	6	6	subspecies	175686	                RS_GCF_001051055.1
  0.0002	32	8	species	156425	              s__Achromobacter xylosoxidans
  0.0000	6	6	subspecies	156445	                RS_GCF_900009115.1
  0.0000	5	5	subspecies	156430	                RS_GCF_001559195.1
  0.0000	4	4	subspecies	156481	                RS_GCF_900010105.1
  0.0000	3	3	subspecies	156466	                RS_GCF_000967095.2
  0.0000	3	3	subspecies	156468	                RS_GCF_013282235.1
  0.0000	2	2	subspecies	156439	                RS_GCF_008432465.1
  0.0000	1	1	subspecies	156477	                RS_GCF_013282255.1
  0.0000	4	0	species	236890	              s__Achromobacter spanius_C
  0.0000	4	4	subspecies	236891	                RS_GCF_003994415.1
  0.0000	3	0	species	228340	              s__Achromobacter insuavis_A
  0.0000	3	3	subspecies	228341	                RS_GCF_001558755.2
  0.0000	3	0	species	319142	              s__Achromobacter xylosoxidans_B
  0.0000	3	3	subspecies	319143	                RS_GCF_000165835.1
  0.0000	1	0	species	182344	              s__Achromobacter mucicolens
  0.0000	1	1	subspecies	182352	                RS_GCF_009363015.1
  0.0000	1	0	species	208229	              s__Achromobacter bronchisepticus_A
  0.0000	1	1	subspecies	208231	                RS_GCF_014490035.1
  0.2466	36088	1558	genus	169026	            g__Comamonas
  0.0816	11938	7059	species	170078	              s__Comamonas acidovorans
  0.0295	4325	4325	subspecies	170081	                RS_GCF_001886655.1
  0.0017	251	251	subspecies	170082	                RS_GCF_000018665.1
  0.0008	120	120	subspecies	170096	                RS_GCF_002443055.1
  0.0008	114	114	subspecies	170094	                RS_GCF_013423845.1
  0.0004	65	65	subspecies	170092	                RS_GCF_000214395.1
  0.0000	4	4	subspecies	170090	                GB_GCA_001969245.1
  0.0788	11530	3400	species	189930	              s__Comamonas testosteroni_B
  0.0285	4167	4167	subspecies	189939	                RS_GCF_000739375.1
  0.0271	3963	3963	subspecies	189936	                RS_GCF_014076475.1
  0.0755	11048	1770	species	174025	              s__Comamonas tsuruhatensis
  0.0320	4682	4682	subspecies	174040	                RS_GCF_009362995.1
  0.0314	4596	4596	subspecies	174046	                RS_GCF_001753225.1
  0.0001	8	2	species	169027	              s__Comamonas thiooxydans
  0.0000	5	5	subspecies	169038	                RS_GCF_001406795.1
  0.0000	1	1	subspecies	169028	                RS_GCF_013256255.1
  0.0000	4	0	species	305684	              s__Comamonas testosteroni_F
  0.0000	4	4	subspecies	305685	                RS_GCF_014076415.1
  0.0000	2	0	species	295138	              s__Comamonas sp013363755
  0.0000	2	2	subspecies	295139	                RS_GCF_013363755.1
  0.1679	24571	10	genus	193514	            g__Caballeronia
  0.0839	12284	1522	species	206553	              s__Caballeronia sp001557535
  0.0375	5488	5488	subspecies	206554	                RS_GCF_001557535.2
  0.0360	5274	5274	subspecies	206557	                RS_GCF_001577465.1
  0.0839	12277	9423	species	232037	              s__Caballeronia sp011493005
  0.0109	1596	1596	subspecies	232038	                RS_GCF_011039955.1
  0.0086	1258	1258	subspecies	232039	                RS_GCF_011493005.1
  0.0840	12299	32	genus	162114	            g__Polynucleobacter
  0.0838	12265	8354	species	185464	              s__Polynucleobacter asymbioticus
  0.0141	2061	2061	subspecies	185468	                RS_GCF_001874585.1
  0.0126	1846	1846	subspecies	185466	                RS_GCF_000016345.1
  0.0000	3	3	subspecies	185472	                RS_GCF_001874545.1
  0.0000	1	1	subspecies	185473	                RS_GCF_001874565.1
  0.0000	1	1	species	172763	              s__Polynucleobacter paneuropaeus
  0.0000	1	0	species	257640	              s__Polynucleobacter duraquae
  0.0000	1	1	subspecies	257641	                RS_GCF_000973625.1
  0.0840	12297	0	genus	205347	            g__Oxalobacter
  0.0840	12297	12276	species	205348	              s__Oxalobacter formigenes
  0.0001	16	16	subspecies	205350	                RS_GCF_007833235.1
  0.0000	5	5	subspecies	205351	                RS_GCF_002127965.1
  0.0840	12294	47	genus	193725	            g__Herbaspirillum
  0.0836	12243	11835	species	199638	              s__Herbaspirillum seropedicae
  0.0012	172	172	subspecies	199641	                RS_GCF_006378125.1
  0.0007	108	108	subspecies	199643	                RS_GCF_001721865.1
  0.0005	74	74	subspecies	199640	                RS_GCF_000143225.1
  0.0004	54	54	subspecies	199639	                RS_GCF_001040945.1
  0.0000	4	1	species	193726	              s__Herbaspirillum rubrisubalbicans
  0.0000	3	3	subspecies	193728	                RS_GCF_000300435.2
  0.0840	12291	71	genus	230787	            g__Collimonas
  0.0834	12211	11453	species	247833	              s__Collimonas arenae
  0.0028	407	407	subspecies	247834	                RS_GCF_001584165.1
  0.0024	351	351	subspecies	247835	                RS_GCF_001584205.1
  0.0000	7	0	species	230788	              s__Collimonas pratensis
  0.0000	5	5	subspecies	230789	                RS_GCF_001584225.1
  0.0000	2	2	subspecies	230790	                RS_GCF_001584185.1
  0.0000	1	0	species	259303	              s__Collimonas fungivorans
  0.0000	1	1	subspecies	259304	                RS_GCF_001584145.1
  0.0000	1	0	species	310329	              s__Collimonas arenae_A
  0.0000	1	1	subspecies	310330	                RS_GCF_000786695.1
  0.0839	12287	0	genus	219093	            g__Rhizobacter
  0.0839	12287	12286	species	253344	              s__Rhizobacter gummiphilus
  0.0000	1	1	subspecies	253346	                RS_GCF_002762215.1
  0.0839	12286	17	genus	239475	            g__Bordetella_C
  0.0838	12269	5725	species	251754	              s__Bordetella_C bronchialis
  0.0224	3284	3284	subspecies	251755	                RS_GCF_001676745.1
  0.0223	3260	3260	subspecies	251756	                RS_GCF_001676705.1
  0.0838	12272	41	genus	187351	            g__Janthinobacterium
  0.0835	12222	66	species	203843	              s__Janthinobacterium svalbardensis
  0.0415	6081	6081	subspecies	203847	                RS_GCF_006517255.1
  0.0415	6075	6075	subspecies	203848	                RS_GCF_002327145.1
  0.0000	6	0	species	187352	              s__Janthinobacterium lividum
  0.0000	5	5	subspecies	187357	                RS_GCF_013372065.1
  0.0000	1	1	subspecies	187362	                RS_GCF_013372045.1
  0.0000	2	0	species	308531	              s__Janthinobacterium sp001865675
  0.0000	2	2	subspecies	308532	                RS_GCF_001865675.1
  0.0000	1	0	species	197661	              s__Janthinobacterium sp001758725
  0.0000	1	1	subspecies	197668	                RS_GCF_003667705.1
  0.0838	12267	125	genus	180805	            g__Acidovorax_A
  0.0828	12123	10040	species	186940	              s__Acidovorax_A citrulli
  0.0124	1818	1818	subspecies	186941	                RS_GCF_001593665.2
  0.0013	190	190	subspecies	186945	                RS_GCF_002441975.1
  0.0005	75	75	subspecies	186947	                RS_GCF_000015325.1
  0.0001	18	10	species	180806	              s__Acidovorax_A avenae
  0.0000	6	6	subspecies	180808	                RS_GCF_003029785.1
  0.0000	2	2	subspecies	180819	                RS_GCF_003029725.1
  0.0000	1	0	species	248304	              s__Acidovorax_A cattleyae
  0.0000	1	1	subspecies	248306	                RS_GCF_003029845.1
  0.0838	12263	0	genus	205354	            g__Kerstersia
  0.0838	12263	1893	species	205355	              s__Kerstersia gyiorum
  0.0356	5204	5204	subspecies	205356	                GB_GCA_004006215.1
  0.0353	5166	5166	subspecies	205360	                RS_GCF_004551665.1
  0.0836	12243	0	genus	215360	            g__Methylibium
  0.0836	12243	83	species	215361	              s__Methylibium petroleiphilum
  0.0417	6110	6110	subspecies	215365	                RS_GCF_004136295.1
  0.0413	6050	6050	subspecies	215363	                RS_GCF_000015725.1
  0.0835	12216	155	genus	178610	            g__Alcaligenes
  0.0823	12047	1177	species	193013	              s__Alcaligenes aquatilis
  0.0403	5895	5895	subspecies	193017	                RS_GCF_003716855.1
  0.0339	4963	4963	subspecies	193014	                RS_GCF_003671915.1
  0.0001	8	8	subspecies	193021	                RS_GCF_003076515.1
  0.0000	4	4	subspecies	193020	                RS_GCF_002242175.1
  0.0001	11	6	species	178611	              s__Alcaligenes faecalis
  0.0000	2	2	subspecies	178616	                RS_GCF_000967305.2
  0.0000	2	2	subspecies	178619	                RS_GCF_001641975.2
  0.0000	1	1	subspecies	178626	                RS_GCF_010092625.1
  0.0000	1	0	species	187410	              s__Alcaligenes phenolicus
  0.0000	1	1	subspecies	187416	                RS_GCF_005311025.1
  0.0000	1	0	species	213048	              s__Alcaligenes faecalis_C
  0.0000	1	1	subspecies	213049	                RS_GCF_004319585.1
  0.0000	1	0	species	283467	              s__Alcaligenes faecalis_D
  0.0000	1	1	subspecies	283468	                RS_GCF_009497775.1
  0.0815	11935	30	genus	190766	            g__Hydrogenophaga
  0.0813	11902	11902	species	232663	              s__Hydrogenophaga sp010104355
  0.0000	2	0	species	299086	              s__Hydrogenophaga sp001713375
  0.0000	2	2	subspecies	299087	                RS_GCF_001713375.1
  0.0000	1	0	species	207065	              s__Hydrogenophaga intermedia
  0.0000	1	1	subspecies	207070	                RS_GCF_000263795.2
  0.0801	11725	0	genus	201062	            g__Alicycliphilus
  0.0801	11725	7593	species	201063	              s__Alicycliphilus denitrificans
  0.0154	2247	2247	subspecies	201067	                RS_GCF_000204645.1
  0.0112	1635	1635	subspecies	201064	                RS_GCF_012530715.1
  0.0017	250	250	subspecies	201069	                RS_GCF_000179015.2
  0.0787	11520	0	genus	183224	            g__Diaphorobacter
  0.0787	11520	2864	species	183225	              s__Diaphorobacter nitroreducens
  0.0318	4650	4650	subspecies	183234	                RS_GCF_000022305.1
  0.0265	3877	3877	subspecies	183232	                RS_GCF_000015545.1
  0.0006	84	84	subspecies	183236	                RS_GCF_002214645.1
  0.0003	45	45	subspecies	183237	                RS_GCF_013154915.1
  0.0000	4	0	genus	184401	            g__Acidovorax
  0.0000	2	0	species	204836	              s__Acidovorax sp000302535
  0.0000	2	2	subspecies	204841	                RS_GCF_000302535.1
  0.0000	2	1	species	217819	              s__Acidovorax carolinensis
  0.0000	1	1	subspecies	217822	                RS_GCF_002157125.1
  0.0000	2	0	genus	257213	            g__Diaphorobacter_A
  0.0000	1	0	species	278426	              s__Diaphorobacter_A sp011305995
  0.0000	1	1	subspecies	278427	                RS_GCF_011305995.1
  0.0000	1	0	species	300009	              s__Diaphorobacter_A sp011305535
  0.0000	1	1	subspecies	300010	                RS_GCF_011305535.1
  0.0000	1	0	genus	188790	            g__Variovorax
  0.0000	1	0	species	316469	              s__Variovorax sp901827205
  0.0000	1	1	subspecies	316470	                RS_GCF_901827205.1
  0.0000	1	0	genus	239917	            g__Undibacterium
  0.0000	1	0	species	310301	              s__Undibacterium sp009937975
  0.0000	1	1	subspecies	310302	                RS_GCF_009937975.1
  0.6712	98243	256	family	93814	          f__Neisseriaceae
  0.5858	85741	1915	genus	93815	            g__Neisseria
  0.0838	12265	12218	species	230874	              s__Neisseria animalis
  0.0002	27	27	subspecies	230877	                RS_GCF_900636515.1
  0.0001	20	20	subspecies	230875	                RS_GCF_008806995.1
  0.0833	12198	1633	species	208806	              s__Neisseria animaloris
  0.0364	5327	5327	subspecies	208807	                RS_GCF_900637855.1
  0.0358	5238	5238	subspecies	208809	                RS_GCF_900638345.1
  0.0833	12186	5169	species	192305	              s__Neisseria weaveri
  0.0243	3553	3553	subspecies	192312	                RS_GCF_900638685.1
  0.0237	3464	3464	subspecies	192309	                RS_GCF_900086555.1
  0.0832	12174	6217	species	178846	              s__Neisseria elongata
  0.0402	5886	5886	subspecies	178855	                RS_GCF_003351685.1
  0.0004	57	57	subspecies	178860	                RS_GCF_003351545.1
  0.0001	14	14	subspecies	178847	                RS_GCF_000818035.1
  0.0816	11939	3677	species	195008	              s__Neisseria mucosa
  0.0283	4145	4145	subspecies	195010	                RS_GCF_002073715.2
  0.0281	4117	4117	subspecies	195015	                GB_GCA_003028315.1
  0.0794	11623	11432	species	122288	              s__Neisseria gonorrhoeae
  0.0004	54	54	subspecies	122297	                RS_GCF_000020105.1
  0.0003	46	46	subspecies	122320	                RS_GCF_900411645.1
  0.0001	9	9	subspecies	122919	                RS_GCF_900087635.2
  0.0001	8	8	subspecies	122988	                RS_GCF_003855435.1
  0.0000	5	5	subspecies	122838	                RS_GCF_900087905.2
  0.0000	4	4	subspecies	122893	                RS_GCF_002073655.2
  0.0000	4	4	subspecies	122701	                RS_GCF_900411635.1
  0.0000	4	4	subspecies	122569	                GB_GCA_013393965.1
  0.0000	4	4	subspecies	122545	                RS_GCF_001047275.1
  0.0000	4	4	subspecies	122404	                RS_GCF_004332555.2
  0.0000	4	4	subspecies	122421	                GB_GCA_013393985.1
  0.0000	3	3	subspecies	122506	                RS_GCF_003855375.1
  0.0000	3	3	subspecies	122921	                RS_GCF_900087615.2
  0.0000	3	3	subspecies	122928	                RS_GCF_003855215.1
  0.0000	3	3	subspecies	122935	                RS_GCF_900087625.2
  0.0000	3	3	subspecies	122756	                RS_GCF_000156855.2
  0.0000	3	3	subspecies	122455	                RS_GCF_900186935.1
  0.0000	3	3	subspecies	122582	                RS_GCF_900087795.2
  0.0000	2	2	subspecies	122968	                RS_GCF_900186915.1
  0.0000	2	2	subspecies	122674	                RS_GCF_007107165.1
  0.0000	2	2	subspecies	122814	                RS_GCF_900087725.2
  0.0000	2	2	subspecies	122465	                RS_GCF_004332535.2
  0.0000	2	2	subspecies	122987	                RS_GCF_001956715.1
  0.0000	1	1	subspecies	122967	                RS_GCF_003855235.1
  0.0000	1	1	subspecies	122938	                RS_GCF_000006845.1
  0.0000	1	1	subspecies	123002	                RS_GCF_900637245.1
  0.0000	1	1	subspecies	122872	                RS_GCF_013030055.1
  0.0000	1	1	subspecies	122871	                RS_GCF_900087875.2
  0.0000	1	1	subspecies	122848	                RS_GCF_013030075.1
  0.0000	1	1	subspecies	122809	                RS_GCF_001047225.1
  0.0000	1	1	subspecies	122808	                RS_GCF_001047255.1
  0.0000	1	1	subspecies	122761	                RS_GCF_900087685.2
  0.0000	1	1	subspecies	122735	                RS_GCF_011058675.1
  0.0000	1	1	subspecies	122734	                RS_GCF_001661085.1
  0.0000	1	1	subspecies	122524	                RS_GCF_009650075.1
  0.0000	1	1	subspecies	122503	                RS_GCF_003855415.1
  0.0000	1	1	subspecies	122425	                RS_GCF_900087815.2
  0.0765	11195	3684	species	164976	              s__Neisseria lactamica
  0.0254	3723	3723	subspecies	164980	                RS_GCF_003351565.1
  0.0253	3705	3705	subspecies	164989	                RS_GCF_002022745.1
  0.0004	56	56	subspecies	165004	                RS_GCF_000196295.1
  0.0002	27	27	subspecies	164992	                RS_GCF_901482445.1
  0.0014	198	120	species	93816	              s__Neisseria meningitidis
  0.0000	5	5	subspecies	95612	                RS_GCF_003355415.1
  0.0000	5	5	subspecies	94199	                RS_GCF_000152165.1
  0.0000	5	5	subspecies	95365	                RS_GCF_003355395.1
  0.0000	5	5	subspecies	95155	                RS_GCF_000083565.1
  0.0000	4	4	subspecies	95760	                RS_GCF_000009465.1
  0.0000	4	4	subspecies	94594	                RS_GCF_003355315.1
  0.0000	4	4	subspecies	94217	                RS_GCF_900638595.1
  0.0000	4	4	subspecies	94902	                RS_GCF_900638575.1
  0.0000	4	4	subspecies	94913	                RS_GCF_003355435.1
  0.0000	3	3	subspecies	93825	                RS_GCF_002073235.2
  0.0000	3	3	subspecies	94632	                RS_GCF_002073675.2
  0.0000	3	3	subspecies	94525	                RS_GCF_003355215.1
  0.0000	3	3	subspecies	94281	                RS_GCF_000014105.1
  0.0000	2	2	subspecies	95297	                RS_GCF_000800415.1
  0.0000	2	2	subspecies	95653	                RS_GCF_001698045.1
  0.0000	2	2	subspecies	93984	                RS_GCF_008330825.1
  0.0000	2	2	subspecies	94855	                RS_GCF_014302495.1
  0.0000	2	2	subspecies	94303	                RS_GCF_003355375.1
  0.0000	2	2	subspecies	94245	                RS_GCF_000026965.1
  0.0000	2	2	subspecies	94102	                RS_GCF_003355295.1
  0.0000	1	1	subspecies	94748	                RS_GCF_001697305.1
  0.0000	1	1	subspecies	94502	                RS_GCF_000816165.1
  0.0000	1	1	subspecies	94396	                RS_GCF_001697525.1
  0.0000	1	1	subspecies	94365	                RS_GCF_000191425.1
  0.0000	1	1	subspecies	95275	                RS_GCF_000191465.1
  0.0000	1	1	subspecies	95332	                RS_GCF_001698025.1
  0.0000	1	1	subspecies	95353	                RS_GCF_000191485.1
  0.0000	1	1	subspecies	95609	                RS_GCF_002951575.1
  0.0000	1	1	subspecies	94159	                RS_GCF_008329765.1
  0.0000	1	1	subspecies	95619	                RS_GCF_001698105.1
  0.0000	1	1	subspecies	94153	                RS_GCF_008330885.1
  0.0000	1	1	subspecies	95716	                RS_GCF_000253215.1
  0.0002	22	0	species	248767	              s__Neisseria sicca
  0.0002	22	22	subspecies	248769	                RS_GCF_014054945.1
  0.0001	8	0	species	206951	              s__Neisseria polysaccharea
  0.0001	8	8	subspecies	206955	                RS_GCF_003355195.1
  0.0000	4	0	species	209633	              s__Neisseria flavescens
  0.0000	4	4	subspecies	209638	                RS_GCF_005221285.1
  0.0000	4	0	species	218841	              s__Neisseria zoodegmatis
  0.0000	4	4	subspecies	218844	                RS_GCF_900187305.1
  0.0000	3	0	species	190684	              s__Neisseria subflava
  0.0000	3	3	subspecies	190689	                RS_GCF_005221305.1
  0.0000	2	0	species	251125	              s__Neisseria canis
  0.0000	2	2	subspecies	251127	                RS_GCF_900636765.1
  0.0000	1	0	species	195188	              s__Neisseria cinerea
  0.0000	1	1	subspecies	195192	                RS_GCF_900475315.1
  0.0000	1	0	species	215103	              s__Neisseria brasiliensis
  0.0000	1	1	subspecies	215107	                RS_GCF_009671065.1
  0.0000	1	0	species	221518	              s__Neisseria wadsworthii
  0.0000	1	1	subspecies	221520	                RS_GCF_014054885.1
  0.0000	1	0	species	233897	              s__Neisseria musculi
  0.0000	1	1	subspecies	233899	                RS_GCF_014297595.1
  0.0000	1	0	species	237958	              s__Neisseria sp000090875
  0.0000	1	1	subspecies	237960	                RS_GCF_005886145.1
  0.0837	12245	0	genus	165852	            g__Kingella
  0.0837	12245	9883	species	165853	              s__Kingella kingae
  0.0087	1270	1270	subspecies	165856	                RS_GCF_011612385.1
  0.0062	912	912	subspecies	165857	                RS_GCF_011045755.1
  0.0008	114	114	subspecies	165864	                RS_GCF_011612705.1
  0.0002	36	36	subspecies	165865	                RS_GCF_900475905.1
  0.0002	30	30	subspecies	165877	                GB_GCA_001458475.1
  0.0000	1	0	genus	173682	            g__Eikenella
  0.0000	1	0	species	317258	              s__Eikenella corrodens_B
  0.0000	1	1	subspecies	317259	                RS_GCF_003990355.1
  0.3360	49178	16	family	164674	          f__Methylophilaceae
  0.1680	24596	128	genus	164675	            g__Methylopumilus
  0.0839	12276	2952	species	252155	              s__Methylopumilus rimovensis
  0.0319	4665	4665	subspecies	252156	                RS_GCF_006364595.1
  0.0318	4659	4659	subspecies	252157	                RS_GCF_006364615.1
  0.0833	12188	12085	species	189564	              s__Methylopumilus planktonicus
  0.0003	51	51	subspecies	189571	                RS_GCF_000981505.1
  0.0002	25	25	subspecies	189569	                RS_GCF_006364475.1
  0.0001	10	10	subspecies	189565	                RS_GCF_006364575.1
  0.0001	9	9	subspecies	189566	                RS_GCF_006364535.1
  0.0000	7	7	subspecies	189572	                RS_GCF_006364455.1
  0.0000	1	1	subspecies	189573	                RS_GCF_006364555.1
  0.0000	4	3	species	164676	              s__Methylopumilus universalis
  0.0000	1	1	subspecies	164702	                RS_GCF_006364435.1
  0.0840	12290	0	genus	230649	            g__Methylovorus
  0.0840	12290	299	species	230650	              s__Methylovorus glucosotrophus
  0.0410	6002	6002	subspecies	230653	                RS_GCF_000183115.1
  0.0409	5989	5989	subspecies	230651	                RS_GCF_000023745.1
  0.0839	12276	0	genus	194007	            g__BACL14
  0.0839	12276	12269	species	229198	              s__BACL14 sp001044335
  0.0000	4	4	subspecies	229199	                RS_GCF_001044355.1
  0.0000	3	3	subspecies	229200	                RS_GCF_001044335.1
  0.2498	36565	26	family	169256	          f__Rhodocyclaceae
  0.0834	12208	0	genus	235011	            g__CAIQBG01
  0.0834	12208	11367	species	235012	              s__CAIQBG01 sp009938325
  0.0030	446	446	subspecies	235013	                RS_GCF_009938325.1
  0.0027	395	395	subspecies	235014	                RS_GCF_009938305.1
  0.0834	12200	0	genus	224330	            g__Thauera_A
  0.0834	12200	6411	species	224331	              s__Thauera_A hydrothermalis
  0.0215	3143	3143	subspecies	224333	                RS_GCF_003345255.1
  0.0179	2623	2623	subspecies	224332	                RS_GCF_002863805.1
  0.0002	23	23	subspecies	224334	                RS_GCF_003054515.1
  0.0828	12126	0	genus	217964	            g__Azospira
  0.0828	12126	983	species	217965	              s__Azospira suillum
  0.0384	5621	5621	subspecies	217966	                RS_GCF_000236665.1
  0.0377	5522	5522	subspecies	217969	                RS_GCF_009177135.1
  0.0000	5	0	genus	195593	            g__Azonexus
  0.0000	5	0	species	301943	              s__Azonexus aromaticus_A
  0.0000	5	5	subspecies	301944	                RS_GCF_000012425.1
  0.1680	24594	31	family	174114	          f__Chromobacteriaceae
  0.1678	24563	95	genus	174115	            g__Chromobacterium
  0.0839	12275	4651	species	193349	              s__Chromobacterium haemolyticum
  0.0262	3832	3832	subspecies	193350	                RS_GCF_009936155.1
  0.0259	3792	3792	subspecies	193351	                RS_GCF_003443515.1
  0.0833	12189	4397	species	248740	              s__Chromobacterium sp003325495
  0.0267	3904	3904	subspecies	248741	                RS_GCF_003325475.1
  0.0266	3888	3888	subspecies	248742	                RS_GCF_003325495.1
  0.0000	2	2	species	174116	              s__Chromobacterium violaceum
  0.0000	1	0	species	212875	              s__Chromobacterium vaccinii
  0.0000	1	1	subspecies	212879	                RS_GCF_001855275.1
  0.0000	1	0	species	298732	              s__Chromobacterium sp008275125
  0.0000	1	1	subspecies	298733	                RS_GCF_008275125.1
  0.0835	12219	2	family	211853	          f__Aquaspirillaceae
  0.0835	12217	0	genus	211854	            g__Laribacter
  0.0835	12217	6345	species	211855	              s__Laribacter hongkongensis
  0.0401	5872	5872	subspecies	211856	                RS_GCF_000021025.1
  0.0000	2	0	family	170707	          f__Thiobacillaceae
  0.0000	2	0	genus	205644	            g__Thiobacillus
  0.0000	2	0	species	231418	              s__Thiobacillus sp001899305
  0.0000	2	2	subspecies	231421	                GB_GCA_013693775.1
  2.4282	355412	12	order	128773	        o__Xanthomonadales
  2.4281	355399	770	family	128774	          f__Xanthomonadaceae
  1.0884	159312	3438	genus	128775	            g__Xanthomonas
  0.0838	12273	12001	species	178423	              s__Xanthomonas albilineans
  0.0015	225	225	subspecies	178437	                RS_GCF_000087965.2
  0.0003	47	47	subspecies	178428	                RS_GCF_009931595.1
  0.0838	12261	8197	species	159833	              s__Xanthomonas translucens
  0.0179	2627	2627	subspecies	159839	                RS_GCF_000807145.1
  0.0076	1119	1119	subspecies	159842	                RS_GCF_003050685.1
  0.0008	112	112	subspecies	159859	                RS_GCF_006838285.1
  0.0007	97	97	subspecies	159848	                RS_GCF_008365355.1
  0.0005	80	80	subspecies	159883	                RS_GCF_900094325.1
  0.0001	17	17	subspecies	159880	                RS_GCF_008330965.1
  0.0001	12	12	subspecies	159882	                RS_GCF_001021935.1
  0.0836	12242	1441	species	217980	              s__Xanthomonas sp014236855
  0.0371	5430	5430	subspecies	217981	                RS_GCF_014236815.1
  0.0357	5232	5232	subspecies	217983	                RS_GCF_014236835.1
  0.0009	139	139	subspecies	217984	                RS_GCF_014236855.1
  0.0835	12223	11612	species	156229	              s__Xanthomonas campestris
  0.0011	164	164	subspecies	156233	                RS_GCF_000590355.1
  0.0008	119	119	subspecies	156231	                RS_GCF_002776775.1
  0.0007	103	103	subspecies	156272	                RS_GCF_000590315.1
  0.0005	73	73	subspecies	156274	                RS_GCF_000590335.1
  0.0003	47	47	subspecies	156273	                RS_GCF_000590375.1
  0.0002	32	32	subspecies	156270	                RS_GCF_000221965.1
  0.0001	9	9	subspecies	156247	                GB_GCA_009177325.1
  0.0001	8	8	subspecies	156261	                RS_GCF_001186415.1
  0.0000	7	7	subspecies	156243	                RS_GCF_000012105.1
  0.0000	6	6	subspecies	156257	                RS_GCF_013388375.1
  0.0000	6	6	subspecies	156267	                RS_GCF_000007145.1
  0.0000	6	6	subspecies	156292	                RS_GCF_002776835.1
  0.0000	5	5	subspecies	156280	                RS_GCF_001293445.1
  0.0000	4	4	subspecies	156252	                RS_GCF_000403555.2
  0.0000	4	4	subspecies	156248	                RS_GCF_001186465.1
  0.0000	4	4	subspecies	156241	                RS_GCF_000589915.1
  0.0000	4	4	subspecies	156287	                RS_GCF_002879955.1
  0.0000	3	3	subspecies	156293	                RS_GCF_000590075.1
  0.0000	2	2	subspecies	156235	                RS_GCF_009177345.1
  0.0000	2	2	subspecies	156286	                RS_GCF_002776735.1
  0.0000	1	1	subspecies	156260	                RS_GCF_002776715.1
  0.0000	1	1	subspecies	156251	                RS_GCF_000403575.2
  0.0000	1	1	subspecies	156266	                RS_GCF_000401735.2
  0.0833	12198	9337	species	138759	              s__Xanthomonas citri
  0.0178	2609	2609	subspecies	138761	                GB_GCA_002218265.1
  0.0006	86	86	subspecies	138763	                GB_GCA_006228485.1
  0.0002	32	32	subspecies	138787	                RS_GCF_002218245.1
  0.0002	31	31	subspecies	138905	                RS_GCF_002218285.1
  0.0001	11	11	subspecies	138947	                RS_GCF_002906675.1
  0.0001	11	11	subspecies	138940	                RS_GCF_002688625.1
  0.0001	10	10	subspecies	138797	                GB_GCA_006228445.1
  0.0001	9	9	subspecies	138839	                RS_GCF_002309515.1
  0.0001	8	8	subspecies	138960	                RS_GCF_000969685.2
  0.0000	6	6	subspecies	138775	                RS_GCF_001939965.1
  0.0000	5	5	subspecies	138934	                GB_GCA_001496995.1
  0.0000	5	5	subspecies	138891	                RS_GCF_001610915.1
  0.0000	4	4	subspecies	138800	                RS_GCF_001610815.1
  0.0000	3	3	subspecies	138911	                GB_GCA_006228545.1
  0.0000	3	3	subspecies	138929	                RS_GCF_002139995.1
  0.0000	3	3	subspecies	138922	                RS_GCF_002163775.1
  0.0000	2	2	subspecies	138902	                RS_GCF_001610795.1
  0.0000	2	2	subspecies	138904	                RS_GCF_000488895.1
  0.0000	2	2	subspecies	138950	                RS_GCF_006228465.1
  0.0000	2	2	subspecies	138914	                RS_GCF_002224545.1
  0.0000	2	2	subspecies	138944	                RS_GCF_009671025.1
  0.0000	2	2	subspecies	138799	                RS_GCF_001939985.1
  0.0000	1	1	subspecies	138881	                RS_GCF_003665475.1
  0.0000	1	1	subspecies	138842	                RS_GCF_006228425.1
  0.0000	1	1	subspecies	138956	                RS_GCF_000454505.1
  0.0000	1	1	subspecies	138788	                RS_GCF_002079965.1
  0.0000	1	1	subspecies	138943	                RS_GCF_001922085.1
  0.0000	1	1	subspecies	138852	                RS_GCF_000349225.1
  0.0000	1	1	subspecies	138872	                RS_GCF_007724385.1
  0.0000	1	1	subspecies	138888	                RS_GCF_002224525.1
  0.0000	1	1	subspecies	138920	                RS_GCF_002139975.1
  0.0000	1	1	subspecies	138817	                RS_GCF_000454525.1
  0.0000	1	1	subspecies	138885	                RS_GCF_006228525.1
  0.0000	1	1	subspecies	138893	                RS_GCF_000495275.1
  0.0000	1	1	subspecies	138892	                RS_GCF_000348585.1
  0.0831	12164	11532	species	157238	              s__Xanthomonas fragariae
  0.0033	477	477	subspecies	157280	                RS_GCF_900183975.1
  0.0010	150	150	subspecies	157286	                RS_GCF_900183985.1
  0.0000	3	3	subspecies	157296	                RS_GCF_001705545.1
  0.0000	2	2	subspecies	157294	                RS_GCF_900183995.1
  0.0829	12129	6395	species	173000	              s__Xanthomonas euroxanthea
  0.0392	5734	5734	subspecies	173006	                RS_GCF_903989455.1
  0.0826	12091	6558	species	147555	              s__Xanthomonas vasicola
  0.0293	4286	4286	subspecies	147571	                RS_GCF_000772715.2
  0.0083	1210	1210	subspecies	147578	                RS_GCF_000770355.2
  0.0001	20	20	subspecies	147594	                RS_GCF_000772775.3
  0.0001	16	16	subspecies	147661	                RS_GCF_000277895.2
  0.0000	1	1	subspecies	147630	                RS_GCF_003015715.1
  0.0821	12018	5478	species	146875	              s__Xanthomonas arboricola
  0.0309	4528	4528	subspecies	146940	                RS_GCF_008761555.1
  0.0122	1784	1784	subspecies	146938	                RS_GCF_903970635.1
  0.0009	128	128	subspecies	146988	                RS_GCF_001237985.1
  0.0004	53	53	subspecies	146986	                RS_GCF_000972745.1
  0.0003	47	47	subspecies	146965	                RS_GCF_007724205.1
  0.0807	11814	9626	species	168674	              s__Xanthomonas hortorum_A
  0.0095	1384	1384	subspecies	168679	                GB_GCA_903978235.1
  0.0037	548	548	subspecies	168681	                RS_GCF_001908775.1
  0.0012	177	177	subspecies	168702	                GB_GCA_903978185.1
  0.0003	42	42	subspecies	168684	                RS_GCF_014338485.1
  0.0001	13	13	subspecies	168690	                RS_GCF_001908755.1
  0.0001	8	8	subspecies	168687	                RS_GCF_008728175.1
  0.0001	8	8	subspecies	168691	                RS_GCF_002285515.1
  0.0001	8	8	subspecies	168696	                RS_GCF_903978195.1
  0.0806	11800	5014	species	180579	              s__Xanthomonas vesicatoria
  0.0233	3410	3410	subspecies	180583	                RS_GCF_001908815.1
  0.0231	3376	3376	subspecies	180587	                RS_GCF_001908725.1
  0.0795	11632	9487	species	136593	              s__Xanthomonas perforans
  0.0138	2014	2014	subspecies	136617	                RS_GCF_003698225.1
  0.0002	36	36	subspecies	136774	                RS_GCF_000488955.1
  0.0002	31	31	subspecies	136777	                RS_GCF_000225915.1
  0.0002	30	30	subspecies	136712	                RS_GCF_000730305.1
  0.0001	12	12	subspecies	136682	                RS_GCF_001854165.1
  0.0001	11	11	subspecies	136743	                RS_GCF_001908795.1
  0.0001	10	10	subspecies	136687	                RS_GCF_001908855.1
  0.0000	1	1	subspecies	136775	                RS_GCF_000192045.2
  0.0752	11002	10680	species	149301	              s__Xanthomonas phaseoli
  0.0021	303	303	subspecies	149336	                RS_GCF_001564415.1
  0.0001	15	15	subspecies	149309	                RS_GCF_003999545.1
  0.0000	3	3	subspecies	149326	                RS_GCF_003999525.1
  0.0000	1	1	subspecies	149370	                RS_GCF_003999445.1
  0.0001	14	6	species	128776	              s__Xanthomonas oryzae
  0.0000	6	6	subspecies	128802	                RS_GCF_000212755.2
  0.0000	1	1	subspecies	128901	                RS_GCF_001042735.1
  0.0000	1	1	subspecies	129134	                GB_GCA_000007385.1
  0.0001	9	0	species	197771	              s__Xanthomonas hortorum
  0.0001	9	9	subspecies	197772	                RS_GCF_000505565.1
  0.0000	3	0	species	275783	              s__Xanthomonas cassavae
  0.0000	3	3	subspecies	275784	                RS_GCF_000454545.1
  0.0000	1	0	species	206760	              s__Xanthomonas axonopodis
  0.0000	1	1	subspecies	206764	                RS_GCF_013177355.1
  1.0824	158432	4918	genus	136367	            g__Stenotrophomonas
  0.0838	12271	870	species	194981	              s__Stenotrophomonas sp003086695
  0.0406	5942	5942	subspecies	194986	                RS_GCF_003086675.1
  0.0371	5435	5435	subspecies	194985	                RS_GCF_003086815.1
  0.0001	14	14	subspecies	194989	                RS_GCF_003086875.1
  0.0000	7	7	subspecies	194987	                RS_GCF_003086695.1
  0.0000	3	3	subspecies	194988	                RS_GCF_003086855.1
  0.0834	12204	4943	species	168016	              s__Stenotrophomonas indicatrix
  0.0246	3595	3595	subspecies	168029	                RS_GCF_004551575.1
  0.0242	3544	3544	subspecies	168021	                RS_GCF_009676385.1
  0.0007	98	98	subspecies	168032	                RS_GCF_003428825.1
  0.0002	24	24	subspecies	168040	                RS_GCF_002966815.1
  0.0833	12193	8131	species	196335	              s__Stenotrophomonas sp003086775
  0.0256	3749	3749	subspecies	196339	                RS_GCF_002025605.1
  0.0021	301	301	subspecies	196341	                RS_GCF_003086915.1
  0.0001	12	12	subspecies	196338	                RS_GCF_003086775.1
  0.0820	12008	11660	species	239743	              s__Stenotrophomonas nitritireducens_A
  0.0012	181	181	subspecies	239745	                RS_GCF_001700965.1
  0.0011	167	167	subspecies	239744	                RS_GCF_001562215.1
  0.0819	11995	1985	species	191005	              s__Stenotrophomonas acidaminiphila
  0.0390	5710	5710	subspecies	191012	                RS_GCF_014109845.1
  0.0288	4217	4217	subspecies	191010	                RS_GCF_001314305.1
  0.0006	83	83	subspecies	191014	                RS_GCF_014076435.1
  0.0811	11870	5791	species	151811	              s__Stenotrophomonas maltophilia_AK
  0.0401	5874	5874	subspecies	151816	                GB_GCA_014171555.1
  0.0007	99	99	subspecies	151817	                RS_GCF_014236085.1
  0.0004	54	54	subspecies	151861	                RS_GCF_009676465.1
  0.0002	33	33	subspecies	151890	                RS_GCF_006228405.1
  0.0001	19	19	subspecies	151866	                RS_GCF_003586545.1
  0.0803	11759	5813	species	196233	              s__Stenotrophomonas maltophilia_L
  0.0207	3029	3029	subspecies	196236	                RS_GCF_009676445.1
  0.0196	2873	2873	subspecies	196238	                RS_GCF_009618035.1
  0.0003	44	44	subspecies	196240	                RS_GCF_000020665.1
  0.0796	11655	623	species	193871	              s__Stenotrophomonas sp002192255
  0.0384	5626	5626	subspecies	193874	                RS_GCF_000223885.1
  0.0364	5323	5323	subspecies	193877	                RS_GCF_002847385.1
  0.0006	83	83	subspecies	193878	                RS_GCF_002192255.1
  0.0795	11637	3344	species	177502	              s__Stenotrophomonas maltophilia_AM
  0.0338	4941	4941	subspecies	177508	                RS_GCF_900636655.1
  0.0227	3326	3326	subspecies	177515	                RS_GCF_003030985.1
  0.0002	26	26	subspecies	177520	                RS_GCF_009676525.1
  0.0794	11618	8028	species	162337	              s__Stenotrophomonas geniculata
  0.0242	3541	3541	subspecies	162339	                RS_GCF_009857175.1
  0.0003	49	49	subspecies	162362	                GB_GCA_014083965.1
  0.0781	11428	9090	species	157782	              s__Stenotrophomonas maltophilia_F
  0.0135	1975	1975	subspecies	157792	                RS_GCF_900636905.1
  0.0008	117	117	subspecies	157808	                RS_GCF_014236045.1
  0.0008	111	111	subspecies	157786	                RS_GCF_004795795.1
  0.0005	70	70	subspecies	157837	                RS_GCF_014236025.1
  0.0003	41	41	subspecies	157807	                RS_GCF_002189545.2
  0.0002	23	23	subspecies	157817	                RS_GCF_000284595.1
  0.0000	1	1	subspecies	157832	                RS_GCF_009676485.1
  0.0777	11373	113	species	181513	              s__Stenotrophomonas maltophilia_G
  0.0398	5832	5832	subspecies	181516	                RS_GCF_002138415.1
  0.0371	5428	5428	subspecies	181517	                RS_GCF_003006435.1
  0.0770	11266	2759	species	163816	              s__Stenotrophomonas maltophilia_A
  0.0292	4280	4280	subspecies	163828	                RS_GCF_014076535.1
  0.0281	4116	4116	subspecies	163822	                GB_GCA_007833655.1
  0.0003	48	48	subspecies	163852	                RS_GCF_004346925.1
  0.0003	45	45	subspecies	163850	                RS_GCF_009676585.1
  0.0001	18	18	subspecies	163835	                RS_GCF_009676565.1
  0.0012	175	93	species	136368	              s__Stenotrophomonas maltophilia
  0.0001	11	11	subspecies	136458	                RS_GCF_002951115.1
  0.0001	9	9	subspecies	136461	                RS_GCF_002208885.2
  0.0000	7	7	subspecies	136590	                RS_GCF_014156975.1
  0.0000	7	7	subspecies	136526	                RS_GCF_012971765.1
  0.0000	7	7	subspecies	136512	                RS_GCF_003812985.1
  0.0000	6	6	subspecies	136550	                RS_GCF_014236065.1
  0.0000	5	5	subspecies	136591	                RS_GCF_000344215.1
  0.0000	5	5	subspecies	136584	                RS_GCF_009676405.1
  0.0000	4	4	subspecies	136415	                RS_GCF_014236005.1
  0.0000	3	3	subspecies	136503	                RS_GCF_014236125.1
  0.0000	3	3	subspecies	136448	                RS_GCF_012647025.1
  0.0000	3	3	subspecies	136436	                RS_GCF_011386925.1
  0.0000	2	2	subspecies	136464	                RS_GCF_008693985.1
  0.0000	2	2	subspecies	136462	                RS_GCF_900475685.1
  0.0000	2	2	subspecies	136537	                RS_GCF_000742995.1
  0.0000	2	2	subspecies	136447	                RS_GCF_900475405.1
  0.0000	2	2	subspecies	136416	                RS_GCF_004346945.1
  0.0000	1	1	subspecies	136519	                RS_GCF_009676425.1
  0.0000	1	1	subspecies	136385	                RS_GCF_000072485.1
  0.0001	19	0	species	197695	              s__Stenotrophomonas maltophilia_AL
  0.0001	19	19	subspecies	197697	                RS_GCF_003205835.1
  0.0001	8	0	species	182288	              s__Stenotrophomonas acidaminiphila_A
  0.0001	8	8	subspecies	182297	                RS_GCF_002951995.1
  0.0001	8	0	species	173046	              s__Stenotrophomonas maltophilia_B
  0.0001	8	8	subspecies	173068	                RS_GCF_009676505.1
  0.0000	6	0	species	308384	              s__Stenotrophomonas sp013364355
  0.0000	6	6	subspecies	308385	                RS_GCF_013364355.1
  0.0000	6	0	species	182316	              s__Stenotrophomonas sp003086795
  0.0000	6	6	subspecies	182322	                RS_GCF_003086795.1
  0.0000	4	0	species	274675	              s__Stenotrophomonas maltophilia_AU
  0.0000	4	4	subspecies	274676	                RS_GCF_006970445.1
  0.0000	3	0	species	191490	              s__Stenotrophomonas maltophilia_AJ
  0.0000	3	3	subspecies	191494	                RS_GCF_001274595.1
  0.0000	3	0	species	175800	              s__Stenotrophomonas pavanii
  0.0000	3	3	subspecies	175808	                RS_GCF_009676545.1
  0.0000	2	0	species	193456	              s__Stenotrophomonas lactitubi
  0.0000	2	2	subspecies	193462	                RS_GCF_011067225.1
  0.0000	1	0	species	207821	              s__Stenotrophomonas maltophilia_O
  0.0000	1	1	subspecies	207825	                RS_GCF_006974125.1
  0.0000	1	0	species	258797	              s__Stenotrophomonas sp014621775
  0.0000	1	1	subspecies	258798	                RS_GCF_014621775.1
  0.0000	1	0	species	291621	              s__Stenotrophomonas sp003086895
  0.0000	1	1	subspecies	291622	                RS_GCF_003086895.1
  0.1680	24594	7	genus	211903	            g__Lysobacter
  0.0840	12292	11010	species	212818	              s__Lysobacter enzymogenes_B
  0.0046	671	671	subspecies	212820	                RS_GCF_005954665.1
  0.0042	611	611	subspecies	212821	                RS_GCF_001442515.1
  0.0840	12289	2348	species	246866	              s__Lysobacter antibioticus
  0.0340	4978	4978	subspecies	246867	                RS_GCF_001442745.1
  0.0339	4963	4963	subspecies	246868	                RS_GCF_001442535.1
  0.0000	4	0	species	246940	              s__Lysobacter enzymogenes
  0.0000	4	4	subspecies	246942	                RS_GCF_002355975.1
  0.0000	1	0	species	245061	              s__Lysobacter soli
  0.0000	1	1	subspecies	245062	                RS_GCF_009755585.1
  0.0000	1	0	species	269113	              s__Lysobacter gummosus
  0.0000	1	1	subspecies	269114	                RS_GCF_001442805.1
  0.0840	12290	5	genus	148500	            g__Xylella
  0.0839	12285	12155	species	216734	              s__Xylella taiwanensis
  0.0005	66	66	subspecies	216737	                RS_GCF_003352785.1
  0.0004	64	64	subspecies	216735	                RS_GCF_013177435.1
  0.0000	1	0	genus	186746	            g__Pseudoxanthomonas_A
  0.0000	1	0	species	212131	              s__Pseudoxanthomonas_A mexicana
  0.0000	1	1	subspecies	212135	                RS_GCF_014397415.1
  0.0000	1	0	family	275187	          f__Ahniellaceae
  0.0000	1	0	genus	305256	            g__Ahniella
  0.0000	1	0	species	305257	              s__Ahniella affigens
  0.0000	1	1	subspecies	305258	                RS_GCF_003015185.1
  0.6723	98399	0	order	121497	        o__Legionellales
  0.6723	98399	774	family	121498	          f__Legionellaceae
  0.4176	61129	3433	genus	121499	            g__Legionella
  0.0838	12273	12063	species	191617	              s__Legionella longbeachae
  0.0013	190	190	subspecies	191619	                RS_GCF_011465395.1
  0.0001	13	13	subspecies	191621	                RS_GCF_000091785.1
  0.0000	5	5	subspecies	191622	                RS_GCF_002113845.3
  0.0000	2	2	subspecies	191620	                RS_GCF_011465255.1
  0.0815	11925	1327	species	193186	              s__Legionella sainthelensi
  0.0412	6024	6024	subspecies	193189	                RS_GCF_900637685.1
  0.0312	4570	4570	subspecies	193188	                RS_GCF_002848365.2
  0.0000	4	4	subspecies	193191	                RS_GCF_900635835.1
  0.0804	11773	9679	species	213679	              s__Legionella dumoffii
  0.0075	1098	1098	subspecies	213680	                RS_GCF_000236145.1
  0.0068	996	996	subspecies	213682	                RS_GCF_000236165.1
  0.0753	11017	8501	species	162600	              s__Legionella fraseri
  0.0160	2340	2340	subspecies	162607	                RS_GCF_003004065.1
  0.0008	122	122	subspecies	162601	                RS_GCF_001886795.1
  0.0002	31	31	subspecies	162612	                RS_GCF_003004215.1
  0.0000	7	7	subspecies	162615	                RS_GCF_003003865.1
  0.0000	4	4	subspecies	162631	                RS_GCF_003003515.1
  0.0000	3	3	subspecies	162620	                RS_GCF_003004335.1
  0.0000	3	3	subspecies	162624	                RS_GCF_003003955.1
  0.0000	2	2	subspecies	162614	                RS_GCF_003003755.1
  0.0000	2	2	subspecies	162618	                RS_GCF_003004195.1
  0.0000	1	1	subspecies	162619	                RS_GCF_001886835.1
  0.0000	1	1	subspecies	162635	                RS_GCF_003004255.1
  0.0724	10590	10577	species	193576	              s__Legionella pascullei
  0.0001	9	9	subspecies	193579	                RS_GCF_001590615.2
  0.0000	4	4	subspecies	193577	                RS_GCF_001590695.1
  0.0008	112	75	species	121500	              s__Legionella pneumophila
  0.0001	9	9	subspecies	121782	                RS_GCF_003004295.1
  0.0000	5	5	subspecies	121959	                RS_GCF_900186925.1
  0.0000	5	5	subspecies	122198	                GB_GCA_900635825.1
  0.0000	4	4	subspecies	121979	                RS_GCF_000306845.1
  0.0000	4	4	subspecies	122230	                RS_GCF_900119785.1
  0.0000	3	3	subspecies	121951	                RS_GCF_000048665.1
  0.0000	1	1	subspecies	121576	                RS_GCF_001592705.1
  0.0000	1	1	subspecies	121711	                RS_GCF_003004175.1
  0.0000	1	1	subspecies	121717	                RS_GCF_010669065.1
  0.0000	1	1	subspecies	121720	                RS_GCF_000092625.1
  0.0000	1	1	subspecies	121747	                RS_GCF_000092545.1
  0.0000	1	1	subspecies	122082	                RS_GCF_900119775.1
  0.0000	1	1	subspecies	122245	                RS_GCF_900119755.1
  0.0000	2	0	species	223190	              s__Legionella waltersii
  0.0000	2	2	subspecies	223192	                RS_GCF_900187095.1
  0.0000	2	0	species	284670	              s__Legionella sp014109805
  0.0000	2	2	subspecies	284671	                RS_GCF_014109805.1
  0.0000	1	0	species	258304	              s__Legionella fallonii
  0.0000	1	1	subspecies	258305	                RS_GCF_000953135.1
  0.0000	1	0	species	269182	              s__Legionella sp011764505
  0.0000	1	1	subspecies	269183	                RS_GCF_011764505.1
  0.0840	12299	0	genus	197846	            g__Legionella_D
  0.0840	12299	2953	species	197847	              s__Legionella_D israelensis
  0.0341	4988	4988	subspecies	197850	                RS_GCF_007361795.1
  0.0297	4343	4343	subspecies	197851	                RS_GCF_004564155.1
  0.0001	15	15	subspecies	197854	                RS_GCF_004571175.1
  0.0833	12189	0	genus	202022	            g__Legionella_B
  0.0833	12189	7178	species	202023	              s__Legionella_B geestiana
  0.0173	2529	2529	subspecies	202024	                RS_GCF_004571195.1
  0.0170	2482	2482	subspecies	202026	                RS_GCF_004766445.2
  0.0820	12006	0	genus	179293	            g__Legionella_C
  0.0820	12006	1599	species	212880	              s__Legionella_C spiritensis
  0.0362	5293	5293	subspecies	212882	                RS_GCF_900186965.1
  0.0349	5114	5114	subspecies	212881	                RS_GCF_900637495.1
  0.0000	2	0	genus	196216	            g__Tatlockia
  0.0000	2	0	species	302497	              s__Tatlockia clemsonensis
  0.0000	2	2	subspecies	302498	                RS_GCF_002240035.1
  0.5882	86100	0	order	123011	        o__Francisellales
  0.5882	86100	59	family	123012	          f__Francisellaceae
  0.5039	73749	654	genus	123013	            g__Francisella
  0.0840	12288	11886	species	165675	              s__Francisella orientalis
  0.0016	235	235	subspecies	165684	                RS_GCF_000833255.1
  0.0005	72	72	subspecies	165687	                RS_GCF_000262205.1
  0.0003	49	49	subspecies	165677	                RS_GCF_000505725.1
  0.0002	29	29	subspecies	165676	                RS_GCF_008330245.1
  0.0000	5	5	subspecies	165682	                RS_GCF_008330365.1
  0.0000	3	3	subspecies	165689	                RS_GCF_008330525.1
  0.0000	2	2	subspecies	165681	                RS_GCF_008330485.1
  0.0000	2	2	subspecies	165705	                RS_GCF_001190905.2
  0.0000	1	1	subspecies	165679	                RS_GCF_001042545.2
  0.0000	1	1	subspecies	165697	                RS_GCF_008330285.1
  0.0000	1	1	subspecies	165703	                RS_GCF_008330345.1
  0.0000	1	1	subspecies	165706	                RS_GCF_008330405.1
  0.0000	1	1	subspecies	165709	                RS_GCF_008330425.1
  0.0838	12270	12164	species	252995	              s__Francisella persica
  0.0005	68	68	subspecies	252997	                RS_GCF_001653955.1
  0.0003	38	38	subspecies	252996	                RS_GCF_001275365.1
  0.0837	12256	12123	species	210137	              s__Francisella opportunistica
  0.0009	133	133	subspecies	210139	                RS_GCF_003347135.1
  0.0835	12226	1766	species	231422	              s__Francisella hispaniensis
  0.0360	5267	5267	subspecies	231425	                RS_GCF_000195555.1
  0.0355	5193	5193	subspecies	231424	                RS_GCF_001885235.1
  0.0825	12079	6206	species	199185	              s__Francisella salimarina
  0.0386	5644	5644	subspecies	199187	                RS_GCF_000219045.1
  0.0015	226	226	subspecies	199188	                RS_GCF_008369765.1
  0.0000	3	3	subspecies	199192	                RS_GCF_008369785.1
  0.0818	11966	11736	species	188627	              s__Francisella philomiragia
  0.0009	139	139	subspecies	188635	                RS_GCF_000833315.1
  0.0003	38	38	subspecies	188631	                RS_GCF_000833295.1
  0.0003	37	37	subspecies	188636	                RS_GCF_000833455.1
  0.0001	11	11	subspecies	188629	                RS_GCF_000019285.1
  0.0000	4	4	subspecies	188637	                RS_GCF_000833195.1
  0.0000	1	1	subspecies	188630	                RS_GCF_000833215.1
  0.0001	10	7	species	123014	              s__Francisella tularensis
  0.0000	1	1	subspecies	123438	                RS_GCF_001267475.1
  0.0000	1	1	subspecies	123605	                RS_GCF_000833475.1
  0.0000	1	1	subspecies	123609	                RS_GCF_000195535.1
  0.0840	12291	0	genus	251028	            g__Francisella_A
  0.0840	12291	211	species	251029	              s__Francisella_A adeliensis
  0.0413	6048	6048	subspecies	251030	                RS_GCF_003290445.1
  0.0412	6032	6032	subspecies	251031	                RS_GCF_013394105.1
  0.0000	1	0	genus	237003	            g__Allofrancisella
  0.0000	1	0	species	237004	              s__Allofrancisella frigidaquae
  0.0000	1	1	subspecies	237006	                RS_GCF_012222825.1
  0.2521	36898	0	order	181274	        o__Acidithiobacillales
  0.2521	36898	190	family	181275	          f__Acidithiobacillaceae
  0.1681	24604	795	genus	181276	            g__Acidithiobacillus
  0.0835	12222	534	species	205977	              s__Acidithiobacillus ferrivorans
  0.0401	5863	5863	subspecies	205981	                RS_GCF_900174455.1
  0.0398	5825	5825	subspecies	205982	                RS_GCF_000214095.2
  0.0786	11505	8916	species	219487	              s__Acidithiobacillus ferridurans
  0.0102	1487	1487	subspecies	219490	                RS_GCF_003966655.1
  0.0075	1102	1102	subspecies	219488	                RS_GCF_008926505.1
  0.0005	79	37	species	190954	              s__Acidithiobacillus ferrooxidans
  0.0002	28	28	subspecies	190960	                RS_GCF_013462805.1
  0.0000	7	7	subspecies	190959	                RS_GCF_000020825.1
  0.0000	7	7	subspecies	190963	                RS_GCF_000021485.1
  0.0000	3	0	species	181277	              s__Acidithiobacillus thiooxidans
  0.0000	3	3	subspecies	181284	                RS_GCF_009662475.1
  0.0827	12104	0	genus	198299	            g__Acidithiobacillus_A
  0.0827	12104	10907	species	198300	              s__Acidithiobacillus_A caldus
  0.0058	854	854	subspecies	198305	                RS_GCF_000221025.1
  0.0016	229	229	subspecies	198301	                RS_GCF_001650235.3
  0.0006	92	92	subspecies	198306	                RS_GCF_008694225.1
  0.0002	22	22	subspecies	198307	                RS_GCF_000175575.2
  0.0840	12300	0	order	155010	        o__Coxiellales
  0.0840	12300	0	family	155011	          f__Coxiellaceae
  0.0840	12300	0	genus	155012	            g__Coxiella
  0.0840	12300	12160	species	155013	              s__Coxiella burnetii
  0.0002	34	34	subspecies	155016	                RS_GCF_004087735.1
  0.0002	29	29	subspecies	155029	                GB_GCA_000359545.5
  0.0002	26	26	subspecies	155015	                RS_GCF_002634085.1
  0.0001	13	13	subspecies	155064	                RS_GCF_000017105.1
  0.0001	11	11	subspecies	155047	                RS_GCF_000767035.1
  0.0001	9	9	subspecies	155059	                RS_GCF_000367725.2
  0.0000	5	5	subspecies	155054	                RS_GCF_002634065.1
  0.0000	3	3	subspecies	155024	                RS_GCF_001572765.1
  0.0000	3	3	subspecies	155080	                RS_GCF_000018745.1
  0.0000	2	2	subspecies	155069	                RS_GCF_004006195.1
  0.0000	1	1	subspecies	155028	                RS_GCF_002633885.1
  0.0000	1	1	subspecies	155031	                RS_GCF_002634005.1
  0.0000	1	1	subspecies	155052	                RS_GCF_002633945.1
  0.0000	1	1	subspecies	155067	                RS_GCF_002633985.1
  0.0000	1	1	subspecies	155079	                RS_GCF_000019865.1
  0.0840	12300	0	order	202199	        o__Beggiatoales
  0.0840	12300	0	family	202200	          f__Beggiatoaceae
  0.0840	12300	0	genus	238836	            g__Beggiatoa
  0.0840	12300	12281	species	238837	              s__Beggiatoa leptomitoformis
  0.0001	12	12	subspecies	238839	                RS_GCF_002849755.2
  0.0000	7	7	subspecies	238838	                RS_GCF_001305575.3
  0.0840	12288	0	order	166170	        o__Methylococcales
  0.0839	12286	0	family	196988	          f__Cycloclasticaceae
  0.0839	12286	0	genus	196989	            g__Cycloclasticus
  0.0839	12286	5795	species	196990	              s__Cycloclasticus pugetii
  0.0241	3530	3530	subspecies	196995	                RS_GCF_002443175.1
  0.0201	2944	2944	subspecies	196991	                RS_GCF_000299965.1
  0.0001	17	17	subspecies	196997	                RS_GCF_000442595.1
  0.0000	2	0	family	166171	          f__Methylomonadaceae
  0.0000	2	0	genus	178898	            g__Methylovulum
  0.0000	2	0	species	244779	              s__Methylovulum psychrotolerans
  0.0000	2	2	subspecies	244780	                RS_GCF_002209385.1
  0.0839	12287	0	order	150521	        o__Piscirickettsiales
  0.0839	12287	0	family	150522	          f__Piscirickettsiaceae
  0.0839	12287	0	genus	150523	            g__Piscirickettsia
  0.0839	12287	12135	species	150524	              s__Piscirickettsia salmonis
  0.0002	23	23	subspecies	150537	                GB_GCA_001932955.1
  0.0001	19	19	subspecies	150540	                RS_GCF_009709495.1
  0.0001	16	16	subspecies	150526	                RS_GCF_009708755.1
  0.0001	16	16	subspecies	150562	                RS_GCF_014622645.1
  0.0001	11	11	subspecies	150546	                RS_GCF_012272975.1
  0.0001	10	10	subspecies	150574	                RS_GCF_001932755.1
  0.0000	7	7	subspecies	150580	                RS_GCF_009709415.1
  0.0000	7	7	subspecies	150571	                RS_GCF_001932795.1
  0.0000	5	5	subspecies	150583	                RS_GCF_009709515.1
  0.0000	4	4	subspecies	150556	                RS_GCF_010092565.1
  0.0000	4	4	subspecies	150573	                RS_GCF_010092545.1
  0.0000	3	3	subspecies	150592	                RS_GCF_009709015.1
  0.0000	2	2	subspecies	150548	                RS_GCF_001534725.1
  0.0000	2	2	subspecies	150561	                RS_GCF_001932875.1
  0.0000	2	2	subspecies	150595	                RS_GCF_001932595.1
  0.0000	2	2	subspecies	150565	                RS_GCF_001932815.1
  0.0000	2	2	subspecies	150538	                RS_GCF_010092585.1
  0.0000	2	2	subspecies	150602	                RS_GCF_001932835.1
  0.0000	1	1	subspecies	150605	                RS_GCF_001932855.1
  0.0000	1	1	subspecies	150594	                RS_GCF_009709535.1
  0.0000	1	1	subspecies	150601	                RS_GCF_003850185.1
  0.0000	1	1	subspecies	150593	                RS_GCF_009709295.1
  0.0000	1	1	subspecies	150604	                RS_GCF_001932895.1
  0.0000	1	1	subspecies	150525	                RS_GCF_009708735.1
  0.0000	1	1	subspecies	150591	                RS_GCF_009708295.1
  0.0000	1	1	subspecies	150588	                RS_GCF_009708235.1
  0.0000	1	1	subspecies	150576	                RS_GCF_009709235.1
  0.0000	1	1	subspecies	150567	                RS_GCF_000756435.2
  0.0000	1	1	subspecies	150545	                RS_GCF_009708695.1
  0.0000	1	1	subspecies	150535	                RS_GCF_009708835.1
  0.0000	1	1	subspecies	150533	                RS_GCF_001514395.1
  0.0000	1	1	subspecies	150532	                RS_GCF_009709355.1
  0.0000	1	1	subspecies	150531	                RS_GCF_000300295.4
  0.0838	12268	0	order	184369	        o__Cardiobacteriales
  0.0838	12268	0	family	202072	          f__Cardiobacteriaceae
  0.0838	12268	0	genus	214553	            g__Dichelobacter
  0.0838	12268	9630	species	214554	              s__Dichelobacter nodosus
  0.0099	1444	1444	subspecies	214556	                RS_GCF_000015345.1
  0.0082	1194	1194	subspecies	214555	                RS_GCF_003390435.1
  0.0000	1	0	order	241843	        o__Thiohalomonadales
  0.0000	1	0	family	241844	          f__Thiohalomonadaceae
  0.0000	1	0	genus	266110	            g__Sulfurivermis
  0.0000	1	0	species	294552	              s__Sulfurivermis fontis
  0.0000	1	1	subspecies	294553	                RS_GCF_004001245.1
  8.6530	1266543	655	class	116083	      c__Alphaproteobacteria
  4.1137	602129	223	order	135420	        o__Rhizobiales
  2.6850	393001	666	family	135421	          f__Rhizobiaceae
  1.0915	159763	4963	genus	142396	            g__Rhizobium
  0.0839	12286	1128	species	160643	              s__Rhizobium laguerreae
  0.0407	5963	5963	subspecies	160680	                RS_GCF_000517605.1
  0.0347	5077	5077	subspecies	160649	                RS_GCF_001890425.1
  0.0003	49	49	subspecies	160686	                RS_GCF_002240185.1
  0.0003	37	37	subspecies	160687	                RS_GCF_001679785.1
  0.0002	32	32	subspecies	160691	                RS_GCF_010365265.1
  0.0837	12253	959	species	194377	              s__Rhizobium acidisoli
  0.0386	5650	5650	subspecies	194382	                RS_GCF_002531755.2
  0.0386	5644	5644	subspecies	194383	                RS_GCF_000021345.1
  0.0835	12217	4188	species	201399	              s__Rhizobium hidalgonense
  0.0275	4025	4025	subspecies	201404	                RS_GCF_000520875.1
  0.0274	4004	4004	subspecies	201401	                RS_GCF_005862185.2
  0.0821	12011	6526	species	225396	              s__Rhizobium etli
  0.0203	2964	2964	subspecies	225397	                RS_GCF_000442435.1
  0.0170	2490	2490	subspecies	225398	                RS_GCF_002119845.1
  0.0002	31	31	subspecies	225399	                RS_GCF_000092045.1
  0.0818	11966	6957	species	150963	              s__Rhizobium leguminosarum
  0.0340	4975	4975	subspecies	150973	                RS_GCF_003290405.1
  0.0001	16	16	subspecies	151039	                RS_GCF_011604505.1
  0.0001	8	8	subspecies	151004	                RS_GCF_011604545.1
  0.0000	5	5	subspecies	151038	                RS_GCF_002948295.1
  0.0000	5	5	subspecies	151046	                RS_GCF_002243365.1
  0.0815	11926	6419	species	163234	              s__Rhizobium phaseoli
  0.0266	3899	3899	subspecies	163235	                RS_GCF_000172715.2
  0.0106	1550	1550	subspecies	163236	                RS_GCF_001664185.1
  0.0002	22	22	subspecies	163248	                RS_GCF_000020265.1
  0.0001	13	13	subspecies	163269	                RS_GCF_001664165.1
  0.0001	12	12	subspecies	163267	                RS_GCF_001664205.1
  0.0000	6	6	subspecies	163257	                RS_GCF_001664245.1
  0.0000	4	4	subspecies	163266	                RS_GCF_001664425.1
  0.0000	1	1	subspecies	163241	                RS_GCF_001664365.1
  0.0814	11917	2706	species	178881	              s__Rhizobium sophoriradicis
  0.0316	4623	4623	subspecies	178891	                RS_GCF_000698845.1
  0.0312	4568	4568	subspecies	178884	                RS_GCF_000172695.2
  0.0001	20	20	subspecies	178897	                GB_GCA_000816125.1
  0.0812	11884	3113	species	200853	              s__Rhizobium indicum
  0.0303	4429	4429	subspecies	200856	                RS_GCF_005862305.2
  0.0297	4342	4342	subspecies	200854	                RS_GCF_005860925.2
  0.0812	11879	10975	species	192268	              s__Rhizobium sp001664485
  0.0061	895	895	subspecies	192269	                RS_GCF_001664485.1
  0.0001	8	8	subspecies	192273	                RS_GCF_001675075.1
  0.0000	1	1	subspecies	192276	                RS_GCF_001675095.1
  0.0809	11838	11116	species	254597	              s__Rhizobium sp003627795
  0.0031	458	458	subspecies	254598	                RS_GCF_003627795.1
  0.0018	264	264	subspecies	254599	                RS_GCF_003627775.1
  0.0803	11751	3009	species	164446	              s__Rhizobium leguminosarum_E
  0.0364	5331	5331	subspecies	164458	                GB_GCA_014189635.1
  0.0232	3399	3399	subspecies	164467	                RS_GCF_000769405.2
  0.0001	12	12	subspecies	164468	                RS_GCF_011604485.1
  0.0791	11577	4244	species	157177	              s__Rhizobium leguminosarum_L
  0.0256	3740	3740	subspecies	157185	                RS_GCF_000009265.1
  0.0245	3593	3593	subspecies	157219	                RS_GCF_011604525.1
  0.0766	11210	11152	species	183973	              s__Rhizobium esperanzae
  0.0004	58	58	subspecies	183984	                RS_GCF_002117725.1
  0.0002	25	0	species	196524	              s__Rhizobium tropici
  0.0002	25	25	subspecies	196531	                RS_GCF_000330885.1
  0.0001	18	0	species	218823	              s__Rhizobium sp002117485
  0.0001	18	18	subspecies	218826	                RS_GCF_002117485.1
  0.0001	18	6	species	142397	              s__Rhizobium ruizarguesonis
  0.0000	5	5	subspecies	142430	                GB_GCA_014189655.1
  0.0000	5	5	subspecies	142536	                RS_GCF_000430465.3
  0.0000	1	1	subspecies	142476	                GB_GCA_014189575.1
  0.0000	1	1	subspecies	142538	                RS_GCF_011604465.1
  0.0001	9	0	species	189195	              s__Rhizobium leguminosarum_K
  0.0001	9	9	subspecies	189203	                RS_GCF_002953715.1
  0.0000	6	0	species	199237	              s__Rhizobium leguminosarum_J
  0.0000	6	6	subspecies	199238	                RS_GCF_000023185.1
  0.0000	6	0	species	223160	              s__Rhizobium etli_B
  0.0000	6	6	subspecies	223163	                RS_GCF_001908375.1
  0.0000	2	0	species	268145	              s__Rhizobium sp000172795
  0.0000	2	2	subspecies	268146	                RS_GCF_000172795.2
  0.0000	1	0	species	222631	              s__Rhizobium azibense
  0.0000	1	1	subspecies	222632	                GB_GCA_000816845.1
  0.6669	97607	1959	genus	136137	            g__Agrobacterium
  0.0835	12224	11951	species	202898	              s__Agrobacterium rhizogenes_A
  0.0018	258	258	subspecies	202900	                RS_GCF_002005205.3
  0.0001	15	15	subspecies	202903	                RS_GCF_001649535.1
  0.0835	12223	11927	species	224014	              s__Agrobacterium sp900012625
  0.0016	234	234	subspecies	224015	                RS_GCF_005221325.1
  0.0004	62	62	subspecies	224017	                RS_GCF_005221345.1
  0.0820	12005	4653	species	172001	              s__Agrobacterium fabrum
  0.0285	4175	4175	subspecies	172006	                RS_GCF_003667945.1
  0.0213	3114	3114	subspecies	172002	                RS_GCF_000092025.1
  0.0004	56	56	subspecies	172019	                RS_GCF_013365515.1
  0.0000	7	7	subspecies	172024	                RS_GCF_003667725.1
  0.0820	11997	215	species	170163	              s__Agrobacterium deltaense
  0.0408	5974	5974	subspecies	170164	                RS_GCF_006970545.1
  0.0395	5787	5787	subspecies	170167	                RS_GCF_005221405.1
  0.0001	21	21	subspecies	170188	                RS_GCF_002943835.1
  0.0818	11966	8942	species	153096	              s__Agrobacterium pusense
  0.0200	2929	2929	subspecies	153112	                RS_GCF_005221365.1
  0.0002	25	25	subspecies	153148	                RS_GCF_012272675.1
  0.0001	21	21	subspecies	153107	                RS_GCF_013267135.1
  0.0001	12	12	subspecies	153156	                RS_GCF_013285525.1
  0.0001	9	9	subspecies	153121	                GB_GCA_001551895.1
  0.0001	8	8	subspecies	153147	                RS_GCF_001691455.1
  0.0001	8	8	subspecies	153165	                RS_GCF_002814035.1
  0.0000	7	7	subspecies	153149	                RS_GCF_000499645.1
  0.0000	3	3	subspecies	153154	                RS_GCF_013267155.1
  0.0000	2	2	subspecies	153168	                GB_GCA_004328495.1
  0.0812	11891	1400	species	197086	              s__Agrobacterium sp900013535
  0.0360	5266	5266	subspecies	197092	                RS_GCF_005221385.1
  0.0357	5225	5225	subspecies	197093	                RS_GCF_005221425.1
  0.0804	11769	11642	species	141332	              s__Agrobacterium sp000192635
  0.0005	68	68	subspecies	141424	                RS_GCF_000439225.1
  0.0001	19	19	subspecies	141374	                RS_GCF_003666425.1
  0.0001	16	16	subspecies	141457	                RS_GCF_000192635.1
  0.0001	12	12	subspecies	141365	                RS_GCF_000576515.1
  0.0001	9	9	subspecies	141473	                RS_GCF_000442985.1
  0.0000	3	3	subspecies	141358	                RS_GCF_000971565.1
  0.0790	11562	5602	species	193358	              s__Agrobacterium oryzihabitans
  0.0359	5260	5260	subspecies	193364	                GB_GCA_005221465.1
  0.0048	696	696	subspecies	193362	                GB_GCA_005221445.1
  0.0000	4	4	subspecies	193365	                RS_GCF_010669145.1
  0.0001	11	6	species	136138	              s__Agrobacterium tumefaciens
  0.0000	2	2	subspecies	136259	                RS_GCF_004023565.1
  0.0000	1	1	subspecies	136303	                RS_GCF_002591665.3
  0.0000	1	1	subspecies	136319	                RS_GCF_014489975.1
  0.0000	1	1	subspecies	136329	                RS_GCF_003667905.1
  0.5038	73742	3052	genus	156359	            g__Mesorhizobium
  0.0833	12191	11818	species	238077	              s__Mesorhizobium sp013170805
  0.0024	351	351	subspecies	238078	                RS_GCF_013170805.1
  0.0002	22	22	subspecies	238079	                RS_GCF_013170745.1
  0.0820	11997	6542	species	211523	              s__Mesorhizobium loti_D
  0.0188	2755	2755	subspecies	211526	                RS_GCF_013170765.1
  0.0184	2700	2700	subspecies	211525	                RS_GCF_013170705.1
  0.0814	11913	11842	species	193241	              s__Mesorhizobium jarvisii
  0.0004	64	64	subspecies	193247	                RS_GCF_001676765.1
  0.0000	5	5	subspecies	193244	                RS_GCF_013170865.1
  0.0000	2	2	subspecies	193245	                RS_GCF_013170785.1
  0.0789	11546	6707	species	174047	              s__Mesorhizobium japonicum
  0.0331	4839	4839	subspecies	174049	                RS_GCF_000009625.1
  0.0785	11493	6099	species	164637	              s__Mesorhizobium ciceri
  0.0185	2714	2714	subspecies	164638	                RS_GCF_001618825.1
  0.0180	2638	2638	subspecies	164641	                RS_GCF_000185905.1
  0.0002	22	22	subspecies	164661	                RS_GCF_001618845.1
  0.0001	20	20	subspecies	164658	                RS_GCF_001672455.2
  0.0784	11474	2011	species	176003	              s__Mesorhizobium sp003952425
  0.0328	4800	4800	subspecies	176005	                RS_GCF_003952405.1
  0.0313	4575	4575	subspecies	176011	                RS_GCF_003952425.1
  0.0006	88	88	subspecies	176020	                RS_GCF_003952445.1
  0.0002	27	0	species	239548	              s__Mesorhizobium loti_B
  0.0002	27	27	subspecies	239550	                RS_GCF_013170845.1
  0.0001	15	0	species	230271	              s__Mesorhizobium loti
  0.0001	15	15	subspecies	230274	                RS_GCF_003952545.1
  0.0001	10	0	species	251410	              s__Mesorhizobium sp013170825
  0.0001	10	10	subspecies	251411	                RS_GCF_013170825.1
  0.0000	6	0	species	219376	              s__Mesorhizobium erdmanii
  0.0000	6	6	subspecies	219378	                RS_GCF_013170725.1
  0.0000	5	0	species	166713	              s__Mesorhizobium sp003996995
  0.0000	5	5	subspecies	166745	                RS_GCF_004006095.1
  0.0000	5	0	species	282244	              s__Mesorhizobium loti_C
  0.0000	5	5	subspecies	282245	                RS_GCF_002356515.1
  0.0000	2	0	species	288121	              s__Mesorhizobium huakuii_A
  0.0000	2	2	subspecies	288122	                RS_GCF_014189455.1
  0.0000	1	0	species	209022	              s__Mesorhizobium sp003952485
  0.0000	1	1	subspecies	209025	                RS_GCF_003952485.1
  0.0000	1	0	species	200150	              s__Mesorhizobium sp003952465
  0.0000	1	1	subspecies	200155	                RS_GCF_003952465.1
  0.0000	1	0	species	198555	              s__Mesorhizobium sp003952385
  0.0000	1	1	subspecies	198559	                RS_GCF_003952385.1
  0.0000	1	0	species	189424	              s__Mesorhizobium opportunistum
  0.0000	1	1	subspecies	189425	                RS_GCF_000176035.2
  0.0000	1	0	species	174742	              s__Mesorhizobium mediterraneum
  0.0000	1	1	subspecies	174743	                RS_GCF_003952585.1
  0.0000	1	0	species	173775	              s__Mesorhizobium sp004791165
  0.0000	1	1	subspecies	173795	                GB_GCA_003952565.1
  0.2516	36834	1653	genus	135422	            g__Sinorhizobium
  0.0833	12187	3732	species	216677	              s__Sinorhizobium americanum
  0.0291	4263	4263	subspecies	216681	                RS_GCF_000705595.2
  0.0286	4192	4192	subspecies	216678	                RS_GCF_001889105.1
  0.0806	11791	3147	species	198735	              s__Sinorhizobium fredii_C
  0.0310	4532	4532	subspecies	198742	                RS_GCF_002944405.1
  0.0281	4112	4112	subspecies	198739	                RS_GCF_002288505.1
  0.0763	11172	5982	species	178285	              s__Sinorhizobium fredii
  0.0179	2624	2624	subspecies	178286	                RS_GCF_003100575.1
  0.0171	2499	2499	subspecies	178289	                RS_GCF_000283895.1
  0.0003	47	47	subspecies	178290	                RS_GCF_002288485.1
  0.0001	20	20	subspecies	178299	                RS_GCF_003177055.1
  0.0001	14	0	species	253479	              s__Sinorhizobium fredii_B
  0.0001	14	14	subspecies	253481	                RS_GCF_000265205.3
  0.0001	10	0	species	233855	              s__Sinorhizobium sojae
  0.0001	10	10	subspecies	233856	                RS_GCF_002288525.1
  0.0000	4	3	species	135423	              s__Sinorhizobium meliloti
  0.0000	1	1	subspecies	135466	                RS_GCF_002197125.1
  0.0000	3	0	species	271863	              s__Sinorhizobium fredii_A
  0.0000	3	3	subspecies	271864	                RS_GCF_000018545.1
  0.0838	12272	0	genus	172124	            g__Allorhizobium
  0.0838	12270	2939	species	226134	              s__Allorhizobium sp001713475
  0.0319	4676	4676	subspecies	226137	                RS_GCF_001713475.1
  0.0318	4655	4655	subspecies	226136	                RS_GCF_009650195.1
  0.0000	1	0	species	235517	              s__Allorhizobium sp004912145
  0.0000	1	1	subspecies	235518	                RS_GCF_008000915.1
  0.0000	1	0	species	303687	              s__Allorhizobium thiooxidans
  0.0000	1	1	subspecies	303688	                RS_GCF_014126615.1
  0.0828	12115	2	genus	202724	            g__Aminobacter
  0.0828	12113	11510	species	226292	              s__Aminobacter niigataensis
  0.0041	597	597	subspecies	226293	                RS_GCF_003063555.1
  0.0000	6	6	subspecies	226294	                RS_GCF_003071665.1
  0.0000	1	0	genus	268766	            g__Hoeflea
  0.0000	1	0	species	295845	              s__Hoeflea sp001011155
  0.0000	1	1	subspecies	295846	                RS_GCF_001011155.1
  0.0000	1	0	genus	300216	            g__Salaquimonas
  0.0000	1	0	species	300217	              s__Salaquimonas pukyongi
  0.0000	1	1	subspecies	300218	                RS_GCF_001953055.1
  0.8403	122997	115	family	176757	          f__Xanthobacteraceae
  0.6721	98374	2346	genus	176758	            g__Bradyrhizobium
  0.0840	12298	1819	species	245003	              s__Bradyrhizobium sp000244915
  0.0359	5251	5251	subspecies	245005	                RS_GCF_000244915.1
  0.0357	5228	5228	subspecies	245004	                RS_GCF_900011245.1
  0.0839	12277	979	species	238901	              s__Bradyrhizobium cosmicum
  0.0386	5649	5649	subspecies	238902	                RS_GCF_007290395.1
  0.0386	5649	5649	subspecies	238903	                RS_GCF_000284275.1
  0.0838	12272	12265	species	255771	              s__Bradyrhizobium sp005937885
  0.0000	4	4	subspecies	255772	                RS_GCF_005937905.2
  0.0000	3	3	subspecies	255773	                RS_GCF_005937885.2
  0.0838	12271	5576	species	216562	              s__Bradyrhizobium symbiodeficiens
  0.0229	3351	3351	subspecies	216564	                RS_GCF_011604645.1
  0.0224	3278	3278	subspecies	216563	                RS_GCF_002266465.2
  0.0003	39	39	subspecies	216565	                RS_GCF_006459165.1
  0.0002	27	27	subspecies	216566	                RS_GCF_011604665.1
  0.0838	12270	9125	species	225412	              s__Bradyrhizobium ottawaense_A
  0.0110	1612	1612	subspecies	225414	                RS_GCF_900099825.1
  0.0105	1533	1533	subspecies	225415	                RS_GCF_900142345.1
  0.0800	11708	465	species	198040	              s__Bradyrhizobium sp011516635
  0.0401	5869	5869	subspecies	198046	                RS_GCF_900011265.1
  0.0367	5374	5374	subspecies	198042	                RS_GCF_001887695.1
  0.0797	11671	6306	species	193840	              s__Bradyrhizobium ottawaense
  0.0188	2752	2752	subspecies	193847	                RS_GCF_002278135.2
  0.0173	2538	2538	subspecies	193842	                RS_GCF_009176685.1
  0.0005	75	75	subspecies	193848	                RS_GCF_009176665.1
  0.0765	11196	5938	species	181228	              s__Bradyrhizobium japonicum
  0.0337	4933	4933	subspecies	181233	                RS_GCF_000661935.1
  0.0011	167	167	subspecies	181239	                RS_GCF_013752735.1
  0.0011	158	158	subspecies	181232	                RS_GCF_000284375.1
  0.0003	42	29	species	176759	              s__Bradyrhizobium diazoefficiens
  0.0000	7	7	subspecies	176766	                RS_GCF_001549695.1
  0.0000	3	3	subspecies	176772	                RS_GCF_009931255.1
  0.0000	2	2	subspecies	176760	                RS_GCF_003183845.2
  0.0000	1	1	subspecies	176775	                RS_GCF_013390305.1
  0.0001	9	0	species	286179	              s__Bradyrhizobium betae
  0.0001	9	9	subspecies	286180	                RS_GCF_008932115.1
  0.0000	6	0	species	181623	              s__Bradyrhizobium elkanii
  0.0000	6	6	subspecies	181637	                RS_GCF_012871055.1
  0.0000	5	0	species	257969	              s__Bradyrhizobium amphicarpaeae
  0.0000	5	5	subspecies	257970	                RS_GCF_002266435.2
  0.0000	1	0	species	241982	              s__Bradyrhizobium guangdongense
  0.0000	1	1	subspecies	241984	                RS_GCF_004114975.1
  0.0000	1	0	species	271376	              s__Bradyrhizobium guangxiense
  0.0000	1	1	subspecies	271377	                RS_GCF_004114915.1
  0.0000	1	0	species	274202	              s__Bradyrhizobium sp900103365
  0.0000	1	1	subspecies	274203	                RS_GCF_900103365.1
  0.1674	24508	53	genus	195100	            g__Rhodopseudomonas
  0.0836	12242	56	species	215189	              s__Rhodopseudomonas palustris_H
  0.0417	6100	6100	subspecies	215190	                RS_GCF_003031265.1
  0.0416	6086	6086	subspecies	215193	                RS_GCF_003031245.1
  0.0834	12207	2705	species	210478	              s__Rhodopseudomonas palustris_G
  0.0326	4774	4774	subspecies	210480	                RS_GCF_000177255.2
  0.0323	4728	4728	subspecies	210479	                RS_GCF_007005445.1
  0.0000	6	2	species	195101	              s__Rhodopseudomonas palustris_F
  0.0000	3	3	subspecies	195105	                RS_GCF_013415845.1
  0.0000	1	1	subspecies	195104	                RS_GCF_000020445.1
  0.3361	49189	0	family	179311	          f__Beijerinckiaceae
  0.3361	49189	736	genus	179312	            g__Methylobacterium
  0.0835	12220	6019	species	183947	              s__Methylobacterium fujisawaense
  0.0324	4744	4744	subspecies	183950	                RS_GCF_001936175.1
  0.0097	1420	1420	subspecies	183953	                RS_GCF_000757795.1
  0.0003	37	37	subspecies	183956	                RS_GCF_003254375.1
  0.0827	12108	527	species	198425	              s__Methylobacterium thiocyanatum
  0.0399	5838	5838	subspecies	198427	                RS_GCF_006740745.1
  0.0392	5743	5743	subspecies	198428	                RS_GCF_000019945.1
  0.0824	12065	11713	species	229385	              s__Methylobacterium sp003111705
  0.0017	245	245	subspecies	229388	                RS_GCF_003111705.1
  0.0005	72	72	subspecies	229387	                RS_GCF_011212365.1
  0.0002	35	35	subspecies	229386	                RS_GCF_011212505.1
  0.0823	12046	3864	species	180434	              s__Methylobacterium organophilum
  0.0287	4194	4194	subspecies	180440	                RS_GCF_000019725.1
  0.0272	3988	3988	subspecies	180439	                RS_GCF_001854385.1
  0.0000	6	0	species	276310	              s__Methylobacterium populi_A
  0.0000	6	6	subspecies	276311	                RS_GCF_002355515.1
  0.0000	5	2	species	179313	              s__Methylobacterium extorquens
  0.0000	1	1	subspecies	179315	                RS_GCF_000022685.1
  0.0000	1	1	subspecies	179325	                RS_GCF_000021845.1
  0.0000	1	1	subspecies	179328	                RS_GCF_000083545.1
  0.0000	1	0	species	213902	              s__Methylobacterium brachiatum
  0.0000	1	1	subspecies	213906	                RS_GCF_003697185.1
  0.0000	1	0	species	224916	              s__Methylobacterium sp008000895
  0.0000	1	1	subspecies	224918	                RS_GCF_008000895.1
  0.0000	1	0	species	280332	              s__Methylobacterium mesophilicum
  0.0000	1	1	subspecies	280333	                RS_GCF_000364445.2
  0.0840	12300	0	family	218747	          f__Hyphomicrobiaceae
  0.0840	12300	0	genus	218748	            g__Filomicrobium
  0.0840	12300	12270	species	218749	              s__Filomicrobium insigne
  0.0001	19	19	subspecies	218752	                RS_GCF_000981565.1
  0.0001	11	11	subspecies	218751	                RS_GCF_000981545.1
  0.0840	12292	0	family	212411	          f__Devosiaceae
  0.0840	12292	0	genus	213134	            g__Pelagibacterium
  0.0840	12292	12149	species	227071	              s__Pelagibacterium halotolerans
  0.0006	82	82	subspecies	227073	                RS_GCF_013004005.1
  0.0004	61	61	subspecies	227072	                RS_GCF_000230555.1
  0.0829	12127	4	family	183780	          f__Stappiaceae
  0.0828	12123	0	genus	184894	            g__Pannonibacter
  0.0828	12123	2236	species	184895	              s__Pannonibacter indicus
  0.0346	5070	5070	subspecies	184897	                RS_GCF_003574985.1
  0.0328	4800	4800	subspecies	184896	                RS_GCF_001484065.1
  0.0001	17	17	subspecies	184899	                RS_GCF_003723955.1
  1.3445	196795	0	order	116084	        o__Rickettsiales
  0.7563	110696	0	family	116085	          f__Anaplasmataceae
  0.4201	61496	2319	genus	116086	            g__Wolbachia
  0.0840	12300	4078	species	178513	              s__Wolbachia sp000306885
  0.0281	4112	4112	subspecies	178515	                RS_GCF_000306885.1
  0.0281	4110	4110	subspecies	178518	                RS_GCF_000530755.1
  0.0840	12295	7201	species	169545	              s__Wolbachia sp000008385
  0.0346	5063	5063	subspecies	169547	                RS_GCF_012030695.1
  0.0002	29	29	subspecies	169550	                RS_GCF_004795935.1
  0.0000	2	2	subspecies	169572	                RS_GCF_000008385.1
  0.0829	12127	6996	species	164408	              s__Wolbachia pipientis_C
  0.0327	4782	4782	subspecies	164419	                RS_GCF_003999585.1
  0.0016	236	236	subspecies	164411	                RS_GCF_002379145.2
  0.0005	69	69	subspecies	164439	                RS_GCF_013458815.1
  0.0002	25	25	subspecies	164422	                RS_GCF_000073005.1
  0.0001	16	16	subspecies	164424	                RS_GCF_008245065.1
  0.0000	2	2	subspecies	164437	                RS_GCF_002374845.2
  0.0000	1	1	subspecies	164433	                RS_GCF_004171285.1
  0.0809	11844	227	species	204444	              s__Wolbachia pipientis_B
  0.0403	5895	5895	subspecies	204447	                RS_GCF_014107455.1
  0.0391	5722	5722	subspecies	204446	                RS_GCF_014107475.1
  0.0721	10554	10435	species	187921	              s__Wolbachia sp000376585
  0.0007	102	102	subspecies	187930	                RS_GCF_000376585.1
  0.0001	9	9	subspecies	187928	                RS_GCF_004795975.1
  0.0001	8	8	subspecies	187926	                RS_GCF_004795955.1
  0.0003	50	24	species	116087	              s__Wolbachia pipientis
  0.0001	14	14	subspecies	116983	                RS_GCF_009732755.1
  0.0000	5	5	subspecies	116208	                RS_GCF_000376605.1
  0.0000	4	4	subspecies	116181	                RS_GCF_000953315.1
  0.0000	2	2	subspecies	116991	                RS_GCF_006542295.1
  0.0000	1	1	subspecies	116242	                RS_GCF_001758565.1
  0.0000	4	0	species	285177	              s__Wolbachia sp001439985
  0.0000	4	4	subspecies	285178	                RS_GCF_001439985.1
  0.0000	1	0	species	190487	              s__Wolbachia sp000829315
  0.0000	1	1	subspecies	190492	                RS_GCF_000829315.1
  0.0000	1	0	species	288588	              s__Wolbachia sp013365495
  0.0000	1	1	subspecies	288589	                RS_GCF_013365495.1
  0.0000	1	0	species	316377	              s__Wolbachia sp013365475
  0.0000	1	1	subspecies	316378	                RS_GCF_013365475.1
  0.2521	36900	25	genus	174830	            g__Ehrlichia
  0.0840	12295	10046	species	240803	              s__Ehrlichia canis
  0.0078	1149	1149	subspecies	240805	                RS_GCF_000012565.1
  0.0075	1100	1100	subspecies	240804	                RS_GCF_002879995.1
  0.0840	12294	12102	species	191563	              s__Ehrlichia chaffeensis
  0.0011	159	159	subspecies	191564	                RS_GCF_000632925.1
  0.0001	9	9	subspecies	191567	                RS_GCF_000632945.1
  0.0001	8	8	subspecies	191565	                RS_GCF_000632815.1
  0.0000	7	7	subspecies	191569	                RS_GCF_000632865.1
  0.0000	7	7	subspecies	191570	                RS_GCF_000632885.1
  0.0000	2	2	subspecies	191572	                RS_GCF_000013145.1
  0.0839	12281	12212	species	221482	              s__Ehrlichia ruminantium_B
  0.0002	30	30	subspecies	221483	                RS_GCF_009728855.1
  0.0002	24	24	subspecies	221485	                RS_GCF_009728815.1
  0.0001	15	15	subspecies	221484	                RS_GCF_009728835.1
  0.0000	3	3	species	174831	              s__Ehrlichia ruminantium
  0.0000	2	0	species	225485	              s__Ehrlichia muris
  0.0000	2	2	subspecies	225487	                RS_GCF_000508225.1
  0.0840	12300	535	genus	168586	            g__Anaplasma
  0.0803	11751	10443	species	171417	              s__Anaplasma marginale
  0.0066	969	969	subspecies	171433	                RS_GCF_003515735.1
  0.0020	289	289	subspecies	171427	                RS_GCF_000495535.1
  0.0001	16	16	subspecies	171438	                RS_GCF_000495495.1
  0.0001	12	12	subspecies	171440	                RS_GCF_003515675.1
  0.0001	11	11	subspecies	171436	                RS_GCF_000011945.1
  0.0001	11	11	subspecies	171439	                RS_GCF_000020305.1
  0.0001	14	0	species	276979	              s__Anaplasma centrale
  0.0001	14	14	subspecies	276980	                RS_GCF_000024505.1
  0.5882	86099	0	family	153173	          f__Rickettsiaceae
  0.5882	86099	1757	genus	153174	            g__Rickettsia
  0.0840	12291	12203	species	183752	              s__Rickettsia prowazekii
  0.0002	34	34	subspecies	183754	                RS_GCF_000277185.1
  0.0001	14	14	subspecies	183755	                RS_GCF_000277165.1
  0.0001	10	10	subspecies	183760	                RS_GCF_000363905.1
  0.0000	7	7	subspecies	183765	                RS_GCF_000277265.1
  0.0000	6	6	subspecies	183764	                RS_GCF_000277205.1
  0.0000	4	4	subspecies	183759	                RS_GCF_001602215.1
  0.0000	4	4	subspecies	183761	                RS_GCF_000367405.1
  0.0000	3	3	subspecies	183757	                RS_GCF_000277245.1
  0.0000	3	3	subspecies	183758	                RS_GCF_000277225.1
  0.0000	2	2	subspecies	183763	                RS_GCF_000195735.1
  0.0000	1	1	subspecies	183756	                RS_GCF_000022785.1
  0.0840	12290	1869	species	245904	              s__Rickettsia canadensis
  0.0358	5246	5246	subspecies	245905	                RS_GCF_000283915.1
  0.0354	5175	5175	subspecies	245906	                RS_GCF_000014345.1
  0.0839	12281	12237	species	210671	              s__Rickettsia typhi
  0.0002	22	22	subspecies	210673	                RS_GCF_000277305.1
  0.0001	12	12	subspecies	210675	                RS_GCF_900536895.1
  0.0000	7	7	subspecies	210672	                RS_GCF_000277285.1
  0.0000	3	3	subspecies	210674	                RS_GCF_000008045.1
  0.0826	12085	849	species	200216	              s__Rickettsia buchneri
  0.0385	5636	5636	subspecies	200219	                RS_GCF_000160735.1
  0.0383	5600	5600	subspecies	200220	                RS_GCF_000499665.2
  0.0824	12066	1643	species	246993	              s__Rickettsia helvetica_A
  0.0357	5227	5227	subspecies	246994	                RS_GCF_007989425.1
  0.0355	5196	5196	subspecies	246995	                RS_GCF_000255355.1
  0.0818	11967	9515	species	209361	              s__Rickettsia bellii
  0.0081	1180	1180	subspecies	209363	                RS_GCF_000018245.1
  0.0076	1115	1115	subspecies	209362	                RS_GCF_000012385.1
  0.0011	157	157	subspecies	209365	                RS_GCF_002078315.1
  0.0767	11230	5313	species	180839	              s__Rickettsia rhipicephali
  0.0358	5247	5247	subspecies	180841	                RS_GCF_000284175.1
  0.0042	619	619	subspecies	180840	                RS_GCF_000940955.1
  0.0001	15	15	subspecies	180842	                RS_GCF_000284075.1
  0.0001	13	13	subspecies	180848	                RS_GCF_000016625.1
  0.0001	10	10	subspecies	180849	                RS_GCF_000283855.1
  0.0000	7	7	subspecies	180854	                RS_GCF_001442475.1
  0.0000	4	4	subspecies	180853	                RS_GCF_001273795.1
  0.0000	2	2	subspecies	180852	                RS_GCF_001975185.1
  0.0009	126	87	species	153175	              s__Rickettsia rickettsii
  0.0001	9	9	subspecies	153220	                RS_GCF_005549115.1
  0.0001	9	9	subspecies	153221	                RS_GCF_000021525.1
  0.0000	7	7	subspecies	153226	                RS_GCF_000023005.1
  0.0000	6	6	subspecies	153190	                RS_GCF_000007025.1
  0.0000	4	4	subspecies	153242	                RS_GCF_000283995.1
  0.0000	2	2	subspecies	153195	                RS_GCF_000284195.1
  0.0000	1	1	subspecies	153184	                RS_GCF_000283935.1
  0.0000	1	1	subspecies	153192	                RS_GCF_000166935.1
  0.0000	3	0	species	216587	              s__Rickettsia sp002285905
  0.0000	3	3	subspecies	216588	                RS_GCF_002285905.1
  0.0000	2	0	species	213115	              s__Rickettsia felis
  0.0000	2	2	subspecies	213118	                RS_GCF_000012145.1
  0.0000	1	0	species	255412	              s__Rickettsia australis
  0.0000	1	1	subspecies	255413	                RS_GCF_000284155.1
  1.0083	147580	0	order	169714	        o__Acetobacterales
  1.0083	147580	1714	family	169715	          f__Acetobacteraceae
  0.3276	47956	1741	genus	169716	            g__Acetobacter
  0.0812	11892	450	species	201552	              s__Acetobacter senegalensis
  0.0397	5811	5811	subspecies	201556	                RS_GCF_001499615.1
  0.0385	5631	5631	subspecies	201557	                RS_GCF_002549835.1
  0.0786	11511	4664	species	201290	              s__Acetobacter ascendens
  0.0335	4900	4900	subspecies	201292	                RS_GCF_002173775.1
  0.0130	1903	1903	subspecies	201295	                RS_GCF_001766255.1
  0.0003	44	44	subspecies	201296	                RS_GCF_001766235.1
  0.0783	11456	11114	species	171136	              s__Acetobacter oryzifermentans
  0.0010	151	151	subspecies	171142	                RS_GCF_002456135.1
  0.0009	125	125	subspecies	171144	                RS_GCF_002220195.1
  0.0003	40	40	subspecies	171150	                RS_GCF_003391275.1
  0.0001	18	18	subspecies	171154	                RS_GCF_001628715.1
  0.0001	8	8	subspecies	171148	                RS_GCF_003323795.1
  0.0770	11277	3994	species	215417	              s__Acetobacter oryzoeni
  0.0382	5590	5590	subspecies	215419	                RS_GCF_004014775.2
  0.0115	1687	1687	subspecies	215418	                RS_GCF_002173735.1
  0.0000	6	6	subspecies	215421	                RS_GCF_001183745.1
  0.0005	73	42	species	169717	              s__Acetobacter pasteurianus
  0.0002	22	22	subspecies	169735	                RS_GCF_009914215.1
  0.0000	7	7	subspecies	169731	                RS_GCF_002202135.1
  0.0000	1	1	subspecies	169736	                RS_GCF_000241585.2
  0.0000	1	1	subspecies	169740	                RS_GCF_000723785.2
  0.0000	3	0	species	195359	              s__Acetobacter orientalis
  0.0000	3	3	subspecies	195363	                RS_GCF_003966365.1
  0.0000	1	0	species	201352	              s__Acetobacter aceti
  0.0000	1	1	subspecies	201357	                RS_GCF_014218315.1
  0.0000	1	0	species	254518	              s__Acetobacter ghanensis
  0.0000	1	1	subspecies	254520	                RS_GCF_001499675.1
  0.0000	1	0	species	283327	              s__Acetobacter sp008365315
  0.0000	1	1	subspecies	283328	                RS_GCF_008365315.1
  0.0840	12300	34	genus	194330	            g__Granulibacter
  0.0838	12261	12247	species	237418	              s__Granulibacter bethesdensis_B
  0.0001	8	8	subspecies	237419	                RS_GCF_001889505.1
  0.0000	6	6	subspecies	237420	                RS_GCF_001889545.1
  0.0000	5	3	species	194331	              s__Granulibacter bethesdensis
  0.0000	2	2	subspecies	194334	                RS_GCF_001889445.1
  0.0840	12299	0	genus	191181	            g__Commensalibacter
  0.0840	12299	1659	species	191182	              s__Commensalibacter sp003202795
  0.0364	5321	5321	subspecies	191191	                RS_GCF_003691365.1
  0.0363	5319	5319	subspecies	191187	                RS_GCF_009734185.1
  0.0840	12294	0	genus	186195	            g__Bombella
  0.0840	12294	3478	species	186196	              s__Bombella apis
  0.0302	4414	4414	subspecies	186203	                RS_GCF_002079945.1
  0.0301	4402	4402	subspecies	186198	                GB_GCA_009734205.1
  0.0840	12290	0	genus	210960	            g__Acidiphilium
  0.0840	12290	3048	species	210961	              s__Acidiphilium multivorum
  0.0319	4667	4667	subspecies	210963	                RS_GCF_000202835.1
  0.0313	4575	4575	subspecies	210962	                RS_GCF_000016725.1
  0.0837	12258	0	genus	215312	            g__Gluconacetobacter
  0.0837	12258	7237	species	215313	              s__Gluconacetobacter diazotrophicus
  0.0172	2523	2523	subspecies	215315	                RS_GCF_000067045.1
  0.0171	2498	2498	subspecies	215316	                RS_GCF_000021325.1
  0.0835	12222	0	genus	185920	            g__Gluconobacter_A
  0.0835	12222	11713	species	185921	              s__Gluconobacter_A thailandicus
  0.0027	392	392	subspecies	185926	                RS_GCF_000311765.1
  0.0004	63	63	subspecies	185927	                RS_GCF_008118345.1
  0.0004	54	54	subspecies	185924	                RS_GCF_001680825.1
  0.0831	12164	146	genus	188078	            g__Komagataeibacter
  0.0820	12001	1300	species	212243	              s__Komagataeibacter saccharivorans
  0.0373	5464	5464	subspecies	212247	                RS_GCF_004348195.1
  0.0358	5237	5237	subspecies	212244	                RS_GCF_003546645.1
  0.0000	6	0	species	234523	              s__Komagataeibacter medellinensis
  0.0000	6	6	subspecies	234524	                RS_GCF_000182745.2
  0.0000	5	0	species	193079	              s__Komagataeibacter europaeus
  0.0000	5	5	subspecies	193082	                RS_GCF_002173515.1
  0.0000	4	0	species	224611	              s__Komagataeibacter xylinus
  0.0000	4	4	subspecies	224613	                RS_GCF_004006375.1
  0.0000	1	0	species	202088	              s__Komagataeibacter rhaeticus
  0.0000	1	1	subspecies	202089	                RS_GCF_002762195.1
  0.0000	1	0	species	245254	              s__Komagataeibacter nataicola
  0.0000	1	1	subspecies	245256	                RS_GCF_002009295.1
  0.0825	12082	0	genus	212550	            g__Kozakia
  0.0825	12082	308	species	212551	              s__Kozakia baliensis
  0.0403	5906	5906	subspecies	212553	                RS_GCF_001787355.1
  0.0401	5868	5868	subspecies	212554	                RS_GCF_001787335.1
  0.0000	1	0	genus	184574	            g__Gluconobacter
  0.0000	1	1	species	184575	              s__Gluconobacter oxydans
  0.5880	86072	0	order	120682	        o__Rhizobiales_A
  0.5880	86072	26	family	120683	          f__Rhizobiaceae_A
  0.4200	61476	237	genus	170301	            g__Bartonella
  0.0840	12293	8328	species	179508	              s__Bartonella quintana
  0.0189	2766	2766	subspecies	179511	                RS_GCF_009936175.1
  0.0075	1103	1103	subspecies	179512	                RS_GCF_900475345.1
  0.0003	51	51	subspecies	179524	                RS_GCF_000046685.1
  0.0003	45	45	subspecies	179519	                RS_GCF_000294715.1
  0.0840	12289	6030	species	194444	              s__Bartonella rochalimae
  0.0420	6154	6154	subspecies	194446	                RS_GCF_002810325.1
  0.0005	68	68	subspecies	194447	                RS_GCF_002022565.1
  0.0001	11	11	subspecies	194448	                RS_GCF_002022485.1
  0.0001	8	8	subspecies	194449	                RS_GCF_002022645.1
  0.0001	8	8	subspecies	194451	                RS_GCF_002022585.1
  0.0000	7	7	subspecies	194450	                RS_GCF_002022545.1
  0.0000	3	3	subspecies	194452	                RS_GCF_002022625.1
  0.0838	12273	11984	species	236713	              s__Bartonella sp002022665
  0.0010	153	153	subspecies	236715	                RS_GCF_002022665.1
  0.0009	136	136	subspecies	236714	                RS_GCF_002022605.1
  0.0838	12272	1060	species	231901	              s__Bartonella apis_A
  0.0384	5625	5625	subspecies	231903	                RS_GCF_002007505.1
  0.0382	5587	5587	subspecies	231902	                RS_GCF_002007485.1
  0.0827	12099	11670	species	240353	              s__Bartonella tribocorum
  0.0017	254	254	subspecies	240354	                RS_GCF_000689355.1
  0.0012	175	175	subspecies	240355	                RS_GCF_000196435.1
  0.0001	13	0	species	282329	              s__Bartonella kosoyi
  0.0001	13	13	subspecies	282330	                RS_GCF_003606325.2
  0.0840	12299	0	genus	166679	            g__Liberibacter
  0.0840	12299	11839	species	246767	              s__Liberibacter crescens
  0.0017	250	250	subspecies	246769	                RS_GCF_001543305.1
  0.0014	210	210	subspecies	246768	                RS_GCF_000325745.1
  0.0838	12271	0	genus	120684	            g__Brucella
  0.0838	12271	12038	species	120685	              s__Brucella melitensis
  0.0002	32	32	subspecies	120919	                GB_GCA_001908355.1
  0.0001	21	21	subspecies	120700	                RS_GCF_900236495.1
  0.0001	21	21	subspecies	121301	                RS_GCF_009601725.1
  0.0001	20	20	subspecies	120886	                RS_GCF_014495905.1
  0.0001	13	13	subspecies	121286	                RS_GCF_000590815.1
  0.0001	12	12	subspecies	121173	                RS_GCF_900092405.1
  0.0001	11	11	subspecies	121197	                RS_GCF_001971625.1
  0.0001	11	11	subspecies	121191	                RS_GCF_900095155.1
  0.0001	10	10	subspecies	121165	                RS_GCF_000016845.1
  0.0001	10	10	subspecies	121061	                RS_GCF_014084005.1
  0.0000	7	7	subspecies	121236	                RS_GCF_001971805.1
  0.0000	4	4	subspecies	120939	                RS_GCF_002291385.1
  0.0000	4	4	subspecies	120817	                RS_GCF_002214285.1
  0.0000	3	3	subspecies	120954	                RS_GCF_000699025.1
  0.0000	3	3	subspecies	121390	                RS_GCF_001715425.1
  0.0000	3	3	subspecies	120761	                RS_GCF_000740255.1
  0.0000	3	3	subspecies	121381	                RS_GCF_001307475.2
  0.0000	3	3	subspecies	120769	                RS_GCF_000740195.1
  0.0000	3	3	subspecies	121146	                RS_GCF_000740435.1
  0.0000	3	3	subspecies	121125	                RS_GCF_009017355.1
  0.0000	2	2	subspecies	120864	                RS_GCF_003010715.1
  0.0000	2	2	subspecies	120749	                RS_GCF_000740275.1
  0.0000	2	2	subspecies	121270	                RS_GCF_002290725.1
  0.0000	2	2	subspecies	121110	                GB_GCA_900000005.1
  0.0000	2	2	subspecies	121070	                RS_GCF_002291325.1
  0.0000	2	2	subspecies	121056	                RS_GCF_002895125.1
  0.0000	2	2	subspecies	120972	                RS_GCF_002291205.1
  0.0000	2	2	subspecies	120944	                RS_GCF_001296965.1
  0.0000	1	1	subspecies	121361	                RS_GCF_002291245.1
  0.0000	1	1	subspecies	121299	                RS_GCF_002191635.1
  0.0000	1	1	subspecies	121432	                RS_GCF_001594165.1
  0.0000	1	1	subspecies	121469	                RS_GCF_002895105.1
  0.0000	1	1	subspecies	120696	                RS_GCF_002591255.1
  0.0000	1	1	subspecies	121362	                RS_GCF_002291345.1
  0.0000	1	1	subspecies	121412	                RS_GCF_002290745.1
  0.0000	1	1	subspecies	121491	                GB_GCA_002290125.1
  0.0000	1	1	subspecies	121192	                RS_GCF_002290765.1
  0.0000	1	1	subspecies	121152	                RS_GCF_000740395.1
  0.0000	1	1	subspecies	121112	                RS_GCF_000227645.1
  0.0000	1	1	subspecies	121081	                RS_GCF_000590795.1
  0.0000	1	1	subspecies	121063	                RS_GCF_002763615.1
  0.0000	1	1	subspecies	120983	                RS_GCF_000740135.1
  0.0000	1	1	subspecies	120982	                RS_GCF_000238195.1
  0.0000	1	1	subspecies	120957	                RS_GCF_900236585.1
  0.0000	1	1	subspecies	120898	                RS_GCF_002192175.1
  0.0000	1	1	subspecies	120834	                RS_GCF_000740235.1
  0.0000	1	1	subspecies	120812	                RS_GCF_003856415.1
  0.0000	1	1	subspecies	120794	                GB_GCA_001511795.1
  0.5034	73679	0	order	137683	        o__Rhodobacterales
  0.5034	73679	388	family	137684	          f__Rhodobacteraceae
  0.1671	24457	646	genus	194565	            g__Paracoccus
  0.0819	11985	11923	species	196516	              s__Paracoccus denitrificans
  0.0002	34	34	subspecies	196519	                RS_GCF_004063735.1
  0.0002	28	28	subspecies	196520	                RS_GCF_000203895.1
  0.0804	11763	2868	species	203279	              s__Paracoccus yeei
  0.0301	4407	4407	subspecies	203280	                RS_GCF_002749495.1
  0.0293	4295	4295	subspecies	203281	                RS_GCF_008693865.1
  0.0010	151	151	subspecies	203282	                RS_GCF_002073635.2
  0.0003	42	42	subspecies	203284	                RS_GCF_003612915.1
  0.0003	45	0	species	290574	              s__Paracoccus mutanolyticus
  0.0003	45	45	subspecies	290575	                RS_GCF_003285265.1
  0.0001	14	0	species	194566	              s__Paracoccus pantotrophus
  0.0001	14	14	subspecies	194574	                RS_GCF_013414285.1
  0.0000	2	0	species	202591	              s__Paracoccus sanguinis
  0.0000	2	2	subspecies	202594	                RS_GCF_012689545.1
  0.0000	1	0	species	226162	              s__Paracoccus kondratievae
  0.0000	1	1	subspecies	226165	                RS_GCF_009301415.1
  0.0000	1	0	species	272512	              s__Paracoccus zhejiangensis
  0.0000	1	1	subspecies	272513	                RS_GCF_002847445.1
  0.1660	24299	718	genus	171188	            g__Phaeobacter
  0.0823	12050	11915	species	189435	              s__Phaeobacter piscinae
  0.0004	53	53	subspecies	189442	                RS_GCF_003443595.1
  0.0003	42	42	subspecies	189444	                RS_GCF_002407245.1
  0.0002	28	28	subspecies	189439	                RS_GCF_002891905.1
  0.0001	10	10	subspecies	189436	                RS_GCF_002412025.1
  0.0000	2	2	subspecies	189443	                RS_GCF_002412045.1
  0.0787	11522	11472	species	192420	              s__Phaeobacter gallaeciensis
  0.0003	38	38	subspecies	192422	                RS_GCF_002381325.1
  0.0001	12	12	subspecies	192421	                RS_GCF_000511385.1
  0.0001	8	3	species	171189	              s__Phaeobacter inhibens
  0.0000	3	3	subspecies	171209	                RS_GCF_002891965.1
  0.0000	1	1	subspecies	171191	                RS_GCF_002891665.1
  0.0000	1	1	subspecies	171196	                RS_GCF_002891945.1
  0.0000	1	0	species	283213	              s__Phaeobacter porticola
  0.0000	1	1	subspecies	283214	                RS_GCF_001888185.1
  0.0840	12299	15	genus	171519	            g__Cereibacter_A
  0.0839	12284	1587	species	207392	              s__Cereibacter_A azotoformans
  0.0368	5387	5387	subspecies	207397	                GB_GCA_000016405.1
  0.0363	5310	5310	subspecies	207396	                RS_GCF_003429265.1
  0.0836	12231	288	genus	203824	            g__Roseovarius
  0.0816	11942	1932	species	232151	              s__Roseovarius sp009363655
  0.0343	5022	5022	subspecies	232152	                RS_GCF_009363735.1
  0.0341	4988	4988	subspecies	232153	                RS_GCF_009363655.1
  0.0000	1	0	species	310757	              s__Roseovarius sp009363715
  0.0000	1	1	subspecies	310758	                RS_GCF_009363715.1
  0.0000	2	0	genus	181212	            g__Mameliella
  0.0000	2	0	species	181213	              s__Mameliella alba
  0.0000	2	2	subspecies	181218	                RS_GCF_011405015.1
  0.0000	2	0	genus	200385	            g__Leisingera
  0.0000	2	1	species	243129	              s__Leisingera sp004123675
  0.0000	1	1	subspecies	243130	                RS_GCF_004535885.1
  0.0000	1	0	genus	237390	            g__Fuscovulum
  0.0000	1	0	species	237391	              s__Fuscovulum blasticum
  0.0000	1	1	subspecies	237393	                RS_GCF_003071405.1
  0.4195	61408	0	order	154071	        o__Sphingomonadales
  0.4195	61408	1368	family	154072	          f__Sphingomonadaceae
  0.1608	23532	529	genus	167504	            g__Sphingobium
  0.0785	11487	4084	species	182767	              s__Sphingobium fuliginis
  0.0281	4109	4109	subspecies	182770	                RS_GCF_006363875.1
  0.0224	3273	3273	subspecies	182772	                RS_GCF_000943805.1
  0.0001	21	21	subspecies	182777	                RS_GCF_005406185.2
  0.0784	11477	686	species	208975	              s__Sphingobium indicum
  0.0375	5485	5485	subspecies	208980	                RS_GCF_000091125.1
  0.0363	5306	5306	subspecies	208976	                RS_GCF_000264945.2
  0.0002	23	7	species	167505	              s__Sphingobium yanoikuyae
  0.0001	15	15	subspecies	167527	                RS_GCF_014235165.1
  0.0000	1	1	subspecies	167514	                RS_GCF_003697265.1
  0.0000	5	0	species	284131	              s__Sphingobium sp001563285
  0.0000	5	5	subspecies	284132	                RS_GCF_001563285.1
  0.0000	3	0	species	316169	              s__Sphingobium sp009720145
  0.0000	3	3	subspecies	316170	                RS_GCF_009720145.1
  0.0000	2	0	species	221190	              s__Sphingobium chlorophenolicum
  0.0000	2	2	subspecies	221193	                RS_GCF_000147835.2
  0.0000	2	0	species	222995	              s__Sphingobium herbicidovorans
  0.0000	2	2	subspecies	222996	                RS_GCF_002080435.1
  0.0000	2	0	species	225017	              s__Sphingobium sp001563265
  0.0000	2	2	subspecies	225018	                RS_GCF_001563265.1
  0.0000	1	0	species	204350	              s__Sphingobium sp000283515
  0.0000	1	1	subspecies	204353	                RS_GCF_000283515.1
  0.0000	1	0	species	236857	              s__Sphingobium cloacae
  0.0000	1	1	subspecies	236859	                RS_GCF_002355855.1
  0.0834	12211	0	genus	173399	            g__Blastomonas
  0.0834	12211	918	species	227864	              s__Blastomonas fulva
  0.0388	5673	5673	subspecies	227865	                RS_GCF_001713435.1
  0.0384	5620	5620	subspecies	227866	                RS_GCF_003431825.1
  0.0831	12170	29	genus	154073	            g__Sphingomonas
  0.0829	12139	10805	species	190517	              s__Sphingomonas paucimobilis
  0.0049	723	723	subspecies	190521	                RS_GCF_014169955.1
  0.0042	611	611	subspecies	190522	                RS_GCF_003314795.2
  0.0000	2	0	species	218399	              s__Sphingomonas yabuuchiae
  0.0000	2	2	subspecies	218401	                RS_GCF_001971605.1
  0.0828	12119	379	genus	181292	            g__Sphingopyxis
  0.0801	11726	11488	species	246610	              s__Sphingopyxis macrogoltabida
  0.0011	162	162	subspecies	246611	                RS_GCF_001610995.1
  0.0005	76	76	subspecies	246612	                RS_GCF_001314325.1
  0.0001	9	0	species	297910	              s__Sphingopyxis fribergensis
  0.0001	9	9	subspecies	297911	                RS_GCF_000803645.1
  0.0000	3	0	species	181293	              s__Sphingopyxis terrae
  0.0000	3	3	subspecies	181299	                GB_GCA_001610975.1
  0.0000	1	0	species	228655	              s__Sphingopyxis sp003609815
  0.0000	1	1	subspecies	228658	                RS_GCF_003609815.1
  0.0000	1	0	species	298378	              s__Sphingopyxis sp004795895
  0.0000	1	1	subspecies	298379	                RS_GCF_004795895.1
  0.0000	7	0	genus	211209	            g__Rhizorhabdus
  0.0000	6	0	species	211210	              s__Rhizorhabdus wittichii
  0.0000	6	6	subspecies	211211	                GB_GCA_000715175.2
  0.0000	1	0	species	235969	              s__Rhizorhabdus histidinilytica
  0.0000	1	1	subspecies	235971	                RS_GCF_003949995.1
  0.0000	1	0	genus	191835	            g__Parasphingorhabdus
  0.0000	1	0	species	316559	              s__Parasphingorhabdus sp900149705
  0.0000	1	1	subspecies	316560	                GB_GCA_900149705.1
  0.3349	49025	0	order	164936	        o__Caulobacterales
  0.3349	49025	3	family	181828	          f__Caulobacteraceae
  0.2509	36723	361	genus	181829	            g__Brevundimonas
  0.0833	12186	1591	species	207576	              s__Brevundimonas naejangsanensis_A
  0.0363	5320	5320	subspecies	207581	                RS_GCF_000635915.2
  0.0360	5275	5275	subspecies	207580	                RS_GCF_004421065.1
  0.0830	12152	3267	species	197922	              s__Brevundimonas aurantiaca
  0.0304	4449	4449	subspecies	197926	                RS_GCF_001310255.1
  0.0303	4436	4436	subspecies	197929	                RS_GCF_009394735.1
  0.0821	12014	348	species	189313	              s__Brevundimonas vesicularis
  0.0398	5827	5827	subspecies	189316	                RS_GCF_002208825.2
  0.0397	5805	5805	subspecies	189314	                RS_GCF_011045535.1
  0.0002	34	34	subspecies	189318	                RS_GCF_001636925.1
  0.0000	4	0	species	181830	              s__Brevundimonas diminuta
  0.0000	2	2	subspecies	181840	                RS_GCF_004102925.1
  0.0000	1	1	subspecies	181831	                RS_GCF_002205555.1
  0.0000	1	1	subspecies	181843	                RS_GCF_901421975.1
  0.0000	3	0	species	193949	              s__Brevundimonas mediterranea_A
  0.0000	3	3	subspecies	193951	                RS_GCF_011064825.1
  0.0000	3	0	species	244214	              s__Brevundimonas sp005484585
  0.0000	3	3	subspecies	244215	                RS_GCF_005484585.1
  0.0840	12299	9	genus	200684	            g__Caulobacter
  0.0840	12288	12139	species	249240	              s__Caulobacter segnis
  0.0005	77	77	subspecies	249241	                RS_GCF_000092285.1
  0.0005	72	72	subspecies	249242	                RS_GCF_003015125.1
  0.0000	1	1	species	200685	              s__Caulobacter vibrioides
  0.0000	1	0	species	288846	              s__Caulobacter vibrioides_D
  0.0000	1	1	subspecies	288847	                RS_GCF_002310375.3
  0.1681	24600	0	order	176067	        o__Rhodospirillales
  0.0840	12300	3	family	186859	          f__Rhodospirillaceae
  0.0840	12297	0	genus	216210	            g__Rhodospirillum
  0.0840	12297	12177	species	216211	              s__Rhodospirillum rubrum
  0.0007	96	96	subspecies	216215	                RS_GCF_000013085.1
  0.0002	24	24	subspecies	216214	                RS_GCF_000225955.1
  0.0840	12300	10	family	226489	          f__Magnetospirillaceae
  0.0840	12290	0	genus	228609	            g__Magnetospirillum
  0.0840	12290	6760	species	228610	              s__Magnetospirillum gryphiswaldense
  0.0378	5526	5526	subspecies	228612	                RS_GCF_000513295.1
  0.0000	4	4	subspecies	228611	                RS_GCF_002995535.1
  0.1681	24600	0	order	179543	        o__Azospirillales
  0.1681	24600	0	family	179544	          f__Azospirillaceae
  0.1681	24600	464	genus	179545	            g__Azospirillum
  0.0837	12253	6226	species	186721	              s__Azospirillum brasilense_B
  0.0368	5392	5392	subspecies	186723	                RS_GCF_005222185.1
  0.0017	249	249	subspecies	186724	                RS_GCF_003119195.2
  0.0012	174	174	subspecies	186726	                RS_GCF_000237365.1
  0.0007	107	107	subspecies	186729	                RS_GCF_000632475.1
  0.0007	105	105	subspecies	186731	                RS_GCF_005222165.1
  0.0811	11871	10	species	227199	              s__Azospirillum sp003119115
  0.0411	6009	6009	subspecies	227201	                RS_GCF_003119115.1
  0.0400	5852	5852	subspecies	227202	                RS_GCF_005222205.1
  0.0001	12	6	species	179546	              s__Azospirillum brasilense
  0.0000	4	4	subspecies	179553	                RS_GCF_001315015.1
  0.0000	1	1	subspecies	179548	                RS_GCF_008274945.1
  0.0000	1	1	subspecies	179557	                RS_GCF_005222145.1
  19.6374	2874319	0	phylum	22784	    p__Firmicutes
  19.6374	2874319	1896	class	22785	      c__Bacilli
  9.2263	1350456	2150	order	55960	        o__Lactobacillales
  4.0143	587570	658	family	55961	          f__Streptococcaceae
  3.6780	538349	29553	genus	55962	            g__Streptococcus
  0.0840	12290	12070	species	205202	              s__Streptococcus ratti
  0.0008	122	122	subspecies	205205	                GB_GCA_900638045.1
  0.0007	98	98	subspecies	205204	                RS_GCF_008803015.1
  0.0839	12285	12119	species	159884	              s__Streptococcus sobrinus
  0.0008	121	121	subspecies	159927	                RS_GCF_003172975.1
  0.0002	28	28	subspecies	159887	                RS_GCF_900475395.1
  0.0001	12	12	subspecies	159886	                RS_GCF_003176815.1
  0.0000	5	5	subspecies	159916	                RS_GCF_900475365.1
  0.0837	12256	3476	species	171082	              s__Streptococcus ruminantium
  0.0301	4401	4401	subspecies	171096	                RS_GCF_009866825.1
  0.0299	4379	4379	subspecies	171104	                RS_GCF_003609975.1
  0.0836	12230	5910	species	158422	              s__Streptococcus gordonii
  0.0273	3989	3989	subspecies	158432	                RS_GCF_901544385.1
  0.0152	2229	2229	subspecies	158430	                RS_GCF_000970665.2
  0.0002	27	27	subspecies	158472	                RS_GCF_900475385.1
  0.0002	22	22	subspecies	158440	                RS_GCF_002386285.1
  0.0002	22	22	subspecies	158463	                RS_GCF_002073435.2
  0.0001	19	19	subspecies	158445	                RS_GCF_900475015.1
  0.0000	6	6	subspecies	158447	                RS_GCF_001281105.1
  0.0000	5	5	subspecies	158453	                RS_GCF_901543415.1
  0.0000	1	1	subspecies	158461	                RS_GCF_000017005.1
  0.0835	12223	11857	species	149590	              s__Streptococcus iniae
  0.0013	197	197	subspecies	149598	                GB_GCA_000403625.1
  0.0008	118	118	subspecies	149618	                GB_GCA_000648555.1
  0.0003	43	43	subspecies	149660	                RS_GCF_003589945.1
  0.0000	4	4	subspecies	149663	                RS_GCF_002220115.1
  0.0000	3	3	subspecies	149648	                GB_GCA_000648525.1
  0.0000	1	1	subspecies	149631	                RS_GCF_000831485.1
  0.0833	12186	9109	species	129493	              s__Streptococcus equi
  0.0203	2976	2976	subspecies	129563	                RS_GCF_900474805.1
  0.0002	23	23	subspecies	129618	                RS_GCF_000026605.1
  0.0001	14	14	subspecies	129631	                GB_GCA_901472575.1
  0.0001	12	12	subspecies	129812	                RS_GCF_900636805.1
  0.0001	10	10	subspecies	129602	                RS_GCF_900474875.1
  0.0001	8	8	subspecies	129819	                GB_GCA_901542385.1
  0.0001	8	8	subspecies	129716	                GB_GCA_900637675.1
  0.0000	6	6	subspecies	129817	                RS_GCF_900475295.1
  0.0000	5	5	subspecies	129744	                RS_GCF_009676725.1
  0.0000	4	4	subspecies	129548	                RS_GCF_009676685.2
  0.0000	3	3	subspecies	129750	                GB_GCA_900636415.1
  0.0000	3	3	subspecies	129683	                GB_GCA_900475435.1
  0.0000	1	1	subspecies	129702	                RS_GCF_000219765.1
  0.0000	1	1	subspecies	129719	                GB_GCA_002202295.1
  0.0000	1	1	subspecies	129739	                RS_GCF_000696505.1
  0.0000	1	1	subspecies	129758	                RS_GCF_000026585.1
  0.0000	1	1	subspecies	129768	                RS_GCF_900475125.1
  0.0832	12179	11464	species	148399	              s__Streptococcus thermophilus
  0.0023	334	334	subspecies	148400	                RS_GCF_000521305.1
  0.0014	207	207	subspecies	148401	                RS_GCF_903884415.1
  0.0002	26	26	subspecies	148425	                RS_GCF_903890815.1
  0.0001	18	18	subspecies	148481	                RS_GCF_013307265.1
  0.0001	10	10	subspecies	148467	                RS_GCF_000572095.1
  0.0001	8	8	subspecies	148408	                RS_GCF_000521325.1
  0.0000	7	7	subspecies	148460	                RS_GCF_900094135.1
  0.0000	7	7	subspecies	148429	                RS_GCF_903886505.1
  0.0000	6	6	subspecies	148491	                RS_GCF_001705585.1
  0.0000	6	6	subspecies	148492	                RS_GCF_002443035.1
  0.0000	5	5	subspecies	148423	                RS_GCF_002846155.1
  0.0000	5	5	subspecies	148479	                RS_GCF_000836595.1
  0.0000	5	5	subspecies	148410	                RS_GCF_000836675.1
  0.0000	5	5	subspecies	148462	                RS_GCF_011801285.1
  0.0000	5	5	subspecies	148446	                RS_GCF_002846075.1
  0.0000	5	5	subspecies	148498	                RS_GCF_903891135.1
  0.0000	5	5	subspecies	148483	                RS_GCF_010692845.1
  0.0000	5	5	subspecies	148455	                RS_GCF_903886595.1
  0.0000	4	4	subspecies	148496	                RS_GCF_903891205.1
  0.0000	4	4	subspecies	148488	                RS_GCF_903890825.1
  0.0000	3	3	subspecies	148476	                RS_GCF_903890635.1
  0.0000	3	3	subspecies	148473	                RS_GCF_003443395.1
  0.0000	3	3	subspecies	148409	                RS_GCF_000572065.1
  0.0000	3	3	subspecies	148430	                RS_GCF_903890945.1
  0.0000	3	3	subspecies	148421	                RS_GCF_903886745.1
  0.0000	2	2	subspecies	148453	                RS_GCF_903886285.1
  0.0000	2	2	subspecies	148447	                RS_GCF_003402855.1
  0.0000	2	2	subspecies	148440	                RS_GCF_001280285.1
  0.0000	2	2	subspecies	148420	                RS_GCF_004114735.1
  0.0000	1	1	subspecies	148482	                RS_GCF_903891245.1
  0.0000	1	1	subspecies	148499	                RS_GCF_903891305.1
  0.0000	1	1	subspecies	148495	                RS_GCF_903891105.1
  0.0000	1	1	subspecies	148474	                RS_GCF_009856565.1
  0.0000	1	1	subspecies	148469	                RS_GCF_903886475.1
  0.0000	1	1	subspecies	148463	                RS_GCF_000011825.1
  0.0000	1	1	subspecies	148451	                RS_GCF_000521285.1
  0.0000	1	1	subspecies	148449	                RS_GCF_000698885.1
  0.0000	1	1	subspecies	148445	                RS_GCF_903886075.1
  0.0000	1	1	subspecies	148438	                RS_GCF_002286255.1
  0.0000	1	1	subspecies	148432	                RS_GCF_000011845.1
  0.0000	1	1	subspecies	148424	                RS_GCF_903960675.1
  0.0000	1	1	subspecies	148419	                RS_GCF_903886635.1
  0.0000	1	1	subspecies	148418	                RS_GCF_903886385.1
  0.0000	1	1	subspecies	148405	                RS_GCF_903886645.1
  0.0832	12178	9325	species	134433	              s__Streptococcus mutans
  0.0119	1738	1738	subspecies	134474	                RS_GCF_002995555.1
  0.0072	1055	1055	subspecies	134451	                RS_GCF_000271865.1
  0.0001	13	13	subspecies	134556	                GB_GCA_003691695.1
  0.0001	10	10	subspecies	134638	                RS_GCF_000284575.1
  0.0001	8	8	subspecies	134506	                RS_GCF_000091645.1
  0.0000	7	7	subspecies	134557	                RS_GCF_014621675.1
  0.0000	4	4	subspecies	134494	                RS_GCF_008831365.1
  0.0000	4	4	subspecies	134597	                RS_GCF_900636835.1
  0.0000	4	4	subspecies	134664	                RS_GCF_008831325.1
  0.0000	3	3	subspecies	134574	                RS_GCF_008831345.1
  0.0000	3	3	subspecies	134665	                RS_GCF_002155285.1
  0.0000	1	1	subspecies	134516	                RS_GCF_900475095.1
  0.0000	1	1	subspecies	134529	                RS_GCF_009738105.1
  0.0000	1	1	subspecies	134530	                RS_GCF_011765545.1
  0.0000	1	1	subspecies	134606	                RS_GCF_001558215.1
  0.0831	12170	7897	species	163524	              s__Streptococcus uberis
  0.0149	2188	2188	subspecies	163525	                RS_GCF_000009545.1
  0.0140	2045	2045	subspecies	163530	                RS_GCF_002814135.1
  0.0002	24	24	subspecies	163538	                RS_GCF_900475595.1
  0.0001	16	16	subspecies	163533	                RS_GCF_900475695.1
  0.0828	12119	6101	species	171650	              s__Streptococcus parauberis
  0.0233	3409	3409	subspecies	171655	                RS_GCF_000187935.1
  0.0174	2550	2550	subspecies	171670	                RS_GCF_000213825.1
  0.0004	59	59	subspecies	171674	                RS_GCF_002900385.1
  0.0828	12115	730	species	226185	              s__Streptococcus pluranimalium
  0.0391	5718	5718	subspecies	226188	                RS_GCF_002953735.1
  0.0387	5667	5667	subspecies	226187	                RS_GCF_003352995.1
  0.0826	12090	827	species	253430	              s__Streptococcus sanguinis_I
  0.0385	5638	5638	subspecies	253432	                GB_GCA_013378335.1
  0.0384	5625	5625	subspecies	253431	                RS_GCF_013378355.1
  0.0823	12050	302	species	178495	              s__Streptococcus cristatus
  0.0404	5908	5908	subspecies	178505	                RS_GCF_011612585.1
  0.0399	5840	5840	subspecies	178509	                RS_GCF_900475445.1
  0.0822	12028	1629	species	183072	              s__Streptococcus parasanguinis
  0.0357	5230	5230	subspecies	183074	                RS_GCF_000164675.2
  0.0353	5169	5169	subspecies	183079	                RS_GCF_000262145.1
  0.0819	11983	11256	species	221744	              s__Streptococcus cristatus_B
  0.0025	372	372	subspecies	221747	                RS_GCF_900478185.1
  0.0024	355	355	subspecies	221746	                RS_GCF_000385925.1
  0.0811	11874	2626	species	189024	              s__Streptococcus pseudoporcinus
  0.0335	4897	4897	subspecies	189025	                RS_GCF_901542435.1
  0.0296	4332	4332	subspecies	189027	                RS_GCF_900637075.1
  0.0001	19	19	subspecies	189028	                RS_GCF_902141225.1
  0.0810	11861	7756	species	162856	              s__Streptococcus equinus
  0.0270	3953	3953	subspecies	162866	                RS_GCF_014041875.1
  0.0003	48	48	subspecies	162896	                RS_GCF_000448625.1
  0.0003	45	45	subspecies	162887	                RS_GCF_900636565.1
  0.0002	27	27	subspecies	162892	                RS_GCF_009758095.1
  0.0001	20	20	subspecies	162894	                RS_GCF_009758075.1
  0.0001	12	12	subspecies	162868	                RS_GCF_900636465.1
  0.0810	11856	11459	species	110756	              s__Streptococcus agalactiae
  0.0009	136	136	subspecies	110757	                RS_GCF_002197385.1
  0.0005	68	68	subspecies	110765	                RS_GCF_002197365.1
  0.0002	32	32	subspecies	112156	                RS_GCF_013786965.1
  0.0002	32	32	subspecies	111073	                RS_GCF_900636375.1
  0.0002	25	25	subspecies	111262	                RS_GCF_013414325.1
  0.0001	14	14	subspecies	111951	                GB_GCA_000427055.1
  0.0000	7	7	subspecies	111305	                RS_GCF_009930895.1
  0.0000	6	6	subspecies	111885	                RS_GCF_000427075.1
  0.0000	5	5	subspecies	111992	                RS_GCF_003812445.1
  0.0000	5	5	subspecies	111454	                RS_GCF_900078265.1
  0.0000	5	5	subspecies	111448	                RS_GCF_001266635.1
  0.0000	5	5	subspecies	111334	                RS_GCF_000782855.1
  0.0000	4	4	subspecies	111888	                GB_GCA_002881695.1
  0.0000	4	4	subspecies	111667	                RS_GCF_003812465.1
  0.0000	3	3	subspecies	110895	                RS_GCF_900474905.1
  0.0000	3	3	subspecies	112009	                GB_GCA_002881355.1
  0.0000	3	3	subspecies	111966	                RS_GCF_000730215.1
  0.0000	3	3	subspecies	111715	                RS_GCF_002025005.1
  0.0000	2	2	subspecies	111331	                GB_GCA_002881195.1
  0.0000	2	2	subspecies	112062	                RS_GCF_003288035.1
  0.0000	2	2	subspecies	112042	                RS_GCF_000427035.1
  0.0000	2	2	subspecies	111278	                RS_GCF_900475355.1
  0.0000	2	2	subspecies	111269	                RS_GCF_003966545.1
  0.0000	2	2	subspecies	111606	                RS_GCF_001712835.1
  0.0000	2	2	subspecies	111017	                GB_GCA_002881415.1
  0.0000	2	2	subspecies	110859	                GB_GCA_002881175.1
  0.0000	2	2	subspecies	111717	                GB_GCA_002881475.1
  0.0000	2	2	subspecies	111796	                RS_GCF_003939065.1
  0.0000	2	2	subspecies	111832	                RS_GCF_009930915.1
  0.0000	1	1	subspecies	110939	                GB_GCA_002882125.1
  0.0000	1	1	subspecies	110797	                RS_GCF_000007265.1
  0.0000	1	1	subspecies	110918	                GB_GCA_002881155.1
  0.0000	1	1	subspecies	110898	                RS_GCF_900638495.1
  0.0000	1	1	subspecies	112028	                RS_GCF_002812425.1
  0.0000	1	1	subspecies	112087	                GB_GCA_002881935.1
  0.0000	1	1	subspecies	111934	                RS_GCF_002289205.1
  0.0000	1	1	subspecies	111066	                RS_GCF_000299135.1
  0.0000	1	1	subspecies	110855	                GB_GCA_002882745.1
  0.0000	1	1	subspecies	111210	                GB_GCA_002881395.1
  0.0000	1	1	subspecies	111660	                RS_GCF_003403115.1
  0.0000	1	1	subspecies	111431	                RS_GCF_012222485.1
  0.0000	1	1	subspecies	111390	                RS_GCF_014218155.1
  0.0000	1	1	subspecies	111343	                RS_GCF_900155855.1
  0.0000	1	1	subspecies	111287	                RS_GCF_000831145.1
  0.0808	11824	4382	species	192203	              s__Streptococcus koreensis
  0.0258	3770	3770	subspecies	192205	                RS_GCF_000479335.1
  0.0249	3651	3651	subspecies	192208	                RS_GCF_000479315.1
  0.0001	21	21	subspecies	192210	                RS_GCF_003627135.1
  0.0808	11823	3926	species	174382	              s__Streptococcus canis
  0.0330	4828	4828	subspecies	174387	                RS_GCF_010993915.2
  0.0209	3052	3052	subspecies	174393	                RS_GCF_010993845.2
  0.0001	10	10	subspecies	174399	                RS_GCF_900636575.1
  0.0000	4	4	subspecies	174401	                RS_GCF_010993865.2
  0.0000	3	3	subspecies	174396	                RS_GCF_901521425.1
  0.0806	11795	11567	species	161889	              s__Streptococcus intermedius
  0.0008	118	118	subspecies	161890	                GB_GCA_001296205.1
  0.0002	33	33	subspecies	161914	                RS_GCF_000463355.1
  0.0002	26	26	subspecies	161913	                RS_GCF_013267515.1
  0.0002	26	26	subspecies	161923	                RS_GCF_002356055.1
  0.0001	12	12	subspecies	161921	                RS_GCF_000463385.1
  0.0000	7	7	subspecies	161906	                RS_GCF_002073355.2
  0.0000	4	4	subspecies	161905	                RS_GCF_000306805.1
  0.0000	2	2	subspecies	161894	                RS_GCF_900475975.1
  0.0804	11769	9780	species	208859	              s__Streptococcus porcinus
  0.0128	1874	1874	subspecies	208860	                RS_GCF_900475415.1
  0.0008	113	113	subspecies	208863	                RS_GCF_901553755.1
  0.0000	2	2	subspecies	208864	                RS_GCF_901553735.1
  0.0803	11752	5818	species	205745	              s__Streptococcus australis
  0.0389	5696	5696	subspecies	205746	                RS_GCF_900476055.1
  0.0011	154	154	subspecies	205748	                RS_GCF_900636365.1
  0.0006	84	84	subspecies	205749	                RS_GCF_900636505.1
  0.0801	11725	656	species	162205	              s__Streptococcus sanguinis
  0.0377	5519	5519	subspecies	162227	                RS_GCF_900475505.1
  0.0377	5513	5513	subspecies	162226	                RS_GCF_900475045.1
  0.0003	37	37	subspecies	162232	                RS_GCF_900475275.1
  0.0800	11705	7773	species	150156	              s__Streptococcus salivarius
  0.0162	2371	2371	subspecies	150161	                RS_GCF_008305695.1
  0.0085	1248	1248	subspecies	150164	                RS_GCF_002094975.1
  0.0004	60	60	subspecies	150233	                GB_GCA_000305335.2
  0.0003	43	43	subspecies	150213	                RS_GCF_002094955.1
  0.0003	39	39	subspecies	150221	                RS_GCF_002073815.2
  0.0003	38	38	subspecies	150205	                RS_GCF_000253335.1
  0.0002	36	36	subspecies	150197	                RS_GCF_000253315.1
  0.0002	24	24	subspecies	150237	                RS_GCF_013822985.1
  0.0002	23	23	subspecies	150224	                RS_GCF_000448645.1
  0.0002	22	22	subspecies	150199	                RS_GCF_013267495.1
  0.0001	13	13	subspecies	150179	                RS_GCF_900475225.1
  0.0001	9	9	subspecies	150203	                RS_GCF_000448685.2
  0.0000	5	5	subspecies	150226	                RS_GCF_001543085.1
  0.0000	1	1	subspecies	150173	                RS_GCF_000785515.1
  0.0798	11680	9802	species	174637	              s__Streptococcus gallolyticus
  0.0126	1845	1845	subspecies	174639	                RS_GCF_013267695.1
  0.0001	13	13	subspecies	174644	                RS_GCF_000203195.1
  0.0001	12	12	subspecies	174642	                RS_GCF_000027185.1
  0.0001	8	8	subspecies	174640	                RS_GCF_000270145.1
  0.0792	11589	2408	species	181371	              s__Streptococcus infantarius
  0.0382	5590	5590	subspecies	181375	                RS_GCF_000246835.1
  0.0243	3560	3560	subspecies	181374	                RS_GCF_009792335.1
  0.0001	18	18	subspecies	181377	                RS_GCF_011387195.1
  0.0001	13	13	subspecies	181381	                RS_GCF_009755785.1
  0.0786	11508	9174	species	156097	              s__Streptococcus anginosus
  0.0095	1395	1395	subspecies	156111	                RS_GCF_901542485.1
  0.0049	712	712	subspecies	156101	                RS_GCF_000463465.1
  0.0007	98	98	subspecies	156141	                RS_GCF_900636475.1
  0.0003	48	48	subspecies	156135	                RS_GCF_003963555.1
  0.0002	32	32	subspecies	156119	                RS_GCF_000463505.1
  0.0002	31	31	subspecies	156136	                RS_GCF_000478925.1
  0.0001	18	18	subspecies	156132	                RS_GCF_001412635.1
  0.0786	11498	2875	species	198868	              s__Streptococcus sp000187445
  0.0295	4313	4313	subspecies	198871	                RS_GCF_000448665.1
  0.0294	4310	4310	subspecies	198874	                RS_GCF_000448605.1
  0.0779	11408	9740	species	176111	              s__Streptococcus pasteurianus
  0.0060	877	877	subspecies	176120	                RS_GCF_004843545.1
  0.0052	768	768	subspecies	176117	                RS_GCF_012273095.1
  0.0001	12	12	subspecies	176128	                RS_GCF_900478025.1
  0.0001	11	11	subspecies	176122	                RS_GCF_000270165.1
  0.0776	11353	11085	species	85414	              s__Streptococcus pyogenes
  0.0003	41	41	subspecies	85416	                RS_GCF_900475115.1
  0.0003	37	37	subspecies	85423	                RS_GCF_900476015.1
  0.0001	12	12	subspecies	86820	                RS_GCF_005160925.1
  0.0001	10	10	subspecies	86413	                RS_GCF_900475085.1
  0.0001	8	8	subspecies	86161	                RS_GCF_005222545.1
  0.0000	7	7	subspecies	85461	                GB_GCA_000732385.1
  0.0000	7	7	subspecies	86670	                RS_GCF_900475565.1
  0.0000	6	6	subspecies	85505	                RS_GCF_005164705.1
  0.0000	6	6	subspecies	85697	                RS_GCF_004124135.1
  0.0000	5	5	subspecies	86033	                RS_GCF_900475705.1
  0.0000	5	5	subspecies	85634	                RS_GCF_900474825.1
  0.0000	5	5	subspecies	85642	                RS_GCF_004154045.1
  0.0000	4	4	subspecies	86311	                RS_GCF_900475765.1
  0.0000	4	4	subspecies	86811	                RS_GCF_005160445.1
  0.0000	3	3	subspecies	86859	                RS_GCF_900475075.1
  0.0000	3	3	subspecies	87086	                RS_GCF_900475525.1
  0.0000	3	3	subspecies	87002	                RS_GCF_900474865.1
  0.0000	3	3	subspecies	86083	                RS_GCF_003203475.1
  0.0000	3	3	subspecies	87061	                RS_GCF_005161825.1
  0.0000	3	3	subspecies	86747	                RS_GCF_900474455.1
  0.0000	3	3	subspecies	85996	                RS_GCF_000018125.1
  0.0000	3	3	subspecies	85978	                GB_GCA_011290585.1
  0.0000	3	3	subspecies	85963	                RS_GCF_005163385.1
  0.0000	3	3	subspecies	87288	                RS_GCF_900475615.1
  0.0000	3	3	subspecies	87506	                GB_GCA_001547815.1
  0.0000	3	3	subspecies	85620	                RS_GCF_900475035.1
  0.0000	3	3	subspecies	87350	                RS_GCF_001638845.2
  0.0000	3	3	subspecies	87349	                RS_GCF_900475425.1
  0.0000	2	2	subspecies	87154	                RS_GCF_005160785.1
  0.0000	2	2	subspecies	86436	                RS_GCF_900474945.1
  0.0000	2	2	subspecies	86616	                RS_GCF_001267805.1
  0.0000	2	2	subspecies	86646	                RS_GCF_900474765.1
  0.0000	2	2	subspecies	87433	                RS_GCF_901482645.1
  0.0000	2	2	subspecies	86318	                GB_GCA_001535505.1
  0.0000	2	2	subspecies	86295	                RS_GCF_900475925.1
  0.0000	2	2	subspecies	85718	                RS_GCF_900474855.1
  0.0000	2	2	subspecies	86229	                RS_GCF_005164025.1
  0.0000	2	2	subspecies	86133	                RS_GCF_900474915.1
  0.0000	2	2	subspecies	86891	                RS_GCF_000756485.1
  0.0000	2	2	subspecies	86099	                RS_GCF_000011285.1
  0.0000	2	2	subspecies	87317	                RS_GCF_005163705.1
  0.0000	2	2	subspecies	85863	                RS_GCF_003352145.1
  0.0000	1	1	subspecies	87339	                RS_GCF_000422045.1
  0.0000	1	1	subspecies	87327	                RS_GCF_005162245.1
  0.0000	1	1	subspecies	86877	                RS_GCF_002355175.1
  0.0000	1	1	subspecies	86772	                RS_GCF_900475955.1
  0.0000	1	1	subspecies	86916	                RS_GCF_900475475.1
  0.0000	1	1	subspecies	86969	                RS_GCF_900474935.1
  0.0000	1	1	subspecies	86743	                RS_GCF_900475865.1
  0.0000	1	1	subspecies	87318	                RS_GCF_900475165.1
  0.0000	1	1	subspecies	86647	                RS_GCF_004154205.1
  0.0000	1	1	subspecies	87528	                RS_GCF_005165265.1
  0.0000	1	1	subspecies	87119	                RS_GCF_004124115.1
  0.0000	1	1	subspecies	86085	                RS_GCF_005163565.1
  0.0000	1	1	subspecies	85448	                RS_GCF_005162865.1
  0.0000	1	1	subspecies	85491	                RS_GCF_004154125.1
  0.0000	1	1	subspecies	85540	                RS_GCF_900475795.1
  0.0000	1	1	subspecies	85643	                RS_GCF_004124015.1
  0.0000	1	1	subspecies	85668	                RS_GCF_900475105.1
  0.0000	1	1	subspecies	85802	                RS_GCF_011290565.1
  0.0000	1	1	subspecies	85813	                RS_GCF_005162725.1
  0.0000	1	1	subspecies	85848	                RS_GCF_004154225.1
  0.0000	1	1	subspecies	85858	                RS_GCF_000013545.1
  0.0000	1	1	subspecies	85869	                RS_GCF_001640945.2
  0.0000	1	1	subspecies	85980	                RS_GCF_900636485.1
  0.0000	1	1	subspecies	85984	                RS_GCF_004154345.1
  0.0000	1	1	subspecies	86035	                RS_GCF_005161605.1
  0.0000	1	1	subspecies	86078	                GB_GCA_000013525.1
  0.0000	1	1	subspecies	86448	                RS_GCF_000349925.2
  0.0000	1	1	subspecies	86103	                RS_GCF_004135875.1
  0.0000	1	1	subspecies	86112	                RS_GCF_004154005.1
  0.0000	1	1	subspecies	86127	                RS_GCF_005163245.1
  0.0000	1	1	subspecies	86132	                RS_GCF_005164885.1
  0.0000	1	1	subspecies	86164	                RS_GCF_001267845.1
  0.0000	1	1	subspecies	86259	                RS_GCF_001547835.1
  0.0000	1	1	subspecies	86263	                RS_GCF_005162405.1
  0.0000	1	1	subspecies	86279	                RS_GCF_001535565.1
  0.0000	1	1	subspecies	86312	                RS_GCF_014192175.1
  0.0000	1	1	subspecies	86333	                RS_GCF_005160565.1
  0.0000	1	1	subspecies	86362	                RS_GCF_004028355.1
  0.0000	1	1	subspecies	86385	                RS_GCF_000013505.1
  0.0000	1	1	subspecies	86387	                RS_GCF_005161465.1
  0.0000	1	1	subspecies	86407	                RS_GCF_014191835.1
  0.0775	11344	8292	species	180885	              s__Streptococcus lutetiensis
  0.0104	1526	1526	subspecies	180887	                RS_GCF_001477615.1
  0.0101	1478	1478	subspecies	180888	                RS_GCF_000441535.1
  0.0002	33	33	subspecies	180894	                RS_GCF_900635935.1
  0.0001	12	12	subspecies	180890	                RS_GCF_900475065.1
  0.0000	3	3	subspecies	180896	                RS_GCF_901543605.1
  0.0775	11340	11241	species	174809	              s__Streptococcus mitis
  0.0004	54	54	subspecies	174811	                RS_GCF_009730515.1
  0.0003	45	45	subspecies	174829	                RS_GCF_000148585.2
  0.0770	11276	5904	species	194537	              s__Streptococcus macedonicus
  0.0187	2744	2744	subspecies	194545	                RS_GCF_001477575.1
  0.0180	2628	2628	subspecies	194542	                RS_GCF_000283635.1
  0.0769	11255	7170	species	114993	              s__Streptococcus suis
  0.0250	3664	3664	subspecies	115054	                RS_GCF_014192345.1
  0.0012	178	178	subspecies	115060	                RS_GCF_000204625.1
  0.0003	51	51	subspecies	115946	                RS_GCF_004843685.1
  0.0003	48	48	subspecies	115606	                RS_GCF_000231905.1
  0.0002	29	29	subspecies	115289	                RS_GCF_002285535.1
  0.0002	29	29	subspecies	115327	                RS_GCF_002285735.1
  0.0001	13	13	subspecies	115438	                RS_GCF_000732355.1
  0.0001	8	8	subspecies	115213	                RS_GCF_003352225.1
  0.0000	7	7	subspecies	115731	                RS_GCF_001610935.1
  0.0000	5	5	subspecies	115318	                RS_GCF_000390245.1
  0.0000	5	5	subspecies	115348	                RS_GCF_902702765.1
  0.0000	4	4	subspecies	115388	                RS_GCF_000231865.1
  0.0000	4	4	subspecies	115828	                GB_GCA_000014325.1
  0.0000	4	4	subspecies	115723	                GB_GCA_000014305.1
  0.0000	4	4	subspecies	115721	                RS_GCF_000471985.1
  0.0000	4	4	subspecies	115176	                RS_GCF_000494895.1
  0.0000	3	3	subspecies	115444	                RS_GCF_000233575.1
  0.0000	2	2	subspecies	116075	                RS_GCF_013488165.1
  0.0000	2	2	subspecies	115290	                RS_GCF_002688665.1
  0.0000	2	2	subspecies	115268	                RS_GCF_007724845.1
  0.0000	2	2	subspecies	115168	                RS_GCF_902702785.1
  0.0000	2	2	subspecies	115255	                RS_GCF_000186405.1
  0.0000	2	2	subspecies	115169	                RS_GCF_000168355.3
  0.0000	2	2	subspecies	115745	                RS_GCF_014192525.1
  0.0000	2	2	subspecies	115179	                RS_GCF_000018185.1
  0.0000	1	1	subspecies	115619	                RS_GCF_013488105.1
  0.0000	1	1	subspecies	116033	                RS_GCF_000231885.1
  0.0000	1	1	subspecies	115170	                RS_GCF_000026745.1
  0.0000	1	1	subspecies	115655	                RS_GCF_902702755.1
  0.0000	1	1	subspecies	115381	                RS_GCF_000993745.1
  0.0000	1	1	subspecies	115618	                RS_GCF_001721625.1
  0.0000	1	1	subspecies	115456	                RS_GCF_901543625.1
  0.0000	1	1	subspecies	115422	                RS_GCF_000344765.1
  0.0000	1	1	subspecies	115385	                RS_GCF_002111405.1
  0.0767	11226	442	species	185017	              s__Streptococcus sanguinis_H
  0.0373	5459	5459	subspecies	185026	                RS_GCF_013343115.1
  0.0364	5325	5325	subspecies	185028	                RS_GCF_000014205.1
  0.0756	11061	2442	species	180691	              s__Streptococcus oralis_S
  0.0341	4989	4989	subspecies	180696	                RS_GCF_013488045.1
  0.0244	3565	3565	subspecies	180694	                RS_GCF_002386345.1
  0.0004	65	65	subspecies	180705	                RS_GCF_001683375.1
  0.0744	10884	6747	species	170217	              s__Streptococcus constellatus
  0.0261	3817	3817	subspecies	170228	                RS_GCF_014334035.1
  0.0018	261	261	subspecies	170220	                RS_GCF_000463425.1
  0.0004	59	59	subspecies	170230	                RS_GCF_900636715.1
  0.0741	10851	9935	species	147217	              s__Streptococcus dysgalactiae
  0.0029	423	423	subspecies	147218	                RS_GCF_003967135.1
  0.0024	348	348	subspecies	147219	                RS_GCF_000317855.1
  0.0001	14	14	subspecies	147235	                RS_GCF_900635345.1
  0.0001	13	13	subspecies	147324	                RS_GCF_009650255.1
  0.0001	13	13	subspecies	147286	                RS_GCF_000010705.1
  0.0001	12	12	subspecies	147242	                RS_GCF_901543725.1
  0.0001	12	12	subspecies	147263	                GB_GCA_000188315.1
  0.0001	11	11	subspecies	147289	                RS_GCF_009650295.1
  0.0001	10	10	subspecies	147241	                RS_GCF_902141215.1
  0.0001	10	10	subspecies	147273	                GB_GCA_000493775.1
  0.0001	8	8	subspecies	147224	                RS_GCF_000307185.1
  0.0001	8	8	subspecies	147246	                RS_GCF_008693725.1
  0.0000	6	6	subspecies	147304	                RS_GCF_009650235.1
  0.0000	4	4	subspecies	147268	                RS_GCF_900636815.1
  0.0000	4	4	subspecies	147278	                RS_GCF_901543615.1
  0.0000	3	3	subspecies	147250	                RS_GCF_900475255.1
  0.0000	3	3	subspecies	147261	                RS_GCF_009650275.1
  0.0000	3	3	subspecies	147284	                RS_GCF_900475725.1
  0.0000	2	2	subspecies	147247	                RS_GCF_901542365.1
  0.0000	2	2	subspecies	147259	                RS_GCF_900474785.1
  0.0000	2	2	subspecies	147233	                RS_GCF_013004125.1
  0.0000	2	2	subspecies	147237	                RS_GCF_009497975.1
  0.0000	1	1	subspecies	147245	                RS_GCF_901543995.1
  0.0000	1	1	subspecies	147239	                RS_GCF_000188715.1
  0.0000	1	1	subspecies	147302	                RS_GCF_014192895.1
  0.0729	10669	1617	species	165781	              s__Streptococcus oralis
  0.0313	4580	4580	subspecies	165793	                RS_GCF_013488065.1
  0.0306	4472	4472	subspecies	165801	                RS_GCF_900637025.1
  0.0714	10458	5344	species	165604	              s__Streptococcus anginosus_C
  0.0321	4698	4698	subspecies	165620	                RS_GCF_900636525.1
  0.0028	408	408	subspecies	165606	                RS_GCF_000831165.1
  0.0001	8	8	subspecies	165622	                RS_GCF_001697145.1
  0.0706	10335	1655	species	144385	              s__Streptococcus suis_P
  0.0305	4462	4462	subspecies	144463	                RS_GCF_002803825.1
  0.0285	4177	4177	subspecies	144459	                GB_GCA_002831545.1
  0.0002	24	24	subspecies	144515	                RS_GCF_002812525.1
  0.0001	17	17	subspecies	144506	                GB_GCA_900143575.1
  0.0660	9661	4874	species	152864	              s__Streptococcus suis_W
  0.0308	4505	4505	subspecies	152906	                RS_GCF_003352205.1
  0.0011	158	158	subspecies	152912	                RS_GCF_003144175.1
  0.0006	93	93	subspecies	152873	                RS_GCF_003285225.1
  0.0002	31	31	subspecies	152913	                RS_GCF_902702775.1
  0.0601	8799	832	species	160545	              s__Streptococcus sp001556435
  0.0283	4145	4145	subspecies	160548	                RS_GCF_002073515.1
  0.0260	3805	3805	subspecies	160565	                RS_GCF_002073835.2
  0.0001	17	17	subspecies	160588	                RS_GCF_009738225.1
  0.0004	57	23	species	55963	              s__Streptococcus pneumoniae
  0.0001	9	9	subspecies	58328	                RS_GCF_900692925.1
  0.0000	7	7	subspecies	61845	                GB_GCA_900795265.1
  0.0000	4	4	subspecies	60320	                RS_GCF_003354825.1
  0.0000	3	3	subspecies	58940	                RS_GCF_900692705.1
  0.0000	2	2	subspecies	60867	                RS_GCF_900795245.1
  0.0000	1	1	subspecies	55987	                RS_GCF_900476475.1
  0.0000	1	1	subspecies	56554	                RS_GCF_900692685.1
  0.0000	1	1	subspecies	57914	                RS_GCF_000019265.1
  0.0000	1	1	subspecies	59331	                RS_GCF_000147095.1
  0.0000	1	1	subspecies	60967	                RS_GCF_900692765.1
  0.0000	1	1	subspecies	61464	                RS_GCF_900693055.1
  0.0000	1	1	subspecies	62630	                RS_GCF_000019825.1
  0.0000	1	1	subspecies	63122	                RS_GCF_000817005.1
  0.0000	1	1	subspecies	63198	                RS_GCF_003609935.1
  0.0002	22	0	species	221214	              s__Streptococcus mitis_AX
  0.0002	22	22	subspecies	221216	                RS_GCF_007475365.1
  0.0001	18	0	species	187712	              s__Streptococcus vestibularis
  0.0001	18	18	subspecies	187722	                RS_GCF_900636445.1
  0.0001	17	0	species	197094	              s__Streptococcus mitis_AK
  0.0001	17	17	subspecies	197100	                RS_GCF_001281025.1
  0.0001	15	0	species	232327	              s__Streptococcus sanguinis_G
  0.0001	15	15	subspecies	232328	                RS_GCF_900635155.1
  0.0001	14	0	species	192088	              s__Streptococcus oralis_BC
  0.0001	14	14	subspecies	192094	                GB_GCA_000688775.2
  0.0001	14	0	species	216497	              s__Streptococcus oralis_H
  0.0001	14	14	subspecies	216501	                RS_GCF_001983955.1
  0.0001	11	0	species	196819	              s__Streptococcus sp001587175
  0.0001	11	11	subspecies	196821	                RS_GCF_001587175.1
  0.0001	11	0	species	292575	              s__Streptococcus sp000448565
  0.0001	11	11	subspecies	292576	                RS_GCF_000448565.1
  0.0001	10	0	species	277045	              s__Streptococcus troglodytae
  0.0001	10	10	subspecies	277046	                RS_GCF_002355215.1
  0.0000	7	0	species	209702	              s__Streptococcus oralis_G
  0.0000	7	7	subspecies	209707	                RS_GCF_006228325.1
  0.0000	7	0	species	240579	              s__Streptococcus oralis_L
  0.0000	7	7	subspecies	240580	                RS_GCF_000253155.1
  0.0000	7	0	species	250259	              s__Streptococcus porcinus_A
  0.0000	7	7	subspecies	250261	                RS_GCF_901542335.1
  0.0000	5	0	species	294395	              s__Streptococcus mitis_BO
  0.0000	5	5	subspecies	294396	                RS_GCF_013305725.1
  0.0000	4	0	species	201451	              s__Streptococcus parasanguinis_D
  0.0000	4	4	subspecies	201456	                RS_GCF_008727815.1
  0.0000	4	0	species	314601	              s__Streptococcus gwangjuense
  0.0000	4	4	subspecies	314602	                RS_GCF_003627155.1
  0.0000	2	0	species	208317	              s__Streptococcus hyovaginalis
  0.0000	2	2	subspecies	208322	                RS_GCF_900187245.1
  0.0000	2	0	species	221864	              s__Streptococcus mitis_K
  0.0000	2	2	subspecies	221865	                GB_GCA_014467095.1
  0.0000	2	0	species	198450	              s__Streptococcus oralis_F
  0.0000	2	2	subspecies	198457	                RS_GCF_002356415.1
  0.0000	1	0	species	317882	              s__Streptococcus sp013394695
  0.0000	1	1	subspecies	317883	                RS_GCF_013394695.1
  0.0000	1	0	species	313886	              s__Streptococcus australis_A
  0.0000	1	1	subspecies	313887	                RS_GCF_901543175.1
  0.0000	1	0	species	277125	              s__Streptococcus halotolerans
  0.0000	1	1	subspecies	277126	                RS_GCF_001598035.1
  0.0000	1	0	species	249641	              s__Streptococcus mitis_AQ
  0.0000	1	1	subspecies	249643	                RS_GCF_000722765.2
  0.0000	1	0	species	239130	              s__Streptococcus pseudopneumoniae_E
  0.0000	1	1	subspecies	239131	                RS_GCF_009731465.1
  0.0000	1	0	species	233598	              s__Streptococcus mitis_Q
  0.0000	1	1	subspecies	233599	                RS_GCF_001560895.1
  0.1672	24469	444	genus	187015	            g__Lactococcus_A
  0.0821	12014	11444	species	247976	              s__Lactococcus_A piscium_D
  0.0023	342	342	subspecies	247978	                RS_GCF_006770285.1
  0.0016	228	228	subspecies	247977	                RS_GCF_900258445.1
  0.0819	11990	3705	species	217465	              s__Lactococcus_A piscium_C
  0.0379	5546	5546	subspecies	217468	                RS_GCF_000981525.1
  0.0185	2701	2701	subspecies	217466	                RS_GCF_900094145.1
  0.0003	38	38	subspecies	217469	                RS_GCF_006770265.1
  0.0001	21	7	species	187016	              s__Lactococcus_A raffinolactis
  0.0001	10	10	subspecies	187021	                RS_GCF_012219925.1
  0.0000	1	1	subspecies	187019	                RS_GCF_002310475.1
  0.0000	1	1	subspecies	187023	                RS_GCF_012221125.1
  0.0000	1	1	subspecies	187026	                RS_GCF_012220405.1
  0.0000	1	1	subspecies	187027	                RS_GCF_012219705.1
  0.1646	24094	1036	genus	140774	            g__Lactococcus
  0.0805	11779	11651	species	174595	              s__Lactococcus garvieae
  0.0008	111	111	subspecies	174607	                RS_GCF_000269925.1
  0.0001	12	12	subspecies	174598	                RS_GCF_000269945.1
  0.0000	5	5	subspecies	174611	                RS_GCF_004328725.1
  0.0762	11160	7162	species	157723	              s__Lactococcus lactis_E
  0.0158	2314	2314	subspecies	157724	                RS_GCF_001856165.1
  0.0110	1613	1613	subspecies	157725	                RS_GCF_002078895.1
  0.0002	34	34	subspecies	157769	                RS_GCF_003966935.1
  0.0001	15	15	subspecies	157752	                RS_GCF_000468955.1
  0.0001	9	9	subspecies	157753	                RS_GCF_002078915.1
  0.0000	4	4	subspecies	157746	                RS_GCF_000312685.1
  0.0000	4	4	subspecies	157760	                RS_GCF_000236475.1
  0.0000	2	2	subspecies	157727	                RS_GCF_000014545.1
  0.0000	1	1	subspecies	157757	                RS_GCF_002078765.2
  0.0000	1	1	subspecies	157758	                RS_GCF_012689565.1
  0.0000	1	1	subspecies	157770	                RS_GCF_002078935.1
  0.0006	87	40	species	140775	              s__Lactococcus lactis
  0.0000	7	7	subspecies	140918	                RS_GCF_002078975.2
  0.0000	5	5	subspecies	140930	                RS_GCF_008728875.1
  0.0000	4	4	subspecies	140917	                RS_GCF_007954765.1
  0.0000	3	3	subspecies	140958	                GB_GCA_000479375.3
  0.0000	3	3	subspecies	140857	                RS_GCF_002078415.1
  0.0000	3	3	subspecies	140913	                GB_GCA_002078395.2
  0.0000	3	3	subspecies	140927	                RS_GCF_003627395.2
  0.0000	3	3	subspecies	140931	                RS_GCF_002078435.1
  0.0000	3	3	subspecies	140937	                RS_GCF_000807375.1
  0.0000	2	2	subspecies	140825	                RS_GCF_002078495.1
  0.0000	2	2	subspecies	140856	                RS_GCF_002078995.2
  0.0000	2	2	subspecies	140889	                RS_GCF_000344575.1
  0.0000	1	1	subspecies	140922	                RS_GCF_002804285.1
  0.0000	1	1	subspecies	140955	                RS_GCF_002078475.2
  0.0000	1	1	subspecies	140953	                GB_GCA_002078455.2
  0.0000	1	1	subspecies	140942	                RS_GCF_900088425.1
  0.0000	1	1	subspecies	140938	                RS_GCF_000192705.1
  0.0000	1	1	subspecies	140777	                RS_GCF_002078855.1
  0.0000	1	1	subspecies	140779	                RS_GCF_000761115.1
  0.0002	22	0	species	202606	              s__Lactococcus garvieae_B
  0.0002	22	22	subspecies	202612	                RS_GCF_002355575.1
  0.0001	9	0	species	176294	              s__Lactococcus petauri
  0.0001	9	9	subspecies	176297	                RS_GCF_009662295.1
  0.0000	1	0	species	286871	              s__Lactococcus sp003627095
  0.0000	1	1	subspecies	286872	                RS_GCF_003627095.1
  3.7764	552752	6846	family	124225	          f__Lactobacillaceae
  1.0880	159253	2575	genus	144782	            g__Lactobacillus
  0.0838	12268	583	species	206894	              s__Lactobacillus helsingborgensis
  0.0400	5858	5858	subspecies	206898	                RS_GCF_003173695.1
  0.0398	5827	5827	subspecies	206897	                RS_GCF_000761135.1
  0.0838	12265	8573	species	161651	              s__Lactobacillus acidophilus
  0.0235	3434	3434	subspecies	161658	                RS_GCF_003952845.1
  0.0018	257	257	subspecies	161652	                RS_GCF_003047065.1
  0.0000	1	1	subspecies	161667	                RS_GCF_002224305.1
  0.0834	12206	8745	species	167569	              s__Lactobacillus iners
  0.0135	1974	1974	subspecies	167579	                RS_GCF_010748955.1
  0.0097	1427	1427	subspecies	167573	                RS_GCF_011058795.1
  0.0001	13	13	subspecies	167594	                RS_GCF_011058715.1
  0.0001	12	12	subspecies	167582	                RS_GCF_011058695.1
  0.0001	12	12	subspecies	167598	                RS_GCF_009556455.1
  0.0001	12	12	subspecies	167599	                RS_GCF_011058735.1
  0.0000	7	7	subspecies	167593	                RS_GCF_011058755.1
  0.0000	4	4	subspecies	167591	                RS_GCF_011058775.1
  0.0832	12180	12110	species	176738	              s__Lactobacillus mulieris
  0.0003	41	41	subspecies	176740	                RS_GCF_000159335.1
  0.0002	29	29	subspecies	176752	                RS_GCF_009730255.1
  0.0831	12163	8112	species	152628	              s__Lactobacillus delbrueckii
  0.0148	2171	2171	subspecies	152641	                RS_GCF_009734125.1
  0.0115	1681	1681	subspecies	152632	                RS_GCF_002278095.1
  0.0003	40	40	subspecies	152663	                RS_GCF_001908415.1
  0.0002	22	22	subspecies	152668	                RS_GCF_001908495.1
  0.0001	19	19	subspecies	152652	                RS_GCF_001888965.1
  0.0001	12	12	subspecies	152649	                RS_GCF_002142575.1
  0.0001	11	11	subspecies	152658	                RS_GCF_002000885.1
  0.0001	11	11	subspecies	152644	                RS_GCF_000014405.1
  0.0001	10	10	subspecies	152667	                RS_GCF_000056065.1
  0.0001	10	10	subspecies	152689	                RS_GCF_001888925.1
  0.0001	9	9	subspecies	152654	                GB_GCA_003814285.1
  0.0000	7	7	subspecies	152696	                RS_GCF_011044195.1
  0.0000	7	7	subspecies	152683	                RS_GCF_001469775.1
  0.0000	6	6	subspecies	152653	                RS_GCF_000191165.1
  0.0000	6	6	subspecies	152690	                RS_GCF_006704185.1
  0.0000	5	5	subspecies	152645	                RS_GCF_000182835.1
  0.0000	5	5	subspecies	152676	                RS_GCF_900322585.1
  0.0000	4	4	subspecies	152682	                RS_GCF_001888945.1
  0.0000	3	3	subspecies	152704	                RS_GCF_001888985.1
  0.0000	3	3	subspecies	152702	                RS_GCF_003351805.1
  0.0000	3	3	subspecies	152673	                RS_GCF_001953135.1
  0.0000	3	3	subspecies	152666	                RS_GCF_001888905.1
  0.0000	2	2	subspecies	152697	                RS_GCF_002285775.1
  0.0000	1	1	subspecies	152671	                RS_GCF_900196735.1
  0.0831	12158	8554	species	144913	              s__Lactobacillus crispatus
  0.0172	2512	2512	subspecies	144923	                RS_GCF_000091765.1
  0.0069	1017	1017	subspecies	144920	                RS_GCF_003971565.1
  0.0001	17	17	subspecies	145027	                RS_GCF_013456995.1
  0.0001	15	15	subspecies	145031	                RS_GCF_009769205.1
  0.0001	14	14	subspecies	145003	                RS_GCF_013487905.1
  0.0001	11	11	subspecies	145017	                RS_GCF_003795065.1
  0.0001	9	9	subspecies	144942	                RS_GCF_009730275.1
  0.0001	9	9	subspecies	145019	                RS_GCF_009933525.1
  0.0830	12143	9290	species	158649	              s__Lactobacillus johnsonii
  0.0114	1666	1666	subspecies	158650	                RS_GCF_000498675.1
  0.0069	1010	1010	subspecies	158652	                RS_GCF_010586925.1
  0.0003	48	48	subspecies	158673	                RS_GCF_013487865.1
  0.0002	34	34	subspecies	158657	                RS_GCF_000008065.1
  0.0002	29	29	subspecies	158692	                GB_GCA_000219475.3
  0.0001	15	15	subspecies	158662	                RS_GCF_001714745.1
  0.0001	13	13	subspecies	158686	                RS_GCF_004011315.1
  0.0001	10	10	subspecies	158703	                RS_GCF_009769185.1
  0.0001	9	9	subspecies	158665	                RS_GCF_000204985.1
  0.0000	7	7	subspecies	158655	                RS_GCF_003428395.1
  0.0000	5	5	subspecies	158661	                RS_GCF_014058685.1
  0.0000	3	3	subspecies	158660	                RS_GCF_003316915.1
  0.0000	3	3	subspecies	158685	                RS_GCF_000091405.1
  0.0000	1	1	subspecies	158668	                RS_GCF_002176855.1
  0.0827	12101	8158	species	170761	              s__Lactobacillus acetotolerans
  0.0150	2189	2189	subspecies	170777	                RS_GCF_001042405.1
  0.0115	1687	1687	subspecies	170770	                RS_GCF_008831485.1
  0.0003	39	39	subspecies	170780	                RS_GCF_012848655.1
  0.0002	28	28	subspecies	170785	                RS_GCF_009738535.1
  0.0823	12048	8581	species	168408	              s__Lactobacillus paragasseri
  0.0212	3096	3096	subspecies	168410	                RS_GCF_005886075.1
  0.0020	292	292	subspecies	168412	                RS_GCF_013363915.1
  0.0002	36	36	subspecies	168433	                RS_GCF_009734365.1
  0.0002	27	27	subspecies	168418	                RS_GCF_003584685.1
  0.0001	16	16	subspecies	168416	                RS_GCF_900636895.1
  0.0821	12019	7363	species	192641	              s__Lactobacillus amylolyticus
  0.0255	3727	3727	subspecies	192644	                RS_GCF_009497035.1
  0.0063	923	923	subspecies	192643	                RS_GCF_003999355.1
  0.0000	6	6	subspecies	192648	                RS_GCF_002075105.1
  0.0813	11903	8050	species	174317	              s__Lactobacillus amylovorus
  0.0144	2101	2101	subspecies	174320	                RS_GCF_006384175.1
  0.0114	1670	1670	subspecies	174324	                RS_GCF_000194115.1
  0.0003	46	46	subspecies	174325	                RS_GCF_002706375.1
  0.0001	15	15	subspecies	174327	                GB_GCA_002950865.1
  0.0001	13	13	subspecies	174326	                RS_GCF_000182855.2
  0.0001	8	8	subspecies	174336	                RS_GCF_000191545.1
  0.0806	11793	1626	species	166066	              s__Lactobacillus gasseri
  0.0350	5125	5125	subspecies	166077	                RS_GCF_000014425.1
  0.0344	5042	5042	subspecies	166079	                RS_GCF_002287905.1
  0.0775	11343	10940	species	190725	              s__Lactobacillus kefiranofaciens
  0.0014	204	204	subspecies	190728	                RS_GCF_000214785.1
  0.0009	138	138	subspecies	190729	                RS_GCF_009184665.1
  0.0004	61	61	subspecies	190730	                RS_GCF_014656585.1
  0.0005	80	54	species	144783	              s__Lactobacillus helveticus
  0.0001	8	8	subspecies	144792	                RS_GCF_001314245.2
  0.0000	5	5	subspecies	144798	                RS_GCF_000189515.1
  0.0000	2	2	subspecies	144784	                RS_GCF_001308285.1
  0.0000	2	2	subspecies	144787	                RS_GCF_000525715.1
  0.0000	2	2	subspecies	144829	                GB_GCA_003814305.1
  0.0000	2	2	subspecies	144839	                RS_GCF_000165775.1
  0.0000	2	2	subspecies	144871	                RS_GCF_003610975.1
  0.0000	1	1	subspecies	144830	                RS_GCF_000961015.1
  0.0000	1	1	subspecies	144855	                RS_GCF_000422165.1
  0.0000	1	1	subspecies	144866	                RS_GCF_000015385.1
  0.0000	6	0	species	167888	              s__Lactobacillus jensenii
  0.0000	6	6	subspecies	167893	                RS_GCF_001936235.1
  0.0000	2	0	species	217344	              s__Lactobacillus kullabergensis
  0.0000	2	2	subspecies	217347	                RS_GCF_003151025.1
  0.6671	97642	3448	genus	151391	            g__Leuconostoc
  0.0819	11985	3547	species	175484	              s__Leuconostoc lactis
  0.0290	4242	4242	subspecies	175494	                RS_GCF_001998805.1
  0.0284	4162	4162	subspecies	175485	                RS_GCF_007954605.1
  0.0001	20	20	subspecies	175500	                RS_GCF_007954665.1
  0.0001	14	14	subspecies	175498	                RS_GCF_001698145.1
  0.0810	11850	9480	species	178229	              s__Leuconostoc carnosum
  0.0087	1274	1274	subspecies	178234	                RS_GCF_000300135.1
  0.0075	1096	1096	subspecies	178230	                RS_GCF_007954525.1
  0.0809	11836	11576	species	205311	              s__Leuconostoc suionicum
  0.0010	147	147	subspecies	205312	                RS_GCF_002370395.1
  0.0008	113	113	subspecies	205313	                RS_GCF_001891125.1
  0.0804	11763	9898	species	223104	              s__Leuconostoc kimchii
  0.0085	1248	1248	subspecies	223106	                RS_GCF_000092505.1
  0.0042	613	613	subspecies	223105	                RS_GCF_004551615.1
  0.0000	4	4	subspecies	223107	                RS_GCF_000219785.1
  0.0802	11736	8602	species	169630	              s__Leuconostoc citreum
  0.0133	1943	1943	subspecies	169635	                RS_GCF_007954705.1
  0.0079	1155	1155	subspecies	169632	                RS_GCF_009707745.1
  0.0002	27	27	subspecies	169654	                RS_GCF_002804045.1
  0.0000	7	7	subspecies	169655	                RS_GCF_007954565.1
  0.0000	2	2	subspecies	169649	                RS_GCF_000026405.1
  0.0796	11644	11611	species	250008	              s__Leuconostoc mesenteroides_B
  0.0002	30	30	subspecies	250010	                RS_GCF_007954745.1
  0.0000	3	3	subspecies	250009	                RS_GCF_009676745.1
  0.0795	11633	8518	species	183960	              s__Leuconostoc inhae
  0.0179	2616	2616	subspecies	183969	                GB_GCA_000196855.1
  0.0032	471	471	subspecies	183968	                RS_GCF_013403485.1
  0.0001	21	21	subspecies	183972	                RS_GCF_001536305.1
  0.0000	7	7	subspecies	183970	                RS_GCF_009296125.1
  0.0794	11619	3629	species	228422	              s__Leuconostoc gelidum
  0.0279	4088	4088	subspecies	228423	                RS_GCF_006770305.1
  0.0267	3902	3902	subspecies	228424	                RS_GCF_000298875.1
  0.0008	124	69	species	151392	              s__Leuconostoc mesenteroides
  0.0001	9	9	subspecies	151453	                RS_GCF_002148235.1
  0.0000	7	7	subspecies	151428	                RS_GCF_004103675.1
  0.0000	6	6	subspecies	151455	                RS_GCF_001047695.1
  0.0000	5	5	subspecies	151473	                RS_GCF_000512955.1
  0.0000	4	4	subspecies	151410	                RS_GCF_002370415.1
  0.0000	4	4	subspecies	151418	                RS_GCF_001886915.1
  0.0000	4	4	subspecies	151437	                RS_GCF_003255835.1
  0.0000	4	4	subspecies	151439	                RS_GCF_001583825.1
  0.0000	3	3	subspecies	151419	                RS_GCF_004102585.1
  0.0000	3	3	subspecies	151474	                RS_GCF_000234825.3
  0.0000	2	2	subspecies	151459	                RS_GCF_003433375.1
  0.0000	2	2	subspecies	151468	                RS_GCF_004194375.1
  0.0000	1	1	subspecies	151415	                RS_GCF_009913915.1
  0.0000	1	1	subspecies	151417	                RS_GCF_000014445.1
  0.0000	2	0	species	198255	              s__Leuconostoc pseudomesenteroides
  0.0000	2	2	subspecies	198256	                RS_GCF_008033175.1
  0.0000	2	0	species	201634	              s__Leuconostoc lactis_A
  0.0000	2	2	subspecies	201640	                RS_GCF_007954625.1
  0.4170	61043	475	genus	161420	            g__Weissella
  0.0840	12290	11592	species	212444	              s__Weissella ceti
  0.0029	424	424	subspecies	212447	                RS_GCF_000750535.1
  0.0018	268	268	subspecies	212445	                RS_GCF_000750515.1
  0.0000	6	6	subspecies	212448	                RS_GCF_000732905.1
  0.0837	12252	3366	species	204496	              s__Weissella soli
  0.0306	4476	4476	subspecies	204500	                RS_GCF_001761545.1
  0.0301	4410	4410	subspecies	204497	                RS_GCF_007954545.1
  0.0826	12084	8081	species	209968	              s__Weissella koreensis
  0.0262	3842	3842	subspecies	209970	                RS_GCF_000219805.1
  0.0010	149	149	subspecies	209969	                RS_GCF_009697245.1
  0.0001	12	12	subspecies	209971	                RS_GCF_002950695.1
  0.0820	11996	7968	species	192764	              s__Weissella hellenica_B
  0.0141	2063	2063	subspecies	192769	                RS_GCF_007954725.1
  0.0134	1965	1965	subspecies	192765	                RS_GCF_006777025.1
  0.0815	11932	1793	species	168227	              s__Weissella confusa
  0.0347	5076	5076	subspecies	168229	                RS_GCF_004771075.1
  0.0346	5063	5063	subspecies	168243	                RS_GCF_011044335.1
  0.0001	9	5	species	161421	              s__Weissella cibaria
  0.0000	1	1	subspecies	161432	                RS_GCF_004103655.1
  0.0000	1	1	subspecies	161443	                RS_GCF_001308145.2
  0.0000	1	1	subspecies	161447	                RS_GCF_006517775.1
  0.0000	1	1	subspecies	161464	                RS_GCF_014081885.1
  0.0000	3	0	species	254687	              s__Weissella confusa_B
  0.0000	3	3	subspecies	254689	                RS_GCF_004771295.1
  0.0000	1	0	species	172715	              s__Weissella paramesenteroides
  0.0000	1	1	subspecies	172738	                RS_GCF_002386265.1
  0.0000	1	0	species	267698	              s__Weissella sp011304355
  0.0000	1	1	subspecies	267699	                RS_GCF_011304355.1
  0.2475	36228	1621	genus	146053	            g__Limosilactobacillus
  0.0830	12146	1088	species	175653	              s__Limosilactobacillus mucosae
  0.0379	5543	5543	subspecies	175665	                RS_GCF_000248095.2
  0.0377	5515	5515	subspecies	175670	                RS_GCF_013423865.1
  0.0813	11899	10380	species	152221	              s__Limosilactobacillus fermentum
  0.0089	1309	1309	subspecies	152226	                RS_GCF_000966835.2
  0.0003	46	46	subspecies	152287	                RS_GCF_002192435.1
  0.0002	23	23	subspecies	152299	                RS_GCF_011032745.1
  0.0002	23	23	subspecies	152288	                GB_GCA_003710225.1
  0.0002	23	23	subspecies	152275	                GB_GCA_002356135.1
  0.0001	17	17	subspecies	152273	                GB_GCA_000210515.1
  0.0001	13	13	subspecies	152298	                RS_GCF_900205745.1
  0.0001	12	12	subspecies	152237	                RS_GCF_004063635.1
  0.0001	8	8	subspecies	152246	                RS_GCF_001742205.1
  0.0000	6	6	subspecies	152251	                RS_GCF_003346795.1
  0.0000	6	6	subspecies	152280	                RS_GCF_012273035.1
  0.0000	5	5	subspecies	152243	                RS_GCF_002242615.1
  0.0000	4	4	subspecies	152268	                RS_GCF_000466785.3
  0.0000	4	4	subspecies	152286	                RS_GCF_003860425.1
  0.0000	3	3	subspecies	152229	                GB_GCA_002072085.1
  0.0000	3	3	subspecies	152282	                RS_GCF_004208815.1
  0.0000	3	3	subspecies	152249	                RS_GCF_004063515.1
  0.0000	2	2	subspecies	152274	                RS_GCF_001941785.1
  0.0000	2	2	subspecies	152255	                RS_GCF_008802915.1
  0.0000	2	2	subspecies	152291	                RS_GCF_011032765.1
  0.0000	2	2	subspecies	152231	                RS_GCF_000397165.1
  0.0000	1	1	subspecies	152283	                RS_GCF_001854105.1
  0.0000	1	1	subspecies	152290	                RS_GCF_003255875.1
  0.0000	1	1	subspecies	152232	                RS_GCF_000010145.1
  0.0708	10361	4731	species	159198	              s__Limosilactobacillus reuteri_E
  0.0205	2997	2997	subspecies	159202	                RS_GCF_012275185.1
  0.0176	2579	2579	subspecies	159209	                RS_GCF_013487925.1
  0.0003	47	47	subspecies	159246	                RS_GCF_013694365.1
  0.0000	7	7	subspecies	159226	                RS_GCF_000159455.2
  0.0013	193	119	species	146054	              s__Limosilactobacillus reuteri
  0.0001	18	18	subspecies	146122	                RS_GCF_007633215.1
  0.0001	15	15	subspecies	146126	                RS_GCF_001688685.2
  0.0001	10	10	subspecies	146083	                RS_GCF_001618905.1
  0.0001	10	10	subspecies	146140	                RS_GCF_000410995.1
  0.0001	9	9	subspecies	146065	                RS_GCF_000439275.1
  0.0000	4	4	subspecies	146151	                RS_GCF_013348825.1
  0.0000	3	3	subspecies	146150	                RS_GCF_006874665.1
  0.0000	3	3	subspecies	146163	                RS_GCF_000236455.2
  0.0000	1	1	subspecies	146063	                RS_GCF_009184725.1
  0.0000	1	1	subspecies	146075	                RS_GCF_003316935.1
  0.0000	4	0	species	221594	              s__Limosilactobacillus gastricus
  0.0000	4	4	subspecies	221597	                RS_GCF_009648555.1
  0.0000	2	0	species	167633	              s__Limosilactobacillus reuteri_D
  0.0000	2	2	subspecies	167643	                RS_GCF_003072625.1
  0.0000	1	0	species	207269	              s__Limosilactobacillus vaginalis
  0.0000	1	1	subspecies	207272	                RS_GCF_009362935.1
  0.0000	1	0	species	305112	              s__Limosilactobacillus sp013487845
  0.0000	1	1	subspecies	305113	                RS_GCF_013487845.1
  0.2372	34719	151	genus	143227	            g__Pediococcus
  0.0824	12062	11499	species	161512	              s__Pediococcus pentosaceus
  0.0024	356	356	subspecies	161519	                RS_GCF_000014505.1
  0.0005	69	69	subspecies	161528	                RS_GCF_009930955.1
  0.0003	46	46	subspecies	161513	                RS_GCF_009914015.1
  0.0002	25	25	subspecies	161536	                RS_GCF_002173535.1
  0.0001	15	15	subspecies	161529	                RS_GCF_001411765.2
  0.0001	15	15	subspecies	161539	                RS_GCF_000496265.1
  0.0001	12	12	subspecies	161527	                RS_GCF_009791435.1
  0.0001	8	8	subspecies	161532	                RS_GCF_007923185.1
  0.0001	8	8	subspecies	161547	                RS_GCF_003429405.1
  0.0000	7	7	subspecies	161522	                RS_GCF_002982155.1
  0.0000	1	1	subspecies	161521	                RS_GCF_006770865.1
  0.0000	1	1	subspecies	161534	                RS_GCF_002202155.1
  0.0794	11618	11288	species	211410	              s__Pediococcus claussenii
  0.0021	306	306	subspecies	211412	                RS_GCF_000237995.1
  0.0002	24	24	subspecies	211411	                RS_GCF_001702235.1
  0.0743	10876	10216	species	184548	              s__Pediococcus damnosus
  0.0023	338	338	subspecies	184549	                RS_GCF_001611075.1
  0.0018	264	264	subspecies	184554	                RS_GCF_001611135.1
  0.0003	50	50	subspecies	184556	                RS_GCF_001611155.1
  0.0000	6	6	subspecies	184560	                RS_GCF_001611115.1
  0.0000	2	2	subspecies	184558	                RS_GCF_001611035.1
  0.0000	6	6	species	143228	              s__Pediococcus acidilactici
  0.0000	6	0	species	221095	              s__Pediococcus inopinatus
  0.0000	6	6	subspecies	221096	                RS_GCF_002982135.1
  0.1667	24406	216	genus	141869	            g__Ligilactobacillus
  0.0828	12118	6195	species	159359	              s__Ligilactobacillus murinus
  0.0361	5279	5279	subspecies	159395	                RS_GCF_010586905.1
  0.0042	610	610	subspecies	159400	                RS_GCF_003288115.1
  0.0002	34	34	subspecies	159401	                RS_GCF_003288135.1
  0.0825	12069	143	species	188549	              s__Ligilactobacillus animalis
  0.0410	6001	6001	subspecies	188555	                RS_GCF_005311005.1
  0.0405	5925	5925	subspecies	188556	                RS_GCF_009933595.1
  0.0000	3	2	species	141870	              s__Ligilactobacillus salivarius
  0.0000	1	1	subspecies	142000	                RS_GCF_002162055.1
  0.1666	24378	643	genus	124226	            g__Lactiplantibacillus
  0.0812	11881	6021	species	181575	              s__Lactiplantibacillus paraplantarum
  0.0391	5719	5719	subspecies	181576	                RS_GCF_001443645.1
  0.0009	130	130	subspecies	181583	                GB_GCA_003045685.1
  0.0000	7	7	subspecies	181586	                RS_GCF_013113675.1
  0.0000	4	4	subspecies	181587	                RS_GCF_003641145.1
  0.0804	11761	8104	species	170953	              s__Lactiplantibacillus pentosus
  0.0242	3549	3549	subspecies	170956	                GB_GCA_013394345.1
  0.0004	64	64	subspecies	170970	                RS_GCF_002850015.1
  0.0001	18	18	subspecies	170962	                RS_GCF_003627375.1
  0.0001	15	15	subspecies	170978	                RS_GCF_002211885.1
  0.0001	11	11	subspecies	170973	                RS_GCF_003641185.1
  0.0006	89	50	species	124227	              s__Lactiplantibacillus plantarum
  0.0000	3	3	subspecies	124268	                RS_GCF_000338115.2
  0.0000	2	2	subspecies	124404	                RS_GCF_005576935.1
  0.0000	2	2	subspecies	124683	                RS_GCF_009937825.1
  0.0000	2	2	subspecies	124357	                GB_GCA_002028365.1
  0.0000	2	2	subspecies	124724	                RS_GCF_003429585.1
  0.0000	1	1	subspecies	124692	                RS_GCF_001880185.2
  0.0000	1	1	subspecies	124759	                RS_GCF_001302645.1
  0.0000	1	1	subspecies	124262	                RS_GCF_003999605.1
  0.0000	1	1	subspecies	124649	                RS_GCF_002749655.1
  0.0000	1	1	subspecies	124771	                RS_GCF_009913675.1
  0.0000	1	1	subspecies	124634	                RS_GCF_004319665.1
  0.0000	1	1	subspecies	124632	                RS_GCF_003020005.1
  0.0000	1	1	subspecies	124622	                RS_GCF_013367715.1
  0.0000	1	1	subspecies	124617	                RS_GCF_003813125.1
  0.0000	1	1	subspecies	124590	                RS_GCF_002943545.1
  0.0000	1	1	subspecies	124560	                RS_GCF_002286275.1
  0.0000	1	1	subspecies	124550	                RS_GCF_012109355.1
  0.0000	1	1	subspecies	124546	                RS_GCF_009913835.1
  0.0000	1	1	subspecies	124540	                GB_GCA_001908455.1
  0.0000	1	1	subspecies	124483	                RS_GCF_001874125.1
  0.0000	1	1	subspecies	124473	                RS_GCF_001715615.1
  0.0000	1	1	subspecies	124461	                RS_GCF_004730965.1
  0.0000	1	1	subspecies	124459	                RS_GCF_003097595.1
  0.0000	1	1	subspecies	124453	                RS_GCF_001660025.1
  0.0000	1	1	subspecies	124424	                RS_GCF_000412205.1
  0.0000	1	1	subspecies	124408	                RS_GCF_001278015.1
  0.0000	1	1	subspecies	124406	                RS_GCF_002220815.1
  0.0000	1	1	subspecies	124374	                RS_GCF_013487805.1
  0.0000	1	1	subspecies	124367	                RS_GCF_004101505.1
  0.0000	1	1	subspecies	124356	                RS_GCF_002205775.2
  0.0000	1	1	subspecies	124323	                RS_GCF_001272315.2
  0.0000	1	1	subspecies	124296	                RS_GCF_002117285.1
  0.0000	1	1	subspecies	124293	                RS_GCF_003641165.1
  0.0000	4	0	species	241159	              s__Lactiplantibacillus plantarum_A
  0.0000	4	4	subspecies	241160	                RS_GCF_000271445.1
  0.1662	24321	330	genus	137250	            g__Lacticaseibacillus
  0.0834	12205	12063	species	138546	              s__Lacticaseibacillus rhamnosus
  0.0005	79	79	subspecies	138548	                RS_GCF_002076955.1
  0.0001	11	11	subspecies	138725	                RS_GCF_900070175.1
  0.0001	8	8	subspecies	138562	                RS_GCF_002287945.1
  0.0001	8	8	subspecies	138682	                RS_GCF_009429065.1
  0.0000	7	7	subspecies	138691	                GB_GCA_001721925.1
  0.0000	6	6	subspecies	138721	                RS_GCF_001988935.1
  0.0000	5	5	subspecies	138686	                RS_GCF_002286235.1
  0.0000	4	4	subspecies	138688	                RS_GCF_000026525.1
  0.0000	3	3	subspecies	138553	                RS_GCF_900636875.1
  0.0000	3	3	subspecies	138594	                RS_GCF_001590655.1
  0.0000	2	2	subspecies	138631	                RS_GCF_008727835.1
  0.0000	2	2	subspecies	138652	                RS_GCF_013167115.1
  0.0000	1	1	subspecies	138628	                RS_GCF_000418475.1
  0.0000	1	1	subspecies	138670	                GB_GCA_002025085.1
  0.0000	1	1	subspecies	138697	                RS_GCF_000233755.1
  0.0000	1	1	subspecies	138718	                RS_GCF_000011045.1
  0.0804	11770	289	species	182358	              s__Lacticaseibacillus casei
  0.0402	5882	5882	subspecies	182369	                RS_GCF_002192215.1
  0.0383	5599	5599	subspecies	182368	                RS_GCF_000829055.1
  0.0001	12	5	species	137251	              s__Lacticaseibacillus paracasei
  0.0000	2	2	subspecies	137462	                RS_GCF_007637635.1
  0.0000	1	1	subspecies	137306	                RS_GCF_008329845.1
  0.0000	1	1	subspecies	137315	                RS_GCF_000418515.1
  0.0000	1	1	subspecies	137332	                RS_GCF_004141835.1
  0.0000	1	1	subspecies	137377	                RS_GCF_009834405.1
  0.0000	1	1	subspecies	137457	                RS_GCF_003627255.1
  0.0000	4	0	species	187932	              s__Lacticaseibacillus zeae
  0.0000	4	4	subspecies	187937	                RS_GCF_900492555.1
  0.0838	12267	0	genus	194284	            g__Schleiferilactobacillus
  0.0838	12267	3519	species	194285	              s__Schleiferilactobacillus harbinensis
  0.0306	4478	4478	subspecies	194288	                RS_GCF_009295865.1
  0.0291	4256	4256	subspecies	194289	                RS_GCF_008694105.1
  0.0001	14	14	subspecies	194291	                RS_GCF_009217765.1
  0.0830	12153	19	genus	170050	            g__Lentilactobacillus
  0.0829	12134	5206	species	188991	              s__Lentilactobacillus hilgardii
  0.0236	3448	3448	subspecies	188993	                RS_GCF_008694025.1
  0.0235	3441	3441	subspecies	188995	                RS_GCF_011765585.1
  0.0003	39	39	subspecies	188996	                RS_GCF_009832765.1
  0.0830	12150	191	genus	201959	            g__Furfurilactobacillus
  0.0816	11945	11908	species	226229	              s__Furfurilactobacillus rossiae_A
  0.0001	19	19	subspecies	226232	                RS_GCF_013394045.1
  0.0001	18	18	subspecies	226230	                RS_GCF_013394025.1
  0.0001	14	8	species	201960	              s__Furfurilactobacillus rossiae
  0.0000	6	6	subspecies	201963	                RS_GCF_013394005.1
  0.0823	12045	6	genus	167213	            g__Fructilactobacillus
  0.0822	12038	11582	species	184259	              s__Fructilactobacillus lindneri
  0.0020	295	295	subspecies	184266	                RS_GCF_001702135.1
  0.0011	161	161	subspecies	184270	                RS_GCF_001702115.1
  0.0000	1	1	species	167214	              s__Fructilactobacillus sanfranciscensis
  0.0820	12004	197	genus	159035	            g__Latilactobacillus
  0.0806	11799	6431	species	171625	              s__Latilactobacillus curvatus
  0.0255	3730	3730	subspecies	171627	                RS_GCF_004088235.1
  0.0106	1546	1546	subspecies	171626	                RS_GCF_003254785.1
  0.0002	29	29	subspecies	171641	                RS_GCF_002224505.1
  0.0002	23	23	subspecies	171630	                RS_GCF_001698165.1
  0.0001	13	13	subspecies	171644	                RS_GCF_900178545.1
  0.0001	11	11	subspecies	171632	                RS_GCF_003957415.1
  0.0000	6	6	subspecies	171631	                RS_GCF_002224425.1
  0.0000	4	4	subspecies	171635	                RS_GCF_003410375.1
  0.0000	2	2	subspecies	171637	                RS_GCF_004101845.1
  0.0000	2	2	subspecies	171645	                RS_GCF_001723545.1
  0.0000	1	1	subspecies	171633	                RS_GCF_007954645.1
  0.0000	1	1	subspecies	171634	                GB_GCA_003966815.1
  0.0001	8	1	species	159036	              s__Latilactobacillus sakei
  0.0000	3	3	subspecies	159082	                RS_GCF_003288235.1
  0.0000	2	2	subspecies	159052	                RS_GCF_010092945.1
  0.0000	2	2	subspecies	159061	                RS_GCF_900234395.1
  0.0818	11971	15	genus	154869	            g__Levilactobacillus
  0.0816	11951	579	species	212757	              s__Levilactobacillus zymae
  0.0396	5797	5797	subspecies	212760	                RS_GCF_009295845.1
  0.0381	5575	5575	subspecies	212761	                RS_GCF_900183405.1
  0.0000	4	4	species	154870	              s__Levilactobacillus brevis
  0.0000	1	0	species	238049	              s__Levilactobacillus suantsaii
  0.0000	1	1	subspecies	238050	                RS_GCF_014069315.1
  0.0774	11326	8	genus	189379	            g__Loigolactobacillus
  0.0773	11316	10589	species	191647	              s__Loigolactobacillus backii
  0.0027	393	393	subspecies	191648	                RS_GCF_001663655.1
  0.0019	283	283	subspecies	191649	                RS_GCF_001663715.1
  0.0003	48	48	subspecies	191655	                RS_GCF_001663735.1
  0.0000	3	3	subspecies	191650	                RS_GCF_001663755.1
  0.0000	2	0	species	189380	              s__Loigolactobacillus coryniformis
  0.0000	2	2	subspecies	189390	                RS_GCF_002706705.1
  0.6705	98137	117	family	97610	          f__Listeriaceae
  0.5858	85738	13879	genus	97611	            g__Listeria
  0.0830	12146	12113	species	211268	              s__Listeria welshimeri
  0.0001	17	17	subspecies	211269	                RS_GCF_000060285.1
  0.0001	16	16	subspecies	211272	                RS_GCF_900187315.1
  0.0828	12117	11660	species	172883	              s__Listeria ivanovii
  0.0031	451	451	subspecies	172887	                RS_GCF_000252975.1
  0.0000	5	5	subspecies	172885	                RS_GCF_000565155.1
  0.0000	1	1	subspecies	172902	                RS_GCF_006339495.1
  0.0826	12097	798	species	147876	              s__Listeria seeligeri
  0.0387	5669	5669	subspecies	147929	                RS_GCF_000027145.1
  0.0385	5630	5630	subspecies	147935	                RS_GCF_006339625.1
  0.0820	12004	11282	species	193831	              s__Listeria londoniensis
  0.0026	386	386	subspecies	193832	                RS_GCF_900637745.1
  0.0022	321	321	subspecies	193833	                RS_GCF_000763475.1
  0.0001	15	15	subspecies	193835	                RS_GCF_000763495.1
  0.0788	11527	2929	species	156867	              s__Listeria innocua
  0.0294	4309	4309	subspecies	156880	                RS_GCF_009648575.1
  0.0293	4289	4289	subspecies	156927	                RS_GCF_000195795.1
  0.0784	11471	10741	species	106179	              s__Listeria monocytogenes_B
  0.0041	597	597	subspecies	107348	                RS_GCF_001454885.1
  0.0003	41	41	subspecies	107276	                RS_GCF_000438745.2
  0.0002	35	35	subspecies	106180	                RS_GCF_000008285.1
  0.0001	9	9	subspecies	107045	                GB_GCA_013363795.1
  0.0000	4	4	subspecies	106818	                RS_GCF_000258905.1
  0.0000	3	3	subspecies	106182	                RS_GCF_001454845.1
  0.0000	3	3	subspecies	107211	                RS_GCF_002208215.1
  0.0000	3	3	subspecies	106868	                RS_GCF_008807935.1
  0.0000	3	3	subspecies	106377	                RS_GCF_000210795.2
  0.0000	3	3	subspecies	106323	                RS_GCF_900231485.1
  0.0000	2	2	subspecies	106660	                RS_GCF_000438685.2
  0.0000	2	2	subspecies	107619	                RS_GCF_001454925.1
  0.0000	2	2	subspecies	107508	                RS_GCF_005154665.1
  0.0000	2	2	subspecies	107106	                RS_GCF_000195435.3
  0.0000	2	2	subspecies	106305	                RS_GCF_008807555.1
  0.0000	2	2	subspecies	106745	                RS_GCF_001999045.1
  0.0000	1	1	subspecies	106278	                RS_GCF_002101275.1
  0.0000	1	1	subspecies	107620	                RS_GCF_000026705.1
  0.0000	1	1	subspecies	106690	                RS_GCF_003032055.1
  0.0000	1	1	subspecies	107607	                RS_GCF_001999145.1
  0.0000	1	1	subspecies	106720	                RS_GCF_008807955.1
  0.0000	1	1	subspecies	106187	                RS_GCF_000306905.1
  0.0000	1	1	subspecies	107325	                RS_GCF_000438585.1
  0.0000	1	1	subspecies	106202	                RS_GCF_013122235.1
  0.0000	1	1	subspecies	107257	                RS_GCF_004771175.1
  0.0000	1	1	subspecies	106835	                RS_GCF_008807195.1
  0.0000	1	1	subspecies	107147	                RS_GCF_000438625.1
  0.0000	1	1	subspecies	107112	                RS_GCF_001998945.1
  0.0000	1	1	subspecies	106761	                RS_GCF_000307085.1
  0.0000	1	1	subspecies	107038	                RS_GCF_003031915.1
  0.0000	1	1	subspecies	106943	                RS_GCF_013177395.1
  0.0000	1	1	subspecies	106887	                RS_GCF_008807615.1
  0.0000	1	1	subspecies	106320	                RS_GCF_001998985.1
  0.0027	393	321	species	142223	              s__Listeria monocytogenes_C
  0.0001	15	15	subspecies	142260	                RS_GCF_000250715.1
  0.0001	14	14	subspecies	142373	                RS_GCF_008807875.1
  0.0001	13	13	subspecies	142228	                RS_GCF_000307065.1
  0.0001	12	12	subspecies	142310	                RS_GCF_013282665.1
  0.0001	8	8	subspecies	142344	                RS_GCF_003812565.1
  0.0000	7	7	subspecies	142358	                RS_GCF_013282645.1
  0.0000	3	3	subspecies	142236	                RS_GCF_001454865.1
  0.0007	104	52	species	97612	              s__Listeria monocytogenes
  0.0001	18	18	subspecies	98754	                RS_GCF_002116675.1
  0.0000	5	5	subspecies	98574	                RS_GCF_002105715.1
  0.0000	4	4	subspecies	99234	                RS_GCF_002105675.1
  0.0000	3	3	subspecies	98150	                GB_GCA_000382925.1
  0.0000	3	3	subspecies	98299	                GB_GCA_008807635.1
  0.0000	3	3	subspecies	98709	                RS_GCF_003812545.1
  0.0000	2	2	subspecies	98068	                GB_GCA_000382945.1
  0.0000	2	2	subspecies	98079	                RS_GCF_003031975.1
  0.0000	2	2	subspecies	98824	                RS_GCF_008807475.1
  0.0000	1	1	subspecies	97928	                RS_GCF_001262395.1
  0.0000	1	1	subspecies	98103	                RS_GCF_000306985.1
  0.0000	1	1	subspecies	97759	                RS_GCF_009664755.1
  0.0000	1	1	subspecies	98582	                RS_GCF_010442835.1
  0.0000	1	1	subspecies	97716	                RS_GCF_008807515.1
  0.0000	1	1	subspecies	98800	                RS_GCF_001999085.1
  0.0000	1	1	subspecies	98851	                RS_GCF_001483405.1
  0.0000	1	1	subspecies	98933	                RS_GCF_003433475.1
  0.0000	1	1	subspecies	99098	                RS_GCF_000168635.2
  0.0000	1	1	subspecies	97669	                RS_GCF_000093125.2
  0.0839	12282	0	genus	169994	            g__Brochothrix
  0.0839	12282	7416	species	169995	              s__Brochothrix thermosphacta
  0.0174	2545	2545	subspecies	170001	                RS_GCF_900332045.1
  0.0157	2293	2293	subspecies	169997	                RS_GCF_001703535.1
  0.0002	27	27	subspecies	170009	                RS_GCF_001703515.1
  0.0000	1	1	subspecies	170016	                RS_GCF_002381265.1
  0.6666	97574	1237	family	95781	          f__Enterococcaceae
  0.3279	48001	2824	genus	95782	            g__Enterococcus_B
  0.0815	11936	8223	species	141514	              s__Enterococcus_B hirae
  0.0166	2425	2425	subspecies	141524	                RS_GCF_013391165.1
  0.0080	1167	1167	subspecies	141522	                RS_GCF_014218175.1
  0.0003	45	45	subspecies	141679	                RS_GCF_012222705.1
  0.0001	21	21	subspecies	141678	                RS_GCF_000271405.2
  0.0001	15	15	subspecies	141613	                RS_GCF_900636615.1
  0.0001	11	11	subspecies	141547	                RS_GCF_013391205.1
  0.0001	9	9	subspecies	141660	                RS_GCF_002278015.2
  0.0001	8	8	subspecies	141548	                RS_GCF_013391145.1
  0.0000	7	7	subspecies	141527	                RS_GCF_013391185.1
  0.0000	5	5	subspecies	141624	                RS_GCF_001641305.1
  0.0775	11340	10103	species	145929	              s__Enterococcus_B durans
  0.0063	915	915	subspecies	146005	                GB_GCA_005157865.1
  0.0013	197	197	subspecies	145960	                RS_GCF_001267865.1
  0.0003	48	48	subspecies	146044	                RS_GCF_002277935.1
  0.0003	40	40	subspecies	146025	                GB_GCA_902166615.1
  0.0001	15	15	subspecies	146006	                RS_GCF_902164665.1
  0.0001	13	13	subspecies	146049	                RS_GCF_001267395.1
  0.0000	7	7	subspecies	146018	                RS_GCF_007999025.2
  0.0000	2	2	subspecies	146042	                RS_GCF_007997775.1
  0.0757	11073	9418	species	179025	              s__Enterococcus_B pernyi
  0.0062	901	901	subspecies	179030	                RS_GCF_013394305.1
  0.0048	703	703	subspecies	179032	                RS_GCF_005158285.1
  0.0002	34	34	subspecies	179041	                RS_GCF_002216705.1
  0.0001	17	17	subspecies	179039	                RS_GCF_000504125.1
  0.0725	10614	7597	species	134929	              s__Enterococcus_B lactis
  0.0137	2009	2009	subspecies	134958	                RS_GCF_004006255.1
  0.0066	968	968	subspecies	134964	                GB_GCA_003711605.1
  0.0000	6	6	subspecies	134967	                RS_GCF_000737555.1
  0.0000	6	6	subspecies	134970	                RS_GCF_902166835.1
  0.0000	6	6	subspecies	135043	                RS_GCF_008000875.1
  0.0000	5	5	subspecies	135103	                RS_GCF_003269465.1
  0.0000	4	4	subspecies	134983	                RS_GCF_003574925.1
  0.0000	4	4	subspecies	135028	                RS_GCF_008000855.1
  0.0000	4	4	subspecies	135156	                RS_GCF_004103475.1
  0.0000	2	2	subspecies	135014	                RS_GCF_902166655.1
  0.0000	2	2	subspecies	135085	                RS_GCF_006337145.1
  0.0000	1	1	subspecies	135044	                GB_GCA_902166385.1
  0.0012	170	115	species	95783	              s__Enterococcus_B faecium
  0.0001	10	10	subspecies	97212	                RS_GCF_009734005.1
  0.0000	6	6	subspecies	96207	                RS_GCF_005166365.1
  0.0000	5	5	subspecies	96281	                RS_GCF_900066025.1
  0.0000	3	3	subspecies	96295	                RS_GCF_006741355.1
  0.0000	2	2	subspecies	95883	                RS_GCF_002850515.1
  0.0000	2	2	subspecies	97120	                GB_GCA_900094185.1
  0.0000	2	2	subspecies	97175	                RS_GCF_001587115.1
  0.0000	2	2	subspecies	97252	                RS_GCF_900638775.1
  0.0000	2	2	subspecies	96442	                RS_GCF_001720965.1
  0.0000	2	2	subspecies	96425	                RS_GCF_900639555.1
  0.0000	2	2	subspecies	96034	                RS_GCF_002024245.1
  0.0000	2	2	subspecies	95922	                RS_GCF_900637035.1
  0.0000	1	1	subspecies	97424	                GB_GCA_002761555.1
  0.0000	1	1	subspecies	97472	                RS_GCF_900639715.1
  0.0000	1	1	subspecies	97486	                RS_GCF_005952885.1
  0.0000	1	1	subspecies	97316	                RS_GCF_900638765.1
  0.0000	1	1	subspecies	95878	                RS_GCF_002831505.1
  0.0000	1	1	subspecies	97487	                RS_GCF_001895905.1
  0.0000	1	1	subspecies	96966	                RS_GCF_002025065.1
  0.0000	1	1	subspecies	96890	                RS_GCF_900639345.1
  0.0000	1	1	subspecies	96681	                RS_GCF_006280355.1
  0.0000	1	1	subspecies	96645	                RS_GCF_000174395.2
  0.0000	1	1	subspecies	96619	                RS_GCF_002983785.1
  0.0000	1	1	subspecies	96379	                RS_GCF_002025045.1
  0.0000	1	1	subspecies	96347	                RS_GCF_900638785.1
  0.0000	1	1	subspecies	96091	                RS_GCF_900683475.1
  0.0000	1	1	subspecies	95904	                GB_GCA_001594345.1
  0.0002	30	0	species	172641	              s__Enterococcus_B mundtii
  0.0002	30	30	subspecies	172660	                RS_GCF_002813755.1
  0.0001	13	0	species	239491	              s__Enterococcus_B mundtii_C
  0.0001	13	13	subspecies	239492	                RS_GCF_003957375.1
  0.0000	1	0	species	202992	              s__Enterococcus_B thailandicus
  0.0000	1	1	subspecies	202997	                RS_GCF_002290025.1
  0.1635	23932	2681	genus	156991	            g__Enterococcus_D
  0.0793	11612	8836	species	160394	              s__Enterococcus_D gallinarum
  0.0103	1504	1504	subspecies	160412	                RS_GCF_000448585.1
  0.0085	1242	1242	subspecies	160395	                RS_GCF_003812305.1
  0.0002	22	22	subspecies	160430	                RS_GCF_005843965.1
  0.0001	8	8	subspecies	160426	                RS_GCF_009730155.1
  0.0649	9493	1728	species	169430	              s__Enterococcus_D sp002850555
  0.0276	4037	4037	subspecies	169435	                RS_GCF_001558875.2
  0.0254	3725	3725	subspecies	169441	                GB_GCA_902166785.1
  0.0000	3	3	subspecies	169442	                RS_GCF_002850555.1
  0.0010	146	21	species	156992	              s__Enterococcus_D casseliflavus
  0.0005	80	80	subspecies	157015	                RS_GCF_002393265.1
  0.0002	29	29	subspecies	157042	                RS_GCF_009707345.1
  0.0001	15	15	subspecies	157041	                RS_GCF_003641225.1
  0.0000	1	1	subspecies	157031	                RS_GCF_000157355.2
  0.0840	12295	0	genus	176559	            g__Melissococcus
  0.0840	12295	12004	species	176560	              s__Melissococcus plutonius
  0.0016	230	230	subspecies	176563	                RS_GCF_004001205.1
  0.0002	32	32	subspecies	176574	                RS_GCF_000270185.1
  0.0001	14	14	subspecies	176579	                RS_GCF_000283975.1
  0.0000	7	7	subspecies	176578	                RS_GCF_000747585.1
  0.0000	6	6	subspecies	176562	                RS_GCF_009731445.1
  0.0000	2	2	subspecies	176572	                RS_GCF_003966875.1
  0.0827	12105	0	genus	160790	            g__Enterococcus_E
  0.0827	12105	7332	species	160791	              s__Enterococcus_E cecorum
  0.0220	3224	3224	subspecies	160798	                GB_GCA_001318365.1
  0.0098	1434	1434	subspecies	160801	                RS_GCF_001318405.1
  0.0007	101	101	subspecies	160824	                RS_GCF_900474605.1
  0.0001	9	9	subspecies	160808	                GB_GCA_001318325.1
  0.0000	5	5	subspecies	160828	                GB_GCA_001318175.1
  0.0000	4	0	genus	104550	            g__Enterococcus
  0.0000	4	3	species	104551	              s__Enterococcus faecalis
  0.0000	1	1	subspecies	105773	                RS_GCF_007632055.1
  0.0838	12269	0	family	166850	          f__Carnobacteriaceae
  0.0838	12269	0	genus	180962	            g__Dolosigranulum
  0.0838	12269	2235	species	180963	              s__Dolosigranulum pigrum
  0.0347	5081	5081	subspecies	180964	                RS_GCF_003263915.2
  0.0338	4941	4941	subspecies	180967	                RS_GCF_003264015.2
  0.0001	12	12	subspecies	180975	                RS_GCF_007197715.1
  0.0000	4	0	family	179846	          f__Aerococcaceae
  0.0000	4	0	genus	226766	            g__Jeotgalibaca
  0.0000	4	0	species	315228	              s__Jeotgalibaca ciconiae
  0.0000	4	4	subspecies	315229	                RS_GCF_003955755.1
  3.4401	503528	690	order	123658	        o__Bacillales
  1.3425	196504	0	family	123659	          f__Bacillaceae_G
  1.3425	196504	23575	genus	123660	            g__Bacillus_A
  0.0840	12290	7762	species	146416	              s__Bacillus_A pseudomycoides
  0.0200	2921	2921	subspecies	146449	                RS_GCF_000161455.1
  0.0103	1511	1511	subspecies	146448	                RS_GCF_000161415.1
  0.0003	47	47	subspecies	146470	                RS_GCF_000832885.1
  0.0002	28	28	subspecies	146526	                RS_GCF_000742855.1
  0.0001	21	21	subspecies	146468	                RS_GCF_000161435.1
  0.0836	12241	11922	species	153400	              s__Bacillus_A mycoides
  0.0008	121	121	subspecies	153423	                RS_GCF_000775975.1
  0.0002	34	34	subspecies	153420	                RS_GCF_000161095.1
  0.0002	30	30	subspecies	153448	                GB_GCA_004367995.1
  0.0002	29	29	subspecies	153429	                RS_GCF_008274925.1
  0.0002	26	26	subspecies	153433	                RS_GCF_002104575.1
  0.0002	24	24	subspecies	153455	                RS_GCF_000161335.1
  0.0002	23	23	subspecies	153474	                RS_GCF_000018825.1
  0.0002	22	22	subspecies	153430	                RS_GCF_000160975.1
  0.0000	7	7	subspecies	153426	                RS_GCF_000003925.1
  0.0000	3	3	subspecies	153424	                RS_GCF_000832605.1
  0.0836	12235	12076	species	180707	              s__Bacillus_A cytotoxicus
  0.0011	155	155	subspecies	180709	                RS_GCF_000017425.1
  0.0000	2	2	subspecies	180720	                RS_GCF_002250905.2
  0.0000	1	1	subspecies	180721	                RS_GCF_002250925.2
  0.0000	1	1	subspecies	180722	                RS_GCF_002250945.2
  0.0814	11908	10706	species	133927	              s__Bacillus_A toyonensis
  0.0053	780	780	subspecies	133934	                GB_GCA_009799785.1
  0.0018	268	268	subspecies	133937	                RS_GCF_000496285.1
  0.0004	55	55	subspecies	134059	                RS_GCF_002073415.2
  0.0001	21	21	subspecies	134105	                RS_GCF_000300475.1
  0.0001	19	19	subspecies	133983	                RS_GCF_000161215.1
  0.0001	19	19	subspecies	134025	                RS_GCF_000161295.1
  0.0001	17	17	subspecies	134018	                GB_GCA_003355115.1
  0.0001	16	16	subspecies	134177	                RS_GCF_000161155.1
  0.0000	7	7	subspecies	133953	                RS_GCF_008432245.1
  0.0805	11789	1714	species	137467	              s__Bacillus_A wiedmannii
  0.0357	5222	5222	subspecies	137523	                GB_GCA_003866015.1
  0.0330	4835	4835	subspecies	137519	                RS_GCF_000160955.1
  0.0001	18	18	subspecies	137591	                RS_GCF_008807735.1
  0.0794	11625	676	species	189511	              s__Bacillus_A luti
  0.0381	5576	5576	subspecies	189518	                RS_GCF_009739945.1
  0.0367	5373	5373	subspecies	189512	                GB_GCA_000160995.1
  0.0770	11269	6359	species	172049	              s__Bacillus_A albus
  0.0188	2748	2748	subspecies	172054	                RS_GCF_009740005.1
  0.0148	2162	2162	subspecies	172050	                RS_GCF_003966295.1
  0.0770	11265	10792	species	152786	              s__Bacillus_A nitratireducens
  0.0017	255	255	subspecies	152837	                RS_GCF_000161395.1
  0.0015	218	218	subspecies	152847	                RS_GCF_000003955.1
  0.0764	11177	7409	species	166580	              s__Bacillus_A mobilis
  0.0132	1927	1927	subspecies	166591	                RS_GCF_003612955.1
  0.0126	1841	1841	subspecies	166586	                RS_GCF_000161375.1
  0.0760	11127	9178	species	129137	              s__Bacillus_A anthracis
  0.0117	1707	1707	subspecies	129141	                RS_GCF_000161595.1
  0.0001	19	19	subspecies	129374	                RS_GCF_000161235.1
  0.0001	19	19	subspecies	129169	                RS_GCF_000143605.1
  0.0001	15	15	subspecies	129488	                RS_GCF_003410255.1
  0.0001	13	13	subspecies	129280	                RS_GCF_003410355.1
  0.0001	12	12	subspecies	129233	                RS_GCF_002192515.1
  0.0001	10	10	subspecies	129211	                RS_GCF_002833485.1
  0.0001	8	8	subspecies	129162	                RS_GCF_000239195.1
  0.0001	8	8	subspecies	129452	                GB_GCA_002005265.1
  0.0001	8	8	subspecies	129296	                RS_GCF_000832405.1
  0.0000	7	7	subspecies	129412	                RS_GCF_013267235.1
  0.0000	7	7	subspecies	129138	                RS_GCF_000022505.1
  0.0000	7	7	subspecies	129205	                GB_GCA_000006155.2
  0.0000	6	6	subspecies	129425	                RS_GCF_000011625.1
  0.0000	6	6	subspecies	129444	                RS_GCF_000833045.1
  0.0000	6	6	subspecies	129301	                RS_GCF_000161695.1
  0.0000	6	6	subspecies	129481	                RS_GCF_004801195.1
  0.0000	6	6	subspecies	129249	                RS_GCF_000160915.1
  0.0000	6	6	subspecies	129209	                RS_GCF_000161635.1
  0.0000	5	5	subspecies	129232	                RS_GCF_000161655.1
  0.0000	4	4	subspecies	129349	                RS_GCF_000161135.1
  0.0000	4	4	subspecies	129240	                GB_GCA_000747335.1
  0.0000	4	4	subspecies	129210	                RS_GCF_004328845.1
  0.0000	3	3	subspecies	129151	                RS_GCF_001941885.1
  0.0000	3	3	subspecies	129427	                RS_GCF_000832485.1
  0.0000	3	3	subspecies	129466	                RS_GCF_006742565.1
  0.0000	3	3	subspecies	129362	                RS_GCF_000021785.1
  0.0000	3	3	subspecies	129282	                RS_GCF_000833085.1
  0.0000	2	2	subspecies	129357	                RS_GCF_000832745.1
  0.0000	2	2	subspecies	129166	                RS_GCF_000742695.1
  0.0000	2	2	subspecies	129168	                GB_GCA_000747375.1
  0.0000	2	2	subspecies	129189	                RS_GCF_000832925.1
  0.0000	2	2	subspecies	129367	                RS_GCF_000559005.1
  0.0000	2	2	subspecies	129457	                RS_GCF_000832865.1
  0.0000	2	2	subspecies	129314	                RS_GCF_013349185.1
  0.0000	2	2	subspecies	129268	                RS_GCF_000742875.1
  0.0000	2	2	subspecies	129471	                RS_GCF_000742655.1
  0.0000	2	2	subspecies	129288	                RS_GCF_000832725.1
  0.0000	1	1	subspecies	129472	                RS_GCF_000832665.1
  0.0000	1	1	subspecies	129465	                RS_GCF_013267775.1
  0.0000	1	1	subspecies	129489	                RS_GCF_000832385.1
  0.0000	1	1	subspecies	129440	                RS_GCF_000258885.1
  0.0000	1	1	subspecies	129438	                RS_GCF_000832465.1
  0.0000	1	1	subspecies	129491	                RS_GCF_013349245.1
  0.0000	1	1	subspecies	129414	                RS_GCF_000725325.1
  0.0000	1	1	subspecies	129405	                RS_GCF_000021445.1
  0.0000	1	1	subspecies	129402	                RS_GCF_012273355.1
  0.0000	1	1	subspecies	129385	                RS_GCF_001941925.1
  0.0000	1	1	subspecies	129384	                RS_GCF_013267795.1
  0.0000	1	1	subspecies	129378	                RS_GCF_013343075.1
  0.0000	1	1	subspecies	129353	                RS_GCF_006088855.1
  0.0000	1	1	subspecies	129345	                RS_GCF_012273315.1
  0.0000	1	1	subspecies	129331	                RS_GCF_001936375.1
  0.0000	1	1	subspecies	129289	                RS_GCF_002277915.1
  0.0000	1	1	subspecies	129262	                RS_GCF_000008505.1
  0.0000	1	1	subspecies	129251	                RS_GCF_000832965.1
  0.0000	1	1	subspecies	129160	                RS_GCF_000832505.1
  0.0000	1	1	subspecies	129148	                RS_GCF_009806675.1
  0.0000	1	1	subspecies	129145	                RS_GCF_001683175.1
  0.0695	10180	5142	species	149106	              s__Bacillus_A tropicus
  0.0332	4860	4860	subspecies	149112	                RS_GCF_007363175.1
  0.0004	64	64	subspecies	149139	                RS_GCF_002117465.1
  0.0002	26	26	subspecies	149148	                RS_GCF_004322655.1
  0.0001	20	20	subspecies	149175	                GB_GCA_000161475.1
  0.0001	14	14	subspecies	149108	                RS_GCF_000832805.1
  0.0001	12	12	subspecies	149115	                RS_GCF_011040455.1
  0.0001	12	12	subspecies	149190	                GB_GCA_002504225.1
  0.0001	10	10	subspecies	149145	                RS_GCF_001880305.1
  0.0001	10	10	subspecies	149164	                RS_GCF_000789315.1
  0.0000	6	6	subspecies	149159	                RS_GCF_000832525.1
  0.0000	2	2	subspecies	149136	                RS_GCF_013331815.1
  0.0000	2	2	subspecies	149198	                RS_GCF_000161015.1
  0.0676	9892	9303	species	138967	              s__Bacillus_A paranthracis
  0.0014	201	201	subspecies	138971	                RS_GCF_010669045.1
  0.0006	92	92	subspecies	138977	                GB_GCA_002952815.1
  0.0003	40	40	subspecies	139097	                GB_GCA_002952795.1
  0.0002	33	33	subspecies	139040	                GB_GCA_000161075.1
  0.0002	26	26	subspecies	139109	                GB_GCA_009884335.1
  0.0002	22	22	subspecies	139004	                RS_GCF_000292415.1
  0.0001	20	20	subspecies	139118	                RS_GCF_000338315.1
  0.0001	18	18	subspecies	139154	                GB_GCA_000190515.1
  0.0001	17	17	subspecies	139026	                RS_GCF_002214725.1
  0.0001	17	17	subspecies	139079	                RS_GCF_001831375.1
  0.0001	15	15	subspecies	139071	                RS_GCF_000003645.1
  0.0001	14	14	subspecies	139029	                GB_GCA_009873395.1
  0.0001	14	14	subspecies	139052	                RS_GCF_000013065.1
  0.0001	14	14	subspecies	138981	                RS_GCF_009884315.1
  0.0001	13	13	subspecies	139086	                RS_GCF_000008005.1
  0.0001	12	12	subspecies	139078	                RS_GCF_005848985.1
  0.0001	9	9	subspecies	139067	                RS_GCF_002290105.1
  0.0000	6	6	subspecies	139113	                RS_GCF_009799965.1
  0.0000	3	3	subspecies	139011	                RS_GCF_003812125.1
  0.0000	2	2	subspecies	138998	                RS_GCF_009429005.1
  0.0000	1	1	subspecies	139018	                RS_GCF_009429025.1
  0.0673	9848	9208	species	137902	              s__Bacillus_A thuringiensis_S
  0.0030	436	436	subspecies	137903	                GB_GCA_000161535.1
  0.0004	60	60	subspecies	138029	                RS_GCF_000161715.1
  0.0003	41	41	subspecies	137913	                RS_GCF_000161735.1
  0.0002	23	23	subspecies	138046	                GB_GCA_009738575.1
  0.0001	21	21	subspecies	138107	                RS_GCF_000292455.1
  0.0001	10	10	subspecies	137957	                RS_GCF_001640965.1
  0.0001	9	9	subspecies	137991	                RS_GCF_004006495.1
  0.0001	9	9	subspecies	138083	                RS_GCF_002025105.1
  0.0000	7	7	subspecies	138002	                RS_GCF_000940785.1
  0.0000	7	7	subspecies	138103	                RS_GCF_005155285.1
  0.0000	5	5	subspecies	138098	                RS_GCF_000021305.1
  0.0000	3	3	subspecies	137976	                RS_GCF_004194475.2
  0.0000	3	3	subspecies	137956	                RS_GCF_013267295.1
  0.0000	1	1	subspecies	138015	                RS_GCF_004354265.1
  0.0000	1	1	subspecies	138024	                RS_GCF_009025915.1
  0.0000	1	1	subspecies	138041	                RS_GCF_000835025.1
  0.0000	1	1	subspecies	137919	                RS_GCF_000292705.1
  0.0000	1	1	subspecies	138064	                GB_GCA_003429245.1
  0.0000	1	1	subspecies	137915	                RS_GCF_001598095.1
  0.0602	8806	7713	species	135176	              s__Bacillus_A thuringiensis
  0.0054	787	787	subspecies	135182	                RS_GCF_009739925.1
  0.0005	69	69	subspecies	135270	                RS_GCF_001182785.1
  0.0004	57	57	subspecies	135282	                GB_GCA_002243685.1
  0.0002	36	36	subspecies	135190	                RS_GCF_000161495.1
  0.0002	26	26	subspecies	135340	                RS_GCF_002220285.1
  0.0001	21	21	subspecies	135222	                RS_GCF_002813875.1
  0.0001	21	21	subspecies	135234	                RS_GCF_001721165.1
  0.0001	14	14	subspecies	135313	                RS_GCF_001685565.1
  0.0001	12	12	subspecies	135418	                RS_GCF_000161615.1
  0.0001	10	10	subspecies	135200	                RS_GCF_001277915.1
  0.0001	10	10	subspecies	135232	                RS_GCF_000306745.1
  0.0001	8	8	subspecies	135291	                RS_GCF_000497525.1
  0.0001	8	8	subspecies	135316	                RS_GCF_000161515.1
  0.0000	7	7	subspecies	135202	                RS_GCF_003013315.1
  0.0000	6	6	subspecies	135371	                RS_GCF_009497015.2
  0.0000	1	1	subspecies	135238	                RS_GCF_000341665.1
  0.0601	8791	7333	species	177600	              s__Bacillus_A thuringiensis_K
  0.0085	1245	1245	subspecies	177606	                GB_GCA_001679765.1
  0.0009	125	125	subspecies	177603	                RS_GCF_001595725.1
  0.0004	65	65	subspecies	177617	                RS_GCF_000161675.1
  0.0001	21	21	subspecies	177616	                RS_GCF_006151925.1
  0.0000	2	2	subspecies	177612	                RS_GCF_003626955.1
  0.0557	8156	6287	species	138333	              s__Bacillus_A cereus
  0.0082	1196	1196	subspecies	138342	                RS_GCF_000021205.1
  0.0027	395	395	subspecies	138337	                RS_GCF_002214765.1
  0.0002	26	26	subspecies	138350	                RS_GCF_000161555.1
  0.0001	21	21	subspecies	138456	                RS_GCF_009739985.1
  0.0001	20	20	subspecies	138506	                GB_GCA_002117855.1
  0.0001	20	20	subspecies	138423	                RS_GCF_001635995.1
  0.0001	16	16	subspecies	138477	                RS_GCF_003568565.1
  0.0001	15	15	subspecies	138489	                RS_GCF_003054785.2
  0.0001	13	13	subspecies	138491	                RS_GCF_013340745.1
  0.0001	13	13	subspecies	138485	                RS_GCF_013112375.1
  0.0001	13	13	subspecies	138475	                RS_GCF_000161035.1
  0.0001	12	12	subspecies	138542	                RS_GCF_000161175.1
  0.0001	12	12	subspecies	138522	                RS_GCF_002224345.1
  0.0001	11	11	subspecies	138400	                RS_GCF_001548175.1
  0.0001	10	10	subspecies	138497	                RS_GCF_000161355.1
  0.0001	9	9	subspecies	138441	                RS_GCF_000007825.1
  0.0001	9	9	subspecies	138408	                RS_GCF_003020845.1
  0.0001	8	8	subspecies	138374	                RS_GCF_001721145.1
  0.0000	7	7	subspecies	138515	                RS_GCF_000161115.1
  0.0000	6	6	subspecies	138508	                RS_GCF_009224065.1
  0.0000	5	5	subspecies	138459	                RS_GCF_002214705.1
  0.0000	5	5	subspecies	138467	                RS_GCF_002173755.1
  0.0000	4	4	subspecies	138401	                RS_GCF_001518875.1
  0.0000	4	4	subspecies	138383	                RS_GCF_009861435.1
  0.0000	3	3	subspecies	138443	                RS_GCF_000978375.1
  0.0000	3	3	subspecies	138449	                RS_GCF_000161055.1
  0.0000	2	2	subspecies	138358	                RS_GCF_013394245.1
  0.0000	2	2	subspecies	138528	                RS_GCF_003991175.1
  0.0000	2	2	subspecies	138494	                GB_GCA_002504205.1
  0.0000	1	1	subspecies	138502	                RS_GCF_000092165.1
  0.0000	1	1	subspecies	138379	                RS_GCF_002216125.1
  0.0000	1	1	subspecies	138387	                RS_GCF_006094295.1
  0.0000	1	1	subspecies	138487	                RS_GCF_004771155.1
  0.0000	1	1	subspecies	138481	                RS_GCF_005707595.1
  0.0000	1	1	subspecies	138470	                RS_GCF_004799705.1
  0.0000	1	1	subspecies	138414	                RS_GCF_009739965.1
  0.0022	324	181	species	123661	              s__Bacillus_A bombysepticus
  0.0003	38	38	subspecies	124134	                RS_GCF_000160895.1
  0.0001	12	12	subspecies	123841	                RS_GCF_010223795.1
  0.0001	9	9	subspecies	123730	                RS_GCF_000161275.1
  0.0001	9	9	subspecies	123851	                RS_GCF_000635895.2
  0.0001	9	9	subspecies	123793	                GB_GCA_001675515.1
  0.0000	7	7	subspecies	123847	                RS_GCF_002184245.1
  0.0000	7	7	subspecies	123833	                RS_GCF_002222555.1
  0.0000	6	6	subspecies	123720	                RS_GCF_006384875.1
  0.0000	6	6	subspecies	123781	                GB_GCA_011405335.1
  0.0000	5	5	subspecies	123859	                RS_GCF_000803665.1
  0.0000	5	5	subspecies	123920	                RS_GCF_008274905.1
  0.0000	5	5	subspecies	123956	                RS_GCF_000161315.1
  0.0000	5	5	subspecies	124011	                RS_GCF_000160935.1
  0.0000	5	5	subspecies	123714	                RS_GCF_000831065.1
  0.0000	4	4	subspecies	123914	                RS_GCF_001816185.2
  0.0000	4	4	subspecies	123996	                RS_GCF_001692675.1
  0.0000	1	1	subspecies	123813	                RS_GCF_001017635.1
  0.0000	1	1	subspecies	123758	                RS_GCF_001183785.1
  0.0000	1	1	subspecies	123893	                RS_GCF_000747545.1
  0.0000	1	1	subspecies	123944	                GB_GCA_007923085.1
  0.0000	1	1	subspecies	123960	                RS_GCF_002215175.1
  0.0000	1	1	subspecies	124044	                RS_GCF_000161575.1
  0.0000	1	1	subspecies	124127	                RS_GCF_001618665.1
  0.0000	6	0	species	172446	              s__Bacillus_A thuringiensis_N
  0.0000	6	6	subspecies	172461	                RS_GCF_001455345.1
  1.2574	184047	18	family	126766	          f__Bacillaceae
  1.2573	184029	5071	genus	126767	            g__Bacillus
  0.0834	12210	9011	species	166343	              s__Bacillus atrophaeus
  0.0214	3128	3128	subspecies	166346	                RS_GCF_002688645.1
  0.0002	32	32	subspecies	166370	                RS_GCF_000385965.2
  0.0001	14	14	subspecies	166371	                RS_GCF_002173495.1
  0.0001	13	13	subspecies	166347	                GB_GCA_001597265.1
  0.0001	9	9	subspecies	166358	                RS_GCF_002243495.1
  0.0000	2	2	subspecies	166354	                RS_GCF_000165925.1
  0.0000	1	1	subspecies	166349	                RS_GCF_000742675.1
  0.0831	12158	10654	species	149495	              s__Bacillus altitudinis
  0.0092	1351	1351	subspecies	149509	                RS_GCF_002741745.1
  0.0003	46	46	subspecies	149579	                GB_GCA_002953695.1
  0.0001	12	12	subspecies	149521	                RS_GCF_007923025.1
  0.0001	12	12	subspecies	149533	                RS_GCF_002443015.2
  0.0001	10	10	subspecies	149581	                RS_GCF_006007905.1
  0.0001	8	8	subspecies	149515	                RS_GCF_011067205.1
  0.0001	8	8	subspecies	149516	                RS_GCF_001578165.1
  0.0001	8	8	subspecies	149525	                RS_GCF_004101925.1
  0.0001	8	8	subspecies	149537	                RS_GCF_013283915.1
  0.0001	8	8	subspecies	149569	                RS_GCF_000590455.1
  0.0000	6	6	subspecies	149504	                RS_GCF_001431145.1
  0.0000	6	6	subspecies	149527	                RS_GCF_001687085.1
  0.0000	5	5	subspecies	149583	                RS_GCF_005849435.1
  0.0000	3	3	subspecies	149564	                RS_GCF_004563755.2
  0.0000	3	3	subspecies	149576	                RS_GCF_013307105.1
  0.0000	3	3	subspecies	149513	                RS_GCF_000972685.1
  0.0000	2	2	subspecies	149567	                RS_GCF_001908475.1
  0.0000	2	2	subspecies	149578	                RS_GCF_001191605.1
  0.0000	2	2	subspecies	149514	                RS_GCF_001543165.1
  0.0000	1	1	subspecies	149534	                RS_GCF_001548215.1
  0.0831	12157	11912	species	128014	              s__Bacillus subtilis
  0.0005	68	68	subspecies	128018	                RS_GCF_009662155.1
  0.0002	28	28	subspecies	128113	                GB_GCA_003265285.1
  0.0001	16	16	subspecies	128042	                RS_GCF_002893805.1
  0.0001	8	8	subspecies	128289	                RS_GCF_002201875.1
  0.0000	7	7	subspecies	128117	                RS_GCF_009913595.1
  0.0000	7	7	subspecies	128199	                GB_GCA_001596535.1
  0.0000	6	6	subspecies	128218	                RS_GCF_000227485.1
  0.0000	5	5	subspecies	128068	                RS_GCF_009913275.1
  0.0000	5	5	subspecies	128115	                RS_GCF_000259365.1
  0.0000	4	4	subspecies	128241	                RS_GCF_004119775.1
  0.0000	4	4	subspecies	128207	                RS_GCF_000321395.1
  0.0000	4	4	subspecies	128277	                GB_GCA_012534935.1
  0.0000	4	4	subspecies	128176	                RS_GCF_003665215.1
  0.0000	3	3	subspecies	128268	                GB_GCA_003515125.1
  0.0000	3	3	subspecies	128390	                RS_GCF_001015095.1
  0.0000	3	3	subspecies	128208	                RS_GCF_009913255.1
  0.0000	3	3	subspecies	128369	                RS_GCF_001719185.1
  0.0000	3	3	subspecies	128015	                RS_GCF_012648205.1
  0.0000	3	3	subspecies	128193	                RS_GCF_004103595.1
  0.0000	3	3	subspecies	128167	                RS_GCF_014298115.1
  0.0000	3	3	subspecies	128158	                RS_GCF_001697265.1
  0.0000	3	3	subspecies	128126	                RS_GCF_003665235.1
  0.0000	3	3	subspecies	128081	                RS_GCF_009497795.1
  0.0000	3	3	subspecies	128084	                RS_GCF_011456075.1
  0.0000	2	2	subspecies	128026	                RS_GCF_002142595.1
  0.0000	2	2	subspecies	128272	                RS_GCF_004119655.1
  0.0000	2	2	subspecies	128263	                RS_GCF_009914705.1
  0.0000	2	2	subspecies	128313	                RS_GCF_000338735.1
  0.0000	2	2	subspecies	128237	                RS_GCF_009913555.1
  0.0000	2	2	subspecies	128318	                RS_GCF_005160425.1
  0.0000	2	2	subspecies	128336	                RS_GCF_009866865.1
  0.0000	2	2	subspecies	128346	                RS_GCF_004328925.1
  0.0000	2	2	subspecies	128385	                RS_GCF_004101565.1
  0.0000	1	1	subspecies	128321	                RS_GCF_002220075.1
  0.0000	1	1	subspecies	128319	                RS_GCF_002290305.1
  0.0000	1	1	subspecies	128362	                RS_GCF_005234095.1
  0.0000	1	1	subspecies	128316	                RS_GCF_011765645.1
  0.0000	1	1	subspecies	128043	                RS_GCF_001902555.1
  0.0000	1	1	subspecies	128297	                RS_GCF_000953615.1
  0.0000	1	1	subspecies	128291	                RS_GCF_005849145.1
  0.0000	1	1	subspecies	128290	                RS_GCF_004119615.1
  0.0000	1	1	subspecies	128044	                RS_GCF_002201955.1
  0.0000	1	1	subspecies	128052	                RS_GCF_009363835.1
  0.0000	1	1	subspecies	128059	                GB_GCA_003324735.1
  0.0000	1	1	subspecies	128226	                RS_GCF_002269195.1
  0.0000	1	1	subspecies	128152	                RS_GCF_004103555.1
  0.0000	1	1	subspecies	128164	                RS_GCF_004119535.1
  0.0000	1	1	subspecies	128151	                RS_GCF_002269175.1
  0.0000	1	1	subspecies	128118	                RS_GCF_000877815.1
  0.0000	1	1	subspecies	128112	                RS_GCF_001746575.1
  0.0000	1	1	subspecies	128091	                RS_GCF_001808235.1
  0.0000	1	1	subspecies	128215	                RS_GCF_004101405.1
  0.0000	1	1	subspecies	128220	                RS_GCF_001720505.1
  0.0000	1	1	subspecies	128275	                RS_GCF_000186085.1
  0.0000	1	1	subspecies	128240	                RS_GCF_000782835.1
  0.0000	1	1	subspecies	128073	                RS_GCF_009497815.1
  0.0000	1	1	subspecies	128250	                RS_GCF_000155325.1
  0.0000	1	1	subspecies	128258	                RS_GCF_003665275.1
  0.0000	1	1	subspecies	128264	                RS_GCF_003665195.1
  0.0000	1	1	subspecies	128156	                RS_GCF_000349795.1
  0.0000	1	1	subspecies	128270	                RS_GCF_002201995.1
  0.0829	12131	7640	species	143384	              s__Bacillus pumilus
  0.0153	2243	2243	subspecies	143391	                RS_GCF_000017885.4
  0.0148	2168	2168	subspecies	143392	                RS_GCF_001704975.1
  0.0002	22	22	subspecies	143450	                RS_GCF_009937765.1
  0.0001	15	15	subspecies	143425	                RS_GCF_900186955.1
  0.0001	12	12	subspecies	143456	                RS_GCF_013423765.1
  0.0001	10	10	subspecies	143492	                RS_GCF_001578205.1
  0.0001	10	10	subspecies	143515	                RS_GCF_014489355.1
  0.0001	9	9	subspecies	143482	                RS_GCF_004006455.1
  0.0000	2	2	subspecies	143422	                RS_GCF_003571425.1
  0.0829	12127	3754	species	205027	              s__Bacillus vallismortis
  0.0291	4253	4253	subspecies	205028	                RS_GCF_004116955.1
  0.0281	4120	4120	subspecies	205032	                RS_GCF_003667885.1
  0.0826	12085	1738	species	154364	              s__Bacillus safensis
  0.0368	5388	5388	subspecies	154373	                RS_GCF_000800825.1
  0.0337	4935	4935	subspecies	154374	                RS_GCF_001938665.1
  0.0001	9	9	subspecies	154392	                RS_GCF_001938705.1
  0.0000	6	6	subspecies	154393	                RS_GCF_003097715.1
  0.0000	3	3	subspecies	154398	                RS_GCF_008244765.1
  0.0000	3	3	subspecies	154407	                GB_GCA_003660145.1
  0.0000	2	2	subspecies	154408	                RS_GCF_001938685.1
  0.0000	1	1	subspecies	154397	                RS_GCF_001895885.1
  0.0823	12047	8056	species	180483	              s__Bacillus inaquosorum
  0.0265	3885	3885	subspecies	180492	                RS_GCF_003148415.1
  0.0005	68	68	subspecies	180489	                RS_GCF_013393725.1
  0.0002	23	23	subspecies	180498	                RS_GCF_012647565.1
  0.0001	15	15	subspecies	180496	                RS_GCF_002163815.1
  0.0823	12039	6000	species	195888	              s__Bacillus glycinifermentans
  0.0401	5863	5863	subspecies	195891	                RS_GCF_002443095.1
  0.0012	174	174	subspecies	195893	                RS_GCF_900093775.1
  0.0000	2	2	subspecies	195895	                RS_GCF_004103615.1
  0.0822	12030	5996	species	219497	              s__Bacillus xiamenensis
  0.0208	3044	3044	subspecies	219500	                RS_GCF_001857925.1
  0.0204	2990	2990	subspecies	219499	                RS_GCF_009759805.1
  0.0818	11967	8293	species	168287	              s__Bacillus intestinalis
  0.0245	3590	3590	subspecies	168293	                RS_GCF_001889625.1
  0.0005	67	67	subspecies	168289	                RS_GCF_000959025.1
  0.0001	15	15	subspecies	168315	                RS_GCF_000227465.1
  0.0000	2	2	subspecies	168313	                RS_GCF_000146565.1
  0.0817	11964	9587	species	172811	              s__Bacillus halotolerans
  0.0085	1241	1241	subspecies	172818	                RS_GCF_013347105.1
  0.0073	1070	1070	subspecies	172816	                RS_GCF_004006435.1
  0.0002	33	33	subspecies	172829	                RS_GCF_014250375.1
  0.0001	17	17	subspecies	172819	                RS_GCF_006965425.1
  0.0001	16	16	subspecies	172823	                RS_GCF_014621755.1
  0.0804	11766	11290	species	140582	              s__Bacillus licheniformis
  0.0016	230	230	subspecies	140583	                RS_GCF_004101525.1
  0.0008	113	113	subspecies	140591	                RS_GCF_002074075.1
  0.0004	59	59	subspecies	140702	                RS_GCF_003606405.1
  0.0002	28	28	subspecies	140741	                RS_GCF_006974025.1
  0.0000	7	7	subspecies	140666	                RS_GCF_002074095.1
  0.0000	4	4	subspecies	140592	                RS_GCF_002174255.1
  0.0000	4	4	subspecies	140604	                RS_GCF_002074115.1
  0.0000	4	4	subspecies	140746	                GB_GCA_900637645.1
  0.0000	4	4	subspecies	140739	                RS_GCF_004526275.1
  0.0000	3	3	subspecies	140706	                RS_GCF_004119795.1
  0.0000	3	3	subspecies	140745	                RS_GCF_000258125.2
  0.0000	3	3	subspecies	140639	                RS_GCF_006494795.1
  0.0000	2	2	subspecies	140635	                RS_GCF_001726125.1
  0.0000	2	2	subspecies	140750	                RS_GCF_001914255.1
  0.0000	2	2	subspecies	140758	                RS_GCF_014250415.1
  0.0000	1	1	subspecies	140694	                RS_GCF_009662395.1
  0.0000	1	1	subspecies	140720	                RS_GCF_004119755.1
  0.0000	1	1	subspecies	140730	                RS_GCF_002269275.1
  0.0000	1	1	subspecies	140732	                RS_GCF_001596055.1
  0.0000	1	1	subspecies	140676	                RS_GCF_004103575.1
  0.0000	1	1	subspecies	140648	                RS_GCF_001896025.1
  0.0000	1	1	subspecies	140747	                RS_GCF_002504325.1
  0.0000	1	1	subspecies	140751	                RS_GCF_002966955.1
  0.0798	11683	9513	species	151976	              s__Bacillus paralicheniformis
  0.0101	1478	1478	subspecies	151985	                RS_GCF_002993925.1
  0.0042	619	619	subspecies	151977	                RS_GCF_000876525.1
  0.0003	43	43	subspecies	152037	                RS_GCF_011068305.1
  0.0001	11	11	subspecies	152008	                RS_GCF_002993945.1
  0.0001	9	9	subspecies	152051	                RS_GCF_900635765.1
  0.0001	8	8	subspecies	152039	                RS_GCF_002393225.1
  0.0000	2	2	subspecies	151995	                RS_GCF_002068155.1
  0.0775	11342	11206	species	170517	              s__Bacillus amyloliquefaciens
  0.0003	42	42	subspecies	170518	                RS_GCF_000221645.1
  0.0002	36	36	subspecies	170531	                RS_GCF_001705195.1
  0.0001	19	19	subspecies	170523	                RS_GCF_003868675.1
  0.0001	18	18	subspecies	170525	                RS_GCF_002209305.1
  0.0001	15	15	subspecies	170522	                RS_GCF_000195515.1
  0.0000	2	2	subspecies	170529	                RS_GCF_002173635.1
  0.0000	2	2	subspecies	170533	                RS_GCF_013328835.1
  0.0000	2	2	subspecies	170539	                RS_GCF_000204275.1
  0.0755	11049	10574	species	189413	              s__Bacillus siamensis
  0.0020	294	294	subspecies	189422	                RS_GCF_001553895.1
  0.0012	181	181	subspecies	189414	                RS_GCF_002850535.1
  0.0013	184	91	species	126768	              s__Bacillus velezensis
  0.0001	18	18	subspecies	126914	                RS_GCF_009856975.1
  0.0001	11	11	subspecies	127152	                RS_GCF_001857985.1
  0.0000	6	6	subspecies	126942	                RS_GCF_002944585.1
  0.0000	4	4	subspecies	126966	                RS_GCF_003854915.1
  0.0000	4	4	subspecies	127044	                RS_GCF_003184945.1
  0.0000	3	3	subspecies	127159	                RS_GCF_009789615.1
  0.0000	3	3	subspecies	127070	                RS_GCF_000493375.1
  0.0000	2	2	subspecies	126986	                RS_GCF_009906915.1
  0.0000	2	2	subspecies	126795	                RS_GCF_014048385.1
  0.0000	2	2	subspecies	126946	                RS_GCF_002243325.2
  0.0000	2	2	subspecies	126944	                RS_GCF_012226065.1
  0.0000	2	2	subspecies	126905	                RS_GCF_013201465.1
  0.0000	2	2	subspecies	127094	                GB_GCA_002763555.1
  0.0000	2	2	subspecies	126875	                RS_GCF_004135455.2
  0.0000	2	2	subspecies	127158	                GB_GCA_002795885.1
  0.0000	1	1	subspecies	127072	                RS_GCF_000835145.1
  0.0000	1	1	subspecies	127064	                RS_GCF_000685725.1
  0.0000	1	1	subspecies	127059	                RS_GCF_009931675.1
  0.0000	1	1	subspecies	127049	                RS_GCF_002201935.1
  0.0000	1	1	subspecies	127099	                RS_GCF_002005345.1
  0.0000	1	1	subspecies	127154	                RS_GCF_000815275.2
  0.0000	1	1	subspecies	127162	                GB_GCA_001634675.1
  0.0000	1	1	subspecies	127172	                RS_GCF_008824205.1
  0.0000	1	1	subspecies	127015	                GB_GCA_002201975.1
  0.0000	1	1	subspecies	127012	                RS_GCF_003432425.1
  0.0000	1	1	subspecies	126956	                RS_GCF_001023595.1
  0.0000	1	1	subspecies	126899	                RS_GCF_001483885.1
  0.0000	1	1	subspecies	126800	                RS_GCF_002290045.1
  0.0000	1	1	subspecies	126806	                RS_GCF_001752685.2
  0.0000	1	1	subspecies	126820	                GB_GCA_008245105.1
  0.0000	1	1	subspecies	126841	                RS_GCF_003312895.1
  0.0000	1	1	subspecies	126858	                RS_GCF_002968415.1
  0.0000	1	1	subspecies	126864	                RS_GCF_002741705.1
  0.0000	1	1	subspecies	126891	                RS_GCF_000875875.2
  0.0000	1	1	subspecies	126892	                RS_GCF_013694265.1
  0.0000	1	1	subspecies	126985	                RS_GCF_003071465.1
  0.0000	1	1	subspecies	126917	                RS_GCF_013875015.1
  0.0000	1	1	subspecies	126921	                RS_GCF_003149715.1
  0.0000	1	1	subspecies	126935	                RS_GCF_003667745.1
  0.0000	1	1	subspecies	126941	                RS_GCF_001854345.1
  0.0000	1	1	subspecies	126953	                RS_GCF_009913495.1
  0.0000	1	1	subspecies	126967	                RS_GCF_002764075.1
  0.0000	1	1	subspecies	126969	                RS_GCF_002310315.1
  0.0001	13	0	species	204241	              s__Bacillus haynesii
  0.0001	13	13	subspecies	204244	                RS_GCF_014042035.1
  0.0000	3	0	species	192000	              s__Bacillus sonorensis
  0.0000	3	3	subspecies	192008	                RS_GCF_002202015.1
  0.0000	3	0	species	215726	              s__Bacillus mojavensis
  0.0000	3	3	subspecies	215729	                RS_GCF_012648005.1
  0.5861	85791	1823	family	169168	          f__Anoxybacillaceae
  0.3269	47855	9874	genus	169169	            g__Geobacillus
  0.0816	11945	8923	species	185731	              s__Geobacillus thermodenitrificans
  0.0126	1843	1843	subspecies	185739	                RS_GCF_002072065.1
  0.0079	1155	1155	subspecies	185740	                RS_GCF_002706565.1
  0.0001	14	14	subspecies	185741	                RS_GCF_000015745.1
  0.0001	10	10	subspecies	185742	                RS_GCF_002119625.1
  0.0730	10685	6073	species	211177	              s__Geobacillus subterraneus
  0.0159	2330	2330	subspecies	211178	                RS_GCF_012295505.1
  0.0156	2282	2282	subspecies	211179	                RS_GCF_001618685.1
  0.0507	7428	580	species	198583	              s__Geobacillus zalihae
  0.0278	4075	4075	subspecies	198590	                RS_GCF_001592395.1
  0.0189	2773	2773	subspecies	198587	                RS_GCF_000336445.1
  0.0503	7368	1983	species	225842	              s__Geobacillus lituanicus
  0.0187	2732	2732	subspecies	225843	                RS_GCF_009914195.1
  0.0178	2605	2605	subspecies	225844	                GB_GCA_002243605.1
  0.0003	48	48	subspecies	225845	                GB_GCA_001191625.1
  0.0032	463	227	species	169170	              s__Geobacillus thermoleovorans
  0.0003	48	48	subspecies	169180	                RS_GCF_003595605.1
  0.0003	43	43	subspecies	169181	                RS_GCF_000092445.1
  0.0002	32	32	subspecies	169188	                RS_GCF_001274575.1
  0.0002	23	23	subspecies	169194	                RS_GCF_001719205.1
  0.0002	22	22	subspecies	169187	                RS_GCF_000024705.1
  0.0001	17	17	subspecies	169177	                RS_GCF_003182675.2
  0.0001	15	15	subspecies	169190	                RS_GCF_000009785.1
  0.0001	14	14	subspecies	169195	                RS_GCF_005160065.1
  0.0001	12	12	subspecies	169191	                RS_GCF_001610955.1
  0.0000	7	7	subspecies	169192	                RS_GCF_000174795.2
  0.0000	3	3	subspecies	169175	                RS_GCF_000236605.1
  0.0003	43	0	species	177345	              s__Geobacillus stearothermophilus
  0.0003	43	43	subspecies	177353	                RS_GCF_002300135.1
  0.0002	25	0	species	200248	              s__Geobacillus thermocatenulatus
  0.0002	25	25	subspecies	200249	                RS_GCF_002243665.1
  0.0001	17	0	species	228699	              s__Geobacillus thermophilus
  0.0001	17	17	subspecies	228702	                GB_GCA_001028085.1
  0.0000	4	0	species	305139	              s__Geobacillus sp000445995
  0.0000	4	4	subspecies	305140	                RS_GCF_000445995.2
  0.0000	3	0	species	208840	              s__Geobacillus icigianus
  0.0000	3	3	subspecies	208843	                RS_GCF_011405175.1
  0.1664	24356	729	genus	194074	            g__Anoxybacillus
  0.0814	11912	3626	species	201619	              s__Anoxybacillus gonensis
  0.0283	4147	4147	subspecies	201624	                RS_GCF_001187595.1
  0.0283	4139	4139	subspecies	201623	                RS_GCF_000283415.2
  0.0798	11679	3174	species	212406	              s__Anoxybacillus flavithermus
  0.0291	4262	4262	subspecies	212409	                GB_GCA_002243705.1
  0.0290	4243	4243	subspecies	212408	                RS_GCF_000019045.1
  0.0002	36	6	species	197187	              s__Anoxybacillus flavithermus_G
  0.0001	17	17	subspecies	197189	                RS_GCF_004116995.1
  0.0001	13	13	subspecies	197192	                RS_GCF_002197485.1
  0.0803	11755	62	genus	179741	            g__Parageobacillus
  0.0798	11684	4054	species	183825	              s__Parageobacillus toebii
  0.0274	4005	4005	subspecies	183828	                RS_GCF_003688615.2
  0.0246	3606	3606	subspecies	183827	                RS_GCF_007197795.1
  0.0001	19	19	subspecies	183835	                RS_GCF_000023385.1
  0.0001	9	4	species	179742	              s__Parageobacillus thermoglucosidasius
  0.0000	4	4	subspecies	179750	                RS_GCF_000178395.2
  0.0000	1	1	subspecies	179752	                RS_GCF_001700985.1
  0.0000	2	0	genus	200082	            g__Anoxybacillus_A
  0.0000	2	2	species	200083	              s__Anoxybacillus_A rupiensis
  0.1673	24488	0	family	144649	          f__Bacillaceae_H
  0.1673	24488	693	genus	144650	            g__Priestia
  0.0830	12155	4023	species	183623	              s__Priestia flexa
  0.0281	4120	4120	subspecies	183624	                RS_GCF_002024265.1
  0.0274	4012	4012	subspecies	183626	                RS_GCF_005577315.1
  0.0791	11572	6915	species	167311	              s__Priestia megaterium_A
  0.0186	2717	2717	subspecies	167319	                RS_GCF_000225265.1
  0.0129	1891	1891	subspecies	167313	                RS_GCF_002688605.1
  0.0002	22	22	subspecies	167336	                GB_GCA_007923065.1
  0.0001	21	21	subspecies	167341	                RS_GCF_001050455.1
  0.0000	6	6	subspecies	167335	                RS_GCF_009497655.1
  0.0004	63	29	species	144651	              s__Priestia megaterium
  0.0001	15	15	subspecies	144780	                RS_GCF_011058275.1
  0.0001	11	11	subspecies	144710	                GB_GCA_002872495.3
  0.0000	2	2	subspecies	144689	                RS_GCF_000025825.1
  0.0000	2	2	subspecies	144723	                RS_GCF_000025805.1
  0.0000	2	2	subspecies	144762	                RS_GCF_000334875.3
  0.0000	1	1	subspecies	144750	                RS_GCF_002009195.1
  0.0000	1	1	subspecies	144775	                RS_GCF_000832985.1
  0.0000	5	0	species	188824	              s__Priestia aryabhattai
  0.0000	5	5	subspecies	188834	                GB_GCA_003351965.1
  0.0820	12008	0	family	188112	          f__Aeribacillaceae
  0.0820	12008	0	genus	188113	            g__Aeribacillus
  0.0820	12008	2282	species	188114	              s__Aeribacillus composti
  0.0334	4892	4892	subspecies	188120	                GB_GCA_011404955.1
  0.0330	4834	4834	subspecies	188121	                RS_GCF_002243625.1
  2.6882	393472	203	order	140961	        o__Mycoplasmatales
  1.2602	184462	29	family	149685	          f__Metamycoplasmataceae
  0.4199	61464	203	genus	186759	            g__Mycoplasmopsis_A
  0.0840	12295	2204	species	253925	              s__Mycoplasmopsis_A nasistruthionis
  0.0348	5089	5089	subspecies	253926	                RS_GCF_006228185.1
  0.0342	5002	5002	subspecies	253927	                GB_GCA_006494695.1
  0.0838	12265	11976	species	224231	              s__Mycoplasmopsis_A anatis
  0.0013	189	189	subspecies	224234	                RS_GCF_900660655.1
  0.0007	100	100	subspecies	224232	                RS_GCF_003285065.1
  0.0837	12256	4870	species	226343	              s__Mycoplasmopsis_A bovirhinis
  0.0262	3840	3840	subspecies	226345	                RS_GCF_003609735.1
  0.0237	3475	3475	subspecies	226344	                RS_GCF_900660515.1
  0.0005	71	71	subspecies	226346	                RS_GCF_002688685.1
  0.0836	12230	5923	species	194093	              s__Mycoplasmopsis_A canis
  0.0385	5632	5632	subspecies	194096	                RS_GCF_000988065.1
  0.0042	614	614	subspecies	194099	                RS_GCF_900660585.1
  0.0004	61	61	subspecies	194101	                RS_GCF_001553195.1
  0.0833	12186	567	species	243478	              s__Mycoplasmopsis_A anserisalpingitidis
  0.0397	5818	5818	subspecies	243479	                RS_GCF_007858515.1
  0.0396	5801	5801	subspecies	243480	                RS_GCF_007859615.1
  0.0001	16	0	species	265111	              s__Mycoplasmopsis_A anserisalpingitidis_A
  0.0001	16	16	subspecies	265112	                RS_GCF_007858495.1
  0.0001	9	0	species	320103	              s__Mycoplasmopsis_A edwardii
  0.0001	9	9	subspecies	320104	                RS_GCF_900476105.1
  0.0000	3	2	species	190497	              s__Mycoplasmopsis_A synoviae
  0.0000	1	1	subspecies	190504	                RS_GCF_000008245.1
  0.0000	1	0	species	275530	              s__Mycoplasmopsis_A gallinacea_A
  0.0000	1	1	subspecies	275531	                RS_GCF_012220205.1
  0.3361	49189	62	genus	149686	            g__Mycoplasmopsis
  0.0840	12297	11081	species	205171	              s__Mycoplasmopsis fermentans
  0.0046	669	669	subspecies	205173	                RS_GCF_000209735.1
  0.0028	414	414	subspecies	205172	                RS_GCF_000186005.1
  0.0009	133	133	subspecies	205175	                RS_GCF_000148625.1
  0.0840	12290	12093	species	197429	              s__Mycoplasmopsis californica
  0.0012	178	178	subspecies	197433	                RS_GCF_000695835.1
  0.0001	10	10	subspecies	197431	                RS_GCF_003925975.1
  0.0000	7	7	subspecies	197430	                RS_GCF_003925935.1
  0.0000	2	2	subspecies	197432	                RS_GCF_003967215.1
  0.0839	12284	82	species	219622	              s__Mycoplasmopsis bovigenitalium
  0.0417	6103	6103	subspecies	219624	                RS_GCF_900660525.1
  0.0417	6099	6099	subspecies	219623	                RS_GCF_002356075.1
  0.0837	12250	9203	species	204151	              s__Mycoplasmopsis agalactiae
  0.0107	1568	1568	subspecies	204154	                RS_GCF_000063605.1
  0.0094	1373	1373	subspecies	204155	                RS_GCF_900088695.1
  0.0007	106	106	subspecies	204156	                RS_GCF_000089865.1
  0.0000	5	4	species	149687	              s__Mycoplasmopsis bovis
  0.0000	1	1	subspecies	149701	                GB_GCA_013423725.1
  0.0000	1	0	species	316409	              s__Mycoplasmopsis sp013008635
  0.0000	1	1	subspecies	316410	                RS_GCF_013008635.1
  0.2521	36900	32	genus	164522	            g__Metamycoplasma
  0.0840	12298	11785	species	236354	              s__Metamycoplasma arthritidis
  0.0022	326	326	subspecies	236356	                RS_GCF_000020065.1
  0.0013	187	187	subspecies	236355	                RS_GCF_900660715.1
  0.0840	12291	12220	species	231046	              s__Metamycoplasma cloacale
  0.0005	67	67	subspecies	231048	                RS_GCF_900660735.1
  0.0000	4	4	subspecies	231047	                RS_GCF_003269445.1
  0.0838	12271	1587	species	200288	              s__Metamycoplasma arginini
  0.0367	5365	5365	subspecies	200294	                RS_GCF_900660725.1
  0.0363	5319	5319	subspecies	200291	                RS_GCF_001547975.1
  0.0000	3	0	species	232122	              s__Metamycoplasma anseris
  0.0000	3	3	subspecies	232123	                RS_GCF_003285045.1
  0.0000	2	0	species	221986	              s__Metamycoplasma alkalescens
  0.0000	2	2	subspecies	221988	                RS_GCF_900476125.1
  0.0000	1	1	species	164523	              s__Metamycoplasma hominis
  0.0000	1	0	species	242312	              s__Metamycoplasma struthionis
  0.0000	1	1	subspecies	242314	                RS_GCF_003855455.1
  0.0000	1	0	species	260860	              s__Metamycoplasma canadense
  0.0000	1	1	subspecies	260861	                RS_GCF_000828855.1
  0.1680	24597	128	genus	172665	            g__Mesomycoplasma
  0.0840	12300	7222	species	229251	              s__Mesomycoplasma dispar
  0.0346	5069	5069	subspecies	229252	                RS_GCF_002736285.1
  0.0000	5	5	subspecies	229253	                RS_GCF_000941075.1
  0.0000	4	4	subspecies	229254	                RS_GCF_900660505.1
  0.0830	12149	11496	species	176395	              s__Mesomycoplasma hyorhinis
  0.0020	296	296	subspecies	176402	                RS_GCF_000211295.1
  0.0007	104	104	subspecies	176400	                GB_GCA_900660475.1
  0.0005	79	79	subspecies	176407	                RS_GCF_000145705.1
  0.0005	69	69	subspecies	176404	                GB_GCA_007924005.1
  0.0004	54	54	subspecies	176410	                RS_GCF_000313635.1
  0.0003	37	37	subspecies	176411	                GB_GCA_900476065.1
  0.0000	7	7	subspecies	176405	                RS_GCF_001705605.1
  0.0000	7	7	subspecies	176412	                RS_GCF_000496815.1
  0.0001	13	2	species	172666	              s__Mesomycoplasma hyopneumoniae
  0.0000	4	4	subspecies	172667	                RS_GCF_013402755.1
  0.0000	3	3	subspecies	172680	                RS_GCF_000427215.1
  0.0000	2	2	subspecies	172673	                RS_GCF_007923985.1
  0.0000	1	1	subspecies	172682	                RS_GCF_000008205.1
  0.0000	1	1	subspecies	172686	                RS_GCF_002257505.1
  0.0000	6	0	species	197413	              s__Mesomycoplasma ovipneumoniae
  0.0000	6	6	subspecies	197418	                RS_GCF_900660625.1
  0.0000	1	0	species	304011	              s__Mesomycoplasma sp012516495
  0.0000	1	1	subspecies	304012	                RS_GCF_012516495.1
  0.0839	12283	0	genus	252165	            g__Mycoplasmopsis_B
  0.0839	12283	9052	species	252166	              s__Mycoplasmopsis_B pulmonis
  0.0115	1679	1679	subspecies	252167	                RS_GCF_000195875.1
  0.0106	1552	1552	subspecies	252168	                RS_GCF_900660575.1
  1.0912	159713	8	family	168907	          f__Mycoplasmataceae
  0.3361	49197	352	genus	191989	            g__Spiroplasma
  0.0839	12283	12179	species	253528	              s__Spiroplasma eriocheiris
  0.0004	55	55	subspecies	253530	                RS_GCF_001029265.1
  0.0003	49	49	subspecies	253529	                RS_GCF_002028345.1
  0.0838	12266	12252	species	253014	              s__Spiroplasma sp001886495
  0.0000	7	7	subspecies	253015	                RS_GCF_001886495.1
  0.0000	7	7	subspecies	253016	                RS_GCF_001792795.1
  0.0838	12261	11968	species	225081	              s__Spiroplasma mirum
  0.0011	166	166	subspecies	225083	                RS_GCF_001029245.1
  0.0008	122	122	subspecies	225082	                RS_GCF_000565195.1
  0.0000	5	5	subspecies	225084	                RS_GCF_000517365.1
  0.0808	11832	84	species	220826	              s__Spiroplasma phoeniceum
  0.0409	5988	5988	subspecies	220828	                RS_GCF_001274875.1
  0.0394	5760	5760	subspecies	220827	                RS_GCF_003339775.1
  0.0014	200	162	species	191990	              s__Spiroplasma citri
  0.0001	13	13	subspecies	191996	                RS_GCF_013113755.1
  0.0001	8	8	subspecies	191993	                RS_GCF_010587105.1
  0.0000	6	6	subspecies	191995	                RS_GCF_007993715.1
  0.0000	6	6	subspecies	191999	                RS_GCF_010587305.1
  0.0000	3	3	subspecies	191992	                RS_GCF_010587255.1
  0.0000	2	2	subspecies	191997	                RS_GCF_010587175.1
  0.0000	3	0	species	208070	              s__Spiroplasma poulsonii
  0.0000	3	3	subspecies	208073	                RS_GCF_009866525.1
  0.3348	49009	1545	genus	168908	            g__Mycoplasma
  0.0839	12285	8223	species	221563	              s__Mycoplasma putrefaciens
  0.0276	4045	4045	subspecies	221564	                RS_GCF_000376625.1
  0.0001	17	17	subspecies	221565	                RS_GCF_000224105.1
  0.0826	12097	11180	species	170357	              s__Mycoplasma capri
  0.0044	643	643	subspecies	170379	                RS_GCF_000253075.1
  0.0006	91	91	subspecies	170358	                RS_GCF_900489525.1
  0.0004	52	52	subspecies	170359	                RS_GCF_000023165.1
  0.0002	35	35	subspecies	170365	                RS_GCF_900489625.1
  0.0001	16	16	subspecies	170363	                RS_GCF_900489565.1
  0.0001	16	16	subspecies	170364	                RS_GCF_900489595.1
  0.0001	12	12	subspecies	170372	                RS_GCF_900489795.1
  0.0000	7	7	subspecies	170361	                RS_GCF_900489665.1
  0.0000	7	7	subspecies	170373	                RS_GCF_900489545.1
  0.0000	7	7	subspecies	170360	                RS_GCF_900489825.1
  0.0000	7	7	subspecies	170381	                RS_GCF_900489655.1
  0.0000	6	6	subspecies	170382	                RS_GCF_900489515.1
  0.0000	4	4	subspecies	170374	                RS_GCF_900489725.1
  0.0000	4	4	subspecies	170376	                RS_GCF_900489555.1
  0.0000	4	4	subspecies	170378	                RS_GCF_900489785.1
  0.0000	4	4	subspecies	170380	                RS_GCF_900489685.1
  0.0000	2	2	subspecies	170369	                RS_GCF_900489575.1
  0.0787	11525	11095	species	176601	              s__Mycoplasma mycoides
  0.0012	179	179	subspecies	176604	                RS_GCF_001554055.1
  0.0009	134	134	subspecies	176605	                RS_GCF_000800785.1
  0.0003	51	51	subspecies	176607	                RS_GCF_001554095.1
  0.0002	25	25	subspecies	176615	                RS_GCF_001554115.1
  0.0001	17	17	subspecies	176620	                GB_GCA_000011445.1
  0.0001	14	14	subspecies	176616	                RS_GCF_000143865.1
  0.0000	4	4	subspecies	176613	                RS_GCF_001554155.1
  0.0000	4	4	subspecies	176618	                RS_GCF_001554075.1
  0.0000	2	2	subspecies	176611	                RS_GCF_001564435.1
  0.0782	11452	9845	species	225376	              s__Mycoplasma leachii
  0.0057	830	830	subspecies	225379	                RS_GCF_000253095.1
  0.0053	777	777	subspecies	225377	                RS_GCF_000183365.1
  0.0007	105	31	species	168909	              s__Mycoplasma capricolum
  0.0004	63	63	subspecies	168914	                RS_GCF_000012765.1
  0.0000	3	3	subspecies	168918	                RS_GCF_000192395.2
  0.0000	3	3	subspecies	168922	                RS_GCF_011464035.1
  0.0000	3	3	subspecies	168933	                RS_GCF_002009215.1
  0.0000	1	1	subspecies	168917	                RS_GCF_011464015.1
  0.0000	1	1	subspecies	168935	                RS_GCF_011464075.1
  0.2521	36899	1994	genus	187675	            g__Mesoplasma
  0.0795	11639	730	species	219852	              s__Mesoplasma grammopterae
  0.0374	5476	5476	subspecies	219854	                RS_GCF_002999275.1
  0.0371	5433	5433	subspecies	219855	                RS_GCF_002999415.1
  0.0792	11599	6737	species	223164	              s__Mesoplasma entomophilum
  0.0330	4834	4834	subspecies	223165	                RS_GCF_002999315.1
  0.0002	28	28	subspecies	223166	                RS_GCF_002804125.1
  0.0790	11561	6951	species	218935	              s__Mesoplasma coleopterae
  0.0173	2530	2530	subspecies	218937	                RS_GCF_002999395.1
  0.0140	2052	2052	subspecies	218936	                RS_GCF_002804245.1
  0.0002	28	28	subspecies	218938	                RS_GCF_002999455.1
  0.0007	101	73	species	187676	              s__Mesoplasma florum
  0.0001	12	12	subspecies	187683	                RS_GCF_002999295.1
  0.0000	6	6	subspecies	187685	                RS_GCF_002504385.1
  0.0000	5	5	subspecies	187678	                RS_GCF_002999255.1
  0.0000	3	3	subspecies	187686	                RS_GCF_002999435.1
  0.0000	2	2	subspecies	187679	                RS_GCF_000008305.1
  0.0000	5	0	species	319551	              s__Mesoplasma tabanidae
  0.0000	5	5	subspecies	319552	                RS_GCF_002804025.1
  0.0840	12300	0	genus	236104	            g__Edwardiiplasma
  0.0840	12300	12261	species	236105	              s__Edwardiiplasma lactucae
  0.0002	23	23	subspecies	236107	                RS_GCF_002804225.1
  0.0001	16	16	subspecies	236106	                RS_GCF_002441935.1
  0.0840	12300	15	genus	239905	            g__Spiroplasma_A
  0.0839	12285	12243	species	248522	              s__Spiroplasma_A turonicum
  0.0002	26	26	subspecies	248524	                RS_GCF_001262715.1
  0.0001	16	16	subspecies	248523	                RS_GCF_001513715.1
  0.3354	49094	7	family	140962	          f__Mycoplasmoidaceae
  0.1676	24537	48	genus	140963	            g__Mycoplasmoides
  0.0840	12289	10623	species	200832	              s__Mycoplasmoides genitalium
  0.0071	1046	1046	subspecies	200835	                RS_GCF_000292485.1
  0.0038	560	560	subspecies	200834	                RS_GCF_000027325.1
  0.0002	22	22	subspecies	200836	                RS_GCF_000292445.1
  0.0002	22	22	subspecies	200838	                RS_GCF_000292405.1
  0.0001	16	16	subspecies	200837	                RS_GCF_000292505.1
  0.0834	12200	11860	species	169373	              s__Mycoplasmoides gallisepticum
  0.0008	112	112	subspecies	169374	                RS_GCF_000286755.1
  0.0003	51	51	subspecies	169400	                RS_GCF_008728895.1
  0.0003	44	44	subspecies	169380	                RS_GCF_008728935.1
  0.0002	34	34	subspecies	169394	                RS_GCF_000211545.4
  0.0002	30	30	subspecies	169393	                RS_GCF_008728915.1
  0.0001	21	21	subspecies	169375	                RS_GCF_000025365.1
  0.0001	16	16	subspecies	169399	                RS_GCF_900476085.1
  0.0001	10	10	subspecies	169383	                RS_GCF_000286735.1
  0.0000	7	7	subspecies	169384	                RS_GCF_000286815.1
  0.0000	6	6	subspecies	169379	                RS_GCF_000286795.1
  0.0000	4	4	subspecies	169382	                RS_GCF_000286695.1
  0.0000	3	3	subspecies	169388	                RS_GCF_000286775.1
  0.0000	1	1	subspecies	169390	                RS_GCF_000092585.1
  0.0000	1	1	subspecies	169395	                RS_GCF_000025385.1
  0.0840	12291	364	genus	178647	            g__Ureaplasma
  0.0811	11874	11558	species	183210	              s__Ureaplasma parvum
  0.0014	202	202	subspecies	183211	                RS_GCF_002205515.1
  0.0002	27	27	subspecies	183220	                RS_GCF_002205575.1
  0.0002	23	23	subspecies	183216	                RS_GCF_006716515.1
  0.0001	17	17	subspecies	183223	                RS_GCF_002205595.1
  0.0001	16	16	subspecies	183213	                RS_GCF_000019345.1
  0.0001	11	11	subspecies	183217	                RS_GCF_000828735.1
  0.0001	10	10	subspecies	183218	                RS_GCF_002205735.1
  0.0000	6	6	subspecies	183219	                RS_GCF_003953005.1
  0.0000	2	2	subspecies	183214	                RS_GCF_000006625.1
  0.0000	2	2	subspecies	183215	                RS_GCF_002205535.1
  0.0004	53	20	species	178648	              s__Ureaplasma urealyticum
  0.0001	19	19	subspecies	178657	                RS_GCF_000021265.1
  0.0001	9	9	subspecies	178661	                RS_GCF_006716625.1
  0.0000	5	5	subspecies	178663	                RS_GCF_006777105.1
  0.0838	12259	0	genus	231531	            g__Malacoplasma_A
  0.0838	12259	6892	species	250860	              s__Malacoplasma_A girerdii
  0.0184	2686	2686	subspecies	250862	                GB_GCA_002215425.1
  0.0183	2681	2681	subspecies	250861	                GB_GCA_000770195.1
  2.2604	330861	64	order	22786	        o__Staphylococcales
  2.1781	318806	348	family	22787	          f__Staphylococcaceae
  2.0921	306216	5754	genus	22788	            g__Staphylococcus
  0.0836	12236	12173	species	153475	              s__Staphylococcus simulans
  0.0001	18	18	subspecies	153486	                RS_GCF_003096155.1
  0.0001	12	12	subspecies	153512	                RS_GCF_900636345.2
  0.0001	10	10	subspecies	153494	                RS_GCF_900240105.1
  0.0001	10	10	subspecies	153521	                RS_GCF_003006075.1
  0.0000	6	6	subspecies	153548	                RS_GCF_002386185.1
  0.0000	4	4	subspecies	153505	                RS_GCF_001559115.2
  0.0000	1	1	subspecies	153476	                RS_GCF_003006055.1
  0.0000	1	1	subspecies	153492	                RS_GCF_003076375.1
  0.0000	1	1	subspecies	153499	                RS_GCF_900474685.1
  0.0836	12230	9126	species	163357	              s__Staphylococcus xylosus
  0.0141	2065	2065	subspecies	163377	                RS_GCF_007814625.1
  0.0061	900	900	subspecies	163366	                RS_GCF_002078255.1
  0.0005	72	72	subspecies	163386	                RS_GCF_900240095.1
  0.0002	27	27	subspecies	163391	                RS_GCF_000953575.1
  0.0001	21	21	subspecies	163383	                RS_GCF_000709415.1
  0.0001	12	12	subspecies	163395	                RS_GCF_014267365.1
  0.0000	7	7	subspecies	163397	                RS_GCF_000706685.1
  0.0834	12200	12104	species	214525	              s__Staphylococcus muscae
  0.0004	54	54	subspecies	214529	                RS_GCF_900187005.1
  0.0003	42	42	subspecies	214527	                RS_GCF_003019275.1
  0.0831	12168	12132	species	191924	              s__Staphylococcus condimenti
  0.0001	21	21	subspecies	191927	                RS_GCF_001618885.1
  0.0001	14	14	subspecies	191932	                RS_GCF_001922405.1
  0.0000	1	1	subspecies	191925	                RS_GCF_900637235.1
  0.0831	12159	5965	species	162557	              s__Staphylococcus equorum
  0.0392	5745	5745	subspecies	162559	                RS_GCF_001682235.1
  0.0027	400	400	subspecies	162562	                RS_GCF_001663395.1
  0.0002	24	24	subspecies	162598	                RS_GCF_001432245.1
  0.0001	18	18	subspecies	162597	                RS_GCF_009834585.1
  0.0000	7	7	subspecies	162577	                RS_GCF_001683315.1
  0.0830	12152	11467	species	184285	              s__Staphylococcus nepalensis
  0.0025	369	369	subspecies	184286	                RS_GCF_002442895.1
  0.0021	301	301	subspecies	184289	                RS_GCF_002442935.1
  0.0001	15	15	subspecies	184297	                RS_GCF_003097555.1
  0.0830	12145	7143	species	189719	              s__Staphylococcus carnosus
  0.0171	2504	2504	subspecies	189726	                RS_GCF_000009405.1
  0.0171	2498	2498	subspecies	189728	                RS_GCF_001701005.1
  0.0828	12125	8846	species	148296	              s__Staphylococcus chromogenes
  0.0122	1791	1791	subspecies	148317	                RS_GCF_011466875.1
  0.0093	1360	1360	subspecies	148338	                RS_GCF_007814525.1
  0.0006	90	90	subspecies	148359	                GB_GCA_007813835.1
  0.0003	38	38	subspecies	148339	                GB_GCA_007814955.1
  0.0827	12107	11604	species	119809	              s__Staphylococcus epidermidis
  0.0020	298	298	subspecies	119823	                GB_GCA_000934225.1
  0.0003	41	41	subspecies	120230	                RS_GCF_900638695.1
  0.0001	20	20	subspecies	120460	                RS_GCF_009769125.1
  0.0001	18	18	subspecies	120482	                RS_GCF_900086615.2
  0.0001	15	15	subspecies	120103	                RS_GCF_011307235.1
  0.0001	13	13	subspecies	119834	                RS_GCF_011307695.1
  0.0001	12	12	subspecies	120431	                GB_GCA_003119275.1
  0.0001	8	8	subspecies	120227	                RS_GCF_014334295.1
  0.0000	6	6	subspecies	120548	                RS_GCF_001956655.1
  0.0000	6	6	subspecies	120026	                RS_GCF_002215535.1
  0.0000	6	6	subspecies	120297	                RS_GCF_003856455.1
  0.0000	5	5	subspecies	120668	                RS_GCF_014489335.1
  0.0000	5	5	subspecies	120543	                RS_GCF_011307475.1
  0.0000	5	5	subspecies	120221	                RS_GCF_002954055.1
  0.0000	4	4	subspecies	120028	                RS_GCF_000751035.1
  0.0000	4	4	subspecies	120244	                RS_GCF_902509505.1
  0.0000	3	3	subspecies	120084	                RS_GCF_011307715.1
  0.0000	3	3	subspecies	119893	                RS_GCF_006337185.1
  0.0000	3	3	subspecies	120476	                RS_GCF_011306775.1
  0.0000	3	3	subspecies	120473	                RS_GCF_902509535.1
  0.0000	3	3	subspecies	120183	                RS_GCF_000759555.1
  0.0000	3	3	subspecies	120105	                RS_GCF_009769015.1
  0.0000	3	3	subspecies	120096	                RS_GCF_902509515.1
  0.0000	2	2	subspecies	120367	                RS_GCF_011307015.1
  0.0000	2	2	subspecies	120333	                RS_GCF_003325735.1
  0.0000	2	2	subspecies	120478	                RS_GCF_006337225.1
  0.0000	2	2	subspecies	120491	                RS_GCF_902509485.1
  0.0000	2	2	subspecies	120510	                RS_GCF_002749515.1
  0.0000	2	2	subspecies	120102	                RS_GCF_009873455.1
  0.0000	1	1	subspecies	120413	                RS_GCF_002749455.1
  0.0000	1	1	subspecies	119928	                RS_GCF_013317125.1
  0.0000	1	1	subspecies	120123	                RS_GCF_009685135.1
  0.0000	1	1	subspecies	120051	                RS_GCF_902509495.1
  0.0827	12107	8731	species	162981	              s__Staphylococcus agnetis
  0.0116	1693	1693	subspecies	162998	                RS_GCF_011466855.1
  0.0114	1671	1671	subspecies	163011	                RS_GCF_001442815.2
  0.0001	12	12	subspecies	163020	                RS_GCF_007814015.1
  0.0823	12048	12048	species	191256	              s__Staphylococcus hyicus
  0.0823	12045	11819	species	155492	              s__Staphylococcus lugdunensis
  0.0008	118	118	subspecies	155493	                RS_GCF_011403135.1
  0.0001	18	18	subspecies	155498	                RS_GCF_002096975.1
  0.0001	18	18	subspecies	155558	                RS_GCF_009931395.1
  0.0001	18	18	subspecies	155554	                RS_GCF_001558815.2
  0.0001	11	11	subspecies	155527	                GB_GCA_002096135.1
  0.0000	7	7	subspecies	155508	                RS_GCF_002097035.1
  0.0000	5	5	subspecies	155511	                RS_GCF_000270465.1
  0.0000	5	5	subspecies	155547	                RS_GCF_900474705.1
  0.0000	4	4	subspecies	155529	                RS_GCF_000025085.1
  0.0000	4	4	subspecies	155505	                RS_GCF_008728735.1
  0.0000	4	4	subspecies	155500	                RS_GCF_002096115.1
  0.0000	3	3	subspecies	155510	                RS_GCF_008728755.1
  0.0000	3	3	subspecies	155528	                RS_GCF_002104555.1
  0.0000	3	3	subspecies	155541	                RS_GCF_002096155.1
  0.0000	2	2	subspecies	155513	                RS_GCF_002591215.1
  0.0000	2	2	subspecies	155533	                RS_GCF_008728775.1
  0.0000	1	1	subspecies	155534	                RS_GCF_008728815.1
  0.0822	12032	10729	species	144252	              s__Staphylococcus saprophyticus
  0.0077	1126	1126	subspecies	144269	                RS_GCF_007814115.1
  0.0007	97	97	subspecies	144265	                RS_GCF_013341435.1
  0.0001	19	19	subspecies	144381	                RS_GCF_900240075.1
  0.0001	16	16	subspecies	144284	                RS_GCF_013341415.1
  0.0001	14	14	subspecies	144302	                RS_GCF_013358365.1
  0.0000	7	7	subspecies	144270	                RS_GCF_002208905.1
  0.0000	5	5	subspecies	144293	                RS_GCF_013341395.1
  0.0000	5	5	subspecies	144360	                RS_GCF_900635295.1
  0.0000	5	5	subspecies	144362	                RS_GCF_001558375.2
  0.0000	5	5	subspecies	144372	                RS_GCF_013343055.1
  0.0000	2	2	subspecies	144337	                RS_GCF_013341455.1
  0.0000	1	1	subspecies	144287	                RS_GCF_006094355.1
  0.0000	1	1	subspecies	144336	                RS_GCF_000010125.1
  0.0822	12029	5607	species	145676	              s__Staphylococcus capitis
  0.0234	3430	3430	subspecies	145709	                RS_GCF_001028645.1
  0.0199	2914	2914	subspecies	145692	                RS_GCF_002591175.1
  0.0004	55	55	subspecies	145780	                RS_GCF_013267675.1
  0.0002	23	23	subspecies	145721	                RS_GCF_002356175.1
  0.0820	11998	4243	species	171752	              s__Staphylococcus pasteuri_A
  0.0267	3915	3915	subspecies	171775	                RS_GCF_002442915.1
  0.0262	3840	3840	subspecies	171769	                RS_GCF_007814825.1
  0.0819	11995	10362	species	157483	              s__Staphylococcus warneri
  0.0058	850	850	subspecies	157491	                RS_GCF_900636255.1
  0.0031	448	448	subspecies	157488	                RS_GCF_003691405.1
  0.0020	295	295	subspecies	157518	                RS_GCF_014495745.1
  0.0001	13	13	subspecies	157536	                GB_GCA_007814275.1
  0.0001	10	10	subspecies	157533	                RS_GCF_900636265.1
  0.0000	4	4	subspecies	157526	                GB_GCA_007833855.1
  0.0000	4	4	subspecies	157527	                RS_GCF_900636385.1
  0.0000	3	3	subspecies	157497	                RS_GCF_003571725.1
  0.0000	3	3	subspecies	157523	                RS_GCF_013137955.1
  0.0000	2	2	subspecies	157524	                RS_GCF_000494875.1
  0.0000	1	1	subspecies	157510	                GB_GCA_004117035.1
  0.0818	11977	7517	species	177790	              s__Staphylococcus coagulans
  0.0298	4356	4356	subspecies	177792	                RS_GCF_001548255.1
  0.0006	86	86	subspecies	177794	                RS_GCF_001188895.1
  0.0001	17	17	subspecies	177795	                RS_GCF_001188855.1
  0.0000	1	1	subspecies	177807	                RS_GCF_001188875.1
  0.0817	11959	9531	species	129839	              s__Staphylococcus haemolyticus
  0.0104	1527	1527	subspecies	129842	                GB_GCA_012955505.1
  0.0058	845	845	subspecies	129925	                RS_GCF_001611955.1
  0.0001	15	15	subspecies	130175	                GB_GCA_000972725.1
  0.0001	10	10	subspecies	130060	                RS_GCF_900240195.1
  0.0001	10	10	subspecies	130165	                RS_GCF_003596365.3
  0.0001	9	9	subspecies	130081	                RS_GCF_005706435.1
  0.0000	6	6	subspecies	129935	                RS_GCF_006094395.1
  0.0000	4	4	subspecies	130061	                RS_GCF_003956005.1
  0.0000	2	2	subspecies	130118	                RS_GCF_000009865.1
  0.0815	11926	10731	species	133152	              s__Staphylococcus pseudintermedius
  0.0054	789	789	subspecies	133163	                RS_GCF_004794845.2
  0.0022	328	328	subspecies	133168	                RS_GCF_004794825.2
  0.0001	9	9	subspecies	133363	                RS_GCF_002950775.1
  0.0001	8	8	subspecies	133173	                RS_GCF_001682335.1
  0.0000	7	7	subspecies	133305	                RS_GCF_004307395.1
  0.0000	7	7	subspecies	133386	                GB_GCA_001685665.2
  0.0000	7	7	subspecies	133335	                RS_GCF_004794835.2
  0.0000	7	7	subspecies	133289	                RS_GCF_004794815.2
  0.0000	7	7	subspecies	133177	                RS_GCF_004001305.1
  0.0000	6	6	subspecies	133250	                RS_GCF_004307375.1
  0.0000	6	6	subspecies	133391	                RS_GCF_004307335.1
  0.0000	3	3	subspecies	133227	                RS_GCF_000185885.1
  0.0000	3	3	subspecies	133204	                RS_GCF_004307355.1
  0.0000	3	3	subspecies	133388	                RS_GCF_004794855.2
  0.0000	2	2	subspecies	133409	                RS_GCF_014490535.1
  0.0000	1	1	subspecies	133294	                RS_GCF_001682435.2
  0.0000	1	1	subspecies	133347	                RS_GCF_900636355.2
  0.0000	1	1	subspecies	133385	                RS_GCF_000189495.1
  0.0814	11909	8954	species	142902	              s__Staphylococcus hominis
  0.0097	1423	1423	subspecies	142917	                RS_GCF_013364435.1
  0.0091	1329	1329	subspecies	142918	                RS_GCF_013267575.1
  0.0011	158	158	subspecies	143064	                RS_GCF_002850375.1
  0.0001	12	12	subspecies	142923	                RS_GCF_009730135.1
  0.0000	7	7	subspecies	142961	                RS_GCF_002954105.1
  0.0000	7	7	subspecies	142982	                RS_GCF_007814725.1
  0.0000	6	6	subspecies	142938	                RS_GCF_012273435.1
  0.0000	6	6	subspecies	143014	                RS_GCF_009730115.1
  0.0000	5	5	subspecies	143022	                RS_GCF_003812505.1
  0.0000	2	2	subspecies	142962	                RS_GCF_900240155.1
  0.0810	11858	11415	species	179982	              s__Staphylococcus caprae
  0.0025	372	372	subspecies	179985	                RS_GCF_007814385.1
  0.0003	41	41	subspecies	179994	                RS_GCF_012851115.1
  0.0002	28	28	subspecies	179987	                RS_GCF_003966625.1
  0.0000	2	2	subspecies	179990	                RS_GCF_003966585.1
  0.0809	11841	3969	species	175158	              s__Staphylococcus warneri_A
  0.0269	3939	3939	subspecies	175172	                RS_GCF_003491325.1
  0.0269	3933	3933	subspecies	175175	                RS_GCF_013267715.1
  0.0803	11747	9557	species	166275	              s__Staphylococcus urealyticus
  0.0088	1295	1295	subspecies	166303	                RS_GCF_013349225.1
  0.0054	794	794	subspecies	166283	                RS_GCF_002984565.1
  0.0007	101	101	subspecies	166307	                GB_GCA_001990205.1
  0.0797	11663	8604	species	143832	              s__Staphylococcus argenteus
  0.0197	2883	2883	subspecies	143860	                RS_GCF_000236925.1
  0.0012	175	175	subspecies	143883	                RS_GCF_001891145.1
  0.0000	1	1	subspecies	143887	                RS_GCF_007859575.1
  0.0787	11521	11309	species	163063	              s__Staphylococcus cohnii
  0.0009	137	137	subspecies	163086	                RS_GCF_003956025.1
  0.0005	75	75	subspecies	163066	                RS_GCF_900240165.1
  0.0017	247	137	species	22789	              s__Staphylococcus aureus
  0.0001	14	14	subspecies	32730	                RS_GCF_001465635.1
  0.0001	8	8	subspecies	33460	                RS_GCF_000144955.1
  0.0000	6	6	subspecies	28867	                RS_GCF_002850395.1
  0.0000	5	5	subspecies	24034	                RS_GCF_013836525.1
  0.0000	5	5	subspecies	32999	                GB_GCA_900155335.1
  0.0000	4	4	subspecies	30807	                RS_GCF_014334495.1
  0.0000	4	4	subspecies	34387	                RS_GCF_001465755.1
  0.0000	3	3	subspecies	25640	                RS_GCF_014334615.1
  0.0000	3	3	subspecies	28640	                RS_GCF_000009585.1
  0.0000	3	3	subspecies	27802	                GB_GCA_009883695.1
  0.0000	3	3	subspecies	29471	                RS_GCF_013389715.1
  0.0000	3	3	subspecies	25126	                RS_GCF_009912475.1
  0.0000	3	3	subspecies	29529	                RS_GCF_014334475.1
  0.0000	3	3	subspecies	34189	                RS_GCF_900474695.1
  0.0000	2	2	subspecies	25937	                RS_GCF_003193745.1
  0.0000	2	2	subspecies	24947	                RS_GCF_003111745.1
  0.0000	2	2	subspecies	34532	                RS_GCF_013363895.1
  0.0000	2	2	subspecies	27843	                RS_GCF_008330585.1
  0.0000	2	2	subspecies	23105	                GB_GCA_013415975.1
  0.0000	1	1	subspecies	30580	                RS_GCF_003031485.1
  0.0000	1	1	subspecies	32036	                GB_GCA_003827835.1
  0.0000	1	1	subspecies	32064	                RS_GCF_013836745.1
  0.0000	1	1	subspecies	34665	                RS_GCF_002356655.1
  0.0000	1	1	subspecies	32193	                RS_GCF_900096745.1
  0.0000	1	1	subspecies	32267	                RS_GCF_007726325.1
  0.0000	1	1	subspecies	32541	                RS_GCF_900607255.1
  0.0000	1	1	subspecies	33316	                RS_GCF_001986135.1
  0.0000	1	1	subspecies	33560	                RS_GCF_000009005.1
  0.0000	1	1	subspecies	33853	                RS_GCF_002204555.1
  0.0000	1	1	subspecies	34064	                RS_GCF_002633805.1
  0.0000	1	1	subspecies	34600	                RS_GCF_009912835.1
  0.0000	1	1	subspecies	22891	                GB_GCA_009883675.1
  0.0000	1	1	subspecies	26674	                GB_GCA_009259725.1
  0.0000	1	1	subspecies	23164	                RS_GCF_002803885.1
  0.0000	1	1	subspecies	23559	                RS_GCF_001021895.1
  0.0000	1	1	subspecies	23673	                GB_GCA_900636395.1
  0.0000	1	1	subspecies	23742	                RS_GCF_002140115.1
  0.0000	1	1	subspecies	24241	                RS_GCF_014334575.1
  0.0000	1	1	subspecies	24737	                RS_GCF_009684655.1
  0.0000	1	1	subspecies	25177	                RS_GCF_003193765.1
  0.0000	1	1	subspecies	26012	                RS_GCF_005153985.1
  0.0000	1	1	subspecies	26275	                RS_GCF_001444345.1
  0.0000	1	1	subspecies	30408	                RS_GCF_002895385.1
  0.0000	1	1	subspecies	26985	                RS_GCF_005889995.1
  0.0000	1	1	subspecies	27473	                RS_GCF_004153365.1
  0.0000	1	1	subspecies	27744	                RS_GCF_001580515.1
  0.0000	1	1	subspecies	28211	                RS_GCF_900607295.1
  0.0000	1	1	subspecies	28712	                RS_GCF_003029665.1
  0.0000	1	1	subspecies	28909	                RS_GCF_009912195.1
  0.0000	1	1	subspecies	29100	                RS_GCF_011035105.1
  0.0000	1	1	subspecies	29581	                RS_GCF_007185035.1
  0.0000	1	1	subspecies	30316	                RS_GCF_900324235.1
  0.0001	20	0	species	194972	              s__Staphylococcus schleiferi
  0.0001	20	20	subspecies	194974	                RS_GCF_009730555.1
  0.0000	5	0	species	172954	              s__Staphylococcus delphini
  0.0000	5	5	subspecies	172961	                RS_GCF_900636325.1
  0.0000	5	0	species	192792	              s__Staphylococcus schweitzeri
  0.0000	5	5	subspecies	192795	                RS_GCF_900636685.1
  0.0000	3	0	species	242520	              s__Staphylococcus lutrae
  0.0000	3	3	subspecies	242522	                RS_GCF_002101335.1
  0.0000	1	0	species	266741	              s__Staphylococcus sp013463155
  0.0000	1	1	subspecies	266742	                RS_GCF_013463155.1
  0.0000	1	0	species	284202	              s__Staphylococcus sp010365305
  0.0000	1	1	subspecies	284203	                RS_GCF_010365305.1
  0.0000	1	0	species	227289	              s__Staphylococcus piscifermentans
  0.0000	1	1	subspecies	227291	                RS_GCF_900186985.1
  0.0000	1	0	species	176234	              s__Staphylococcus pettenkoferi
  0.0000	1	1	subspecies	176243	                RS_GCF_002208805.2
  0.0000	1	0	species	168849	              s__Staphylococcus arlettae
  0.0000	1	1	subspecies	168861	                RS_GCF_006741705.1
  0.0836	12237	52	genus	159569	            g__Macrococcus_B
  0.0832	12178	4680	species	185126	              s__Macrococcus_B canis
  0.0329	4816	4816	subspecies	185128	                RS_GCF_011064785.1
  0.0181	2642	2642	subspecies	185132	                RS_GCF_005706215.1
  0.0002	23	23	subspecies	185135	                RS_GCF_011065325.1
  0.0001	17	17	subspecies	185137	                RS_GCF_014524485.1
  0.0000	7	5	species	159570	              s__Macrococcus_B caseolyticus
  0.0000	1	1	subspecies	159590	                RS_GCF_000010585.1
  0.0000	1	1	subspecies	159595	                RS_GCF_002119825.1
  0.0000	5	0	genus	156163	            g__Staphylococcus_A
  0.0000	4	0	species	156164	              s__Staphylococcus_A sciuri
  0.0000	3	3	subspecies	156171	                RS_GCF_009259665.1
  0.0000	1	1	subspecies	156208	                GB_GCA_002072755.1
  0.0000	1	0	species	186823	              s__Staphylococcus_A lentus
  0.0000	1	1	subspecies	186834	                RS_GCF_014070215.1
  0.0819	11991	0	family	203205	          f__Gemellaceae
  0.0819	11991	3	genus	203206	            g__Gemella
  0.0819	11987	10058	species	226318	              s__Gemella massiliensis
  0.0070	1028	1028	subspecies	226320	                RS_GCF_001553915.1
  0.0062	901	901	subspecies	226319	                RS_GCF_003351945.1
  0.0000	1	0	species	225348	              s__Gemella morbillorum
  0.0000	1	1	subspecies	225350	                RS_GCF_009730315.1
  0.5881	86087	0	order	163773	        o__Paenibacillales
  0.5881	86087	93	family	163774	          f__Paenibacillaceae
  0.5035	73694	888	genus	163775	            g__Paenibacillus
  0.0837	12256	6309	species	166646	              s__Paenibacillus odorifer
  0.0406	5947	5947	subspecies	166669	                RS_GCF_000758725.1
  0.0836	12232	2799	species	211837	              s__Paenibacillus kribbensis
  0.0325	4751	4751	subspecies	211840	                RS_GCF_013394225.1
  0.0320	4682	4682	subspecies	211838	                RS_GCF_002240415.1
  0.0831	12168	4306	species	172422	              s__Paenibacillus polymyxa_B
  0.0403	5905	5905	subspecies	172424	                RS_GCF_001719045.1
  0.0131	1916	1916	subspecies	172431	                RS_GCF_001874425.3
  0.0001	20	20	subspecies	172434	                RS_GCF_000146875.3
  0.0001	8	8	subspecies	172438	                RS_GCF_001874405.2
  0.0000	6	6	subspecies	172433	                RS_GCF_001922145.1
  0.0000	4	4	subspecies	172432	                RS_GCF_000507205.3
  0.0000	3	3	subspecies	172441	                RS_GCF_001272655.2
  0.0829	12139	66	species	192296	              s__Paenibacillus lautus_A
  0.0418	6117	6117	subspecies	192299	                RS_GCF_000024685.1
  0.0407	5956	5956	subspecies	192298	                RS_GCF_003590055.1
  0.0825	12081	6906	species	190974	              s__Paenibacillus glucanolyticus
  0.0317	4641	4641	subspecies	190977	                RS_GCF_003184205.1
  0.0036	534	534	subspecies	190980	                RS_GCF_003033945.1
  0.0813	11897	8101	species	183519	              s__Paenibacillus polymyxa_C
  0.0207	3030	3030	subspecies	183523	                RS_GCF_003856555.1
  0.0050	731	731	subspecies	183526	                RS_GCF_000164985.3
  0.0001	18	18	subspecies	183527	                RS_GCF_000819665.1
  0.0001	15	15	subspecies	183531	                RS_GCF_002872435.1
  0.0000	2	2	subspecies	183530	                RS_GCF_000237325.1
  0.0001	11	2	species	163776	              s__Paenibacillus polymyxa
  0.0000	5	5	subspecies	163803	                RS_GCF_006274405.1
  0.0000	2	2	subspecies	163810	                RS_GCF_000785455.1
  0.0000	1	1	subspecies	163787	                RS_GCF_002893885.1
  0.0000	1	1	subspecies	163789	                RS_GCF_000597985.1
  0.0000	4	0	species	307014	              s__Paenibacillus xylanexedens_A
  0.0000	4	4	subspecies	307015	                RS_GCF_001908275.1
  0.0000	3	0	species	294258	              s__Paenibacillus sp003268635
  0.0000	3	3	subspecies	294259	                RS_GCF_003268635.1
  0.0000	2	0	species	205074	              s__Paenibacillus ottowii
  0.0000	2	2	subspecies	205076	                RS_GCF_007858415.1
  0.0000	2	0	species	217667	              s__Paenibacillus sp000758545
  0.0000	2	2	subspecies	217670	                RS_GCF_000758545.1
  0.0000	2	0	species	229630	              s__Paenibacillus jilunlii
  0.0000	2	2	subspecies	229631	                RS_GCF_010450915.1
  0.0000	2	0	species	231505	              s__Paenibacillus maysiensis
  0.0000	2	2	subspecies	231507	                RS_GCF_001447315.1
  0.0000	2	0	species	244053	              s__Paenibacillus brasilensis
  0.0000	2	2	subspecies	244055	                RS_GCF_009363115.1
  0.0000	1	0	species	209831	              s__Paenibacillus sp900110055
  0.0000	1	1	subspecies	209833	                RS_GCF_013401555.1
  0.0000	1	0	species	201993	              s__Paenibacillus amylolyticus_B
  0.0000	1	1	subspecies	201998	                RS_GCF_008386395.1
  0.0000	1	0	species	250904	              s__Paenibacillus sp000758585
  0.0000	1	1	subspecies	250905	                RS_GCF_000758585.1
  0.0000	1	0	species	282569	              s__Paenibacillus terrae_B
  0.0000	1	1	subspecies	282570	                RS_GCF_000235585.1
  0.0000	1	0	species	188230	              s__Paenibacillus cellulositrophicus_A
  0.0000	1	1	subspecies	188236	                RS_GCF_009363095.1
  0.0839	12287	0	genus	181401	            g__Paenibacillus_H
  0.0839	12287	11035	species	181402	              s__Paenibacillus_H larvae
  0.0074	1077	1077	subspecies	181403	                RS_GCF_011220525.1
  0.0009	129	129	subspecies	181405	                RS_GCF_002003265.1
  0.0002	26	26	subspecies	181412	                RS_GCF_002082155.1
  0.0001	10	10	subspecies	181407	                RS_GCF_002007765.1
  0.0000	5	5	subspecies	181408	                RS_GCF_002043025.1
  0.0000	2	2	subspecies	181410	                RS_GCF_002951895.1
  0.0000	2	2	subspecies	181411	                RS_GCF_002951915.1
  0.0000	1	1	subspecies	181409	                RS_GCF_002951875.1
  0.0001	10	0	genus	216744	            g__Paenibacillus_O
  0.0000	6	0	species	265380	              s__Paenibacillus_O sp012676905
  0.0000	6	6	subspecies	265381	                RS_GCF_012676905.1
  0.0000	3	0	species	293465	              s__Paenibacillus_O sp900105225
  0.0000	3	3	subspecies	293466	                RS_GCF_900105225.1
  0.0000	1	0	species	216745	              s__Paenibacillus_O sp002243345
  0.0000	1	1	subspecies	216747	                RS_GCF_002243345.2
  0.0000	3	0	genus	243759	            g__Paenibacillus_Z
  0.0000	2	0	species	304761	              s__Paenibacillus_Z albus
  0.0000	2	2	subspecies	304762	                RS_GCF_003952225.1
  0.0000	1	0	species	258605	              s__Paenibacillus_Z sp010365285
  0.0000	1	1	subspecies	258606	                RS_GCF_010365285.1
  0.3345	48965	0	order	166918	        o__Bacillales_A
  0.3345	48965	20	family	166919	          f__Planococcaceae
  0.1666	24381	70	genus	166920	            g__Lysinibacillus
  0.0833	12188	3341	species	190466	              s__Lysinibacillus sphaericus
  0.0303	4438	4438	subspecies	190472	                RS_GCF_000600105.1
  0.0301	4409	4409	subspecies	190474	                RS_GCF_002982115.1
  0.0827	12106	9027	species	180659	              s__Lysinibacillus sphaericus_A
  0.0208	3040	3040	subspecies	180666	                GB_GCA_009496995.1
  0.0002	25	25	subspecies	180670	                RS_GCF_000017965.1
  0.0001	14	14	subspecies	180663	                RS_GCF_001629735.1
  0.0001	16	6	species	166921	              s__Lysinibacillus fusiformis
  0.0000	7	7	subspecies	166942	                RS_GCF_004101885.1
  0.0000	2	2	subspecies	166930	                GB_GCA_007923505.1
  0.0000	1	1	subspecies	166929	                RS_GCF_000724775.3
  0.0000	1	0	species	287247	              s__Lysinibacillus fusiformis_E
  0.0000	1	1	subspecies	287248	                GB_GCA_007362955.1
  0.0839	12286	2	genus	196483	            g__Sporosarcina
  0.0839	12283	3209	species	257098	              s__Sporosarcina psychrophila
  0.0313	4580	4580	subspecies	257099	                RS_GCF_014302295.1
  0.0307	4494	4494	subspecies	257100	                RS_GCF_001590685.1
  0.0000	1	1	species	227028	              s__Sporosarcina sp002077155
  0.0839	12278	47	genus	207172	            g__Planococcus
  0.0835	12228	1219	species	212972	              s__Planococcus kocurii
  0.0377	5516	5516	subspecies	212975	                RS_GCF_001465835.2
  0.0375	5493	5493	subspecies	212976	                RS_GCF_002009235.1
  0.0000	2	0	species	292155	              s__Planococcus donghaensis
  0.0000	2	2	subspecies	292156	                RS_GCF_001687665.2
  0.0000	1	0	species	290387	              s__Planococcus sp000785555
  0.0000	1	1	subspecies	290388	                RS_GCF_000785555.1
  0.2470	36152	0	order	161229	        o__Erysipelotrichales
  0.1643	24042	96	family	164291	          f__Erysipelotrichaceae
  0.0824	12054	0	genus	164292	            g__Clostridium_AQ
  0.0824	12054	2870	species	164293	              s__Clostridium_AQ innocuum
  0.0339	4959	4959	subspecies	164298	                RS_GCF_012317185.1
  0.0289	4223	4223	subspecies	164294	                RS_GCF_012271835.1
  0.0000	2	2	subspecies	164316	                RS_GCF_001688965.2
  0.0812	11890	0	genus	185476	            g__Amedibacterium
  0.0812	11890	5336	species	185477	              s__Amedibacterium intestinale
  0.0232	3401	3401	subspecies	185481	                RS_GCF_010537155.1
  0.0215	3153	3153	subspecies	185488	                RS_GCF_010537335.1
  0.0000	1	0	genus	183737	            g__Erysipelothrix
  0.0000	1	0	species	183738	              s__Erysipelothrix rhusiopathiae
  0.0000	1	1	subspecies	183747	                RS_GCF_007725185.1
  0.0000	1	0	genus	185565	            g__NSJ-61
  0.0000	1	0	species	185566	              s__NSJ-61 sp003433845
  0.0000	1	1	subspecies	185570	                RS_GCF_014337235.1
  0.0827	12110	0	family	161230	          f__Erysipelatoclostridiaceae
  0.0827	12110	0	genus	162024	            g__Faecalibacillus
  0.0827	12110	3890	species	162025	              s__Faecalibacillus intestinalis
  0.0274	4017	4017	subspecies	162041	                RS_GCF_006351825.1
  0.0270	3951	3951	subspecies	162027	                GB_GCA_003432325.1
  0.0017	252	252	subspecies	162060	                RS_GCF_003573995.1
  0.1680	24587	0	order	178770	        o__Exiguobacterales
  0.1680	24587	8	family	178771	          f__Exiguobacteraceae
  0.0840	12294	0	genus	178863	            g__Exiguobacterium
  0.0840	12294	2274	species	191710	              s__Exiguobacterium profundum_A
  0.0363	5314	5314	subspecies	191714	                RS_GCF_000023045.1
  0.0322	4706	4706	subspecies	191715	                GB_GCA_013693895.1
  0.0839	12285	546	genus	178772	            g__Exiguobacterium_A
  0.0799	11696	5584	species	197364	              s__Exiguobacterium_A acetylicum
  0.0213	3122	3122	subspecies	197369	                RS_GCF_000798935.2
  0.0204	2990	2990	subspecies	197368	                RS_GCF_001750115.1
  0.0003	42	11	species	185139	              s__Exiguobacterium_A indicum
  0.0001	21	21	subspecies	185150	                RS_GCF_008274845.1
  0.0001	10	10	subspecies	185144	                RS_GCF_000496635.1
  0.0000	1	0	species	245263	              s__Exiguobacterium_A sibiricum
  0.0000	1	1	subspecies	245265	                RS_GCF_000019905.1
  0.1680	24586	0	order	182387	        o__Brevibacillales
  0.1680	24586	19	family	182388	          f__Brevibacillaceae
  0.0840	12290	35	genus	187185	            g__Brevibacillus
  0.0837	12253	6671	species	198876	              s__Brevibacillus agri
  0.0198	2894	2894	subspecies	198883	                GB_GCA_000470975.2
  0.0184	2688	2688	subspecies	198879	                RS_GCF_004117055.1
  0.0000	1	0	species	197779	              s__Brevibacillus porteri
  0.0000	1	1	subspecies	197783	                RS_GCF_007725005.1
  0.0000	1	0	species	208024	              s__Brevibacillus brevis
  0.0000	1	1	subspecies	208025	                RS_GCF_900637055.1
  0.0839	12277	144	genus	182389	            g__Brevibacillus_B
  0.0828	12126	3870	species	185527	              s__Brevibacillus_B laterosporus
  0.0285	4171	4171	subspecies	185530	                RS_GCF_003590075.1
  0.0279	4085	4085	subspecies	185538	                RS_GCF_002706795.1
  0.0000	6	2	species	182390	              s__Brevibacillus_B halotolerans
  0.0000	3	3	subspecies	182399	                RS_GCF_000219535.2
  0.0000	1	1	subspecies	182401	                RS_GCF_010748895.1
  0.0000	1	0	species	214672	              s__Brevibacillus_B laterosporus_D
  0.0000	1	1	subspecies	214676	                RS_GCF_007833815.1
  0.1677	24546	2	order	179597	        o__Bacillales_H
  0.1677	24544	12	family	179598	          f__Bacillaceae_D
  0.0839	12276	269	genus	179599	            g__Bacillus_H
  0.0818	11980	11857	species	185828	              s__Bacillus_H clausii
  0.0007	107	107	subspecies	185839	                RS_GCF_014338545.1
  0.0001	16	16	subspecies	185837	                RS_GCF_002250115.1
  0.0002	27	12	species	179600	              s__Bacillus_H rhizosphaerae
  0.0001	10	10	subspecies	179604	                RS_GCF_000737305.2
  0.0000	5	5	subspecies	179612	                RS_GCF_000009825.1
  0.0837	12256	0	genus	211979	            g__Bacillus_M
  0.0837	12256	3648	species	211980	              s__Bacillus_M halodurans
  0.0294	4305	4305	subspecies	211984	                RS_GCF_000011145.1
  0.0294	4303	4303	subspecies	211982	                RS_GCF_005671335.1
  0.0840	12300	0	order	179059	        o__Acholeplasmatales
  0.0840	12300	0	family	179060	          f__Acholeplasmataceae
  0.0840	12300	2	genus	190476	            g__Phytoplasma
  0.0840	12298	4947	species	236211	              s__Phytoplasma australiense
  0.0258	3775	3775	subspecies	236213	                RS_GCF_000397185.1
  0.0244	3576	3576	subspecies	236212	                RS_GCF_000069925.1
  0.0840	12300	0	order	189206	        o__Thermoactinomycetales
  0.0840	12300	3	family	189207	          f__Thermoactinomycetaceae
  0.0840	12297	0	genus	189208	            g__Thermoactinomyces
  0.0840	12297	7489	species	189209	              s__Thermoactinomyces vulgaris
  0.0167	2447	2447	subspecies	189219	                RS_GCF_005886755.1
  0.0161	2361	2361	subspecies	189213	                RS_GCF_001187615.2
  0.0840	12297	1	order	202565	        o__Bacillales_G
  0.0840	12296	0	family	202566	          f__Sporolactobacillaceae
  0.0840	12296	0	genus	202567	            g__Sporolactobacillus
  0.0840	12296	12231	species	202568	              s__Sporolactobacillus terrae
  0.0004	57	57	subspecies	202573	                RS_GCF_009176625.1
  0.0000	5	5	subspecies	202570	                RS_GCF_004014985.1
  0.0000	3	3	subspecies	202572	                RS_GCF_004015165.1
  0.0839	12283	12	order	170870	        o__Bacillales_B
  0.0838	12270	0	family	171545	          f__Bacillaceae_C
  0.0838	12270	1635	genus	171546	            g__Weizmannia
  0.0718	10515	6206	species	180099	              s__Weizmannia coagulans
  0.0282	4127	4127	subspecies	180101	                RS_GCF_000217835.1
  0.0011	167	167	subspecies	180103	                RS_GCF_012851395.1
  0.0001	15	15	subspecies	180105	                GB_GCA_000832905.1
  0.0008	120	41	species	171547	              s__Weizmannia coagulans_A
  0.0003	38	38	subspecies	171554	                RS_GCF_001870065.1
  0.0001	16	16	subspecies	171551	                RS_GCF_013402775.1
  0.0001	16	16	subspecies	171562	                RS_GCF_000169195.2
  0.0001	9	9	subspecies	171556	                RS_GCF_002946455.1
  0.0000	1	0	family	189877	          f__DSM-18226
  0.0000	1	0	genus	220538	            g__Neobacillus
  0.0000	1	0	species	230162	              s__Neobacillus thermocopriae
  0.0000	1	1	subspecies	230163	                RS_GCF_000747345.1
  0.0000	3	0	order	185204	        o__Bacillales_D
  0.0000	2	0	family	185205	          f__Amphibacillaceae
  0.0000	1	0	genus	185206	            g__Oceanobacillus
  0.0000	1	0	species	228651	              s__Oceanobacillus kimchii
  0.0000	1	1	subspecies	228652	                RS_GCF_000340475.1
  0.0000	1	0	genus	203855	            g__Terribacillus
  0.0000	1	0	species	231008	              s__Terribacillus saccharophilus
  0.0000	1	1	subspecies	231009	                RS_GCF_000725365.1
  0.0000	1	0	family	210244	          f__Halobacillaceae
  0.0000	1	0	genus	210245	            g__Halobacillus
  0.0000	1	1	species	231860	              s__Halobacillus halophilus
  12.8538	1881404	7	phylum	64369	    p__Actinobacteriota
  12.5178	1832227	930	class	64370	      c__Actinomycetia
  4.9529	724960	3	order	64371	        o__Mycobacteriales
  4.7848	700357	497	family	64372	          f__Mycobacteriaceae
  1.8486	270582	4049	genus	64373	            g__Mycobacterium
  0.0840	12292	12265	species	195180	              s__Mycobacterium neoaurum_A
  0.0002	27	27	subspecies	195185	                RS_GCF_003367335.1
  0.0840	12291	6444	species	217703	              s__Mycobacterium algericum
  0.0204	2989	2989	subspecies	217704	                RS_GCF_000214155.1
  0.0195	2858	2858	subspecies	217706	                GB_GCA_010726505.1
  0.0840	12290	9491	species	230343	              s__Mycobacterium shigaense
  0.0098	1433	1433	subspecies	230346	                RS_GCF_002356315.1
  0.0093	1366	1366	subspecies	230345	                RS_GCF_003515645.1
  0.0839	12276	12119	species	171289	              s__Mycobacterium smegmatis
  0.0006	88	88	subspecies	171302	                RS_GCF_000331165.2
  0.0004	65	65	subspecies	171307	                RS_GCF_001457595.1
  0.0000	2	2	subspecies	171295	                RS_GCF_000767665.1
  0.0000	2	2	subspecies	171303	                RS_GCF_013349145.1
  0.0838	12273	751	species	217494	              s__Mycobacterium tokaiense
  0.0395	5787	5787	subspecies	217497	                RS_GCF_010725885.1
  0.0392	5735	5735	subspecies	217498	                GB_GCA_001695755.1
  0.0837	12244	3047	species	168616	              s__Mycobacterium fortuitum
  0.0315	4606	4606	subspecies	168617	                GB_GCA_000416365.2
  0.0314	4591	4591	subspecies	168627	                RS_GCF_001307545.1
  0.0836	12241	10612	species	139378	              s__Mycobacterium avium
  0.0090	1319	1319	subspecies	139384	                RS_GCF_000014985.1
  0.0004	60	60	subspecies	139558	                RS_GCF_003640565.1
  0.0004	56	56	subspecies	139396	                RS_GCF_003957335.1
  0.0003	40	40	subspecies	139472	                RS_GCF_009002535.1
  0.0002	30	30	subspecies	139475	                RS_GCF_009741445.1
  0.0001	14	14	subspecies	139412	                RS_GCF_001865635.4
  0.0001	13	13	subspecies	139541	                RS_GCF_001936215.1
  0.0001	11	11	subspecies	139441	                RS_GCF_001683455.1
  0.0001	11	11	subspecies	139495	                RS_GCF_000835225.1
  0.0001	10	10	subspecies	139557	                RS_GCF_000835265.1
  0.0001	8	8	subspecies	139573	                RS_GCF_002716925.2
  0.0001	8	8	subspecies	139470	                RS_GCF_003408535.1
  0.0001	8	8	subspecies	139535	                RS_GCF_000829075.1
  0.0000	7	7	subspecies	139492	                RS_GCF_005518035.1
  0.0000	7	7	subspecies	139419	                RS_GCF_005518015.1
  0.0000	6	6	subspecies	139489	                RS_GCF_005518055.1
  0.0000	6	6	subspecies	139385	                RS_GCF_013357385.1
  0.0000	5	5	subspecies	139570	                RS_GCF_002211525.1
  0.0000	4	4	subspecies	139432	                RS_GCF_002716905.3
  0.0000	3	3	subspecies	139380	                RS_GCF_002208705.2
  0.0000	2	2	subspecies	139459	                RS_GCF_000390085.1
  0.0000	1	1	subspecies	139537	                RS_GCF_003713045.1
  0.0836	12240	12198	species	246336	              s__Mycobacterium chitae
  0.0002	33	33	subspecies	246337	                RS_GCF_010727725.1
  0.0001	9	9	subspecies	246338	                RS_GCF_900637205.1
  0.0836	12236	12177	species	190308	              s__Mycobacterium phlei
  0.0002	32	32	subspecies	190316	                GB_GCA_900637115.1
  0.0002	27	27	subspecies	190317	                RS_GCF_001583415.1
  0.0834	12213	7258	species	163691	              s__Mycobacterium marinum
  0.0204	2981	2981	subspecies	163695	                RS_GCF_000018345.1
  0.0114	1673	1673	subspecies	163693	                RS_GCF_000026445.2
  0.0010	145	145	subspecies	163699	                GB_GCA_010728525.1
  0.0004	54	54	subspecies	163711	                RS_GCF_003609695.1
  0.0003	48	48	subspecies	163700	                RS_GCF_003584745.1
  0.0001	14	14	subspecies	163722	                RS_GCF_000013925.1
  0.0001	13	13	subspecies	163705	                RS_GCF_002355775.1
  0.0001	8	8	subspecies	163714	                RS_GCF_000723425.2
  0.0001	8	8	subspecies	163719	                RS_GCF_003391415.1
  0.0000	4	4	subspecies	163725	                RS_GCF_900638745.1
  0.0000	4	4	subspecies	163726	                RS_GCF_002356495.1
  0.0000	3	3	subspecies	163730	                RS_GCF_003391395.1
  0.0833	12190	1764	species	233102	              s__Mycobacterium poriferae
  0.0358	5241	5241	subspecies	233103	                RS_GCF_009363295.1
  0.0354	5185	5185	subspecies	233104	                RS_GCF_010728325.1
  0.0832	12181	5297	species	239807	              s__Mycobacterium sp001886515
  0.0236	3457	3457	subspecies	239809	                RS_GCF_002335685.1
  0.0234	3427	3427	subspecies	239808	                RS_GCF_001886515.1
  0.0830	12147	6601	species	156489	              s__Mycobacterium chelonae
  0.0376	5509	5509	subspecies	156490	                GB_GCA_006494735.1
  0.0001	21	21	subspecies	156507	                RS_GCF_003390495.1
  0.0001	13	13	subspecies	156540	                RS_GCF_001611855.1
  0.0000	3	3	subspecies	156506	                RS_GCF_004355245.1
  0.0829	12129	11949	species	102863	              s__Mycobacterium abscessus
  0.0004	60	60	subspecies	102864	                RS_GCF_003076855.1
  0.0001	21	21	subspecies	104212	                RS_GCF_003609715.1
  0.0001	19	19	subspecies	103657	                RS_GCF_005222645.1
  0.0001	10	10	subspecies	103545	                RS_GCF_010731915.1
  0.0001	9	9	subspecies	104415	                RS_GCF_001606195.1
  0.0001	9	9	subspecies	103794	                RS_GCF_003076815.1
  0.0001	9	9	subspecies	104049	                RS_GCF_001610655.1
  0.0001	8	8	subspecies	104251	                RS_GCF_001430775.1
  0.0000	6	6	subspecies	104545	                RS_GCF_001606235.1
  0.0000	6	6	subspecies	103328	                RS_GCF_001606335.1
  0.0000	4	4	subspecies	104026	                RS_GCF_001050395.1
  0.0000	4	4	subspecies	104116	                RS_GCF_001677095.1
  0.0000	4	4	subspecies	103205	                RS_GCF_003076835.1
  0.0000	2	2	subspecies	104129	                RS_GCF_004027995.1
  0.0000	2	2	subspecies	104278	                RS_GCF_003076875.1
  0.0000	2	2	subspecies	104489	                RS_GCF_001677195.1
  0.0000	1	1	subspecies	103776	                RS_GCF_004209815.1
  0.0000	1	1	subspecies	103749	                RS_GCF_001606275.1
  0.0000	1	1	subspecies	104355	                RS_GCF_012273395.1
  0.0000	1	1	subspecies	102996	                RS_GCF_001677175.1
  0.0000	1	1	subspecies	102956	                RS_GCF_004209835.1
  0.0828	12123	12050	species	224279	              s__Mycobacterium terrae
  0.0005	67	67	subspecies	224280	                RS_GCF_010727125.1
  0.0000	6	6	subspecies	224281	                RS_GCF_900187145.1
  0.0827	12103	11804	species	166309	              s__Mycobacterium kansasii
  0.0009	137	137	subspecies	166314	                RS_GCF_002085775.1
  0.0003	44	44	subspecies	166311	                RS_GCF_000157895.3
  0.0003	40	40	subspecies	166315	                RS_GCF_002085795.1
  0.0002	29	29	subspecies	166331	                RS_GCF_002085625.1
  0.0002	24	24	subspecies	166332	                RS_GCF_002085645.1
  0.0001	14	14	subspecies	166319	                RS_GCF_002085835.1
  0.0001	11	11	subspecies	166326	                RS_GCF_002085815.1
  0.0825	12070	11981	species	176900	              s__Mycobacterium immunogenum
  0.0004	64	64	subspecies	176901	                RS_GCF_001677135.1
  0.0002	25	25	subspecies	176916	                RS_GCF_001605725.1
  0.0822	12036	10438	species	193697	              s__Mycobacterium monacense
  0.0104	1522	1522	subspecies	193702	                RS_GCF_010731575.1
  0.0002	30	30	subspecies	193704	                GB_GCA_000016005.1
  0.0002	25	25	subspecies	193703	                GB_GCA_000014165.1
  0.0001	21	21	subspecies	193705	                RS_GCF_000015405.1
  0.0818	11971	4870	species	199959	              s__Mycobacterium marseillense
  0.0243	3563	3563	subspecies	199964	                RS_GCF_002285715.1
  0.0242	3538	3538	subspecies	199963	                RS_GCF_010731675.1
  0.0802	11737	4828	species	216362	              s__Mycobacterium gilvum
  0.0239	3491	3491	subspecies	216365	                RS_GCF_000016365.1
  0.0234	3418	3418	subspecies	216363	                RS_GCF_000184435.1
  0.0792	11597	1137	species	199952	              s__Mycobacterium kubicae
  0.0369	5408	5408	subspecies	199956	                RS_GCF_014263315.1
  0.0345	5052	5052	subspecies	199957	                RS_GCF_014263335.1
  0.0792	11595	11411	species	159622	              s__Mycobacterium intracellulare
  0.0002	34	34	subspecies	159659	                RS_GCF_000298095.1
  0.0001	21	21	subspecies	159623	                GB_GCA_002148175.1
  0.0001	18	18	subspecies	159666	                RS_GCF_002287605.1
  0.0001	18	18	subspecies	159661	                RS_GCF_002285695.1
  0.0001	16	16	subspecies	159670	                RS_GCF_000262165.1
  0.0001	16	16	subspecies	159658	                RS_GCF_000418535.1
  0.0001	15	15	subspecies	159669	                RS_GCF_000277145.1
  0.0001	14	14	subspecies	159650	                RS_GCF_001750065.2
  0.0000	6	6	subspecies	159636	                RS_GCF_000277125.1
  0.0000	6	6	subspecies	159633	                RS_GCF_009664715.1
  0.0000	5	5	subspecies	159664	                RS_GCF_002219245.1
  0.0000	3	3	subspecies	159643	                RS_GCF_010731935.1
  0.0000	3	3	subspecies	159662	                RS_GCF_900116695.1
  0.0000	3	3	subspecies	159668	                RS_GCF_002240155.1
  0.0000	2	2	subspecies	159644	                RS_GCF_002285675.1
  0.0000	1	1	subspecies	159646	                RS_GCF_002219265.1
  0.0000	1	1	subspecies	159665	                RS_GCF_002166795.1
  0.0000	1	1	subspecies	159634	                RS_GCF_002219285.1
  0.0000	1	1	subspecies	159667	                RS_GCF_002148195.1
  0.0001	9	0	species	189998	              s__Mycobacterium paragordonae
  0.0001	9	9	subspecies	190004	                RS_GCF_003614435.1
  0.0001	8	0	species	310891	              s__Mycobacterium lepraemurium
  0.0001	8	8	subspecies	310892	                RS_GCF_002291465.1
  0.0000	6	0	species	255470	              s__Mycobacterium insubricum
  0.0000	6	6	subspecies	255472	                RS_GCF_010731615.1
  0.0000	4	0	species	311461	              s__Mycobacterium dioxanotrophicus
  0.0000	4	4	subspecies	311462	                RS_GCF_002157835.1
  0.0000	3	0	species	305353	              s__Mycobacterium sp001984215
  0.0000	3	3	subspecies	305354	                RS_GCF_001984215.1
  0.0000	3	0	species	321361	              s__Mycobacterium sp001021385
  0.0000	3	3	subspecies	321362	                RS_GCF_001021385.1
  0.0000	2	0	species	211710	              s__Mycobacterium flavescens
  0.0000	2	2	subspecies	211711	                GB_GCA_900637135.1
  0.0000	2	0	species	237471	              s__Mycobacterium austroafricanum
  0.0000	2	2	subspecies	237472	                RS_GCF_000015305.1
  0.0000	2	0	species	241840	              s__Mycobacterium parmense
  0.0000	2	2	subspecies	241842	                RS_GCF_010730575.1
  0.0000	2	0	species	252552	              s__Mycobacterium litorale
  0.0000	2	2	subspecies	252553	                RS_GCF_010731695.1
  0.0000	2	0	species	287929	              s__Mycobacterium frederiksbergense
  0.0000	2	2	subspecies	287930	                RS_GCF_012223425.1
  0.0000	1	0	species	215136	              s__Mycobacterium mageritense
  0.0000	1	1	subspecies	215140	                RS_GCF_010727475.1
  0.0000	1	1	species	64374	              s__Mycobacterium tuberculosis
  0.0000	1	0	species	212602	              s__Mycobacterium saopaulense
  0.0000	1	1	subspecies	212605	                RS_GCF_001456355.1
  0.0000	1	0	species	305570	              s__Mycobacterium chubuense_A
  0.0000	1	1	subspecies	305571	                RS_GCF_000266905.1
  0.0000	1	0	species	214639	              s__Mycobacterium colombiense
  0.0000	1	1	subspecies	214640	                RS_GCF_002105755.1
  0.0000	1	0	species	282642	              s__Mycobacterium rutilum
  0.0000	1	1	subspecies	282643	                RS_GCF_900108565.1
  0.0000	1	0	species	263491	              s__Mycobacterium sp001644575
  0.0000	1	1	subspecies	263492	                RS_GCF_001644575.1
  0.0000	1	0	species	259125	              s__Mycobacterium stomatepiae
  0.0000	1	1	subspecies	259126	                RS_GCF_010731715.1
  0.0000	1	0	species	224343	              s__Mycobacterium celeriflavum
  0.0000	1	1	subspecies	224344	                RS_GCF_010731795.1
  0.0000	1	0	species	253448	              s__Mycobacterium moriokaense
  0.0000	1	1	subspecies	253450	                RS_GCF_010726085.1
  0.0000	1	0	species	219231	              s__Mycobacterium koreense
  0.0000	1	1	subspecies	219232	                RS_GCF_010731835.1
  0.0000	1	0	species	242960	              s__Mycobacterium doricum
  0.0000	1	1	subspecies	242962	                RS_GCF_010728155.1
  0.0000	1	0	species	219888	              s__Mycobacterium hiberniae
  0.0000	1	1	subspecies	219891	                RS_GCF_010729485.1
  0.0000	1	0	species	234279	              s__Mycobacterium fallax
  0.0000	1	1	subspecies	234280	                RS_GCF_010726955.1
  0.0000	1	0	species	233109	              s__Mycobacterium aubagnense
  0.0000	1	1	subspecies	233110	                RS_GCF_010730955.1
  1.3396	196075	1609	genus	132052	            g__Corynebacterium
  0.0840	12299	2137	species	208116	              s__Corynebacterium renale
  0.0348	5098	5098	subspecies	208119	                RS_GCF_900475655.1
  0.0346	5064	5064	subspecies	208117	                RS_GCF_900478035.1
  0.0840	12291	12231	species	210544	              s__Corynebacterium kutscheri
  0.0002	34	34	subspecies	210548	                RS_GCF_900637565.1
  0.0001	20	20	subspecies	210547	                RS_GCF_900637815.1
  0.0000	5	5	subspecies	210545	                RS_GCF_900637605.1
  0.0000	1	1	subspecies	210546	                RS_GCF_000980835.1
  0.0837	12249	11285	species	255406	              s__Corynebacterium camporealensis
  0.0033	487	487	subspecies	255407	                RS_GCF_000766885.2
  0.0033	477	477	subspecies	255408	                RS_GCF_000980815.1
  0.0837	12247	12072	species	145551	              s__Corynebacterium pseudotuberculosis
  0.0003	38	38	subspecies	145553	                RS_GCF_001682275.1
  0.0001	19	19	subspecies	145552	                RS_GCF_002009385.1
  0.0001	15	15	subspecies	145578	                RS_GCF_001047215.2
  0.0001	14	14	subspecies	145559	                RS_GCF_000265545.3
  0.0001	11	11	subspecies	145673	                RS_GCF_001298505.1
  0.0000	7	7	subspecies	145588	                RS_GCF_001922265.1
  0.0000	6	6	subspecies	145570	                GB_GCA_000764045.2
  0.0000	5	5	subspecies	145568	                RS_GCF_000255935.1
  0.0000	5	5	subspecies	145626	                RS_GCF_000730445.1
  0.0000	4	4	subspecies	145627	                GB_GCA_000233735.1
  0.0000	4	4	subspecies	145615	                GB_GCA_001969465.1
  0.0000	3	3	subspecies	145675	                GB_GCA_001969485.1
  0.0000	3	3	subspecies	145638	                RS_GCF_001017615.1
  0.0000	3	3	subspecies	145633	                RS_GCF_001579865.1
  0.0000	3	3	subspecies	145624	                RS_GCF_001481675.1
  0.0000	3	3	subspecies	145564	                RS_GCF_001866985.1
  0.0000	2	2	subspecies	145554	                RS_GCF_002953955.1
  0.0000	2	2	subspecies	145601	                RS_GCF_000258385.1
  0.0000	2	2	subspecies	145603	                RS_GCF_001663495.1
  0.0000	2	2	subspecies	145652	                RS_GCF_004193695.1
  0.0000	2	2	subspecies	145572	                RS_GCF_002072715.1
  0.0000	2	2	subspecies	145569	                RS_GCF_001889145.1
  0.0000	2	2	subspecies	145586	                RS_GCF_001579925.1
  0.0000	2	2	subspecies	145567	                RS_GCF_001969095.1
  0.0000	1	1	subspecies	145628	                RS_GCF_001456175.1
  0.0000	1	1	subspecies	145670	                RS_GCF_000221625.1
  0.0000	1	1	subspecies	145659	                RS_GCF_001922285.1
  0.0000	1	1	subspecies	145646	                RS_GCF_002869805.1
  0.0000	1	1	subspecies	145642	                RS_GCF_004332355.1
  0.0000	1	1	subspecies	145639	                RS_GCF_001653315.1
  0.0000	1	1	subspecies	145565	                RS_GCF_000730405.1
  0.0000	1	1	subspecies	145632	                RS_GCF_002794435.1
  0.0000	1	1	subspecies	145631	                RS_GCF_000730365.1
  0.0000	1	1	subspecies	145571	                RS_GCF_001186445.1
  0.0000	1	1	subspecies	145617	                RS_GCF_001481755.1
  0.0000	1	1	subspecies	145577	                RS_GCF_000241855.1
  0.0000	1	1	subspecies	145611	                RS_GCF_001579885.2
  0.0000	1	1	subspecies	145605	                RS_GCF_001447295.1
  0.0000	1	1	subspecies	145604	                RS_GCF_009759765.1
  0.0000	1	1	subspecies	145589	                RS_GCF_006974065.1
  0.0836	12234	7745	species	166885	              s__Corynebacterium ulcerans
  0.0301	4403	4403	subspecies	166886	                RS_GCF_000968945.1
  0.0003	40	40	subspecies	166889	                RS_GCF_001281445.1
  0.0002	22	22	subspecies	166917	                RS_GCF_000767685.1
  0.0000	7	7	subspecies	166897	                RS_GCF_000215645.1
  0.0000	4	4	subspecies	166891	                RS_GCF_000215665.1
  0.0000	4	4	subspecies	166901	                RS_GCF_000499805.2
  0.0000	4	4	subspecies	166914	                RS_GCF_009789155.1
  0.0000	2	2	subspecies	166903	                RS_GCF_000767645.1
  0.0000	1	1	subspecies	166900	                RS_GCF_900475635.1
  0.0000	1	1	subspecies	166907	                RS_GCF_900475775.1
  0.0000	1	1	subspecies	166909	                RS_GCF_000767415.1
  0.0835	12224	12205	species	218113	              s__Corynebacterium minutissimum
  0.0001	10	10	subspecies	218116	                RS_GCF_900478045.1
  0.0001	9	9	subspecies	218117	                RS_GCF_900637065.1
  0.0835	12223	391	species	197032	              s__Corynebacterium xerosis
  0.0407	5951	5951	subspecies	197039	                RS_GCF_003641245.1
  0.0402	5881	5881	subspecies	197034	                RS_GCF_009730475.1
  0.0834	12214	12175	species	236015	              s__Corynebacterium imitans
  0.0002	34	34	subspecies	236016	                RS_GCF_900187215.1
  0.0000	5	5	subspecies	236017	                RS_GCF_000739455.1
  0.0833	12193	7021	species	189857	              s__Corynebacterium stationis
  0.0343	5022	5022	subspecies	189859	                RS_GCF_001941345.1
  0.0010	149	149	subspecies	189858	                RS_GCF_002024345.1
  0.0000	1	1	subspecies	189864	                RS_GCF_002214685.1
  0.0832	12178	8362	species	154147	              s__Corynebacterium glutamicum
  0.0258	3775	3775	subspecies	154151	                RS_GCF_001518935.2
  0.0001	12	12	subspecies	154174	                RS_GCF_000010225.1
  0.0001	8	8	subspecies	154214	                RS_GCF_000828015.1
  0.0000	7	7	subspecies	154149	                RS_GCF_000404185.1
  0.0000	5	5	subspecies	154201	                RS_GCF_001643035.1
  0.0000	3	3	subspecies	154177	                RS_GCF_002163915.1
  0.0000	2	2	subspecies	154202	                RS_GCF_013046805.1
  0.0000	2	2	subspecies	154205	                RS_GCF_000742735.1
  0.0000	1	1	subspecies	154186	                RS_GCF_000742715.1
  0.0000	1	1	subspecies	154188	                RS_GCF_001447865.2
  0.0830	12144	12117	species	204356	              s__Corynebacterium ammoniagenes
  0.0002	27	27	subspecies	204357	                RS_GCF_002005245.1
  0.0826	12084	8717	species	200860	              s__Corynebacterium urealyticum
  0.0227	3322	3322	subspecies	200862	                RS_GCF_000338095.1
  0.0003	41	41	subspecies	200861	                RS_GCF_900187235.1
  0.0000	4	4	subspecies	200864	                RS_GCF_000069945.1
  0.0821	12010	1139	species	185957	              s__Corynebacterium simulans
  0.0375	5485	5485	subspecies	185961	                RS_GCF_001586235.1
  0.0368	5386	5386	subspecies	185966	                RS_GCF_001586215.1
  0.0817	11963	6119	species	164213	              s__Corynebacterium striatum
  0.0198	2892	2892	subspecies	164219	                RS_GCF_002804085.1
  0.0196	2865	2865	subspecies	164228	                RS_GCF_002803965.1
  0.0006	87	87	subspecies	164234	                RS_GCF_002156805.1
  0.0817	11958	4722	species	163022	              s__Corynebacterium amycolatum_A
  0.0247	3616	3616	subspecies	163023	                RS_GCF_002209185.2
  0.0246	3596	3596	subspecies	163049	                RS_GCF_003955985.1
  0.0002	24	24	subspecies	163059	                RS_GCF_902381695.1
  0.0814	11908	3281	species	191110	              s__Corynebacterium jeikeium
  0.0297	4340	4340	subspecies	191117	                RS_GCF_900477975.1
  0.0293	4287	4287	subspecies	191114	                RS_GCF_000006605.1
  0.0001	11	5	species	132053	              s__Corynebacterium diphtheriae
  0.0000	3	3	subspecies	132200	                RS_GCF_000255155.1
  0.0000	2	2	subspecies	132063	                RS_GCF_003194045.1
  0.0000	1	1	subspecies	132268	                RS_GCF_000255195.1
  0.0001	8	0	species	218631	              s__Corynebacterium singulare
  0.0001	8	8	subspecies	218632	                RS_GCF_000833575.1
  0.0000	7	0	species	169055	              s__Corynebacterium amycolatum
  0.0000	7	7	subspecies	169057	                RS_GCF_000755185.1
  0.0000	2	0	species	196592	              s__Corynebacterium silvaticum
  0.0000	2	2	subspecies	196599	                RS_GCF_002162115.1
  0.0000	2	0	species	233732	              s__Corynebacterium aurimucosum
  0.0000	2	2	subspecies	233734	                RS_GCF_000022905.1
  0.0000	2	0	species	264753	              s__Corynebacterium suranareeae
  0.0000	2	2	subspecies	264754	                RS_GCF_002355155.1
  0.0000	2	0	species	237533	              s__Corynebacterium sp003065405
  0.0000	2	2	subspecies	237534	                RS_GCF_003065405.1
  0.0000	2	0	species	203243	              s__Corynebacterium flavescens
  0.0000	2	2	subspecies	203245	                RS_GCF_001941465.1
  0.0000	1	0	species	293366	              s__Corynebacterium terpenotabidum
  0.0000	1	1	subspecies	293367	                RS_GCF_000418365.1
  0.0000	1	0	species	285016	              s__Corynebacterium sp014217255
  0.0000	1	1	subspecies	285017	                RS_GCF_014217255.1
  0.0000	1	0	species	274023	              s__Corynebacterium genitalium_A
  0.0000	1	1	subspecies	274024	                RS_GCF_000143825.1
  0.0000	1	0	species	306374	              s__Corynebacterium atypicum
  0.0000	1	1	subspecies	306375	                RS_GCF_000732945.1
  0.0000	1	0	species	259549	              s__Corynebacterium crudilactis
  0.0000	1	1	subspecies	259550	                RS_GCF_001643015.1
  0.0000	1	0	species	259199	              s__Corynebacterium maris
  0.0000	1	1	subspecies	259200	                RS_GCF_000442645.1
  0.0000	1	0	species	236922	              s__Corynebacterium callunae
  0.0000	1	1	subspecies	236924	                RS_GCF_000344785.1
  0.0000	1	0	species	230774	              s__Corynebacterium sp014490555
  0.0000	1	1	subspecies	230777	                RS_GCF_014490555.1
  0.0000	1	0	species	218916	              s__Corynebacterium riegelii
  0.0000	1	1	subspecies	218919	                RS_GCF_001263755.1
  0.0000	1	0	species	215968	              s__Corynebacterium sp001767255
  0.0000	1	1	subspecies	215970	                RS_GCF_001767255.1
  0.0000	1	0	species	214877	              s__Corynebacterium casei
  0.0000	1	1	subspecies	214879	                RS_GCF_000550785.1
  0.7548	110484	2560	genus	161134	            g__Rhodococcus
  0.0838	12273	6093	species	178027	              s__Rhodococcus pyridinivorans
  0.0208	3042	3042	subspecies	178036	                RS_GCF_001886355.1
  0.0173	2537	2537	subspecies	178030	                RS_GCF_000763325.2
  0.0025	372	372	subspecies	178043	                RS_GCF_002269365.1
  0.0012	171	171	subspecies	178044	                RS_GCF_009883715.1
  0.0002	24	24	subspecies	178037	                RS_GCF_000511305.1
  0.0002	22	22	subspecies	178038	                RS_GCF_005944105.1
  0.0001	12	12	subspecies	178042	                RS_GCF_003288095.1
  0.0838	12263	5735	species	162249	              s__Rhodococcus hoagii
  0.0232	3392	3392	subspecies	162272	                RS_GCF_000164155.2
  0.0210	3078	3078	subspecies	162263	                RS_GCF_003013675.1
  0.0002	33	33	subspecies	162273	                RS_GCF_007197835.1
  0.0002	25	25	subspecies	162279	                RS_GCF_000196695.1
  0.0836	12235	2207	species	174721	              s__Rhodococcus opacus
  0.0340	4981	4981	subspecies	174731	                RS_GCF_007558985.1
  0.0335	4904	4904	subspecies	174723	                RS_GCF_001685605.1
  0.0009	126	126	subspecies	174738	                GB_GCA_000599545.1
  0.0001	17	17	subspecies	174733	                RS_GCF_012931745.1
  0.0835	12225	107	species	243685	              s__Rhodococcus sp003130705
  0.0414	6059	6059	subspecies	243686	                RS_GCF_009859915.1
  0.0414	6059	6059	subspecies	243687	                RS_GCF_003130705.1
  0.0833	12187	8015	species	180855	              s__Rhodococcus aetherivorans
  0.0160	2339	2339	subspecies	180857	                RS_GCF_000470885.1
  0.0119	1742	1742	subspecies	180856	                RS_GCF_000982715.1
  0.0003	48	48	subspecies	180863	                RS_GCF_001700945.1
  0.0003	43	43	subspecies	180860	                RS_GCF_012272955.1
  0.0832	12183	8568	species	178736	              s__Rhodococcus ruber
  0.0134	1963	1963	subspecies	178740	                RS_GCF_002863905.1
  0.0107	1568	1568	subspecies	178745	                RS_GCF_003586525.1
  0.0002	29	29	subspecies	178747	                RS_GCF_003086595.1
  0.0002	28	28	subspecies	178748	                RS_GCF_002741725.1
  0.0002	27	27	subspecies	178752	                RS_GCF_006351985.2
  0.0832	12175	12107	species	211076	              s__Rhodococcus triatomae
  0.0003	41	41	subspecies	211079	                RS_GCF_014217765.1
  0.0002	27	27	subspecies	211078	                RS_GCF_014217785.1
  0.0788	11529	3970	species	188297	              s__Rhodococcus rhodochrous
  0.0261	3826	3826	subspecies	188302	                RS_GCF_900187265.1
  0.0255	3733	3733	subspecies	188299	                RS_GCF_003004765.2
  0.0735	10758	5301	species	166513	              s__Rhodococcus erythropolis
  0.0188	2746	2746	subspecies	166521	                RS_GCF_009707305.1
  0.0182	2657	2657	subspecies	166526	                RS_GCF_000696675.2
  0.0001	20	20	subspecies	166541	                RS_GCF_000010105.1
  0.0001	12	12	subspecies	166538	                RS_GCF_000975175.1
  0.0001	11	11	subspecies	166527	                RS_GCF_000454045.1
  0.0001	11	11	subspecies	166540	                RS_GCF_002501585.1
  0.0005	77	28	species	161135	              s__Rhodococcus qingshengii
  0.0001	17	17	subspecies	161153	                RS_GCF_008728655.1
  0.0001	16	16	subspecies	161148	                RS_GCF_011611865.1
  0.0000	6	6	subspecies	161139	                RS_GCF_001942025.1
  0.0000	4	4	subspecies	161168	                RS_GCF_001682295.1
  0.0000	3	3	subspecies	161177	                RS_GCF_003860625.1
  0.0000	2	2	subspecies	161176	                RS_GCF_008306195.1
  0.0000	1	1	subspecies	161159	                GB_GCA_006384225.1
  0.0001	9	0	species	210325	              s__Rhodococcus wratislaviensis
  0.0001	9	9	subspecies	210327	                RS_GCF_000736435.1
  0.0000	5	0	species	215608	              s__Rhodococcus jostii_A
  0.0000	5	5	subspecies	215609	                RS_GCF_000014565.1
  0.0000	3	0	species	292551	              s__Rhodococcus sp005484805
  0.0000	3	3	subspecies	292552	                RS_GCF_005484805.1
  0.0000	2	0	species	277286	              s__Rhodococcus opacus_C
  0.0000	2	2	subspecies	277287	                RS_GCF_000010805.1
  0.4188	61307	1039	genus	184853	            g__Gordonia
  0.0833	12196	12187	species	219874	              s__Gordonia bronchialis
  0.0000	5	5	subspecies	219876	                RS_GCF_000024785.1
  0.0000	4	4	subspecies	219877	                RS_GCF_009730435.1
  0.0827	12110	12084	species	198658	              s__Gordonia terrae
  0.0001	16	16	subspecies	198663	                RS_GCF_003183825.1
  0.0001	10	10	subspecies	198665	                RS_GCF_001698225.1
  0.0826	12089	5621	species	196500	              s__Gordonia amicalis
  0.0225	3296	3296	subspecies	196506	                RS_GCF_002327125.1
  0.0217	3172	3172	subspecies	196505	                GB_GCA_012974285.1
  0.0817	11960	1971	species	207927	              s__Gordonia rubripertincta
  0.0345	5049	5049	subspecies	207928	                RS_GCF_014070455.1
  0.0338	4940	4940	subspecies	207930	                RS_GCF_003568625.1
  0.0813	11895	3344	species	202279	              s__Gordonia alkanivorans
  0.0294	4307	4307	subspecies	202281	                RS_GCF_009720185.1
  0.0290	4244	4244	subspecies	202282	                RS_GCF_004011905.1
  0.0001	13	4	species	186476	              s__Gordonia sp002009645
  0.0000	6	6	subspecies	186480	                RS_GCF_009856645.1
  0.0000	3	3	subspecies	186485	                RS_GCF_011290605.1
  0.0000	4	0	species	219609	              s__Gordonia sp000143885
  0.0000	4	4	subspecies	219611	                RS_GCF_000143885.2
  0.0000	1	0	species	322961	              s__Gordonia insulae
  0.0000	1	1	subspecies	322962	                RS_GCF_003855095.1
  0.1678	24565	142	genus	177041	            g__Nocardia
  0.0840	12288	7055	species	185165	              s__Nocardia farcinica
  0.0356	5211	5211	subspecies	185171	                RS_GCF_000009805.1
  0.0001	15	15	subspecies	185176	                RS_GCF_001182745.1
  0.0000	7	7	subspecies	185177	                RS_GCF_003367415.1
  0.0829	12133	237	species	208285	              s__Nocardia cyriacigeorgica
  0.0409	5985	5985	subspecies	208288	                RS_GCF_900683635.1
  0.0404	5911	5911	subspecies	208287	                RS_GCF_002949635.1
  0.0000	2	0	species	244493	              s__Nocardia cyriacigeorgica_B
  0.0000	2	2	subspecies	244494	                RS_GCF_000284035.1
  0.1678	24561	67	genus	164331	            g__Rhodococcus_B
  0.0838	12270	12263	species	245179	              s__Rhodococcus_B sp004795915
  0.0000	4	4	subspecies	245181	                RS_GCF_004795875.1
  0.0000	3	3	subspecies	245180	                RS_GCF_004795915.1
  0.0835	12219	163	species	190044	              s__Rhodococcus_B sp002259335
  0.0412	6033	6033	subspecies	190045	                RS_GCF_000760935.2
  0.0411	6023	6023	subspecies	190052	                RS_GCF_000760905.2
  0.0000	5	4	species	164332	              s__Rhodococcus_B fascians
  0.0000	1	1	subspecies	164363	                RS_GCF_001620305.1
  0.0839	12285	0	genus	228794	            g__Lawsonella
  0.0839	12285	9338	species	228795	              s__Lawsonella clevelandensis
  0.0117	1719	1719	subspecies	228797	                RS_GCF_001281505.1
  0.0082	1201	1201	subspecies	228796	                RS_GCF_900610365.1
  0.0002	27	27	subspecies	228798	                RS_GCF_001293125.1
  0.0000	1	1	genus	197636	            g__Tsukamurella
  0.0840	12302	0	family	190102	          f__Pseudonocardiaceae
  0.0840	12300	55	genus	198237	            g__Amycolatopsis
  0.0836	12238	168	species	207010	              s__Amycolatopsis keratiniphila
  0.0414	6055	6055	subspecies	207012	                RS_GCF_900105855.1
  0.0411	6015	6015	subspecies	207014	                RS_GCF_000400635.2
  0.0000	6	0	species	216722	              s__Amycolatopsis japonica
  0.0000	6	6	subspecies	216723	                RS_GCF_000732925.1
  0.0000	1	0	species	246560	              s__Amycolatopsis orientalis
  0.0000	1	1	subspecies	246561	                RS_GCF_000943515.2
  0.0000	1	0	genus	216178	            g__Saccharopolyspora
  0.0000	1	0	species	226952	              s__Saccharopolyspora spinosa
  0.0000	1	1	subspecies	226953	                RS_GCF_014490055.1
  0.0000	1	0	genus	240371	            g__Lentzea
  0.0000	1	0	species	290614	              s__Lentzea guizhouensis
  0.0000	1	1	subspecies	290615	                RS_GCF_001701025.1
  0.0840	12298	1	family	160443	          f__Micromonosporaceae
  0.0840	12297	0	genus	160444	            g__Micromonospora
  0.0840	12297	1762	species	243495	              s__Micromonospora sp003030345
  0.0360	5272	5272	subspecies	243496	                RS_GCF_003030345.1
  0.0360	5263	5263	subspecies	243497	                RS_GCF_003030385.1
  4.1172	602641	0	order	150612	        o__Streptomycetales
  4.1172	602641	268	family	150613	          f__Streptomycetaceae
  4.0318	590137	1537	genus	150614	            g__Streptomyces
  0.0840	12297	645	species	212586	              s__Streptomyces sp002847285
  0.0397	5805	5805	subspecies	212587	                RS_GCF_001011035.1
  0.0395	5777	5777	subspecies	212589	                RS_GCF_003945505.1
  0.0005	70	70	subspecies	212590	                RS_GCF_002847285.1
  0.0840	12290	1405	species	193766	              s__Streptomyces chartreusis
  0.0375	5491	5491	subspecies	193767	                RS_GCF_013375055.1
  0.0369	5394	5394	subspecies	193770	                RS_GCF_008704715.1
  0.0840	12289	11978	species	218202	              s__Streptomyces nodosus
  0.0014	202	202	subspecies	218205	                RS_GCF_008704995.1
  0.0007	109	109	subspecies	218204	                RS_GCF_000819545.1
  0.0839	12287	12158	species	212473	              s__Streptomyces albus_F
  0.0006	81	81	subspecies	212476	                RS_GCF_003675345.1
  0.0003	48	48	subspecies	212475	                RS_GCF_000827005.1
  0.0839	12287	64	species	203944	              s__Streptomyces himastatinicus
  0.0418	6112	6112	subspecies	203949	                RS_GCF_013414305.1
  0.0418	6111	6111	subspecies	203947	                RS_GCF_001650215.1
  0.0839	12287	4158	species	187827	              s__Streptomyces sp000213055
  0.0280	4094	4094	subspecies	187828	                RS_GCF_000213055.1
  0.0276	4035	4035	subspecies	187833	                RS_GCF_002288075.1
  0.0839	12286	11912	species	160294	              s__Streptomyces rimosus
  0.0023	343	343	subspecies	160298	                RS_GCF_000707925.2
  0.0002	30	30	subspecies	160305	                RS_GCF_006229535.1
  0.0000	1	1	subspecies	160336	                RS_GCF_008704655.1
  0.0839	12286	10769	species	254073	              s__Streptomyces sp003287935
  0.0052	767	767	subspecies	254075	                RS_GCF_003287935.1
  0.0051	750	750	subspecies	254074	                RS_GCF_003287915.1
  0.0839	12285	12087	species	208654	              s__Streptomyces antibioticus_B
  0.0008	121	121	subspecies	208657	                RS_GCF_012044595.1
  0.0005	77	77	subspecies	208659	                RS_GCF_002019855.1
  0.0839	12284	1004	species	204761	              s__Streptomyces tricolor
  0.0387	5664	5664	subspecies	204763	                GB_GCA_001511815.1
  0.0384	5616	5616	subspecies	204764	                GB_GCA_001040905.1
  0.0839	12284	12084	species	223788	              s__Streptomyces pluripotens
  0.0013	189	189	subspecies	223789	                RS_GCF_000816465.3
  0.0001	11	11	subspecies	223790	                RS_GCF_000802245.2
  0.0839	12284	156	species	197561	              s__Streptomyces griseorubiginosus
  0.0415	6074	6074	subspecies	197568	                RS_GCF_003595235.1
  0.0414	6054	6054	subspecies	197567	                RS_GCF_006516935.1
  0.0839	12283	251	species	226835	              s__Streptomyces sp014295035
  0.0412	6024	6024	subspecies	226836	                RS_GCF_014295035.1
  0.0410	6008	6008	subspecies	226838	                RS_GCF_013364335.1
  0.0839	12282	5554	species	208381	              s__Streptomyces fradiae
  0.0232	3397	3397	subspecies	208385	                RS_GCF_008704425.1
  0.0228	3331	3331	subspecies	208386	                RS_GCF_001750785.1
  0.0839	12280	11300	species	229377	              s__Streptomyces lincolnensis
  0.0034	493	493	subspecies	229378	                RS_GCF_003344445.1
  0.0023	334	334	subspecies	229379	                RS_GCF_014083905.1
  0.0010	153	153	subspecies	229380	                RS_GCF_001685355.1
  0.0839	12279	12243	species	241622	              s__Streptomyces griseoviridis_A
  0.0001	21	21	subspecies	241623	                RS_GCF_003994395.1
  0.0001	15	15	subspecies	241624	                RS_GCF_005222485.1
  0.0839	12279	7190	species	187955	              s__Streptomyces bikiniensis
  0.0182	2658	2658	subspecies	187960	                RS_GCF_002943895.1
  0.0166	2431	2431	subspecies	187959	                RS_GCF_009299385.1
  0.0839	12278	116	species	211683	              s__Streptomyces spectabilis
  0.0416	6086	6086	subspecies	211687	                RS_GCF_008704795.1
  0.0415	6076	6076	subspecies	211684	                RS_GCF_007363395.1
  0.0839	12275	516	species	184921	              s__Streptomyces libani
  0.0401	5867	5867	subspecies	184929	                GB_GCA_011290345.1
  0.0396	5793	5793	subspecies	184928	                RS_GCF_003173275.1
  0.0007	99	99	subspecies	184931	                RS_GCF_003994375.1
  0.0838	12272	11761	species	190984	              s__Streptomyces malaysiensis
  0.0013	190	190	subspecies	190988	                RS_GCF_002812405.1
  0.0011	161	161	subspecies	190989	                RS_GCF_001983975.1
  0.0006	86	86	subspecies	190987	                RS_GCF_006974005.1
  0.0005	74	74	subspecies	190985	                RS_GCF_002591335.1
  0.0838	12271	11642	species	200458	              s__Streptomyces clavuligerus
  0.0023	340	340	subspecies	200459	                RS_GCF_000148465.1
  0.0019	271	271	subspecies	200460	                RS_GCF_003454755.1
  0.0001	16	16	subspecies	200461	                RS_GCF_000163875.1
  0.0000	2	2	subspecies	200463	                RS_GCF_001693675.1
  0.0838	12271	11683	species	218506	              s__Streptomyces sviceus
  0.0032	464	464	subspecies	218508	                RS_GCF_003443735.1
  0.0008	124	124	subspecies	218509	                RS_GCF_000154965.1
  0.0838	12269	520	species	194575	              s__Streptomyces goshikiensis
  0.0401	5876	5876	subspecies	194582	                RS_GCF_000412265.2
  0.0401	5873	5873	subspecies	194577	                RS_GCF_003721495.1
  0.0838	12268	8016	species	203562	              s__Streptomyces albulus_C
  0.0146	2140	2140	subspecies	203566	                RS_GCF_000695235.1
  0.0138	2014	2014	subspecies	203565	                RS_GCF_000935185.3
  0.0007	98	98	subspecies	203568	                GB_GCA_000963515.1
  0.0838	12267	6007	species	197171	              s__Streptomyces sp000772045
  0.0200	2923	2923	subspecies	197172	                RS_GCF_013364375.1
  0.0192	2806	2806	subspecies	197174	                RS_GCF_003950055.1
  0.0036	531	531	subspecies	197176	                RS_GCF_000772045.1
  0.0838	12266	12187	species	212072	              s__Streptomyces tsukubensis
  0.0003	45	45	subspecies	212075	                RS_GCF_003932715.1
  0.0002	34	34	subspecies	212073	                RS_GCF_000297155.3
  0.0838	12265	11902	species	202791	              s__Streptomyces alfalfae
  0.0023	334	334	subspecies	202797	                RS_GCF_001975025.1
  0.0002	29	29	subspecies	202792	                RS_GCF_003573485.1
  0.0838	12264	7612	species	197956	              s__Streptomyces venezuelae
  0.0303	4441	4441	subspecies	197960	                RS_GCF_008639045.1
  0.0013	193	193	subspecies	197963	                RS_GCF_008705255.1
  0.0001	10	10	subspecies	197962	                RS_GCF_000253235.1
  0.0000	6	6	subspecies	197959	                RS_GCF_008639165.1
  0.0000	2	2	subspecies	197961	                RS_GCF_001886595.1
  0.0838	12262	7184	species	183357	              s__Streptomyces papulosus
  0.0173	2530	2530	subspecies	183363	                RS_GCF_004524875.1
  0.0169	2474	2474	subspecies	183361	                RS_GCF_000364805.1
  0.0005	74	74	subspecies	183368	                RS_GCF_000176115.2
  0.0838	12262	12262	species	211914	              s__Streptomyces chartreusis_D
  0.0838	12260	601	species	199692	              s__Streptomyces lydicus
  0.0417	6103	6103	subspecies	199693	                RS_GCF_001729485.1
  0.0378	5540	5540	subspecies	199695	                RS_GCF_002090335.1
  0.0001	16	16	subspecies	199696	                RS_GCF_001984445.1
  0.0838	12259	4294	species	242635	              s__Streptomyces ambofaciens
  0.0276	4033	4033	subspecies	242636	                RS_GCF_001267885.1
  0.0269	3932	3932	subspecies	242637	                RS_GCF_001632865.1
  0.0837	12258	2197	species	166987	              s__Streptomyces bacillaris
  0.0416	6090	6090	subspecies	166995	                RS_GCF_002094995.1
  0.0263	3851	3851	subspecies	166992	                RS_GCF_002848525.1
  0.0003	45	45	subspecies	167011	                GB_GCA_004521945.2
  0.0003	42	42	subspecies	167012	                RS_GCF_003268675.1
  0.0002	24	24	subspecies	167002	                RS_GCF_001278095.1
  0.0000	7	7	subspecies	167000	                RS_GCF_002804165.1
  0.0000	2	2	subspecies	166999	                RS_GCF_003352445.1
  0.0837	12258	5278	species	214417	              s__Streptomyces olivaceus
  0.0241	3524	3524	subspecies	214419	                RS_GCF_011650445.1
  0.0236	3456	3456	subspecies	214418	                RS_GCF_001767375.1
  0.0837	12253	3650	species	210614	              s__Streptomyces fungicidicus_A
  0.0295	4321	4321	subspecies	210615	                RS_GCF_013364175.1
  0.0293	4282	4282	subspecies	210618	                RS_GCF_003665435.1
  0.0837	12252	6901	species	200943	              s__Streptomyces olivaceoviridis
  0.0364	5334	5334	subspecies	200945	                RS_GCF_001447075.1
  0.0001	16	16	subspecies	200947	                RS_GCF_000340845.1
  0.0000	1	1	subspecies	200948	                RS_GCF_000245355.1
  0.0837	12251	11871	species	220813	              s__Streptomyces pristinaespiralis
  0.0013	191	191	subspecies	220814	                RS_GCF_001278075.1
  0.0012	181	181	subspecies	220815	                RS_GCF_000154945.1
  0.0001	8	8	subspecies	220816	                RS_GCF_014070435.1
  0.0837	12248	4905	species	173980	              s__Streptomyces rochei
  0.0255	3737	3737	subspecies	173982	                RS_GCF_007858555.1
  0.0241	3529	3529	subspecies	173986	                RS_GCF_005490965.1
  0.0005	77	77	subspecies	173998	                RS_GCF_004795715.1
  0.0837	12245	2930	species	222455	              s__Streptomyces violaceusniger_A
  0.0311	4551	4551	subspecies	222457	                RS_GCF_002021875.1
  0.0309	4521	4521	subspecies	222456	                RS_GCF_003595545.1
  0.0017	243	243	subspecies	222458	                RS_GCF_000147815.2
  0.0837	12245	483	species	188331	              s__Streptomyces microflavus
  0.0402	5882	5882	subspecies	188338	                RS_GCF_013364315.1
  0.0402	5880	5880	subspecies	188332	                RS_GCF_000385945.1
  0.0836	12239	126	species	195639	              s__Streptomyces platensis
  0.0415	6069	6069	subspecies	195641	                RS_GCF_012273495.1
  0.0413	6044	6044	subspecies	195645	                RS_GCF_008704855.1
  0.0836	12235	1035	species	167665	              s__Streptomyces californicus
  0.0384	5615	5615	subspecies	167691	                RS_GCF_002082175.1
  0.0382	5585	5585	subspecies	167679	                RS_GCF_013401535.1
  0.0836	12234	404	species	172348	              s__Streptomyces anulatus
  0.0405	5922	5922	subspecies	172371	                RS_GCF_001434355.1
  0.0404	5908	5908	subspecies	172353	                RS_GCF_014495705.1
  0.0835	12224	1144	species	197820	              s__Streptomyces sp002080455
  0.0380	5556	5556	subspecies	197823	                RS_GCF_002028385.1
  0.0377	5524	5524	subspecies	197822	                RS_GCF_002080455.1
  0.0834	12210	260	species	221551	              s__Streptomyces sp002846625
  0.0410	5999	5999	subspecies	221552	                RS_GCF_012275145.1
  0.0407	5951	5951	subspecies	221553	                RS_GCF_012273535.1
  0.0833	12194	12085	species	211688	              s__Streptomyces gardneri
  0.0004	57	57	subspecies	211689	                GB_GCA_001406115.1
  0.0004	52	52	subspecies	211691	                GB_GCA_001443625.1
  0.0830	12155	11712	species	168878	              s__Streptomyces anthocyanicus
  0.0023	334	334	subspecies	168880	                RS_GCF_000403665.1
  0.0006	95	95	subspecies	168883	                RS_GCF_900104935.1
  0.0001	10	10	subspecies	168888	                RS_GCF_000739105.1
  0.0000	3	3	subspecies	168904	                RS_GCF_000203835.1
  0.0000	1	1	subspecies	168881	                RS_GCF_008931305.1
  0.0825	12073	10827	species	172931	              s__Streptomyces mirabilis
  0.0070	1023	1023	subspecies	172932	                RS_GCF_007113425.2
  0.0008	116	116	subspecies	172933	                RS_GCF_007113665.2
  0.0004	61	61	subspecies	172949	                RS_GCF_007113565.2
  0.0001	17	17	subspecies	172946	                RS_GCF_007113405.2
  0.0001	14	14	subspecies	172948	                RS_GCF_007113545.2
  0.0000	7	7	subspecies	172943	                RS_GCF_007113445.1
  0.0000	3	3	subspecies	172941	                RS_GCF_007113585.2
  0.0000	2	2	subspecies	172936	                RS_GCF_007113485.2
  0.0000	2	2	subspecies	172944	                RS_GCF_007113525.2
  0.0000	1	1	subspecies	172937	                RS_GCF_007113465.1
  0.0002	34	0	species	241437	              s__Streptomyces narbonensis
  0.0002	34	34	subspecies	241438	                RS_GCF_008642375.1
  0.0001	12	0	species	259259	              s__Streptomyces sp003369795
  0.0001	12	12	subspecies	259260	                RS_GCF_003369795.1
  0.0001	12	0	species	227576	              s__Streptomyces antimycoticus
  0.0001	12	12	subspecies	227579	                RS_GCF_009936315.1
  0.0001	10	0	species	201641	              s__Streptomyces coelicoflavus
  0.0001	10	10	subspecies	201643	                RS_GCF_009495655.1
  0.0000	7	0	species	319454	              s__Streptomyces sp009832925
  0.0000	7	7	subspecies	319455	                RS_GCF_009832925.1
  0.0000	6	0	species	210315	              s__Streptomyces coeruleorubidus
  0.0000	6	6	subspecies	210318	                RS_GCF_008705135.1
  0.0000	6	0	species	188184	              s__Streptomyces griseus
  0.0000	6	6	subspecies	188188	                RS_GCF_000010605.1
  0.0000	5	0	species	266654	              s__Streptomyces sp013046785
  0.0000	5	5	subspecies	266655	                RS_GCF_013046785.1
  0.0000	5	0	species	187876	              s__Streptomyces globisporus
  0.0000	5	5	subspecies	187880	                RS_GCF_003147545.1
  0.0000	4	2	species	150615	              s__Streptomyces albidoflavus
  0.0000	1	1	subspecies	150655	                RS_GCF_001704195.1
  0.0000	1	1	subspecies	150702	                RS_GCF_000495635.1
  0.0000	4	0	species	280649	              s__Streptomyces venezuelae_E
  0.0000	4	4	subspecies	280650	                RS_GCF_008642275.1
  0.0000	3	0	species	220295	              s__Streptomyces alboniger
  0.0000	3	3	subspecies	220297	                RS_GCF_008704395.1
  0.0000	3	0	species	224647	              s__Streptomyces eurythermus
  0.0000	3	3	subspecies	224648	                RS_GCF_011820545.1
  0.0000	3	0	species	198650	              s__Streptomyces sp003116725
  0.0000	3	3	subspecies	198653	                RS_GCF_003610995.1
  0.0000	3	0	species	236961	              s__Streptomyces pactum
  0.0000	3	3	subspecies	236963	                RS_GCF_002005225.1
  0.0000	2	0	species	214497	              s__Streptomyces viridosporus
  0.0000	2	2	subspecies	214501	                RS_GCF_008704515.1
  0.0000	2	0	species	288046	              s__Streptomyces sp001484565
  0.0000	2	2	subspecies	288047	                RS_GCF_001484565.1
  0.0000	2	0	species	265147	              s__Streptomyces sp003330845
  0.0000	2	2	subspecies	265148	                RS_GCF_003330845.1
  0.0000	2	0	species	246693	              s__Streptomyces noursei
  0.0000	2	2	subspecies	246695	                RS_GCF_001704275.1
  0.0000	2	0	species	242274	              s__Streptomyces lateritius
  0.0000	2	2	subspecies	242276	                RS_GCF_009789635.1
  0.0000	2	0	species	240776	              s__Streptomyces dengpaensis
  0.0000	2	2	subspecies	240777	                RS_GCF_002946835.1
  0.0000	2	0	species	207563	              s__Streptomyces vinaceus
  0.0000	2	2	subspecies	207568	                RS_GCF_008704935.1
  0.0000	1	0	species	301398	              s__Streptomyces fodineus
  0.0000	1	1	subspecies	301399	                RS_GCF_001735805.1
  0.0000	1	0	species	272937	              s__Streptomyces venezuelae_D
  0.0000	1	1	subspecies	272938	                RS_GCF_008642315.1
  0.0000	1	0	species	275825	              s__Streptomyces sp014489635
  0.0000	1	1	subspecies	275826	                RS_GCF_014489635.1
  0.0000	1	0	species	278294	              s__Streptomyces vietnamensis
  0.0000	1	1	subspecies	278295	                RS_GCF_000830005.1
  0.0000	1	0	species	278829	              s__Streptomyces gilvosporeus
  0.0000	1	1	subspecies	278830	                RS_GCF_002082195.1
  0.0000	1	0	species	287624	              s__Streptomyces davaonensis
  0.0000	1	1	subspecies	287625	                RS_GCF_000349325.1
  0.0000	1	0	species	218939	              s__Streptomyces leeuwenhoekii
  0.0000	1	1	subspecies	218941	                RS_GCF_001013905.1
  0.0000	1	0	species	299081	              s__Streptomyces sp009796285
  0.0000	1	1	subspecies	299082	                RS_GCF_009796285.1
  0.0000	1	0	species	300108	              s__Streptomyces ficellus
  0.0000	1	1	subspecies	300109	                RS_GCF_009739905.1
  0.0000	1	0	species	206045	              s__Streptomyces calvus
  0.0000	1	1	subspecies	206048	                RS_GCF_006716135.1
  0.0000	1	0	species	301693	              s__Streptomyces seoulensis_A
  0.0000	1	1	subspecies	301694	                RS_GCF_013364255.1
  0.0000	1	0	species	304205	              s__Streptomyces olivoreticuli
  0.0000	1	1	subspecies	304206	                RS_GCF_003391135.1
  0.0000	1	0	species	306486	              s__Streptomyces sp009498275
  0.0000	1	1	subspecies	306487	                RS_GCF_009498275.1
  0.0000	1	0	species	307579	              s__Streptomyces cyaneochromogenes
  0.0000	1	1	subspecies	307580	                RS_GCF_003963535.1
  0.0000	1	0	species	315027	              s__Streptomyces qinzhouensis
  0.0000	1	1	subspecies	315028	                RS_GCF_007856155.1
  0.0000	1	0	species	316488	              s__Streptomyces sp013364155
  0.0000	1	1	subspecies	316489	                RS_GCF_013364155.1
  0.0000	1	0	species	317336	              s__Streptomyces sp009834125
  0.0000	1	1	subspecies	317337	                RS_GCF_009834125.1
  0.0000	1	0	species	214699	              s__Streptomyces parvulus
  0.0000	1	1	subspecies	214700	                RS_GCF_001660045.1
  0.0000	1	0	species	224550	              s__Streptomyces hawaiiensis
  0.0000	1	1	subspecies	224552	                RS_GCF_004803895.1
  0.0000	1	0	species	192575	              s__Streptomyces griseofuscus
  0.0000	1	1	subspecies	192580	                RS_GCF_008064995.1
  0.0000	1	0	species	230204	              s__Streptomyces aquilus
  0.0000	1	1	subspecies	230205	                RS_GCF_003955715.1
  0.0000	1	0	species	231443	              s__Streptomyces collinus
  0.0000	1	1	subspecies	231446	                RS_GCF_001611795.1
  0.0000	1	0	species	193407	              s__Streptomyces sioyaensis
  0.0000	1	1	subspecies	193412	                RS_GCF_900221035.1
  0.0000	1	0	species	238827	              s__Streptomyces lavendulae_C
  0.0000	1	1	subspecies	238829	                RS_GCF_002803845.1
  0.0000	1	0	species	240259	              s__Streptomyces globosus
  0.0000	1	1	subspecies	240260	                RS_GCF_003325375.1
  0.0000	1	0	species	226255	              s__Streptomyces harbinensis
  0.0000	1	1	subspecies	226256	                RS_GCF_013364095.1
  0.0000	1	0	species	226213	              s__Streptomyces sp003046555
  0.0000	1	1	subspecies	226215	                RS_GCF_004104505.1
  0.0000	1	0	species	225698	              s__Streptomyces puniciscabiei
  0.0000	1	1	subspecies	225700	                GB_GCA_001027185.1
  0.0000	1	0	species	228934	              s__Streptomyces yunnanensis
  0.0000	1	1	subspecies	228937	                RS_GCF_000816025.1
  0.0000	1	0	species	179184	              s__Streptomyces sp000177195
  0.0000	1	1	subspecies	179197	                RS_GCF_000177195.2
  0.0000	1	0	species	243285	              s__Streptomyces sp900129855
  0.0000	1	1	subspecies	243287	                RS_GCF_900129855.1
  0.0000	1	0	species	201305	              s__Streptomyces albogriseolus
  0.0000	1	1	subspecies	201310	                GB_GCA_008931705.1
  0.0000	1	0	species	178363	              s__Streptomyces rubiginosohelvolus
  0.0000	1	1	subspecies	178379	                RS_GCF_000261345.2
  0.0000	1	0	species	255376	              s__Streptomyces subrutilus
  0.0000	1	1	subspecies	255377	                RS_GCF_008704535.1
  0.0000	1	0	species	173283	              s__Streptomyces cinnamonensis
  0.0000	1	1	subspecies	173284	                RS_GCF_014217585.1
  0.0000	1	0	species	260265	              s__Streptomyces roseochromogenus
  0.0000	1	1	subspecies	260266	                RS_GCF_000497445.1
  0.0000	1	0	species	203796	              s__Streptomyces sindenensis
  0.0000	1	1	subspecies	203800	                RS_GCF_002832675.1
  0.0836	12234	0	genus	231286	            g__Streptomyces_C
  0.0836	12234	11811	species	231287	              s__Streptomyces_C cattleya
  0.0015	221	221	subspecies	231289	                RS_GCF_000240165.1
  0.0014	202	202	subspecies	231290	                RS_GCF_000237305.1
  0.0000	1	0	genus	188459	            g__Kitasatospora
  0.0000	1	0	species	230846	              s__Kitasatospora setae
  0.0000	1	1	subspecies	230848	                RS_GCF_000269985.1
  0.0000	1	0	genus	272190	            g__SCUT-3
  0.0000	1	0	species	272191	              s__SCUT-3 sp014083985
  0.0000	1	1	subspecies	272192	                RS_GCF_014083985.1
  3.0223	442369	75	order	130506	        o__Actinomycetales
  1.4271	208891	6	family	130507	          f__Bifidobacteriaceae
  1.3432	196608	6663	genus	130508	            g__Bifidobacterium
  0.0841	12303	1552	species	201392	              s__Bifidobacterium indicum
  0.0368	5386	5386	subspecies	201395	                RS_GCF_000737865.1
  0.0367	5365	5365	subspecies	201394	                RS_GCF_000706765.1
  0.0840	12291	12282	species	172174	              s__Bifidobacterium dentium
  0.0001	9	9	subspecies	172178	                RS_GCF_001042595.1
  0.0839	12274	11642	species	151048	              s__Bifidobacterium animalis
  0.0037	539	539	subspecies	151057	                RS_GCF_003428375.1
  0.0002	31	31	subspecies	151103	                RS_GCF_001688645.2
  0.0002	27	27	subspecies	151060	                RS_GCF_000471945.1
  0.0001	11	11	subspecies	151051	                RS_GCF_000695895.1
  0.0001	9	9	subspecies	151124	                RS_GCF_000021425.1
  0.0000	6	6	subspecies	151098	                RS_GCF_000816205.1
  0.0000	3	3	subspecies	151114	                RS_GCF_003390755.1
  0.0000	2	2	subspecies	151119	                RS_GCF_003606305.1
  0.0000	1	1	subspecies	151058	                RS_GCF_008041995.1
  0.0000	1	1	subspecies	151073	                RS_GCF_000277325.1
  0.0000	1	1	subspecies	151123	                RS_GCF_000224965.2
  0.0000	1	1	subspecies	151130	                GB_GCA_000022965.1
  0.0839	12274	12274	species	184298	              s__Bifidobacterium thermophilum
  0.0838	12267	12217	species	212617	              s__Bifidobacterium asteroides
  0.0002	35	35	subspecies	212619	                RS_GCF_002715865.1
  0.0001	15	15	subspecies	212618	                RS_GCF_000304215.1
  0.0837	12254	1716	species	154508	              s__Bifidobacterium globosum
  0.0395	5781	5781	subspecies	154549	                RS_GCF_002706665.1
  0.0324	4740	4740	subspecies	154525	                RS_GCF_000800475.2
  0.0001	17	17	subspecies	154568	                RS_GCF_002282915.1
  0.0836	12235	1790	species	203616	              s__Bifidobacterium angulatum
  0.0358	5235	5235	subspecies	203618	                RS_GCF_000966445.2
  0.0356	5210	5210	subspecies	203619	                RS_GCF_001025155.1
  0.0835	12225	10389	species	147664	              s__Bifidobacterium bifidum
  0.0110	1605	1605	subspecies	147703	                RS_GCF_000165905.1
  0.0007	104	104	subspecies	147760	                RS_GCF_003573895.1
  0.0002	36	36	subspecies	147729	                GB_GCA_003573955.1
  0.0002	30	30	subspecies	147750	                RS_GCF_002845845.1
  0.0002	29	29	subspecies	147762	                RS_GCF_000164965.1
  0.0001	16	16	subspecies	147747	                RS_GCF_000265095.1
  0.0001	12	12	subspecies	147726	                RS_GCF_001281345.1
  0.0000	4	4	subspecies	147669	                RS_GCF_900637095.1
  0.0834	12213	9737	species	152302	              s__Bifidobacterium adolescentis
  0.0156	2279	2279	subspecies	152325	                RS_GCF_003856735.1
  0.0006	93	93	subspecies	152379	                RS_GCF_000737885.1
  0.0002	36	36	subspecies	152347	                RS_GCF_000010425.1
  0.0002	24	24	subspecies	152334	                RS_GCF_003030905.1
  0.0002	23	23	subspecies	152371	                RS_GCF_009832825.1
  0.0001	19	19	subspecies	152341	                RS_GCF_003429385.1
  0.0000	1	1	subspecies	152327	                RS_GCF_000817995.1
  0.0000	1	1	subspecies	152336	                RS_GCF_902386735.1
  0.0834	12207	8801	species	160344	              s__Bifidobacterium vaginale
  0.0210	3080	3080	subspecies	160363	                RS_GCF_003812765.1
  0.0014	201	201	subspecies	160386	                RS_GCF_000213955.1
  0.0008	110	110	subspecies	160352	                RS_GCF_000159155.2
  0.0001	13	13	subspecies	160375	                RS_GCF_900105405.1
  0.0000	1	1	subspecies	160370	                RS_GCF_001042655.1
  0.0000	1	1	subspecies	160384	                RS_GCF_900637625.1
  0.0829	12129	5255	species	165923	              s__Bifidobacterium vaginale_G
  0.0239	3501	3501	subspecies	165944	                RS_GCF_001953155.1
  0.0214	3132	3132	subspecies	165943	                RS_GCF_000025205.1
  0.0016	241	241	subspecies	165954	                RS_GCF_003293675.1
  0.0790	11570	3444	species	151133	              s__Bifidobacterium pseudocatenulatum
  0.0278	4067	4067	subspecies	151172	                RS_GCF_001025215.1
  0.0277	4059	4059	subspecies	151160	                RS_GCF_003952825.1
  0.0772	11304	9233	species	146761	              s__Bifidobacterium breve
  0.0072	1050	1050	subspecies	146767	                RS_GCF_002838225.1
  0.0050	735	735	subspecies	146766	                RS_GCF_001990225.1
  0.0008	115	115	subspecies	146780	                RS_GCF_000213865.1
  0.0002	27	27	subspecies	146782	                RS_GCF_902167875.1
  0.0001	21	21	subspecies	146857	                RS_GCF_000568975.1
  0.0001	17	17	subspecies	146852	                RS_GCF_002838485.1
  0.0001	12	12	subspecies	146801	                RS_GCF_002838325.1
  0.0001	8	8	subspecies	146799	                RS_GCF_003860285.1
  0.0001	8	8	subspecies	146835	                RS_GCF_002838405.1
  0.0001	8	8	subspecies	146830	                RS_GCF_000569015.1
  0.0000	7	7	subspecies	146861	                RS_GCF_000568955.1
  0.0000	6	6	subspecies	146779	                RS_GCF_002838425.1
  0.0000	6	6	subspecies	146800	                RS_GCF_002838365.1
  0.0000	5	5	subspecies	146865	                RS_GCF_002838565.1
  0.0000	4	4	subspecies	146863	                RS_GCF_002838305.1
  0.0000	4	4	subspecies	146869	                RS_GCF_001281425.1
  0.0000	4	4	subspecies	146874	                RS_GCF_000569055.1
  0.0000	4	4	subspecies	146777	                RS_GCF_002838625.1
  0.0000	3	3	subspecies	146812	                RS_GCF_002838385.1
  0.0000	3	3	subspecies	146833	                RS_GCF_002838465.1
  0.0000	3	3	subspecies	146845	                RS_GCF_000569075.1
  0.0000	3	3	subspecies	146795	                RS_GCF_002838525.1
  0.0000	3	3	subspecies	146867	                RS_GCF_009429085.1
  0.0000	3	3	subspecies	146772	                RS_GCF_002838345.1
  0.0000	3	3	subspecies	146873	                RS_GCF_002838505.1
  0.0000	2	2	subspecies	146807	                RS_GCF_009931415.1
  0.0000	2	2	subspecies	146771	                RS_GCF_003813065.1
  0.0000	1	1	subspecies	146831	                RS_GCF_002838545.1
  0.0000	1	1	subspecies	146849	                RS_GCF_001025175.1
  0.0000	1	1	subspecies	146794	                RS_GCF_009498435.1
  0.0000	1	1	subspecies	146784	                RS_GCF_002838245.1
  0.0000	1	1	subspecies	146775	                RS_GCF_002838285.1
  0.0759	11112	3400	species	213024	              s__Bifidobacterium kashiwanohense
  0.0268	3925	3925	subspecies	213026	                RS_GCF_009684555.1
  0.0259	3787	3787	subspecies	213028	                RS_GCF_001042615.1
  0.0754	11039	11039	species	194916	              s__Bifidobacterium catenulatum
  0.0672	9842	9659	species	162898	              s__Bifidobacterium infantis
  0.0006	88	88	subspecies	162917	                RS_GCF_004919065.2
  0.0006	86	86	subspecies	162912	                RS_GCF_001281305.1
  0.0000	5	5	subspecies	162932	                RS_GCF_902167885.1
  0.0000	4	4	subspecies	162902	                RS_GCF_000269965.1
  0.0027	389	220	species	130509	              s__Bifidobacterium longum
  0.0004	52	52	subspecies	130697	                RS_GCF_900103055.1
  0.0001	13	13	subspecies	130750	                RS_GCF_001446275.1
  0.0001	13	13	subspecies	130517	                RS_GCF_011764605.1
  0.0001	8	8	subspecies	130608	                RS_GCF_001725985.1
  0.0000	7	7	subspecies	130534	                RS_GCF_009738515.1
  0.0000	7	7	subspecies	130726	                RS_GCF_014334075.1
  0.0000	7	7	subspecies	130615	                RS_GCF_000008945.1
  0.0000	6	6	subspecies	130822	                RS_GCF_001293145.1
  0.0000	6	6	subspecies	130551	                RS_GCF_000497735.1
  0.0000	5	5	subspecies	130720	                RS_GCF_013393765.1
  0.0000	5	5	subspecies	130746	                RS_GCF_000007525.1
  0.0000	5	5	subspecies	130559	                RS_GCF_009728915.1
  0.0000	4	4	subspecies	130571	                RS_GCF_014334375.1
  0.0000	4	4	subspecies	130730	                RS_GCF_000210755.1
  0.0000	3	3	subspecies	130764	                RS_GCF_008086305.1
  0.0000	3	3	subspecies	130817	                RS_GCF_000772485.1
  0.0000	3	3	subspecies	130664	                RS_GCF_000166315.1
  0.0000	3	3	subspecies	130602	                RS_GCF_000219455.1
  0.0000	3	3	subspecies	130557	                RS_GCF_003342655.1
  0.0000	3	3	subspecies	130544	                RS_GCF_009931635.1
  0.0000	2	2	subspecies	130702	                RS_GCF_004936435.1
  0.0000	2	2	subspecies	130742	                RS_GCF_001719085.1
  0.0000	1	1	subspecies	130639	                RS_GCF_000829295.1
  0.0000	1	1	subspecies	130555	                RS_GCF_001446255.1
  0.0000	1	1	subspecies	130765	                RS_GCF_001051015.2
  0.0000	1	1	subspecies	130552	                RS_GCF_005406285.1
  0.0000	1	1	subspecies	130828	                RS_GCF_000730205.1
  0.0001	17	0	species	276304	              s__Bifidobacterium kashiwanohense_A
  0.0001	17	17	subspecies	276305	                RS_GCF_000800455.1
  0.0839	12277	0	genus	212125	            g__Parascardovia
  0.0839	12277	12274	species	212126	              s__Parascardovia denticolens
  0.0000	3	3	subspecies	212130	                RS_GCF_000191785.1
  0.6722	98391	53	family	158535	          f__Microbacteriaceae
  0.2520	36879	203	genus	161793	            g__Clavibacter
  0.0837	12244	8505	species	202926	              s__Clavibacter capsici
  0.0237	3476	3476	subspecies	202928	                RS_GCF_011801245.1
  0.0012	181	181	subspecies	202932	                GB_GCA_011801225.1
  0.0005	71	71	subspecies	202927	                RS_GCF_011801265.1
  0.0001	11	11	subspecies	202930	                RS_GCF_001280205.1
  0.0835	12217	11037	species	195145	              s__Clavibacter insidiosus
  0.0055	805	805	subspecies	195146	                RS_GCF_003076355.1
  0.0021	306	306	subspecies	195147	                RS_GCF_003076335.1
  0.0005	69	69	subspecies	195152	                RS_GCF_000958465.1
  0.0833	12187	11723	species	201887	              s__Clavibacter nebraskensis
  0.0027	395	395	subspecies	201889	                RS_GCF_009739595.2
  0.0005	66	66	subspecies	201888	                RS_GCF_000355695.1
  0.0000	3	3	subspecies	201893	                RS_GCF_009739615.2
  0.0001	16	9	species	161794	              s__Clavibacter michiganensis
  0.0000	2	2	subspecies	161811	                RS_GCF_011995885.1
  0.0000	2	2	subspecies	161824	                RS_GCF_011995665.1
  0.0000	2	2	subspecies	161825	                RS_GCF_009739655.1
  0.0000	1	1	subspecies	161797	                RS_GCF_000063485.1
  0.0001	12	0	species	227515	              s__Clavibacter sepedonicus
  0.0001	12	12	subspecies	227517	                RS_GCF_000069225.1
  0.1680	24589	505	genus	179759	            g__Microbacterium
  0.0834	12200	1986	species	210648	              s__Microbacterium sp001889265
  0.0352	5152	5152	subspecies	210649	                RS_GCF_001889265.1
  0.0346	5062	5062	subspecies	210651	                RS_GCF_001266755.1
  0.0809	11844	3218	species	198892	              s__Microbacterium paraoxydans
  0.0302	4424	4424	subspecies	198897	                RS_GCF_900105335.1
  0.0287	4202	4202	subspecies	198898	                RS_GCF_002993305.1
  0.0001	18	0	species	323989	              s__Microbacterium sp002848265
  0.0001	18	18	subspecies	323990	                RS_GCF_002848265.1
  0.0001	12	0	species	190176	              s__Microbacterium sp001595495
  0.0001	12	12	subspecies	190185	                RS_GCF_001558975.1
  0.0000	3	0	species	241294	              s__Microbacterium foliorum
  0.0000	3	3	subspecies	241295	                RS_GCF_003367705.1
  0.0000	3	0	species	244718	              s__Microbacterium sp002456035
  0.0000	3	3	subspecies	244720	                RS_GCF_904066215.1
  0.0000	1	0	species	195129	              s__Microbacterium maritypicum
  0.0000	1	1	subspecies	195134	                RS_GCF_004000565.1
  0.0000	1	0	species	220926	              s__Microbacterium foliorum_A
  0.0000	1	1	subspecies	220929	                RS_GCF_002024885.1
  0.0000	1	0	species	282591	              s__Microbacterium foliorum_B
  0.0000	1	1	subspecies	282592	                RS_GCF_006385575.1
  0.0000	1	0	species	293589	              s__Microbacterium sp001314225
  0.0000	1	1	subspecies	293590	                RS_GCF_001314225.1
  0.1679	24582	93	genus	158536	            g__Rathayibacter
  0.0839	12287	12228	species	171239	              s__Rathayibacter toxicus
  0.0003	39	39	subspecies	171261	                RS_GCF_001465855.1
  0.0001	20	20	subspecies	171248	                RS_GCF_000875675.1
  0.0831	12169	1157	species	186928	              s__Rathayibacter festucae
  0.0376	5510	5510	subspecies	186932	                RS_GCF_004011135.1
  0.0376	5502	5502	subspecies	186930	                RS_GCF_009834205.1
  0.0001	12	0	species	255629	              s__Rathayibacter sp009866655
  0.0001	12	12	subspecies	255630	                RS_GCF_009866655.1
  0.0001	11	0	species	322275	              s__Rathayibacter sp009834185
  0.0001	11	11	subspecies	322276	                RS_GCF_009834185.1
  0.0001	9	1	species	158537	              s__Rathayibacter sp002930885
  0.0001	8	8	subspecies	158545	                RS_GCF_009834245.1
  0.0000	1	0	species	314555	              s__Rathayibacter sp009834225
  0.0000	1	1	subspecies	314556	                RS_GCF_009834225.1
  0.0839	12287	0	genus	221060	            g__Cnuibacter
  0.0839	12287	600	species	221061	              s__Cnuibacter physcomitrellae
  0.0402	5889	5889	subspecies	221063	                RS_GCF_002096055.1
  0.0396	5798	5798	subspecies	221062	                RS_GCF_003347035.1
  0.0000	1	0	genus	180149	            g__Cryobacterium
  0.0000	1	0	species	274770	              s__Cryobacterium arcticum_A
  0.0000	1	1	subspecies	274771	                RS_GCF_001679725.1
  0.6715	98290	74	family	149397	          f__Micrococcaceae
  0.1679	24579	270	genus	172397	            g__Rothia
  0.0837	12255	470	species	190619	              s__Rothia aeria
  0.0403	5896	5896	subspecies	190628	                RS_GCF_002355935.1
  0.0402	5889	5889	subspecies	190627	                RS_GCF_900637985.1
  0.0822	12036	1056	species	176194	              s__Rothia sp001808955
  0.0378	5534	5534	subspecies	176202	                RS_GCF_002386365.1
  0.0372	5446	5446	subspecies	176197	                RS_GCF_000011025.1
  0.0001	13	0	species	245572	              s__Rothia mucilaginosa_B
  0.0001	13	13	subspecies	245574	                RS_GCF_001548235.1
  0.0000	5	0	species	172398	              s__Rothia dentocariosa
  0.0000	3	3	subspecies	172418	                RS_GCF_900638535.1
  0.0000	2	2	subspecies	172414	                RS_GCF_013267735.1
  0.1679	24572	40	genus	192097	            g__Glutamicibacter
  0.0838	12263	2375	species	199251	              s__Glutamicibacter soli
  0.0340	4982	4982	subspecies	199252	                RS_GCF_001454985.1
  0.0335	4906	4906	subspecies	199256	                GB_GCA_001281115.1
  0.0838	12263	2207	species	222389	              s__Glutamicibacter halophytocola
  0.0346	5061	5061	subspecies	222391	                RS_GCF_001302565.1
  0.0341	4995	4995	subspecies	222390	                RS_GCF_007855275.1
  0.0000	3	0	species	220382	              s__Glutamicibacter mishrai
  0.0000	3	3	subspecies	220383	                RS_GCF_012221945.1
  0.0000	2	1	species	192098	              s__Glutamicibacter nicotianae
  0.0000	1	1	subspecies	192100	                RS_GCF_003687415.1
  0.0000	1	0	species	199230	              s__Glutamicibacter arilaitensis
  0.0000	1	1	subspecies	199231	                RS_GCF_000197735.1
  0.1675	24519	96	genus	179777	            g__Kocuria
  0.0835	12221	809	species	182871	              s__Kocuria marina
  0.0390	5711	5711	subspecies	182874	                RS_GCF_011769905.1
  0.0389	5701	5701	subspecies	182876	                RS_GCF_004328535.1
  0.0832	12177	11977	species	194510	              s__Kocuria rhizophila_A
  0.0011	168	168	subspecies	194517	                RS_GCF_003290245.1
  0.0001	21	21	subspecies	194513	                RS_GCF_002208685.2
  0.0001	9	9	subspecies	194515	                RS_GCF_900637835.1
  0.0000	2	2	subspecies	194516	                RS_GCF_000010285.1
  0.0002	23	0	species	196938	              s__Kocuria salsicia
  0.0002	23	23	subspecies	196942	                RS_GCF_002250745.2
  0.0000	1	0	species	195523	              s__Kocuria palustris
  0.0000	1	1	subspecies	195524	                RS_GCF_001275345.1
  0.0000	1	0	species	204931	              s__Kocuria turfanensis
  0.0000	1	1	subspecies	204932	                RS_GCF_001580365.1
  0.0840	12290	0	genus	203909	            g__Renibacterium
  0.0840	12290	12217	species	220316	              s__Renibacterium salmoninarum
  0.0003	47	47	subspecies	220317	                RS_GCF_003343265.1
  0.0002	26	26	subspecies	220318	                RS_GCF_000018885.1
  0.0837	12256	57	genus	183413	            g__Paenarthrobacter
  0.0833	12193	3208	species	235602	              s__Paenarthrobacter aurescens_A
  0.0309	4516	4516	subspecies	235603	                RS_GCF_000294695.2
  0.0305	4469	4469	subspecies	235604	                RS_GCF_000014925.1
  0.0000	6	0	species	183414	              s__Paenarthrobacter ureafaciens
  0.0000	6	6	subspecies	183416	                RS_GCF_001854365.1
  0.0840	12299	2	family	179257	          f__Dermatophilaceae
  0.0840	12297	0	genus	241503	            g__Intrasporangium
  0.0840	12297	5907	species	241504	              s__Intrasporangium calvum
  0.0223	3259	3259	subspecies	241505	                RS_GCF_000184685.1
  0.0214	3131	3131	subspecies	241506	                RS_GCF_003342755.1
  0.0839	12283	0	family	181465	          f__Cellulomonadaceae
  0.0839	12283	0	genus	225658	            g__Jonesia
  0.0839	12283	12269	species	225659	              s__Jonesia denitrificans
  0.0001	14	14	subspecies	225660	                RS_GCF_002209145.2
  0.0829	12139	2	family	189456	          f__Dermabacteraceae
  0.0829	12137	132	genus	192155	            g__Dermabacter
  0.0819	11984	1233	species	225329	              s__Dermabacter vaginalis
  0.0370	5423	5423	subspecies	225330	                RS_GCF_008693925.1
  0.0364	5328	5328	subspecies	225332	                RS_GCF_001678905.1
  0.0001	21	13	species	192156	              s__Dermabacter hominis
  0.0000	5	5	subspecies	192161	                RS_GCF_902381725.1
  0.0000	3	3	subspecies	192157	                RS_GCF_002443115.1
  0.0000	1	0	family	173819	          f__Actinomycetaceae
  0.0000	1	0	genus	173820	            g__Actinomyces
  0.0000	1	0	species	203641	              s__Actinomyces sp013177295
  0.0000	1	1	subspecies	203644	                RS_GCF_013177295.1
  0.2509	36725	0	order	131464	        o__Propionibacteriales
  0.2509	36725	241	family	131465	          f__Propionibacteriaceae
  0.0839	12277	17	genus	203316	            g__Arachnia
  0.0837	12257	12255	species	218446	              s__Arachnia lapidicapta
  0.0000	1	1	subspecies	218447	                RS_GCF_002022225.1
  0.0000	1	1	subspecies	218448	                RS_GCF_900659885.1
  0.0000	2	0	species	237498	              s__Arachnia flava
  0.0000	2	2	subspecies	237500	                RS_GCF_001997295.1
  0.0000	1	0	species	257670	              s__Arachnia flavescens
  0.0000	1	1	subspecies	257671	                RS_GCF_001998865.1
  0.0837	12245	23	genus	131466	            g__Cutibacterium
  0.0835	12220	89	species	171953	              s__Cutibacterium avidum
  0.0415	6072	6072	subspecies	171962	                RS_GCF_000367205.1
  0.0414	6059	6059	subspecies	171975	                RS_GCF_001714705.1
  0.0000	2	2	species	131467	              s__Cutibacterium acnes
  0.0817	11959	107	genus	192460	            g__Acidipropionibacterium
  0.0808	11832	5584	species	203747	              s__Acidipropionibacterium jensenii
  0.0207	3027	3027	subspecies	203749	                RS_GCF_900637925.1
  0.0204	2985	2985	subspecies	203748	                RS_GCF_004011055.1
  0.0013	190	190	subspecies	203751	                RS_GCF_004011075.1
  0.0003	46	46	subspecies	203752	                RS_GCF_005890135.1
  0.0001	20	14	species	192461	              s__Acidipropionibacterium acidipropionici
  0.0000	2	2	subspecies	192464	                RS_GCF_000310065.1
  0.0000	2	2	subspecies	192468	                RS_GCF_005890155.1
  0.0000	2	2	subspecies	192469	                RS_GCF_001602115.1
  0.0000	3	0	genus	162686	            g__Propionibacterium
  0.0000	3	1	species	162687	              s__Propionibacterium freudenreichii
  0.0000	1	1	subspecies	162688	                RS_GCF_000091725.1
  0.0000	1	1	subspecies	162700	                RS_GCF_900087185.1
  0.1681	24600	0	order	157360	        o__Nanopelagicales
  0.1681	24600	0	family	157361	          f__Nanopelagicaceae
  0.1681	24600	30	genus	182781	            g__Planktophila
  0.0840	12295	3231	species	219838	              s__Planktophila lacus
  0.0323	4722	4722	subspecies	219839	                RS_GCF_002287925.1
  0.0296	4327	4327	subspecies	219840	                RS_GCF_002288325.1
  0.0001	15	15	subspecies	219841	                RS_GCF_002288385.1
  0.0838	12273	12271	species	240894	              s__Planktophila sp002284855
  0.0000	1	1	subspecies	240895	                RS_GCF_002284855.1
  0.0000	1	1	subspecies	240896	                GB_GCA_013467635.1
  0.0000	2	0	species	260741	              s__Planktophila sulfonica
  0.0000	2	2	subspecies	260742	                RS_GCF_002288065.1
  0.0000	2	0	order	188638	        o__Streptosporangiales
  0.0000	2	0	family	188639	          f__Streptosporangiaceae
  0.0000	2	0	genus	188640	            g__Nocardiopsis
  0.0000	2	0	species	188641	              s__Nocardiopsis dassonvillei
  0.0000	2	2	subspecies	188648	                RS_GCF_001877055.1
  0.3359	49170	0	class	160984	      c__Coriobacteriia
  0.3359	49170	40	order	160985	        o__Coriobacteriales
  0.3356	49127	87	family	160986	          f__Eggerthellaceae
  0.0840	12300	2	genus	186422	            g__Gordonibacter
  0.0840	12298	12298	species	223784	              s__Gordonibacter massiliensis
  0.0840	12300	0	genus	227612	            g__Slackia
  0.0840	12300	12276	species	247570	              s__Slackia heliotrinireducens
  0.0001	14	14	subspecies	247572	                RS_GCF_900637575.1
  0.0001	10	10	subspecies	247571	                RS_GCF_000023885.1
  0.0836	12235	0	genus	160987	            g__Eggerthella
  0.0836	12235	5473	species	160988	              s__Eggerthella lenta
  0.0233	3409	3409	subspecies	160996	                RS_GCF_000024265.1
  0.0229	3353	3353	subspecies	160995	                RS_GCF_002148255.1
  0.0834	12204	0	genus	235059	            g__Phoenicibacter
  0.0834	12204	12204	species	235060	              s__Phoenicibacter congonensis
  0.0000	1	0	genus	249548	            g__Enteroscipio
  0.0000	1	0	species	287979	              s__Enteroscipio sp000270285
  0.0000	1	1	subspecies	287980	                RS_GCF_000270285.1
  0.0000	3	0	family	166134	          f__Atopobiaceae
  0.0000	3	0	genus	226991	            g__Parolsenella
  0.0000	2	0	species	226992	              s__Parolsenella catena
  0.0000	2	2	subspecies	226993	                RS_GCF_003966955.1
  0.0000	1	0	species	275227	              s__Parolsenella massiliensis
  0.0000	1	1	subspecies	275228	                RS_GCF_900143685.1
  4.0334	590364	0	phylum	139581	    p__Bacteroidota
  3.7813	553464	598	class	139582	      c__Bacteroidia
  2.6857	393105	47	order	145169	        o__Flavobacteriales
  1.1761	172151	125	family	145170	          f__Flavobacteriaceae
  0.4200	61479	614	genus	145171	            g__Flavobacterium
  0.0840	12296	12282	species	244843	              s__Flavobacterium psychrophilum_A
  0.0000	7	7	subspecies	244844	                GB_GCA_001431805.1
  0.0000	7	7	subspecies	244845	                GB_GCA_001708385.1
  0.0840	12290	1207	species	210643	              s__Flavobacterium anhuiense
  0.0383	5600	5600	subspecies	210645	                RS_GCF_003590565.1
  0.0375	5483	5483	subspecies	210644	                RS_GCF_001705175.1
  0.0839	12283	1186	species	197528	              s__Flavobacterium johnsoniae
  0.0380	5556	5556	subspecies	197535	                RS_GCF_008329825.1
  0.0379	5541	5541	subspecies	197532	                RS_GCF_000016645.1
  0.0820	12000	9949	species	192212	              s__Flavobacterium columnare
  0.0124	1808	1808	subspecies	192214	                RS_GCF_000240075.2
  0.0010	149	149	subspecies	192218	                RS_GCF_001580475.1
  0.0006	92	92	subspecies	192216	                RS_GCF_001677395.1
  0.0000	2	2	subspecies	192220	                RS_GCF_001936395.1
  0.0819	11994	7230	species	186512	              s__Flavobacterium columnare_A
  0.0163	2393	2393	subspecies	186518	                RS_GCF_001534645.1
  0.0162	2371	2371	subspecies	186517	                RS_GCF_001641185.1
  0.0000	2	0	species	223625	              s__Flavobacterium nitrogenifigens
  0.0000	2	2	subspecies	223628	                RS_GCF_008369745.1
  0.4199	61457	471	genus	179166	            g__Capnocytophaga
  0.0838	12267	12251	species	226464	              s__Capnocytophaga haemolytica
  0.0001	10	10	subspecies	226467	                RS_GCF_900187255.1
  0.0000	6	6	subspecies	226466	                RS_GCF_001553545.1
  0.0837	12245	7409	species	183609	              s__Capnocytophaga canimorsus
  0.0251	3667	3667	subspecies	183611	                RS_GCF_002302655.1
  0.0072	1051	1051	subspecies	183612	                RS_GCF_003146745.1
  0.0003	41	41	subspecies	183617	                RS_GCF_002302445.1
  0.0002	31	31	subspecies	183614	                RS_GCF_002302565.1
  0.0002	28	28	subspecies	183620	                RS_GCF_900638435.1
  0.0001	9	9	subspecies	183619	                RS_GCF_000220625.1
  0.0001	9	9	subspecies	183621	                RS_GCF_003795085.1
  0.0833	12195	214	species	208460	              s__Capnocytophaga leadbetteri
  0.0410	5994	5994	subspecies	208461	                RS_GCF_009730375.1
  0.0409	5987	5987	subspecies	208464	                RS_GCF_002302615.1
  0.0832	12179	5321	species	195205	              s__Capnocytophaga sputigena
  0.0307	4493	4493	subspecies	195206	                RS_GCF_002302595.1
  0.0153	2240	2240	subspecies	195209	                RS_GCF_002302495.1
  0.0008	117	117	subspecies	195212	                RS_GCF_002302395.1
  0.0001	8	8	subspecies	195211	                RS_GCF_900638125.1
  0.0825	12072	2907	species	188101	              s__Capnocytophaga canis
  0.0315	4610	4610	subspecies	188107	                RS_GCF_002302535.1
  0.0311	4555	4555	subspecies	188109	                RS_GCF_002302515.1
  0.0001	13	2	species	179167	              s__Capnocytophaga ochracea
  0.0000	4	4	subspecies	179173	                RS_GCF_013394735.1
  0.0000	3	3	subspecies	179169	                RS_GCF_000023285.1
  0.0000	2	2	subspecies	179172	                RS_GCF_002998835.1
  0.0000	2	2	subspecies	179180	                RS_GCF_001278825.1
  0.0000	5	0	species	241099	              s__Capnocytophaga endodontalis
  0.0000	5	5	subspecies	241100	                RS_GCF_002209445.1
  0.0000	5	0	species	314486	              s__Capnocytophaga sp002999135
  0.0000	5	5	subspecies	314487	                RS_GCF_002999135.1
  0.0000	3	0	species	304893	              s__Capnocytophaga stomatis
  0.0000	3	3	subspecies	304894	                RS_GCF_002302635.1
  0.0000	2	0	species	209226	              s__Capnocytophaga cynodegmi
  0.0000	2	2	subspecies	209229	                RS_GCF_002302475.1
  0.0840	12290	95	genus	170437	            g__Tenacibaculum
  0.0832	12181	12170	species	208018	              s__Tenacibaculum mesophilum
  0.0000	6	6	subspecies	208021	                RS_GCF_003867075.1
  0.0000	5	5	subspecies	208019	                RS_GCF_009362255.1
  0.0001	14	0	species	255943	              s__Tenacibaculum litoreum
  0.0001	14	14	subspecies	255945	                RS_GCF_003867015.1
  0.0839	12285	0	genus	198022	            g__Cellulophaga
  0.0839	12285	6506	species	201231	              s__Cellulophaga lytica
  0.0260	3802	3802	subspecies	201235	                RS_GCF_001941605.1
  0.0134	1964	1964	subspecies	201233	                RS_GCF_000190595.1
  0.0001	13	13	subspecies	201237	                RS_GCF_000750195.1
  0.0838	12262	0	genus	226113	            g__Mesoflavibacter
  0.0838	12262	12256	species	235219	              s__Mesoflavibacter sp003008475
  0.0000	3	3	subspecies	235220	                RS_GCF_003008415.2
  0.0000	3	3	subspecies	235221	                RS_GCF_003008475.2
  0.0837	12253	7	genus	194053	            g__Polaribacter
  0.0837	12246	189	species	237355	              s__Polaribacter sp002005425
  0.0412	6030	6030	subspecies	237357	                RS_GCF_002005425.1
  0.0412	6027	6027	subspecies	237356	                RS_GCF_900143115.1
  1.1731	171708	1308	family	149005	          f__Weeksellaceae
  0.7476	109428	1985	genus	158364	            g__Chryseobacterium
  0.0838	12269	1816	species	229492	              s__Chryseobacterium gallinarum
  0.0358	5242	5242	subspecies	229493	                RS_GCF_001021975.1
  0.0356	5211	5211	subspecies	229494	                RS_GCF_012273615.1
  0.0837	12254	11984	species	211306	              s__Chryseobacterium sp003182335
  0.0009	135	135	subspecies	211307	                GB_GCA_004137745.1
  0.0009	135	135	subspecies	211308	                GB_GCA_009648535.1
  0.0833	12189	296	species	207887	              s__Chryseobacterium indoltheticum
  0.0408	5976	5976	subspecies	207892	                RS_GCF_003815915.1
  0.0404	5917	5917	subspecies	207890	                RS_GCF_003815895.1
  0.0817	11963	11955	species	227478	              s__Chryseobacterium lactis
  0.0000	5	5	subspecies	227480	                RS_GCF_003815755.1
  0.0000	3	3	subspecies	227479	                RS_GCF_003815875.1
  0.0811	11868	11363	species	208512	              s__Chryseobacterium carnipullorum
  0.0018	260	260	subspecies	208514	                RS_GCF_003815855.1
  0.0017	245	245	subspecies	208517	                RS_GCF_003815695.1
  0.0808	11827	11819	species	256899	              s__Chryseobacterium nakagawai
  0.0000	5	5	subspecies	256900	                RS_GCF_003815735.1
  0.0000	3	3	subspecies	256901	                RS_GCF_900637665.1
  0.0801	11727	2922	species	233042	              s__Chryseobacterium bernardetii_A
  0.0314	4598	4598	subspecies	233043	                RS_GCF_003815975.1
  0.0287	4207	4207	subspecies	233044	                RS_GCF_003815955.1
  0.0799	11702	6649	species	211405	              s__Chryseobacterium shandongense
  0.0329	4812	4812	subspecies	211406	                RS_GCF_003815615.1
  0.0016	233	233	subspecies	211407	                RS_GCF_003815835.1
  0.0001	8	8	subspecies	211408	                RS_GCF_003815635.1
  0.0792	11587	1125	species	208402	              s__Chryseobacterium gleum
  0.0378	5539	5539	subspecies	208403	                RS_GCF_004328965.1
  0.0336	4923	4923	subspecies	208407	                RS_GCF_900636535.1
  0.0003	37	0	species	308182	              s__Chryseobacterium sp003815715
  0.0003	37	37	subspecies	308183	                RS_GCF_003815715.1
  0.0000	4	1	species	158365	              s__Chryseobacterium indologenes
  0.0000	2	2	subspecies	158409	                RS_GCF_900683405.1
  0.0000	1	1	subspecies	158392	                RS_GCF_003812865.1
  0.0000	4	0	species	230699	              s__Chryseobacterium balustinum
  0.0000	4	4	subspecies	230701	                RS_GCF_003815995.1
  0.0000	3	0	species	266031	              s__Chryseobacterium indologenes_F
  0.0000	3	3	subspecies	266032	                RS_GCF_002025665.1
  0.0000	2	0	species	257606	              s__Chryseobacterium glaciei
  0.0000	2	2	subspecies	257607	                RS_GCF_001648155.1
  0.0000	2	0	species	266371	              s__Chryseobacterium sp003669035
  0.0000	2	2	subspecies	266372	                RS_GCF_003669035.1
  0.0000	1	0	species	224312	              s__Chryseobacterium joostei
  0.0000	1	1	subspecies	224314	                RS_GCF_003815775.1
  0.0000	1	0	species	237551	              s__Chryseobacterium taihuense
  0.0000	1	1	subspecies	237552	                RS_GCF_900683625.1
  0.0000	1	0	species	216834	              s__Chryseobacterium arthrosphaerae
  0.0000	1	1	subspecies	216837	                RS_GCF_003812705.1
  0.0000	1	0	species	278484	              s__Chryseobacterium sp003815655
  0.0000	1	1	subspecies	278485	                RS_GCF_003815655.1
  0.0000	1	0	species	215349	              s__Chryseobacterium cucumeris
  0.0000	1	1	subspecies	215351	                GB_GCA_009648515.1
  0.2489	36429	722	genus	149006	            g__Elizabethkingia
  0.0837	12246	7333	species	159782	              s__Elizabethkingia meningoseptica
  0.0331	4847	4847	subspecies	159797	                RS_GCF_002022145.1
  0.0005	66	66	subspecies	159818	                GB_GCA_007923165.1
  0.0803	11748	10143	species	186270	              s__Elizabethkingia bruuniana
  0.0076	1112	1112	subspecies	186271	                RS_GCF_007923145.1
  0.0027	399	399	subspecies	186272	                RS_GCF_002024805.1
  0.0003	51	51	subspecies	186280	                RS_GCF_000955665.1
  0.0003	43	43	subspecies	186281	                RS_GCF_002557775.1
  0.0798	11678	4535	species	173635	              s__Elizabethkingia miricola
  0.0379	5544	5544	subspecies	173643	                RS_GCF_005234115.1
  0.0107	1565	1565	subspecies	173649	                RS_GCF_009938095.1
  0.0002	34	34	subspecies	173651	                GB_GCA_005844065.1
  0.0002	33	20	species	149007	              s__Elizabethkingia anophelis
  0.0000	3	3	subspecies	149010	                RS_GCF_001011675.1
  0.0000	3	3	subspecies	149069	                RS_GCF_009810215.1
  0.0000	3	3	subspecies	149085	                RS_GCF_002024825.1
  0.0000	2	2	subspecies	149039	                RS_GCF_009697265.1
  0.0000	1	1	subspecies	149009	                RS_GCF_002022025.1
  0.0000	1	1	subspecies	149096	                RS_GCF_002022045.1
  0.0000	2	0	species	209404	              s__Elizabethkingia ursingii
  0.0000	2	2	subspecies	209409	                RS_GCF_002022125.1
  0.0839	12278	0	genus	158980	            g__Riemerella
  0.0839	12278	11605	species	158981	              s__Riemerella anatipestifer
  0.0035	515	515	subspecies	158990	                RS_GCF_000295655.1
  0.0005	78	78	subspecies	158999	                RS_GCF_006385095.1
  0.0002	25	25	subspecies	159034	                RS_GCF_002025185.1
  0.0001	17	17	subspecies	159000	                RS_GCF_001670765.2
  0.0001	16	16	subspecies	159021	                RS_GCF_000734055.1
  0.0001	13	13	subspecies	159001	                GB_GCA_001051075.1
  0.0000	4	4	subspecies	159016	                GB_GCA_000191565.1
  0.0000	3	3	subspecies	159027	                RS_GCF_000331695.1
  0.0000	1	1	subspecies	158991	                RS_GCF_900186945.1
  0.0000	1	1	subspecies	159023	                GB_GCA_001051115.1
  0.0838	12263	0	genus	214853	            g__Weeksella
  0.0838	12263	12202	species	214854	              s__Weeksella virosa
  0.0002	32	32	subspecies	214858	                RS_GCF_000189415.1
  0.0002	29	29	subspecies	214855	                RS_GCF_900637795.1
  0.0000	2	0	genus	213416	            g__Epilithonimonas
  0.0000	2	0	species	225796	              s__Epilithonimonas bovis
  0.0000	2	2	subspecies	225799	                RS_GCF_012273575.1
  0.3361	49199	0	family	186772	          f__Blattabacteriaceae
  0.3361	49199	44	genus	186773	            g__Blattabacterium
  0.0841	12307	266	species	207760	              s__Blattabacterium sp000334405
  0.0415	6072	6072	subspecies	207761	                RS_GCF_014252515.1
  0.0406	5941	5941	subspecies	207762	                RS_GCF_000334405.1
  0.0001	15	15	subspecies	207764	                RS_GCF_014251295.1
  0.0000	7	7	subspecies	207763	                RS_GCF_000093165.1
  0.0000	6	6	subspecies	207765	                RS_GCF_014251355.1
  0.0840	12294	26	species	217305	              s__Blattabacterium cuenoti_B
  0.0419	6140	6140	subspecies	217306	                RS_GCF_014251755.1
  0.0418	6125	6125	subspecies	217307	                RS_GCF_014251615.1
  0.0000	2	2	subspecies	217309	                RS_GCF_002355135.1
  0.0000	1	1	subspecies	217308	                RS_GCF_000348805.1
  0.0839	12282	702	species	211337	              s__Blattabacterium cuenoti_C
  0.0421	6164	6164	subspecies	211339	                RS_GCF_014251675.1
  0.0367	5377	5377	subspecies	211338	                RS_GCF_014251515.1
  0.0001	20	20	subspecies	211340	                RS_GCF_014251735.1
  0.0001	19	19	subspecies	211341	                RS_GCF_014252235.1
  0.0838	12269	172	species	249007	              s__Blattabacterium cuenoti_D
  0.0414	6053	6053	subspecies	249009	                RS_GCF_014252055.1
  0.0413	6044	6044	subspecies	249008	                RS_GCF_014251535.1
  0.0000	1	0	species	272750	              s__Blattabacterium cuenoti_N
  0.0000	1	1	subspecies	272751	                RS_GCF_014251575.1
  0.0000	1	0	species	277827	              s__Blattabacterium cuenoti_Q
  0.0000	1	1	subspecies	277828	                RS_GCF_014251595.1
  0.0000	1	0	species	323922	              s__Blattabacterium cuenoti_AM
  0.0000	1	1	subspecies	323923	                RS_GCF_014251975.1
  1.0915	159758	1839	order	139583	        o__Bacteroidales
  0.6650	97340	1026	family	139584	          f__Bacteroidaceae
  0.4106	60097	3765	genus	139585	            g__Bacteroides
  0.0802	11740	7271	species	167827	              s__Bacteroides fragilis_A
  0.0151	2214	2214	subspecies	167828	                RS_GCF_002849695.1
  0.0146	2141	2141	subspecies	167835	                RS_GCF_000724805.2
  0.0006	93	93	subspecies	167853	                RS_GCF_000724665.2
  0.0001	8	8	subspecies	167845	                RS_GCF_000710375.2
  0.0000	6	6	subspecies	167852	                RS_GCF_013267555.1
  0.0000	5	5	subspecies	167846	                RS_GCF_000724815.2
  0.0000	2	2	subspecies	167847	                RS_GCF_000710365.2
  0.0798	11685	8481	species	142567	              s__Bacteroides fragilis
  0.0111	1626	1626	subspecies	142578	                RS_GCF_000724795.2
  0.0105	1534	1534	subspecies	142576	                RS_GCF_000965785.1
  0.0001	12	12	subspecies	142674	                RS_GCF_000210835.1
  0.0001	11	11	subspecies	142696	                RS_GCF_001286525.1
  0.0001	8	8	subspecies	142732	                RS_GCF_008369705.1
  0.0000	7	7	subspecies	142602	                RS_GCF_000009925.1
  0.0000	6	6	subspecies	142612	                RS_GCF_001682215.1
  0.0797	11673	9166	species	160936	              s__Bacteroides thetaiotaomicron
  0.0166	2434	2434	subspecies	160972	                RS_GCF_001314975.1
  0.0003	43	43	subspecies	160976	                RS_GCF_012151035.1
  0.0002	29	29	subspecies	160961	                RS_GCF_000011065.1
  0.0000	1	1	subspecies	160982	                RS_GCF_014131755.1
  0.0728	10663	10358	species	153848	              s__Bacteroides ovatus
  0.0011	161	161	subspecies	153912	                RS_GCF_007012325.1
  0.0005	78	78	subspecies	153870	                RS_GCF_900095495.1
  0.0003	42	42	subspecies	153901	                RS_GCF_009734165.1
  0.0002	24	24	subspecies	153895	                RS_GCF_001314995.1
  0.0720	10535	1230	species	148906	              s__Bacteroides xylanisolvens
  0.0323	4721	4721	subspecies	148915	                GB_GCA_000210075.1
  0.0313	4584	4584	subspecies	148931	                RS_GCF_006546965.1
  0.0002	28	0	species	201741	              s__Bacteroides sp003463205
  0.0002	28	28	subspecies	201747	                RS_GCF_014334015.1
  0.0000	5	0	species	139586	              s__Bacteroides uniformis
  0.0000	3	3	subspecies	139674	                RS_GCF_006742345.1
  0.0000	1	1	subspecies	139656	                RS_GCF_004328515.1
  0.0000	1	1	subspecies	139714	                RS_GCF_013874375.1
  0.0000	2	0	species	233900	              s__Bacteroides sp007097645
  0.0000	2	2	subspecies	233902	                RS_GCF_009193295.2
  0.0000	1	0	species	159144	              s__Bacteroides caccae
  0.0000	1	1	subspecies	159170	                RS_GCF_002222615.2
  0.1675	24524	189	genus	148192	            g__Prevotella
  0.0831	12160	6002	species	199661	              s__Prevotella melaninogenica
  0.0420	6151	6151	subspecies	199666	                RS_GCF_013267595.1
  0.0000	5	5	subspecies	199663	                RS_GCF_002208725.2
  0.0000	2	2	subspecies	199667	                RS_GCF_000144405.1
  0.0830	12155	705	species	198433	              s__Prevotella denticola
  0.0392	5736	5736	subspecies	198437	                RS_GCF_000193395.1
  0.0390	5714	5714	subspecies	198438	                RS_GCF_003515045.1
  0.0001	8	2	species	166446	              s__Prevotella intermedia
  0.0000	3	3	subspecies	166479	                RS_GCF_002763715.1
  0.0000	2	2	subspecies	166463	                RS_GCF_001953955.1
  0.0000	1	1	subspecies	166460	                RS_GCF_002763575.1
  0.0000	4	0	species	303931	              s__Prevotella melaninogenica_A
  0.0000	4	4	subspecies	303932	                RS_GCF_003609775.1
  0.0000	3	0	species	217073	              s__Prevotella jejuni
  0.0000	3	3	subspecies	217075	                RS_GCF_002849795.1
  0.0000	3	0	species	238144	              s__Prevotella fusca
  0.0000	3	3	subspecies	238146	                RS_GCF_001262015.1
  0.0000	2	0	species	220571	              s__Prevotella scopos
  0.0000	2	2	subspecies	220572	                RS_GCF_001683355.1
  0.0799	11693	485	genus	144517	            g__Phocaeicola
  0.0764	11186	9530	species	153019	              s__Phocaeicola dorei
  0.0103	1510	1510	subspecies	153029	                RS_GCF_013009555.1
  0.0008	112	112	subspecies	153092	                RS_GCF_013010255.1
  0.0001	13	13	subspecies	153038	                GB_GCA_000738045.1
  0.0001	11	11	subspecies	153039	                RS_GCF_013010365.1
  0.0000	5	5	subspecies	153071	                RS_GCF_001640865.1
  0.0000	3	3	subspecies	153055	                GB_GCA_000738065.1
  0.0000	2	2	subspecies	153078	                RS_GCF_013009675.1
  0.0002	22	6	species	144518	              s__Phocaeicola vulgatus
  0.0001	9	9	subspecies	144641	                GB_GCA_001412315.1
  0.0000	5	5	subspecies	144595	                RS_GCF_008728395.1
  0.0000	2	2	subspecies	144579	                RS_GCF_000012825.1
  0.1653	24199	0	family	144117	          f__Tannerellaceae
  0.0840	12294	0	genus	187040	            g__Tannerella
  0.0840	12294	12069	species	214106	              s__Tannerella sp003033925
  0.0008	118	118	subspecies	214108	                RS_GCF_003033925.1
  0.0007	107	107	subspecies	214107	                RS_GCF_001717525.2
  0.0813	11905	0	genus	144118	            g__Parabacteroides
  0.0813	11905	6949	species	144119	              s__Parabacteroides distasonis
  0.0227	3326	3326	subspecies	144131	                RS_GCF_012851305.1
  0.0108	1580	1580	subspecies	144130	                RS_GCF_900683725.1
  0.0001	19	19	subspecies	144157	                RS_GCF_000012845.1
  0.0001	14	14	subspecies	144201	                RS_GCF_006739545.1
  0.0000	7	7	subspecies	144140	                RS_GCF_006149185.1
  0.0000	4	4	subspecies	144175	                RS_GCF_012273055.1
  0.0000	4	4	subspecies	144228	                RS_GCF_013267615.1
  0.0000	2	2	subspecies	144183	                RS_GCF_002257605.1
  0.0840	12300	0	family	178247	          f__Dysgonomonadaceae
  0.0840	12300	0	genus	208505	            g__Dysgonomonas
  0.0840	12300	821	species	232862	              s__Dysgonomonas sp011299555
  0.0392	5742	5742	subspecies	232864	                RS_GCF_011299335.1
  0.0392	5737	5737	subspecies	232863	                RS_GCF_011299555.1
  0.0826	12095	36	family	166815	          f__Marinifilaceae
  0.0824	12059	0	genus	166816	            g__Odoribacter
  0.0824	12059	12005	species	166817	              s__Odoribacter splanchnicus
  0.0002	36	36	subspecies	166824	                RS_GCF_000190535.1
  0.0001	18	18	subspecies	166845	                RS_GCF_900187175.1
  0.0819	11985	0	family	174227	          f__Rikenellaceae
  0.0819	11985	29	genus	174228	            g__Alistipes
  0.0817	11954	2398	species	203293	              s__Alistipes communis
  0.0330	4831	4831	subspecies	203295	                RS_GCF_006542665.1
  0.0323	4725	4725	subspecies	203297	                RS_GCF_006542745.1
  0.0000	1	0	species	174229	              s__Alistipes onderdonkii
  0.0000	1	1	subspecies	174235	                RS_GCF_006542645.1
  0.0000	1	0	species	186581	              s__Alistipes shahii
  0.0000	1	1	subspecies	186592	                RS_GCF_000210575.1
  0.0000	2	0	order	163104	        o__Sphingobacteriales
  0.0000	2	0	family	163105	          f__Sphingobacteriaceae
  0.0000	2	0	genus	163106	            g__Sphingobacterium
  0.0000	1	0	species	187125	              s__Sphingobacterium siyangense
  0.0000	1	1	subspecies	187129	                RS_GCF_002196555.1
  0.0000	1	0	species	234806	              s__Sphingobacterium lactis
  0.0000	1	1	subspecies	234807	                RS_GCF_011046555.1
  0.0000	1	0	order	186524	        o__Cytophagales
  0.0000	1	0	family	186525	          f__Spirosomaceae
  0.0000	1	0	genus	308451	            g__Arcticibacterium
  0.0000	1	0	species	308452	              s__Arcticibacterium luteifluviistationis
  0.0000	1	1	subspecies	308453	                RS_GCF_003258705.1
  0.2521	36900	0	class	170132	      c__Rhodothermia
  0.2521	36900	0	order	176778	        o__Rhodothermales
  0.1681	24600	0	family	197303	          f__Rhodothermaceae
  0.0840	12300	0	genus	197304	            g__Rhodothermus
  0.0840	12300	5547	species	197305	              s__Rhodothermus marinus
  0.0376	5499	5499	subspecies	197309	                RS_GCF_000024845.1
  0.0081	1183	1183	subspecies	197306	                RS_GCF_009936255.1
  0.0005	67	67	subspecies	197311	                RS_GCF_000224745.1
  0.0000	4	4	subspecies	197310	                RS_GCF_009936275.1
  0.0840	12300	0	genus	223817	            g__MEBICO9517
  0.0840	12300	929	species	223818	              s__MEBICO9517 sp003285105
  0.0390	5712	5712	subspecies	223819	                RS_GCF_003285105.1
  0.0387	5659	5659	subspecies	223821	                RS_GCF_001518995.2
  0.0840	12300	0	family	181324	          f__Salinibacteraceae
  0.0840	12300	0	genus	181325	            g__Salinibacter
  0.0840	12300	9263	species	181326	              s__Salinibacter ruber
  0.0134	1963	1963	subspecies	181330	                RS_GCF_003491205.1
  0.0055	810	810	subspecies	181327	                RS_GCF_003290325.1
  0.0004	65	65	subspecies	181333	                RS_GCF_002290345.1
  0.0004	59	59	subspecies	181339	                RS_GCF_003491185.1
  0.0004	52	52	subspecies	181340	                RS_GCF_003491425.1
  0.0002	33	33	subspecies	181335	                RS_GCF_003491385.1
  0.0002	23	23	subspecies	181331	                RS_GCF_003491405.1
  0.0001	20	20	subspecies	181338	                RS_GCF_000090405.2
  0.0001	12	12	subspecies	181337	                RS_GCF_000013045.1
  3.8545	564186	115	phylum	89676	    p__Firmicutes_A
  3.4336	502577	2068	class	89677	      c__Clostridia
  1.1753	172028	0	order	135898	        o__Clostridiales
  1.1753	172028	207	family	135899	          f__Clostridiaceae
  0.6713	98265	634	genus	135900	            g__Clostridium
  0.0840	12293	535	species	186552	              s__Clostridium baratii
  0.0402	5888	5888	subspecies	186557	                RS_GCF_000789395.1
  0.0401	5870	5870	subspecies	186556	                RS_GCF_001991075.2
  0.0838	12267	2788	species	199095	              s__Clostridium saccharoperbutylacetonicum
  0.0328	4797	4797	subspecies	199101	                RS_GCF_000340885.1
  0.0320	4682	4682	subspecies	199100	                RS_GCF_002003305.1
  0.0837	12244	12190	species	155828	              s__Clostridium saccharobutylicum
  0.0003	45	45	subspecies	155865	                RS_GCF_002003365.1
  0.0000	5	5	subspecies	155836	                RS_GCF_002003285.1
  0.0000	4	4	subspecies	155837	                RS_GCF_000473995.1
  0.0836	12231	12107	species	204331	              s__Clostridium chauvoei
  0.0004	59	59	subspecies	204335	                RS_GCF_002327185.1
  0.0002	35	35	subspecies	204332	                RS_GCF_004328885.1
  0.0001	19	19	subspecies	204334	                RS_GCF_900168365.1
  0.0001	11	11	subspecies	204336	                RS_GCF_002327205.1
  0.0835	12227	10780	species	208356	              s__Clostridium septicum
  0.0058	849	849	subspecies	208359	                RS_GCF_004101825.1
  0.0041	598	598	subspecies	208357	                RS_GCF_003606265.1
  0.0835	12216	12069	species	159090	              s__Clostridium butyricum
  0.0005	78	78	subspecies	159105	                RS_GCF_001886875.1
  0.0002	31	31	subspecies	159142	                RS_GCF_005145065.1
  0.0001	15	15	subspecies	159113	                RS_GCF_003315755.1
  0.0001	12	12	subspecies	159132	                RS_GCF_001465175.1
  0.0000	5	5	subspecies	159097	                RS_GCF_013112415.1
  0.0000	4	4	subspecies	159126	                RS_GCF_009650335.1
  0.0000	1	1	subspecies	159102	                RS_GCF_006742065.1
  0.0000	1	1	subspecies	159129	                GB_GCA_001746555.1
  0.0832	12174	11893	species	188969	              s__Clostridium botulinum_B
  0.0017	242	242	subspecies	188977	                RS_GCF_000789355.1
  0.0001	20	20	subspecies	188970	                RS_GCF_000307125.1
  0.0001	19	19	subspecies	188974	                RS_GCF_000020165.1
  0.0818	11971	11812	species	173423	              s__Clostridium botulinum_A
  0.0009	130	130	subspecies	173437	                RS_GCF_000020285.1
  0.0002	29	29	subspecies	173431	                RS_GCF_000827955.1
  0.0000	3	2	species	135901	              s__Clostridium beijerinckii
  0.0000	1	1	subspecies	136081	                RS_GCF_002003345.1
  0.0000	2	0	species	314770	              s__Clostridium beijerinckii_D
  0.0000	2	2	subspecies	314771	                GB_GCA_003129525.1
  0.0000	1	0	species	188364	              s__Clostridium tertium
  0.0000	1	1	subspecies	188369	                RS_GCF_902166825.1
  0.0000	1	0	species	237877	              s__Clostridium sp000230835
  0.0000	1	1	subspecies	237879	                RS_GCF_000230835.1
  0.0000	1	0	species	270280	              s__Clostridium taeniosporum
  0.0000	1	1	subspecies	270281	                RS_GCF_001735765.2
  0.1679	24572	1416	genus	142734	            g__Clostridium_F
  0.0794	11628	6777	species	167181	              s__Clostridium_F botulinum_A
  0.0313	4578	4578	subspecies	167190	                RS_GCF_001886775.1
  0.0007	107	107	subspecies	167182	                RS_GCF_003017145.1
  0.0005	78	78	subspecies	167194	                RS_GCF_003017195.1
  0.0005	70	70	subspecies	167211	                RS_GCF_001889325.1
  0.0001	11	11	subspecies	167205	                RS_GCF_002865785.1
  0.0000	5	5	subspecies	167210	                RS_GCF_003017335.1
  0.0000	1	1	subspecies	167198	                GB_GCA_003017265.1
  0.0000	1	1	subspecies	167202	                RS_GCF_003017225.1
  0.0779	11405	9679	species	152140	              s__Clostridium_F sporogenes
  0.0088	1282	1282	subspecies	152157	                RS_GCF_000816965.1
  0.0023	340	340	subspecies	152208	                GB_GCA_003013655.1
  0.0007	102	102	subspecies	152213	                GB_GCA_003013615.1
  0.0000	2	2	subspecies	152146	                RS_GCF_000973705.1
  0.0008	123	60	species	142735	              s__Clostridium_F botulinum
  0.0001	15	15	subspecies	142881	                RS_GCF_000019545.1
  0.0001	11	11	subspecies	142893	                RS_GCF_001951135.2
  0.0000	7	7	subspecies	142770	                RS_GCF_000253195.1
  0.0000	6	6	subspecies	142843	                RS_GCF_000019305.1
  0.0000	4	4	subspecies	142757	                RS_GCF_001921945.1
  0.0000	4	4	subspecies	142792	                RS_GCF_000817935.1
  0.0000	3	3	subspecies	142766	                RS_GCF_002865745.1
  0.0000	3	3	subspecies	142785	                RS_GCF_003345335.1
  0.0000	3	3	subspecies	142867	                RS_GCF_002865885.1
  0.0000	2	2	subspecies	142892	                RS_GCF_001921985.1
  0.0000	1	1	subspecies	142743	                RS_GCF_000829015.1
  0.0000	1	1	subspecies	142786	                RS_GCF_002866045.1
  0.0000	1	1	subspecies	142817	                RS_GCF_001921965.1
  0.0000	1	1	subspecies	142876	                RS_GCF_001879605.1
  0.0000	1	1	subspecies	142891	                RS_GCF_000020345.1
  0.1669	24432	46	genus	180450	            g__Clostridium_B
  0.0837	12248	9721	species	189910	              s__Clostridium_B ljungdahlii
  0.0171	2504	2504	subspecies	189913	                RS_GCF_000143685.1
  0.0001	12	12	subspecies	189915	                RS_GCF_001484725.1
  0.0001	11	11	subspecies	189917	                RS_GCF_000484505.1
  0.0829	12137	11662	species	223473	              s__Clostridium_B kluyveri
  0.0028	411	411	subspecies	223476	                RS_GCF_001902295.1
  0.0003	51	51	subspecies	223475	                RS_GCF_000016505.1
  0.0001	13	13	subspecies	223474	                RS_GCF_000010265.1
  0.0000	1	0	species	321921	              s__Clostridium_B sp004006395
  0.0000	1	1	subspecies	321922	                RS_GCF_004006395.2
  0.0840	12296	0	genus	175693	            g__Clostridium_S
  0.0840	12296	12211	species	175694	              s__Clostridium_S acetobutylicum
  0.0004	61	61	subspecies	175706	                RS_GCF_000008765.1
  0.0002	24	24	subspecies	175697	                RS_GCF_000218855.1
  0.0837	12256	0	genus	139989	            g__Clostridium_P
  0.0837	12256	4956	species	139990	              s__Clostridium_P perfringens
  0.0320	4687	4687	subspecies	139995	                GB_GCA_000013845.2
  0.0163	2385	2385	subspecies	140005	                RS_GCF_003350945.1
  0.0007	97	97	subspecies	140095	                RS_GCF_002355795.1
  0.0005	70	70	subspecies	140039	                GB_GCA_902166765.1
  0.0002	30	30	subspecies	140170	                RS_GCF_001579785.1
  0.0001	8	8	subspecies	140114	                RS_GCF_000255475.1
  0.0000	5	5	subspecies	140116	                RS_GCF_002018235.1
  0.0000	4	4	subspecies	140051	                RS_GCF_000009685.1
  0.0000	4	4	subspecies	140070	                RS_GCF_001304735.1
  0.0000	2	2	subspecies	140015	                GB_GCA_002287985.1
  0.0000	2	2	subspecies	140147	                RS_GCF_900478015.1
  0.0000	2	2	subspecies	140174	                RS_GCF_000013285.1
  0.0000	1	1	subspecies	140009	                RS_GCF_002012325.1
  0.0000	1	1	subspecies	140038	                RS_GCF_001579765.1
  0.0000	1	1	subspecies	140040	                RS_GCF_002312985.1
  0.0000	1	1	subspecies	140146	                RS_GCF_003203455.1
  0.9161	134096	0	order	147329	        o__Lachnospirales
  0.8321	121797	2667	family	147330	          f__Lachnospiraceae
  0.1619	23694	79	genus	187313	            g__Blautia
  0.0836	12238	9666	species	227875	              s__Blautia coccoides_A
  0.0176	2570	2570	subspecies	227877	                RS_GCF_013112015.1
  0.0000	2	2	subspecies	227876	                RS_GCF_002221555.2
  0.0777	11373	11371	species	189446	              s__Blautia hansenii
  0.0000	2	2	subspecies	189454	                RS_GCF_902381805.1
  0.0000	4	4	species	187314	              s__Blautia coccoides
  0.0839	12286	0	genus	220245	            g__Lachnoanaerobaculum
  0.0839	12286	12286	species	220246	              s__Lachnoanaerobaculum umeaense
  0.0832	12176	5	genus	160839	            g__Anaerostipes
  0.0831	12170	12165	species	190298	              s__Anaerostipes caccae
  0.0000	4	4	subspecies	190304	                RS_GCF_014131675.1
  0.0000	1	1	subspecies	190307	                RS_GCF_014467075.1
  0.0000	1	0	species	224159	              s__Anaerostipes rhamnosivorans
  0.0000	1	1	subspecies	224162	                RS_GCF_005280655.1
  0.0832	12172	44	genus	165639	            g__Enterocloster
  0.0828	12126	605	species	171675	              s__Enterocloster bolteae
  0.0395	5785	5785	subspecies	171689	                RS_GCF_013112035.1
  0.0392	5736	5736	subspecies	171699	                RS_GCF_002234575.2
  0.0000	2	0	species	165640	              s__Enterocloster clostridioformis
  0.0000	2	2	subspecies	165668	                RS_GCF_001688665.2
  0.0825	12081	0	genus	190351	            g__Clostridium_AP
  0.0825	12081	5178	species	190352	              s__Clostridium_AP scindens
  0.0237	3467	3467	subspecies	190357	                RS_GCF_009684695.1
  0.0235	3436	3436	subspecies	190354	                RS_GCF_004295125.1
  0.0814	11918	0	genus	213825	            g__Coprococcus_A
  0.0814	11918	11918	species	213826	              s__Coprococcus_A catus
  0.0811	11869	0	genus	147331	            g__Agathobacter
  0.0811	11869	7807	species	147332	              s__Agathobacter rectalis
  0.0272	3978	3978	subspecies	147388	                GB_GCA_000209935.1
  0.0006	84	84	subspecies	147399	                GB_GCA_000209955.1
  0.0785	11492	59	genus	179079	            g__Roseburia
  0.0780	11422	11422	species	198090	              s__Roseburia hominis
  0.0001	11	2	species	179080	              s__Roseburia intestinalis
  0.0000	5	5	subspecies	179093	                RS_GCF_900537995.1
  0.0000	4	4	subspecies	179096	                GB_GCA_000210655.1
  0.0780	11424	0	genus	150876	            g__Ruminococcus_B
  0.0780	11424	11404	species	150877	              s__Ruminococcus_B gnavus
  0.0001	11	11	subspecies	150882	                RS_GCF_009831375.1
  0.0001	9	9	subspecies	150937	                RS_GCF_008121495.1
  0.0000	7	0	genus	158074	            g__Blautia_A
  0.0000	5	0	species	162730	              s__Blautia_A massiliensis
  0.0000	4	4	subspecies	162733	                GB_GCA_000209835.1
  0.0000	1	1	subspecies	162761	                RS_GCF_005848555.1
  0.0000	2	0	species	202065	              s__Blautia_A obeum_B
  0.0000	2	2	subspecies	202071	                GB_GCA_000210015.1
  0.0000	5	0	genus	204533	            g__Pseudobutyrivibrio
  0.0000	5	5	species	246489	              s__Pseudobutyrivibrio fibrisolvens_A
  0.0000	2	0	genus	159412	            g__Mediterraneibacter
  0.0000	2	0	species	159413	              s__Mediterraneibacter faecis
  0.0000	2	2	subspecies	159445	                GB_GCA_000210035.1
  0.0000	2	0	genus	182404	            g__Anaerobutyricum
  0.0000	2	0	species	201224	              s__Anaerobutyricum soehngenii
  0.0000	2	2	subspecies	201228	                RS_GCF_900209925.1
  0.0000	1	0	genus	181009	            g__Acetatifactor
  0.0000	1	0	species	181010	              s__Acetatifactor sp900066565
  0.0000	1	1	subspecies	181024	                RS_GCF_003584705.1
  0.0000	1	0	genus	205125	            g__Lachnoclostridium_B
  0.0000	1	0	species	323318	              s__Lachnoclostridium_B phocaeensis
  0.0000	1	1	subspecies	323319	                RS_GCF_900120345.1
  0.0840	12299	0	family	221353	          f__Cellulosilyticaceae
  0.0840	12299	0	genus	236002	            g__Cellulosilyticum
  0.0840	12299	1547	species	236003	              s__Cellulosilyticum lentocellum
  0.0368	5388	5388	subspecies	236005	                RS_GCF_000178835.2
  0.0366	5364	5364	subspecies	236004	                RS_GCF_003990395.1
  0.6633	97094	129	order	148085	        o__Oscillospirales
  0.3279	47997	134	family	163731	          f__Ruminococcaceae
  0.1614	23618	280	genus	165816	            g__Faecalibacterium
  0.0808	11825	5879	species	181417	              s__Faecalibacterium prausnitzii_G
  0.0406	5946	5946	subspecies	181420	                GB_GCA_000210735.1
  0.0785	11494	11297	species	167440	              s__Faecalibacterium prausnitzii_C
  0.0007	106	106	subspecies	167471	                RS_GCF_002586945.1
  0.0004	63	63	subspecies	167465	                RS_GCF_002734145.1
  0.0002	28	28	subspecies	167459	                RS_GCF_010509575.1
  0.0001	19	3	species	165817	              s__Faecalibacterium prausnitzii
  0.0001	12	12	subspecies	165843	                GB_GCA_000209855.1
  0.0000	4	4	subspecies	165848	                RS_GCF_003312465.1
  0.0837	12248	0	genus	211791	            g__Ruminococcus_F
  0.0837	12248	12248	species	211792	              s__Ruminococcus_F champanellensis
  0.0820	11997	0	genus	184743	            g__Ruminiclostridium_E
  0.0820	11997	5974	species	184744	              s__Ruminiclostridium_E siraeum
  0.0411	6018	6018	subspecies	184752	                GB_GCA_000210635.1
  0.0000	4	4	subspecies	184755	                GB_GCA_902388055.1
  0.0000	1	1	subspecies	184747	                GB_GCA_000209915.1
  0.1670	24438	42	family	176800	          f__Oscillospiraceae
  0.0833	12198	0	genus	193437	            g__Intestinimonas
  0.0833	12198	11944	species	193438	              s__Intestinimonas butyriciproducens
  0.0017	248	248	subspecies	193446	                RS_GCF_004154955.1
  0.0000	4	4	subspecies	193440	                RS_GCF_001454945.1
  0.0000	2	2	subspecies	193444	                RS_GCF_902386045.1
  0.0833	12197	0	genus	177226	            g__Flavonifractor
  0.0833	12197	1456	species	177227	              s__Flavonifractor plautii
  0.0367	5376	5376	subspecies	177244	                RS_GCF_010508875.1
  0.0367	5365	5365	subspecies	177232	                RS_GCF_001688625.2
  0.0000	1	0	genus	204279	            g__Lawsonibacter
  0.0000	1	0	species	219988	              s__Lawsonibacter sp900066825
  0.0000	1	1	subspecies	219991	                RS_GCF_003573975.1
  0.0839	12285	0	family	148086	          f__Acutalibacteraceae
  0.0839	12283	0	genus	220821	            g__Acutalibacter
  0.0839	12283	12261	species	224184	              s__Acutalibacter muris
  0.0001	13	13	subspecies	224186	                RS_GCF_002201475.1
  0.0001	9	9	subspecies	224185	                RS_GCF_001688705.2
  0.0000	2	0	genus	175942	            g__Caprobacter
  0.0000	2	0	species	224088	              s__Caprobacter fermentans
  0.0000	2	2	subspecies	224090	                RS_GCF_014303955.1
  0.0837	12245	0	family	205149	          f__Ethanoligenenaceae
  0.0837	12245	0	genus	205150	            g__Ethanoligenens
  0.0837	12245	12035	species	205151	              s__Ethanoligenens harbinense
  0.0011	163	163	subspecies	205153	                RS_GCF_003612855.1
  0.0003	40	40	subspecies	205152	                RS_GCF_005222505.1
  0.0000	3	3	subspecies	205156	                RS_GCF_000178115.2
  0.0000	2	2	subspecies	205154	                RS_GCF_003020045.1
  0.0000	2	2	subspecies	205155	                RS_GCF_003612835.1
  0.1676	24528	65	order	181432	        o__Acetivibrionales
  0.0836	12243	68	family	181433	          f__Acetivibrionaceae
  0.0832	12174	0	genus	181434	            g__Hungateiclostridium
  0.0832	12174	11779	species	181435	              s__Hungateiclostridium thermocellum
  0.0025	365	365	subspecies	181443	                RS_GCF_000015865.1
  0.0002	23	23	subspecies	181441	                RS_GCF_000184925.1
  0.0000	7	7	subspecies	181439	                RS_GCF_001692755.1
  0.0000	1	0	genus	215338	            g__Acetivibrio
  0.0000	1	0	species	215339	              s__Acetivibrio clariflavus
  0.0000	1	1	subspecies	215340	                RS_GCF_000237085.1
  0.0835	12220	0	family	207222	          f__DSM-8532
  0.0835	12220	0	genus	207223	            g__Thermoclostridium
  0.0835	12220	12169	species	207224	              s__Thermoclostridium stercorarium
  0.0001	20	20	subspecies	207229	                RS_GCF_001697285.1
  0.0001	15	15	subspecies	207226	                RS_GCF_000331995.1
  0.0001	9	9	subspecies	207225	                RS_GCF_000349885.2
  0.0000	7	7	subspecies	207228	                RS_GCF_001697245.1
  0.1672	24476	0	order	89678	        o__Peptostreptococcales
  0.1672	24475	11	family	89679	          f__Peptostreptococcaceae
  0.0840	12290	0	genus	157841	            g__Paraclostridium
  0.0840	12290	3622	species	157842	              s__Paraclostridium sordellii
  0.0303	4441	4441	subspecies	157862	                RS_GCF_002865995.1
  0.0284	4159	4159	subspecies	157868	                GB_GCA_000953555.1
  0.0005	68	68	subspecies	157884	                GB_GCA_000953675.1
  0.0832	12174	0	genus	89680	            g__Clostridioides
  0.0832	12174	11895	species	89681	              s__Clostridioides difficile
  0.0009	125	125	subspecies	90715	                GB_GCA_001447175.1
  0.0002	23	23	subspecies	89757	                RS_GCF_000210455.1
  0.0001	10	10	subspecies	90054	                GB_GCA_000152665.1
  0.0001	9	9	subspecies	91742	                GB_GCA_000155065.1
  0.0001	9	9	subspecies	91034	                RS_GCF_000155025.1
  0.0001	8	8	subspecies	91530	                RS_GCF_002812645.1
  0.0000	7	7	subspecies	90832	                GB_GCA_000270485.1
  0.0000	7	7	subspecies	91517	                RS_GCF_003481905.1
  0.0000	6	6	subspecies	91365	                GB_GCA_001984465.1
  0.0000	5	5	subspecies	90796	                GB_GCA_003597775.1
  0.0000	5	5	subspecies	90649	                RS_GCF_001577795.1
  0.0000	5	5	subspecies	91065	                RS_GCF_003482325.1
  0.0000	5	5	subspecies	91627	                RS_GCF_003482225.1
  0.0000	4	4	subspecies	90372	                RS_GCF_003482125.1
  0.0000	4	4	subspecies	90055	                RS_GCF_003490105.1
  0.0000	4	4	subspecies	89996	                RS_GCF_003482065.1
  0.0000	3	3	subspecies	91041	                RS_GCF_000154665.1
  0.0000	3	3	subspecies	91120	                RS_GCF_003482305.1
  0.0000	3	3	subspecies	90862	                RS_GCF_008245165.1
  0.0000	3	3	subspecies	89805	                RS_GCF_002946535.2
  0.0000	3	3	subspecies	90358	                RS_GCF_000003215.1
  0.0000	3	3	subspecies	90131	                RS_GCF_002946035.1
  0.0000	2	2	subspecies	91702	                RS_GCF_003597855.1
  0.0000	2	2	subspecies	90407	                RS_GCF_002007885.1
  0.0000	2	2	subspecies	90263	                RS_GCF_003481965.1
  0.0000	2	2	subspecies	91345	                RS_GCF_003597795.1
  0.0000	2	2	subspecies	91308	                RS_GCF_003597875.1
  0.0000	1	1	subspecies	91238	                RS_GCF_000009205.2
  0.0000	1	1	subspecies	90012	                RS_GCF_000210435.1
  0.0000	1	1	subspecies	90080	                RS_GCF_003697225.1
  0.0000	1	1	subspecies	91396	                RS_GCF_000085225.1
  0.0000	1	1	subspecies	90174	                RS_GCF_002954015.1
  0.0000	1	1	subspecies	91253	                RS_GCF_000154685.1
  0.0000	1	1	subspecies	91244	                RS_GCF_002234355.1
  0.0000	1	1	subspecies	90701	                RS_GCF_003313565.1
  0.0000	1	1	subspecies	91201	                RS_GCF_002945665.1
  0.0000	1	1	subspecies	91093	                RS_GCF_000210415.1
  0.0000	1	1	subspecies	90276	                RS_GCF_009867095.1
  0.0000	1	1	subspecies	91023	                RS_GCF_003482035.1
  0.0000	1	1	subspecies	91010	                RS_GCF_003482165.1
  0.0000	1	1	subspecies	90667	                RS_GCF_000154645.1
  0.0000	1	1	subspecies	90846	                RS_GCF_000155045.1
  0.0000	1	0	family	207142	          f__Filifactoraceae
  0.0000	1	0	genus	273098	            g__Filifactor
  0.0000	1	0	species	273099	              s__Filifactor alocis
  0.0000	1	1	subspecies	273100	                RS_GCF_000163895.2
  0.1644	24061	0	order	183176	        o__Tissierellales
  0.1644	24061	166	family	183177	          f__Peptoniphilaceae
  0.0818	11971	0	genus	194187	            g__Parvimonas
  0.0818	11971	3888	species	194188	              s__Parvimonas micra
  0.0282	4129	4129	subspecies	194193	                RS_GCF_900637905.1
  0.0268	3920	3920	subspecies	194192	                RS_GCF_003454775.1
  0.0002	34	34	subspecies	194195	                RS_GCF_000800295.1
  0.0815	11924	0	genus	237661	            g__Murdochiella
  0.0815	11924	11924	species	247108	              s__Murdochiella vaginalis
  0.0837	12244	0	order	197353	        o__Eubacteriales
  0.0837	12244	0	family	197354	          f__Eubacteriaceae
  0.0837	12244	441	genus	197355	            g__Eubacterium
  0.0805	11785	1835	species	228767	              s__Eubacterium limosum
  0.0348	5089	5089	subspecies	228768	                RS_GCF_900683775.1
  0.0332	4861	4861	subspecies	228770	                RS_GCF_000807675.2
  0.0001	14	0	species	197356	              s__Eubacterium callanderi
  0.0001	14	14	subspecies	197362	                RS_GCF_000152245.2
  0.0000	4	1	species	208343	              s__Eubacterium maltosivorans
  0.0000	3	3	subspecies	208345	                RS_GCF_002441855.2
  0.0819	11982	0	order	215851	        o__Monoglobales
  0.0819	11982	0	family	215852	          f__Monoglobaceae
  0.0819	11982	0	genus	215853	            g__Monoglobus
  0.0819	11982	11982	species	215854	              s__Monoglobus pectinilyticus
  0.3361	49194	14	class	172222	      c__Thermoanaerobacteria
  0.2520	36889	0	order	187443	        o__Thermoanaerobacterales
  0.2520	36889	68	family	187444	          f__Thermoanaerobacteraceae
  0.1675	24521	3401	genus	187445	            g__Thermoanaerobacter
  0.0805	11788	2434	species	214310	              s__Thermoanaerobacter thermocopriae
  0.0320	4679	4679	subspecies	214312	                RS_GCF_000092965.1
  0.0319	4675	4675	subspecies	214311	                RS_GCF_000025645.1
  0.0629	9200	2233	species	193793	              s__Thermoanaerobacter ethanolicus
  0.0246	3603	3603	subspecies	193798	                RS_GCF_003722315.1
  0.0230	3364	3364	subspecies	193801	                RS_GCF_000262445.1
  0.0007	106	96	species	187446	              s__Thermoanaerobacter pseudethanolicus
  0.0000	7	7	subspecies	187456	                RS_GCF_000148425.1
  0.0000	2	2	subspecies	187449	                RS_GCF_000175295.2
  0.0000	1	1	subspecies	187448	                RS_GCF_000019065.1
  0.0002	25	0	species	308415	              s__Thermoanaerobacter wiegelii
  0.0002	25	25	subspecies	308416	                RS_GCF_000147695.2
  0.0000	1	0	species	321540	              s__Thermoanaerobacter kivui
  0.0000	1	1	subspecies	321541	                RS_GCF_000763575.1
  0.0840	12300	295	genus	197837	            g__Thermoanaerobacterium
  0.0819	11993	11660	species	223998	              s__Thermoanaerobacterium aotearoense
  0.0019	284	284	subspecies	224001	                GB_GCA_000307585.2
  0.0003	49	49	subspecies	223999	                RS_GCF_009905255.1
  0.0001	10	1	species	197838	              s__Thermoanaerobacterium thermosaccharolyticum
  0.0000	7	7	subspecies	197844	                RS_GCF_000328545.1
  0.0000	2	2	subspecies	197843	                RS_GCF_000145615.1
  0.0000	2	0	species	275612	              s__Thermoanaerobacterium xylanolyticum
  0.0000	2	2	subspecies	275613	                RS_GCF_000189775.2
  0.0840	12291	0	order	172223	        o__Caldicellulosiruptorales
  0.0840	12291	0	family	172224	          f__Caldicellulosiruptoraceae
  0.0840	12291	119	genus	172225	            g__Caldicellulosiruptor
  0.0830	12155	2756	species	221753	              s__Caldicellulosiruptor acetigenus
  0.0322	4710	4710	subspecies	221754	                RS_GCF_000166695.1
  0.0320	4689	4689	subspecies	221756	                RS_GCF_000193435.2
  0.0001	9	0	species	293079	              s__Caldicellulosiruptor kronotskyensis
  0.0001	9	9	subspecies	293080	                RS_GCF_000166775.1
  0.0000	3	0	species	172226	              s__Caldicellulosiruptor bescii
  0.0000	3	3	subspecies	172235	                RS_GCF_000022325.1
  0.0000	3	0	species	219316	              s__Caldicellulosiruptor saccharolyticus
  0.0000	2	2	subspecies	219318	                RS_GCF_000016545.1
  0.0000	1	1	subspecies	219317	                RS_GCF_003999255.1
  0.0000	1	0	species	226558	              s__Caldicellulosiruptor owensensis
  0.0000	1	1	subspecies	226559	                RS_GCF_000166335.1
  0.0000	1	0	species	279058	              s__Caldicellulosiruptor obsidiansis
  0.0000	1	1	subspecies	279059	                RS_GCF_000145215.1
  0.0840	12300	0	class	212315	      c__Thermosediminibacteria
  0.0840	12300	0	order	212316	        o__Thermosediminibacterales
  0.0840	12300	0	family	212317	          f__Tepidanaerobacteraceae
  0.0840	12300	0	genus	218763	            g__Tepidanaerobacter
  0.0840	12300	12202	species	233119	              s__Tepidanaerobacter acetatoxydans
  0.0003	50	50	subspecies	233121	                RS_GCF_000328765.2
  0.0003	48	48	subspecies	233120	                RS_GCF_000213235.1
  2.7726	405823	0	phylum	99398	    p__Campylobacterota
  2.7726	405823	0	class	99399	      c__Campylobacteria
  2.7726	405823	13	order	99400	        o__Campylobacterales
  1.7642	258223	296	family	99401	          f__Campylobacteraceae
  0.8397	122905	3079	genus	99402	            g__Campylobacter_D
  0.0837	12255	7944	species	215786	              s__Campylobacter_D insulaenigrae
  0.0294	4308	4308	subspecies	215787	                RS_GCF_900638675.1
  0.0000	2	2	subspecies	215788	                RS_GCF_000816185.1
  0.0000	1	1	subspecies	215790	                RS_GCF_900637885.1
  0.0837	12249	3493	species	187910	              s__Campylobacter_D upsaliensis
  0.0399	5837	5837	subspecies	187916	                RS_GCF_900637395.1
  0.0190	2788	2788	subspecies	187913	                RS_GCF_013372245.1
  0.0009	131	131	subspecies	187918	                RS_GCF_014068875.1
  0.0835	12220	5742	species	181922	              s__Campylobacter_D helveticus
  0.0223	3268	3268	subspecies	181925	                RS_GCF_004345065.1
  0.0219	3210	3210	subspecies	181932	                RS_GCF_002080395.1
  0.0834	12204	5138	species	186158	              s__Campylobacter_D lari_C
  0.0248	3630	3630	subspecies	186159	                RS_GCF_000816365.1
  0.0223	3269	3269	subspecies	186162	                RS_GCF_900638335.1
  0.0005	67	67	subspecies	186167	                RS_GCF_000816425.1
  0.0003	47	47	subspecies	186168	                RS_GCF_000816385.2
  0.0002	28	28	subspecies	186166	                RS_GCF_001017575.1
  0.0002	25	25	subspecies	186169	                RS_GCF_000816405.1
  0.0833	12196	4193	species	185591	              s__Campylobacter_D armoricus
  0.0278	4072	4072	subspecies	185602	                RS_GCF_009036385.1
  0.0269	3931	3931	subspecies	185599	                RS_GCF_013372105.1
  0.0831	12160	4197	species	223680	              s__Campylobacter_D subantarcticus
  0.0277	4050	4050	subspecies	223682	                RS_GCF_000816305.1
  0.0267	3913	3913	subspecies	223681	                RS_GCF_000816265.1
  0.0825	12081	12030	species	198131	              s__Campylobacter_D volucris
  0.0002	34	34	subspecies	198132	                RS_GCF_008245045.1
  0.0001	15	15	subspecies	198135	                RS_GCF_000816345.1
  0.0000	2	2	subspecies	198138	                RS_GCF_004345045.1
  0.0824	12064	6666	species	185384	              s__Campylobacter_D lari
  0.0184	2693	2693	subspecies	185389	                RS_GCF_010469945.1
  0.0181	2646	2646	subspecies	185388	                RS_GCF_013372185.1
  0.0004	59	59	subspecies	185393	                RS_GCF_000019205.1
  0.0819	11984	3604	species	223245	              s__Campylobacter_D concheus
  0.0289	4234	4234	subspecies	223247	                RS_GCF_000816225.1
  0.0283	4146	4146	subspecies	223246	                RS_GCF_008245025.1
  0.0691	10115	7255	species	118934	              s__Campylobacter_D coli
  0.0182	2667	2667	subspecies	118946	                RS_GCF_000583775.1
  0.0004	61	61	subspecies	118949	                RS_GCF_001417615.1
  0.0001	12	12	subspecies	119394	                RS_GCF_013416175.1
  0.0001	12	12	subspecies	119556	                RS_GCF_000583755.1
  0.0001	12	12	subspecies	119073	                GB_GCA_008727375.1
  0.0001	11	11	subspecies	119262	                RS_GCF_013391125.1
  0.0001	10	10	subspecies	119371	                GB_GCA_008727395.1
  0.0001	8	8	subspecies	119670	                RS_GCF_010232325.1
  0.0000	7	7	subspecies	119540	                GB_GCA_008727355.1
  0.0000	6	6	subspecies	119775	                GB_GCA_001305715.1
  0.0000	5	5	subspecies	119313	                RS_GCF_000465235.1
  0.0000	5	5	subspecies	119692	                RS_GCF_002843985.1
  0.0000	5	5	subspecies	119647	                RS_GCF_001417655.1
  0.0000	4	4	subspecies	119220	                RS_GCF_003030205.1
  0.0000	4	4	subspecies	118984	                RS_GCF_008727495.1
  0.0000	4	4	subspecies	119717	                RS_GCF_008727315.1
  0.0000	4	4	subspecies	119186	                RS_GCF_001865475.1
  0.0000	3	3	subspecies	119013	                RS_GCF_001417635.1
  0.0000	3	3	subspecies	119766	                RS_GCF_001936355.1
  0.0000	3	3	subspecies	119077	                RS_GCF_001717605.1
  0.0000	3	3	subspecies	119583	                RS_GCF_009730395.1
  0.0000	3	3	subspecies	119354	                RS_GCF_001865495.1
  0.0000	2	2	subspecies	119660	                RS_GCF_009498195.1
  0.0000	2	2	subspecies	119762	                GB_GCA_001483845.1
  0.0000	1	1	subspecies	119565	                RS_GCF_001639125.1
  0.0000	1	1	subspecies	118951	                RS_GCF_005517455.1
  0.0000	1	1	subspecies	119465	                RS_GCF_000494775.2
  0.0000	1	1	subspecies	119297	                RS_GCF_009498315.1
  0.0019	275	186	species	99403	              s__Campylobacter_D jejuni
  0.0000	7	7	subspecies	100628	                RS_GCF_012220765.1
  0.0000	6	6	subspecies	99756	                RS_GCF_000835285.1
  0.0000	4	4	subspecies	99621	                RS_GCF_900638165.1
  0.0000	4	4	subspecies	100633	                RS_GCF_009498375.1
  0.0000	3	3	subspecies	99512	                RS_GCF_014151305.1
  0.0000	3	3	subspecies	100845	                RS_GCF_001686905.1
  0.0000	3	3	subspecies	99735	                RS_GCF_003368105.1
  0.0000	3	3	subspecies	99824	                RS_GCF_002209065.1
  0.0000	3	3	subspecies	99991	                RS_GCF_007431745.1
  0.0000	2	2	subspecies	100356	                RS_GCF_008727335.1
  0.0000	2	2	subspecies	100438	                RS_GCF_012224765.1
  0.0000	2	2	subspecies	100404	                RS_GCF_003368205.1
  0.0000	2	2	subspecies	100405	                RS_GCF_012889415.1
  0.0000	2	2	subspecies	100433	                RS_GCF_008727415.1
  0.0000	2	2	subspecies	100483	                RS_GCF_004924295.1
  0.0000	2	2	subspecies	100496	                RS_GCF_000171795.2
  0.0000	2	2	subspecies	100827	                RS_GCF_000430385.1
  0.0000	2	2	subspecies	101147	                RS_GCF_013363775.1
  0.0000	2	2	subspecies	99425	                RS_GCF_003368165.1
  0.0000	2	2	subspecies	100170	                RS_GCF_009939645.1
  0.0000	2	2	subspecies	100095	                RS_GCF_003368225.1
  0.0000	2	2	subspecies	100273	                RS_GCF_900638185.1
  0.0000	2	2	subspecies	100001	                RS_GCF_014152305.1
  0.0000	2	2	subspecies	99859	                RS_GCF_008727475.1
  0.0000	1	1	subspecies	100813	                GB_GCA_900474415.1
  0.0000	1	1	subspecies	99832	                RS_GCF_008727455.1
  0.0000	1	1	subspecies	99784	                RS_GCF_013393785.1
  0.0000	1	1	subspecies	99683	                RS_GCF_000184205.1
  0.0000	1	1	subspecies	100886	                RS_GCF_003368125.1
  0.0000	1	1	subspecies	100890	                RS_GCF_003368245.1
  0.0000	1	1	subspecies	101062	                RS_GCF_003368045.1
  0.0000	1	1	subspecies	101075	                RS_GCF_001587035.1
  0.0000	1	1	subspecies	101093	                RS_GCF_000302555.5
  0.0000	1	1	subspecies	101110	                RS_GCF_013393805.1
  0.0000	1	1	subspecies	101127	                RS_GCF_014151465.1
  0.0000	1	1	subspecies	100797	                RS_GCF_001870105.1
  0.0000	1	1	subspecies	100664	                RS_GCF_000807355.1
  0.0000	1	1	subspecies	100663	                GB_GCA_900638625.1
  0.0000	1	1	subspecies	100596	                RS_GCF_014152105.1
  0.0000	1	1	subspecies	100587	                GB_GCA_900637255.1
  0.0000	1	1	subspecies	100562	                RS_GCF_000163975.1
  0.0000	1	1	subspecies	100552	                RS_GCF_003971585.1
  0.0000	1	1	subspecies	99907	                RS_GCF_001506465.1
  0.0000	1	1	subspecies	100449	                RS_GCF_013394995.1
  0.0000	1	1	subspecies	99410	                RS_GCF_013389575.1
  0.0000	1	1	subspecies	100237	                RS_GCF_003950275.1
  0.0000	1	1	subspecies	100260	                RS_GCF_002587105.1
  0.0001	15	0	species	244910	              s__Campylobacter_D peloridis
  0.0001	15	15	subspecies	244911	                RS_GCF_000816785.1
  0.0000	3	0	species	249107	              s__Campylobacter_D ornithocola
  0.0000	3	3	subspecies	249109	                RS_GCF_013201605.1
  0.0000	3	0	species	286005	              s__Campylobacter_D sp000816245
  0.0000	3	3	subspecies	286006	                RS_GCF_000816245.1
  0.0000	1	0	species	151645	              s__Campylobacter_D coli_A
  0.0000	1	1	subspecies	151727	                RS_GCF_000470055.1
  0.0000	1	0	species	167472	              s__Campylobacter_D hepaticus
  0.0000	1	1	subspecies	167500	                RS_GCF_001687475.2
  0.5027	73584	597	genus	156741	            g__Campylobacter
  0.0837	12255	3604	species	225663	              s__Campylobacter iguaniorum
  0.0388	5677	5677	subspecies	225664	                RS_GCF_001643995.1
  0.0203	2967	2967	subspecies	225665	                RS_GCF_001483985.1
  0.0000	7	7	subspecies	225666	                RS_GCF_000736415.1
  0.0837	12247	387	species	187838	              s__Campylobacter sp002139875
  0.0407	5950	5950	subspecies	187848	                RS_GCF_002139895.1
  0.0404	5910	5910	subspecies	187841	                RS_GCF_002139875.1
  0.0832	12185	8962	species	164484	              s__Campylobacter testudinum
  0.0163	2392	2392	subspecies	164497	                RS_GCF_002973655.1
  0.0054	788	788	subspecies	164503	                RS_GCF_000814265.1
  0.0002	32	32	subspecies	164517	                RS_GCF_001484645.1
  0.0001	11	11	subspecies	164513	                GB_GCA_000495505.1
  0.0827	12104	10637	species	163148	              s__Campylobacter hyointestinalis
  0.0093	1360	1360	subspecies	163157	                RS_GCF_013372145.1
  0.0007	107	107	subspecies	163185	                RS_GCF_005844045.1
  0.0826	12093	823	species	183853	              s__Campylobacter lawsonii
  0.0388	5675	5675	subspecies	183857	                RS_GCF_001643975.1
  0.0382	5595	5595	subspecies	183864	                RS_GCF_013372165.1
  0.0824	12064	12064	species	168378	              s__Campylobacter lanienae
  0.0002	22	0	species	164561	              s__Campylobacter sp002139915
  0.0002	22	22	subspecies	164579	                RS_GCF_002139915.1
  0.0001	15	8	species	156742	              s__Campylobacter fetus
  0.0000	2	2	subspecies	156761	                RS_GCF_011600995.2
  0.0000	2	2	subspecies	156788	                RS_GCF_000759485.1
  0.0000	1	1	subspecies	156765	                RS_GCF_000967135.1
  0.0000	1	1	subspecies	156783	                GB_GCA_000222425.1
  0.0000	1	1	subspecies	156789	                RS_GCF_000512745.2
  0.0000	2	0	species	211643	              s__Campylobacter sp002139855
  0.0000	2	2	subspecies	211644	                RS_GCF_002139855.1
  0.3357	49142	305	genus	162381	            g__Campylobacter_A
  0.0839	12286	6053	species	180335	              s__Campylobacter_A curvus
  0.0425	6228	6228	subspecies	180338	                RS_GCF_013372125.1
  0.0000	5	5	subspecies	180337	                RS_GCF_902381815.1
  0.0839	12284	1528	species	197787	              s__Campylobacter_A mucosalis
  0.0371	5435	5435	subspecies	197788	                RS_GCF_004803775.1
  0.0364	5321	5321	subspecies	197794	                RS_GCF_013372205.1
  0.0834	12206	6069	species	192314	              s__Campylobacter_A pinnipediorum
  0.0214	3136	3136	subspecies	192318	                RS_GCF_002021965.1
  0.0202	2954	2954	subspecies	192316	                RS_GCF_002021925.1
  0.0003	47	47	subspecies	192320	                RS_GCF_002021945.1
  0.0824	12060	6124	species	231291	              s__Campylobacter_A caledonicus
  0.0206	3008	3008	subspecies	231292	                RS_GCF_002022005.1
  0.0200	2928	2928	subspecies	231294	                RS_GCF_002021985.1
  0.0000	1	0	species	213301	              s__Campylobacter_A sp004803835
  0.0000	1	1	subspecies	213304	                RS_GCF_004803835.1
  0.0840	12296	135	genus	190799	            g__Campylobacter_B
  0.0830	12150	8901	species	195137	              s__Campylobacter_B sputorum
  0.0214	3134	3134	subspecies	195141	                RS_GCF_002220735.1
  0.0007	98	98	subspecies	195143	                RS_GCF_002220755.1
  0.0001	11	11	subspecies	195144	                RS_GCF_008245005.1
  0.0000	6	6	subspecies	195142	                RS_GCF_002220795.1
  0.0001	11	0	species	250999	              s__Campylobacter_B sputorum_B
  0.0001	11	11	subspecies	251001	                RS_GCF_002220775.1
  0.5042	73795	20	family	118024	          f__Helicobacteraceae
  0.3361	49191	7589	genus	118025	            g__Helicobacter
  0.0836	12232	8677	species	194084	              s__Helicobacter acinonychis
  0.0123	1798	1798	subspecies	194092	                RS_GCF_900198455.1
  0.0120	1757	1757	subspecies	194088	                RS_GCF_000009305.1
  0.0827	12106	369	species	165087	              s__Helicobacter pylori_A
  0.0414	6062	6062	subspecies	165103	                RS_GCF_001653455.1
  0.0387	5671	5671	subspecies	165091	                GB_GCA_000590775.1
  0.0000	4	4	subspecies	165104	                RS_GCF_000185245.1
  0.0689	10080	9686	species	130183	              s__Helicobacter pylori_C
  0.0001	21	21	subspecies	130289	                RS_GCF_000148875.1
  0.0001	17	17	subspecies	130346	                RS_GCF_001653475.1
  0.0001	17	17	subspecies	130425	                RS_GCF_003640585.1
  0.0001	16	16	subspecies	130213	                RS_GCF_001653375.1
  0.0001	15	15	subspecies	130232	                GB_GCA_001549855.1
  0.0001	12	12	subspecies	130397	                RS_GCF_001549715.1
  0.0001	11	11	subspecies	130302	                RS_GCF_000317875.1
  0.0001	11	11	subspecies	130310	                RS_GCF_000392535.3
  0.0001	11	11	subspecies	130442	                RS_GCF_002357435.1
  0.0001	11	11	subspecies	130372	                RS_GCF_002222575.1
  0.0001	10	10	subspecies	130486	                RS_GCF_003711165.1
  0.0001	10	10	subspecies	130371	                RS_GCF_000023805.1
  0.0001	9	9	subspecies	130291	                RS_GCF_004088155.1
  0.0001	9	9	subspecies	130244	                RS_GCF_001653435.1
  0.0001	8	8	subspecies	130308	                RS_GCF_002357535.1
  0.0001	8	8	subspecies	130301	                RS_GCF_002357775.1
  0.0001	8	8	subspecies	130501	                RS_GCF_001549875.1
  0.0001	8	8	subspecies	130433	                RS_GCF_000348885.1
  0.0001	8	8	subspecies	130444	                RS_GCF_002357675.1
  0.0000	7	7	subspecies	130263	                RS_GCF_002357475.1
  0.0000	7	7	subspecies	130258	                RS_GCF_000224535.1
  0.0000	7	7	subspecies	130271	                RS_GCF_003855475.1
  0.0000	7	7	subspecies	130217	                RS_GCF_000817025.1
  0.0000	7	7	subspecies	130496	                RS_GCF_000093185.1
  0.0000	7	7	subspecies	130355	                RS_GCF_000270025.1
  0.0000	6	6	subspecies	130439	                RS_GCF_004088075.1
  0.0000	6	6	subspecies	130459	                RS_GCF_000270045.1
  0.0000	6	6	subspecies	130471	                RS_GCF_000224555.1
  0.0000	6	6	subspecies	130212	                RS_GCF_000348865.1
  0.0000	5	5	subspecies	130463	                RS_GCF_002357515.1
  0.0000	5	5	subspecies	130354	                GB_GCA_000262655.1
  0.0000	5	5	subspecies	130226	                RS_GCF_000270065.1
  0.0000	5	5	subspecies	130285	                RS_GCF_000148915.1
  0.0000	4	4	subspecies	130330	                RS_GCF_002357815.1
  0.0000	4	4	subspecies	130228	                RS_GCF_000148895.1
  0.0000	4	4	subspecies	130447	                RS_GCF_002357635.1
  0.0000	4	4	subspecies	130429	                RS_GCF_002356595.1
  0.0000	4	4	subspecies	130361	                RS_GCF_002357695.1
  0.0000	4	4	subspecies	130365	                RS_GCF_000011725.1
  0.0000	4	4	subspecies	130384	                RS_GCF_001653395.1
  0.0000	3	3	subspecies	130196	                RS_GCF_002357415.1
  0.0000	3	3	subspecies	130319	                RS_GCF_002357575.1
  0.0000	3	3	subspecies	130489	                RS_GCF_003957395.1
  0.0000	3	3	subspecies	130420	                RS_GCF_000270005.1
  0.0000	3	3	subspecies	130336	                RS_GCF_002357315.1
  0.0000	3	3	subspecies	130318	                RS_GCF_002357755.1
  0.0000	3	3	subspecies	130185	                RS_GCF_011462575.1
  0.0000	3	3	subspecies	130315	                RS_GCF_002357495.1
  0.0000	2	2	subspecies	130332	                RS_GCF_000277365.1
  0.0000	2	2	subspecies	130499	                RS_GCF_000020245.1
  0.0000	2	2	subspecies	130206	                RS_GCF_002357855.1
  0.0000	2	2	subspecies	130216	                RS_GCF_002357355.1
  0.0000	2	2	subspecies	130452	                RS_GCF_008326525.1
  0.0000	2	2	subspecies	130242	                RS_GCF_002357335.1
  0.0000	2	2	subspecies	130247	                RS_GCF_002357555.1
  0.0000	2	2	subspecies	130360	                RS_GCF_002357795.1
  0.0000	2	2	subspecies	130261	                RS_GCF_000315955.1
  0.0000	2	2	subspecies	130424	                RS_GCF_000600145.1
  0.0000	2	2	subspecies	130414	                RS_GCF_002357615.1
  0.0000	2	2	subspecies	130268	                RS_GCF_002357395.1
  0.0000	1	1	subspecies	130413	                RS_GCF_000213135.1
  0.0000	1	1	subspecies	130379	                RS_GCF_002357595.1
  0.0000	1	1	subspecies	130373	                RS_GCF_000600185.1
  0.0000	1	1	subspecies	130409	                RS_GCF_002357455.1
  0.0000	1	1	subspecies	130487	                RS_GCF_002357715.1
  0.0000	1	1	subspecies	130211	                RS_GCF_002357835.1
  0.0000	1	1	subspecies	130480	                RS_GCF_000600125.1
  0.0000	1	1	subspecies	130475	                RS_GCF_002357655.1
  0.0000	1	1	subspecies	130260	                RS_GCF_002357375.1
  0.0000	1	1	subspecies	130464	                RS_GCF_002357735.1
  0.0000	1	1	subspecies	130300	                RS_GCF_000277385.1
  0.0000	1	1	subspecies	130246	                RS_GCF_011456315.1
  0.0429	6283	759	species	127186	              s__Helicobacter pylori_BU
  0.0190	2786	2786	subspecies	127191	                GB_GCA_008033035.1
  0.0184	2693	2693	subspecies	127195	                RS_GCF_008281125.1
  0.0000	6	6	subspecies	127545	                RS_GCF_008033055.1
  0.0000	5	5	subspecies	127203	                RS_GCF_900638475.1
  0.0000	5	5	subspecies	127499	                RS_GCF_010917155.1
  0.0000	4	4	subspecies	127253	                RS_GCF_001653415.1
  0.0000	3	3	subspecies	127563	                RS_GCF_008026815.1
  0.0000	3	3	subspecies	127512	                GB_GCA_008032955.1
  0.0000	3	3	subspecies	127313	                RS_GCF_008032995.1
  0.0000	3	3	subspecies	127198	                RS_GCF_010917555.1
  0.0000	2	2	subspecies	127373	                RS_GCF_010917675.1
  0.0000	2	2	subspecies	127441	                RS_GCF_000277425.1
  0.0000	2	2	subspecies	127505	                RS_GCF_008032735.1
  0.0000	2	2	subspecies	127269	                RS_GCF_008026615.1
  0.0000	2	2	subspecies	127252	                RS_GCF_000185205.1
  0.0000	1	1	subspecies	127359	                RS_GCF_900120335.1
  0.0000	1	1	subspecies	127380	                RS_GCF_008032975.1
  0.0000	1	1	subspecies	127480	                RS_GCF_008027235.1
  0.0062	901	418	species	118026	              s__Helicobacter pylori
  0.0003	37	37	subspecies	118393	                GB_GCA_008026995.1
  0.0002	35	35	subspecies	118406	                RS_GCF_000828955.1
  0.0002	23	23	subspecies	118432	                RS_GCF_000224575.1
  0.0001	17	17	subspecies	118674	                RS_GCF_000148855.1
  0.0001	16	16	subspecies	118518	                RS_GCF_008033015.1
  0.0001	15	15	subspecies	118163	                RS_GCF_008026175.1
  0.0001	14	14	subspecies	118512	                RS_GCF_000185185.1
  0.0001	14	14	subspecies	118027	                RS_GCF_007844055.1
  0.0001	14	14	subspecies	118739	                RS_GCF_008033075.1
  0.0001	12	12	subspecies	118161	                RS_GCF_006337465.1
  0.0001	12	12	subspecies	118411	                RS_GCF_000259235.1
  0.0001	12	12	subspecies	118286	                RS_GCF_006337485.1
  0.0001	12	12	subspecies	118448	                RS_GCF_000013245.1
  0.0001	12	12	subspecies	118882	                RS_GCF_000021465.1
  0.0001	11	11	subspecies	118708	                RS_GCF_007843915.1
  0.0001	11	11	subspecies	118359	                RS_GCF_000600085.1
  0.0001	11	11	subspecies	118559	                RS_GCF_007836735.1
  0.0001	10	10	subspecies	118779	                RS_GCF_001433495.1
  0.0001	10	10	subspecies	118534	                RS_GCF_900638505.1
  0.0001	10	10	subspecies	118335	                RS_GCF_000392515.3
  0.0001	10	10	subspecies	118232	                RS_GCF_001433515.1
  0.0001	10	10	subspecies	118066	                RS_GCF_000021165.1
  0.0001	9	9	subspecies	118408	                RS_GCF_008032475.1
  0.0001	9	9	subspecies	118192	                RS_GCF_006339365.1
  0.0001	9	9	subspecies	118453	                RS_GCF_000255955.1
  0.0001	9	9	subspecies	118916	                GB_GCA_008032615.1
  0.0001	9	9	subspecies	118086	                RS_GCF_006337875.1
  0.0001	8	8	subspecies	118751	                RS_GCF_006339065.1
  0.0001	8	8	subspecies	118855	                RS_GCF_000600045.1
  0.0000	7	7	subspecies	118341	                RS_GCF_000091345.1
  0.0000	7	7	subspecies	118131	                RS_GCF_007843535.1
  0.0000	7	7	subspecies	118081	                RS_GCF_006338285.1
  0.0000	6	6	subspecies	118506	                RS_GCF_003939085.1
  0.0000	6	6	subspecies	118603	                GB_GCA_008032935.1
  0.0000	6	6	subspecies	118930	                RS_GCF_007844035.1
  0.0000	6	6	subspecies	118133	                RS_GCF_000185225.1
  0.0000	5	5	subspecies	118601	                RS_GCF_006338045.1
  0.0000	5	5	subspecies	118142	                RS_GCF_007843715.1
  0.0000	4	4	subspecies	118561	                RS_GCF_000685625.1
  0.0000	4	4	subspecies	118472	                RS_GCF_006874685.1
  0.0000	4	4	subspecies	118464	                RS_GCF_006338545.1
  0.0000	3	3	subspecies	118913	                RS_GCF_900478295.1
  0.0000	3	3	subspecies	118148	                RS_GCF_000600225.1
  0.0000	3	3	subspecies	118850	                RS_GCF_006337745.1
  0.0000	2	2	subspecies	118717	                RS_GCF_008027775.1
  0.0000	2	2	subspecies	118390	                RS_GCF_008026375.1
  0.0000	2	2	subspecies	118793	                RS_GCF_002952355.1
  0.0000	2	2	subspecies	118829	                RS_GCF_000600165.1
  0.0000	1	1	subspecies	118064	                RS_GCF_004295525.1
  0.0000	1	1	subspecies	118863	                GB_GCA_002952335.1
  0.0000	1	1	subspecies	118843	                RS_GCF_002952175.1
  0.0000	1	1	subspecies	118815	                RS_GCF_002952235.1
  0.0000	1	1	subspecies	118812	                RS_GCF_000685745.1
  0.0000	1	1	subspecies	118794	                RS_GCF_006338815.1
  0.0000	1	1	subspecies	118404	                RS_GCF_006337265.1
  0.0000	1	1	subspecies	118446	                RS_GCF_004295545.1
  0.0000	1	1	subspecies	118650	                RS_GCF_006337285.1
  0.0000	1	1	subspecies	118535	                RS_GCF_007844075.1
  0.0840	12298	0	genus	212256	            g__Wolinella
  0.0840	12298	12165	species	212257	              s__Wolinella succinogenes
  0.0007	98	98	subspecies	212259	                RS_GCF_900637325.1
  0.0002	35	35	subspecies	212258	                RS_GCF_000196135.1
  0.0839	12286	0	genus	221785	            g__Helicobacter_H
  0.0839	12286	12268	species	221786	              s__Helicobacter_H mustelae
  0.0001	12	12	subspecies	221789	                RS_GCF_000091985.1
  0.0000	6	6	subspecies	221787	                RS_GCF_900476215.1
  0.4201	61492	18	family	161036	          f__Arcobacteraceae
  0.4200	61474	620	genus	161037	            g__Aliarcobacter
  0.0836	12230	2879	species	211442	              s__Aliarcobacter defluvii
  0.0323	4734	4734	subspecies	211446	                RS_GCF_013201725.1
  0.0315	4617	4617	subspecies	211443	                RS_GCF_000284235.1
  0.0835	12227	3033	species	169771	              s__Aliarcobacter cryaerophilus_A
  0.0381	5572	5572	subspecies	169778	                RS_GCF_014352915.1
  0.0234	3419	3419	subspecies	169775	                RS_GCF_003660085.1
  0.0007	108	108	subspecies	169796	                GB_GCA_011045435.1
  0.0003	43	43	subspecies	169783	                RS_GCF_011045415.1
  0.0001	21	21	subspecies	169792	                RS_GCF_014352935.1
  0.0001	16	16	subspecies	169791	                RS_GCF_014352895.1
  0.0001	15	15	subspecies	169785	                RS_GCF_014301985.1
  0.0833	12191	5737	species	203411	              s__Aliarcobacter cibarius
  0.0222	3252	3252	subspecies	203414	                RS_GCF_013372265.1
  0.0219	3202	3202	subspecies	203412	                RS_GCF_008808035.1
  0.0830	12155	12123	species	225752	              s__Aliarcobacter cryaerophilus
  0.0002	26	26	subspecies	225754	                RS_GCF_003660105.1
  0.0000	6	6	subspecies	225753	                RS_GCF_006165035.1
  0.0822	12036	2146	species	179404	              s__Aliarcobacter skirrowii
  0.0339	4963	4963	subspecies	179413	                RS_GCF_003544835.1
  0.0337	4927	4927	subspecies	179414	                RS_GCF_003939045.1
  0.0000	6	0	species	199507	              s__Aliarcobacter porcinus
  0.0000	6	6	subspecies	199511	                RS_GCF_004299785.2
  0.0000	3	0	species	193272	              s__Aliarcobacter thereius
  0.0000	3	3	subspecies	193275	                RS_GCF_004214815.1
  0.0000	3	0	species	230392	              s__Aliarcobacter trophiarum
  0.0000	3	3	subspecies	230394	                RS_GCF_003355515.1
  0.0000	2	0	species	233756	              s__Aliarcobacter aquimarinus
  0.0000	2	2	subspecies	233758	                RS_GCF_013177635.1
  0.0000	1	1	species	161038	              s__Aliarcobacter butzleri
  0.0840	12300	0	family	208335	          f__Sulfurospirillaceae
  0.0840	12300	509	genus	208336	            g__Sulfurospirillum
  0.0805	11782	11697	species	256390	              s__Sulfurospirillum multivorans
  0.0003	49	49	subspecies	256392	                RS_GCF_008083195.1
  0.0002	36	36	subspecies	256391	                RS_GCF_000568815.1
  0.0000	7	0	species	317324	              s__Sulfurospirillum halorespirans
  0.0000	7	7	subspecies	317325	                RS_GCF_001723605.1
  0.0000	1	0	species	221883	              s__Sulfurospirillum sp002309535
  0.0000	1	1	subspecies	221886	                RS_GCF_002309535.1
  0.0000	1	1	species	238253	              s__Sulfurospirillum sp002162315
  1.7647	258292	0	phylum	154651	    p__Cyanobacteria
  1.7647	258292	0	class	154652	      c__Cyanobacteriia
  1.0084	147594	11	order	163398	        o__Cyanobacteriales
  0.5882	86100	133	family	166780	          f__Nostocaceae
  0.1678	24554	21	genus	193427	            g__Trichormus
  0.0840	12291	3602	species	250503	              s__Trichormus sp001548375
  0.0304	4450	4450	subspecies	250505	                RS_GCF_002368215.1
  0.0290	4239	4239	subspecies	250504	                RS_GCF_001548375.1
  0.0836	12235	11682	species	216529	              s__Trichormus sp000009705
  0.0025	373	373	subspecies	216531	                RS_GCF_002368015.1
  0.0012	180	180	subspecies	216533	                RS_GCF_000009705.1
  0.0000	7	6	species	193428	              s__Trichormus variabilis
  0.0000	1	1	subspecies	193436	                RS_GCF_009498015.1
  0.0840	12296	0	genus	180822	            g__Raphidiopsis
  0.0840	12296	1427	species	248761	              s__Raphidiopsis curvispora_A
  0.0376	5507	5507	subspecies	248763	                RS_GCF_014489415.1
  0.0366	5362	5362	subspecies	248762	                RS_GCF_002368135.1
  0.0840	12296	0	genus	225343	            g__Brasilonema
  0.0840	12296	12208	species	225344	              s__Brasilonema octagenarum
  0.0004	60	60	subspecies	225345	                RS_GCF_006968745.1
  0.0002	28	28	subspecies	225346	                RS_GCF_006968915.1
  0.0840	12293	15	genus	184456	            g__Nostoc
  0.0839	12275	4192	species	255282	              s__Nostoc sphaeroides
  0.0306	4486	4486	subspecies	255283	                RS_GCF_009372195.1
  0.0246	3597	3597	subspecies	255284	                RS_GCF_003443655.1
  0.0000	1	0	species	217327	              s__Nostoc sp003326245
  0.0000	1	1	subspecies	217330	                RS_GCF_013393925.1
  0.0000	1	0	species	249295	              s__Nostoc commune
  0.0000	1	1	subspecies	249296	                GB_GCA_003990685.1
  0.0000	1	0	species	259765	              s__Nostoc flagelliforme
  0.0000	1	1	subspecies	259766	                RS_GCF_002813575.1
  0.0838	12268	0	genus	239333	            g__Anabaena_A
  0.0838	12268	12105	species	239334	              s__Anabaena_A cylindrica
  0.0007	103	103	subspecies	239335	                RS_GCF_000317695.1
  0.0004	60	60	subspecies	239336	                RS_GCF_002367955.1
  0.0837	12254	0	genus	198684	            g__Nodularia
  0.0837	12254	8491	species	210653	              s__Nodularia spumigena
  0.0129	1887	1887	subspecies	210655	                RS_GCF_003054475.1
  0.0128	1876	1876	subspecies	210656	                RS_GCF_000340565.2
  0.0000	2	0	genus	189889	            g__Dolichospermum
  0.0000	2	0	species	189890	              s__Dolichospermum sp000312705
  0.0000	1	1	subspecies	189895	                RS_GCF_008121535.1
  0.0000	1	1	subspecies	189898	                RS_GCF_012516395.1
  0.0000	2	0	genus	204088	            g__Rivularia
  0.0000	2	0	species	317489	              s__Rivularia parasitica
  0.0000	2	2	subspecies	317490	                RS_GCF_002368095.1
  0.0000	1	0	genus	230361	            g__Anabaenopsis
  0.0000	1	0	species	230362	              s__Anabaenopsis sp003990705
  0.0000	1	1	subspecies	230364	                RS_GCF_002367975.1
  0.0000	1	0	genus	242292	            g__Aulosira
  0.0000	1	1	species	242293	              s__Aulosira tenuis
  0.2520	36891	0	family	163399	          f__Microcystaceae
  0.1680	24592	1001	genus	163400	            g__Microcystis
  0.0808	11826	8518	species	180298	              s__Microcystis aeruginosa_C
  0.0118	1731	1731	subspecies	180302	                RS_GCF_001704955.2
  0.0108	1577	1577	subspecies	180308	                RS_GCF_000981785.2
  0.0790	11570	5456	species	179724	              s__Microcystis aeruginosa
  0.0212	3109	3109	subspecies	179736	                RS_GCF_000010625.1
  0.0205	3005	3005	subspecies	179725	                RS_GCF_003945305.1
  0.0009	125	5	species	163401	              s__Microcystis panniformis
  0.0005	69	69	subspecies	163434	                RS_GCF_010196425.1
  0.0003	51	51	subspecies	163431	                RS_GCF_002095975.1
  0.0002	28	0	species	191151	              s__Microcystis sp000297435
  0.0002	28	28	subspecies	191158	                RS_GCF_003019735.1
  0.0002	27	0	species	194435	              s__Microcystis panniformis_A
  0.0002	27	27	subspecies	194436	                RS_GCF_001264245.1
  0.0001	15	0	species	199864	              s__Microcystis viridis
  0.0001	15	15	subspecies	199869	                RS_GCF_009792235.1
  0.0840	12299	0	genus	244564	            g__Rippkaea
  0.0840	12299	5255	species	244565	              s__Rippkaea orientalis
  0.0241	3528	3528	subspecies	244567	                RS_GCF_000024045.1
  0.0240	3516	3516	subspecies	244566	                RS_GCF_000021805.1
  0.1680	24592	0	family	181590	          f__Microcoleaceae
  0.0840	12297	503	genus	188308	            g__Limnospira
  0.0800	11712	9082	species	205190	              s__Limnospira platensis
  0.0103	1513	1513	subspecies	205194	                RS_GCF_000210375.1
  0.0076	1117	1117	subspecies	205191	                RS_GCF_001611905.1
  0.0006	82	68	species	188309	              s__Limnospira fusiformis
  0.0000	4	4	subspecies	188311	                GB_GCA_003060805.1
  0.0000	4	4	subspecies	188314	                RS_GCF_000307915.1
  0.0000	3	3	subspecies	188318	                RS_GCF_000973065.1
  0.0000	2	2	subspecies	188310	                GB_GCA_014250495.1
  0.0000	1	1	subspecies	188313	                GB_GCA_012516315.1
  0.0840	12295	0	genus	188593	            g__Planktothrix
  0.0840	12295	6615	species	235099	              s__Planktothrix agardhii
  0.0195	2853	2853	subspecies	235100	                GB_GCA_003609755.1
  0.0193	2827	2827	subspecies	235101	                RS_GCF_000710505.1
  0.6722	98397	0	order	154653	        o__PCC-6307
  0.6722	98397	238	family	154654	          f__Cyanobiaceae
  0.2515	36818	116	genus	182447	            g__Synechococcus_E
  0.0838	12270	69	species	201901	              s__Synechococcus_E sp000737575
  0.0417	6102	6102	subspecies	201906	                RS_GCF_014280215.1
  0.0417	6099	6099	subspecies	201905	                RS_GCF_000737575.1
  0.0836	12238	3684	species	196667	              s__Synechococcus_E sp000195975
  0.0309	4525	4525	subspecies	196668	                RS_GCF_014280055.1
  0.0273	3990	3990	subspecies	196669	                RS_GCF_014279575.1
  0.0001	14	14	subspecies	196670	                RS_GCF_000195975.1
  0.0001	11	11	subspecies	196673	                RS_GCF_014280015.1
  0.0001	10	10	subspecies	196672	                RS_GCF_014279915.1
  0.0000	4	4	subspecies	196674	                RS_GCF_001182765.1
  0.0833	12190	10	species	239395	              s__Synechococcus_E sp000012625
  0.0418	6116	6116	subspecies	239397	                RS_GCF_000012625.1
  0.0414	6064	6064	subspecies	239396	                RS_GCF_014280075.1
  0.0000	2	0	species	182448	              s__Synechococcus_E sp002724845
  0.0000	1	1	subspecies	182454	                RS_GCF_014279635.1
  0.0000	1	1	subspecies	182456	                RS_GCF_014279615.1
  0.0000	1	0	species	222836	              s__Synechococcus_E sp000012505
  0.0000	1	1	subspecies	222839	                RS_GCF_000012505.1
  0.0000	1	0	species	322104	              s__Synechococcus_E sp014280195
  0.0000	1	1	subspecies	322105	                RS_GCF_014280195.1
  0.2512	36765	115	genus	192773	            g__Synechococcus_C
  0.0838	12260	3469	species	230926	              s__Synechococcus_C sp002693285
  0.0301	4411	4411	subspecies	230929	                RS_GCF_014280035.1
  0.0299	4380	4380	subspecies	230927	                RS_GCF_014280095.1
  0.0837	12257	12185	species	254316	              s__Synechococcus_C sp004209775
  0.0003	45	45	subspecies	254317	                RS_GCF_004209775.1
  0.0002	27	27	subspecies	254318	                RS_GCF_014304795.1
  0.0829	12130	883	species	255598	              s__Synechococcus_C sp000063505
  0.0387	5667	5667	subspecies	255600	                RS_GCF_000063505.1
  0.0381	5580	5580	subspecies	255599	                RS_GCF_014279955.1
  0.0000	1	0	species	226122	              s__Synechococcus_C sp004332415
  0.0000	1	1	subspecies	226123	                RS_GCF_014217855.1
  0.0000	1	0	species	244410	              s__Synechococcus_C sp000153065
  0.0000	1	1	subspecies	244412	                RS_GCF_014279595.1
  0.0000	1	0	species	257164	              s__Synechococcus_C sp002172935
  0.0000	1	1	subspecies	257166	                RS_GCF_014279875.1
  0.0840	12297	0	genus	204911	            g__RCC307
  0.0840	12297	1163	species	204912	              s__RCC307 sp000063525
  0.0383	5601	5601	subspecies	204917	                RS_GCF_014279855.1
  0.0378	5533	5533	subspecies	204913	                RS_GCF_000063525.1
  0.0839	12279	0	genus	175881	            g__Prochlorococcus_C
  0.0839	12279	39	species	175882	              s__Prochlorococcus_C marinus_B
  0.0419	6127	6127	subspecies	175897	                RS_GCF_000011485.1
  0.0418	6113	6113	subspecies	175894	                GB_GCA_000015705.1
  0.0840	12300	0	order	212248	        o__Synechococcales
  0.0840	12300	0	family	212249	          f__Synechococcaceae
  0.0840	12300	0	genus	212250	            g__Synechococcus
  0.0840	12300	561	species	237432	              s__Synechococcus elongatus_A
  0.0402	5886	5886	subspecies	237433	                GB_GCA_003846445.1
  0.0400	5853	5853	subspecies	237434	                GB_GCA_009498715.1
  0.0000	1	0	order	227868	        o__Thermosynechococcales
  0.0000	1	0	family	227869	          f__Thermosynechococcaceae
  0.0000	1	0	genus	261191	            g__Synechococcus_A
  0.0000	1	0	species	261192	              s__Synechococcus_A lividus
  0.0000	1	1	subspecies	261193	                RS_GCF_002754935.1
  1.1762	172162	0	phylum	130832	    p__Spirochaetota
  0.6721	98373	0	class	148602	      c__Spirochaetia
  0.5882	86096	0	order	148603	        o__Borreliales
  0.5882	86096	50	family	148604	          f__Borreliaceae
  0.3359	49161	821	genus	148605	            g__Borreliella
  0.0835	12221	8444	species	190079	              s__Borreliella afzelii
  0.0126	1845	1845	subspecies	190080	                RS_GCF_000304735.1
  0.0126	1838	1838	subspecies	190081	                RS_GCF_001900865.1
  0.0003	39	39	subspecies	190083	                RS_GCF_000741005.1
  0.0003	37	37	subspecies	190086	                RS_GCF_000962775.1
  0.0001	10	10	subspecies	190087	                RS_GCF_000222835.1
  0.0001	8	8	subspecies	190085	                RS_GCF_000165595.2
  0.0831	12158	5619	species	254868	              s__Borreliella valaisiana
  0.0245	3587	3587	subspecies	254869	                RS_GCF_000170955.2
  0.0202	2952	2952	subspecies	254870	                RS_GCF_000739475.1
  0.0821	12013	10655	species	158307	              s__Borreliella garinii
  0.0087	1267	1267	subspecies	158323	                RS_GCF_003814425.1
  0.0004	53	53	subspecies	158326	                RS_GCF_000239475.1
  0.0002	22	22	subspecies	158329	                GB_GCA_000196215.1
  0.0001	9	9	subspecies	158359	                RS_GCF_003814405.1
  0.0000	4	4	subspecies	158312	                RS_GCF_000691545.1
  0.0000	2	2	subspecies	158336	                RS_GCF_001922545.1
  0.0000	1	1	subspecies	158330	                RS_GCF_000300045.1
  0.0805	11788	11721	species	249916	              s__Borreliella mayonii
  0.0003	39	39	subspecies	249918	                RS_GCF_001945665.1
  0.0002	28	28	subspecies	249917	                RS_GCF_001936295.1
  0.0011	158	83	species	148606	              s__Borreliella burgdorferi
  0.0002	29	29	subspecies	148698	                RS_GCF_000021405.1
  0.0001	18	18	subspecies	148695	                RS_GCF_003367295.1
  0.0001	11	11	subspecies	148624	                RS_GCF_002442595.1
  0.0000	6	6	subspecies	148690	                RS_GCF_000008685.2
  0.0000	4	4	subspecies	148648	                RS_GCF_000166655.1
  0.0000	3	3	subspecies	148689	                RS_GCF_000166635.1
  0.0000	2	2	subspecies	148645	                RS_GCF_002151465.1
  0.0000	2	2	subspecies	148651	                RS_GCF_002151485.1
  0.0000	2	0	species	308243	              s__Borreliella bissettii
  0.0000	2	2	subspecies	308244	                RS_GCF_000222305.1
  0.2520	36885	15	genus	174069	            g__Borrelia
  0.0840	12294	3611	species	199385	              s__Borrelia duttonii
  0.0309	4517	4517	subspecies	199388	                RS_GCF_000568715.1
  0.0278	4075	4075	subspecies	199386	                RS_GCF_000019705.1
  0.0003	51	51	subspecies	199389	                RS_GCF_000259345.1
  0.0003	40	40	subspecies	199391	                RS_GCF_000019685.1
  0.0840	12290	7540	species	215458	              s__Borrelia turicatae
  0.0170	2488	2488	subspecies	215460	                RS_GCF_000012085.2
  0.0152	2220	2220	subspecies	215459	                RS_GCF_000568735.2
  0.0002	26	26	subspecies	215461	                RS_GCF_000512145.1
  0.0001	16	16	subspecies	215462	                RS_GCF_003568645.1
  0.0839	12282	11173	species	198625	              s__Borrelia hermsii
  0.0039	566	566	subspecies	198627	                RS_GCF_000956315.1
  0.0016	234	234	subspecies	198631	                RS_GCF_000568775.1
  0.0014	210	210	subspecies	198626	                RS_GCF_001598195.1
  0.0003	39	39	subspecies	198628	                RS_GCF_000568675.1
  0.0002	30	30	subspecies	198629	                RS_GCF_001660005.1
  0.0002	25	25	subspecies	198632	                RS_GCF_000568795.1
  0.0000	5	5	subspecies	198630	                RS_GCF_000012065.2
  0.0000	2	1	species	174070	              s__Borrelia miyamotoi
  0.0000	1	1	subspecies	174089	                RS_GCF_003431845.1
  0.0000	1	0	species	245147	              s__Borrelia anserina
  0.0000	1	1	subspecies	245148	                RS_GCF_001936255.1
  0.0000	1	0	species	253731	              s__Borrelia coriaceae
  0.0000	1	1	subspecies	253732	                RS_GCF_000568755.1
  0.0839	12277	0	order	151303	        o__Treponematales
  0.0839	12277	0	family	151304	          f__Treponemataceae
  0.0839	12277	1	genus	151305	            g__Treponema
  0.0839	12276	11577	species	185084	              s__Treponema phagedenis
  0.0040	589	589	subspecies	185087	                RS_GCF_013348685.1
  0.0004	60	60	subspecies	185089	                RS_GCF_008152505.1
  0.0002	26	26	subspecies	185093	                RS_GCF_008153205.1
  0.0001	9	9	subspecies	185091	                RS_GCF_008153055.1
  0.0001	8	8	subspecies	185094	                RS_GCF_008152665.1
  0.0000	5	5	subspecies	185096	                RS_GCF_008153345.1
  0.0000	2	2	subspecies	185092	                RS_GCF_008152825.1
  0.4201	61490	0	class	130833	      c__Leptospirae
  0.4201	61490	0	order	130834	        o__Leptospirales
  0.4201	61490	0	family	130835	          f__Leptospiraceae
  0.3361	49200	71	genus	130836	            g__Leptospira
  0.0840	12295	6452	species	162514	              s__Leptospira santarosai
  0.0264	3858	3858	subspecies	162538	                RS_GCF_000313175.2
  0.0127	1856	1856	subspecies	162515	                RS_GCF_001008325.2
  0.0004	65	65	subspecies	162550	                RS_GCF_000988105.2
  0.0002	32	32	subspecies	162543	                RS_GCF_001008335.2
  0.0002	32	32	subspecies	162554	                RS_GCF_002287705.1
  0.0840	12288	12217	species	158926	              s__Leptospira borgpetersenii
  0.0003	46	46	subspecies	158937	                RS_GCF_003516145.1
  0.0001	13	13	subspecies	158929	                RS_GCF_001618485.1
  0.0000	3	3	subspecies	158956	                RS_GCF_000013965.1
  0.0000	2	2	subspecies	158938	                GB_GCA_009884155.1
  0.0000	2	2	subspecies	158943	                RS_GCF_001618585.1
  0.0000	2	2	subspecies	158972	                RS_GCF_003716785.1
  0.0000	1	1	subspecies	158947	                RS_GCF_001618525.1
  0.0000	1	1	subspecies	158955	                RS_GCF_001652525.2
  0.0000	1	1	subspecies	158967	                RS_GCF_001618445.1
  0.0839	12277	11373	species	174467	              s__Leptospira weilii
  0.0031	453	453	subspecies	174472	                RS_GCF_006874745.1
  0.0031	451	451	subspecies	174475	                RS_GCF_006874765.1
  0.0838	12268	10780	species	202882	              s__Leptospira mayottensis
  0.0089	1310	1310	subspecies	202884	                RS_GCF_003429485.1
  0.0006	93	93	subspecies	202885	                RS_GCF_000306675.2
  0.0003	50	50	subspecies	202886	                RS_GCF_003429505.1
  0.0002	35	35	subspecies	202887	                RS_GCF_003429525.1
  0.0000	1	0	species	130837	              s__Leptospira interrogans
  0.0000	1	1	subspecies	130905	                RS_GCF_005222625.1
  0.0840	12290	0	genus	181559	            g__Leptospira_A
  0.0840	12290	12222	species	195229	              s__Leptospira_A biflexa
  0.0002	35	35	subspecies	195231	                RS_GCF_000017605.1
  0.0002	33	33	subspecies	195232	                RS_GCF_000017685.1
  0.0840	12299	0	class	163189	      c__Brachyspirae
  0.0840	12299	0	order	163190	        o__Brachyspirales
  0.0840	12299	0	family	163191	          f__Brachyspiraceae
  0.0840	12299	4	genus	163192	            g__Brachyspira
  0.0840	12294	4785	species	176539	              s__Brachyspira pilosicoli
  0.0270	3946	3946	subspecies	176546	                RS_GCF_000296575.1
  0.0236	3450	3450	subspecies	176543	                RS_GCF_000143725.1
  0.0005	75	75	subspecies	176555	                RS_GCF_000319185.1
  0.0003	38	38	subspecies	176548	                RS_GCF_000325665.1
  0.0000	1	0	species	219162	              s__Brachyspira hampsonii
  0.0000	1	1	subspecies	219163	                RS_GCF_002214805.1
  0.7558	110632	0	phylum	161696	    p__Fusobacteriota
  0.7558	110632	0	class	161697	      c__Fusobacteriia
  0.7558	110632	32	order	161698	        o__Fusobacteriales
  0.5879	86055	65	family	161699	          f__Fusobacteriaceae
  0.5035	73694	2314	genus	169198	            g__Fusobacterium
  0.0825	12080	6522	species	170105	              s__Fusobacterium animalis
  0.0298	4368	4368	subspecies	170108	                RS_GCF_001296085.1
  0.0063	915	915	subspecies	170106	                GB_GCA_002211645.1
  0.0008	121	121	subspecies	170112	                RS_GCF_000158275.2
  0.0004	54	54	subspecies	170122	                RS_GCF_000400875.1
  0.0003	50	50	subspecies	170110	                RS_GCF_001296145.1
  0.0003	50	50	subspecies	170128	                RS_GCF_000218645.2
  0.0818	11967	5670	species	178991	              s__Fusobacterium vincentii
  0.0232	3396	3396	subspecies	178994	                RS_GCF_002764055.1
  0.0192	2808	2808	subspecies	178993	                RS_GCF_000163915.2
  0.0006	92	92	subspecies	179000	                RS_GCF_001296125.1
  0.0000	1	1	subspecies	178996	                RS_GCF_902381645.1
  0.0816	11947	3998	species	184881	              s__Fusobacterium nucleatum
  0.0392	5733	5733	subspecies	184885	                RS_GCF_002243405.1
  0.0141	2066	2066	subspecies	184883	                GB_GCA_001296185.1
  0.0006	95	95	subspecies	184892	                RS_GCF_002211605.1
  0.0003	46	46	subspecies	184893	                RS_GCF_003019785.1
  0.0000	5	5	subspecies	184889	                RS_GCF_001296165.1
  0.0000	2	2	subspecies	184890	                RS_GCF_003019295.1
  0.0000	2	2	subspecies	184891	                GB_GCA_000007325.1
  0.0811	11870	6040	species	193331	              s__Fusobacterium pseudoperiodonticum
  0.0196	2866	2866	subspecies	193332	                RS_GCF_002763595.1
  0.0186	2728	2728	subspecies	193333	                RS_GCF_002763775.1
  0.0006	81	81	subspecies	193338	                RS_GCF_002763735.1
  0.0005	78	78	subspecies	193335	                RS_GCF_002763625.1
  0.0003	49	49	subspecies	193339	                RS_GCF_002763815.1
  0.0002	28	28	subspecies	193337	                RS_GCF_002763925.1
  0.0803	11750	5718	species	188263	              s__Fusobacterium hwasookii
  0.0280	4101	4101	subspecies	188267	                RS_GCF_014217355.1
  0.0118	1720	1720	subspecies	188265	                RS_GCF_001455085.1
  0.0009	136	136	subspecies	188271	                RS_GCF_014217375.1
  0.0003	46	46	subspecies	188268	                RS_GCF_001455145.1
  0.0002	29	29	subspecies	188269	                RS_GCF_001455105.1
  0.0796	11647	6342	species	198784	              s__Fusobacterium periodonticum_D
  0.0340	4970	4970	subspecies	198789	                RS_GCF_003019755.1
  0.0022	325	325	subspecies	198790	                RS_GCF_002763875.1
  0.0000	6	6	subspecies	198787	                RS_GCF_002763915.1
  0.0000	4	4	subspecies	198791	                RS_GCF_002763695.1
  0.0008	119	41	species	169199	              s__Fusobacterium polymorphum
  0.0002	24	24	subspecies	169221	                RS_GCF_002211625.1
  0.0001	18	18	subspecies	169222	                RS_GCF_002202115.1
  0.0001	13	13	subspecies	169204	                RS_GCF_013137915.1
  0.0001	13	13	subspecies	169214	                RS_GCF_001433955.1
  0.0000	7	7	subspecies	169225	                GB_GCA_001455125.1
  0.0000	2	2	subspecies	169212	                RS_GCF_001457555.1
  0.0000	1	1	subspecies	169218	                RS_GCF_000153625.3
  0.0840	12296	139	genus	192372	            g__Fusobacterium_A
  0.0830	12146	12077	species	201686	              s__Fusobacterium_A ulcerans
  0.0004	56	56	subspecies	201692	                RS_GCF_900478315.1
  0.0001	13	13	subspecies	201689	                RS_GCF_003019675.1
  0.0000	7	0	species	218845	              s__Fusobacterium_A ulcerans_A
  0.0000	7	7	subspecies	218846	                RS_GCF_900683735.1
  0.0000	4	0	species	281429	              s__Fusobacterium_A varium_A
  0.0000	4	4	subspecies	281430	                RS_GCF_002356455.1
  0.1677	24545	5	family	170653	          f__Leptotrichiaceae
  0.0839	12278	0	genus	170654	            g__Streptobacillus
  0.0839	12278	12135	species	170655	              s__Streptobacillus moniliformis
  0.0008	117	117	subspecies	170671	                RS_GCF_002983685.1
  0.0002	26	26	subspecies	170665	                RS_GCF_000024565.1
  0.0838	12262	54	genus	199760	            g__Leptotrichia
  0.0833	12198	4550	species	214629	              s__Leptotrichia trevisanii
  0.0261	3825	3825	subspecies	214631	                RS_GCF_007990365.1
  0.0258	3779	3779	subspecies	214632	                RS_GCF_007990425.1
  0.0003	44	44	subspecies	214633	                RS_GCF_007990575.1
  0.0000	4	0	species	199761	              s__Leptotrichia wadei
  0.0000	2	2	subspecies	199765	                RS_GCF_007990545.2
  0.0000	2	2	subspecies	199766	                RS_GCF_007990405.1
  0.0000	2	0	species	224326	              s__Leptotrichia hofstadii
  0.0000	2	2	subspecies	224329	                RS_GCF_007990525.1
  0.0000	1	0	species	252513	              s__Leptotrichia shahii
  0.0000	1	1	subspecies	252515	                RS_GCF_008327825.1
  0.0000	1	0	species	271411	              s__Leptotrichia buccalis
  0.0000	1	1	subspecies	271412	                RS_GCF_000023905.1
  0.0000	1	0	species	286055	              s__Leptotrichia sp001553645
  0.0000	1	1	subspecies	286056	                RS_GCF_001553645.1
  0.0000	1	0	species	286363	              s__Leptotrichia hongkongensis
  0.0000	1	1	subspecies	286364	                RS_GCF_007990635.1
  0.5878	86041	0	phylum	142044	    p__Chlamydiota
  0.5878	86041	0	class	142045	      c__Chlamydiia
  0.5878	86041	0	order	142046	        o__Chlamydiales
  0.5878	86040	20	family	142047	          f__Chlamydiaceae
  0.4201	61490	153	genus	156030	            g__Chlamydophila
  0.0840	12297	9980	species	184470	              s__Chlamydophila pecorum
  0.0097	1424	1424	subspecies	184471	                RS_GCF_000204135.1
  0.0057	830	830	subspecies	184472	                RS_GCF_000508065.1
  0.0002	32	32	subspecies	184475	                RS_GCF_000470825.1
  0.0001	14	14	subspecies	184479	                RS_GCF_000470765.1
  0.0001	11	11	subspecies	184473	                RS_GCF_000470805.1
  0.0000	6	6	subspecies	184474	                RS_GCF_000508025.1
  0.0840	12295	8055	species	182987	              s__Chlamydophila pneumoniae
  0.0289	4236	4236	subspecies	182989	                RS_GCF_000024145.1
  0.0000	2	2	subspecies	182988	                RS_GCF_001007025.1
  0.0000	1	1	subspecies	182996	                RS_GCF_000007205.1
  0.0000	1	1	subspecies	182999	                RS_GCF_000011165.1
  0.0840	12294	7503	species	247368	              s__Chlamydophila gallinacea
  0.0167	2438	2438	subspecies	247369	                RS_GCF_002007725.1
  0.0161	2353	2353	subspecies	247370	                RS_GCF_000471025.2
  0.0840	12290	6305	species	213868	              s__Chlamydophila avium
  0.0207	3030	3030	subspecies	213869	                GB_GCA_902498835.1
  0.0202	2955	2955	subspecies	213871	                RS_GCF_000583875.1
  0.0830	12148	11607	species	158479	              s__Chlamydophila abortus
  0.0030	435	435	subspecies	158487	                RS_GCF_002205755.1
  0.0002	33	33	subspecies	158510	                RS_GCF_900416705.1
  0.0002	29	29	subspecies	158520	                RS_GCF_008329805.1
  0.0001	20	20	subspecies	158500	                RS_GCF_000213905.2
  0.0001	20	20	subspecies	158524	                RS_GCF_900416725.1
  0.0000	2	2	subspecies	158497	                RS_GCF_002895085.1
  0.0000	2	2	subspecies	158514	                RS_GCF_000026025.1
  0.0001	11	7	species	156031	              s__Chlamydophila psittaci
  0.0000	2	2	subspecies	156058	                RS_GCF_000298555.2
  0.0000	2	2	subspecies	156090	                RS_GCF_000298495.2
  0.0000	2	0	species	263225	              s__Chlamydophila sp900239945
  0.0000	2	2	subspecies	263226	                RS_GCF_900239945.1
  0.1676	24530	269	genus	142048	            g__Chlamydia
  0.0838	12268	12210	species	168557	              s__Chlamydia muridarum
  0.0002	26	26	subspecies	168562	                RS_GCF_002998115.1
  0.0001	17	17	subspecies	168580	                RS_GCF_000175535.1
  0.0000	6	6	subspecies	168563	                RS_GCF_002998235.1
  0.0000	5	5	subspecies	168579	                RS_GCF_002997955.1
  0.0000	3	3	subspecies	168581	                RS_GCF_002997735.1
  0.0000	1	1	subspecies	168561	                RS_GCF_002997935.1
  0.0819	11988	9322	species	166100	              s__Chlamydia suis
  0.0115	1683	1683	subspecies	166102	                RS_GCF_900149465.2
  0.0064	930	930	subspecies	166104	                RS_GCF_900149545.2
  0.0001	13	13	subspecies	166127	                RS_GCF_900169125.1
  0.0001	11	11	subspecies	166129	                RS_GCF_009931335.1
  0.0001	9	9	subspecies	166106	                RS_GCF_900169045.1
  0.0001	8	8	subspecies	166123	                RS_GCF_900169085.1
  0.0000	7	7	subspecies	166105	                RS_GCF_900149625.2
  0.0000	3	3	subspecies	166121	                RS_GCF_900149535.2
  0.0000	1	1	subspecies	166115	                RS_GCF_900149385.2
  0.0000	1	1	subspecies	166133	                RS_GCF_900149505.2
  0.0000	5	5	species	142049	              s__Chlamydia trachomatis
  0.0000	1	0	family	213818	          f__Parachlamydiaceae
  0.0000	1	0	genus	213819	            g__Protochlamydia
  0.0000	1	0	species	246813	              s__Protochlamydia naegleriophila
  0.0000	1	1	subspecies	246815	                RS_GCF_001499655.1
  0.5042	73802	0	phylum	183533	    p__Planctomycetota
  0.3361	49202	0	class	195278	      c__Planctomycetes
  0.3361	49202	0	order	195680	        o__Planctomycetales
  0.2521	36902	0	family	195681	          f__Planctomycetaceae
  0.2521	36902	82	genus	197069	            g__Gimesia
  0.0840	12297	54	species	238058	              s__Gimesia sp007748195
  0.0418	6123	6123	subspecies	238059	                RS_GCF_007748175.1
  0.0418	6120	6120	subspecies	238060	                RS_GCF_007748195.1
  0.0839	12287	2745	species	222674	              s__Gimesia sp007748015
  0.0384	5620	5620	subspecies	222675	                RS_GCF_007751945.1
  0.0267	3915	3915	subspecies	222676	                RS_GCF_007748155.1
  0.0000	7	7	subspecies	222677	                RS_GCF_007748015.1
  0.0836	12232	685	species	217145	              s__Gimesia sp002724985
  0.0406	5946	5946	subspecies	217146	                RS_GCF_009720525.1
  0.0382	5596	5596	subspecies	217147	                RS_GCF_007746535.1
  0.0000	5	5	subspecies	217148	                RS_GCF_007744075.1
  0.0000	2	0	species	253728	              s__Gimesia sp007748135
  0.0000	2	2	subspecies	253729	                RS_GCF_007748135.1
  0.0000	2	0	species	298462	              s__Gimesia sp007744675
  0.0000	2	2	subspecies	298463	                RS_GCF_007744675.1
  0.0840	12300	0	family	240366	          f__CA54
  0.0840	12300	0	genus	240367	            g__CA54
  0.0840	12300	527	species	240368	              s__CA54 sp007747995
  0.0402	5887	5887	subspecies	240369	                RS_GCF_007744975.1
  0.0402	5886	5886	subspecies	240370	                RS_GCF_007747995.1
  0.0840	12300	0	class	192447	      c__Brocadiae
  0.0840	12300	0	order	192448	        o__Brocadiales
  0.0840	12300	0	family	192449	          f__Brocadiaceae
  0.0840	12300	0	genus	192450	            g__Kuenenia
  0.0840	12300	7989	species	192451	              s__Kuenenia stuttgartiensis
  0.0152	2228	2228	subspecies	192458	                RS_GCF_900232105.1
  0.0142	2083	2083	subspecies	192459	                RS_GCF_011066545.1
  0.0840	12300	0	class	209738	      c__UBA1135
  0.0840	12300	0	order	209739	        o__UBA1135
  0.0840	12300	0	family	209740	          f__GCA-002686595
  0.0840	12300	0	genus	256120	            g__Pla86
  0.0840	12300	12274	species	256121	              s__Pla86 sp007751255
  0.0001	16	16	subspecies	256122	                RS_GCF_007748095.1
  0.0001	10	10	subspecies	256123	                RS_GCF_007751255.1
  0.3361	49200	0	phylum	182706	    p__Thermotogota
  0.3361	49200	0	class	182707	      c__Thermotogae
  0.2521	36900	0	order	183100	        o__Thermotogales
  0.1681	24600	50	family	183101	          f__Thermotogaceae
  0.1677	24550	4362	genus	183102	            g__Thermotoga
  0.0755	11058	5659	species	214063	              s__Thermotoga neapolitana
  0.0193	2824	2824	subspecies	214067	                RS_GCF_000832145.1
  0.0176	2575	2575	subspecies	214066	                RS_GCF_000018945.1
  0.0618	9045	8913	species	185969	              s__Thermotoga maritima
  0.0005	79	79	subspecies	185970	                RS_GCF_000230655.2
  0.0002	33	33	subspecies	185980	                RS_GCF_000019625.1
  0.0001	15	15	subspecies	185978	                RS_GCF_000789335.1
  0.0000	4	4	subspecies	185974	                RS_GCF_000008545.1
  0.0000	1	1	subspecies	185971	                RS_GCF_000978575.1
  0.0006	85	37	species	183103	              s__Thermotoga petrophila
  0.0001	20	20	subspecies	183108	                RS_GCF_000789375.1
  0.0001	15	15	subspecies	183109	                RS_GCF_000016785.1
  0.0001	13	13	subspecies	183113	                RS_GCF_000025105.1
  0.0840	12300	0	family	196685	          f__Fervidobacteriaceae
  0.0840	12300	1	genus	196686	            g__Thermosipho
  0.0840	12299	11152	species	208235	              s__Thermosipho affectus
  0.0041	605	605	subspecies	208240	                RS_GCF_001682135.1
  0.0037	542	542	subspecies	208236	                RS_GCF_001941365.1
  0.0840	12300	0	order	182708	        o__Petrotogales
  0.0840	12300	0	family	200733	          f__Petrotogaceae
  0.0840	12300	0	genus	211528	            g__Marinitoga
  0.0840	12300	7894	species	211529	              s__Marinitoga piezophila
  0.0152	2230	2230	subspecies	211530	                RS_GCF_001941525.1
  0.0149	2176	2176	subspecies	211532	                RS_GCF_000255135.1
  0.3361	49200	0	phylum	180314	    p__Myxococcota
  0.2521	36900	0	class	180315	      c__Myxococcia
  0.2521	36900	0	order	180316	        o__Myxococcales
  0.2521	36900	27	family	180317	          f__Myxococcaceae
  0.1680	24588	211	genus	190277	            g__Myxococcus
  0.0839	12284	2456	species	245160	              s__Myxococcus macrosporus
  0.0337	4929	4929	subspecies	245161	                RS_GCF_002305895.1
  0.0335	4899	4899	subspecies	245162	                RS_GCF_000219105.1
  0.0823	12049	7929	species	206591	              s__Myxococcus xanthus_A
  0.0141	2071	2071	subspecies	206592	                RS_GCF_006400955.1
  0.0138	2026	2026	subspecies	206593	                RS_GCF_006402015.1
  0.0002	23	23	subspecies	206595	                RS_GCF_006401215.1
  0.0003	39	4	species	195656	              s__Myxococcus xanthus
  0.0001	20	20	subspecies	195659	                RS_GCF_006401635.1
  0.0001	15	15	subspecies	195660	                RS_GCF_000012685.1
  0.0000	4	0	species	279139	              s__Myxococcus hansupus
  0.0000	4	4	subspecies	279140	                RS_GCF_000280925.3
  0.0000	1	0	species	313978	              s__Myxococcus stipitatus
  0.0000	1	1	subspecies	313979	                RS_GCF_000331735.1
  0.0839	12285	0	genus	180318	            g__Corallococcus
  0.0839	12285	64	species	199424	              s__Corallococcus coralloides
  0.0418	6118	6118	subspecies	199428	                RS_GCF_000255295.1
  0.0417	6103	6103	subspecies	199429	                RS_GCF_004104415.1
  0.0840	12300	0	class	205139	      c__Bradymonadia
  0.0840	12300	0	order	205140	        o__Bradymonadales
  0.0840	12300	0	family	205141	          f__Bradymonadaceae
  0.0840	12300	0	genus	239366	            g__Persicimonas
  0.0840	12300	12300	species	239367	              s__Persicimonas caeni
  0.2521	36899	0	phylum	161839	    p__Deinococcota
  0.2521	36899	0	class	161840	      c__Deinococci
  0.2521	36899	0	order	161841	        o__Deinococcales
  0.2521	36899	1	family	193250	          f__Deinococcaceae
  0.2521	36898	54	genus	193251	            g__Deinococcus
  0.0840	12297	1262	species	214225	              s__Deinococcus radiopugnans
  0.0383	5607	5607	subspecies	214228	                RS_GCF_013401415.1
  0.0371	5428	5428	subspecies	214229	                RS_GCF_000800395.1
  0.0839	12276	116	species	218042	              s__Deinococcus actinosclerus
  0.0416	6090	6090	subspecies	218046	                RS_GCF_003206515.1
  0.0415	6070	6070	subspecies	218045	                RS_GCF_001507665.1
  0.0838	12263	957	species	202969	              s__Deinococcus wulumuqiensis
  0.0387	5663	5663	subspecies	202972	                RS_GCF_003345215.1
  0.0386	5643	5643	subspecies	202971	                RS_GCF_011067105.1
  0.0000	5	0	species	207632	              s__Deinococcus grandis
  0.0000	5	5	subspecies	207633	                GB_GCA_009177165.1
  0.0000	1	0	species	234744	              s__Deinococcus soli
  0.0000	1	1	subspecies	234745	                RS_GCF_001007995.1
  0.0000	1	0	species	282164	              s__Deinococcus proteolyticus
  0.0000	1	1	subspecies	282165	                RS_GCF_000190555.1
  0.0000	1	0	species	294567	              s__Deinococcus sp009017495
  0.0000	1	1	subspecies	294568	                RS_GCF_009017495.1
  0.2521	36898	0	phylum	167981	    p__Firmicutes_C
  0.2521	36898	2	class	167982	      c__Negativicutes
  0.1680	24596	0	order	169486	        o__Veillonellales
  0.0840	12299	0	family	175505	          f__Veillonellaceae
  0.0840	12299	1868	genus	175506	            g__Veillonella
  0.0698	10215	10214	species	256384	              s__Veillonella parvula
  0.0000	1	1	subspecies	256386	                RS_GCF_000024945.1
  0.0015	214	15	species	175507	              s__Veillonella parvula_A
  0.0006	88	88	subspecies	175509	                RS_GCF_000448705.1
  0.0004	63	63	subspecies	175512	                RS_GCF_902810435.1
  0.0003	48	48	subspecies	175510	                RS_GCF_002005185.1
  0.0000	1	0	species	181638	              s__Veillonella atypica
  0.0000	1	1	subspecies	181651	                RS_GCF_002082765.1
  0.0000	1	0	species	185883	              s__Veillonella dispar_A
  0.0000	1	1	subspecies	185893	                RS_GCF_013393365.1
  0.0840	12297	1	family	192248	          f__Dialisteraceae
  0.0840	12296	0	genus	192249	            g__Dialister
  0.0840	12296	6478	species	206295	              s__Dialister hominis
  0.0200	2931	2931	subspecies	206296	                RS_GCF_007164725.1
  0.0197	2887	2887	subspecies	206297	                RS_GCF_900343095.1
  0.0840	12300	0	order	167983	        o__Acidaminococcales
  0.0840	12300	0	family	167984	          f__Acidaminococcaceae
  0.0840	12300	0	genus	168938	            g__Phascolarctobacterium
  0.0840	12300	5332	species	168939	              s__Phascolarctobacterium faecium
  0.0239	3501	3501	subspecies	168943	                RS_GCF_003945365.1
  0.0236	3451	3451	subspecies	168948	                RS_GCF_014489955.1
  0.0001	16	16	subspecies	168966	                RS_GCF_900683765.1
  0.2521	36898	19	phylum	178400	    p__Firmicutes_B
  0.0840	12300	0	class	197453	      c__Desulfotomaculia
  0.0840	12300	0	order	231741	        o__Ammonifexales
  0.0840	12300	0	family	231742	          f__Desulforudaceae
  0.0840	12300	0	genus	231743	            g__Desulforudis
  0.0840	12300	11632	species	231744	              s__Desulforudis audaxviator
  0.0033	481	481	subspecies	231745	                RS_GCF_000018425.1
  0.0013	187	187	subspecies	231746	                GB_GCA_003932015.2
  0.0840	12300	0	class	208084	      c__Thermincolia
  0.0840	12300	0	order	208085	        o__Carboxydocellales
  0.0840	12300	0	family	208086	          f__Carboxydocellaceae
  0.0840	12300	0	genus	208087	            g__Carboxydocella
  0.0840	12300	7801	species	208088	              s__Carboxydocella thermautotrophica
  0.0159	2334	2334	subspecies	208093	                RS_GCF_003054495.1
  0.0148	2165	2165	subspecies	208090	                RS_GCF_003047205.1
  0.0839	12279	0	class	191975	      c__Desulfitobacteriia
  0.0839	12279	5	order	191976	        o__Desulfitobacteriales
  0.0839	12274	2	family	202118	          f__Syntrophobotulaceae
  0.0838	12272	0	genus	202119	            g__Dehalobacter
  0.0838	12272	11368	species	202120	              s__Dehalobacter restrictus
  0.0031	460	460	subspecies	202123	                RS_GCF_000305775.1
  0.0027	395	395	subspecies	202121	                RS_GCF_000305815.1
  0.0002	25	25	subspecies	202126	                RS_GCF_000512895.1
  0.0002	24	24	subspecies	202125	                RS_GCF_009796305.1
  0.2517	36842	2	phylum	163565	    p__Desulfobacterota
  0.1677	24546	0	class	184311	      c__Desulfovibrionia
  0.1677	24546	0	order	184312	        o__Desulfovibrionales
  0.1677	24546	1	family	184313	          f__Desulfovibrionaceae
  0.0839	12284	0	genus	197256	            g__Lawsonia
  0.0839	12284	12230	species	197257	              s__Lawsonia intracellularis
  0.0002	29	29	subspecies	197260	                RS_GCF_000331715.1
  0.0002	25	25	subspecies	197258	                RS_GCF_000055945.1
  0.0838	12261	56	genus	201967	            g__Desulfovibrio
  0.0834	12202	12124	species	246775	              s__Desulfovibrio sp900095395
  0.0004	60	60	subspecies	246776	                RS_GCF_902702915.1
  0.0001	18	18	subspecies	246777	                GB_GCA_900095395.1
  0.0000	3	2	species	208821	              s__Desulfovibrio desulfuricans_A
  0.0000	1	1	subspecies	208826	                RS_GCF_000022125.1
  0.0840	12294	0	class	196368	      c__Desulfobacteria
  0.0840	12294	0	order	197964	        o__Desulfobacterales
  0.0840	12294	0	family	214870	          f__Desulfococcaceae
  0.0840	12294	0	genus	214871	            g__Desulfococcus
  0.0840	12294	12252	species	214872	              s__Desulfococcus multivorans
  0.0002	23	23	subspecies	214874	                RS_GCF_001854245.1
  0.0001	19	19	subspecies	214873	                RS_GCF_002009335.2
  0.1681	24600	0	phylum	170596	    p__Chloroflexota
  0.1681	24600	0	class	170597	      c__Dehalococcoidia
  0.1681	24600	0	order	170598	        o__Dehalococcoidales
  0.1681	24600	0	family	170599	          f__Dehalococcoidaceae
  0.1681	24600	895	genus	170600	            g__Dehalococcoides
  0.0820	12007	9363	species	196241	              s__Dehalococcoides mccartyi_A
  0.0138	2027	2027	subspecies	196244	                RS_GCF_000499365.1
  0.0039	564	564	subspecies	196242	                RS_GCF_001889305.1
  0.0002	29	29	subspecies	196246	                RS_GCF_000025025.1
  0.0001	21	21	subspecies	196245	                RS_GCF_001010485.1
  0.0000	3	3	subspecies	196248	                RS_GCF_000830925.1
  0.0797	11667	3410	species	189847	              s__Dehalococcoides mccartyi
  0.0347	5075	5075	subspecies	189850	                RS_GCF_000011905.1
  0.0216	3163	3163	subspecies	189851	                RS_GCF_002356375.1
  0.0001	19	19	subspecies	189854	                RS_GCF_000830905.1
  0.0002	31	15	species	170601	              s__Dehalococcoides mccartyi_B
  0.0000	5	5	subspecies	170610	                RS_GCF_000341695.1
  0.0000	4	4	subspecies	170624	                GB_GCA_001761445.1
  0.0000	3	3	subspecies	170604	                RS_GCF_001610775.1
  0.0000	3	3	subspecies	170615	                RS_GCF_004684285.1
  0.0000	1	1	subspecies	170616	                RS_GCF_000016705.1
  0.1681	24599	0	phylum	187849	    p__Bdellovibrionota
  0.1681	24599	0	class	206629	      c__Bacteriovoracia
  0.1681	24599	0	order	206630	        o__Bacteriovoracales
  0.1681	24599	0	family	206631	          f__Bacteriovoracaceae
  0.0840	12300	0	genus	229272	            g__Bacteriovorax
  0.0840	12300	7083	species	229273	              s__Bacteriovorax stolpii
  0.0182	2659	2659	subspecies	229276	                RS_GCF_006874605.1
  0.0175	2558	2558	subspecies	229275	                RS_GCF_002872415.1
  0.0840	12299	0	genus	255588	            g__Halobacteriovorax
  0.0840	12299	995	species	255589	              s__Halobacteriovorax marinus
  0.0386	5657	5657	subspecies	255590	                RS_GCF_002442875.1
  0.0386	5647	5647	subspecies	255591	                RS_GCF_000210915.2
  0.0840	12300	0	phylum	175326	    p__Nitrospirota_A
  0.0840	12300	0	class	175327	      c__Leptospirillia
  0.0840	12300	0	order	175328	        o__Leptospirillales
  0.0840	12300	0	family	175329	          f__Leptospirillaceae
  0.0840	12300	0	genus	175330	            g__Leptospirillum_A
  0.0840	12300	5125	species	175331	              s__Leptospirillum_A rubarum
  0.0269	3941	3941	subspecies	175341	                RS_GCF_001186405.1
  0.0220	3218	3218	subspecies	175336	                RS_GCF_000695975.1
  0.0001	16	16	subspecies	175344	                RS_GCF_000299235.1
  0.0840	12300	0	phylum	193299	    p__Fibrobacterota
  0.0840	12300	0	class	193300	      c__Fibrobacteria
  0.0840	12300	0	order	193301	        o__Fibrobacterales
  0.0840	12300	0	family	193302	          f__Fibrobacteraceae
  0.0840	12300	0	genus	193303	            g__Fibrobacter
  0.0840	12300	12079	species	251579	              s__Fibrobacter succinogenes
  0.0009	127	127	subspecies	251580	                RS_GCF_000146505.1
  0.0006	94	94	subspecies	251581	                RS_GCF_000024665.1
  0.0840	12300	0	phylum	194690	    p__Elusimicrobiota
  0.0840	12300	0	class	194691	      c__Endomicrobia
  0.0840	12300	0	order	194692	        o__Endomicrobiales
  0.0840	12300	0	family	194693	          f__Endomicrobiaceae
  0.0840	12300	0	genus	255361	            g__Endomicrobium_A
  0.0840	12300	3272	species	255362	              s__Endomicrobium_A trichonymphae
  0.0309	4521	4521	subspecies	255364	                RS_GCF_002355835.1
  0.0308	4507	4507	subspecies	255363	                RS_GCF_000146025.2
  0.0840	12300	0	phylum	199217	    p__Firmicutes_E
  0.0840	12300	0	class	199218	      c__Sulfobacillia
  0.0840	12300	0	order	199219	        o__Sulfobacillales
  0.0840	12300	0	family	199220	          f__Sulfobacillaceae
  0.0840	12300	0	genus	243986	            g__Sulfobacillus_A
  0.0840	12300	12110	species	243987	              s__Sulfobacillus_A acidophilus
  0.0007	98	98	subspecies	243989	                GB_GCA_000219855.1
  0.0006	92	92	subspecies	243988	                GB_GCA_000237975.1
  0.0840	12300	0	phylum	213657	    p__Aquificota
  0.0840	12300	0	class	213658	      c__Aquificae
  0.0840	12300	0	order	213659	        o__Aquificales
  0.0840	12300	1	family	222169	          f__Aquificaceae
  0.0840	12299	0	genus	226935	            g__Hydrogenobacter
  0.0840	12299	12244	species	226936	              s__Hydrogenobacter thermophilus
  0.0002	28	28	subspecies	226938	                RS_GCF_000010785.1
  0.0002	27	27	subspecies	226937	                RS_GCF_000164905.1
  0.0840	12300	0	phylum	233487	    p__Calditrichota
  0.0840	12300	0	class	233488	      c__Calditrichia
  0.0840	12300	0	order	233489	        o__Calditrichales
  0.0840	12300	0	family	233490	          f__Calditrichaceae
  0.0840	12300	0	genus	233491	            g__Caldithrix
  0.0840	12300	12131	species	233492	              s__Caldithrix abyssi
  0.0007	96	96	subspecies	233494	                RS_GCF_001886815.1
  0.0005	73	73	subspecies	233493	                RS_GCF_000241815.1
  0.0000	2	0	phylum	159726	    p__Acidobacteriota
  0.0000	2	0	class	171107	      c__Acidobacteriae
  0.0000	2	0	order	172097	        o__Acidobacteriales
  0.0000	2	0	family	176957	          f__Acidobacteriaceae
  0.0000	2	0	genus	247078	            g__Acidobacterium
  0.0000	2	0	species	247079	              s__Acidobacterium capsulatum
  0.0000	2	2	subspecies	247081	                RS_GCF_000022565.1
  1.9327	282883	0	superkingdom	2	  d__Archaea
  1.0923	159883	0	phylum	3	    p__Halobacteriota
  0.5042	73802	0	class	354	      c__Halobacteria
  0.5042	73802	149	order	355	        o__Halobacteriales
  0.2521	36898	12	family	356	          f__Haloferacaceae
  0.0840	12298	0	genus	1296	            g__Haloquadratum
  0.0840	12298	1014	species	1297	              s__Haloquadratum walsbyi
  0.0386	5643	5643	subspecies	1299	                RS_GCF_000237865.1
  0.0385	5641	5641	subspecies	1303	                RS_GCF_000009185.1
  0.0840	12296	0	genus	1364	            g__Halogeometricum
  0.0840	12296	4137	species	1365	              s__Halogeometricum borinquense
  0.0400	5852	5852	subspecies	1369	                RS_GCF_000172995.2
  0.0157	2297	2297	subspecies	1367	                RS_GCF_010692885.1
  0.0001	10	10	subspecies	1370	                RS_GCF_011765365.1
  0.0840	12292	7	genus	357	            g__Haloferax
  0.0839	12283	12044	species	1949	              s__Haloferax mediterranei
  0.0009	136	136	subspecies	1950	                RS_GCF_000306765.2
  0.0006	87	87	subspecies	1953	                RS_GCF_000685635.1
  0.0001	16	16	subspecies	1952	                RS_GCF_005406325.1
  0.0000	2	0	species	358	              s__Haloferax volcanii
  0.0000	1	1	subspecies	362	                RS_GCF_010692905.1
  0.0000	1	1	subspecies	370	                RS_GCF_000025685.1
  0.1681	24602	1	family	907	          f__Halobacteriaceae
  0.0840	12300	0	genus	3891	            g__Halodesulfurarchaeum
  0.0840	12300	5175	species	3892	              s__Halodesulfurarchaeum formicicum
  0.0249	3641	3641	subspecies	3893	                RS_GCF_001886955.1
  0.0238	3484	3484	subspecies	3894	                RS_GCF_001767315.1
  0.0840	12299	0	genus	3610	            g__Halanaeroarchaeum
  0.0840	12299	10648	species	3611	              s__Halanaeroarchaeum sulfurireducens
  0.0059	867	867	subspecies	3613	                RS_GCF_001305655.1
  0.0054	784	784	subspecies	3612	                RS_GCF_001011115.1
  0.0000	2	0	genus	908	            g__Halobacterium
  0.0000	2	2	species	1394	              s__Halobacterium salinarum
  0.0830	12153	0	family	627	          f__Haloarculaceae
  0.0830	12152	134	genus	628	            g__Haloarcula
  0.0820	12002	11806	species	898	              s__Haloarcula marismortui
  0.0010	151	151	subspecies	905	                RS_GCF_000011085.1
  0.0003	45	45	subspecies	903	                RS_GCF_005310945.1
  0.0001	16	7	species	629	              s__Haloarcula hispanica
  0.0001	9	9	subspecies	633	                RS_GCF_000827835.1
  0.0000	1	0	genus	7459	            g__HARCEL1
  0.0000	1	0	species	7460	              s__HARCEL1 sp003058365
  0.0000	1	1	subspecies	7461	                RS_GCF_003058365.1
  0.5041	73781	0	class	4	      c__Methanosarcinia
  0.5041	73781	0	order	5	        o__Methanosarcinales
  0.5041	73781	3	family	6	          f__Methanosarcinaceae
  0.5041	73778	485	genus	7	            g__Methanosarcina
  0.0840	12289	3056	species	2677	              s__Methanosarcina vacuolata
  0.0317	4636	4636	subspecies	2679	                RS_GCF_000969905.1
  0.0314	4597	4597	subspecies	2678	                RS_GCF_000969945.1
  0.0839	12275	5664	species	2338	              s__Methanosarcina siciliae
  0.0310	4535	4535	subspecies	2339	                RS_GCF_000970145.1
  0.0137	2002	2002	subspecies	2340	                RS_GCF_000970085.1
  0.0005	74	74	subspecies	2341	                RS_GCF_000970125.1
  0.0838	12268	9510	species	1454	              s__Methanosarcina barkeri
  0.0096	1408	1408	subspecies	1457	                RS_GCF_000970025.1
  0.0090	1311	1311	subspecies	1456	                RS_GCF_001027005.1
  0.0003	39	39	subspecies	1458	                RS_GCF_000970065.1
  0.0836	12240	12147	species	3600	              s__Methanosarcina barkeri_B
  0.0005	75	75	subspecies	3602	                RS_GCF_000969985.1
  0.0001	18	18	subspecies	3601	                RS_GCF_000195895.1
  0.0835	12217	8613	species	3258	              s__Methanosarcina sp000969965
  0.0132	1932	1932	subspecies	3259	                RS_GCF_000969965.1
  0.0114	1672	1672	subspecies	3260	                RS_GCF_000970005.1
  0.0819	11982	11070	species	767	              s__Methanosarcina thermophila
  0.0035	506	506	subspecies	773	                GB_GCA_001402855.1
  0.0014	210	210	subspecies	769	                GB_GCA_003584605.1
  0.0013	188	188	subspecies	771	                RS_GCF_000969885.1
  0.0001	8	8	subspecies	776	                RS_GCF_000969925.1
  0.0001	15	0	species	3748	              s__Methanosarcina flavescens
  0.0001	15	15	subspecies	3749	                RS_GCF_001304615.2
  0.0000	3	0	species	3428	              s__Methanosarcina acetivorans
  0.0000	3	3	subspecies	3429	                RS_GCF_000007345.1
  0.0000	2	2	species	8	              s__Methanosarcina mazei
  0.0000	2	0	species	7404	              s__Methanosarcina lacustris
  0.0000	2	2	subspecies	7405	                RS_GCF_000970265.1
  0.0840	12300	0	class	1444	      c__Archaeoglobi
  0.0840	12300	0	order	1445	        o__Archaeoglobales
  0.0840	12300	11	family	1446	          f__Archaeoglobaceae
  0.0840	12289	0	genus	1447	            g__Archaeoglobus
  0.0840	12289	8851	species	1579	              s__Archaeoglobus fulgidus
  0.0123	1794	1794	subspecies	1581	                RS_GCF_000734035.1
  0.0112	1644	1644	subspecies	1583	                RS_GCF_000008665.1
  0.3361	49200	0	phylum	79	    p__Thermoproteota
  0.2521	36900	0	class	80	      c__Thermoproteia
  0.2521	36900	0	order	81	        o__Sulfolobales
  0.2521	36900	44	family	82	          f__Sulfolobaceae
  0.1678	24560	730	genus	206	            g__Saccharolobus
  0.0840	12293	6030	species	3717	              s__Saccharolobus sp009601705
  0.0217	3170	3170	subspecies	3719	                RS_GCF_009601705.1
  0.0211	3093	3093	subspecies	3718	                RS_GCF_009602405.1
  0.0784	11470	11434	species	485	              s__Saccharolobus solfataricus
  0.0001	18	18	subspecies	498	                RS_GCF_000007005.1
  0.0001	12	12	subspecies	495	                RS_GCF_003852115.1
  0.0000	4	4	subspecies	492	                RS_GCF_900079115.1
  0.0000	2	2	subspecies	499	                RS_GCF_003852095.1
  0.0005	67	51	species	207	              s__Saccharolobus islandicus
  0.0001	8	8	subspecies	223	                RS_GCF_000022385.1
  0.0000	2	2	subspecies	217	                RS_GCF_000024305.1
  0.0000	2	2	subspecies	219	                RS_GCF_000189555.1
  0.0000	2	2	subspecies	224	                RS_GCF_000022485.1
  0.0000	2	2	subspecies	228	                RS_GCF_000022465.1
  0.0840	12296	0	genus	2190	            g__Sulfuracidifex
  0.0840	12296	9089	species	2191	              s__Sulfuracidifex tepidarius
  0.0111	1628	1628	subspecies	2193	                RS_GCF_008326425.1
  0.0108	1579	1579	subspecies	2192	                RS_GCF_008326385.1
  0.0840	12300	0	class	549	      c__Nitrososphaeria
  0.0840	12300	0	order	550	        o__Nitrososphaerales
  0.0840	12300	0	family	1658	          f__Nitrosocaldaceae
  0.0840	12300	0	genus	1659	            g__Nitrosocaldus
  0.0840	12300	11880	species	1660	              s__Nitrosocaldus cavascurensis
  0.0020	290	290	subspecies	1662	                RS_GCF_002906215.1
  0.0009	130	130	subspecies	1661	                RS_GCF_900248165.1
  0.3361	49200	0	phylum	175	    p__Methanobacteriota
  0.2521	36900	0	class	176	      c__Methanobacteria
  0.2521	36900	2	order	177	        o__Methanobacteriales
  0.1681	24598	0	family	1001	          f__Methanothermobacteraceae
  0.1681	24598	996	genus	1002	            g__Methanothermobacter
  0.0818	11966	8181	species	2168	              s__Methanothermobacter wolfei
  0.0131	1921	1921	subspecies	2169	                GB_GCA_009914355.1
  0.0127	1864	1864	subspecies	2170	                RS_GCF_900095815.1
  0.0793	11605	4679	species	2566	              s__Methanothermobacter marburgensis
  0.0240	3507	3507	subspecies	2567	                RS_GCF_000145295.1
  0.0227	3326	3326	subspecies	2568	                RS_GCF_008033705.1
  0.0006	93	93	subspecies	2569	                RS_GCF_009917665.1
  0.0001	21	0	species	4385	              s__Methanothermobacter sp000828575
  0.0001	21	21	subspecies	4386	                RS_GCF_000828575.1
  0.0001	10	2	species	1003	              s__Methanothermobacter thermautotrophicus
  0.0001	8	8	subspecies	1009	                RS_GCF_000008645.1
  0.0840	12300	0	family	178	          f__Methanobacteriaceae
  0.0840	12300	438	genus	853	            g__Methanobacterium
  0.0809	11845	6490	species	1337	              s__Methanobacterium formicicum
  0.0267	3914	3914	subspecies	1342	                GB_GCA_000953115.1
  0.0096	1407	1407	subspecies	1341	                RS_GCF_001458655.1
  0.0002	34	34	subspecies	1343	                RS_GCF_000762265.1
  0.0001	16	0	species	5333	              s__Methanobacterium sp003491305
  0.0001	16	16	subspecies	5334	                GB_GCA_003491305.1
  0.0000	1	0	species	4898	              s__Methanobacterium sp000499765
  0.0000	1	1	subspecies	4899	                RS_GCF_000499765.1
  0.0840	12300	0	class	1371	      c__Thermococci
  0.0840	12300	0	order	1372	        o__Thermococcales
  0.0840	12300	6	family	1373	          f__Thermococcaceae
  0.0840	12294	16	genus	2159	            g__Pyrococcus
  0.0839	12277	12153	species	2610	              s__Pyrococcus chitonophagus
  0.0005	66	66	subspecies	2612	                RS_GCF_900012635.1
  0.0004	58	58	subspecies	2611	                RS_GCF_002214605.1
  0.0000	1	0	species	7364	              s__Pyrococcus sp000263735
  0.0000	1	1	subspecies	7365	                RS_GCF_000263735.1
  0.1681	24600	0	phylum	229	    p__Thermoplasmatota
  0.1681	24600	0	class	230	      c__Thermoplasmata
  0.0840	12300	0	order	231	        o__Thermoplasmatales
  0.0840	12300	78	family	232	          f__Thermoplasmataceae
  0.0835	12221	0	genus	233	            g__Cuniculiplasma
  0.0835	12221	5376	species	234	              s__Cuniculiplasma divulgatum
  0.0241	3530	3530	subspecies	249	                RS_GCF_900083515.1
  0.0226	3315	3315	subspecies	239	                RS_GCF_900090055.1
  0.0000	1	0	genus	4345	            g__Thermoplasma
  0.0000	1	0	species	7203	              s__Thermoplasma acidophilum
  0.0000	1	1	subspecies	7204	                RS_GCF_000195915.1
  0.0840	12300	0	order	467	        o__Methanomassiliicoccales
  0.0840	12300	0	family	654	          f__Methanomassiliicoccaceae
  0.0840	12300	0	genus	1965	            g__Methanomassiliicoccus_A
  0.0840	12300	12300	species	1966	              s__Methanomassiliicoccus_A intestinalis
  `,
        3: `#clade_proportion	clade_count	taxon_count	rank	taxID	name
  5.9001	32656	32656	no rank	0	unclassified
  94.0999	520822	4	no rank	1	root
  90.8851	503029	0	superkingdom	10239	  Viruses
  90.8511	502841	0	clade	2559587	    Riboviria
  90.8511	502841	0	kingdom	2732396	      Orthornavirae
  90.8110	502619	0	phylum	2732408	        Pisuviricota
  90.8110	502619	0	class	2732506	          Pisoniviricetes
  90.8108	502618	0	order	76804	            Nidovirales
  90.8108	502618	0	suborder	2499399	              Cornidovirineae
  90.8108	502618	1	family	11118	                Coronaviridae
  90.8101	502614	4	subfamily	2501931	                  Orthocoronavirinae
  90.8063	502593	2	genus	694002	                    Betacoronavirus
  90.8034	502577	897	subgenus	2509511	                      Sarbecovirus
  90.6358	501649	2102	species	694009	                        Severe acute respiratory syndrome-related coronavirus
  90.2115	499301	499301	no rank	2697049	                          Severe acute respiratory syndrome coronavirus 2
  0.0444	246	0	no rank	2901879	                          Severe acute respiratory syndrome coronavirus
  0.0444	246	246	no rank	227984	                            SARS coronavirus Tor2
  0.0056	31	0	no rank	2720068	                        unclassified Sarbecovirus
  0.0056	31	31	species	864596	                          Bat coronavirus BM48-31/BGR/2008
  0.0009	5	0	subgenus	2509486	                      Hibecovirus
  0.0009	5	0	species	2501961	                        Bat Hp-betacoronavirus Zhejiang2013
  0.0009	5	5	no rank	1541205	                          Bat Hp-betacoronavirus/Zhejiang2013
  0.0007	4	2	subgenus	2509481	                      Embecovirus
  0.0002	1	0	species	694003	                        Betacoronavirus 1
  0.0002	1	1	no rank	31631	                          Human coronavirus OC43
  0.0002	1	0	species	694005	                        Murine coronavirus
  0.0002	1	0	no rank	31632	                          Rat coronavirus
  0.0002	1	1	no rank	502102	                            Rat coronavirus Parker
  0.0005	3	0	subgenus	2509494	                      Merbecovirus
  0.0002	1	1	species	694007	                        Tylonycteris bat coronavirus HKU4
  0.0002	1	1	species	694008	                        Pipistrellus bat coronavirus HKU5
  0.0002	1	1	species	1335626	                        Middle East respiratory syndrome-related coronavirus
  0.0004	2	0	subgenus	2509502	                      Nobecovirus
  0.0004	2	0	species	2501962	                        Rousettus bat coronavirus GCCDC1
  0.0004	2	2	no rank	1892416	                          Rousettus bat coronavirus
  0.0018	10	2	genus	693996	                    Alphacoronavirus
  0.0004	2	0	no rank	366617	                      unclassified Alphacoronavirus
  0.0004	2	2	species	1906673	                        Alphacoronavirus sp.
  0.0004	2	0	subgenus	2509492	                      Luchacovirus
  0.0004	2	0	no rank	2724758	                        unclassified Luchacovirus
  0.0004	2	2	species	1964806	                          Coronavirus AcCoV-JC34
  0.0002	1	0	subgenus	2509477	                      Colacovirus
  0.0002	1	0	species	1913643	                        Bat coronavirus CDPHE15
  0.0002	1	1	no rank	1384461	                          Bat coronavirus CDPHE15/USA/2006
  0.0002	1	0	subgenus	2509480	                      Duvinacovirus
  0.0002	1	0	species	11137	                        Human coronavirus 229E
  0.0002	1	1	no rank	1699095	                          Camel alphacoronavirus
  0.0002	1	0	subgenus	2509496	                      Minacovirus
  0.0002	1	1	species	1264898	                        Ferret coronavirus
  0.0002	1	0	subgenus	2509505	                      Pedacovirus
  0.0002	1	1	species	28295	                        Porcine epidemic diarrhea virus
  0.0011	6	0	genus	1159901	                    Deltacoronavirus
  0.0007	4	0	subgenus	2509474	                      Buldecovirus
  0.0005	3	3	species	1159902	                        Common moorhen coronavirus HKU21
  0.0002	1	1	species	1159907	                        White-eye coronavirus HKU16
  0.0004	2	0	subgenus	2509469	                      Andecovirus
  0.0004	2	2	species	1159908	                        Wigeon coronavirus HKU20
  0.0002	1	0	genus	694013	                    Gammacoronavirus
  0.0002	1	0	no rank	1433214	                      unclassified Gammacoronavirus
  0.0002	1	1	species	2569586	                        Canada goose coronavirus
  0.0005	3	0	subfamily	693995	                  Coronavirinae
  0.0005	3	0	no rank	2664420	                    unclassified Coronavirinae
  0.0005	3	3	species	1508220	                      Bat coronavirus
  0.0002	1	0	order	464095	            Picornavirales
  0.0002	1	0	family	232795	              Dicistroviridae
  0.0002	1	0	genus	144051	                Cripavirus
  0.0002	1	0	species	3048297	                  Cripavirus ropadi
  0.0002	1	1	no rank	66834	                    Rhopalosiphum padi virus
  0.0401	222	0	phylum	2732407	        Lenarviricota
  0.0401	222	0	class	2842243	          Leviviricetes
  0.0401	222	0	order	2842249	            Timlovirales
  0.0401	222	0	family	2842332	              Steitzviridae
  0.0202	112	0	genus	2842702	                Gihfavirus
  0.0202	112	0	species	2844652	                  Gihfavirus pelohabitans
  0.0202	112	112	no rank	2786405	                    ssRNA phage SRR5466369_2
  0.0199	110	0	genus	2842802	                Kinglevirus
  0.0199	110	0	species	2845070	                  Kinglevirus lutadaptatum
  0.0199	110	110	no rank	2786389	                    ssRNA phage SRR5466337_3
  0.0193	107	0	clade	2731342	    Monodnaviria
  0.0193	107	0	kingdom	2732092	      Shotokuvirae
  0.0193	107	0	phylum	2732415	        Cossaviricota
  0.0193	107	0	class	2732422	          Quintoviricetes
  0.0193	107	0	order	2732534	            Piccovirales
  0.0193	107	0	family	10780	              Parvoviridae
  0.0193	107	0	subfamily	2732887	                Hamaparvovirinae
  0.0193	107	0	genus	2733231	                  Chaphamaparvovirus
  0.0193	107	0	species	3052108	                    Chaphamaparvovirus galliform3
  0.0193	107	107	no rank	2849623	                      chicken chapparvovirus HK
  0.0145	80	0	clade	2731341	    Duplodnaviria
  0.0145	80	0	kingdom	2731360	      Heunggongvirae
  0.0145	80	0	phylum	2731618	        Uroviricota
  0.0145	80	1	class	2731619	          Caudoviricetes
  0.0060	33	0	genus	2560142	            Gorganvirus
  0.0060	33	0	species	2560650	              Gorganvirus isfahan
  0.0060	33	33	no rank	1969841	                Proteus phage VB_PmiS-Isfahan
  0.0016	9	0	genus	186789	            Punavirus
  0.0014	8	0	species	2560452	              Punavirus RCS47
  0.0014	8	8	no rank	1590550	                Escherichia phage RCS47
  0.0002	1	0	species	2560732	              Punavirus SJ46
  0.0002	1	1	no rank	1815968	                Salmonella phage SJ46
  0.0013	7	0	family	2731643	            Autographiviridae
  0.0013	7	1	subfamily	2731652	              Slopekvirinae
  0.0009	5	0	genus	2732938	                Koutsourovirus
  0.0009	5	0	species	2733608	                  Koutsourovirus KDA1
  0.0009	5	5	no rank	1147139	                    Enterobacter phage phiKDA1
  0.0002	1	1	genus	1920774	                Drulisvirus
  0.0007	4	0	genus	2843425	            Muldoonvirus
  0.0007	4	0	species	2846182	              Muldoonvirus muldoon
  0.0007	4	4	no rank	2601678	                Serratia phage Muldoon
  0.0005	3	0	genus	1982104	            Decurrovirus
  0.0005	3	0	species	1982105	              Decurrovirus decurro
  0.0005	3	3	no rank	1698361	                Arthrobacter phage Decurro
  0.0005	3	0	no rank	2788787	            unclassified Caudoviricetes
  0.0002	1	1	species	1150991	              Sphingomonas phage PAU
  0.0002	1	1	species	1327993	              Cellulophaga phage phi39:1
  0.0002	1	1	species	2851069	              Curtobacterium phage Reje
  0.0004	2	0	genus	2843376	            Donellivirus
  0.0004	2	0	species	1084719	              Donellivirus gee
  0.0004	2	2	no rank	2884420	                Bacillus phage G
  0.0004	2	0	family	2946167	            Peduoviridae
  0.0002	1	0	genus	2732990	              Seongnamvirus
  0.0002	1	0	species	2734073	                Seongnamvirus ESSI2
  0.0002	1	1	no rank	947842	                  Cronobacter phage ESSI-2
  0.0002	1	0	genus	2948723	              Gegevirus
  0.0002	1	0	species	2955944	                Gegevirus ST437OXA245phi41
  0.0002	1	1	no rank	2510486	                  Klebsiella phage ST437-OXA245phi4.1
  0.0004	2	0	genus	3044690	            Cobrasixvirus
  0.0004	2	0	species	3059893	              Cobrasixvirus cobrasix
  0.0004	2	2	no rank	2894794	                Enterobacter phage vB_EclS_CobraSix
  0.0002	1	1	genus	1623292	            Omegavirus
  0.0002	1	0	genus	1921525	            Kleczkowskavirus
  0.0002	1	1	species	1921526	              Kleczkowskavirus RHEph4
  0.0002	1	0	genus	1982367	            Pepyhexavirus
  0.0002	1	0	species	1982369	              Pepyhexavirus poco6
  0.0002	1	1	no rank	691964	                Rhodococcus phage ReqiPoco6
  0.0002	1	0	family	2560065	            Herelleviridae
  0.0002	1	0	subfamily	857473	              Spounavirinae
  0.0002	1	0	genus	1918721	                Siminovitchvirus
  0.0002	1	0	species	1918722	                  Siminovitchvirus CP51
  0.0002	1	1	no rank	1391188	                    Bacillus phage CP-51
  0.0002	1	0	genus	2560237	            Thornevirus
  0.0002	1	0	species	2560336	              Thornevirus SP15
  0.0002	1	1	no rank	1792032	                Bacillus phage SP-15
  0.0002	1	0	family	2731690	            Demerecviridae
  0.0002	1	0	subfamily	2732012	              Ermolyevavirinae
  0.0002	1	0	genus	2948922	                Thalassavirus
  0.0002	1	0	species	2956515	                  Thalassavirus river4
  0.0002	1	1	no rank	2736288	                    Vibrio phage River4
  0.0002	1	0	genus	2733127	            Rosemountvirus
  0.0002	1	0	species	2846142	              Rosemountvirus yarpen
  0.0002	1	1	no rank	2713327	                Salmonella phage yarpen
  0.0002	1	0	subfamily	2842523	            Bronfenbrennervirinae
  0.0002	1	1	genus	2842946	              Peeveelvirus
  0.0002	1	0	genus	2843375	            Dinavirus
  0.0002	1	0	species	2846739	              Dinavirus dina
  0.0002	1	1	no rank	2759732	                Ralstonia phage Dina
  0.0002	1	0	family	2943001	            Casjensviridae
  0.0002	1	0	genus	2943003	              Cenphatecvirus
  0.0002	1	0	species	2955599	                Cenphatecvirus saba
  0.0002	1	1	no rank	2596672	                  Proteus phage Saba
  0.0002	1	0	family	2946160	            Kyanoviridae
  0.0002	1	0	genus	2948904	              Shandvirus
  0.0002	1	0	species	2956438	                Shandvirus sb64
  0.0002	1	1	no rank	2163901	                  Synechococcus phage S-B64
  0.0002	1	0	genus	2948642	            Buchananvirus
  0.0002	1	0	species	2955547	              Buchananvirus Sa179lw
  0.0002	1	1	no rank	2126819	                Escherichia phage vB_EcoS Sa179lw
  0.0002	1	0	genus	2948764	            Immutovirus
  0.0002	1	0	species	2955989	              Immutovirus immuto
  0.0002	1	1	no rank	2801477	                Flavobacterium phage vB_FspM_immuto_2-6A
  0.0002	1	1	family	3044479	            Stanwilliamsviridae
  0.0002	1	0	clade	2732004	    Varidnaviria
  0.0002	1	0	kingdom	2732005	      Bamfordvirae
  0.0002	1	0	phylum	2732007	        Nucleocytoviricota
  0.0002	1	0	class	2732523	          Megaviricetes
  0.0002	1	0	order	2732524	            Algavirales
  0.0002	1	0	family	10501	              Phycodnaviridae
  0.0002	1	0	genus	181086	                Prymnesiovirus
  0.0002	1	0	no rank	358403	                  unclassified Prymnesiovirus
  0.0002	1	1	species	251749	                    Phaeocystis globosa virus
  3.2140	17789	0	no rank	131567	  cellular organisms
  3.2140	17789	0	superkingdom	2759	    Eukaryota
  3.2140	17789	0	clade	33154	      Opisthokonta
  3.2140	17789	0	kingdom	33208	        Metazoa
  3.2140	17789	0	clade	6072	          Eumetazoa
  3.2140	17789	0	clade	33213	            Bilateria
  3.2140	17789	0	clade	33511	              Deuterostomia
  3.2140	17789	0	phylum	7711	                Chordata
  3.2140	17789	0	subphylum	89593	                  Craniata
  3.2140	17789	0	clade	7742	                    Vertebrata
  3.2140	17789	0	clade	7776	                      Gnathostomata
  3.2140	17789	0	clade	117570	                        Teleostomi
  3.2140	17789	0	clade	117571	                          Euteleostomi
  3.2140	17789	0	superclass	8287	                            Sarcopterygii
  3.2140	17789	0	clade	1338369	                              Dipnotetrapodomorpha
  3.2140	17789	0	clade	32523	                                Tetrapoda
  3.2140	17789	0	clade	32524	                                  Amniota
  3.2140	17789	0	class	40674	                                    Mammalia
  3.2140	17789	0	clade	32525	                                      Theria
  3.2140	17789	0	clade	9347	                                        Eutheria
  3.2140	17789	0	clade	1437010	                                          Boreoeutheria
  3.2140	17789	0	superorder	314146	                                            Euarchontoglires
  3.2140	17789	0	order	9443	                                              Primates
  3.2140	17789	0	suborder	376913	                                                Haplorrhini
  3.2140	17789	0	infraorder	314293	                                                  Simiiformes
  3.2140	17789	0	parvorder	9526	                                                    Catarrhini
  3.2140	17789	0	superfamily	314295	                                                      Hominoidea
  3.2140	17789	0	family	9604	                                                        Hominidae
  3.2140	17789	0	subfamily	207598	                                                          Homininae
  3.2140	17789	0	genus	9605	                                                            Homo
  3.2140	17789	17789	species	9606	                                                              Homo sapiens
  `,
      },

      // Props for TaxoView
      rawReport: '',
      showAll: false,
      fontFill: "black",
      taxaLimit: 10,
      nodePadding: 13,
      linkPathOpacity: 0.3,
      figureHeight: 700,
      figureWidth: 1100,
      rankOptions: ["root", "domain", "kingdom", "phylum", "class", "order", "family", "genus", "species"],
      ranksToShow: ["root", "domain", "kingdom", "phylum", "class", "order", "family", "genus", "species"],
      inputData: "1",
      searchQuery: "",
    }
  },

  methods: {
    setSampleData() {
      this.rawReport = this.samples[this.inputData]
    },

    readFile(file) {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        this.rawReport = reader.result;
      };
      reader.onerror = err => {
        console.error('File read failed', err)
      };
      reader.readAsText(file);
    },
  }
}
</script>

<style scoped>
h1 {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.settings-panel {
  display: flex;
  flex-direction: column;
}

.setting-input {
  width: 100px;
}
</style>
