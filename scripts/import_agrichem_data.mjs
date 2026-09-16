import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('../AgriChem-Guide-Pest-Control-Database/src/data');
const DEST_DIR = path.resolve('src/data');

// 1. Process all_pesticides.ts -> all_pesticides.js
console.log('Processing all_pesticides.ts...');
let pesticidesRaw = fs.readFileSync(path.join(SRC_DIR, 'all_pesticides.ts'), 'utf-8');
// Strip TS types
pesticidesRaw = pesticidesRaw.replace(/export type PesticideType =[\s\S]*?export interface PesticideProduct \{[\s\S]*?\}/, '');
pesticidesRaw = pesticidesRaw.replace(/: ReadonlyArray<PesticideProduct>/g, '');
pesticidesRaw = pesticidesRaw.replace(/as PesticideType/g, '');
fs.writeFileSync(path.join(DEST_DIR, 'all_pesticides.js'), pesticidesRaw);
console.log('Saved all_pesticides.js');

// 2. Process moaData.ts -> moaData_full.js
console.log('Processing moaData.ts...');
let moaRaw = fs.readFileSync(path.join(SRC_DIR, 'moaData.ts'), 'utf-8');
moaRaw = moaRaw.replace(/import \{ MoAClassification \} from '\.\.\/types';/, '');
moaRaw = moaRaw.replace(/: MoAClassification\[\]/g, '');
fs.writeFileSync(path.join(DEST_DIR, 'moaData_full.js'), moaRaw);
console.log('Saved moaData_full.js');

console.log('Data conversion complete.');
