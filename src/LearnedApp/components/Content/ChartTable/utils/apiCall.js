import { get, set } from 'lodash';
import {
  getAppStorage,
  getPicklist,
  getResolvedAssets,
  getWell,
  getAsset,
} from '@corva/ui/clients/jsonApi';

import { METADATA } from './meta';
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

export async function fetchWellData(assetId) {
  let asset;
  let casingData;
  let holeSectionData;
  let drillstringData;
  let planSurveyData;
  let nptData;

  try {
    [asset, casingData, holeSectionData, drillstringData, planSurveyData, nptData] =
      await Promise.all([
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
        getAppStorage(METADATA.provider, METADATA.recordCollections.planSurvey, assetId, {
          limit: 1,
          sort: '{timestamp:-1}',
        }),
        getAppStorage(METADATA.provider, METADATA.recordCollections.nptEvents, assetId, {
          limit: 1000,
          sort: '{data.depth: 1}',
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
  } catch (e) {
    console.error(e);
    return {
      assetId,
      asset: {},
      casingData: [],
      holeSectionData: [],
      drillstringData: [],
      planSurveyData: {},
      nptData: [],
    };
  }

  const wellData = {
    assetId,
    asset,
    casingData,
    holeSectionData,
    drillstringData,
    planSurveyData: planSurveyData.length ? planSurveyData[0].data : {},
    nptData,
  };

  const convertedWellData = getConvertedWellData(wellData);
  return convertedWellData;
}

export async function fetchWellsData(subjectAssetId, offsetWells) {
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

  const rawWellsData = await Promise.all(wellIds.map(wellId => fetchWellData(wellId)));

  return rawWellsData;
}
