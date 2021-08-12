/* eslint-disable no-underscore-dangle */
import { getUnitDisplay } from '@corva/ui/utils'; // song

export const getInitHazardFilters = (initFilter, nptPickList) => {
  if (initFilter.settings) {
    return initFilter;
  }

  return {
    ...initFilter,
    settings: {
      ...nptPickList,
      offsetWellHazards: {
        on: true,
        displayName: 'Offset Well Hazards',
        order: 1,
      },
    },
  };
};

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

function getFilteredNptData(wellData, nptPickList) {
  const { nptData } = wellData;

  const newNptData = [];
  nptData.forEach(npt => {
    const nptMeta = nptPickList[npt.data.type];

    if (nptMeta) {
      newNptData.push({
        ...npt,
        data: {
          ...npt.data,
          display_name: nptMeta.displayName,
        },
      });
    }
  });

  return newNptData;
}

export const processWellsData = (rawWellsData, nptPickList) => {
  const wellsData = rawWellsData.map(wellData => {
    const nptData = getFilteredNptData(wellData, nptPickList);
    return {
      ...wellData,
      nptData,
    };
  });

  const [subjectWellData, ...offsetWellsData] = wellsData;

  // subject well data needs to show all npt events from offset wells
  const allNptData = wellsData
    .reduce((result, wellData) => {
      const { nptData } = wellData;
      return result.concat(nptData);
    }, [])
    .sort((a, b) => a.data.depth - b.data.depth);

  return [
    {
      ...subjectWellData,
      nptData: allNptData,
    },
    ...offsetWellsData,
  ];
};

export function getInitZoom(prevZoom, defaultZoom) {
  if (prevZoom && prevZoom[1] < defaultZoom[1]) {
    return prevZoom;
  }
  return defaultZoom;
}

export const getHazardGroups = (assetId, nptData, hazardFilters, zoom) => {
  if (!hazardFilters.on) {
    return [];
  }

  const groupSize = (zoom[1] - zoom[0]) / 100;
  const hazards = [];
  nptData.forEach(npt => {
    const shouldIncludeOffsetWells = hazardFilters.settings.offsetWellHazards.on;
    const isOn = hazardFilters.settings[npt.data.type].on;
    const isInDepthRange = npt.data.depth >= zoom[0] && npt.data.depth <= zoom[1];

    if (
      (shouldIncludeOffsetWells || (!shouldIncludeOffsetWells && npt.asset_id === assetId)) &&
      isOn &&
      isInDepthRange
    ) {
      hazards.push({
        id: npt._id,
        type: npt.data.type,
        depth: npt.data.depth,
        color: hazardFilters.settings[npt.data.type].color,
      });
    }
  });

  const groups = [];
  hazards.forEach(hazard => {
    const lastGroup = groups.length ? groups[groups.length - 1] : null;

    if (lastGroup && hazard.depth - lastGroup.depth <= groupSize) {
      // update last group
      lastGroup.hazards.push(hazard);
    } else {
      // create new group
      const newGroup = {
        depth: hazard.depth,
        hazards: [hazard],
      };
      groups.push(newGroup);
    }
  });

  return groups;
};
