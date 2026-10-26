'use strict';

export default {
  id:          'aluminium-door',
  name:        'Aluminium Door (Openable Swing)',
  description: 'Standard Aluminium Openable Door with Top, Bottom, Middle Rails',

  inputs: [
    { key: 'width',    label: 'Overall Width',  required: true },
    { key: 'height',   label: 'Overall Height', required: true },
  ],

  deductions: {
    frame_width_ded:   20, // Outer frame thickness
    bottom_clearance:   8, // Floor clearance
    door_style_width:  32, // Style width deduction for rails
    glass_ded:         32,
  },

  formulas: [
    { key: 'frame_top',      formula: 'width' },
    { key: 'frame_sides',    formula: 'height' },
    { key: 'door_vertical',  formula: 'height - frame_width_ded - bottom_clearance' },
    { key: 'door_rail',      formula: 'width - frame_width_ded - (door_style_width * 2)' },
    { key: 'glass_top_w',    formula: 'door_rail + 16' },
    { key: 'glass_top_h',    formula: '(door_vertical / 2) - glass_ded' },
    { key: 'glass_bottom_w', formula: 'door_rail + 16' },
    { key: 'glass_bottom_h', formula: '(door_vertical / 2) - glass_ded' },
  ],

  sections: [
    { key: 'door_frame_top',     label: 'Door Frame Top',     formula_key: 'frame_top',     qty: 1 },
    { key: 'door_frame_sides',   label: 'Door Frame Sides',   formula_key: 'frame_sides',   qty: 2 },
    { key: 'door_vertical_style',label: 'Door Vertical Style',formula_key: 'door_vertical',qty: 2 },
    { key: 'door_top_rail',      label: 'Door Top Rail',      formula_key: 'door_rail',     qty: 1 },
    { key: 'door_middle_rail',   label: 'Door Middle Rail',   formula_key: 'door_rail',     qty: 1 },
    { key: 'door_bottom_rail',   label: 'Door Bottom Rail',   formula_key: 'door_rail',     qty: 1 },
  ],

  glass: [
    { key: 'door_glass_top',    label: 'Top Panel Glass',    width_key: 'glass_top_w',    height_key: 'glass_top_h',    qty: 1 },
    { key: 'door_glass_bottom', label: 'Bottom Panel Glass', width_key: 'glass_bottom_w', height_key: 'glass_bottom_h', qty: 1 }
  ],

  hardware: [
    { key: 'door_pivot_hinges', label: 'Door Hinges / Pivot',  qty: 3, qty_type: 'fixed' },
    { key: 'door_lock',         label: 'Door Lock & Handles',  qty: 1, qty_type: 'fixed' },
    { key: 'door_closer',       label: 'Hydraulic Door Closer',qty: 1, qty_type: 'fixed' },
  ],

  outputSections: ['sections', 'glass', 'hardware', 'cost', 'profit'],
};
