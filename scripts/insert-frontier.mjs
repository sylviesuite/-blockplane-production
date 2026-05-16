const SUPABASE_URL = 'https://lecwvxxhynuuiciljtxp.supabase.co';
const SUPABASE_KEY = '***REDACTED_SERVICE_ROLE_KEY***';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const materials = [
  {name:'Hempcrete',category:'insulation',ris_score:92,lis_score:55,description:'Hemp hurd and lime binder; carbon-storing, breathable wall system',manufacturer:'American Lime Technology'},
  {name:'Cross-laminated timber (CLT)',category:'timber',ris_score:88,lis_score:75,description:'Mass timber panel system; strong regional supply in Great Lakes',manufacturer:'Sterling Structural'},
  {name:'Thermally modified timber',category:'timber',ris_score:85,lis_score:70,description:'Heat-treated wood; rot resistant without chemicals',manufacturer:'Cambia by NFP'},
  {name:'Alkali-activated slag cement',category:'cement',ris_score:85,lis_score:65,description:'Slag-based binder; Great Lakes steel industry byproduct',manufacturer:'Slag Cement Association'},
  {name:'Geopolymer concrete',category:'cement',ris_score:83,lis_score:62,description:'Fly ash and slag based; lower embodied carbon than OPC',manufacturer:'PCI Geopolymer'},
  {name:'Ferrock',category:'cement',ris_score:91,lis_score:45,description:'Iron silica binder that absorbs CO2 during curing',manufacturer:'Iron Shell LLC'},
  {name:'Aerogel insulation blanket',category:'insulation',ris_score:72,lis_score:82,description:'Highest R-value per inch available; ideal for cold climates',manufacturer:'Aspen Aerogels'},
  {name:'Wood fiber insulation board',category:'insulation',ris_score:85,lis_score:78,description:'EPD-verified; hygroscopic; cold-climate performer',manufacturer:'Gutex'},
  {name:'Hemp fiber insulation',category:'insulation',ris_score:92,lis_score:60,description:'Michigan hemp supply chain developing; non-toxic',manufacturer:'Hempitecture'},
  {name:'Reclaimed structural steel',category:'reclaimed',ris_score:85,lis_score:80,description:'Strong regional supply chain in Great Lakes',manufacturer:'Various'},
  {name:'Mycelium panels',category:'biofabricated',ris_score:90,lis_score:40,description:'Grown on agricultural waste; non-structural applications',manufacturer:'Ecovative Design'},
  {name:'Lime-hemp plaster system',category:'earth',ris_score:91,lis_score:55,description:'Breathable; moisture regulating; carbon storing',manufacturer:'American Lime Technology'},
  {name:'Straw bale construction',category:'timber',ris_score:93,lis_score:42,description:'Agricultural waste; proven cold-climate insulation system',manufacturer:'Various'},
  {name:'Cellulose insulation dense pack',category:'insulation',ris_score:86,lis_score:79,description:'Recycled newsprint; proven Great Lakes cold climate performer',manufacturer:'Nu-Wool'},
  {name:'Reclaimed brick',category:'reclaimed',ris_score:84,lis_score:81,description:'Abundant in Great Lakes cities; zero new embodied carbon',manufacturer:'Various'},
  {name:'Biochar-amended concrete',category:'cement',ris_score:91,lis_score:55,description:'Biochar sequesters carbon within the concrete slab',manufacturer:'Carbon Upcycling'},
  {name:'Agricultural fiber panels',category:'insulation',ris_score:92,lis_score:45,description:'Wheat and corn straw compressed panels; regional supply',manufacturer:'Oryzite'},
  {name:'Earthen plaster systems',category:'earth',ris_score:93,lis_score:42,description:'Local clay available; extremely low embodied energy',manufacturer:'American Clay'},
  {name:'Phase-change material wallboard',category:'insulation',ris_score:72,lis_score:65,description:'Thermal mass in thin profile; cold-climate benefit',manufacturer:'Microtek Laboratories'},
  {name:'Vacuum insulated panels',category:'insulation',ris_score:71,lis_score:83,description:'Extreme thermal performance; fragile; handle with care',manufacturer:'Va-Q-tec'},
  {name:'Recycled concrete aggregate',category:'reclaimed',ris_score:83,lis_score:70,description:'Crushed demolition waste; high local availability',manufacturer:'Various'},
  {name:'MgO board',category:'cladding',ris_score:83,lis_score:63,description:'Magnesium oxide; fire resistant; no silica dust',manufacturer:'Magnum Board'},
  {name:'Carbon-cured concrete blocks',category:'cement',ris_score:84,lis_score:65,description:'CO2 mineralized during curing process',manufacturer:'CarbonCure Technologies'},
  {name:'Cork insulation board',category:'insulation',ris_score:84,lis_score:79,description:'Renewable bark harvest; acoustic and thermal performance',manufacturer:'Amorim Cork Composites'},
  {name:'Bamboo structural composites',category:'timber',ris_score:91,lis_score:60,description:'High strength; not grown regionally but carbon positive',manufacturer:'MOSO International'},
  {name:'Algae biopolymer panels',category:'biofabricated',ris_score:92,lis_score:32,description:'Great Lakes algae potential; early R&D stage',manufacturer:'Algaeing'},
  {name:'Self-healing concrete',category:'cement',ris_score:72,lis_score:55,description:'Bacteria or polymer triggered crack repair',manufacturer:'Basilisk'},
  {name:'Natural hydraulic lime NHL',category:'earth',ris_score:83,lis_score:60,description:'Flexible binder; compatible with historic masonry',manufacturer:'St Astier'},
  {name:'Structural insulated panels SIP',category:'insulation',ris_score:84,lis_score:80,description:'Proven cold-climate airtight system',manufacturer:'Premier SIPs'},
  {name:'Reclaimed dimensional lumber',category:'reclaimed',ris_score:84,lis_score:81,description:'Abundant in Midwest building stock',manufacturer:'Various'},
  {name:'Mass plywood panels MPP',category:'timber',ris_score:85,lis_score:72,description:'Lighter CLT alternative; emerging Great Lakes supply',manufacturer:'Freres Lumber'},
  {name:'Acetylated wood Accoya',category:'timber',ris_score:83,lis_score:68,description:'Chemically modified; Class 1 durability without biocides',manufacturer:'Accoya'},
  {name:'Densified wood composites',category:'timber',ris_score:82,lis_score:60,description:'High compressive strength; emerging EPD data',manufacturer:'Various'},
  {name:'Myco-composite insulation',category:'biofabricated',ris_score:90,lis_score:38,description:'Mycelium grown on agricultural waste byproduct',manufacturer:'Ecovative Design'},
  {name:'Belite calcite clinker cement',category:'cement',ris_score:83,lis_score:58,description:'60 percent lower kiln temperature than OPC',manufacturer:'Calucem'},
  {name:'Magnesium oxide cement MgO',category:'cement',ris_score:83,lis_score:55,description:'Carbonates during curing; lower embodied carbon',manufacturer:'Mag Industries'},
  {name:'Calcium sulfoaluminate cement',category:'cement',ris_score:82,lis_score:62,description:'Rapid set; lower embodied carbon than OPC',manufacturer:'CTS Cement'},
  {name:'Mycelium structural blocks',category:'biofabricated',ris_score:89,lis_score:35,description:'R&D stage; compressive strength improving rapidly',manufacturer:'Ecovative Design'},
  {name:'Reclaimed glass insulation',category:'reclaimed',ris_score:72,lis_score:68,description:'Foam glass aggregate and board from recycled glass',manufacturer:'Misapor'},
  {name:'Upcycled denim insulation',category:'reclaimed',ris_score:82,lis_score:72,description:'Cotton fiber batts; no VOCs; safe to handle',manufacturer:'Bonded Logic'},
  {name:'Post-consumer carpet tile',category:'reclaimed',ris_score:71,lis_score:65,description:'Take-back programs from Interface and Shaw',manufacturer:'Interface'},
  {name:'Sheep wool insulation',category:'insulation',ris_score:83,lis_score:62,description:'Hygroscopic; non-toxic; naturally fire resistant',manufacturer:'Black Mountain Insulation'},
  {name:'Lime-pozzolan render',category:'earth',ris_score:83,lis_score:58,description:'Carbonates CO2 over its lifetime',manufacturer:'Limeworks'},
  {name:'Natural hydraulic lime render',category:'earth',ris_score:83,lis_score:60,description:'Breathable; compatible with timber and masonry',manufacturer:'St Astier'},
  {name:'Compressed earth blocks CEB',category:'earth',ris_score:83,lis_score:45,description:'Soil dependent; viable in Michigan clay soils',manufacturer:'Hydraform'},
  {name:'Rammed earth stabilized',category:'earth',ris_score:83,lis_score:45,description:'High thermal mass; cold-climate design required',manufacturer:'RECO Walls'},
  {name:'Tadelakt lime plaster',category:'earth',ris_score:82,lis_score:50,description:'Polished waterproof lime finish; traditional technique',manufacturer:'Various'},
  {name:'Electrochromic glazing',category:'windows',ris_score:71,lis_score:65,description:'Dynamic tint reduces HVAC load significantly',manufacturer:'Sage Glass'},
  {name:'Thermochromic coatings',category:'cladding',ris_score:71,lis_score:52,description:'Passive solar management through color change',manufacturer:'Various'},
  {name:'Photocatalytic concrete TiO2',category:'cement',ris_score:71,lis_score:58,description:'Air purifying surface; reduces NOx in urban environments',manufacturer:'TX Active'},
  {name:'Biocomposite cladding flax resin',category:'cladding',ris_score:83,lis_score:55,description:'Flax grown in Midwest; natural fiber composite panel',manufacturer:'Bcomp'},
  {name:'Recycled tire crumb flooring',category:'reclaimed',ris_score:71,lis_score:65,description:'High supply; durable athletic and commercial surfaces',manufacturer:'Dodge-Regupol'},
  {name:'Wood fiber batt insulation',category:'insulation',ris_score:84,lis_score:77,description:'Hygroscopic; moisture buffering in cold climates',manufacturer:'Steico'},
  {name:'Insulated concrete forms ICF',category:'insulation',ris_score:83,lis_score:78,description:'High thermal mass plus R-value; proven cold climate',manufacturer:'Nudura'},
  {name:'Roman pozzolanic lime mix',category:'cement',ris_score:82,lis_score:52,description:'Volcanic ash and lime; exceptional long-term durability',manufacturer:'Various'},
  {name:'Reclaimed dimensional lumber 2',category:'reclaimed',ris_score:84,lis_score:80,description:'Old growth density and stability from salvage',manufacturer:'Duluth Timber'},
  {name:'Recycled plastic lumber',category:'reclaimed',ris_score:71,lis_score:62,description:'Non-structural; durable decking and site furniture',manufacturer:'Trex'},
  {name:'Shape memory polymer insulation',category:'insulation',ris_score:70,lis_score:40,description:'R&D stage; deployment timeline unclear',manufacturer:'Various'},
  {name:'Bacterial cellulose composites',category:'biofabricated',ris_score:91,lis_score:30,description:'University stage; not yet commercially deployable',manufacturer:'Various'},
  {name:'Chitin composite panels',category:'biofabricated',ris_score:90,lis_score:30,description:'Crustacean-derived; experimental material',manufacturer:'Various'},
  {name:'Laminated bamboo lumber',category:'timber',ris_score:90,lis_score:58,description:'Import dependent; high carbon sequestration',manufacturer:'MOSO International'},
];

// Step 1: insert materials (strip scores which live in lis_ris_scores)
const matRows = materials.map(({ ris_score, lis_score, ...rest }) => rest);

const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/materials`, {
  method: 'POST',
  headers: { ...headers, 'Prefer': 'return=representation,resolution=ignore-duplicates' },
  body: JSON.stringify(matRows),
});

const inserted = await insertRes.json();
console.log('Materials insert status:', insertRes.status);
if (insertRes.status >= 400) { console.error(inserted); process.exit(1); }
console.log(`Inserted ${inserted.length} new material rows`);

// Step 2: insert scores for newly inserted rows
if (inserted.length > 0) {
  const nameToScore = Object.fromEntries(materials.map(m => [m.name, { ris_score: m.ris_score, lis_score: m.lis_score }]));
  const scoreRows = inserted.map(m => ({
    material_id: m.id,
    lis_score: nameToScore[m.name]?.lis_score ?? 0,
    ris_score: nameToScore[m.name]?.ris_score ?? 0,
    calculation_version: '1.0',
    calculation_date: new Date().toISOString().slice(0, 10),
    baseline_region: 'Great Lakes',
  }));

  const scoreRes = await fetch(`${SUPABASE_URL}/rest/v1/lis_ris_scores`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify(scoreRows),
  });
  const scoreBody = await scoreRes.text();
  console.log('Scores insert status:', scoreRes.status, scoreBody || '(ok)');
}

// Confirm total frontier materials (ris_score >= 80)
const countRes = await fetch(
  `${SUPABASE_URL}/rest/v1/lis_ris_scores?select=id&ris_score=gte.80`,
  { headers: { ...headers, 'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-0' } }
);
console.log('Total materials with RIS >= 80:', countRes.headers.get('content-range'));
