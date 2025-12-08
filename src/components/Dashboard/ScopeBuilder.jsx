import React, { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ArrowRight } from 'lucide-react';

// SIMPLIFIED HIGH-LEVEL HEADINGS
const MAIN_CONSTRUCTION_STEPS = [
  "Site Clearance & Marking",
  "Earthwork Excavation",
  "Foundation & Basement Works",          // Merged PCC, Footings/RR, & Filling
  "Superstructure Masonry (Walls)",
  "Doors, Windows & Openings",            // Merged Frames, Shutters, Glass, Grills
  "Lintels, Sunshades & Lofts",
  "RCC Roof Slab & Beams",
  "Staircase Construction",
  "Porch & Sit-out Structure",
  "Plastering Works", 
  "Water proofing of RCC roof ",                   // Merged Internal, External, Ceiling
  "Flooring Works",                       // Merged Base Concrete, Tiling, Skirting
  "Painting & Finishing",
  "Electrical & Plumbing Works"           // Merged Piping and Fittings
];

const OPTIONAL_EXTRA_WORKS = [
  "Retaining Wall",
  "Septic Tank & Soak Pit",
  "Underground Water Sump",
  "Well / Borewell",
  "Compound Wall & Gate",
  "Interlocking / Landscaping",
  "Roof Truss / Roofing Sheets"
];

export default function ScopeBuilder({ onComplete }) {
  const [items, setItems] = useState(
    MAIN_CONSTRUCTION_STEPS.map((title, index) => ({
      id: `step-${index}`, 
      title: title 
    }))
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addItem = (title) => {
    setItems([...items, { id: Date.now().toString(), title }]);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-sm rounded-xl mt-6">
      <h2 className="text-2xl font-bold mb-2">Build Scope of Work</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Simplified main headings. You can add specific details (like frames, glass, or granite) inside each section later.
      </p>

      {/* Suggestion Chips */}
      <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Add Extra Works:
      </div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-6">
        {OPTIONAL_EXTRA_WORKS.map(item => (
          <button 
            key={item} 
            onClick={() => addItem(item)} 
            className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
          >
            <span className="text-lg leading-none">+</span> {item}
          </button>
        ))}
      </div>

      {/* DND List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 bg-gray-50/50">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item, index) => (
              <SortableItem 
                key={item.id} 
                id={item.id} 
                title={item.title} 
                index={index} 
                onDelete={() => setItems(items.filter(i => i.id !== item.id))} 
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Total Steps: <span className="font-bold text-gray-800">{items.length}</span>
        </div>
        <button 
          onClick={() => onComplete(items)} 
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/20"
        >
          Start Estimation <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function SortableItem({ id, title, index, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    touchAction: 'none' 
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 group border-b border-gray-100 last:border-0 relative">
      <div className="flex items-center gap-4 flex-1">
        <button 
          {...attributes} 
          {...listeners} 
          className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-600 p-1"
        >
          <GripVertical size={20} />
        </button>
        <span className="font-medium text-gray-700">
          <span className="text-gray-400 font-mono mr-3 text-sm">{index + 1}.</span>
          {title}
        </span>
      </div>
      <button 
        onClick={onDelete} 
        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition-all"
        title="Remove Step"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}