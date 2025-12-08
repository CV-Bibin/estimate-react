import React from 'react';
import EstimationTable from '../EstimationTable';

export default function SuperStructure({ items, measurements, updateMeasurements, calculateTotal, calculateQty, indexOffset }) {
  if (items.length === 0) return <div className="text-gray-400 text-center py-10 border border-dashed rounded-xl">No Super Structure items found.</div>;

  return (
    <div className="space-y-8">
      {items.map((item, index) => (
        <EstimationTable 
          key={item.id}
          index={index + indexOffset} 
          item={item}
          rows={measurements[item.id] || []}
          onUpdateRows={(newRows) => updateMeasurements(item.id, newRows)}
          calculateTotal={() => calculateTotal(item.id)}
          calculateQty={calculateQty}
        />
      ))}
    </div>
  );
}