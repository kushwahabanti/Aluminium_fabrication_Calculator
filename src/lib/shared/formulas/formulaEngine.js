/**
 * formulaEngine.js
 * =====================================================================
 * Formula Engine — evaluates formula strings safely using mathjs.
 * All formulas come from the product definition, never hardcoded.
 * =====================================================================
 */
'use strict';

import { create, all } from 'mathjs';

// Create a restricted mathjs instance
const math = create(all);

// Disable dangerous functions
math.import({
  import:    function() { throw new Error('Function import is disabled'); },
  createUnit:function() { throw new Error('Function createUnit is disabled'); },
  simplify:  function() { throw new Error('Function simplify is disabled'); },
  derivative:function() { throw new Error('Function derivative is disabled'); },
}, { override: true });

// Known mathjs built-ins to exclude from variable extraction
const MATHJS_BUILTINS = new Set([
  'e', 'pi', 'i', 'Infinity', 'NaN', 'true', 'false', 'null',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
  'sqrt', 'cbrt', 'exp', 'log', 'log2', 'log10',
  'abs', 'ceil', 'floor', 'round', 'sign', 'min', 'max',
  'mod', 'pow', 'gcd', 'lcm', 'factorial',
]);

/**
 * Evaluates a formula string against a variable context.
 * @param {string} formula - e.g. "((width / 2) + overlap) - deduction"
 * @param {Object} context - e.g. { width: 868, overlap: 16 }
 * @returns {number} Integer result in internal units
 */
function evaluate(formula, context = {}) {
  if (!formula || typeof formula !== 'string' || formula.trim() === '') {
    throw new Error('Formula must be a non-empty string');
  }
  if (typeof context !== 'object' || context === null) {
    throw new Error('Context must be a plain object');
  }

  for (const [key, value] of Object.entries(context)) {
    if (typeof value !== 'number' || !isFinite(value)) {
      throw new Error(
        `Context variable "${key}" must be a finite number, got: ${JSON.stringify(value)}`
      );
    }
  }

  const trimmed = formula.trim();

  try {
    const node = math.parse(trimmed);
    const dummyScope = {};
    for (const key of Object.keys(context)) dummyScope[key] = 0;
    node.traverse(n => {
      if (n.type === 'SymbolNode' && !MATHJS_BUILTINS.has(n.name)) {
        if (!(n.name in dummyScope)) dummyScope[n.name] = 0;
      }
    });
    const dryResult = node.evaluate(dummyScope);
    if (typeof dryResult !== 'number' || !isFinite(dryResult)) {
      throw new Error(`Formula "${trimmed}" does not evaluate to a number`);
    }
  } catch (parseErr) {
    if (!parseErr.message.startsWith('Formula')) {
      throw new Error(`Formula error in "${trimmed}": ${parseErr.message}`);
    }
    throw parseErr;
  }

  try {
    const scope  = { ...context };
    const result = math.evaluate(trimmed, scope);

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error(`Formula "${trimmed}" returned a non-numeric result: ${result}`);
    }

    return Math.round(result);
  } catch (err) {
    const undefMatch = err.message.match(/Undefined symbol\s+(\w+)/i);
    if (undefMatch) {
      throw new Error(`Undefined variable "${undefMatch[1]}" in formula: "${trimmed}"`);
    }
    throw new Error(`Formula error in "${trimmed}": ${err.message}`);
  }
}

/**
 * Parses a formula and returns all user-defined variable names.
 * @param {string} formula
 * @returns {string[]} Sorted array of variable names
 */
function extractVariables(formula) {
  if (!formula || typeof formula !== 'string' || formula.trim() === '') {
    throw new Error('Formula must be a non-empty string');
  }

  try {
    const node      = math.parse(formula.trim());
    const variables = new Set();

    node.traverse(function (node) {
      if (node.type === 'SymbolNode' && !MATHJS_BUILTINS.has(node.name)) {
        variables.add(node.name);
      }
    });

    return [...variables].sort();
  } catch (err) {
    throw new Error(`Cannot parse formula "${formula}": ${err.message}`);
  }
}

/**
 * Checks whether a formula is valid with all variables present.
 * @param {string} formula
 * @param {Object} context
 * @returns {{ valid: boolean, error: string|null, missingVars: string[] }}
 */
function validateFormula(formula, context = {}) {
  let variables;
  try {
    variables = extractVariables(formula);
  } catch (err) {
    return { valid: false, error: err.message, missingVars: [] };
  }

  const contextKeys  = new Set(Object.keys(context));
  const missingVars  = variables.filter(v => !contextKeys.has(v));

  if (missingVars.length > 0) {
    return { valid: false, error: `Missing variables: ${missingVars.join(', ')}`, missingVars };
  }

  try {
    evaluate(formula, context);
    return { valid: true, error: null, missingVars: [] };
  } catch (err) {
    return { valid: false, error: err.message, missingVars: [] };
  }
}

/**
 * Evaluates a map of named formulas in dependency order.
 * @param {Object.<string,string>} formulaMap
 * @param {Object} baseContext
 * @returns {Object.<string,number>} Resolved results
 */
function resolveFormulas(formulaMap, baseContext = {}) {
  if (typeof formulaMap !== 'object' || formulaMap === null) {
    throw new Error('formulaMap must be a plain object');
  }

  const results = {};
  const context = { ...baseContext };
  const pending = { ...formulaMap };
  let maxPasses = Object.keys(pending).length;

  while (Object.keys(pending).length > 0) {
    if (maxPasses-- < 0) {
      const stuck = Object.keys(pending).join(', ');
      throw new Error(`Cannot resolve formula(s): [${stuck}] — check for missing base variables or circular dependencies`);
    }

    let resolvedThisPass = false;

    for (const [name, formula] of Object.entries(pending)) {
      let vars;
      try { vars = extractVariables(formula); } catch (_) { vars = []; }

      const allAvailable = vars.every(v => v in context);
      if (!allAvailable) continue;

      try {
        const result    = evaluate(formula, context);
        results[name]   = result;
        context[name]   = result;
        delete pending[name];
        resolvedThisPass = true;
      } catch (err) {
        throw err;
      }
    }

    if (!resolvedThisPass && Object.keys(pending).length > 0) {
      const stuck = Object.keys(pending).join(', ');
      throw new Error(`Cannot resolve formula(s): [${stuck}] — check for missing base variables or circular dependencies`);
    }
  }

  return results;
}

export { evaluate, extractVariables, validateFormula, resolveFormulas };
