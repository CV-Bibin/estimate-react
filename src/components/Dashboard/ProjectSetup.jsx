import React from 'react';
import { Wand2, Layers, Plus, Trash2, Building2, BrickWall, LayoutDashboard, AlertCircle, Calculator, Sun, Info, CheckSquare, Square, Home } from 'lucide-react';

export default function ProjectSetup({ globalParams, setGlobalParams, onApply }) {
  
  if (!globalParams) return null;

  // --- HELPER FUNCTIONS ---
  const handleMathInput = (val) => val.replace(/[^0-9+\-*/. ]/g, ''); 
  
  const evaluateMath = (val) => {
    try {
      if (!val) return 0;
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + val)(); 
      return parseFloat(result) || 0;
    } catch (e) { return 0; }
  };

  const getZeroStyle = (val) => {
    const calculated = evaluateMath(val);
    if (!val || calculated === 0) return "text-red-600 font-bold bg-red-50 border-red-300 ring-1 ring-red-200";
    return "text-gray-800 font-bold border-gray-200 focus:border-blue-300";
  };
  
  // --- 1. SAFETY & DESTRUCTURING ---
  const params = globalParams || {};
  const {
    extLen = '', intLen = '', extWidth = 0.23, intWidth = 0.23,
    numFloors = 1, foundationType = 'RR', floorNames = ['Ground Floor'],
    customWalls = [], openAreas = [], columnGroups = []
  } = params;

  const isRCC = foundationType === 'RCC';
  const isColumnMissing = isRCC && columnGroups.length === 0;
  const canApply = !isColumnMissing;

  // --- 2. CALCULATIONS ---
  const valExt = evaluateMath(extLen) || 0;
  const valInt = evaluateMath(intLen) || 0;

  // LOGIC 1: Sum of Custom Walls that CONTRIBUTE to Plinth (Not Exempt)
  // This is used for the Foundation Length Calculation
  const plinthRelevantCustomWallSum = customWalls.reduce((sum, w) => {
      if (w.isPlinthExempt) return sum; // Skip if exempt
      return sum + (parseFloat(w?.length) || 0);
  }, 0);

  // LOGIC 2: Total Wall Length (For display only - Includes ALL walls)
  const totalCustomWallSum = customWalls.reduce((sum, w) => sum + (parseFloat(w?.length) || 0), 0);
  const totalEnclosedWallLength = (valExt + valInt + totalCustomWallSum).toFixed(2);
  
  const structuralOpenLen = openAreas.reduce((sum, a) => {
      // Logic: Use Math evaluator on freeLen
      return a.includeInPlinth ? sum + evaluateMath(a.freeLen) : sum;
  }, 0);
  
  // UPDATED FOUNDATION LENGTH: Uses plinthRelevantCustomWallSum instead of total custom sum
  const totalFoundationLength = (valExt + valInt + plinthRelevantCustomWallSum + structuralOpenLen).toFixed(2);
  const totalCols = columnGroups.reduce((sum, g) => sum + (parseInt(g?.count) || 0), 0);

  const updateState = (updates) => setGlobalParams({ ...params, ...updates });

  // --- 3. AUTO-SIZING LOGIC (Same as before) ---
  const getSuggestedSizes = (floorsInput) => {
    const floors = parseInt(floorsInput) || 1;
    if (floors <= 1) return { f: {l: 1.0, b: 1.0, d: 1.2}, c: {l: 0.23, b: 0.23} }; 
    if (floors === 2) return { f: {l: 1.2, b: 1.2, d: 1.5}, c: {l: 0.23, b: 0.30} }; 
    if (floors === 3) return { f: {l: 1.5, b: 1.5, d: 1.5}, c: {l: 0.30, b: 0.30} }; 
    return { f: {l: 1.8, b: 1.8, d: 1.8}, c: {l: 0.30, b: 0.45} }; 
  };
  const applyAutoSizes = () => {
    const suggestions = getSuggestedSizes(numFloors);
    const updatedCols = columnGroups.map(col => {
        if(col.type === 'Conceiled') { return { ...col, f_l: suggestions.f.l, f_b: suggestions.f.b, f_d: suggestions.f.d, c_l: suggestions.c.l, c_b: suggestions.c.b }; }
        return col;
    });
    updateState({ columnGroups: updatedCols });
    alert(`Updated Main Columns for G+${numFloors - 1} Structure.`);
  };

  // --- 4. HANDLERS ---

  // Floors Change
  const handleFloorCountChange = (val) => {
    const count = parseInt(val) || 1;
    const newNames = [...floorNames];
    
    if (count > newNames.length) {
        for (let i = newNames.length; i < count; i++) {
            newNames.push(i === 0 ? 'Ground Floor' : i === 1 ? 'First Floor' : `Floor ${i}`);
        }
    } else {
        newNames.length = count;
    }
    
    const standards = getSuggestedSizes(count);
    const updatedColumns = columnGroups.map(grp => {
        if (grp.type === 'Conceiled' || isRCC) return { ...grp, f_l: standards.f.l, f_b: standards.f.b, f_d: standards.f.d, c_l: standards.c.l, c_b: standards.c.b };
        return grp;
    });
    updateState({ numFloors: count, floorNames: newNames, columnGroups: updatedColumns });
  };
  const updateFloorName = (index, newName) => {
      const newNames = [...floorNames];
      newNames[index] = newName;
      updateState({ floorNames: newNames });
  };
  
  // Walls (UPDATED WITH PLINTH EXEMPT FLAG)
  const addCustomWall = () => updateState({ 
      customWalls: [...customWalls, { 
          id: Date.now(), 
          name: 'Partition Wall', 
          length: 0, 
          width: 0.15,
          isPlinthExempt: false // Default: Included in Plinth
      }] 
  });
  
  const updateCustomWall = (id, field, value) => {
      updateState({ customWalls: customWalls.map(w => w.id === id ? { ...w, [field]: value } : w) });
  };

  // NEW HANDLER: Toggle Plinth Exempt
  const togglePlinthExempt = (id) => {
      updateState({ 
          customWalls: customWalls.map(w => w.id === id ? { ...w, isPlinthExempt: !w.isPlinthExempt } : w) 
      });
  };

  const removeCustomWall = (id) => updateState({ customWalls: customWalls.filter(w => w.id !== id) });

  // Open Areas (SIMPLIFIED BACK TO BASICS)
  const addOpenArea = () => updateState({ 
      openAreas: [...openAreas, { id: Date.now(), type: 'Sit-out', touchingLen: '', freeLen: '', hasRoof: true, includeInPlinth: true }] 
  });
  const updateOpenArea = (id, field, value) => {
      let updates = {};
      const cleanValue = (field === 'touchingLen' || field === 'freeLen') ? handleMathInput(value) : value;

      updates[field] = cleanValue;

      if (field === 'type') {
          // Logic: Courtyard = No Roof. Car Porch/Open Area = Non-Structural.
          const isCourtyard = (value === 'Courtyard');
          const isStructural = (value !== 'Car Porch' && value !== 'Open Area'); 
          
          updates.hasRoof = !isCourtyard;
          updates.includeInPlinth = isStructural;
      }
      
      updateState({ openAreas: openAreas.map(a => a.id === id ? { ...a, ...updates } : a) });
  };
  const togglePlinthInclude = (id) => { updateState({ openAreas: openAreas.map(a => a.id === id ? { ...a, includeInPlinth: !a.includeInPlinth } : a) }); };
  const toggleRoofInclude = (id) => { updateState({ openAreas: openAreas.map(a => a.id === id ? { ...a, hasRoof: !a.hasRoof } : a) }); };
  const removeOpenArea = (id) => updateState({ openAreas: openAreas.filter(a => a.id !== id) });

  // Columns
  const addColumnGroup = (type) => {
    const isMain = type === 'Conceiled';
    const defaults = getSuggestedSizes(numFloors);
    const newGroup = { id: Date.now(), type, name: isMain ? 'Conceiled Column' : 'Open Column (RCC)', count: 1, f_l: isMain ? defaults.f.l : 1.0, f_b: isMain ? defaults.f.b : 1.0, f_d: isMain ? defaults.f.d : 1.2, c_l: isMain ? defaults.c.l : 0.23, c_b: isMain ? defaults.c.b : 0.23 };
    updateState({ columnGroups: [...columnGroups, newGroup] });
  };
  const updateGroup = (id, field, value) => updateState({ columnGroups: columnGroups.map(g => g.id === id ? { ...g, [field]: value } : g) });
  const removeGroup = (id) => updateState({ columnGroups: columnGroups.filter(g => g.id !== id) });


  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-10 shadow-xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 opacity-50 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <div><h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Wand2 className="text-blue-600" size={24} /> Project Configuration</h3><p className="text-sm text-gray-500 mt-1">Red highlights indicate 0 or missing values.</p></div>
            {isColumnMissing && (<div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold border border-red-100 animate-pulse"><AlertCircle size={14} /> Add Columns Required</div>)}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: Dimensions */}
            <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm relative">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4"><LayoutDashboard size={16} /> Enclosed Walls</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            {/* EXT WALL - MATH ENABLED */}
                            <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Ext. Length (m)</label>
                            <input type="text" placeholder="e.g. 5+4+5" className={`w-full p-2 border-b border-slate-200 outline-none text-lg font-bold text-slate-800 ${getZeroStyle(extLen)}`} value={extLen} onChange={(e) => updateState({extLen: handleMathInput(e.target.value)})} />
                            {evaluateMath(extLen) !== parseFloat(extLen) && <div className="text-[9px] text-gray-400 text-right">= {evaluateMath(extLen)}</div>}
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500"><span>Width:</span><input type="number" className={`w-16 p-1 border rounded text-center ${getZeroStyle(extWidth)}`} value={extWidth} onChange={(e) => updateState({extWidth: e.target.value})} /></div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            {/* INT WALL - MATH ENABLED */}
                            <label className="block text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Int. Length (m)</label>
                            <input type="text" placeholder="e.g. 4+6+2" className={`w-full p-2 border-b border-slate-200 outline-none text-lg font-bold text-slate-800 ${getZeroStyle(intLen)}`} value={intLen} onChange={(e) => updateState({intLen: handleMathInput(e.target.value)})} />
                            {evaluateMath(intLen) !== parseFloat(intLen) && <div className="text-[9px] text-gray-400 text-right">= {evaluateMath(intLen)}</div>}
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500"><span>Width:</span><input type="number" className={`w-16 p-1 border rounded text-center ${getZeroStyle(intWidth)}`} value={intWidth} onChange={(e) => updateState({intWidth: e.target.value})} /></div>
                        </div>
                    </div>
                    
                    {/* CUSTOM WALLS MAPPING (UPDATED) */}
                    {customWalls.map((wall) => (
                        <div key={wall.id} className="flex gap-2 mb-2 items-center bg-white p-2 rounded border border-gray-200 flex-wrap">
                            <input className="flex-1 p-1 text-xs border rounded min-w-[80px]" value={wall.name} onChange={(e) => updateCustomWall(wall.id, 'name', e.target.value)} placeholder="Wall Name" />
                            
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400">L:</span>
                                <input type="number" className={`w-14 p-1 text-xs border rounded text-center ${getZeroStyle(wall.length)}`} value={wall.length} onChange={(e) => updateCustomWall(wall.id, 'length', e.target.value)} />
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400">W:</span>
                                <input type="number" className={`w-12 p-1 text-xs border rounded text-center ${getZeroStyle(wall.width)}`} value={wall.width} onChange={(e) => updateCustomWall(wall.id, 'width', e.target.value)} />
                            </div>

                            {/* PLINTH EXEMPT TOGGLE */}
                            <div className="flex items-center gap-1 ml-1">
                                <button 
                                    onClick={() => togglePlinthExempt(wall.id)}
                                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border transition-colors ${wall.isPlinthExempt ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                    title="Click to Exclude from Plinth Length"
                                >
                                    {wall.isPlinthExempt ? <CheckSquare size={12}/> : <Square size={12}/>} 
                                    {wall.isPlinthExempt ? 'Exempt' : 'Plinth'}
                                </button>
                            </div>

                            <button onClick={() => removeCustomWall(wall.id)} className="text-red-400"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    
                    <button onClick={addCustomWall} className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2">+ Add Wall Type</button>
                </div>

                {/* Total Wall Length Display */}
                <div className="bg-slate-700 text-white p-3 rounded-xl flex justify-between items-center shadow-md border-t-2 border-slate-500">
                    <span className="text-xs font-bold flex items-center gap-2 text-slate-300"><BrickWall size={14}/> Total Enclosed Wall Length (All Walls)</span>
                    <span className="text-lg font-mono font-bold text-white">{totalEnclosedWallLength} m</span>
                </div>

                {/* OPEN AREAS SECTION (Unchanged) */}
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 shadow-sm relative">
                    <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-4"><Sun size={16} /> Open Areas / Sit-outs</h4>
                    <p className="text-[10px] text-orange-600 mb-3 -mt-3">"Touching" shares foundation. "Free" needs new foundation.</p>
                    
                    <div className="space-y-3 mb-4">
                        {openAreas.map((area) => (
                            <div key={area.id} className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-orange-200 shadow-sm transition-all hover:shadow-md">
                                
                                <div className="flex justify-between items-center border-b border-orange-50 pb-2">
                                    <select className="flex-1 text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer" value={area.type} onChange={(e) => updateOpenArea(area.id, 'type', e.target.value)}>
                                        <option value="Sit-out">Sit-out</option><option value="Verandah">Verandah</option><option value="Open Area">Open Area</option><option value="Courtyard">Courtyard</option><option value="Car Porch">Car Porch</option><option value="Work Area">Work Area</option>
                                    </select>
                                    
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => togglePlinthInclude(area.id)} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border transition-colors ${area.includeInPlinth ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`} title="Does this area need Foundation & Flooring?">{area.includeInPlinth ? <CheckSquare size={12}/> : <Square size={12}/>}{area.includeInPlinth ? 'Structural' : 'Non-Structural'}</button>
                                        <button onClick={() => toggleRoofInclude(area.id)} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border transition-colors ${area.hasRoof ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`} title="Is this area roof-covered?">{area.hasRoof ? <Home size={12}/> : <Square size={12}/>}{area.hasRoof ? 'Has Roof' : 'No Roof'}</button>
                                        <button onClick={() => removeOpenArea(area.id)} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                {/* Inputs (Simplified) */}
                                <div className="flex gap-4 border-t border-gray-100 pt-2 mt-2">
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Touching Wall</label>
                                        <input type="text" placeholder="e.g. 3+2+4" className={`w-full p-1.5 bg-gray-50 border rounded text-center text-xs font-bold ${getZeroStyle(evaluateMath(area.touchingLen))}`} value={area.touchingLen} onChange={(e) => updateOpenArea(area.id, 'touchingLen', e.target.value)} />
                                        {evaluateMath(area.touchingLen) !== parseFloat(area.touchingLen) && <div className="text-[9px] text-gray-400 text-right">= {evaluateMath(area.touchingLen)}</div>}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-bold text-orange-600 uppercase mb-1">Free / Open</label>
                                        <input type="text" placeholder="e.g. 2+3+2" className={`w-full p-1.5 bg-white border rounded text-center text-xs font-bold text-orange-800 ${getZeroStyle(evaluateMath(area.freeLen))}`} value={area.freeLen} onChange={(e) => updateOpenArea(area.id, 'freeLen', e.target.value)} />
                                        {evaluateMath(area.freeLen) !== parseFloat(area.freeLen) && <div className="text-[9px] text-orange-400 text-right font-bold">= {evaluateMath(area.freeLen)}</div>}
                                    </div>
                                </div>

                                <div className="flex justify-end mt-1 pt-1 border-t border-gray-50">
                                    <div className="text-[10px] font-bold text-gray-400">Total Perimeter: <span className="text-gray-700">{(evaluateMath(area.touchingLen) + evaluateMath(area.freeLen)).toFixed(2)} m</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={addOpenArea} className="w-full py-2 border border-dashed border-orange-300 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-50 flex items-center justify-center gap-1"><Plus size={12} /> Add Open Area</button>
                </div>

                <div className="bg-slate-800 text-white p-3 rounded-xl flex justify-between items-center shadow-md"><span className="text-xs font-bold flex items-center gap-2 text-slate-300"><Calculator size={14}/> Found. Length (Walls + Free Open - Exempt)</span><span className="text-lg font-mono font-bold text-yellow-400">{totalFoundationLength} m</span></div>
            </div>

            {/* RIGHT COLUMN: Floors & Columns (Unchanged) */}
            <div className="space-y-6">
                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                    <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-4"><Building2 size={16} /> Foundation & Floors</h4>
                    <select className="w-full p-3 bg-white border border-indigo-100 rounded-xl font-bold text-indigo-700 mb-4" value={foundationType} onChange={(e) => updateState({foundationType: e.target.value, columnGroups: []})}><option value="RR">RR Masonry (Load Bearing)</option><option value="RCC">RCC Column Structure</option></select>
                    
                    <div className="flex flex-col gap-4">
                        {/* Floor Count Input */}
                        <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                            <label className="text-xs font-bold text-indigo-900">Floors:</label>
                            <input type="number" min="1" max="10" className="w-16 p-2 border rounded font-bold text-center" value={numFloors} onChange={(e) => handleFloorCountChange(e.target.value)} />
                            <span className="text-[10px] text-indigo-500 bg-white px-2 py-1 rounded border ml-2">Updates Sizes & Names</span>
                        </div>

                        {/* Editable Floor Names List */}
                        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                            {floorNames.map((name, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-xs w-12 text-indigo-500 font-mono">{index === 0 ? 'GF' : `F${index}`}:</span>
                                    <input 
                                        type="text"
                                        className="flex-1 p-1 text-xs border rounded" 
                                        value={name} 
                                        onChange={(e) => updateFloorName(index, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm h-full ${isColumnMissing ? 'bg-red-50 border-red-200' : 'bg-green-50/50 border-green-100'}`}>
                    <div className="flex justify-between mb-4"><h4 className="text-sm font-bold text-green-900"><Layers size={16} className="inline mr-2"/> Columns & Footings</h4><span className="text-xs bg-white px-2 py-1 rounded font-bold">Total: {totalCols}</span></div>
                    
                    <div className="mb-3 flex flex-col gap-1 text-[10px] text-gray-500 bg-white p-2 rounded border border-dashed">
                        <div className="flex items-center gap-1 text-blue-500 font-bold"><Info size={12}/> Auto-Size Standards:</div>
                        <div><b>G+0:</b> Foot 1.0x1.0, Depth 1.2, Col 23x23cm</div>
                        <div><b>G+1:</b> Foot 1.2x1.2, Depth 1.5, Col 23x30cm</div>
                        <div><b>G+2:</b> Foot 1.5x1.5, Depth 1.5, Col 30x30cm</div>
                        <div><b>G+3:</b> Foot 1.8x1.8, Depth 1.8, Col 30x45cm</div>
                    </div>

                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-1">
                        {columnGroups.map(grp => (
                            <div key={grp.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative group">
                                <div className="flex justify-between items-start mb-2"><input className="text-xs font-bold text-blue-800 w-full outline-none border-b border-transparent focus:border-blue-300" value={grp.name} onChange={(e)=>updateGroup(grp.id,'name',e.target.value)} /><div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-600">x <input type="number" className="w-8 bg-transparent text-center outline-none" value={grp.count} onChange={(e)=>updateGroup(grp.id,'count',e.target.value)} /></div></div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]"><div className="bg-blue-50 p-1.5 rounded text-center border border-blue-100"><div className="text-blue-400 font-bold mb-1 uppercase">Footing (L x B x D)</div><div className="flex gap-1 justify-center items-center"><input className={`w-8 text-center bg-transparent border-b ${getZeroStyle(grp.f_l)}`} value={grp.f_l} onChange={(e)=>updateGroup(grp.id,'f_l',e.target.value)} />x<input className={`w-8 text-center bg-transparent border-b ${getZeroStyle(grp.f_b)}`} value={grp.f_b} onChange={(e)=>updateGroup(grp.id,'f_b',e.target.value)} />x<input className={`w-8 text-center bg-transparent border-b ${getZeroStyle(grp.f_d)}`} value={grp.f_d} onChange={(e)=>updateGroup(grp.id,'f_d',e.target.value)} /></div></div><div className="bg-green-50 p-1.5 rounded text-center border border-green-100"><div className="text-green-600 font-bold mb-1 uppercase">Column (L x B)</div><div className="flex gap-1 justify-center items-center"><input className={`w-8 text-center bg-transparent border-b ${getZeroStyle(grp.c_l)}`} value={grp.c_l} onChange={(e)=>updateGroup(grp.id,'c_l',e.target.value)} />x<input className={`w-8 text-center bg-transparent border-b ${getZeroStyle(grp.c_b)}`} value={grp.c_b} onChange={(e)=>updateGroup(grp.id,'c_b',e.target.value)} /></div></div></div>
                                <button onClick={() => removeGroup(grp.id)} className="absolute -top-2 -right-2 bg-white text-red-400 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"><Trash2 size={12} /></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {isRCC && <button onClick={()=>addColumnGroup('Conceiled')} className="flex-1 py-2 bg-white border border-green-200 text-green-700 rounded text-xs font-bold">+ Concealed Col</button>}
                        <button onClick={()=>addColumnGroup('Open')} className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 rounded text-xs font-bold">+ {isRCC ? 'Open Col' : 'Sit-out Col (RCC)'}</button>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button onClick={onApply} disabled={!canApply} className={`px-10 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 text-white transition-all ${!canApply ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}><Layers size={18} /> Apply Configuration</button>
        </div>
    </div>
  );
}