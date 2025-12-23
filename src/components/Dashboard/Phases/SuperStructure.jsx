import React from "react"; 
import EstimationTable from "../EstimationTable";
import { Maximize2 } from "lucide-react"; 

// List of work items that need to be created for each floor
const ITEMS_TO_DUPLICATE_PER_FLOOR = [
  "masonry",
  "walls",
  "rcc roof slab",
  "plastering",
  "flooring",
  "painting",
  "finishing",
  "electr",
  "plumb",
];

export default function SuperStructure({
  items,
  measurements,
  updateMeasurements,
  calculateTotal,
  calculateQty,
  indexOffset,
  floorNames = [],
  globalParams,
}) {
  // --- SAFETY CHECK ---
  if (!items || items.length === 0) {
    return (
      <div className="p-6 text-gray-500 font-bold">
        No Super Structure Work Items defined in Scope.
      </div>
    );
  }
  const validFloorNames = floorNames || [];
  if (validFloorNames.length === 0) {
    return (
      <div className="p-6 text-red-600 font-bold">
        Error: Please define the number of floors in the Sub Structure tab
        first.
      </div>
    );
  } 
  // --- END SAFETY CHECK --- 

  // Function to duplicate items based on floor count
  const mapItemsToFloors = (workItems) => {
    let finalItems = [];
    const floors = validFloorNames.length || 1;
    workItems.forEach((item) => {
      const titleLower = item.title.toLowerCase();
      const shouldDuplicate = ITEMS_TO_DUPLICATE_PER_FLOOR.some((keyword) =>
        titleLower.includes(keyword)
      );

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
      
      {/* 2. ESTIMATION TABLES (Floor-Duplicated) */}
      <h3 className="text-xl font-bold text-orange-600 border-b border-gray-200 pb-2 pt-4">
        Estimation Tables ({displayItems.length} Entries)
      </h3>
      
      {displayItems.map((item, index) => {
        const itemId = item.id;
        const rows = measurements[itemId] || [
          {
            id: itemId,
            desc: "Enter Area / Length manually, use calculated estimate as guide.",
            nos: 1,
            l: 0,
            b: 0,
            d: 0,
            unit: "m3",
          },
        ];
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