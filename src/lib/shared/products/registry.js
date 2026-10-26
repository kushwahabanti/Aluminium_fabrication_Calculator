/**
 * registry.js — Product Registry
 * Master list of all available product types.
 */
'use strict';

import { validateProduct } from './baseProduct.js';
import slidingWindow2Track from './types/slidingWindow2Track.js';
import slidingWindow3Track from './types/slidingWindow3Track.js';
import casementWindow2Door from './types/casementWindow2Door.js';
import casementWindow4Door from './types/casementWindow4Door.js';
import aluminiumDoor from './types/aluminiumDoor.js';

const REGISTRY_MAP = {
  'sliding-window-2track': slidingWindow2Track,
  'sliding-window-3track': slidingWindow3Track,
  'casement-window-2door': casementWindow2Door,
  'casement-window-4door': casementWindow4Door,
  'aluminium-door':        aluminiumDoor,
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
