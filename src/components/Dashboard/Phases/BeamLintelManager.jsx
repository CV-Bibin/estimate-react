import React from 'react';
import { Box, Plus, Trash2, Calculator, Info, AlertTriangle } from 'lucide-react';

export default function BeamLintelManager({ 
    openAreaBeams = [], 
    mainBeams = { concealed: [], drop: [] }, 
    lintels = { deductions: [], thickness: 0.15 }, 
    totalWallLength = 0, 
    volConcealed = 0,
    volDrop = 0,
    volOpen = 0,
    beamVolume = 0, 
    lintelVolume = 0, 
    grossLintelVol = 0, 
    wallOptions = [0.23, 0.15, 0.10], 
    onAddMainBeam,
    onUpdateMainBeam, 
    onRemoveMainBeam,
    onUpdateOpenAreaBeam,
    onAddLintelDeduction,
    onUpdateLintelDeduction,
    onRemoveLintelDeduction,
    evaluateMath = (expression) => { 
        try {
            if (expression === undefined || expression === null) return 0;
            // FIX: Force String() before replace to prevent crash if a number is passed
            const cleanExpr = String(expression).replace(/[^-()\d/*+.]/g, '');
            if (!cleanExpr) return 0;
            return new Function('return ' + cleanExpr)() || 0;
        } catch (error) { return 0; }
    }
}) {
    
    // FIX: Safe calculation for the footer (prevents NaN/crash)
    const safeGross = parseFloat(grossLintelVol) || 0;
    const safeNet = parseFloat(lintelVolume) || 0;
    const deductionVolume = (safeGross - safeNet).toFixed(3);

    return (
        <div className="bg-cyan-50 border border-cyan-200 p-5 rounded-xl shadow-sm space-y-6">
            <h4 className="text-sm font-bold text-cyan-900 border-b border-cyan-200 pb-2 flex items-center gap-2">
                <Box size={16}/> Structural Elements (Beams & Lintels)
            </h4>

            {/* OPEN AREA BEAMS */}
            {openAreaBeams.length > 0 && (
                <div className="bg-white border-l-4 border-orange-400 p-4 rounded-r-lg shadow-sm mb-4">
                    <div className="flex items-center gap-2 text-orange-700 mb-3">
                        <AlertTriangle size={18} />
                        <h5 className="text-sm font-bold uppercase tracking-wide">Support Reference: Setup Open Areas</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {openAreaBeams.map(oa => (
                            <div key={oa.id} className="bg-orange-50 border border-orange-100 p-3 rounded flex flex-col gap-1">
                                <div className="flex justify-between items-center border-b border-orange-200 pb-1 mb-1">
                                    <span className="text-xs font-bold text-orange-800">{oa.name}</span>
                                    <span className="text-[10px] bg-white px-2 py-0.5 rounded text-orange-600 border border-orange-200 font-medium">Source: Project Setup</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-orange-700">
                                    <span>{oa.details}</span> 
                                    <span className="font-mono font-bold">Total Length: {evaluateMath(oa.l).toFixed(2)} m</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BEAM ENTRY */}
            {openAreaBeams.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-cyan-100">
                    <h5 className="text-xs font-bold text-cyan-700 uppercase">Supportive Beams for Open Areas</h5>
                    <div className="space-y-2">
                        {openAreaBeams.map(beam => (
                            <div key={beam.id} className="bg-white p-3 rounded border border-cyan-100 grid grid-cols-4 gap-3">
                                <div><label className="text-[9px] text-gray-500 block uppercase font-bold mb-1">{beam.name} Length (m)</label><input type="text" className="w-full p-1 text-xs border rounded font-bold" value={beam.l} onChange={(e) => onUpdateOpenAreaBeam(beam.id, 'l', e.target.value)} /></div>
                                <div><label className="text-[9px] text-gray-500 block uppercase font-bold mb-1">Width (m)</label><input type="number" step="0.01" className="w-full p-1 text-xs border rounded" value={beam.b} onChange={(e) => onUpdateOpenAreaBeam(beam.id, 'b', e.target.value)} /></div>
                                <div><label className="text-[9px] text-gray-500 block uppercase font-bold mb-1">Depth (m)</label><input type="number" step="0.01" className="w-full p-1 text-xs border rounded" value={beam.d} onChange={(e) => onUpdateOpenAreaBeam(beam.id, 'd', e.target.value)} /></div>
                                <div><label className="text-[9px] text-gray-500 block uppercase font-bold mb-1">Ht from Floor (m)</label><input type="number" step="0.01" className="w-full p-1 text-xs border rounded bg-yellow-50" value={beam.heightFromFloor} onChange={(e) => onUpdateOpenAreaBeam(beam.id, 'heightFromFloor', e.target.value)} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MAIN BEAMS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cyan-100">
                <div className="space-y-3">
                    <div className="flex justify-between items-center"><h5 className="text-xs font-bold text-cyan-700 uppercase tracking-tight">Main Concealed Beams</h5><button onClick={() => onAddMainBeam('concealed')} className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-cyan-700 shadow-sm transition-all"><Plus size={10}/> Add Beam</button></div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {mainBeams.concealed.map((beam) => (
                            <div key={beam.id} className="bg-white p-2 rounded border border-cyan-100 flex gap-2 items-center shadow-sm">
                                <input type="text" className="flex-1 p-1 text-xs border rounded" value={beam.l} onChange={(e) => onUpdateMainBeam('concealed', beam.id, 'l', e.target.value)} placeholder="Length" />
                                <input type="number" step="0.01" className="w-12 p-1 text-xs border rounded text-center" value={beam.b} onChange={(e) => onUpdateMainBeam('concealed', beam.id, 'b', e.target.value)} placeholder="W" />
                                <input type="number" step="0.01" className="w-12 p-1 text-xs border rounded text-center" value={beam.d} onChange={(e) => onUpdateMainBeam('concealed', beam.id, 'd', e.target.value)} placeholder="D" />
                                <button onClick={() => onRemoveMainBeam('concealed', beam.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center"><h5 className="text-xs font-bold text-cyan-700 uppercase tracking-tight">Main Drop Beams</h5><button onClick={() => onAddMainBeam('drop')} className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-cyan-700 shadow-sm transition-all"><Plus size={10}/> Add Beam</button></div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {mainBeams.drop.map((beam) => (
                            <div key={beam.id} className="bg-white p-2 rounded border border-cyan-100 flex gap-2 items-center shadow-sm">
                                <input type="text" className="flex-1 p-1 text-xs border rounded" value={beam.l} onChange={(e) => onUpdateMainBeam('drop', beam.id, 'l', e.target.value)} placeholder="Length" />
                                <input type="number" step="0.01" className="w-12 p-1 text-xs border rounded text-center" value={beam.b} onChange={(e) => onUpdateMainBeam('drop', beam.id, 'b', e.target.value)} placeholder="W" />
                                <input type="number" step="0.01" className="w-12 p-1 text-xs border rounded text-center" value={beam.d} onChange={(e) => onUpdateMainBeam('drop', beam.id, 'd', e.target.value)} placeholder="D" />
                                <button onClick={() => onRemoveMainBeam('drop', beam.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-cyan-100 p-2.5 rounded text-[11px] font-bold text-cyan-900 flex justify-between items-center mt-2 border border-cyan-200">
                <div className="flex gap-4">
                    <span>Concealed: <span className="text-cyan-700">{volConcealed} m³</span></span><span className="text-gray-400">|</span>
                    <span>Drop: <span className="text-cyan-700">{volDrop} m³</span></span>
                    {volOpen > 0 && <><span className="text-gray-400">|</span><span>Open Area: <span className="text-cyan-700">{volOpen} m³</span></span></>}
                </div>
                <span className="text-sm bg-white px-2 py-0.5 rounded shadow-sm">Total: {beamVolume} m³</span>
            </div>

            {/* LINTEL SECTION */}
            <div className="bg-white p-4 rounded-lg border border-cyan-200 shadow-inner mt-4">
                <div className="flex justify-between items-center mb-3">
                    <h5 className="text-xs font-bold text-cyan-700 uppercase flex items-center gap-2">
                        <Calculator size={14}/> Lintel Portion Adjustments (0.15m Depth)
                    </h5>
                    <button onClick={onAddLintelDeduction} className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-red-100">
                        <Plus size={10}/> Add Deduction
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-dashed border-gray-300">
                        <span className="text-xs text-gray-600 font-medium">Total Wall Length (Current Schedule):</span>
                        <span className="text-sm font-mono font-bold text-blue-700">{totalWallLength} m</span>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-gray-400 uppercase">
                            <div className="col-span-6">Deduction Length</div>
                            <div className="col-span-3 text-center">Wall Width</div>
                            <div className="col-span-3 text-right">Volume</div>
                        </div>

                        {lintels.deductions && lintels.deductions.map((deduction) => {
                            const length = evaluateMath(deduction.l);
                            const width = parseFloat(deduction.b || 0.23);
                            const vol = length * width * 0.15; 

                            return (
                                <div key={deduction.id} className="grid grid-cols-12 gap-2 items-center bg-red-50 p-1.5 rounded border border-red-100">
                                    <div className="col-span-6 flex gap-1 items-center">
                                        <input 
                                            type="text" 
                                            className="w-full p-1 text-xs border border-red-200 rounded focus:ring-1 focus:ring-red-300 outline-none" 
                                            value={deduction.l} 
                                            onChange={(e) => onUpdateLintelDeduction(deduction.id, 'l', e.target.value)} 
                                            placeholder="e.g. 2+2" 
                                        />
                                        <button onClick={() => onRemoveLintelDeduction(deduction.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={12}/></button>
                                    </div>
                                    <div className="col-span-3">
                                        <select 
                                            className="w-full p-1 text-xs border border-red-200 rounded text-center bg-white"
                                            value={deduction.b} 
                                            onChange={(e) => onUpdateLintelDeduction(deduction.id, 'b', e.target.value)}
                                        >
                                            {wallOptions.map(w => (
                                                <option key={w} value={w}>{w}</option>
                                            ))}
                                            {!wallOptions.includes(parseFloat(deduction.b)) && <option value={deduction.b}>{deduction.b}</option>}
                                        </select>
                                    </div>
                                    <div className="col-span-3 text-right text-xs font-bold text-red-700">
                                        -{vol.toFixed(3)}
                                    </div>
                                </div>
                            );
                        })}
                        {(!lintels.deductions || lintels.deductions.length === 0) && (
                            <div className="text-center text-[10px] text-gray-400 italic py-2">No deductions added. All walls assumed to have lintels.</div>
                        )}
                    </div>
                    
                    <div className="bg-gray-100 p-2 rounded text-xs font-bold text-gray-800 flex justify-between items-center border border-gray-200">
                        <span className="text-gray-500 font-medium">Net Lintel Volume:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-[10px] font-normal mr-1">
                                (Gross {safeGross.toFixed(3)} - Deduct {deductionVolume}) =
                            </span>
                            <span className="text-base text-cyan-700">{safeNet.toFixed(3)} m³</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}