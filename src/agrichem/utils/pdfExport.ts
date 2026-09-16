import { ChemicalProduct, DosageResult, DosageInput, SprayRotationStep } from '../types';

// Lazy loader for PDF generation libraries to prevent heavy upfront evaluation
async function loadPdfEngines() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  return { jsPDF, autoTable };
}

export async function exportSingleProductPDF(product: ChemicalProduct) {
  const { jsPDF, autoTable } = await loadPdfEngines();
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(22, 101, 52); // Forest Green
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AGRICHEM FIELD GUIDE & SAFETY SUMMARY', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Agricultural Chemical Controls Guidebook - Field Reference Dossier', 14, 20);

  // Document metadata
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Registration: ${product.registrationNo}`, 14, 34);

  // Product title
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(product.tradeName, 14, 44);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(`Active Ingredient: ${product.commonName} | Category: ${product.type}`, 14, 51);

  // Basic Info Table
  autoTable(doc, {
    startY: 56,
    head: [['Field Property', 'Specification / Registered Detail']],
    body: [
      ['Trade Name of Product', product.tradeName],
      ['Common Active Ingredient', product.commonName],
      ['Pesticide Category', product.type],
      ['Registration Number', product.registrationNo],
      ['Registration Holder / Company', product.registrationHolder],
      ['Registered Dosage Rate', product.dosageRate],
      ['Recommended Crops', product.crops.join(', ')],
      ['Target Pests & Diseases', product.pests.join(', ')],
      ['Formulation Type', product.formulation || 'Liquid / Powder / Granule'],
      ['Mode of Action (MoA)', `${product.moaCode || 'Standard'} - ${product.moaGroup || 'Target site specified'}`],
      ['Resistance Risk Assessment', `${product.resistanceRisk || 'Medium'} Risk`],
      ['Pre-Harvest Interval (PHI)', product.phiDays ? `${product.phiDays} Days before harvesting` : 'Follow crop label'],
      ['Restricted Entry Interval (REI)', product.reiHours ? `${product.reiHours} Hours` : '24 Hours after spray']
    ],
    theme: 'striped',
    headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  // Safety & Resistance Section
  const currentY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('RESISTANCE ROTATION & FIELD SAFETY CHECKLIST', 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Category', 'Official Guidance & Precaution']],
    body: [
      ['Resistance Strategy', product.rotationNotes || 'Rotate with an active ingredient from a different MoA group. Never spray more than 2 consecutive applications.'],
      ['Personal Protective Equipment', 'Wear nitrile/rubber gloves, vapor respirator or dust mask, safety goggles, long-sleeved overalls, and rubber gumboots.'],
      ['Environmental Precaution', 'Do NOT spray during strong winds (>10 km/h) or direct sun. Avoid drift to bee apiaries and keep 15m buffer from water bodies.'],
      ['Container Disposal', 'Triple-rinse empty chemical containers into the spray tank. Puncture container bottom to prevent reuse and dispose safely according to local rules.']
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    styles: { fontSize: 8.5, cellPadding: 3.5 }
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text('AgriChem Guidebook - Department of Agricultural Extension / Agricultural Field Reference.', 14, pageHeight - 8);

  doc.save(`${product.tradeName.replace(/[^a-zA-Z0-9]/g, '_')}_Field_Guide.pdf`);
}

export async function exportCropGuidePDF(cropName: string, products: ChemicalProduct[]) {
  const { jsPDF, autoTable } = await loadPdfEngines();
  const doc = new jsPDF('landscape');

  // Header Banner
  doc.setFillColor(22, 101, 52);
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`AGRICHEM PEST & DISEASE CONTROL SUMMARY: ${cropName.toUpperCase()}`, 14, 11);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Registered Agricultural Controls & MoA Rotation Guide | Generated: ${new Date().toLocaleDateString()}`, 14, 18);

  const tableData = products.map((p) => [
    p.tradeName,
    p.commonName,
    p.type,
    p.pests.join(', '),
    p.dosageRate,
    p.moaCode || 'N/A',
    p.registrationHolder,
    p.phiDays ? `${p.phiDays}d` : '-'
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['Trade Name', 'Active Ingredient', 'Category', 'Target Pests/Diseases', 'Dosage Rate', 'MoA Code', 'Registration Holder', 'PHI']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 36 },
      1: { cellWidth: 38 },
      2: { cellWidth: 24 },
      3: { cellWidth: 60 },
      4: { cellWidth: 38 },
      5: { cellWidth: 26 },
      6: { cellWidth: 44 },
      7: { cellWidth: 14 }
    }
  });

  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i} of ${pageCount} | AgriChem Guidebook Database`, 14, doc.internal.pageSize.height - 6);
  }

  doc.save(`${cropName.replace(/\s+/g, '_')}_Pest_Control_Guide.pdf`);
}

export async function exportDosagePrescriptionPDF(
  product: ChemicalProduct,
  input: DosageInput,
  result: DosageResult
) {
  const { jsPDF, autoTable } = await loadPdfEngines();
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 118, 110); // Teal
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FIELD DOSAGE & TANK MIX PRESCRIPTION', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Precision Agricultural Application & Sprayer Calibration Report', 14, 20);

  // Field & Chemical Spec
  autoTable(doc, {
    startY: 34,
    head: [['Parameter', 'Field Value']],
    body: [
      ['Target Chemical', `${product.tradeName} (${product.commonName})`],
      ['Chemical Category & MoA', `${product.type} | ${product.moaCode || 'Standard'}`],
      ['Registration Number', product.registrationNo],
      ['Field Application Area', `${input.areaValue} ${input.areaUnit.toUpperCase()} (${result.convertedHa} Ha / ${result.convertedAcres} Acres)`],
      ['Knapsack Sprayer Tank Volume', `${input.tankVolumeL} Litres`],
      ['Total Water Volume Needed', `${result.totalWaterNeededL} Litres`],
      ['Number of Spray Tanks', `${result.numberOfTanks} Tanks`],
      ['TOTAL CHEMICAL REQUIRED', result.totalChemicalNeeded],
      ['CHEMICAL PER SPRAY TANK', result.chemicalPerTank],
      ['Application Notes', result.notes]
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 }
    }
  });

  const nextY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('SPRAYER CALIBRATION & PPE CHECKLIST', 14, nextY);

  autoTable(doc, {
    startY: nextY + 4,
    head: [['Step', 'Field Operation Protocol']],
    body: [
      ['1. Tank Pre-Mix', 'Fill knapsack sprayer half-full with clean water. Pre-dissolve measured chemical in a separate plastic jug with clean water before pouring into tank.'],
      ['2. Agitation & Fill', 'Add remainder of water up to the measured mark. Agitate gently to achieve homogenous suspension.'],
      ['3. Nozzle & Pressure', 'Use hollow-cone nozzles for insecticides/fungicides or floodjet/flat-fan nozzles for herbicides. Check for nozzle leaks or clogged tips.'],
      ['4. Wind & Weather', 'Apply during calm morning (7:00-10:00 AM) or late afternoon (4:00-6:30 PM). Never spray during wind >10 km/h or high heat.'],
      ['5. PPE Reminder', 'Wear chemical-resistant gloves, protective goggles, long trousers, and respirator mask during both mixing and spraying.'],
      ['6. Harvest Interval', `Respect Pre-Harvest Interval (PHI) of ${product.phiDays || 14} days before harvesting.`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    styles: { fontSize: 8.5, cellPadding: 3 }
  });

  doc.save(`${product.tradeName}_Dosage_Prescription.pdf`);
}

export async function exportRotationSchedulePDF(crop: string, pest: string, steps: SprayRotationStep[]) {
  const { jsPDF, autoTable } = await loadPdfEngines();
  const doc = new jsPDF();

  doc.setFillColor(30, 64, 175); // Royal Blue
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ANTI-RESISTANCE ROTATION SCHEDULE', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Crop: ${crop} | Target Pest/Disease: ${pest} | IRAC/FRAC/HRAC Sequence`, 14, 20);

  const tableData = steps.map((s) => [
    `Spray #${s.sprayNumber}`,
    s.sprayWindow,
    s.productName,
    s.commonName,
    s.moaCode,
    s.status === 'valid' ? 'Valid Rotation' : 'CONFLICT: Repeated MoA'
  ]);

  autoTable(doc, {
    startY: 34,
    head: [['Spray #', 'Application Window', 'Trade Name', 'Active Ingredient', 'MoA Code', 'Resistance Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    styles: { fontSize: 8.5, cellPadding: 3.5 }
  });

  doc.save(`${crop}_${pest}_Rotation_Schedule.pdf`);
}
