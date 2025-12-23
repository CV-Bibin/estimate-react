import React, { useState, useEffect, useMemo } from "react";

// --- Imported Managers ---
import OpeningManager from "./OpeningManager";
import BeamLintelManager from "./BeamLintelManager";
import ColumnDeductionManager from "../Setup/ColumnDeductionManager";
import FinalEstimates from "../Setup/FinalEstimates";

// --- Imported Components ---
import BaseDimensionsInput from "./BaseDimensionsInput";
import WallSchedule from "./WallSchedule";
import WallAdjustments from "./WallAdjustments";

export default function PlinthDataInput({
  floorName,
  initialData = {},
  initialExt,
  initialInt,
  projectCustomWalls = [],
  projectOpenAreas = [],
  projectConcealedColumns = [],
  projectOpenColumns = [],
  onSave,
}) {
  // --- SAFEGUARDS & UTILS ---
  const handleMathInput = (val) =>
    val ? String(val).replace(/[^0-9+\-*/. ]/g, "") : "";

  const evaluateMath = (val) => {
    try {
      if (val === undefined || val === null || val === "") return 0;
      if (typeof val === "object") return 0;
      const cleanVal = String(val).replace(/[^0-9+\-*/. ]/g, "");
      if (!cleanVal) return 0;
      // eslint-disable-next-line no-new-func
      const result = new Function("return " + cleanVal)();
      return parseFloat(result) || 0;
    } catch (e) {
      return 0;
    }
  };

  const safeNum = (n) => {
    const parsed = parseFloat(n);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeFloat = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  const isGroundFloor = floorName
    ? floorName.toLowerCase().includes("ground")
    : false;

  // --- 1. STATE INITIALIZATION ---
  const [data, setData] = useState(() => {
    const initialCustomWalls =
      initialData.customWalls ||
      (isGroundFloor
        ? projectCustomWalls.map((w) => ({
            id: w.id,
            name: w.name,
            l: w.length,
            b: w.width,
            h: 3.0,
            isPlinthExempt: w.isPlinthExempt,
          }))
        : []);

    let initialOpenAreaBeams = initialData.openAreaBeams || [];
    if (
      initialOpenAreaBeams.length === 0 &&
      projectOpenAreas.length > 0 &&
      isGroundFloor
    ) {
      initialOpenAreaBeams = projectOpenAreas.map((oa) => {
        const isCourtyard = oa.type === "Courtyard";
        const defaultLen = isCourtyard
          ? `${oa.touchingLen}+${oa.freeLen}`
          : oa.freeLen;
        return {
          id: oa.id,
          name: oa.type,
          details: `Touching: ${evaluateMath(oa.touchingLen).toFixed(
            2
          )}m, Free: ${evaluateMath(oa.freeLen).toFixed(2)}m`,
          l: defaultLen,
          b: 0.23,
          d: 0.45,
          heightFromFloor: 3.0,
        };
      });
    }

    return {
      plinthArea: initialData.plinthArea || "",
      plinthPerimeter: initialData.plinthPerimeter || "",
      deductionVol: initialData.deductionVol || "",
      deductionCols: initialData.deductionCols || "",
      deductionArea: initialData.deductionArea || "",
      deductionCarpet: initialData.deductionCarpet || "",
      extWall: initialData.extWall || {
        l: initialExt?.l || 0,
        b: initialExt?.b || 0.23,
        h: 3.0,
      },
      intWall: initialData.intWall || {
        l: initialInt?.l || 0,
        b: initialInt?.b || 0.23,
        h: 3.0,
      },

      customWalls: Array.isArray(initialCustomWalls) ? initialCustomWalls : [],
      irregularWalls: Array.isArray(initialData.irregularWalls)
        ? initialData.irregularWalls
        : [],
      openings: Array.isArray(initialData.openings) ? initialData.openings : [],
      openAreaBeams: Array.isArray(initialOpenAreaBeams)
        ? initialOpenAreaBeams
        : [],
      mainBeams: initialData.mainBeams || { concealed: [], drop: [] },
      lintels: initialData.lintels || { deductions: [], thickness: 0.15 },
      manualColumnDeductions: Array.isArray(initialData.manualColumnDeductions) ? initialData.manualColumnDeductions : [],
    };
  });

  const [stats, setStats] = useState({
    scheduleVol: 0,
    scheduleArea: 0,
    totalWallLen: 0,
    adjustVol: 0,
    adjustArea: 0,
    grossVol: 0,
    openVol: 0,
    netVol: 0,
    grossArea: 0,
    openAreaDed: 0,
    netArea: 0,
    plinthA: 0,
    footprint: 0,
    netCarpet: 0,
    grossLintelVol: 0,
    lintelVol: 0,
    beamVolConcealed: 0,
    beamVolDrop: 0,
    beamVolOpen: 0,
    beamVolTotal: 0,
    columnVol: 0,
    concreteVolume: 0,
  });

  useEffect(() => {}, [floorName]);

  // --- 2. CALCULATED DERIVED VALUES ---
  const availableWallWidths = useMemo(() => {
    const widths = new Set();
    if (data.extWall?.b) widths.add(parseFloat(data.extWall.b) || 0.23);
    if (data.intWall?.b) widths.add(parseFloat(data.intWall.b) || 0.23);
    if (Array.isArray(data.customWalls))
      data.customWalls.forEach((w) => {
        if (w && w.b) widths.add(parseFloat(w.b) || 0);
      });
    if (Array.isArray(data.irregularWalls))
      data.irregularWalls.forEach((w) => {
        if (w && w.b) widths.add(parseFloat(w.b) || 0);
      });
    return [...widths].sort((a, b) => b - a);
  }, [data.extWall, data.intWall, data.customWalls, data.irregularWalls]);

  // --- 3. AUTO-CALCULATE COLUMN VOLUME (Memoized) ---
  const autoColumnVol = useMemo(() => {
    const list = data.manualColumnDeductions || [];
    
    const val = (v) => {
      try {
        if (!v) return 0;
        const cleanVal = String(v).replace(/[^0-9+\-*/. ]/g, "");
        // eslint-disable-next-line no-new-func
        const result = new Function("return " + cleanVal)();
        return parseFloat(result) || 0;
      } catch { return 0; }
    };

    return list.reduce((sum, col) => {
       const l = val(col.l);
       const b = val(col.b);
       const h = val(col.h);
       const nos = val(col.nos);
       return sum + (l * b * h * nos);
    }, 0);

  }, [data.manualColumnDeductions]); 

  // --- 4. MAIN CALCULATIONS ---
  useEffect(() => {
    const val = (v) => evaluateMath(v);

    // 1. WALLS
    let scheduleVol = 0;
    let scheduleArea = 0;
    let footprint = 0;
    let totalLen = 0;
    let totalLintelVol = 0;

    const processWall = (w, isExempt) => {
      if (!w) return;
      const l = val(w.l);
      const b = val(w.b);
      const h = val(w.h);
      const v = l * b * h;
      const a = l * h * 2;
      totalLen += l;
      scheduleVol += v;
      scheduleArea += a;
      if (!isExempt) footprint += l * b;
      totalLintelVol += l * b * 0.15;
    };

    if (data.extWall) processWall(data.extWall, false);
    if (data.intWall) processWall(data.intWall, false);
    if (Array.isArray(data.customWalls))
      data.customWalls.forEach((w) => processWall(w, w.isPlinthExempt));

    // 2. ADJUSTMENTS
    let adjustVol = 0;
    let adjustArea = 0;
    if (Array.isArray(data.irregularWalls)) {
      data.irregularWalls.forEach((w) => {
        if (!w) return;
        const l = val(w.l);
        const b = val(w.b);
        const h = val(w.h);
        if (w.mode === "deduct") {
          adjustVol -= l * b * h;
          adjustArea -= l * h * 2;
        } else {
          adjustVol += l * b * h;
          adjustArea += l * h * 2;
          totalLen += l;
          if (w.mode === "add") footprint += l * b;
          totalLintelVol += l * b * 0.15;
        }
      });
    }

    // 3. LINTELS
    let manualLintelDeductVol = 0;
    if (data.lintels && Array.isArray(data.lintels.deductions)) {
      data.lintels.deductions.forEach((d) => {
        if (d)
          manualLintelDeductVol += val(d.l) * parseFloat(d.b || 0.23) * 0.15;
      });
    }
    const netLintelVol = Math.max(0, totalLintelVol - manualLintelDeductVol);

    // 4. BEAMS (Separate Totals)
    let volOpen = 0;
    let volConcealed = 0;
    let volDrop = 0;
    if (Array.isArray(data.openAreaBeams))
      data.openAreaBeams.forEach((b) => {
        if (b) volOpen += val(b.l) * val(b.b) * val(b.d);
      });
    if (data.mainBeams?.concealed && Array.isArray(data.mainBeams.concealed))
      data.mainBeams.concealed.forEach((b) => {
        if (b) volConcealed += val(b.l) * val(b.b) * val(b.d);
      });
    if (data.mainBeams?.drop && Array.isArray(data.mainBeams.drop))
      data.mainBeams.drop.forEach((b) => {
        if (b) volDrop += val(b.l) * val(b.b) * val(b.d);
      });

    const beamVolTotal = volOpen + volConcealed + volDrop;

    // 5. OPENINGS
    let openVol = 0;
    let openArea = 0;
    if (Array.isArray(data.openings)) {
      openVol = data.openings.reduce(
        (sum, o) =>
          sum +
          (o
            ? safeNum(o.width) *
              safeNum(o.height) *
              safeNum(o.wallSize) *
              safeNum(o.nos)
            : 0),
        0
      );
      openArea = data.openings.reduce(
        (sum, o) =>
          sum + (o ? safeNum(o.width) * safeNum(o.height) * safeNum(o.nos) : 0),
        0
      );
    }
    const openAreaDed = openArea * 2;

    const manVolDed = val(data.deductionVol);
    const manAreaDed = val(data.deductionArea);
    const manCarpetDed = val(data.deductionCarpet);

    // 6. NET TOTALS
    const grossVolTotal = safeNum(scheduleVol);
    const totalNetVol =
      grossVolTotal +
      safeNum(adjustVol) -
      safeNum(openVol) -
      safeNum(netLintelVol) -
      safeNum(volConcealed) -
      safeNum(autoColumnVol) -
      safeNum(manVolDed);

    const totalNetArea = scheduleArea + adjustArea - openAreaDed - manAreaDed;

    setStats({
      scheduleVol,
      scheduleArea,
      totalWallLen: totalLen,
      adjustVol,
      adjustArea,
      grossVol: grossVolTotal,
      openVol: openVol,
      netVol: totalNetVol,
      grossArea: scheduleArea + adjustArea,
      openAreaDed,
      netArea: totalNetArea,
      plinthA: val(data.plinthArea),
      footprint,
      netCarpet: val(data.plinthArea) - footprint - manCarpetDed,
      grossLintelVol: totalLintelVol,
      lintelVol: netLintelVol,
      beamVolConcealed: volConcealed,
      beamVolDrop: volDrop,
      beamVolOpen: volOpen,
      beamVolTotal: beamVolTotal,
      columnVol: autoColumnVol,
      concreteVolume: beamVolTotal + netLintelVol + autoColumnVol,
    });
  }, [data, autoColumnVol]);

  // --- HANDLERS ---
  const updateBaseWall = (type, field, val) => {
    const cleanVal =
      field === "l" || field === "b" ? handleMathInput(val) : val;
    setData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: cleanVal },
    }));
  };
  const updateField = (field, val) => {
    const cleanVal = handleMathInput(val);
    setData((prev) => ({ ...prev, [field]: cleanVal }));
  };

  const addWall = (type) => {
    const isExt = type === "exterior";
    const newWall = {
      id: Date.now() + Math.random(),
      name: isExt ? "Extra Ext. Wall" : "Partition Wall",
      l: "0",
      b: isExt ? "0.23" : "0.10",
      h: "3.0",
      isPlinthExempt: false,
    };
    setData((prev) => ({
      ...prev,
      customWalls: [...(prev.customWalls || []), newWall],
    }));
  };
  const updateCustomWall = (id, field, val) => {
    const cleanVal =
      field === "l" || field === "b" ? handleMathInput(val) : val;
    setData((prev) => ({
      ...prev,
      customWalls: (prev.customWalls || []).map((w) =>
        w.id === id ? { ...w, [field]: cleanVal } : w
      ),
    }));
  };
  const toggleCustomWallExempt = (id) =>
    setData((prev) => ({
      ...prev,
      customWalls: (prev.customWalls || []).map((w) =>
        w.id === id ? { ...w, isPlinthExempt: !w.isPlinthExempt } : w
      ),
    }));
  const removeCustomWall = (id) =>
    setData((prev) => ({
      ...prev,
      customWalls: (prev.customWalls || []).filter((w) => w.id !== id),
    }));

  const addAdjustment = (mode = "add") => {
    const newItem = {
      id: Date.now() + Math.random(),
      mode,
      name: mode === "deduct" ? "Deduction in Wall" : "Addition in Wall",
      l: "0",
      b: "0.23",
      h: mode === "deduct" ? "0.9" : "1.0",
    };
    setData((prev) => ({
      ...prev,
      irregularWalls: [
        ...(Array.isArray(prev.irregularWalls) ? prev.irregularWalls : []),
        newItem,
      ],
    }));
  };
  const updateAdjustment = (id, field, val) => {
    const cleanVal =
      field === "l" || field === "b" ? handleMathInput(val) : val;
    setData((prev) => ({
      ...prev,
      irregularWalls: (prev.irregularWalls || []).map((w) =>
        w && w.id === id ? { ...w, [field]: cleanVal } : w
      ),
    }));
  };
  const removeAdjustment = (id) => {
    setData((prev) => ({
      ...prev,
      irregularWalls: (prev.irregularWalls || []).filter(
        (w) => w && w.id !== id
      ),
    }));
  };

  const addMainBeam = (type) => {
    const newBeam = { id: Date.now() + Math.random(), l: "", b: 0.23, d: 0.45 };
    setData((prev) => ({
      ...prev,
      mainBeams: {
        ...prev.mainBeams,
        [type]: [...(prev.mainBeams[type] || []), newBeam],
      },
    }));
  };
  const updateMainBeam = (type, id, field, val) => {
    const cleanVal = field === "l" ? handleMathInput(val) : val;
    setData((prev) => ({
      ...prev,
      mainBeams: {
        ...prev.mainBeams,
        [type]: prev.mainBeams[type].map((b) =>
          b.id === id ? { ...b, [field]: cleanVal } : b
        ),
      },
    }));
  };
  const removeMainBeam = (type, id) => {
    setData((prev) => ({
      ...prev,
      mainBeams: {
        ...prev.mainBeams,
        [type]: prev.mainBeams[type].filter((b) => b.id !== id),
      },
    }));
  };
  const updateOpenAreaBeam = (id, field, val) => {
    const cleanVal =
      field === "l" ||
      field === "b" ||
      field === "d" ||
      field === "heightFromFloor"
        ? handleMathInput(val)
        : val;
    setData((prev) => ({
      ...prev,
      openAreaBeams: prev.openAreaBeams.map((b) =>
        b.id === id ? { ...b, [field]: cleanVal } : b
      ),
    }));
  };
  const addLintelDeduction = () => {
    const defaultWidth =
      availableWallWidths.length > 0 ? availableWallWidths[0] : 0.23;
    const newDeduction = {
      id: Date.now() + Math.random(),
      l: "",
      b: defaultWidth,
    };
    setData((prev) => ({
      ...prev,
      lintels: {
        ...prev.lintels,
        deductions: [...(prev.lintels.deductions || []), newDeduction],
      },
    }));
  };
  const updateLintelDeduction = (id, field, val) => {
    const cleanVal = field === "l" ? handleMathInput(val) : val;
    setData((prev) => ({
      ...prev,
      lintels: {
        ...prev.lintels,
        deductions: prev.lintels.deductions.map((d) =>
          d.id === id ? { ...d, [field]: cleanVal } : d
        ),
      },
    }));
  };
  const removeLintelDeduction = (id) => {
    setData((prev) => ({
      ...prev,
      lintels: {
        ...prev.lintels,
        deductions: prev.lintels.deductions.filter((d) => d.id !== id),
      },
    }));
  };

  const handleSaveTrigger = () => {
    if (onSave) onSave({ ...data, computed: stats });
  };

  // --- 5. PREPARE DATA FOR FINAL ESTIMATES ---
  // Combine all physical walls into one array for plaster calculation
  const allPhysicalWalls = useMemo(() => {
    return [
        data.extWall, 
        data.intWall, 
        ...(Array.isArray(data.customWalls) ? data.customWalls : [])
    ].filter(w => w && w.l !== "" && w.h !== "");
  }, [data.extWall, data.intWall, data.customWalls]);

  // Format Openings to match { w, h, nos } expected by FinalEstimates
  const formattedOpenings = useMemo(() => {
    return (data.openings || []).map(o => ({
        w: o.width, 
        h: o.height,
        nos: o.nos
    }));
  }, [data.openings]);

  // Combine Drop and Open Beams for Visible Beam Plaster Calculation
  const visibleBeams = useMemo(() => {
    return [
        ...(data.mainBeams?.drop || []), 
        ...(data.openAreaBeams || [])
    ];
  }, [data.mainBeams, data.openAreaBeams]);

  // *** FILTER OPEN COLUMNS ***
  // Filter the manualColumnDeductions list to find only those marked as 'open'
  const visibleColumns = useMemo(() => {
    return (data.manualColumnDeductions || []).filter(c => c.type === 'open');
  }, [data.manualColumnDeductions]);

  return (
    <div className="space-y-8">
      {/* 1. Base Dimensions */}
      <BaseDimensionsInput
        plinthArea={data.plinthArea}
        plinthPerimeter={data.plinthPerimeter}
        updateField={updateField}
      />

      {/* 2. Wall Schedule */}
      <WallSchedule
        extWall={data.extWall}
        intWall={data.intWall}
        customWalls={data.customWalls}
        isGroundFloor={isGroundFloor}
        updateBaseWall={updateBaseWall}
        addWall={addWall}
        updateCustomWall={updateCustomWall}
        toggleCustomWallExempt={toggleCustomWallExempt}
        removeCustomWall={removeCustomWall}
        evaluateMath={evaluateMath}
      />

      {/* 3. Wall Adjustments */}
      <WallAdjustments
        irregularWalls={data.irregularWalls}
        addAdjustment={addAdjustment}
        updateAdjustment={updateAdjustment}
        removeAdjustment={removeAdjustment}
      />

      {/* 4. Managers */}
      <OpeningManager
        floorName={floorName}
        openings={data.openings}
        setOpenings={(newOpenings) =>
          setData((prev) => ({ ...prev, openings: newOpenings }))
        }
        wallOptions={availableWallWidths}
      />

      <BeamLintelManager
        openAreaBeams={data.openAreaBeams}
        mainBeams={data.mainBeams}
        lintels={data.lintels}
        allColumns={projectConcealedColumns}
        columnVolume={safeFloat(stats.columnVol)}
        totalWallLength={safeFloat(stats.totalWallLen)}
        volConcealed={safeFloat(stats.beamVolConcealed)}
        volDrop={safeFloat(stats.beamVolDrop)}
        volOpen={safeFloat(stats.beamVolOpen)}
        beamVolume={safeFloat(stats.beamVolTotal)}
        lintelVolume={safeFloat(stats.lintelVol)}
        grossLintelVol={safeFloat(stats.grossLintelVol)}
        wallOptions={availableWallWidths}
        onAddMainBeam={addMainBeam}
        onUpdateMainBeam={updateMainBeam}
        onRemoveMainBeam={removeMainBeam}
        onUpdateOpenAreaBeam={updateOpenAreaBeam}
        onAddLintelDeduction={addLintelDeduction}
        onUpdateLintelDeduction={updateLintelDeduction}
        onRemoveLintelDeduction={removeLintelDeduction}
        evaluateMath={evaluateMath}
      />

      <ColumnDeductionManager
        manualColumnDeductions={
          Array.isArray(data.manualColumnDeductions)
            ? data.manualColumnDeductions
            : []
        }
        setManualColumnDeductions={(newList) => {
          const resolvedList =
            typeof newList === "function"
              ? newList(data.manualColumnDeductions || [])
              : newList;

          setData((prev) => ({
            ...prev,
            manualColumnDeductions: Array.isArray(resolvedList)
              ? resolvedList
              : [],
          }));
        }}
        projectConcealedColumns={projectConcealedColumns}
        projectOpenColumns={projectOpenColumns}
        evaluateMath={evaluateMath}
        safeFloat={safeFloat}
        safeNum={safeNum}
      />

      {/* 5. Final Estimates */}
      <FinalEstimates
        stats={stats}
        data={data}
        walls={allPhysicalWalls}
        openings={formattedOpenings}
        irregularWalls={data.irregularWalls || []}
        beams={visibleBeams}
        columns={visibleColumns}
        floorName={floorName}
        updateField={updateField}
        onSaveClick={handleSaveTrigger}
      />
    </div>
  );
}