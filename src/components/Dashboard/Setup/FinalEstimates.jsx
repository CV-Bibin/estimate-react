import React, { useMemo, useState, useEffect } from "react";
import { Save, Info, ChevronDown, ChevronUp, Calculator, List, CheckCircle2 } from "lucide-react";

export default function FinalEstimates({
  stats,
  data,
  walls = [],
  openings = [],
  irregularWalls = [], // Wall Adjustments
  beams = [],          // Drop/Open Beams
  columns = [],        // Manual/Open Columns
  floorName,
  updateField,
  onSaveClick,
}) {
  const [showPlasterDetails, setShowPlasterDetails] = useState(true);
  const [showStructDetails, setShowStructDetails] = useState(false);

  // Local state to allow editing ONLY column heights for plaster calculation
  const [localColumns, setLocalColumns] = useState(columns);

  // Sync local state when props change
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleColumnHeightChange = (index, newVal) => {
    const updated = [...localColumns];
    updated[index] = { ...updated[index], h: newVal };
    setLocalColumns(updated);
  };

  // --- Helpers ---
  const safeFloat = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  const evaluateMath = (expression) => {
    try {
        if (!expression) return 0;
        const cleanExpr = String(expression).replace(/[^-()\d/*+.]/g, '');
        return new Function('return ' + cleanExpr)() || 0;
    } catch (error) { return 0; }
  };

  // --- 1. BRICK WORK SPECIFIC CALCULATION ---
  const brickStats = useMemo(() => {
    // Filter ONLY 'concealed' columns for Brick Deduction
    const colDeductionVol = columns
        .filter(c => c.type === 'concealed')
        .reduce((acc, c) => {
            const vol = evaluateMath(c.l) * evaluateMath(c.b) * evaluateMath(c.h) * (parseFloat(c.nos) || 1);
            return acc + vol;
        }, 0);

    // Re-calculate Net Volume to match new deduction logic
    // Formula: Gross + Adjust - Openings - Lintels - ConcealedBeams - ConcealedColumns - ManualDed
    const netVol = (parseFloat(stats.grossVol) || 0) + 
                   (parseFloat(stats.adjustVol) || 0) - 
                   (parseFloat(stats.openVol) || 0) - 
                   (parseFloat(stats.lintelVol) || 0) - 
                   (parseFloat(stats.beamVolConcealed) || 0) - 
                   colDeductionVol - 
                   (parseFloat(data.deductionVol) || 0);

    return { colDeductionVol, netVol };
  }, [columns, stats, data.deductionVol]);

  // --- 2. PLASTER CALCULATION LOGIC ---
  const plasterStats = useMemo(() => {
    // A. WALLS
    const wallTotalLen = walls.reduce((acc, w) => acc + evaluateMath(w.l), 0);
    const singleFaceArea = walls.reduce((acc, wall) => acc + (evaluateMath(wall.l) * evaluateMath(wall.h)), 0);
    const singleFaceOpening = openings.reduce((acc, op) => acc + (evaluateMath(op.w) * evaluateMath(op.h) * (parseFloat(op.nos) || 1)), 0);
    
    const wallGross = singleFaceArea * 2; 
    const wallOpenDed = singleFaceOpening * 2;
    const wallNet = Math.max(0, wallGross - wallOpenDed);

    // B. WALL ADJUSTMENTS
    let adjustArea = 0;
    irregularWalls.forEach(w => {
        const area = evaluateMath(w.l) * evaluateMath(w.h) * 2;
        if (w.mode === 'deduct') adjustArea -= area;
        else adjustArea += area;
    });

    // C. BEAM PLASTER (Visible Sides Only)
    // Formula: Bottom (L*W) + 2 Sides (L*D)
    const beamCount = beams.length;
    const beamPlasterArea = beams.reduce((acc, b) => {
        const l = evaluateMath(b.l);
        const w = evaluateMath(b.b); // Width
        const d = evaluateMath(b.d); // Depth
        const visibleArea = (l * w) + (2 * l * d);
        return acc + visibleArea;
    }, 0);

    // D. COLUMN PLASTER (Using LOCAL COLUMNS to allow height editing)
    // *** KEY CHANGE: Filter ONLY 'open' columns for Plaster Addition ***
    const openCols = localColumns.filter(c => c.type === 'open');
    
    const colCount = openCols.reduce((acc, c) => acc + (parseFloat(c.nos) || 1), 0);
    const columnPlasterArea = openCols.reduce((acc, c) => {
        const l = evaluateMath(c.l);
        const w = evaluateMath(c.b);
        const h = evaluateMath(c.h); // Uses the edited height
        const nos = evaluateMath(c.nos) || 1;
        const perimeter = 2 * (l + w);
        return acc + (perimeter * h * nos);
    }, 0);

    // E. GRAND TOTAL
    const manualDeduction = parseFloat(data.deductionArea) || 0;
    const totalPlasterArea = (wallNet + adjustArea + beamPlasterArea + columnPlasterArea) - manualDeduction;

    return {
        wallTotalLen,
        wallGross,
        wallOpenDed,
        wallNet,
        adjustArea,
        beamCount,
        beamPlasterArea,
        colCount,
        columnPlasterArea,
        totalPlasterArea
    };
  }, [walls, openings, irregularWalls, beams, localColumns, data.deductionArea]);

  return (
    <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl shadow-lg mt-8">
      <h4 className="text-sm font-bold text-indigo-900 border-b border-indigo-200 pb-2 mb-4">
        Final Estimates
      </h4>

      {/* --- Net Brick Masonry Section --- */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-bold text-gray-800 mb-2">
          <span>Net Brick Masonry (m³)</span>
          {/* UPDATED: Uses locally calculated net volume based on specific column deduction */}
          <span className="text-indigo-700 text-xl">{safeFloat(brickStats.netVol)}</span>
        </div>
        <div className="text-xs text-gray-700 border border-indigo-100 rounded overflow-hidden shadow-inner bg-white/50">
            <div className="flex justify-between items-center p-2.5 bg-white border-b border-indigo-50">
                <span>1. Total Gross Wall Volume:</span> <span className="font-bold">{safeFloat(stats.grossVol)}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-orange-50 border-b border-indigo-50 text-blue-600">
                <span>2. Wall Adjustments (Add/Deduct):</span> 
                <span>{stats.adjustVol >= 0 ? "+" : ""}{safeFloat(stats.adjustVol)}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-white border-b border-indigo-50 text-red-500">
                <span>3. Less: Openings Volume:</span> <span>-{safeFloat(stats.openVol)}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-orange-50 border-b border-indigo-50 text-red-500">
                <span>4. Less: Lintel Volume:</span> <span>-{safeFloat(stats.lintelVol)}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-white border-b border-indigo-50 text-red-500">
                <span>5. Less: Concealed Beam Volume:</span> <span>-{safeFloat(stats.beamVolConcealed)}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-orange-50 border-b border-indigo-50 text-red-500 font-medium">
                {/* UPDATED: Uses specific concealed column deduction */}
                <span>6. Less: Concealed Col Deductions:</span> <span className="font-bold text-red-600">-{safeFloat(brickStats.colDeductionVol)}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-white text-red-500">
                <span>7. Less: Other Deductions:</span>
                <div className="flex items-center gap-1">
                    <span>-</span>
                    <input type="text" className="w-20 p-1 text-right text-xs border border-red-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-red-300" value={data.deductionVol} onChange={(e) => updateField("deductionVol", e.target.value)} placeholder="0.00" />
                </div>
            </div>
        </div>
      </div>

      {/* --- Wall Plaster Area Section (Detailed) --- */}
      <div className="mb-4 border-2 border-indigo-100 rounded-xl bg-white overflow-hidden shadow-sm">
        
        {/* Header */}
        <div 
            className="flex justify-between items-center p-4 bg-indigo-50/50 cursor-pointer hover:bg-indigo-100 transition-colors"
            onClick={() => setShowPlasterDetails(!showPlasterDetails)}
        >
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1 rounded"><Calculator size={14}/></div>
            <span className="text-sm font-bold text-indigo-900">Total Plaster Area</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-2xl font-extrabold text-indigo-700">{safeFloat(plasterStats.totalPlasterArea)} <span className="text-xs font-normal text-indigo-400">m²</span></span>
             {showPlasterDetails ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
          </div>
        </div>

        {/* Breakdown */}
        {showPlasterDetails && (
            <div className="p-4 bg-white text-xs space-y-5 animate-in slide-in-from-top-2">
                
                {/* A. WALLS */}
                <div>
                    <h5 className="font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1 flex justify-between">
                        <span>A. Wall Surfaces (2 Faces)</span>
                        <span className="text-indigo-600">{safeFloat(plasterStats.wallNet)} m²</span>
                    </h5>
                    <table className="w-full text-left text-gray-600">
                        <tbody className="divide-y divide-gray-50">
                            <tr>
                                <td className="py-1">Total Wall Length</td>
                                <td className="py-1 text-right font-mono">{safeFloat(plasterStats.wallTotalLen)} m</td>
                            </tr>
                            <tr>
                                <td className="py-1">Gross Area (Inside + Outside)</td>
                                <td className="py-1 text-right font-mono">{safeFloat(plasterStats.wallGross)} m²</td>
                            </tr>
                            <tr className="text-red-500">
                                <td className="py-1">Less: Openings</td>
                                <td className="py-1 text-right font-mono">-{safeFloat(plasterStats.wallOpenDed)} m²</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* B. ADJUSTMENTS */}
                <div>
                    <h5 className="font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1 flex justify-between">
                        <span>B. Wall Adjustments</span>
                        <span className={plasterStats.adjustArea >= 0 ? "text-green-600" : "text-red-600"}>
                            {plasterStats.adjustArea > 0 ? "+" : ""}{safeFloat(plasterStats.adjustArea)} m²
                        </span>
                    </h5>
                </div>

                {/* C. STRUCTURAL ELEMENTS (Detailed) */}
                <div className="bg-gray-50 rounded border border-gray-200 p-2">
                    <h5 className="font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1 flex justify-between items-center">
                        <span>C. Structural Elements</span>
                        <button 
                            onClick={() => setShowStructDetails(!showStructDetails)}
                            className="text-[10px] bg-white border border-gray-300 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-gray-100 text-gray-600"
                        >
                            <List size={10}/> {showStructDetails ? "Hide" : "View"} Itemized Details
                        </button>
                    </h5>
                    
                    <table className="w-full text-left text-gray-700 mb-2">
                        <tbody className="divide-y divide-gray-200">
                            {/* Beam Summary Row */}
                            <tr>
                                <td className="py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-indigo-900">Open/Drop Beams</span>
                                        <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-200">
                                            {plasterStats.beamCount} Detected
                                        </span>
                                    </div>
                                    <div className="text-[9px] text-gray-500 mt-0.5">Formula: Bottom (L×W) + Sides (2×L×D)</div>
                                </td>
                                <td className="py-2 text-right font-bold text-indigo-700">+{safeFloat(plasterStats.beamPlasterArea)} m²</td>
                            </tr>

                            {/* Column Summary Row */}
                            <tr>
                                <td className="py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-indigo-900">Open/Porch Columns</span>
                                        <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-200">
                                            {plasterStats.colCount} Detected
                                        </span>
                                    </div>
                                    <div className="text-[9px] text-gray-500 mt-0.5">Formula: Perimeter (2×(L+W)) × Height</div>
                                </td>
                                <td className="py-2 text-right font-bold text-indigo-700">+{safeFloat(plasterStats.columnPlasterArea)} m²</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* ITEMIZED DETAILS PANEL */}
                    {showStructDetails && (
                        <div className="mt-2 border-t border-gray-300 pt-2 animate-in slide-in-from-top-1">
                            <h6 className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                <CheckCircle2 size={12}/> Confirm Structural Details
                            </h6>
                            
                            {/* Beam List */}
                            {beams.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-[9px] font-bold text-indigo-800 mb-1 pl-1">Beams (Auto + Manual)</div>
                                    <div className="grid grid-cols-5 gap-1 bg-indigo-100 p-1 rounded-t text-[9px] font-bold text-indigo-900 text-center">
                                        <div className="col-span-2 text-left pl-1">Type/Name</div><div>L</div><div>Area</div>
                                    </div>
                                    <div className="bg-white border border-indigo-100 rounded-b max-h-32 overflow-y-auto">
                                        {beams.map((b, i) => {
                                            const l = evaluateMath(b.l);
                                            const w = evaluateMath(b.b);
                                            const d = evaluateMath(b.d);
                                            const area = (l*w) + (2*l*d);
                                            const name = b.name || "Manual Drop Beam";
                                            return (
                                                <div key={i} className="grid grid-cols-5 gap-1 p-1 border-b border-gray-50 text-[9px] text-center text-gray-600 items-center">
                                                    <div className="col-span-2 text-left truncate font-medium text-gray-800 pl-1" title={name}>{name}</div>
                                                    <div>{l.toFixed(2)}</div>
                                                    <div className="font-bold text-indigo-600">{area.toFixed(2)}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Column List (Only displaying OPEN columns here) */}
                            {localColumns.filter(c => c.type === 'open').length > 0 && (
                                <div>
                                    <div className="text-[9px] font-bold text-indigo-800 mb-1 pl-1">Open Columns (Adjust Height for Plaster)</div>
                                    <div className="grid grid-cols-5 gap-1 bg-indigo-100 p-1 rounded-t text-[9px] font-bold text-indigo-900 text-center">
                                        <div>Nos</div><div>L</div><div>W</div><div className="bg-yellow-100 text-yellow-800 rounded px-1">Height (m)</div><div>Area</div>
                                    </div>
                                    <div className="bg-white border border-indigo-100 rounded-b max-h-32 overflow-y-auto">
                                        {localColumns.map((c, i) => {
                                            if (c.type !== 'open') return null; // Skip concealed columns

                                            const originalL = evaluateMath(columns[i].l).toFixed(2);
                                            const originalW = evaluateMath(columns[i].b).toFixed(2);
                                            
                                            const currentH = c.h; 
                                            const lVal = parseFloat(originalL);
                                            const wVal = parseFloat(originalW);
                                            const hVal = evaluateMath(currentH);
                                            const nos = evaluateMath(c.nos) || 1;
                                            
                                            const area = (2*(lVal+wVal)) * hVal * nos;
                                            
                                            return (
                                                <div key={i} className="grid grid-cols-5 gap-1 p-1 border-b border-gray-50 text-[9px] text-center text-gray-600 items-center">
                                                    <div>{nos}</div>
                                                    <div className="bg-gray-50 text-gray-400 cursor-not-allowed" title="Original Length">{originalL}</div>
                                                    <div className="bg-gray-50 text-gray-400 cursor-not-allowed" title="Original Width">{originalW}</div>
                                                    <div>
                                                        <input 
                                                            type="number" 
                                                            step="0.1"
                                                            className="w-full text-center bg-yellow-50 border border-yellow-200 rounded text-yellow-900 font-bold focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                                            value={currentH}
                                                            onChange={(e) => handleColumnHeightChange(i, e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="font-bold text-indigo-600">{area.toFixed(2)}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            {(beams.length === 0 && localColumns.filter(c => c.type === 'open').length === 0) && (
                                <div className="text-center text-[10px] text-gray-400 py-2 italic">No visible structural elements found.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. FINAL SUM */}
                <div className="bg-gray-100 p-3 rounded border border-gray-300">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 uppercase font-bold text-[10px]">Subtotal (A + B + C)</span>
                        <span className="font-bold text-gray-800">
                            {safeFloat(plasterStats.wallNet + plasterStats.adjustArea + plasterStats.beamPlasterArea + plasterStats.columnPlasterArea)} m²
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-red-600 border-b border-gray-300 pb-2 mb-2">
                        <span className="text-[10px] uppercase font-bold flex items-center gap-1">
                             Other Manual Deductions:
                             <input
                                type="text"
                                className="w-16 p-0.5 text-right text-xs border border-red-300 rounded bg-white font-normal text-black focus:outline-none focus:ring-1 focus:ring-red-500"
                                value={data.deductionArea}
                                onChange={(e) => updateField("deductionArea", e.target.value)}
                                placeholder="0.00"
                                onClick={(e) => e.stopPropagation()} 
                            />
                        </span>
                        <span>-{safeFloat(data.deductionArea)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-indigo-900 font-black uppercase text-xs">Final Net Plaster Area</span>
                        <span className="text-xl font-black text-indigo-700">{safeFloat(plasterStats.totalPlasterArea)} m²</span>
                    </div>
                </div>

            </div>
        )}
      </div>

      {/* --- Carpet Area Section (UNCHANGED) --- */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
          <span>Carpet Area (m²)</span>
          <span className="text-indigo-700 text-lg">{safeFloat(stats.netCarpet)}</span>
        </div>
        <div className="text-[10px] text-gray-500 bg-white p-2 rounded border border-indigo-100 flex flex-col gap-1 shadow-inner">
          <div className="flex justify-between"><span>Plinth Area:</span> <span>{safeFloat(stats.plinthA)}</span></div>
          <div className="flex justify-between text-red-500"><span>- Wall Footprint:</span> <span>-{safeFloat(stats.footprint)}</span></div>
          <div className="flex justify-between items-center text-red-500 border-t border-dashed pt-1">
            <span>- Other Deductions:</span>
            <input
              type="text"
              className="w-16 p-0.5 text-right text-xs border rounded bg-red-50"
              value={data.deductionCarpet}
              onChange={(e) => updateField("deductionCarpet", e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onSaveClick}
        className="w-full mt-4 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-shadow shadow-md flex items-center justify-center gap-2"
      >
        <Save size={18} /> Save {floorName} Data
      </button>
    </div>
  );
}