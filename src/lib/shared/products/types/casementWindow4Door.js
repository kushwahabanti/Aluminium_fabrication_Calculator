'use strict';

export default {
  id:          'casement-window-4door',
  name:        'Casement Window (4 Door Openable)',
  description: '4 Shutter / 4 Door Openable Casement Window',

  inputs: [
    { key: 'width',    label: 'Overall Width',  required: true },
    { key: 'height',   label: 'Overall Height', required: true },
  ],

  deductions: {
    frame_width_ded:    24,
    frame_height_ded:   24,
    mullion_width:      16, // Center mullion
    shutter_clearance:   8,
    glass_ded:          32,
  },

  formulas: [
    { key: 'outer_top',       formula: 'width' },
    { key: 'outer_bottom',    formula: 'width' },
    { key: 'outer_sides',     formula: 'height' },
    { key: 'mullion',         formula: 'height - frame_height_ded' },
    { key: 'shutter_height',  formula: 'height - frame_height_ded' },
    { key: 'shutter_width',   formula: '(width - frame_width_ded - mullion_width - shutter_clearance) / 4' },
    { key: 'glass_width',     formula: 'shutter_width - glass_ded' },
    { key: 'glass_height',    formula: 'shutter_height - glass_ded' },
  ],

  sections: [
    { key: 'outer_frame_top',    label: 'Outer Frame Top',    formula_key: 'outer_top',      qty: 1 },
    { key: 'outer_frame_bottom', label: 'Outer Frame Bottom', formula_key: 'outer_bottom',   qty: 1 },
    { key: 'outer_frame_sides',  label: 'Outer Frame Sides',  formula_key: 'outer_sides',    qty: 2 },
    { key: 'mullion_center',     label: 'Center Mullion',     formula_key: 'mullion',        qty: 1 },
    { key: 'shutter_vertical',   label: 'Shutter Vertical',   formula_key: 'shutter_height', qty: 8 },
    { key: 'shutter_horizontal', label: 'Shutter Horizontal', formula_key: 'shutter_width',  qty: 8 },
  ],

  glass: [
    { key: 'casement_glass', label: 'Casement Glass', width_key: 'glass_width', height_key: 'glass_height', qty: 4 }
  ],

  hardware: [
    { key: 'friction_stay',   label: 'Friction Stays / Hinges', qty: 8, qty_type: 'fixed' },
    { key: 'casement_handle', label: 'Casement Handle / Lock',  qty: 4, qty_type: 'fixed' },
    { key: 'tower_bolt',      label: 'Tower Bolts',             qty: 4, qty_type: 'fixed' },
    { key: 'rubber_gasket',   label: 'Rubber Gasket',           qty: 1, qty_type: 'glass_perimeter' },
  ],

  outputSections: ['sections', 'glass', 'hardware', 'cost', 'profit'],
};
