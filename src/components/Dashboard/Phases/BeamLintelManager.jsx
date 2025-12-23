import React from 'react';
import { Box, Plus, Trash2, Calculator, AlertTriangle, Settings, ArrowDownRight } from 'lucide-react';

export default function BeamLintelManager({ 
    openAreaBeams = [], 
    mainBeams = { concealed: [], drop: [] }, 
    lintels = { deductions: [], thickness: 0.15 }, 
    
    // Props for calculations
    volConcealed = 0,
    volDrop = 0,
    volOpen = 0,
    beamVolume = 0, 
    lintelVolume = 0, 
    grossLintelVol = 0, 
    totalWallLength = 0,
    wallOptions = [0.23, 0.15, 0.10], 

    // Handlers
    onAddMainBeam,
    onUpdateMainBeam, 
    onRemoveMainBeam,
    
    // Open Area Handlers
    onUpdateOpenAreaBeam, 
    onRemoveOpenAreaBeam, 
    
    onAddLintelDeduction,
    onUpdateLintelDeduction,
    onRemoveLintelDeduction,
    
    evaluateMath = (expression) => { 
        try { 
            if (!expression) return 0; 
            const cleanExpr = String(expression).replace(/[^-()\d/*+.]/g, ''); 
            return new Function('return ' + cleanExpr)() || 0; 
        } catch (error) { return 0; } 
    }
}) {
    
    const safeGross = parseFloat(grossLintelVol) || 0;
    const safeNet = parseFloat(lintelVolume) || 0;
    const deductionVolume = (safeGross - safeNet).toFixed(3);

    return (
        <div className="bg-cyan-50 border border-cyan-200 p-5 rounded-xl shadow-sm space-y-6">
            <h4 className="text-sm font-bold text-cyan-900 border-b border-cyan-200 pb-2 flex items-center gap-2">
                <Box size={16}/> Structural Elements (Beams & Lintels)
            </h4>

            {/* --- OPEN AREA BEAMS (Reference + Editable Beam) --- */}
            {openAreaBeams.length > 0 && ( 
                <div className="bg-white border-l-4 border-orange-400 p-4 rounded-r-lg shadow-sm mb-4">
                    <div className="flex justify-between items-center mb-4 text-orange-800 border-b border-orange-100 pb-2">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} />
                            <h5 className="text-sm font-bold uppercase tracking-wide">Support Reference: Setup Open Areas</h5>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {openAreaBeams.map(oa => (
                            <div key={oa.id} className="bg-orange-50 border border-orange-200 rounded-lg p-0 overflow-hidden shadow-sm">
                                
                                {/* 1. REFERENCE INFO (Like your original image) */}
                                <div className="p-3 bg-orange-100/50 border-b border-orange-200 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-orange-900">{oa.name}</span>
                                            <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-orange-600 border border-orange-200 shadow-sm">Source: Setup</span>
                                        </div>
                                        {/* Display the Touching/Free details string */}
                                        <div className="text-[11px] text-orange-700 font-medium">
                                            {oa.details || "Details unavailable"} 
                                        </div>
                                    </div>
                                </div>

                                {/* 2. AUTO-CREATED BEAM INPUTS */}
                                <div className="p-3 bg-white">
                                    <div className="flex items-center gap-2 mb-1 text-[10px] text-gray-400 uppercase font-bold">
                                        <ArrowDownRight size={12} className="text-orange-400"/>
                                        <span>Auto-Generated Beam Properties</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {/* Length Input */}
                                        <div className="flex-1">
                                            <label className="text-[9px] text-gray-500 font-bold block mb-0.5 pl-1">Length (m)</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-2 text-xs border border-orange-300 rounded focus:border-orange-500 outline-none bg-orange-50/30" 
                                                value={oa.l} 
                                                onChange={(e) => onUpdateOpenAreaBeam(oa.id, 'l', e.target.value)} 
                                                placeholder="Length" 
                                            />
                                        </div>

                                        {/* Width Input */}
                                        <div className="w-16">
                                            <label className="text-[9px] text-gray-500 font-bold block mb-0.5 text-center">Width</label>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                className="w-full p-2 text-xs border border-orange-300 rounded text-center outline-none bg-orange-50/30" 
                                                value={oa.b} 
                                                onChange={(e) => onUpdateOpenAreaBeam(oa.id, 'b', e.target.value)} 
                                            />
                                        </div>

                                        {/* Depth Input */}
                                        <div className="w-16">
                                            <label className="text-[9px] text-gray-500 font-bold block mb-0.5 text-center">Depth</label>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                className="w-full p-2 text-xs border border-orange-300 rounded text-center outline-none bg-orange-50/30" 
                                                value={oa.d} 
                                                onChange={(e) => onUpdateOpenAreaBeam(oa.id, 'd', e.target.value)} 
                                            />
                                        </div>

                                        {/* Delete Action */}
                                        <div className="flex flex-col justify-end pt-4">
                                            <button 
                                                onClick={() => onRemoveOpenAreaBeam(oa.id)} 
                                                className="bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded shadow-sm transition-all"
                                                title="Delete this auto-generated beam"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> 
            )}

            {/* --- MANUAL MAIN BEAMS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cyan-100">
                {/* Wall Parallel Beams */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h5 className="text-xs font-bold text-cyan-700 uppercase tracking-tight">Beams parallel to the wall (deduction for brick wall)</h5>
                        <button onClick={() => onAddMainBeam('concealed')} className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-cyan-700 shadow-sm transition-all"><Plus size={10}/> Add Beam</button>
                    </div>
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

                {/* Drop Beams */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h5 className="text-xs font-bold text-cyan-700 uppercase tracking-tight">Manual Open Beams (Drop)</h5>
                        <button onClick={() => onAddMainBeam('drop')} className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-cyan-700 shadow-sm transition-all"><Plus size={10}/> Add Beam</button>
                    </div>
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

            {/* Beam Stats Summary */}
            <div className="bg-cyan-100 p-2.5 rounded text-[11px] font-bold text-cyan-900 flex justify-between items-center mt-2 border border-cyan-200">
                <div className="flex gap-4">
                    <span>Concealed: <span className="text-cyan-700">{volConcealed} m³</span></span>
                    <span className="text-gray-400">|</span>
                    <span>Drop: <span className="text-cyan-700">{volDrop} m³</span></span>
                    {volOpen > 0 && <><span className="text-gray-400">|</span><span>Auto Open: <span className="text-cyan-700">{volOpen} m³</span></span></>}
                </div>
                <span className="text-sm bg-white px-2 py-0.5 rounded shadow-sm">Total Beam Vol: {beamVolume} m³</span>
            </div>

            {/* --- LINTEL SECTION --- */}
            <div className="bg-white p-4 rounded-lg border border-cyan-200 shadow-inner mt-4">
                <div className="flex justify-between items-center mb-3">
                    <h5 className="text-xs font-bold text-cyan-700 uppercase flex items-center gap-2"><Calculator size={14}/> Lintel Portion Adjustments (0.15m Depth)</h5>
                    <button onClick={onAddLintelDeduction} className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-red-100"><Plus size={10}/> Add Deduction</button>
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
                                        <input type="text" className="w-full p-1 text-xs border border-red-200 rounded focus:ring-1 focus:ring-red-300 outline-none" value={deduction.l} onChange={(e) => onUpdateLintelDeduction(deduction.id, 'l', e.target.value)} placeholder="e.g. 2+2" />
                                        <button onClick={() => onRemoveLintelDeduction(deduction.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={12}/></button>
                                    </div>
                                    <div className="col-span-3">
                                        <select className="w-full p-1 text-xs border border-red-200 rounded text-center bg-white" value={deduction.b} onChange={(e) => onUpdateLintelDeduction(deduction.id, 'b', e.target.value)}>
                                            {wallOptions.map(w => (<option key={w} value={w}>{w}</option>))}
                                            {!wallOptions.includes(parseFloat(deduction.b)) && <option value={deduction.b}>{deduction.b}</option>}
                                        </select>
                                    </div>
                                    <div className="col-span-3 text-right text-xs font-bold text-red-700">-{vol.toFixed(3)}</div>
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
                            <span className="text-gray-400 text-[10px] font-normal mr-1">(Gross {safeGross.toFixed(3)} - Deduct {deductionVolume}) =</span>
                            <span className="text-base text-cyan-700">{safeNet.toFixed(3)} m³</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}