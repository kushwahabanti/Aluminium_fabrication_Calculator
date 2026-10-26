/**
 * calculator.js — Dimension Calculator
 * Orchestrates: product module + formula engine → cut dimensions
 */
'use strict';

import { parseToUnits, formatOutput } from '../measurement/measurementEngine.js';
import { resolveFormulas } from '../formulas/formulaEngine.js';
import { getProduct } from '../products/registry.js';

/**
 * Runs a full dimension calculation for a product type.
 * @param {string} productType - e.g. 'sliding-window-2track'
 * @param {Object.<string, string|number>} rawInputs - Dimension inputs
 * @param {Object.<string, number>} deductions - Deduction values in internal units
 * @returns {Object} Calculation result with sections, dimensions, glass config
 */
function calculate(productType, rawInputs, deductions) {
  const product = getProduct(productType);

  // Validate required inputs
  const missingInputs = product.inputs
    .filter(i => i.required && !(i.key in rawInputs))
    .map(i => i.key);

  if (missingInputs.length > 0) {
    throw new Error(`Missing required inputs for "${product.name}": ${missingInputs.join(', ')}`);
  }

  // Parse raw inputs to integer units
  const parsedInputs = {};
  for (const inputDef of product.inputs) {
    const raw = rawInputs[inputDef.key];
    if (raw === undefined || raw === null) continue;

    const units = typeof raw === 'number' ? raw : parseToUnits(String(raw));
    if (units === null || (units === 0 && typeof raw === 'string' && raw.trim() !== '0')) {
      throw new Error(`Cannot parse input "${inputDef.key}": "${raw}" is not a valid measurement`);
    }
    if (!Number.isInteger(units) || units < 0) {
      throw new Error(`Input "${inputDef.key}" must be a positive integer in units, got: ${units}`);
    }
    parsedInputs[inputDef.key] = units;
  }

  // Build evaluation context
  const context = {
    ...parsedInputs,
    ...product.deductions,
    ...deductions,
  };

  // Resolve all formulas
  const formulaMap = {};
  product.formulas.forEach(f => { formulaMap[f.key] = f.formula; });
  const rawResults = resolveFormulas(formulaMap, context);

  // Format each result
  const dimensions = {};
  for (const [key, units] of Object.entries(rawResults)) {
    dimensions[key] = { ...formatOutput(units), label: key };
  }

  // Build section cut list
  const sections = product.sections.map(section => {
    const dimResult = dimensions[section.formula_key];
    if (!dimResult) {
      throw new Error(`Section "${section.label}" references formula key "${section.formula_key}" which was not computed`);
    }
    return {
      sectionKey:  section.key,
      description: section.label,
      formulaKey:  section.formula_key,
      qty:         section.qty,
      cutSize:     dimResult,
    };
  });

  return {
    productId:      product.id,
    productName:    product.name,
    inputs:         parsedInputs,
    dimensions,
    sections,
    glassConfig:    product.glass,
    hardwareConfig: product.hardware,
  };
}

export { calculate };
