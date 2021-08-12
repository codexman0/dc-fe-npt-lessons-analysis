import { get, set } from 'lodash'; // song
import {
  getAppStorage,
  getPicklist,
  getResolvedAssets,
  getWell,
  getAsset,
} from '@corva/ui/clients/jsonApi';

import { METADATA } from './meta';
import { getWellDataWithTvd } from './tvd';
import { getConvertedWellData } from './conversion';

export async function fetchNptPickList() {
  let res;
  try {
    res = await getPicklist(`npt_types`);
  } catch (e) {
    return [];
  }

  return res.items
    .filter(nptType => {
      return get(nptType, ['metadata', 'showInWellSchematic']);
    })
    .reduce((result, supportedNptType) => {
      const name = get(supportedNptType, ['name']);
      const displayName = get(supportedNptType, ['metadata', 'label']);
      const color = get(supportedNptType, ['metadata', 'color']);

      return {
        ...result,
        [name]: {
          on: true, // used by granular filter settings
          displayName,
          color,
        },
      };
    }, {});
}

export async function fetchLithologyPickList() {
  let res;
  try {
    res = await getPicklist('formation_lithology');
  } catch (e) {
    return [];
  }

  return res.items.reduce((result, lithology) => {
    const name = get(lithology, ['name']);
    const color = get(lithology, ['metadata', name]);

    return {
      ...result,
      [name]: {
        on: true, // used by granular filter settings
        displayName: name,
        color,
      },
    };
  }, {});
}

export async function fetchAsset(assetId) {
  const asset = await getAsset(assetId, {
    fields: [
      'asset.name',
      'asset.root_asset_name',
      'asset.lon_lat',
      'asset.directional_driller',
      'asset.county',
      'asset.basin',
      'asset.parent_asset',
      'asset.target_formation',
      'asset.api_number',
      'asset.settings',
      'asset.string_design',
      'asset.area',
      'asset.status',
    ],
  });

  const resolved = await getResolvedAssets({
    assets: [assetId],
  });

  const wellId = resolved.wells[0].data.id;

  const well = await getWell(
    wellId,
    {
      fields: ['well.pad', 'well.rig'],
    },
    {
      isImmutable: false,
    }
  );

  const pad = well.included.find(entity => entity.type === 'pad');
  const rig = well.included.find(entity => entity.type === 'rig');

  set(asset, ['data', 'attributes', 'pad_name'], pad ? pad.attributes.name : '');
  set(asset, ['data', 'attributes', 'rig_name'], rig ? rig.attributes.name : '');

  return asset;
}

export async function fetchWellData(assetId, query) {
  let asset;
  let casingData;
  let holeSectionData;
  let drillstringData;
  let witData;
  let actualMudData;
  let planMudData;
  let planSurveyData;
  let actualSurveyData;
  let formationsData;
  let nptData;
  let phaseData;
  let roadmapData;
  let scoringData;

  try {
    [
      asset,
      casingData,
      holeSectionData,
      drillstringData,
      witData,
      actualMudData,
      planMudData,
      planSurveyData,
      actualSurveyData,
      formationsData,
      nptData,
      phaseData,
      roadmapData,
      scoringData,
    ] = await Promise.all([
      fetchAsset(assetId),
      getAppStorage(METADATA.provider, METADATA.recordCollections.casings, assetId, {
        limit: 1000,
        sort: '{data.bottom_depth: 1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.holeSection, assetId, {
        limit: 1000,
        sort: '{data.top_depth: 1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.drillstring, assetId, {
        limit: 1000,
        sort: '{data.start_depth: 1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.wits, assetId, {
        query,
        limit: 1,
        sort: '{timestamp: -1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.mud, assetId, {
        limit: 1000,
        sort: '{data.depth  : 1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.mudPlan, assetId, {
        limit: 1000,
        sort: '{data.depth  : 1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.planSurvey, assetId, {
        limit: 1,
        sort: '{timestamp:-1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.actualSurvey, assetId, {
        limit: 1,
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.formations, assetId, {
        limit: 1000,
        sort: '{data.md: 1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.nptEvents, assetId, {
        limit: 1000,
        sort: '{data.depth: 1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.wellPhases, assetId, {
        limit: 1,
        query,
        sort: '{timestamp: -1}',
      }),
      getAppStorage(METADATA.provider, 'drilling-roadmap', assetId, {
        limit: 1,
        query,
        sort: '{timestamp: -1}',
      }),
      getAppStorage(METADATA.provider, 'drilling-roadmap.scoring', assetId, {
        limit: 1,
        query,
        sort: '{timestamp: -1}',
      }),
    ]);

    // filtering out rig move/skid
    holeSectionData = holeSectionData.filter(
      section => section.data.name !== 'Rig Move' && section.data.name !== 'Rig Skid'
    );

    // filtering out dumb iron drillstrings
    drillstringData = drillstringData.filter(
      drillstring => !drillstring.data.id.toString().includes('.')
    );

    // plan and actual mud data have different data structure
    // This will unify the mud data from two different collections
    planMudData = planMudData.length
      ? planMudData[0].data.records.map(data => {
          return { data };
        })
      : [];

    // filter out the formation that doesn't have measure depth
    formationsData = formationsData.filter(formation => Number.isFinite(formation.data.md));

    witData = witData.length ? witData[0] : {};

    phaseData = phaseData.length ? phaseData[0] : {};

    roadmapData = roadmapData.length ? roadmapData[0] : {};

    scoringData = scoringData.length ? scoringData[0] : {};
  } catch (e) {
    console.error(e);
    return {
      assetId,
      asset: {},
      casingData: [],
      holeSectionData: [],
      drillstringData: [],
      witData: {},
      actualMudData: [],
      planMudData: [],
      planSurveyData: {},
      actualSurveyData: {},
      formationsData: [],
      nptData: [],
      phaseData: {},
      roadmapData: {},
      scoringData: {},
    };
  }

  const wellData = {
    assetId,
    asset,
    casingData,
    holeSectionData,
    drillstringData,
    witData,
    actualMudData,
    planMudData,
    planSurveyData: planSurveyData.length ? planSurveyData[0].data : {},
    actualSurveyData: actualSurveyData.length ? actualSurveyData[0].data : {},
    formationsData,
    nptData,
    phaseData,
    roadmapData,
    scoringData,
  };

  const wellDataWithTvd = await getWellDataWithTvd(wellData);
  const convertedWellData = getConvertedWellData(wellDataWithTvd);

  return convertedWellData;
}

export async function fetchWellsData(subjectAssetId, query, offsetWells) {
  const wellIds = offsetWells.reduce(
    (result, offsetWell) => {
      const wellId = offsetWell;

      if (result.find(prevWellId => prevWellId === wellId)) {
        return result;
      }
      return [...result, wellId];
    },
    [subjectAssetId]
  );

  const rawWellsData = await Promise.all(
    wellIds.map(wellId => fetchWellData(wellId, subjectAssetId === wellId ? query : null))
  );

  return rawWellsData;
}

export async function fetchWellLiveData(assetId) {
  let witData;
  let phaseData;
  let actualSurveyData;

  try {
    [witData, phaseData, actualSurveyData] = await Promise.all([
      getAppStorage(METADATA.provider, METADATA.recordCollections.wits, assetId, {
        limit: 1,
        sort: '{timestamp: -1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.wellPhases, assetId, {
        limit: 1,
        sort: '{timestamp: -1}',
      }),
      getAppStorage(METADATA.provider, METADATA.recordCollections.actualSurvey, assetId, {
        limit: 1,
      }),
    ]);

    witData = witData.length ? witData[0] : {};
    phaseData = phaseData.length ? phaseData[0] : {};
    actualSurveyData = actualSurveyData.length ? actualSurveyData[0].data : {};
  } catch (e) {
    return {
      assetId,
      hasError: true,
    };
  }

  const wellData = {
    assetId,
    witData,
    phaseData,
    actualSurveyData,
  };

  const wellDataWithTvd = await getWellDataWithTvd(wellData);
  const convertedWellData = getConvertedWellData(wellDataWithTvd);

  return convertedWellData;
}
