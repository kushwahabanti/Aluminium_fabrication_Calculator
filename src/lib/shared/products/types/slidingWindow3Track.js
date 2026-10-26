'use strict';

export default {
  id:          'sliding-window-3track',
  name:        '3 Track Sliding Window (with Mesh)',
  description: '3 track aluminium sliding window (2 glass shutters + 1 mesh/mosquito shutter)',

  inputs: [
    { key: 'width',    label: 'Overall Width',  required: true },
    { key: 'height',   label: 'Overall Height', required: true },
  ],

  deductions: {
    handle_ded:        24,
    interlock_ded:     24,
    eff_width_ded:      6,
    shutter_inner_ded: 50,
    glass_add:         10,
    glass_height_ded:  50,
  },

  formulas: [
    { key: 'top_track',      formula: 'width' },
    { key: 'bottom_track',   formula: 'width' },
    { key: 'side_track',     formula: 'height' },
    { key: 'handle',         formula: 'height - handle_ded' },
    { key: 'interlock',      formula: 'height - interlock_ded' },
    { key: 'shutter_width',  formula: '(width - eff_width_ded) / 3' },
    { key: 'shutter_top',    formula: 'shutter_width - shutter_inner_ded' },
    { key: 'bearing_bottom', formula: 'shutter_width - shutter_inner_ded' },
    { key: 'glass_width',    formula: 'bearing_bottom + glass_add' },
    { key: 'glass_height',   formula: 'handle - glass_height_ded' },
    { key: 'mesh_width',     formula: 'bearing_bottom + glass_add' },
    { key: 'mesh_height',    formula: 'handle - glass_height_ded' },
  ],

  sections: [
    { key: 'top_track',      label: '3-Track Top',           formula_key: 'top_track',      qty: 1 },
    { key: 'bottom_track',   label: '3-Track Bottom',        formula_key: 'bottom_track',   qty: 1 },
    { key: 'side_track',     label: '3-Track Side',          formula_key: 'side_track',     qty: 2 },
    { key: 'handle',         label: 'Handle (Glass)',        formula_key: 'handle',         qty: 4 },
    { key: 'interlock',      label: 'Interlock (Glass)',     formula_key: 'interlock',      qty: 2 },
    { key: 'mesh_handle',    label: 'Mesh Handle / Section', formula_key: 'handle',         qty: 2 },
    { key: 'shutter_top',    label: 'Shutter Top',           formula_key: 'shutter_top',    qty: 3 },
    { key: 'bearing_bottom', label: 'Bearing Bottom',        formula_key: 'bearing_bottom', qty: 3 },
  ],

  glass: [
    { key: 'glass_shutter', label: 'Glass Shutters (2 nos)', width_key: 'glass_width', height_key: 'glass_height', qty: 2 },
    { key: 'mesh_shutter',  label: 'SS Wire Mesh (1 no)',    width_key: 'mesh_width',  height_key: 'mesh_height',  qty: 1 }
  ],

  hardware: [
    { key: 'roller',        label: 'Roller',        qty: 6,   qty_type: 'fixed' },
    { key: 'lock',          label: 'Lock',          qty: 2,   qty_type: 'fixed' },
    { key: 'rubber_gasket', label: 'Rubber Gasket', qty: 1,   qty_type: 'glass_perimeter' },
    { key: 'woolpile',      label: 'Woolpile',      qty: 6,   qty_type: 'window_perimeter' },
  ],

  outputSections: ['sections', 'glass', 'hardware', 'cost', 'profit'],
};
