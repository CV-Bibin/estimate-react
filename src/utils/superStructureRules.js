// --- CONSTANTS (Super Structure Defaults) ---
const SLAB_THICKNESS = 0.125; // 125mm (5 inches) standard
const BEAM_DEPTH = 0.45;     // 450mm standard beam depth
const WALL_HEIGHT_GF = 3.0;  // 3.0m (Ground Floor to ceiling/slab bottom)

// Helper to safely parse dimensions (from subStructureRules context)
const safeDim = (val, def) => {
    const v = parseFloat(val);
    return (v && v > 0) ? v : def;
};

const createHeader = (title) => ({ id: Date.now() + Math.random(), desc: `--- ${title} ---`, nos: 0, l: 0, b: 0, d: 0, unit: '', isHeader: true });

// --- MASONRY WALLS ---
export const getMasonryRows = (globalParams) => {
    const { extLen, intLen, customWalls, numFloors, extWidth, intWidth } = globalParams;
    let rows = [];

    rows.push(createHeader('WALLS VOLUME'));
    
    // 1. Exterior Walls
    const wallAreaExt = safeDim(extLen, 0) * safeDim(extWidth, 0.23) * WALL_HEIGHT_GF;
    rows.push({
        id: Date.now() + 1,
        desc: `Exterior Walls (Ground Floor)`,
        nos: 1, 
        l: safeDim(extLen, 0), 
        b: safeDim(extWidth, 0.23), // Width
        d: WALL_HEIGHT_GF,          // Height
        unit: 'm3',
        qtyOverride: wallAreaExt > 0 ? wallAreaExt.toFixed(2) : 0
    });

    // 2. Interior Walls
    const wallAreaInt = safeDim(intLen, 0) * safeDim(intWidth, 0.23) * WALL_HEIGHT_GF;
    rows.push({
        id: Date.now() + 2,
        desc: `Interior Walls (Ground Floor)`,
        nos: 1, 
        l: safeDim(intLen, 0), 
        b: safeDim(intWidth, 0.23),
        d: WALL_HEIGHT_GF,
        unit: 'm3',
        qtyOverride: wallAreaInt > 0 ? wallAreaInt.toFixed(2) : 0
    });

    // 3. Custom Walls
    if (customWalls && customWalls.length > 0) {
        customWalls.forEach((wall, idx) => {
            const wallAreaCustom = safeDim(wall.length, 0) * safeDim(wall.width, 0.15) * WALL_HEIGHT_GF;
            rows.push({
                id: Date.now() + 3 + idx,
                desc: `${wall.name} (Ground Floor)`,
                nos: 1, 
                l: safeDim(wall.length, 0), 
                b: safeDim(wall.width, 0.15),
                d: WALL_HEIGHT_GF,
                unit: 'm3',
                qtyOverride: wallAreaCustom > 0 ? wallAreaCustom.toFixed(2) : 0
            });
        });
    }

    // Note: Need to multiply by (numFloors - 1) if subsequent floors are assumed identical.
    // For now, we only estimate GF unless user multiplies Nos.

    return rows;
};


// --- RCC SLAB & BEAMS ---
export const getSlabAndBeamRows = (globalParams, totalPlinthArea = 100) => {
    let rows = [];
    rows.push(createHeader('RCC SLAB & BEAMS (M25)'));

    // 1. Slab Volume (Approximation: Total Plinth Area * Thickness)
    // NOTE: This assumes 'totalPlinthArea' is passed from the parent component
    const slabVolume = totalPlinthArea * SLAB_THICKNESS;

    rows.push({
        id: Date.now() + 100,
        desc: `Roof Slab Volume (GF)`,
        nos: 1, 
        l: Math.sqrt(totalPlinthArea).toFixed(2), // Length approximation
        b: Math.sqrt(totalPlinthArea).toFixed(2), // Width approximation
        d: SLAB_THICKNESS,
        unit: 'm3',
        qtyOverride: slabVolume.toFixed(2)
    });

    // 2. Beams (Approximation based on Area)
    // Rule of thumb: Beam volume is roughly 15-20% of Slab volume. Using 18% here.
    const beamVolume = slabVolume * 0.18; 

    rows.push({
        id: Date.now() + 101,
        desc: `Main/Secondary Beams (Approximate volume)`,
        nos: 1,
        l: 1,
        b: 1,
        d: 1, // Placeholder
        unit: 'm3',
        qtyOverride: beamVolume.toFixed(2)
    });

    return rows;
};

// --- RCC COLUMNS ---
export const getColumnSuperstructureRows = (globalParams, numFloors) => {
    let rows = [];
    rows.push(createHeader('RCC COLUMN ABOVE PLINTH'));
    
    // Note: The Stump (up to Plinth) volume is already in the Sub Structure section.
    const floorHeight = WALL_HEIGHT_GF; // Use wall height as column height for GF/Typ Floor

    (globalParams.columnGroups || []).forEach((grp, idx) => {
        
        // Calculate the height of the column above ground (GF + subsequent floors)
        const totalFloorHeight = (numFloors || 1) * floorHeight; 
        
        // Calculate Volume (LxBxH * Nos)
        const volume = safeDim(grp.c_l, 0.23) * safeDim(grp.c_b, 0.23) * floorHeight * grp.count;

        rows.push({
            id: Date.now() + idx,
            desc: `${grp.name} Volume (Ground Floor)`,
            nos: grp.count,
            l: safeDim(grp.c_l, 0.23),
            b: safeDim(grp.c_b, 0.23),
            d: floorHeight,
            unit: 'm3',
            qtyOverride: volume.toFixed(2)
        });
        
        // FUTURE: Can add more rows here for subsequent floors (e.g., nos * (numFloors - 1) * height)
    });

    return rows;
};