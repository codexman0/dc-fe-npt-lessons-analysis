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

export const getInitFormationFilters = (initFilter, lithologyPickList) => {
  if (initFilter.settings) {
    return initFilter;
  }

  return {
    ...initFilter,
    settings: {
      ...lithologyPickList,
      showLithology: {
        on: true,
        displayName: 'Lithology',
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

// Note: formalize the depth information to match with other collection data strcuture
function getRevisedFormationsData(wellData) {
  const { formationsData } = wellData;

  const newFormationsData = [];
  formationsData.forEach((formation, index) => {
    const nextFormation = formationsData[index + 1];

    const endDepth = nextFormation ? nextFormation.data.md : 0;
    const endDepthTvd = nextFormation ? nextFormation.data.td : 0;

    newFormationsData.push({
      ...formation,
      data: {
        ...formation.data,
        start_depth: formation.data.md,
        start_depth_tvd: formation.data.td,
        end_depth: endDepth,
        end_depth_tvd: endDepthTvd,
      },
    });
  });

  return newFormationsData;
}

function getDirectionalData(wellData) {
  const {
    planSurveyData: { stations },
  } = wellData;

  if (!stations || !stations.length) {
    return [];
  }

  const firstStation = stations[0];
  const lastStation = stations[stations.length - 1];
  const beginCriticalPoint = {
    ...firstStation,
    critical_point: 'Beginning of well',
  };

  const lastCriticalPoint = {
    ...lastStation,
    critical_point: 'End of well',
  };

  const criticalPoints = stations.filter(station => station.critical_point);

  const directionData = [beginCriticalPoint, ...criticalPoints, lastCriticalPoint];

  return directionData;
}

export const processWellsData = (rawWellsData, nptPickList) => {
  const wellsData = rawWellsData.map(wellData => {
    const nptData = getFilteredNptData(wellData, nptPickList);
    const formationsData = getRevisedFormationsData(wellData);
    const directionalData = getDirectionalData(wellData);

    return {
      ...wellData,
      nptData,
      formationsData,
      directionalData,
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

export const injectLiveData = (wellsData, liveWellData) => {
  return wellsData.map(wellData => {
    if (wellData.assetId !== liveWellData.assetId || liveWellData.hasError) {
      return wellData;
    }

    return {
      ...wellData,
      witData: liveWellData.witData,
      phaseData: liveWellData.phaseData,
    };
  });
};

export function getInitZoom(prevZoom, defaultZoom) {
  if (prevZoom && prevZoom[1] < defaultZoom[1]) {
    return prevZoom;
  }
  return defaultZoom;
}
