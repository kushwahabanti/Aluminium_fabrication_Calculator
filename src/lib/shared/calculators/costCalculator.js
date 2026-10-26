/**
 * costCalculator.js
 * Calculates costs for materials and applies profit margins.
 */
'use strict';

/**
 * Calculates itemized costs based on materials and rates.
 * @param {Object} materials - Output from calculateMaterials
 * @param {Object} ratesData - { sections, hardwareItems, globalAluminiumRate }
 * @param {Object} selectedGlassRate - The glass rate object
 * @returns {Object} Cost breakdown
 */
function calculateCosts(materials, ratesData, selectedGlassRate) {
  const { hardwareItems } = ratesData;
  let totalAluminiumCost = 0;
  let totalGlassCost = 0;
  let totalHardwareCost = 0;

  const globalAluminiumRate = ratesData.globalAluminiumRate || 180;
  let totalAluminiumWeightKg = 0;

  const aluminiumCosts = materials.aluminium.map(req => {
    const cost = req.totalWeightKg * globalAluminiumRate;
    totalAluminiumWeightKg += req.totalWeightKg;
    return {
      name: req.name, label: req.label,
      weightKg: req.totalWeightKg, ratePerKg: globalAluminiumRate, cost
    };
  });

  totalAluminiumCost = totalAluminiumWeightKg * globalAluminiumRate;

  const glassRate = selectedGlassRate ? selectedGlassRate.rate_per_sqft : 0;
  totalGlassCost = materials.glass.totalAreaSqFt * glassRate;

  const hardwareCosts = materials.hardware.map(req => {
    const hwData = hardwareItems.find(h => h.name === req.name);
    const ratePerPiece = hwData ? hwData.rate_per_piece : 0;
    const cost = req.qty * ratePerPiece;
    totalHardwareCost += cost;
    return { name: req.name, label: req.label, qty: req.qty, rate: ratePerPiece, unit: req.unit, cost };
  });

  const totalMaterialCost = totalAluminiumCost + totalGlassCost + totalHardwareCost;

  return {
    itemized: {
      aluminium: aluminiumCosts,
      glass: { areaSqFt: materials.glass.areaSqFt, ratePerSqFt: glassRate, cost: totalGlassCost },
      hardware: hardwareCosts
    },
    totals: {
      aluminium: totalAluminiumCost,
      totalAluminiumWeightKg,
      glass: totalGlassCost,
      hardware: totalHardwareCost,
      materialOnly: totalMaterialCost
    }
  };
}

/**
 * Calculates selling price and profit based on per-window sqft rates.
 * @param {number} totalMaterialCost
 * @param {Array} projectList - Windows with customRate
 * @param {Array} windowResults - Calculator results with area data
 * @returns {Object} Pricing details
 */
function calculatePricing(totalMaterialCost, projectList, windowResults) {
  let sellingPrice = 0;
  let totalAreaSqFt = 0;

  projectList.forEach((proj, idx) => {
    const wRes = windowResults[idx];
    if (wRes && wRes.inputs) {
      const windowW = wRes.inputs.width || 0;
      const windowH = wRes.inputs.height || 0;
      const area = (windowW / 192) * (windowH / 192) * proj.qty;
      const rate = proj.customRate || 0;
      sellingPrice += area * rate;
      totalAreaSqFt += area;
    }
  });

  const netProfit = sellingPrice - totalMaterialCost;
  const marginPct = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

  return {
    makingCost: totalMaterialCost,
    sellingPrice,
    netProfit,
    marginPct,
    areaSqFt: totalAreaSqFt,
  };
}

export { calculateCosts, calculatePricing };
