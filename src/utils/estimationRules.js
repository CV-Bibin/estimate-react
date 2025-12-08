// --- CONSTANTS ---
const PCC_THICKNESS = 0.10;     
const FOOTING_THICKNESS = 0.45; 
const BEDDING_THICKNESS = 0.10; 
const TOPSOIL_CLEARANCE = 0.05; 
const WORKING_SPACE = 0.30;     
const PLINTH_EXCAV_DEPTH = (BEDDING_THICKNESS + TOPSOIL_CLEARANCE).toFixed(2); 
const RR_BASE_WIDTH = 0.6;      
const RR_BASE_DEPTH = 0.6;      
const RR_BASEMENT_WIDTH = 0.45; 
const RR_BASEMENT_DEPTH = 0.45; 
const RR_TOTAL_DEPTH = (PCC_THICKNESS + RR_BASE_DEPTH + RR_BASEMENT_DEPTH).toFixed(2); 
const PCC_OFFSET = 0.2; 

// --- MATH HELPER ---
const evaluateMath = (val) => {
    try {
        if (!val) return 0;
        const result = new Function('return ' + val.replace(/[^0-9+\-*/. ]/g, ''))(); 
        return parseFloat(result) || 0;
    } catch (e) { return 0; }
};

const safeDim = (val, def) => { const v = parseFloat(val); return (v && v > 0) ? v : def; };
const createHeader = (title) => ({ id: Date.now() + Math.random(), desc: `--- ${title} ---`, nos: 0, l: 0, b: 0, d: 0, unit: '', isHeader: true });

// --- EXCAVATION ---
export const getExcavationRows = (globalParams, totalWallLen) => {
  let rows = [];
  const hasCellar = (globalParams.floorNames || []).some(n => n.toLowerCase().includes('cellar'));
  const isRCC = globalParams.foundationType === 'RCC';
  
  // LOGIC UPDATE: FILTER NON-STRUCTURAL AREAS
  const openAreaFreePerimeter = (globalParams.openAreas || []).reduce((sum, a) => {
      // Only include if "includeInPlinth" is TRUE (Default)
      return a.includeInPlinth ? sum + evaluateMath(a.freeLen) : sum;
  }, 0);

  // Recalculate Total Length safely
  const baseWallLen = parseFloat(globalParams.extLen || 0) + parseFloat(globalParams.intLen || 0) + (globalParams.customWalls || []).reduce((s, w) => s + parseFloat(w.length || 0), 0);
  const totalLinearLen = (baseWallLen + openAreaFreePerimeter).toFixed(2);

  if (hasCellar) rows.push({ id: Date.now(), desc: 'Mass Excavation (Cellar Area)', nos: 1, l: 15, b: 10, d: 3.0, unit: 'm3' });

  if (globalParams.columnGroups && globalParams.columnGroups.length > 0) {
    globalParams.columnGroups.forEach((grp, idx) => {
      const fL = safeDim(grp.f_l, 1.0);
      const fB = safeDim(grp.f_b, 1.0);
      const fD = safeDim(grp.f_d, 1.2);
      const excavL = (fL + WORKING_SPACE).toFixed(2);
      const excavB = (fB + WORKING_SPACE).toFixed(2);
      rows.push({ id: Date.now() + idx, desc: `Excavation for ${grp.name} Footing`, nos: grp.count, l: excavL, b: excavB, d: fD, unit: 'm3' });
    });
  }

  if (isRCC) {
    if (!hasCellar) {
        rows.push({ id: Date.now() + 99, desc: 'Shallow Excavation for Plinth Beams (Topsoil + Bedding)', nos: 1, l: totalLinearLen, b: 0.4, d: PLINTH_EXCAV_DEPTH, unit: 'm3' });
    }
  } else {
    const trenchWidth = (RR_BASE_WIDTH + WORKING_SPACE).toFixed(2);
    rows.push({ id: Date.now() + 99, desc: 'Excavation for Foundation Trenches', nos: 1, l: totalLinearLen, b: trenchWidth, d: RR_TOTAL_DEPTH, unit: 'm3' });
  }
  return rows;
};

// --- FOUNDATION ---
export const getFoundationRows = (globalParams, totalWallLen) => {
  let rows = [];
  const isRCC = globalParams.foundationType === 'RCC';
  
  // LOGIC UPDATE: FILTER NON-STRUCTURAL AREAS
  const openAreaFreePerimeter = (globalParams.openAreas || []).reduce((sum, a) => {
      return a.includeInPlinth ? sum + evaluateMath(a.freeLen) : sum;
  }, 0);

  const baseWallLen = parseFloat(globalParams.extLen || 0) + parseFloat(globalParams.intLen || 0) + (globalParams.customWalls || []).reduce((s, w) => s + parseFloat(w.length || 0), 0);
  const totalLinearLen = (baseWallLen + openAreaFreePerimeter).toFixed(2);

  rows.push(createHeader(isRCC ? 'A. PCC & BEDDING' : 'A. PCC BED')); 
  if (isRCC) {
      (globalParams.columnGroups || []).forEach((grp, idx) => {
        const fL = safeDim(grp.f_l, 1.0);
        const fB = safeDim(grp.f_b, 1.0);
        const pccL = (fL + PCC_OFFSET).toFixed(2); 
        const pccB = (fB + PCC_OFFSET).toFixed(2);
        rows.push({ id: Date.now() + idx, desc: `PCC 1:4:8 under ${grp.name}`, nos: grp.count, l: pccL, b: pccB, d: PCC_THICKNESS, unit: 'm3' });
      });
      rows.push({ id: Date.now() + 150, desc: `PCC 1:4:8 Bedding under Plinth Beams`, nos: 1, l: totalLinearLen, b: 0.3, d: BEDDING_THICKNESS, unit: 'm3' });
  } else {
      const pccWidth = (RR_BASE_WIDTH + PCC_OFFSET).toFixed(2);
      rows.push({ id: Date.now() + 100, desc: `PCC 1:4:8 for Foundation`, nos: 1, l: totalLinearLen, b: pccWidth, d: PCC_THICKNESS, unit: 'm3' });
  }

  rows.push(createHeader(isRCC ? 'B. RCC FOOTINGS' : 'B. RR FOUNDATION'));
  if (isRCC) {
     (globalParams.columnGroups || []).forEach((grp, idx) => {
        const fL = safeDim(grp.f_l, 1.0);
        const fB = safeDim(grp.f_b, 1.0);
        rows.push({ id: Date.now() + 200 + idx, desc: `RCC Footing for ${grp.name}`, nos: grp.count, l: fL, b: fB, d: FOOTING_THICKNESS, unit: 'm3' });
     });
  } else {
     rows.push({ id: Date.now() + 200, desc: `RR Masonry Foundation (Base)`, nos: 1, l: totalLinearLen, b: RR_BASE_WIDTH, d: RR_BASE_DEPTH, unit: 'm3' });
  }

  rows.push(createHeader(isRCC ? 'C. COLUMN STUMP & PLINTH' : 'C. BASEMENT'));
  (globalParams.columnGroups || []).forEach((grp, idx) => {
      const fD = safeDim(grp.f_d, 1.2);
      const cL = parseFloat(grp.c_l) > 0 ? grp.c_l : 0.23; 
      const cB = parseFloat(grp.c_b) > 0 ? grp.c_b : 0.23;
      const stumpHeight = (fD - (PCC_THICKNESS + FOOTING_THICKNESS)).toFixed(2);
      const finalStumpH = parseFloat(stumpHeight) > 0 ? stumpHeight : 0.3;
      rows.push({ id: Date.now() + 300 + idx, desc: `RCC Column Stump (to GL 0.00) for ${grp.name}`, nos: grp.count, l: cL, b: cB, d: finalStumpH, unit: 'm3' });
  });

  if (isRCC) {
     rows.push({ id: Date.now() + 400, desc: `RCC Plinth Beams (Floor Level +30cm)`, nos: 1, l: totalLinearLen, b: 0.23, d: 0.3, unit: 'm3' });
  } else {
     rows.push({ id: Date.now() + 400, desc: `RR Masonry Basement`, nos: 1, l: totalLinearLen, b: RR_BASEMENT_WIDTH, d: RR_BASEMENT_DEPTH, unit: 'm3' });
  }
  return rows;
};

// --- 4. EARTH FILLING ---
export const getEarthFillingRows = (globalParams, totalWallLen) => {
    let rows = [];
    const isRCC = globalParams.foundationType === 'RCC';
    
    // LOGIC UPDATE: FILTER NON-STRUCTURAL AREAS
    const openAreaFreePerimeter = (globalParams.openAreas || []).reduce((sum, a) => {
        return a.includeInPlinth ? sum + evaluateMath(a.freeLen) : sum;
    }, 0);

    const baseWallLen = parseFloat(globalParams.extLen || 0) + parseFloat(globalParams.intLen || 0) + (globalParams.customWalls || []).reduce((s, w) => s + parseFloat(w.length || 0), 0);
    const totalLen = (baseWallLen + openAreaFreePerimeter).toFixed(2);

    const backfillDepth = isRCC ? 0.5 : RR_TOTAL_DEPTH; 
    rows.push({ id: Date.now(), desc: 'Refilling sides of trenches with available earth', nos: 2, l: totalLen, b: 0.15, d: backfillDepth, unit: 'm3' });

    const fillHeight = isRCC ? 0.45 : RR_BASEMENT_DEPTH; 
    rows.push({ id: Date.now() + 1, desc: 'Earth filling inside plinth/basement (Enter Room Area L x B)', nos: 1, l: 1, b: 1, d: fillHeight, unit: 'm3' });

    return rows;
};

export const getSiteClearanceRows = () => [{ id: Date.now(), desc: 'Clearing site using JCB...', nos: 1, l: 0, b: 0, d: 0, unit: 'Hrs', qtyOverride: 8.00 }];