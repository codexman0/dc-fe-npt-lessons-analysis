import {
  SMALL_BREAK_POINT,
  GUTTER_SIZE,
  HAZARD_SIZE,
  MIN_WELLBORE_LAYER_WIDTH,
  MAX_WELLBORE_LAYER_WIDTH,
  CASING_LAYER_WIDTH,
  HAZARD_LAYER_WIDTH,
  MIN_LABEL_LAYER_WIDTH,
} from '../constants';

export const getAppSize = (coordinates, isFeedItem) => {
  if (coordinates.w <= 3 || isFeedItem) {
    return 'phone';
  } else if (coordinates.w <= 5) {
    return 'pad';
  }

  return 'desktop';
};

const MARGIN_LEFT = 0;
const MARGIN_RIGHT = 1;
const MARGIN_TOP = 5;
const MARGIN_BOTTOM = 10;

// Note: In the main grid, it draws mud layer, hazard layer, casing, wellbore
// directional, and label layers
// Outside and right side of main grid, it draws formation and paramter layers
// In minimized mode, centerX should shift to right side
// It draws the inner most casing in the right casing layer and label layer.
// By shift centerX to to the right side, left side will have more space
// to draw the casing layer, mud layer, and hazard layer
export const getLayersInfo = (containerWidth, containerHeight, casingData) => {
  const isMinimized = containerWidth <= SMALL_BREAK_POINT;

  const marginLeft = MARGIN_LEFT;
  const marginTop = MARGIN_TOP;
  const marginRight = MARGIN_RIGHT;
  const marginBottom = MARGIN_BOTTOM;

  const gridWidth = containerWidth - marginLeft - marginRight;
  const gridHeight = containerHeight - marginTop - marginBottom;

  const casingWidth = CASING_LAYER_WIDTH / casingData.length;
  const wellboreWidth = isMinimized ? MIN_WELLBORE_LAYER_WIDTH : MAX_WELLBORE_LAYER_WIDTH;

  const centerX = isMinimized
    ? gridWidth - wellboreWidth / 2 - MIN_LABEL_LAYER_WIDTH - GUTTER_SIZE * 3
    : gridWidth / 2;

  const wellboreStartX = centerX - wellboreWidth / 2;
  // const wellboreStartX = CASING_LAYER_WIDTH;
  const wellboreEndX = wellboreStartX + wellboreWidth;

  const casingLeftEndX = wellboreStartX;
  const casingLeftStartX = casingLeftEndX - CASING_LAYER_WIDTH;
  const casingRightStartX = wellboreEndX;
  const casingRightEndX = casingRightStartX + CASING_LAYER_WIDTH;

  // const nptStartX = casingLeftStartX - HAZARD_LAYER_WIDTH - GUTTER_SIZE;
  const nptStartX = casingRightEndX + HAZARD_LAYER_WIDTH;
  const nptSize = HAZARD_SIZE;

  const learnedStartX = nptStartX + nptSize + 20;
  // const learnedStartX = casingRightEndX + nptSize;

  return {
    isMinimized,
    gridWidth,
    gridHeight,
    marginLeft,
    marginTop,
    casingLeftStartX,
    casingLeftEndX,
    casingRightStartX,
    casingRightEndX,
    casingWidth,
    nptStartX,
    nptSize,
    learnedStartX,
  };
};
