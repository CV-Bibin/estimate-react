import React, { useState } from "react"; // <-- FIX 3: ADD useState IMPORT HERE
import EstimationTable from "../EstimationTable";
import { Hammer, Maximize2 } from "lucide-react"; // Added icons for UI

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

// NOTE: Removed roomData and updateRoomData from props
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
  const [plinthInput, setPlinthInput] = useState({
    area: 0,
    perimeter: 0,
    floorHeight: 3.0, // Default 3.0m
  }); // --- SAFETY CHECK ---

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
  } // --- END SAFETY CHECK --- // Function to duplicate items based on floor count
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
  const displayItems = mapItemsToFloors(items); // --- DERIVED ESTIMATES --- // Safety parsing for number inputs

  const currentArea = parseFloat(plinthInput.area) || 0;
  const currentPerimeter = parseFloat(plinthInput.perimeter) || 0;
  const currentHeight = parseFloat(plinthInput.floorHeight) || 0;

  const carpetAreaEstimate = (currentArea * 0.85).toFixed(2);
  const wallPlasterAreaEstimate = (
    currentPerimeter *
    currentHeight *
    2
  ).toFixed(2);

  return (
    <div className="space-y-6">
                              {/* 1. MANUAL PLINTH DATA ENTRY */}           {" "}
      <h3 className="text-xl font-bold text-orange-600 border-b border-gray-200 pb-2 flex items-center gap-2">
                        <Hammer size={20} /> Base Data (from AutoCAD)          
         {" "}
      </h3>
                             {" "}
      <div className="bg-white p-5 rounded-xl border border-orange-100 shadow-lg grid md:grid-cols-3 gap-4">
                        {/* Plinth Area Input */}               {" "}
        <div>
                             {" "}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Plinth Area (m²)
          </label>
                             {" "}
          <input
            type="number"
            value={plinthInput.area}
            onChange={(e) =>
              setPlinthInput({ ...plinthInput, area: e.target.value })
            }
            className="w-full p-2 border rounded-lg text-lg font-bold"
            placeholder="e.g. 150"
          />
                             {" "}
          <p className="mt-2 text-xs text-gray-500">
            Input the total built-up area.
          </p>
                         {" "}
        </div>
                        {/* Perimeter Input */}               {" "}
        <div>
                             {" "}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Plinth Perimeter (m)
          </label>
                             {" "}
          <input
            type="number"
            value={plinthInput.perimeter}
            onChange={(e) =>
              setPlinthInput({ ...plinthInput, perimeter: e.target.value })
            }
            className="w-full p-2 border rounded-lg text-lg font-bold"
            placeholder="e.g. 50"
          />
                             {" "}
          <p className="mt-2 text-xs text-gray-500">
            Input the perimeter of the plinth line.
          </p>
                         {" "}
        </div>
                                        {/* Floor Height Input */}             
         {" "}
        <div>
                             {" "}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Floor Height (m)
          </label>
                             {" "}
          <input
            type="number"
            value={plinthInput.floorHeight}
            onChange={(e) =>
              setPlinthInput({ ...plinthInput, floorHeight: e.target.value })
            }
            className="w-full p-2 border rounded-lg text-lg font-bold"
            placeholder="e.g. 3.0"
          />
                             {" "}
          <p className="mt-2 text-xs text-gray-500">Typically 3.0m.</p>         
               {" "}
        </div>
                        {/* DERIVED ESTIMATES DISPLAY */}               {" "}
        <div className="md:col-span-3 pt-4 border-t mt-4 border-gray-100 flex justify-around">
                             {" "}
          <div className="text-center">
                                   {" "}
            <span className="text-xs font-medium text-blue-600">
              Estimated Carpet Area
            </span>
                                   {" "}
            <p className="text-2xl font-extrabold text-blue-800">
              {carpetAreaEstimate} m²
            </p>
                                   {" "}
            <p className="text-xs text-gray-500">(Plinth Area * 0.85)</p>       
                       {" "}
          </div>
                             {" "}
          <div className="text-center">
                                   {" "}
            <span className="text-xs font-medium text-red-600">
              Estimated Plastering Area
            </span>
                                   {" "}
            <p className="text-2xl font-extrabold text-red-800">
              {wallPlasterAreaEstimate} m²
            </p>
                                   {" "}
            <p className="text-xs text-gray-500">
              (Perimeter * Height * 2 sides)
            </p>
                               {" "}
          </div>
                         {" "}
        </div>
                   {" "}
      </div>
                  {/* 2. ESTIMATION TABLES (Floor-Duplicated) */}           {" "}
      <h3 className="text-xl font-bold text-orange-600 border-b border-gray-200 pb-2 pt-4">
        Estimation Tables ({displayItems.length} Entries)
      </h3>
                             {" "}
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
             {" "}
    </div>
  );
}
