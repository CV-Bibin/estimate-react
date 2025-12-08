import React, { useState, useEffect } from 'react';
import { FileDown, Settings2, Layers, AlertTriangle, Hammer, PaintBucket } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ProjectSetup from './ProjectSetup';
import SubStructure from './Phases/SubStructure';
import SuperStructure from './Phases/SuperStructure';
import Finishing from './Phases/Finishing';

// IMPORT NEW FUNCTION
import { getSiteClearanceRows, getExcavationRows, getFoundationRows, getEarthFillingRows } from '../../utils/estimationRules';

export default function ManualEstimator({ workItems = [], projectData = {} }) {
  
  const [activeTab, setActiveTab] = useState('Sub Structure');
  const [showAutoFill, setShowAutoFill] = useState(true);
  
  const [globalParams, setGlobalParams] = useState({
    extLen: '', extWidth: 0.23, intLen: '', intWidth: 0.23,
    customWalls: [], openAreas: [], columnGroups: [],
    foundationType: 'RR', numFloors: 1, floorNames: ['Ground Floor']
  });

  const [measurements, setMeasurements] = useState({});

  useEffect(() => {
    if (workItems && workItems.length > 0 && Object.keys(measurements).length === 0) {
      const initialData = workItems.reduce((acc, item) => ({ 
        ...acc, [item.id]: [{ id: Date.now(), desc: '', nos: 1, l: 0, b: 0, d: 0, unit: 'm3' }] 
      }), {});
      setMeasurements(initialData);
    }
  }, [workItems]);

  const updateMeasurements = (itemId, newRows) => setMeasurements(prev => ({ ...prev, [itemId]: newRows }));

  const calculateQty = (row) => {
    if (!row) return "0.00";
    if (row.isHeader) return ""; 
    if (row.qtyOverride) return parseFloat(row.qtyOverride).toFixed(2);
    const l = parseFloat(row.l) || 0;
    const b = parseFloat(row.b) || 0;
    const d = parseFloat(row.d) || 0;
    const nos = parseFloat(row.nos) || 0;
    let val = 0;
    if (row.unit === 'm2') val = nos * l * b;
    else if (row.unit === 'm') val = nos * l;
    else if (row.unit === 'Hrs' || row.unit === 'Nos') val = nos;
    else val = nos * l * b * (d === 0 ? 1 : d);
    return val.toFixed(2);
  };

  const calculateTotal = (itemId) => {
    if (!measurements[itemId]) return "0.00";
    return measurements[itemId]?.reduce((sum, row) => sum + (row.isHeader ? 0 : parseFloat(calculateQty(row)) || 0), 0).toFixed(2);
  };

  const handleAutoFill = () => {
    const ext = parseFloat(globalParams.extLen) || 0;
    const int = parseFloat(globalParams.intLen) || 0;
    const customSum = (globalParams.customWalls || []).reduce((sum, w) => sum + (parseFloat(w.length) || 0), 0);
    const totalWallLen = (ext + int + customSum).toFixed(2);

    const newMeasurements = { ...measurements };

    workItems.forEach(item => {
        const title = (item.title || "").toLowerCase();
        
        if (title.includes("site")) {
             newMeasurements[item.id] = getSiteClearanceRows();
        }
        else if (title.includes("excavation") || title.includes("earthwork")) {
             newMeasurements[item.id] = getExcavationRows(globalParams, totalWallLen);
        }
        else if (title.includes("pcc") || title.includes("foundation")) {
             newMeasurements[item.id] = getFoundationRows(globalParams, totalWallLen);
        }
        // FILLING LOGIC
        else if (title.includes("filling") || title.includes("earth")) {
             newMeasurements[item.id] = getEarthFillingRows(globalParams, totalWallLen);
        }
    });

    setMeasurements(newMeasurements);
    setShowAutoFill(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(41, 128, 185); doc.text("ESTIMATION REPORT", 14, 20);
    doc.setFontSize(10); doc.setTextColor(0, 0, 0);
    doc.text(`Project: ${projectData.projectName || 'New Project'}`, 14, 30);
    doc.line(14, 45, 196, 45);
    
    let yPos = 50;
    workItems.forEach((item, index) => {
      const itemRows = measurements[item.id] || [];
      const validRows = itemRows.filter(row => row.isHeader || calculateQty(row) !== "0.00");
      if (validRows.length === 0) return;

      const tableRows = validRows.map(row => {
          if (row.isHeader) return [{ content: row.desc, colSpan: 7, styles: { fillColor: [220, 220, 220], fontStyle: 'bold', halign: 'center' } }];
          return [row.desc || '-', row.nos, row.l, row.b, row.d, calculateQty(row), row.unit];
      });

      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text(`${index + 1}. ${item.title}`, 14, yPos);
      tableRows.push([{ content: 'Total', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } }, calculateTotal(item.id), '']);
      
      autoTable(doc, { 
        startY: yPos + 5, head: [['Desc', 'No', 'L', 'B', 'D', 'Qty', 'Unit']], body: tableRows,
        theme: 'grid', styles: { fontSize: 9, cellPadding: 2 }, columnStyles: { 0: { cellWidth: 60 }, 5: { fontStyle: 'bold' } }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    });
    doc.save('Estimation.pdf');
  };

  const getCategory = (title) => {
    if (!title) return 'Super Structure';
    const t = title.toLowerCase();
    if (t.includes('site') || t.includes('excavation') || t.includes('earth') || t.includes('foundation') || t.includes('pcc') || t.includes('footing') || t.includes('plinth') || t.includes('basement')) return 'Sub Structure';
    if (t.includes('plaster') || t.includes('paint') || t.includes('floor') || t.includes('tile') || t.includes('electr') || t.includes('plumb') || t.includes('wood') || t.includes('window') || t.includes('door') || t.includes('finish')) return 'Finishing';
    return 'Super Structure';
  };

  const subStructureItems = workItems.filter(item => getCategory(item.title) === 'Sub Structure');
  const superStructureItems = workItems.filter(item => getCategory(item.title) === 'Super Structure');
  const finishingItems = workItems.filter(item => getCategory(item.title) === 'Finishing');
  const phaseProps = { measurements, updateMeasurements, calculateTotal, calculateQty };

  if (!workItems || workItems.length === 0) return <div className="flex flex-col items-center justify-center h-64 text-gray-400"><AlertTriangle size={48} className="mb-4 text-yellow-500" /><h3 className="text-lg font-bold">No Work Items Found</h3></div>;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-end mb-6 sticky top-20 bg-gray-50 pt-4 pb-4 z-40 border-b border-gray-200">
        <div><h2 className="text-2xl font-bold text-gray-800">Measurement Entry</h2><p className="text-gray-500 text-sm">Phase: <span className="text-blue-600 font-bold">{activeTab}</span></p></div>
        <div className="flex gap-2">
            <button onClick={() => setShowAutoFill(!showAutoFill)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-200 border border-blue-200 text-sm font-bold"><Settings2 size={16} /> Smart Setup</button>
            <button onClick={generatePDF} className="bg-black text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 shadow-xl text-sm font-bold"><FileDown size={16} /> Export PDF</button>
        </div>
      </div>

      {showAutoFill && <ProjectSetup globalParams={globalParams} setGlobalParams={setGlobalParams} onApply={handleAutoFill} />}

      <div className="flex gap-4 mb-8 border-b border-gray-200 pb-1 overflow-x-auto">
        {[{ id: 'Sub Structure', icon: Layers, color: 'text-blue-600', border: 'border-blue-600' }, { id: 'Super Structure', icon: Hammer, color: 'text-orange-600', border: 'border-orange-600' }, { id: 'Finishing', icon: PaintBucket, color: 'text-purple-600', border: 'border-purple-600' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative top-[1px] whitespace-nowrap ${activeTab === tab.id ? `border-b-2 ${tab.border} ${tab.color} bg-white rounded-t-lg shadow-sm` : 'text-gray-500 hover:text-gray-700'}`}><tab.icon size={16} /> {tab.id}</button>
        ))}
      </div>

      <div className="animate-fade-in min-h-[300px]">
        {activeTab === 'Sub Structure' && <SubStructure items={subStructureItems} {...phaseProps} indexOffset={0} />}
        {activeTab === 'Super Structure' && <SuperStructure items={superStructureItems} {...phaseProps} indexOffset={subStructureItems.length} />}
        {activeTab === 'Finishing' && <Finishing items={finishingItems} {...phaseProps} indexOffset={subStructureItems.length + superStructureItems.length} />}
      </div>
    </div>
  );
}