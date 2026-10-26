/**
 * registry.js — Product Registry
 * Master list of all available product types.
 */
'use strict';

import { validateProduct } from './baseProduct.js';
import slidingWindow2Track from './types/slidingWindow2Track.js';

const REGISTRY_MAP = {
  'sliding-window-2track': slidingWindow2Track,
};

// Validate all registered products on startup
for (const [id, product] of Object.entries(REGISTRY_MAP)) {
  try {
    validateProduct(product);
  } catch (err) {
    throw new Error(`[Registry] Product "${id}" failed validation: ${err.message}`);
  }
}

/**
 * Returns a product module by its type ID.
 * @param {string} type - e.g. 'sliding-window-2track'
 * @returns {Object} The validated product module
 */
function getProduct(type) {
  if (!type || typeof type !== 'string') {
    throw new Error('Product type must be a non-empty string');
  }
  const product = REGISTRY_MAP[type];
  if (!product) {
    const available = Object.keys(REGISTRY_MAP).join(', ');
    throw new Error(`Unknown product type: "${type}". Available: [${available}]`);
  }
  return product;
}

/**
 * Returns a summary list of all registered products.
 * @returns {{ id, name, description }[]}
 */
function listProducts() {
  return Object.values(REGISTRY_MAP).map(p => ({ id: p.id, name: p.name, description: p.description }));
}

export { getProduct, listProducts, REGISTRY_MAP };
