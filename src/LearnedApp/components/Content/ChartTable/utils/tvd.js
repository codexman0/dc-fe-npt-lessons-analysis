import uniq from 'lodash/uniq'; // song
import get from 'lodash/get';

import { getTask, postTask } from '@corva/ui/clients/jsonApi';
import { METADATA } from './meta';

function delay(second) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(second);
    }, second * 1000);
  });
}

export const postTvdRequest = async (assetId, depthArray, isSurveyActualNotEmpty) => {
  const { provider, recordCollections } = METADATA;
  const task = {
    provider,
    app_key: recordCollections.tvdTranslator,
    asset_id: assetId,
    properties: {
      action: 'measured_depth_to_station',
      survey_source: isSurveyActualNotEmpty ? 'data.actual_survey' : 'data.plan_survey',
      measured_depth: depthArray,
    },
  };

  let result;
  try {
    result = await postTask({ task });
  } catch (e) {
    return null;
  }

  return result.id;
};

export const getTvdResponse = async taskId => {
  let response;
  try {
    response = await getTask(taskId);
  } catch (e) {
    return null;
  }

  const taskState = response.state;
  if (taskState === 'running') {
    // Do not overload the api server by delaying 1 second.
    await delay(1);
    return getTvdResponse(taskId);
  } else if (taskState === 'succeeded') {
    return get(response, ['payload', 'data', 'results']);
  }
  return null;
};

function getCasingDepths(casingData) {
  if (!casingData) {
    return [];
  }
  const depths = [];
  casingData.forEach(casing => {
    depths.push(casing.data.top_depth);
    depths.push(casing.data.bottom_depth);
  });
  return depths;
}

function getDrillstringDepths(drillstringData) {
  if (!drillstringData) {
    return [];
  }
  const depths = [];
  drillstringData.forEach(drillstring => {
    depths.push(drillstring.data.start_depth);
    depths.push(drillstring.data.end_depth);
  });
  return depths;
}

function getSectionDepths(sectionData) {
  if (!sectionData) {
    return [];
  }
  const depths = [];
  sectionData.forEach(section => {
    depths.push(section.data.top_depth);
    depths.push(section.data.bottom_depth);
  });
  return depths;
}

function getWitDepths(witData) {
  if (!witData) {
    return [];
  }
  return [witData.data.bit_depth, witData.data.hole_depth];
}

function getMudDepths(actual = [], plan = []) {
  const depths = [];
  actual.concat(plan).forEach(mud => {
    depths.push(mud.data.depth);
  });
  return depths;
}

function getNptDepths(nptData = []) {
  return nptData.map(npt => npt.data.depth);
}

function getDepthArray(wellData) {
  const {
    casingData,
    drillstringData,
    holeSectionData,
    witData,
    actualMudData,
    planMudData,
    nptData,
  } = wellData;

  const casingDetphs = getCasingDepths(casingData);
  const drillstringDepths = getDrillstringDepths(drillstringData);
  const sectionDepths = getSectionDepths(holeSectionData);
  const witDepths = getWitDepths(witData);
  const mudDepths = getMudDepths(actualMudData, planMudData);
  const nptDepths = getNptDepths(nptData);

  const allDepths = casingDetphs
    .concat(drillstringDepths)
    .concat(sectionDepths)
    .concat(witDepths)
    .concat(mudDepths)
    .concat(nptDepths)
    .filter(depth => Number.isFinite(depth));

  return uniq(allDepths);
}

function getCasingDataWithTvd(casingData = [], mdTvdMap) {
  return casingData.map(casing => {
    const { data } = casing;

    return {
      ...casing,
      data: {
        ...data,
        top_depth_tvd: mdTvdMap[data.top_depth],
        bottom_depth_tvd: mdTvdMap[data.bottom_depth],
      },
    };
  });
}

function getDrillstringDataWithTvd(drillstringData = [], mdTvdMap) {
  return drillstringData.map(drillstring => {
    const { data } = drillstring;

    return {
      ...drillstring,
      data: {
        ...data,
        start_depth_tvd: mdTvdMap[data.start_depth],
        end_depth_tvd: mdTvdMap[data.end_depth],
      },
    };
  });
}

function getHoleSectionDataWithTvd(sectionData = [], mdTvdMap) {
  return sectionData.map(section => {
    const { data } = section;

    return {
      ...section,
      data: {
        ...data,
        top_depth_tvd: mdTvdMap[data.top_depth],
        bottom_depth_tvd: mdTvdMap[data.bottom_depth],
      },
    };
  });
}

function getWitDataWithTvd(witData, mdTvdMap) {
  const { data } = witData;
  return {
    ...witData,
    data: {
      ...data,
      bit_depth_tvd: mdTvdMap[data.bit_depth],
      hole_depth_tvd: mdTvdMap[data.hole_depth],
    },
  };
}

function getActualMudDataWithTvd(actualMudData = [], mdTvdMap) {
  return actualMudData.map(mud => {
    const { data } = mud;

    return {
      ...mud,
      data: {
        ...data,
        depth_tvd: mdTvdMap[data.depth],
      },
    };
  });
}

function getPlanMudDataWithTvd(planMudData = [], mdTvdMap) {
  return planMudData.map(mud => {
    const { data } = mud;

    return {
      ...mud,
      data: {
        ...data,
        depth_tvd: mdTvdMap[data.depth],
      },
    };
  });
}

function getNptDataWithTvd(nptData = [], mdTvdMap) {
  return nptData.map(npt => {
    const { data } = npt;
    return {
      ...npt,
      data: {
        ...data,
        depth_tvd: mdTvdMap[data.depth],
      },
    };
  });
}

export const getWellDataWithTvd = async wellData => {
  const { assetId, actualSurveyData } = wellData;

  const isSurveyActualNotEmpty = actualSurveyData.stations && actualSurveyData.stations.length;
  const depthArray = getDepthArray(wellData);

  const taskId = await postTvdRequest(assetId, depthArray, isSurveyActualNotEmpty);

  const tvdData = await getTvdResponse(taskId);

  if (!tvdData) {
    return wellData;
  }

  const mdTvdMap = {};
  tvdData.forEach(mdTvd => {
    if (mdTvd.station) {
      mdTvdMap[mdTvd.measured_depth] = mdTvd.station.tvd;
    }
  });

  const {
    casingData,
    drillstringData,
    holeSectionData,
    witData,
    actualMudData,
    planMudData,
    nptData,
  } = wellData;

  return {
    ...wellData,
    casingData: getCasingDataWithTvd(casingData, mdTvdMap),
    drillstringData: getDrillstringDataWithTvd(drillstringData, mdTvdMap),
    holeSectionData: getHoleSectionDataWithTvd(holeSectionData, mdTvdMap),
    witData: getWitDataWithTvd(witData, mdTvdMap),
    actualMudData: getActualMudDataWithTvd(actualMudData, mdTvdMap),
    planMudData: getPlanMudDataWithTvd(planMudData, mdTvdMap),
    nptData: getNptDataWithTvd(nptData, mdTvdMap),
  };
};
