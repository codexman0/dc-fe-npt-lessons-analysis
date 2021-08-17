/* eslint-disable no-underscore-dangle */
import { get } from 'lodash';
import { getUnitDisplay } from '@corva/ui/utils';

import { MIN_CASING_LABEL_HEIGHT } from '../constants';

export const getMaxDepth = wellsData => {
  const lengthUnit = getUnitDisplay('length');
  const maxDepth = wellsData.reduce((result, { holeSectionData, casingData }) => {
    if (holeSectionData.length && casingData.length) {
      const lastSection = holeSectionData[holeSectionData.length - 1];
      const lastCasing = casingData[casingData.length - 1];
      return Math.max(result, lastSection.data.bottom_depth, lastCasing.data.bottom_depth);
    }

    return result;
  }, 0);

  let tick;
  if (lengthUnit === 'ft') {
    tick = 2000;
  } else if (lengthUnit === 'm') {
    tick = 500;
  } else if (tick === 'km') {
    tick = 1;
  }

  if (tick) {
    const nearByMaxDepth = Math.ceil(maxDepth / tick) * tick;

    return nearByMaxDepth - maxDepth < tick / 4 ? nearByMaxDepth + tick : nearByMaxDepth;
  }

  return maxDepth;
};

export const sortDepthWellsData = rawWellsData => {
  const wellsData = rawWellsData.map(wellData => {
    const nptData = wellData.nptData.sort((i, j) => i.data.depth - j.data.depth);
    const lessonsData = wellData.lessonsData.sort((i, j) => i.data.depth - j.data.depth);
    return {
      ...wellData,
      nptData,
      lessonsData,
    };
  });
  return wellsData;
};

export function getInitZoom(prevZoom, defaultZoom) {
  if (prevZoom && prevZoom[1] < defaultZoom[1]) {
    return prevZoom;
  }
  return defaultZoom;
}

export const getNptGroups = (nptData, nptFilters, zoom) => {
  if (!nptFilters || nptFilters.length === 0) {
    return [];
  }
  const groupSize = (zoom[1] - zoom[0]) / 100;
  const npts = [];
  nptData.forEach(npt => {
    const isInDepthRange = npt.data.depth >= zoom[0] && npt.data.depth <= zoom[1];

    if (isInDepthRange) {
      const nptFilter = nptFilters.find(item => item.key === get(npt, ['data', 'type']));
      npts.push({
        id: npt._id,
        type: npt.data.type,
        depth: npt.data.depth,
        color: nptFilter
          ? nptFilter.color
          : `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      });
    }
  });

  const groups = [];
  npts.forEach(npt => {
    const lastGroup = groups.length ? groups[groups.length - 1] : null;

    if (lastGroup && npt.depth - lastGroup.depth <= groupSize) {
      // update last group
      lastGroup.hazards.push(npt);
    } else {
      // create new group
      const newGroup = {
        depth: npt.depth,
        hazards: [npt],
      };
      groups.push(newGroup);
    }
  });

  return groups;
};

export const getLessonsGroups = (lessonsData, lessonsFilters, zoom) => {
  if (!lessonsFilters || lessonsFilters.length === 0) {
    return [];
  }
  const groupSize = (zoom[1] - zoom[0]) / 100;
  const lessons = [];
  lessonsData.forEach(lesson => {
    const isInDepthRange = lesson.data.depth >= zoom[0] && lesson.data.depth <= zoom[1];

    if (isInDepthRange) {
      // const lessonFilter = lessonsFilters.find(item => item.key === get(lesson, ['data', 'type']));
      lessons.push({
        id: lesson._id,
        type: lesson.data.type,
        depth: lesson.data.depth,
        title: lesson.data.topic,
      });
    }
  });

  const groups = [];
  lessons.forEach(lesson => {
    const lastGroup = groups.length ? groups[groups.length - 1] : null;

    if (lastGroup && lesson.depth - lastGroup.depth <= groupSize) {
      // update last group
      lastGroup.hazards.push(lesson);
    } else {
      // create new group
      const newGroup = {
        depth: lesson.depth,
        hazards: [lesson],
      };
      groups.push(newGroup);
    }
  });

  return groups;
};

// Note: This function mainly adjusts the depth of section, casing, and bhas
// to prevent them from overlapping
export const getAdjustedLabelData = (pxPerUnit, allCasings) => {
  const concated = [];

  allCasings.forEach(casing => {
    const {
      _id: id,
      collection,
      data: { outer_diameter: size, linear_weight: weight, grade, bottom_depth: depth },
    } = casing;

    const textPieces = [];
    textPieces.push(`${size}"`);
    textPieces.push(`${weight.fixFloat(1)}#`);
    textPieces.push(grade);
    const text = textPieces.join(' ');

    concated.push({
      collection,
      id,
      depth,
      text,
      showIcon: true,
    });
  });
  concated.sort((i, j) => i.depth - j.depth);

  const casings = [];
  let minDepth;

  const casingLabelHeight = MIN_CASING_LABEL_HEIGHT; // : MAX_CASING_LABEL_HEIGHT;

  concated.forEach(record => {
    const newRecord = {
      ...record,
      depth: !Number.isFinite(minDepth) ? record.depth : Math.max(minDepth, record.depth),
    };
    if (newRecord.collection === 'data.casing') {
      casings.push(newRecord);
      minDepth = newRecord.depth + casingLabelHeight / pxPerUnit;
    }
  });

  return {
    casings,
  };
};
