// --- CONSTANTS ---
const PCC_THICKNESS = 0.1;
const PCC_OFFSET = 0.2; 
const RR_BASE_WIDTH = 0.6;      
const RR_BASE_DEPTH = 0.6;      
const RR_BASEMENT_WIDTH = 0.45; 
const RR_BASEMENT_DEPTH = 0.45; 
const RR_TOTAL_DEPTH = (PCC_THICKNESS + RR_BASE_DEPTH + RR_BASEMENT_DEPTH).toFixed(2); 

const createHeader = (title) => ({ id: Date.now() + Math.random(), desc: `--- ${title} ---`, nos: 0, l: 0, b: 0, d: 0, unit: '', isHeader: true });

export const getExcavationRows = (globalParams, totalWallLen) => {
  let rows = [];
  const hasCellar = (globalParams.floorNames || []).some(n => n.toLowerCase().includes('cellar'));
  const isRCC = globalParams.foundationType === 'RCC';
  const openAreaPerimeter = (globalParams.openAreas || []).reduce((sum, a) => sum + (parseFloat(a.perimeter) || 0), 0);
  const totalLinearLen = (parseFloat(totalWallLen) + openAreaPerimeter).toFixed(2);

  if (hasCellar) rows.push({ id: Date.now(), desc: 'Mass Excavation (Cellar Area)', nos: 1, l: 15, b: 10, d: 3.0, unit: 'm3' });

  if (globalParams.columnGroups && globalParams.columnGroups.length > 0) {
    globalParams.columnGroups.forEach((grp, idx) => {
      const excavL = (parseFloat(grp.f_l) + PCC_OFFSET).toFixed(2);
      const excavB = (parseFloat(grp.f_b) + PCC_OFFSET).toFixed(2);
      rows.push({ id: Date.now() + idx, desc: `Excavation for ${grp.name} Footing`, nos: grp.count, l: excavL, b: excavB, d: grp.f_d, unit: 'm3' });
    });
  }

  if (isRCC) {
    if (!hasCellar) rows.push({ id: Date.now() + 99, desc: 'Excavation for Plinth Beams', nos: 1, l: totalLinearLen, b: 0.4, d: 0.4, unit: 'm3' });
  } else {
    const trenchWidth = (RR_BASE_WIDTH + PCC_OFFSET).toFixed(2);
    rows.push({ id: Date.now() + 99, desc: 'Excavation for Foundation Trenches', nos: 1, l: totalLinearLen, b: trenchWidth, d: RR_TOTAL_DEPTH, unit: 'm3' });
  }
  return rows;
};

export const getFoundationRows = (globalParams, totalWallLen) => {
  let rows = [];
  const isRCC = globalParams.foundationType === 'RCC';
  const openAreaPerimeter = (globalParams.openAreas || []).reduce((sum, a) => sum + (parseFloat(a.perimeter) || 0), 0);
  const totalLinearLen = (parseFloat(totalWallLen) + openAreaPerimeter).toFixed(2);

  rows.push(createHeader('A. PCC BED')); 
  (globalParams.columnGroups || []).forEach((grp, idx) => {
    const pccL = (parseFloat(grp.f_l) + PCC_OFFSET).toFixed(2);
    const pccB = (parseFloat(grp.f_b) + PCC_OFFSET).toFixed(2);
    rows.push({ id: Date.now() + idx, desc: `PCC 1:4:8 under ${grp.name}`, nos: grp.count, l: pccL, b: pccB, d: PCC_THICKNESS, unit: 'm3' });
  });
  if (!isRCC) {
    const pccWidth = (RR_BASE_WIDTH + PCC_OFFSET).toFixed(2);
    rows.push({ id: Date.now() + 100, desc: `PCC 1:4:8 for Foundation`, nos: 1, l: totalLinearLen, b: pccWidth, d: PCC_THICKNESS, unit: 'm3' });
  }

  rows.push(createHeader(isRCC ? 'B. RCC FOOTINGS' : 'B. RR FOUNDATION'));
  if (isRCC) {
     (globalParams.columnGroups || []).forEach((grp, idx) => {
        rows.push({ id: Date.now() + 200 + idx, desc: `RCC Footing for ${grp.name}`, nos: grp.count, l: grp.f_l, b: grp.f_b, d: 0.45, unit: 'm3' });
     });
  } else {
     rows.push({ id: Date.now() + 200, desc: `RR Masonry Foundation (Base)`, nos: 1, l: totalLinearLen, b: RR_BASE_WIDTH, d: RR_BASE_DEPTH, unit: 'm3' });
  }

  rows.push(createHeader(isRCC ? 'C. PLINTH BEAMS' : 'C. BASEMENT'));
  // Add Column Stumps even for RR (for open columns)
  (globalParams.columnGroups || []).forEach((grp, idx) => {
      const stumpHeight = isRCC ? 0.9 : RR_BASEMENT_DEPTH; 
      rows.push({ id: Date.now() + 300 + idx, desc: `RCC Column Stump (up to Plinth) for ${grp.name}`, nos: grp.count, l: grp.c_l, b: grp.c_b, d: stumpHeight, unit: 'm3' });
  });

  if (isRCC) {
     rows.push({ id: Date.now() + 400, desc: `RCC Plinth Beams`, nos: 1, l: totalLinearLen, b: 0.23, d: 0.3, unit: 'm3' });
  } else {
     rows.push({ id: Date.now() + 400, desc: `RR Masonry Basement`, nos: 1, l: totalLinearLen, b: RR_BASEMENT_WIDTH, d: RR_BASEMENT_DEPTH, unit: 'm3' });
  }

  return rows;
};

export const getSiteClearanceRows = () => [{ id: Date.now(), desc: 'Clearing site using JCB...', nos: 1, l: 0, b: 0, d: 0, unit: 'Hrs', qtyOverride: 8.00 }];