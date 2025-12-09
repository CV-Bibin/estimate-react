import React from 'react';
import EstimationTable from '../EstimationTable';
import RoomDimensionManager from './RoomDimensionManager'; 

// List of work items that need to be created for each floor
const ITEMS_TO_DUPLICATE_PER_FLOOR = [
    "masonry", "walls", "rcc roof slab", "plastering", "flooring", "painting", "finishing", "electr", "plumb"
];

export default function SuperStructure({ items, measurements, updateMeasurements, calculateTotal, calculateQty, indexOffset, floorNames = [], roomData, updateRoomData }) {
    
    // --- CRITICAL SAFETY CHECKS ---
    // 1. Check if core work items or floor structure exists.
    if (!items || items.length === 0) {
        return <div className="p-6 text-gray-500 font-bold">No Super Structure Work Items defined in Scope.</div>;
    }
    // 2. Ensure floor list exists before trying to map rooms/tables.
    // If the list is null/undefined, initialize it as empty.
    const validFloorNames = floorNames || [];
    if (validFloorNames.length === 0) {
        return <div className="p-6 text-red-600 font-bold">Error: Please define the number of floors in the Sub Structure tab first.</div>;
    }
    // --- END SAFETY CHECKS ---


    // Function to duplicate items based on floor count
    const mapItemsToFloors = (workItems) => {
        let finalItems = [];
        const floors = validFloorNames.length || 1;
        
        workItems.forEach(item => {
            const titleLower = item.title.toLowerCase();
            const shouldDuplicate = ITEMS_TO_DUPLICATE_PER_FLOOR.some(keyword => titleLower.includes(keyword));

            if (shouldDuplicate && floors > 0) {
                validFloorNames.forEach((floorName, floorIndex) => {
                    finalItems.push({
                        ...item,
                        id: `${item.id}-${floorIndex}`,
                        title: `${item.title} - ${floorName}`, // e.g., Brick Walls - First Floor
                    });
                });
            } else {
                finalItems.push(item);
            }
        });
        return finalItems;
    };
    
    const displayItems = mapItemsToFloors(items);

    return (
        <div className="space-y-6">
            
            {/* 1. ROOM DIMENSIONS ENTRY (New Dynamic Section) */}
            <h3 className="text-xl font-bold text-orange-600 border-b border-gray-200 pb-2">Room & Area Input ({validFloorNames.length} Floors)</h3>
            
            <div className="space-y-4">
                {validFloorNames.map((floorName) => (
                    <RoomDimensionManager
                        key={floorName}
                        floorName={floorName}
                        roomData={roomData}
                        updateRoomData={updateRoomData}
                    />
                ))}
            </div>

            {/* 2. ESTIMATION TABLES (Floor-Duplicated) */}
            <h3 className="text-xl font-bold text-orange-600 border-b border-gray-200 pb-2 pt-4">Estimation Tables ({displayItems.length} Entries)</h3>
            
            {displayItems.map((item, index) => {
                const itemId = item.id;
                const rows = measurements[itemId] || [{ id: itemId, desc: '', nos: 1, l: 0, b: 0, d: 0, unit: 'm3' }];
                
                return (
                    <EstimationTable
                        key={itemId}
                        index={index + indexOffset}
                        item={item}
                        rows={rows}
                        onUpdateRows={(newRows) => updateMeasurements(itemId, newRows)}
                        calculateTotal={() => calculateTotal(itemId)}
                        calculateQty={(row) => calculateQty(row)}
                    />
                );
            })}
        </div>
    );
}