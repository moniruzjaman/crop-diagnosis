import { RegulatoryAlert } from '../types';

export const INITIAL_REGULATORY_ALERTS: RegulatoryAlert[] = [
  {
    id: 'reg-001',
    title: 'Institutional Mandate: Aluminium Phosphide & Stored Grain Fumigants',
    category: 'regulatory',
    severity: 'high',
    date: '2026-09-01',
    validUntil: '2026-12-31',
    targetCrops: ['Stored grain in Rice', 'Stored grain in Wheat', 'Warehouses'],
    targetChemicals: ['Aluminium Phosphide', 'Methyl Bromide'],
    summary: 'Restricted sales strictly to licensed institutional warehouses and certified fumigation personnel.',
    details: 'Department of Agricultural Extension (DAE) enforcement notice: Retailing Aluminium Phosphide tablets (AP-122 series) to open domestic markets is prohibited. Certified fumigators must verify airtight gas tarpaulins and maintain 72-hour exclusion zones with phosphine gas detection badges.',
    actionRequired: 'Inspect storage facility seal, log batch AP numbers, and wear full-face respirator with canister before handling.'
  },
  {
    id: 'reg-002',
    title: 'Pollinator Safety Directive: Neonicotinoid Day-Spray Prohibition',
    category: 'regulatory',
    severity: 'high',
    date: '2026-08-25',
    targetCrops: ['Mango', 'Mustard', 'Cucurbits', 'Vegetables'],
    targetChemicals: ['Imidacloprid', 'Thiamethoxam', 'Acetamiprid'],
    summary: 'Daytime foliar spraying of neonicotinoids during active crop bloom is strictly prohibited.',
    details: 'To safeguard Apis cerana and solitary bee pollinators essential for mustard, fruit, and cucurbit yield, chemical applications of IRAC 4A neonicotinoids must only occur in late evenings (after 5:30 PM) when bee foraging stops.',
    actionRequired: 'Switch to biological lures (Cuelure Q-Phero) or spray Spinosad late evening if pest threshold is breached.'
  },
  {
    id: 'reg-003',
    title: 'Pre-Harvest Interval (PHI) Compliance for Export Vegetable Crops',
    category: 'regulatory',
    severity: 'medium',
    date: '2026-08-15',
    targetCrops: ['Brinjal', 'Tomato', 'Country bean', 'Cucumber'],
    targetChemicals: ['Carbendazim', 'Chlorpyrifos', 'Mancozeb', 'Emamectin Benzoate'],
    summary: 'Mandatory adherence to minimum harvest withdrawal periods to comply with Maximum Residue Limits (MRL).',
    details: 'Export agricultural consignments face strict residue testing. Carbendazim requires 14 days PHI, Chlorpyrifos 21 days, Mancozeb 7 days. For continuous harvest crops like brinjal and tomato, prioritize Emamectin Benzoate (3 days) or Spinosad (3 days).',
    actionRequired: 'Verify PHI countdown on field records before scheduling picking.'
  },
  {
    id: 'sea-001',
    title: 'Seasonal Alert: Boro Rice Brown Plant Hopper (BPH) Outbreak Warning',
    category: 'seasonal',
    severity: 'high',
    date: '2026-09-08',
    targetCrops: ['Rice'],
    targetPests: ['Brown Plant Hopper (BPH)'],
    targetChemicals: ['Pymetrozine', 'Buprofezin', 'Triflumezopyrim', 'Cartap'],
    summary: 'High humidity and lush canopy conditions favor rapid BPH hopperburn. Inspect plant base.',
    details: 'Scout 20 random hills per acre. If 5-10 nymphs/hill are spotted at water level, initiate prompt action. Do NOT use synthetic pyrethroids (Cypermethrin/Deltamethrin) as they kill natural spider predators and cause catastrophic BPH resurgence.',
    actionRequired: 'Drain excess standing water and direct spray nozzle directly at base using Pymetrozine 50 WG (0.5 g/L) or Buprofezin 40 SC.'
  },
  {
    id: 'sea-002',
    title: 'Seasonal Alert: Winter Potato Late Blight High-Risk Weather Advisory',
    category: 'seasonal',
    severity: 'high',
    date: '2026-09-05',
    targetCrops: ['Potato', 'Tomato'],
    targetPests: ['Late blight (Phytophthora infestans)'],
    targetChemicals: ['Mancozeb', 'Dimethomorph + Mancozeb', 'Cymoxanil + Mancozeb', 'Metalaxyl'],
    summary: 'Dense nighttime fog and temperatures between 12°C - 20°C create severe late blight spore explosion.',
    details: 'Do not wait for leaf lesions to appear! Apply a preventative multi-site protective shield of Mancozeb 80 WP (2.2 kg/ha) or Propineb 70 WP. If early water-soaked spots are detected, immediately switch to curative Dimethomorph + Mancozeb (Acrobat MZ) or Curzate M8.',
    actionRequired: 'Maintain 7-10 day prophylactic spray intervals while foggy overcast conditions persist.'
  },
  {
    id: 'sea-003',
    title: 'Seasonal Alert: Mango Panicle Emergence & Hopper Management',
    category: 'seasonal',
    severity: 'medium',
    date: '2026-08-30',
    targetCrops: ['Mango'],
    targetPests: ['Hopper (Idioscopus spp.)', 'Powdery mildew'],
    targetChemicals: ['Lambda Cyhalothrin', 'Imidacloprid', 'Sulphur 80 WG', 'Hexaconazole'],
    summary: 'Flower bud swelling stage requires preventative spray before flower opening.',
    details: 'Nymphs puncture inflorescence panicles causing flower drop and sooty mold. Spray first when buds are 2-3 inches long. Tank mix Lambda Cyhalothrin 2.5 EC (1 ml/L) with Micronized Sulphur 80 WG (2 g/L) for combined hopper and powdery mildew control.',
    actionRequired: 'Complete spray BEFORE flowers open. Do NOT spray during full bloom to protect honeybees.'
  },
  {
    id: 'sea-004',
    title: 'Seasonal Alert: Jute Hairy Caterpillar & Yellow Mite Advisory',
    category: 'seasonal',
    severity: 'medium',
    date: '2026-08-20',
    targetCrops: ['Jute'],
    targetPests: ['Yellow mite', 'Hairy caterpillar (Spilosoma obliqua)'],
    targetChemicals: ['Sulphur 80 WG', 'Emamectin Benzoate', 'Carbaryl'],
    summary: 'Young jute stands are vulnerable to leaf curling and defoliation in warm spells.',
    details: 'Yellow mites attack young top leaves making them downward curled and leathery. Hairy caterpillars feed gregariously on underside. Apply Sulphur 80 WG (1.5-2 g/L) for mites or Emamectin Benzoate 5 SG (1 g/L) for caterpillars.',
    actionRequired: 'Hand-pick egg clusters on leaf undersides when possible; spray in early morning.'
  }
];
