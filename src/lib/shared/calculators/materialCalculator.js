/**
 * materialCalculator.js
 * Calculates total quantities, weights, and areas based on the cut list.
 */
'use strict';

/** Converts internal units (1/16th of an inch) to decimal feet. */
function unitsToFeet(units) {
  return units / (16 * 12);
}

/** Converts internal units to decimal square feet (for area calculation). */
function areaSqFt(widthUnits, heightUnits) {
  return unitsToFeet(widthUnits) * unitsToFeet(heightUnits);
}

/**
 * Calculates required material quantities from calculated products.
 * @param {Array<Object>} calcResults - Array of outputs from calculator
 * @param {Object} ratesData - { sections, hardwareItems } from DB
 * @param {number} [wastagePercent=10] - Percentage to add for cutting waste
 * @returns {Object} Material requirements summary
 */
function calculateMaterials(calcResults, ratesData, wastagePercent = 10) {
  if (!Array.isArray(calcResults)) {
    calcResults = [calcResults];
  }

  const { sections, hardwareItems } = ratesData;
  const wastageMultiplier = 1 + (wastagePercent / 100);

  // Initialize aluminium requirements
  const aluminiumReq = {};
  sections.forEach(s => {
    aluminiumReq[s.name] = {
      name: s.name, label: s.label,
      totalLengthFt: 0, totalWeightKg: 0, stockLengthsNeeded: 0
    };
  });

  let totalGlassAreaSqFt = 0;
  let totalWindowAreaSqFt = 0;
  const hardwareReq = {};

  // Accumulate from all results
  calcResults.forEach(calcResult => {
    const { sections: cutList, dimensions, glassConfig, hardwareConfig, inputs } = calcResult;

    // Sum aluminium lengths
    cutList.forEach(cut => {
      if (aluminiumReq[cut.sectionKey]) {
        const lengthFt = unitsToFeet(cut.cutSize.units) * cut.qty;
        aluminiumReq[cut.sectionKey].totalLengthFt += lengthFt;
      }
    });

    // Glass area
    if (glassConfig && glassConfig.length > 0) {
      glassConfig.forEach(g => {
        const wUnits = dimensions[g.width_key]?.units || 0;
        const hUnits = dimensions[g.height_key]?.units || 0;
        totalGlassAreaSqFt += areaSqFt(wUnits, hUnits) * g.qty;
      });
    }

    // Glass perimeter for hardware
    let totalGlassPerimeterUnits = 0;
    if (glassConfig && glassConfig.length > 0) {
      glassConfig.forEach(g => {
        const wUnits = dimensions[g.width_key]?.units || 0;
        const hUnits = dimensions[g.height_key]?.units || 0;
        totalGlassPerimeterUnits += (wUnits + hUnits) * 2;
      });
    }

    const windowW = inputs.width || 0;
    const windowH = inputs.height || 0;
    const totalWindowPerimeterUnits = (windowW + windowH) * 2;
    totalWindowAreaSqFt += areaSqFt(windowW, windowH);

    // Hardware & Accessories
    if (hardwareConfig && hardwareConfig.length > 0) {
      hardwareConfig.forEach(hw => {
        let reqQty = hw.qty;
        let itemUnit = 'piece';

        if (hw.qty_type === 'glass_perimeter') {
          reqQty = unitsToFeet(totalGlassPerimeterUnits) * hw.qty;
          itemUnit = 'per_foot';
        } else if (hw.qty_type === 'window_perimeter') {
          reqQty = unitsToFeet(totalWindowPerimeterUnits) * hw.qty;
          itemUnit = 'per_foot';
        } else if (hw.qty_type === 'per_shutter') {
          reqQty = hw.qty * 2;
        }

        const hwKey = hw.key || hw.name;
        if (!hardwareReq[hwKey]) {
          const dbHardware = hardwareItems?.find(i => i.name === hwKey || i.id === hwKey) || {};
          hardwareReq[hwKey] = {
            name: hwKey,
            label: dbHardware.label || hwKey.replace(/_/g, ' '),
            unit: dbHardware.unit || itemUnit,
            qty: 0
          };
        }
        hardwareReq[hwKey].qty += reqQty;
      });
    }
  });

  // Calculate weights and stock lengths
  Object.values(aluminiumReq).forEach(req => {
    const sectionData = sections.find(s => s.name === req.name);
    if (sectionData && req.totalLengthFt > 0) {
      const lengthWithWastage = req.totalLengthFt * wastageMultiplier;
      const stockLengthFt = sectionData.stock_length_ft || 16;
      req.totalWeightKg = (lengthWithWastage / stockLengthFt) * (sectionData.weight_per_bar || 0);
      req.stockLengthsNeeded = Math.ceil(lengthWithWastage / stockLengthFt);
    }
  });

  const usedAluminium = Object.values(aluminiumReq).filter(req => req.totalLengthFt > 0);
  const usedHardware = Object.values(hardwareReq).filter(req => req.qty > 0);

  return {
    aluminium: usedAluminium,
    glass: { totalAreaSqFt: totalGlassAreaSqFt },
    hardware: usedHardware,
    totals: { windowAreaSqFt: totalWindowAreaSqFt }
  };
}

export { unitsToFeet, areaSqFt, calculateMaterials };
