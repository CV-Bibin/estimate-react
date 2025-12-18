import React, { useState, useMemo } from 'react';
import { Box, Plus, Trash2, Calculator, AlertTriangle, Layers, Edit2, Info, Eye, EyeOff } from 'lucide-react';

export default function BeamLintelManager({ 
    openAreaBeams = [], 
    mainBeams = { concealed: [], drop: [] }, 
    lintels = { deductions: [], thickness: 0.15 }, 
    
    // --- COLUMN PROPS ---
    fetchedColumns = [],         // Raw list from Setup
    manualColumnDeductions = [], // Editable active list
    columnVolume = 0,            // Calculated total
    
    // Handlers
    onAddManualColumn,
    onUpdateManualColumn,
    onRemoveManualColumn,

    // Other Props...
    volConcealed = 0,
    volDrop = 0,
    volOpen = 0,
    beamVolume = 0, 
    lintelVolume = 0, 
    grossLintelVol = 0, 
    totalWallLength = 0,
    wallOptions = [0.23, 0.15, 0.10], 
    onAddMainBeam,
    onUpdateMainBeam, 
    onRemoveMainBeam,
    onUpdateOpenAreaBeam,
    onAddLintelDeduction,
    onUpdateLintelDeduction,
    onRemoveLintelDeduction,
    evaluateMath = (expression) => { try { if (!expression) return 0; const cleanExpr = String(expression).replace(/[^-()\d/*+.]/g, ''); return new Function('return ' + cleanExpr)() || 0; } catch (error) { return 0; } }
}) {
    
    const safeGross = parseFloat(grossLintelVol) || 0;
    const safeNet = parseFloat(lintelVolume) || 0;
    const deductionVolume = (safeGross - safeNet).toFixed(3);

    // 1. FILTER LOGIC: Only show Concealed Columns in Reference
    const concealedReference = useMemo(() => {
        return fetchedColumns.filter(col => 
            col.type === 'Conceiled' || col.type === 'Concealed'
        );
    }, [fetchedColumns]);

    const [showReference, setShowReference] = useState(true);

    return (
        <div className="bg-cyan-50 border border-cyan-200 p-5 rounded-xl shadow-sm space-y-6">
            <h4 className="text-sm font-bold text-cyan-900 border-b border-cyan-200 pb-2 flex items-center gap-2">
                <Box size={16}/> Structural Elements (Beams & Lintels)
            </h4>

            {/* ... (OPEN AREA BEAMS - No Change) ... */}
            {openAreaBeams.length > 0 && ( <div className="bg-white border-l-4 border-orange-400 p-4 rounded-r-lg shadow-sm mb-4"><div className="flex items-center gap-2 text-orange-700 mb-3"><AlertTriangle size={18} /><h5 className="text-sm font-bold uppercase tracking-wide">Support Reference: Setup Open Areas</h5></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">{openAreaBeams.map(oa => (<div key={oa.id} className="bg-orange-50 border border-orange-100 p-3 rounded flex flex-col gap-1"><div className="flex justify-between items-center border-b border-orange-200 pb-1 mb-1"><span className="text-xs font-bold text-orange-800">{oa.name}</span><span className="text-[10px] bg-white px-2 py-0.5 rounded text-orange-600 border border-orange-200 font-medium">Source: Project Setup</span></div><div className="flex justify-between text-[11px] text-orange-700"><span>{oa.details}</span> <span className="font-mono font-bold">Total Length: {evaluateMath(oa.l).toFixed(2)} m</span></div></div>))}</div></div> )}

            {/* ... (MAIN BEAMS - No Change) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cyan-100">
                <div className="space-y-3"><div className="flex justify-between items-center"><h5 className="text-xs font-bold text-cyan-700 uppercase tracking-tight">Beams parallel to the wall</h5><button onClick={() => onAddMainBeam('concealed')} className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-cyan-700 shadow-sm transition-all"><Plus size={10}/> Add Beam</button></div><div className="max-h-48 overflow-y-auto space-y-2 pr-1">{mainBeams.concealed.map((beam) => (<div key={beam.id} className="bg-white p-2 rounded border border-cyan-100 flex gap-2 items-center shadow-sm"><input type="text" className="flex-1 p-1 text-xs border rounded" value={beam.l} onChange={(e) => onUpdateMainBeam('concealed', beam.id, 'l', e.target.value)} placeholder="Length" /><input type="number" step="0.01" className="w-12 p-1 text-xs border rounded text-center" value={beam.b} onChange={(e) => onUpdateMainBeam('concealed', beam.id, 'b', e.target.value)} placeholder="W" /><input type="number" step="0.01" className="w-12 p-1 text-xs border rounded text-center" value={beam.d} onChange={(e) => onUpdateMainBeam('concealed', beam.id, 'd', e.target.value)} placeholder="D" /><button onClick={() => onRemoveMainBeam('concealed', beam.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div>))}</div></div>
                <div className="space-y-3"><div className="flex justify-between items-center"><h5 className="text-xs font-bold text-cyan-700 uppercase tracking-tight">Open Beams</h5><button onClick={() => onAddMainBeam('drop')} className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-cyan-700 shadow-sm transition-all"><Plus size={10}/> Add Beam</button></div><div className="max-h-48 overflow-y-auto space-y-2 pr-1">{mainBeams.drop.map((beam) => (<div key={beam.id} className="bg-white p-2 rounded border border-cyan-100 flex gap-2 items-center shadow-sm"><input type="text" className="flex-1 p-1 text-xs border rounded" value={beam.l} onChange={(e) => onUpdateMainBeam('drop', beam.id, 'l', e.target.value)} placeholder="Length" /><input type="number" step="0.01" className="w-12 p-1 text-xs border rounded text-center" value={beam.b} onChange={(e) => onUpdateMainBeam('drop', beam.id, 'b', e.target.value)} placeholder="W" /><input type="number" step="0.01" className="w-12 p-1 text-xs border rounded text-center" value={beam.d} onChange={(e) => onUpdateMainBeam('drop', beam.id, 'd', e.target.value)} placeholder="D" /><button onClick={() => onRemoveMainBeam('drop', beam.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div>))}</div></div>
            </div>
            <div className="bg-cyan-100 p-2.5 rounded text-[11px] font-bold text-cyan-900 flex justify-between items-center mt-2 border border-cyan-200"><div className="flex gap-4"><span>Concealed: <span className="text-cyan-700">{volConcealed} m³</span></span><span className="text-gray-400">|</span><span>Drop: <span className="text-cyan-700">{volDrop} m³</span></span>{volOpen > 0 && <><span className="text-gray-400">|</span><span>Open Area: <span className="text-cyan-700">{volOpen} m³</span></span></>}</div><span className="text-sm bg-white px-2 py-0.5 rounded shadow-sm">Total Beam Vol: {beamVolume} m³</span></div>

            {/* ... (LINTEL SECTION - No Change) ... */}
            <div className="bg-white p-4 rounded-lg border border-cyan-200 shadow-inner mt-4">
                <div className="flex justify-between items-center mb-3"><h5 className="text-xs font-bold text-cyan-700 uppercase flex items-center gap-2"><Calculator size={14}/> Lintel Portion Adjustments (0.15m Depth)</h5><button onClick={onAddLintelDeduction} className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-red-100"><Plus size={10}/> Add Deduction</button></div>
                <div className="space-y-4"><div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-dashed border-gray-300"><span className="text-xs text-gray-600 font-medium">Total Wall Length (Current Schedule):</span><span className="text-sm font-mono font-bold text-blue-700">{totalWallLength} m</span></div><div className="space-y-2"><div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-gray-400 uppercase"><div className="col-span-6">Deduction Length</div><div className="col-span-3 text-center">Wall Width</div><div className="col-span-3 text-right">Volume</div></div>{lintels.deductions && lintels.deductions.map((deduction, idx) => { const length = evaluateMath(deduction.l); const width = parseFloat(deduction.b || 0.23); const vol = length * width * 0.15; return (<div key={deduction.id} className="grid grid-cols-12 gap-2 items-center bg-red-50 p-1.5 rounded border border-red-100"><div className="col-span-6 flex gap-1 items-center"><input type="text" className="w-full p-1 text-xs border border-red-200 rounded focus:ring-1 focus:ring-red-300 outline-none" value={deduction.l} onChange={(e) => onUpdateLintelDeduction(deduction.id, 'l', e.target.value)} placeholder="e.g. 2+2" /><button onClick={() => onRemoveLintelDeduction(deduction.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={12}/></button></div><div className="col-span-3"><select className="w-full p-1 text-xs border border-red-200 rounded text-center bg-white" value={deduction.b} onChange={(e) => onUpdateLintelDeduction(deduction.id, 'b', e.target.value)}>{wallOptions.map(w => (<option key={w} value={w}>{w}</option>))}{!wallOptions.includes(parseFloat(deduction.b)) && <option value={deduction.b}>{deduction.b}</option>}</select></div><div className="col-span-3 text-right text-xs font-bold text-red-700">-{vol.toFixed(3)}</div></div>); })}{(!lintels.deductions || lintels.deductions.length === 0) && <div className="text-center text-[10px] text-gray-400 italic py-2">No deductions added. All walls assumed to have lintels.</div>}</div><div className="bg-gray-100 p-2 rounded text-xs font-bold text-gray-800 flex justify-between items-center border border-gray-200"><span className="text-gray-500 font-medium">Net Lintel Volume:</span><div className="flex items-center gap-1"><span className="text-gray-400 text-[10px] font-normal mr-1">(Gross {safeGross.toFixed(3)} - Deduct {deductionVolume}) =</span><span className="text-base text-cyan-700">{safeNet.toFixed(3)} m³</span></div></div></div>
            </div>

            {/* --- COLUMN DEDUCTION SECTION --- */}
            <div className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm mt-4">
                <div className="flex justify-between items-center mb-3 border-b pb-2 border-indigo-100">
                    <h5 className="text-xs font-bold text-indigo-700 uppercase flex items-center gap-2">
                        <Layers size={14}/> Column Deductions
                    </h5>
                    <div className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100">
                        Total Deduct: -{columnVolume} m³
                    </div>
                </div>

                {/* 1. REFERENCE: ONLY CONCEALED COLUMNS (FETCHED) */}
                {concealedReference.length > 0 ? (
                    <div className="mb-4 animate-fade-in">
                        <div onClick={() => setShowReference(!showReference)} className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-gray-400 hover:text-indigo-600 mb-2 select-none border-b border-gray-100 pb-1 w-full">
                            {showReference ? <EyeOff size={12}/> : <Eye size={12}/>} 
                            {showReference ? "Hide" : "Show"} Fetched Concealed Columns (Reference)
                        </div>
                        
                        {showReference && (
                            <div className="bg-gray-50 rounded border border-gray-200 p-2 opacity-80 mb-4 shadow-inner">
                                <div className="grid grid-cols-12 gap-1 text-[9px] font-bold text-gray-500 uppercase mb-1 px-1">
                                    <div className="col-span-4">Setup Name</div>
                                    <div className="col-span-3 text-center">Actual Size</div>
                                    <div className="col-span-2 text-center">Nos</div>
                                    <div className="col-span-3 text-right">Type</div>
                                </div>
                                <div className="space-y-1">
                                    {concealedReference.map((col, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-1 text-[10px] text-gray-600 border-b border-gray-100 last:border-0 py-1 px-1 italic">
                                            <div className="col-span-4 truncate font-medium">{col.name}</div>
                                            <div className="col-span-3 text-center">{(col.l || col.length)} x {(col.b || col.width)}</div>
                                            <div className="col-span-2 text-center">{col.nos || col.count}</div>
                                            <div className="col-span-3 text-right text-indigo-500 font-bold">{col.type}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Show this message if fetchedColumns exist but none are concealed
                    fetchedColumns.length > 0 && (
                        <div className="mb-4 text-[10px] text-orange-500 italic bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-2">
                           <AlertTriangle size={12}/> Columns found in setup, but none marked as "Concealed". Manual entry required below.
                        </div>
                    )
                )}

                {/* 2. MANUAL DEDUCTION ENTRY (ACTIVE) */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center bg-indigo-50 p-2 rounded border border-indigo-100 shadow-sm">
                        <span className="flex items-center gap-1 font-bold text-[10px] text-indigo-800 uppercase tracking-tight">
                            <Edit2 size={10}/> Deductions Entry (Adjust to Wall Width)
                        </span>
                        
                        {/* BUTTON FIX: Added type='button' and event prevention */}
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if(onAddManualColumn) onAddManualColumn();
                            }} 
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-indigo-700 flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer z-10"
                        >
                            <Plus size={12}/> Add Deduction Entry
                        </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1 py-1">
                         <div className="col-span-3">Label</div>
                         <div className="col-span-2 text-center">Length (m)</div>
                         <div className="col-span-2 text-center text-red-500">Deduct Width</div>
                         <div className="col-span-1 text-center">Ht</div>
                         <div className="col-span-1 text-center">Nos</div>
                         <div className="col-span-2 text-right pr-2">Volume</div>
                         <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {manualColumnDeductions.length > 0 ? (
                            manualColumnDeductions.map(col => {
                                const len = evaluateMath(col.l);
                                const wid = parseFloat(col.b) || 0;
                                const ht = parseFloat(col.h) || 3.0;
                                const nos = parseFloat(col.nos) || 1;
                                const vol = (len * wid * ht * nos).toFixed(3);

                                return (
                                    <div key={col.id} className="grid grid-cols-12 gap-2 items-center bg-white p-1.5 rounded border border-gray-100 hover:border-indigo-200 shadow-sm transition-all group">
                                        <div className="col-span-3">
                                            <input type="text" className="w-full p-1 text-[11px] border border-gray-200 rounded focus:border-indigo-300 outline-none font-bold text-gray-700" value={col.name} onChange={(e) => onUpdateManualColumn(col.id, 'name', e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="text" className="w-full p-1 text-[11px] border border-gray-200 rounded text-center" value={col.l} onChange={(e) => onUpdateManualColumn(col.id, 'l', e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" step="0.01" className="w-full p-1 text-[11px] border border-red-100 bg-red-50 text-red-700 font-bold rounded text-center focus:ring-1 focus:ring-red-400 outline-none" value={col.b} onChange={(e) => onUpdateManualColumn(col.id, 'b', e.target.value)} />
                                        </div>
                                        <div className="col-span-1">
                                            <input type="number" step="0.1" className="w-full p-1 text-[11px] border border-gray-200 rounded text-center" value={col.h} onChange={(e) => onUpdateManualColumn(col.id, 'h', e.target.value)} />
                                        </div>
                                        <div className="col-span-1">
                                            <input type="number" className="w-full p-1 text-[11px] border border-gray-200 rounded text-center font-bold" value={col.nos} onChange={(e) => onUpdateManualColumn(col.id, 'nos', e.target.value)} />
                                        </div>
                                        <div className="col-span-2 text-right text-xs font-bold text-red-600 pr-2">
                                            -{vol}
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <button onClick={() => onRemoveManualColumn(col.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-[10px] text-gray-400 italic py-4 bg-gray-50 border border-dashed rounded">
                                No deduction entries. Click "Add Deduction Entry" to start.
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="mt-3 text-[10px] text-gray-400 flex flex-col gap-1 italic border-t border-dashed border-gray-200 pt-2 px-1">
                    <div className="flex items-center gap-1">
                        <Info size={12}/> <strong>Note:</strong> Open/Sit-out columns are ignored. Adjust "Deduct Width" to wall thickness (e.g. 0.23m).
                    </div>
                </div>
            </div>
        </div>
    );
}