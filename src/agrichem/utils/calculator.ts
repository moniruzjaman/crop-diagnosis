import { ChemicalProduct, DosageInput, DosageResult } from '../types';

export function convertAreaToHectares(value: number, unit: DosageInput['areaUnit']): number {
  switch (unit) {
    case 'hectare':
      return value;
    case 'acre':
      return value * 0.404686;
    case 'bigha':
      // 1 standard bigha ≈ 0.13378 hectare (≈ 0.3305 acre)
      return value * 0.13378;
    case 'katha':
      // 20 katha = 1 bigha
      return (value / 20) * 0.13378;
    case 'sqm':
      return value / 10000;
    default:
      return value;
  }
}

export function convertHectaresToAcres(ha: number): number {
  return ha * 2.47105;
}

export interface ParsedDosage {
  type: 'ratePerHa' | 'concentrationPerLitre' | 'seedTreatment' | 'tablets' | 'lures';
  value: number; // numeric value
  unit: 'L' | 'ml' | 'Kg' | 'gm' | 'tablets' | 'lures';
  rawString: string;
}

export function parseDosageString(dosageStr: string): ParsedDosage {
  const clean = dosageStr.trim().toLowerCase();

  // Concentration pattern like: "1 ml/Litre", "2 gm/litre", "0.5 ml/l"
  const concMatch = clean.match(/([\d.]+)\s*(ml|gm|g|mg)\s*\/\s*(?:litre|lt|l)/i);
  if (concMatch) {
    const val = parseFloat(concMatch[1]);
    const u = concMatch[2].toLowerCase();
    const unit = u === 'ml' ? 'ml' : 'gm';
    return {
      type: 'concentrationPerLitre',
      value: val,
      unit,
      rawString: dosageStr
    };
  }

  // Tablets pattern: "4 tables/1000 kg"
  if (clean.includes('table') || clean.includes('tablet')) {
    const tabMatch = clean.match(/([\d.]+)/);
    return {
      type: 'tablets',
      value: tabMatch ? parseFloat(tabMatch[1]) : 4,
      unit: 'tablets',
      rawString: dosageStr
    };
  }

  // Lures pattern: "70 lures"
  if (clean.includes('lure')) {
    const lureMatch = clean.match(/([\d.]+)/);
    return {
      type: 'lures',
      value: lureMatch ? parseFloat(lureMatch[1]) : 70,
      unit: 'lures',
      rawString: dosageStr
    };
  }

  // Seed treatment: "2 gm/kg seed"
  if (clean.includes('seed')) {
    const seedMatch = clean.match(/([\d.]+)\s*(gm|g|ml)/i);
    return {
      type: 'seedTreatment',
      value: seedMatch ? parseFloat(seedMatch[1]) : 2,
      unit: seedMatch && seedMatch[2].toLowerCase() === 'ml' ? 'ml' : 'gm',
      rawString: dosageStr
    };
  }

  // Rate per hectare (e.g. "1.00 Litre", "500 ml", "2.20 Kg", "25.00 Kg", "60 gm")
  const rateMatch = clean.match(/([\d.]+)\s*(litre|lt|l|ml|kg|gm|g)/i);
  if (rateMatch) {
    const val = parseFloat(rateMatch[1]);
    const u = rateMatch[2].toLowerCase();
    let unit: 'L' | 'ml' | 'Kg' | 'gm' = 'L';
    if (u === 'ml') unit = 'ml';
    else if (u === 'kg') unit = 'Kg';
    else if (u === 'gm' || u === 'g') unit = 'gm';
    else unit = 'L';

    return {
      type: 'ratePerHa',
      value: val,
      unit,
      rawString: dosageStr
    };
  }

  // Default fallback
  return {
    type: 'ratePerHa',
    value: 1,
    unit: 'L',
    rawString: dosageStr
  };
}

export function calculateDosage(product: ChemicalProduct, input: DosageInput): DosageResult {
  const ha = convertAreaToHectares(input.areaValue, input.areaUnit);
  const acres = convertHectaresToAcres(ha);
  const sprayVolPerHa = input.sprayVolumePerHaL || product.waterVolumeLPerHa || 500;
  const totalWater = Math.round(ha * sprayVolPerHa);
  const tankVol = input.tankVolumeL || 16;
  const numberOfTanks = Math.max(1, Math.round((totalWater / tankVol) * 10) / 10);

  const parsed = parseDosageString(product.dosageRate);

  let totalChemicalNeeded = '';
  let chemicalPerTank = '';
  let notes = '';

  if (parsed.type === 'concentrationPerLitre') {
    const totalAmount = parsed.value * totalWater;
    const perTankAmount = parsed.value * tankVol;

    if (parsed.unit === 'ml') {
      if (totalAmount >= 1000) {
        totalChemicalNeeded = `${(totalAmount / 1000).toFixed(2)} Litres (${Math.round(totalAmount)} ml)`;
      } else {
        totalChemicalNeeded = `${Math.round(totalAmount)} ml`;
      }
      chemicalPerTank = `${perTankAmount.toFixed(1)} ml per ${tankVol}L tank`;
    } else {
      if (totalAmount >= 1000) {
        totalChemicalNeeded = `${(totalAmount / 1000).toFixed(2)} Kg (${Math.round(totalAmount)} gm)`;
      } else {
        totalChemicalNeeded = `${Math.round(totalAmount)} grams`;
      }
      chemicalPerTank = `${perTankAmount.toFixed(1)} grams per ${tankVol}L tank`;
    }
    notes = `Calculated at label concentration of ${parsed.value} ${parsed.unit}/L of water across ${totalWater} Litres total spray volume.`;
  } else if (parsed.type === 'ratePerHa') {
    const totalAmt = parsed.value * ha;
    const perTankAmt = totalAmt / (totalWater / tankVol);

    if (parsed.unit === 'L' || parsed.unit === 'ml') {
      const inMl = parsed.unit === 'L' ? totalAmt * 1000 : totalAmt;
      const tankMl = parsed.unit === 'L' ? perTankAmt * 1000 : perTankAmt;

      if (inMl >= 1000) {
        totalChemicalNeeded = `${(inMl / 1000).toFixed(2)} Litres (${Math.round(inMl)} ml)`;
      } else {
        totalChemicalNeeded = `${Math.round(inMl)} ml`;
      }
      chemicalPerTank = `${tankMl.toFixed(1)} ml per ${tankVol}L tank`;
    } else {
      const inGm = parsed.unit === 'Kg' ? totalAmt * 1000 : totalAmt;
      const tankGm = parsed.unit === 'Kg' ? perTankAmt * 1000 : perTankAmt;

      if (inGm >= 1000) {
        totalChemicalNeeded = `${(inGm / 1000).toFixed(2)} Kg (${Math.round(inGm)} gm)`;
      } else {
        totalChemicalNeeded = `${Math.round(inGm)} grams`;
      }
      chemicalPerTank = `${tankGm.toFixed(1)} grams per ${tankVol}L tank`;
    }
    notes = `Based on registered rate of ${parsed.value} ${parsed.unit}/ha calibrated for ${input.sprayVolumePerHaL || 500} L/ha water coverage.`;
  } else if (parsed.type === 'tablets') {
    const estimatedKgGrain = ha * 4000; // estimated 4 tons/ha
    const totalTabs = Math.round((estimatedKgGrain / 1000) * parsed.value);
    totalChemicalNeeded = `${totalTabs} tablets (for approx ${(estimatedKgGrain / 1000).toFixed(1)} tons harvest)`;
    chemicalPerTank = 'N/A (Fumigation tablet in airtight enclosure)';
    notes = 'Enclose grain under airtight 0.25mm gas tarpaulin. Place tablets in paper trays across grain mass. Maintain 5-7 days fumigation.';
  } else if (parsed.type === 'lures') {
    const totalLures = Math.round(parsed.value * ha);
    totalChemicalNeeded = `${totalLures} pheromone lure traps`;
    chemicalPerTank = 'N/A (Field pheromone trap installation)';
    notes = `Space traps evenly at ${Math.round(10000 / (parsed.value || 70))} m² intervals across field borders and canopy.`;
  } else {
    totalChemicalNeeded = product.dosageRate;
    chemicalPerTank = 'Follow specific label guidance';
    notes = 'Review specific package directions for seed treatment or specialized application.';
  }

  return {
    convertedHa: Math.round(ha * 1000) / 1000,
    convertedAcres: Math.round(acres * 100) / 100,
    totalWaterNeededL: totalWater,
    numberOfTanks,
    totalChemicalNeeded,
    chemicalPerTank,
    notes
  };
}
