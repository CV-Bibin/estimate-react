import React from 'react';
import { Image, Cpu, MousePointer } from 'lucide-react';

// NOTE: This function simulates receiving calculated room/wall data from a backend AI service.
export default function SuperStructureAI({ globalParams, setGlobalParams }) {
    
    // --- MOCK AI OUTPUT DATA ---
    const mockAIData = {
        // AI provides the final structural lengths
        extLen: "22.5", 
        intLen: "18.0", 
        
        // AI provides segregated room areas, perimeter, and ceiling volume
        rooms: [
            { name: 'Living Hall', area: 25.0, perimeter: 20.0, ceilingHeight: 3.0, wallArea: 60.0 },
            { name: 'Master Bedroom', area: 15.0, perimeter: 15.0, ceilingHeight: 3.0, wallArea: 45.0 },
            { name: 'Kitchen', area: 12.0, perimeter: 13.0, ceilingHeight: 3.0, wallArea: 39.0 },
        ],
        
        // This is the data the AI calculated for ALL walls, including length and width (b)
        customWalls: [
            { id: 'part-1', name: 'AI Detected 15cm Wall', length: 3.5, width: 0.15 },
        ],
        
        // Total calculated roof area (sum of all rooms + sit-outs)
        totalSlabArea: 70.0,
        
        // Total Column volume/count (Can be refined later)
        columnGroups: globalParams.columnGroups.length > 0 ? globalParams.columnGroups : [
            { id: 1, type: 'Conceiled', name: 'AI Detected 23x30', count: 12, f_l: 1.2, f_b: 1.5, f_d: 1.5, c_l: 0.23, c_b: 0.30 },
        ]
    };

    const handleIntegrateData = () => {
        // In a real application, you would update a specific SuperStructure state here.
        // For now, we simulate updating the core globalParams that feed the rules.

        setGlobalParams(prev => ({
            ...prev,
            extLen: mockAIData.extLen,
            intLen: mockAIData.intLen,
            customWalls: mockAIData.customWalls,
            columnGroups: mockAIData.columnGroups,
            
            // Add a dedicated state for the area output needed for Super Structure
            aiSuperStructureData: mockAIData 
        }));

        alert("AI data for Super Structure (Walls, Rooms, Slab Area) integrated. You can now auto-fill Super Structure items.");
    };

    return (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-xl mb-8">
            <h4 className="text-xl font-bold text-blue-800 flex items-center gap-3 mb-4">
                <Cpu size={24} className="text-indigo-600"/> AI Image Scan for Measurements
            </h4>
            
            <div className="flex flex-col md:flex-row items-center gap-3 mb-4 border-b pb-4 border-blue-100">
                <input type="file" accept="image/*" className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
                <button className="w-full md:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm justify-center">
                    <MousePointer size={16} /> Calibrate Scale
                </button>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm">
                <p className="font-bold text-gray-800 flex items-center gap-2"><Image size={16} className="text-green-500" /> AI Output Preview (Example)</p>
                <ul className="list-disc list-inside text-gray-600 text-xs mt-2 pl-3">
                    <li>Total Slab/Roof Area: {mockAIData.totalSlabArea} m²</li>
                    <li>Total Wall Length (Ext/Int): {(parseFloat(mockAIData.extLen) + parseFloat(mockAIData.intLen)).toFixed(2)} m</li>
                    <li>Number of Rooms Detected: {mockAIData.rooms.length}</li>
                </ul>
            </div>
            
            <button 
                onClick={handleIntegrateData} 
                className="w-full mt-4 bg-indigo-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-300"
            >
                Integrate AI Data for Super Structure
            </button>
        </div>
    );
}