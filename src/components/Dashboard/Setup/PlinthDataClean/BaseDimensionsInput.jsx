import React from 'react';
import { Maximize2, Ruler } from 'lucide-react';
import InputGroup from './InputGroup';

export default function BaseDimensionsInput({
  plinthArea,
  plinthPerimeter,
  updateField
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
        <Ruler size={16} /> Base Dimensions
      </h4>
      <div className="grid grid-cols-2 gap-6">
        <InputGroup
          label="Total Plinth Area (m²)"
          value={plinthArea}
          onChange={(v) => updateField("plinthArea", v)}
          icon={Maximize2}
          placeholder="e.g. 120"
        />
        <InputGroup
          label="Plinth Perimeter (m)"
          value={plinthPerimeter}
          onChange={(v) => updateField("plinthPerimeter", v)}
          icon={Ruler}
          placeholder="e.g. 45"
        />
      </div>
    </div>
  );
}