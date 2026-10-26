/**
 * baseProduct.js
 * =====================================================================
 * Base Product Interface Contract.
 * Every product module must export an object matching this shape.
 * =====================================================================
 */
'use strict';

const REQUIRED_FIELDS = [
  'id', 'name', 'description', 'inputs', 'formulas',
  'deductions', 'sections', 'glass', 'hardware', 'outputSections',
];

/**
 * Validates that a product module matches the base contract.
 * @param {Object} product - The product module object
 * @throws {Error} If the product is missing required fields
 */
function validateProduct(product) {
  if (!product || typeof product !== 'object') {
    throw new Error('Product module must export a plain object');
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in product)) {
      throw new Error(`Product module "${product.id || '?'}" is missing required field: "${field}"`);
    }
  }

  if (!Array.isArray(product.inputs) || product.inputs.length === 0) {
    throw new Error(`Product "${product.id}": inputs must be a non-empty array`);
  }

  if (!Array.isArray(product.formulas) || product.formulas.length === 0) {
    throw new Error(`Product "${product.id}": formulas must be a non-empty array`);
  }
  for (const f of product.formulas) {
    if (!f.key || !f.formula || typeof f.formula !== 'string') {
      throw new Error(`Product "${product.id}": each formula must have key and formula string`);
    }
  }

  if (typeof product.deductions !== 'object') {
    throw new Error(`Product "${product.id}": deductions must be an object`);
  }

  if (!Array.isArray(product.sections) || product.sections.length === 0) {
    throw new Error(`Product "${product.id}": sections must be a non-empty array`);
  }
  for (const section of product.sections) {
    if (!section.key || !section.formula_key || typeof section.qty !== 'number') {
      throw new Error(`Product "${product.id}": each section must have key, formula_key, qty. Got: ${JSON.stringify(section)}`);
    }
  }

  return true;
}

export { validateProduct, REQUIRED_FIELDS };
