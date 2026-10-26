'use strict';

export default {
  id:          'casement-window-2door',
  name:        'Casement Window (2 Door Openable)',
  description: '2 Shutter / 2 Door Openable Casement Window',

  inputs: [
    { key: 'width',    label: 'Overall Width',  required: true },
    { key: 'height',   label: 'Overall Height', required: true },
  ],

  deductions: {
    frame_width_ded:    24, // Outer frame deduction
    frame_height_ded:   24,
    shutter_clearance:   4, // Center clearance between 2 shutters
    glass_ded:          32,
  },

  formulas: [
    { key: 'outer_top',       formula: 'width' },
    { key: 'outer_bottom',    formula: 'width' },
    { key: 'outer_sides',     formula: 'height' },
    { key: 'shutter_height',  formula: 'height - frame_height_ded' },
    { key: 'shutter_width',   formula: '(width - frame_width_ded - shutter_clearance) / 2' },
    { key: 'glass_width',     formula: 'shutter_width - glass_ded' },
    { key: 'glass_height',    formula: 'shutter_height - glass_ded' },
  ],

  sections: [
    { key: 'outer_frame_top',    label: 'Outer Frame Top',    formula_key: 'outer_top',      qty: 1 },
    { key: 'outer_frame_bottom', label: 'Outer Frame Bottom', formula_key: 'outer_bottom',   qty: 1 },
    { key: 'outer_frame_sides',  label: 'Outer Frame Sides',  formula_key: 'outer_sides',    qty: 2 },
    { key: 'shutter_vertical',   label: 'Shutter Vertical',   formula_key: 'shutter_height', qty: 4 },
    { key: 'shutter_horizontal', label: 'Shutter Horizontal', formula_key: 'shutter_width',  qty: 4 },
  ],

  glass: [
    { key: 'casement_glass', label: 'Casement Glass', width_key: 'glass_width', height_key: 'glass_height', qty: 2 }
  ],

  hardware: [
    { key: 'friction_stay', label: 'Friction Stays / Hinges', qty: 4, qty_type: 'fixed' },
    { key: 'casement_handle', label: 'Casement Handle / Lock', qty: 2, qty_type: 'fixed' },
    { key: 'rubber_gasket', label: 'Rubber Gasket', qty: 1, qty_type: 'glass_perimeter' },
  ],

  outputSections: ['sections', 'glass', 'hardware', 'cost', 'profit'],
};
