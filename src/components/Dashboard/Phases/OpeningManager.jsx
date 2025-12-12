import React from 'react';
import { Plus, Trash2, DoorOpen } from 'lucide-react';

// Function to get default dimensions based on opening type
const getDefaultDimensions = (type) => {
    switch (type) {
        case 'Door':
            return { length: 1.0, width: 2.1 }; 
        case 'Window':
        case 'Grill Window': 
            return { length: 1.5, width: 1.5 }; 
        case 'Ventilator':
            return { length: 0.6, width: 0.45 }; 
        case 'Arch Opening':
        case 'Rectangular Opening':
            return { length: 1.5, width: 2.1 }; 
        default:
            return { length: 1.0, width: 2.1 }; 
    }
};

export default function OpeningManager({ 
    floorName, 
    openings, 
    setOpenings,
    wallOptions = [] // Receives available wall widths [0.23, 0.15, 0.10]
}) {
    
    // --- Data Management Functions ---

    const addOpeningGroup = () => {
        const defaultDimensions = getDefaultDimensions('Door');
        // Default to the first available wall option, or 0.23 if none
        const defaultWallType = wallOptions.length > 0 ? wallOptions[0] : 0.23;
        
        const newGroup = {
            id: Date.now(),
            type: 'Door',
            length: defaultDimensions.length, 
            width: defaultDimensions.width,  
            wallType: defaultWallType, 
            nos: 1, 
        };
        setOpenings([...openings, newGroup]);
    };

    const updateOpeningGroup = (id, field, value) => {
        const newOpenings = openings.map(o => {
            if (o.id === id) {
                const parsedValue = (field === 'length' || field === 'width' || field === 'nos' || field === 'wallType') ? parseFloat(value) || 0 : value;
                
                let updatedOpening = { ...o, [field]: parsedValue };

                if (field === 'type') {
                    const newDefaults = getDefaultDimensions(value);
                    updatedOpening.length = newDefaults.length;
                    updatedOpening.width = newDefaults.width;
                }
                
                return updatedOpening;
            }
            return o;
        });
        setOpenings(newOpenings);
    };

    const removeOpeningGroup = (id) => {
        setOpenings(openings.filter(o => o.id !== id));
    };
    
    // --- CALCULATIONS ---
    const totalOpeningArea = openings.reduce((sum, o) => sum + (parseFloat(o.length || 0) * parseFloat(o.width || 0) * (parseFloat(o.nos) || 0)), 0).toFixed(2);
    
    // NEW: Calculate Total Opening Volume (Area * Wall Thickness)
    const totalOpeningVolume = openings.reduce((sum, o) => sum + (parseFloat(o.length || 0) * parseFloat(o.width || 0) * (parseFloat(o.nos) || 0) * (parseFloat(o.wallType) || 0)), 0).toFixed(2);

    // Calculate Total Grill Area
    const totalGrillArea = openings.reduce((sum, o) => {
        if (o.type === 'Grill Window') {
            return sum + (parseFloat(o.length || 0) * parseFloat(o.width || 0) * (parseFloat(o.nos) || 0));
        }
        return sum;
    }, 0).toFixed(2);
    
    // --- Calculate Total Counts per Type ---
    const totalCounts = openings.reduce((counts, o) => {
        const type = o.type.replace(/\s/g, ''); 
        counts[type] = (counts[type] || 0) + (parseFloat(o.nos) || 0);
        return counts;
    }, {});
    
    const totalCountLabels = [
        { type: 'Door', label: 'Doors' },
        { type: 'Window', label: 'Windows' },
        { type: 'Ventilator', label: 'Ventilators' },
        { type: 'ArchOpening', label: 'Arch Openings' },
        { type: 'RectangularOpening', label: 'Rectangular Openings' },
         { type: 'GrillWindow', label: 'Grill Windows' }, 
    ];


    // --- Rendering Logic ---

    const tableHeaders = [
        { title: "Type", key: "type", width: "18%" },
        { title: "Width (m)", key: "length", width: "10%" },
        { title: "Height (m)", key: "width", width: "10%" },
        { title: "Nos. (Total)", key: "nos", width: "8%" },
        { title: "Wall Size", key: "wallType", width: "20%" }, // UPDATED LABEL
        { title: "Area (m²)", key: "area_calc", width: "14%" },
        { title: "", key: "delete", width: "10%" },
    ];
    
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg">
            <h4 className="text-md font-bold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                <DoorOpen size={16}/> Doors, Windows & Openings ({floorName})
            </h4>

            {/* TOTAL COUNTS SUMMARY */}
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg text-xs font-medium mb-4 border border-gray-200 overflow-x-auto">
                {totalCountLabels.map(({ type, label }) => {
                    const count = totalCounts[type.replace(/\s/g, '')] || 0;
                    return (
                        <div key={type} className="text-center px-2 min-w-[60px]">
                            <span className="text-gray-500 block mb-1">{label}</span>
                            <span className={`font-bold ${count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{count}</span>
                        </div>
                    );
                })}
            </div>

            {/* OPENINGS TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
                            {tableHeaders.map(header => (
                                <th key={header.key} className="text-left py-2 font-medium" style={{ width: header.width }}>{header.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {openings.map((o) => {
                            const currentArea = (o.length * o.width * o.nos).toFixed(2);
                            
                            return (
                                <tr key={o.id} className="group hover:bg-gray-50 transition-colors border-b border-gray-50">
                                    
                                    {/* Type Selector */}
                                    <td className="py-2">
                                        <select 
                                            value={o.type} 
                                            onChange={(e) => updateOpeningGroup(o.id, 'type', e.target.value)}
                                            className="p-1 text-sm border rounded bg-white w-full"
                                        >
                                            <option value="Door">Door</option>
                                            <option value="Window">Window</option>
                                            <option value="Ventilator">Ventilator</option>
                                            <option value="Arch Opening">Arch Opening</option>
                                            <option value="Rectangular Opening">Rectangular Opening</option>
                                            <option value="Grill Window">Grill Works</option>
                                        </select>
                                    </td>
                                    
                                    {/* Width (L) Input */}
                                    <td>
                                        <input type="number" value={o.length || ''} onChange={(e) => updateOpeningGroup(o.id, 'length', e.target.value)} className="w-full p-1 text-sm border rounded text-center" placeholder="0.00" />
                                    </td>

                                    {/* Height (H) Input */}
                                    <td>
                                        <input type="number" value={o.width || ''} onChange={(e) => updateOpeningGroup(o.id, 'width', e.target.value)} className="w-full p-1 text-sm border rounded text-center" placeholder="0.00" />
                                    </td>

                                    {/* Nos. Input */}
                                    <td>
                                        <input type="number" value={o.nos || ''} onChange={(e) => updateOpeningGroup(o.id, 'nos', e.target.value)} className="w-full p-1 text-sm border rounded text-center font-bold bg-yellow-50" placeholder="1" />
                                    </td>

                                    {/* Wall Size Dropdown (FIXED) */}
                                    <td>
                                        <select 
                                            value={o.wallType} 
                                            onChange={(e) => updateOpeningGroup(o.id, 'wallType', e.target.value)}
                                            className="p-1 text-sm border rounded bg-white w-full text-center"
                                        >
                                            {/* Always provide a default if options are empty */}
                                            {wallOptions.length === 0 && <option value="0.23">0.23 m</option>}
                                            
                                            {wallOptions.map((size, idx) => (
                                                <option key={idx} value={size}>
                                                    {size} m
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Calculated Area Display */}
                                    <td className="text-right font-bold text-red-600 pr-2">
                                        {currentArea}
                                    </td>
                                    
                                    {/* Delete Button */}
                                    <td className="text-center">
                                        <button onClick={() => removeOpeningGroup(o.id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* SUMMARY SECTION */}
            <div className="flex flex-wrap justify-between mt-4 gap-4 items-center border-t border-gray-100 pt-3">
                <div className="flex gap-4">
                    <p className="text-sm font-medium text-gray-600">
                        Total Opening Area: <span className="font-bold text-red-600">{totalOpeningArea} m²</span>
                    </p>
                    <p className="text-sm font-medium text-gray-600 border-l pl-4 border-gray-300">
                        Total Opening Volume: <span className="font-bold text-blue-600">{totalOpeningVolume} m³</span>
                    </p>
                </div>
                
                {/* Total Grill Area Display (Only if relevant) */}
                {parseFloat(totalGrillArea) > 0 && (
                    <p className="text-sm font-medium text-gray-600 border border-green-200 bg-green-50 px-3 py-1 rounded">
                        Total Grill Area: <span className="font-bold text-green-700">{totalGrillArea} m²</span>
                    </p>
                )}
            </div>

            <button 
                onClick={addOpeningGroup} 
                className="mt-4 text-xs text-blue-600 font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded transition-colors border border-dashed border-blue-200 w-full justify-center"
            >
                <Plus size={14} /> Add New Group
            </button>
        </div>
    );
}