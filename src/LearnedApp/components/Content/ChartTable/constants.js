export const GUTTER_SIZE = 5;
export const MAX_SECTION_LABEL_HEIGHT = 25;
export const MAX_CASING_LABEL_HEIGHT = 20;
export const MAX_BHA_LABEL_HEIGHT = 25;
export const MIN_SECTION_LABEL_HEIGHT = 20;
export const MIN_CASING_LABEL_HEIGHT = 20;
export const MIN_BHA_LABEL_HEIGHT = 20;
export const CRITICAL_POINT_LABEL_HEIGHT = 15;
export const BIT_HEIGHT = 35;
export const HOLE_DEPTH_LABEL_HEIGHT = 20;
export const BIT_DIRECTION_HEIGHT = 20;
export const TRIP_POINT_SIZE = 10;
export const HAZARD_SIZE = 10;

export const CASING_LAYER_WIDTH = 60;
export const HAZARD_LAYER_WIDTH = 20;
export const MIN_WELLBORE_LAYER_WIDTH = 35;
export const MAX_WELLBORE_LAYER_WIDTH = 50;
export const MIN_FORMATION_LAYER_WIDTH = 25;
export const MAX_FORMATION_LAYER_WIDTH = 140;
export const PARAMETERS_LAYER_WIDTH = 26;
export const MIN_LABEL_LAYER_WIDTH = 12;

export const SMALL_BREAK_POINT = 420;
export const MD_BREAK_POINT = 1024;
export const SHOW_FORMATION_LETTER_WIDTH = 768;

export const BIT_UP_STATES = ['Pull Out of Hole', 'Washing Up', 'Reaming Up'];
export const BIT_DOWN_STATES = ['Run In Hole', 'Washing Down', 'Reaming Down'];

export const SCHEMATIC_COLORS = {
  pdcBit: '#239FE6',
  triconeBit: '#085EDF',
  pdm: '#C208DF',
  stabilizer: 'yellow',
  other: '#8398A5',
  rss: '#dd375e',
  ur: '#44ff44',
};

export const DEFAULT_LITHOLOGY_COLOR = '#666666';

export const SUPPORTED_NPT_EVENTS = [
  { key: 'build rates', color: '#BB002E', displayName: 'Build Rates' },
  { key: 'H2S', color: '#85D947', displayName: 'H2S' },
  { key: 'fishing', color: '#FFE268', displayName: 'Fishing' },
  { key: 'well control', color: '#64B5F6', displayName: 'Well Control' },
  { key: 'geological sidetrack', color: '#FFBA00', displayName: 'Sidetrack' },
  { key: 'washout', color: '#F50258', displayName: 'Wash out' },
  { key: 'losses', color: '#FB4E32', displayName: 'Losses' },
  { key: 'stuck pipe', color: '#AC44F6', displayName: 'Stuck Pipe' },
  { key: 'packoff', color: '#38F7BE', displayName: 'Pack Off' },
];

export const DEFAULT_SETTINGS = {
  offsetSetting: {},
  holeSectionFilters: {
    on: true,
    settings: {
      name: { displayName: 'Name', order: 2, on: true },
      size: { displayName: 'Size', order: 3, on: true },
      icon: { displayName: 'Icon', order: 1, on: true },
      verticalSchematic: { displayName: 'Vertical Schematic', order: 4, on: true },
    },
  },
  casingFilters: {
    on: true,
    settings: {
      size: { displayName: 'Size', order: 2, on: true },
      weight: { displayName: 'Weight', order:4, on: true },
      grade: { displayName: 'Grade', order: 3, on: true },
      icon: { displayName: 'Icon', order: 1, on: true },
    },
  },
  drillstringFilters: {
    on: true,
    settings: {
      icon: { displayName: 'Icon', order: 1, on: true },
      tripPoints: { displayName: 'Trip Points', order: 3, on: true },
      bitDepthIndicator: { displayName: 'Bit Depth Indicator', order: 4, on: true },
      holeDepthIndicator: { displayName: 'Hole Depth Indicator', order: 6, on: true },
      bitDepthDirectionIndicator: { displayName: 'Bit Depth Direction Indicator', order: 7, on: true },
      activeBhaIndicator: { displayName: 'Active BHA Indicator', order: 5, on: false },
      bhaLegend: { displayName: 'BHA Legend', order: 2, on: false },
    },
  },
  mudFilters: {
    on: true,
    settings: {
      mudActual: { on: true, displayName: 'Actual Mud Weight Color', order: 2, color: '#ff0000' },
      mudPlan: { on: true, displayName: 'Planned Mud Weight Color', order: 1, color: '#FFC107' },
    },
  },
  // Note: granuler settings is subject to change dependant on lithology pick list.
  formationsFilters: {
    on: true,
  },
  directionalFilters: {
    on: true,
    settings: {
      icon: { on: true, displayName: 'Icon' },
      label: { on: true, displayName: 'Label' },
    },
  },
  // Note: granuler settings is subject to change dependant on npt pick list.
  hazardFilters: {
    on: true,
  },
  parametersFilters: {
    on: true,
    settings: {
      formation_name: { on: true, isHidden: true, widthRatio: 2 },
      md: { on: true, displayName: 'MD', order: 1, widthRatio: 1 },
      tvd: { on: true, displayName: 'TVD', order: 2, widthRatio: 1 },
      wob: { on: true, displayName: 'WOB', order: 3, widthRatio: 2 },
      diff_press: { on: true, displayName: 'Diff Press', order: 4, widthRatio: 1.5 },
      rpm: { on: true, displayName: 'RPM', order: 5, widthRatio: 2 },
      flow_in: { on: true, displayName: 'Flow In', order: 6, widthRatio: 1.5 },
      rop: { on: true, displayName: 'ROP', order: 7, widthRatio: 1.5 },
      mud_weight: { on: true, displayName: 'Mud Weight', order: 8, widthRatio: 1.5 },
      mse: { on: true, displayName: 'MSE', order: 9, widthRatio: 1.5 },
      scoring: { on: true, displayName: 'Scoring', order: 10, widthRatio: 0 },
    },
  },
};

export const SCORING_BG_COLORS = {
  optimal: '#4CAF50',
  low: '#FFF350',
  degraded: '#D32F2F',
};

export const SCORING_TEXT_COLORS = {
  optimal: '#fff',
  low: '#000',
  degraded: '#fff',
};
