import { get, set, uniq } from 'lodash';
import { getAppStorage, getResolvedAssets, getWell, getAsset } from '@corva/ui/clients/jsonApi';
import { METADATA } from './meta';
import { getConvertedWellData } from './conversion';

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

export async function fetchWellData(assetId, nptData, lessonsData) {
  let asset;
  let casingData;
  let holeSectionData;
  let drillstringData;
  let planSurveyData;
  let filteredNptData;
  let filteredLessonsData;

  try {
    [asset, casingData, holeSectionData, drillstringData, planSurveyData] = await Promise.all([
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
    ]);

    // filtering out rig move/skid
    holeSectionData = holeSectionData.filter(
      section => section.data.name !== 'Rig Move' && section.data.name !== 'Rig Skid'
    );

    // filtering out dumb iron drillstrings
    drillstringData = drillstringData.filter(
      drillstring => !drillstring.data.id.toString().includes('.')
    );

    // filtering out npt
    filteredNptData = nptData.filter(npt => get(npt, 'asset_id') === assetId);

    // filtering out lessons
    filteredLessonsData = lessonsData.filter(lesson => get(lesson, 'asset_id') === assetId);
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
      lessonsData: [],
    };
  }

  const wellData = {
    assetId,
    asset,
    casingData,
    holeSectionData,
    drillstringData,
    planSurveyData: planSurveyData.length ? planSurveyData[0].data : {},
    nptData: filteredNptData,
    lessonsData: filteredLessonsData,
  };

  const convertedWellData = getConvertedWellData(wellData);
  return convertedWellData;
}

export async function fetchWellsData(subjectAssetId, offsetWellIds, nptData, lessonsData) {
  const wellIds = uniq(offsetWellIds.concat(subjectAssetId));
  const rawWellsData = await Promise.all(
    wellIds.map(wellId => fetchWellData(wellId, nptData, lessonsData))
  );

  return rawWellsData;
}
