export type ChemicalType =
  | 'Insecticide'
  | 'Fungicide'
  | 'Herbicide'
  | 'Miticide'
  | 'Bio Pesticide'
  | 'Stored Grain'
  | 'Rodenticide';

export interface ChemicalProduct {
  id: string;
  type: ChemicalType;
  commonName: string;
  tradeName: string;
  registrationNo: string;
  registrationHolder: string;
  crops: string[];
  pests: string[];
  dosageRate: string;
  // Enriched metadata
  moaCode?: string;
  moaGroup?: string;
  moaSubGroup?: string;
  moaTargetSite?: string;
  resistanceRisk?: 'Low' | 'Medium' | 'High' | 'Low to Medium' | 'Medium to High' | 'Unknown';
  toxicityClass?: 'Ia - Extremely Hazardous' | 'Ib - Highly Hazardous' | 'II - Moderately Hazardous' | 'III - Slightly Hazardous' | 'U - Unlikely to Present Hazard';
  whoColor?: string; // Yellow, Blue, Red, Green
  formulation?: string; // EC, WP, WDG, SG, SC, GR, SL, SP
  phiDays?: number; // Pre-Harvest Interval in days
  reiHours?: number; // Restricted Entry Interval in hours
  waterVolumeLPerHa?: number;
  safetyNotes?: string[];
  targetLifeCycle?: string;
  rotationNotes?: string;
}

export interface MoAClassification {
  code: string;
  name: string;
  nameBn?: string;
  subGroup?: string;
  targetSite?: string;
  targetSiteBn?: string;
  primaryActives: string[];
  resistanceRisk: 'Low' | 'Medium' | 'High' | 'Low to Medium' | 'Medium to High' | 'Unknown';
  rotationStrategy: string;
  rotationStrategyBn?: string;
  type: 'IRAC' | 'FRAC' | 'HRAC';
  committee?: 'IRAC' | 'FRAC' | 'HRAC';
}

export interface DosageInput {
  areaValue: number;
  areaUnit: 'hectare' | 'acre' | 'bigha' | 'katha' | 'sqm';
  tankVolumeL: number;
  sprayVolumePerHaL: number;
}

export interface DosageResult {
  convertedHa: number;
  convertedAcres: number;
  totalWaterNeededL: number;
  numberOfTanks: number;
  totalChemicalNeeded: string;
  chemicalPerTank: string;
  notes: string;
}

export interface RegulatoryAlert {
  id: string;
  title: string;
  category: 'regulatory' | 'seasonal' | 'safety' | 'resistance';
  severity: 'high' | 'medium' | 'info';
  date: string;
  validUntil?: string;
  targetCrops?: string[];
  targetChemicals?: string[];
  targetPests?: string[];
  summary: string;
  details: string;
  actionRequired?: string;
  read?: boolean;
}

export interface SprayRotationStep {
  sprayNumber: number;
  sprayWindow: string; // e.g. "Early vegetative", "Flowering", "Fruit development"
  productId: string;
  productName: string;
  commonName: string;
  moaCode: string;
  moaGroup: string;
  status: 'valid' | 'conflict';
  conflictReason?: string;
}

export type AppTab = 'home' | 'database' | 'calculator' | 'rotation' | 'safety' | 'guidebook' | 'alerts';
