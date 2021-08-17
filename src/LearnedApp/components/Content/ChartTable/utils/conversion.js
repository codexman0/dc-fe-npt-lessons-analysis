import { get } from 'lodash';
import { convertValue } from '@corva/ui/utils';

export function convertCasingData(casingData = []) {
  return casingData.map(casing => {
    const { data } = casing;

    return {
      ...casing,
      data: {
        ...data,
        top_depth: convertValue(data.top_depth, 'length', 'ft'),
        top_depth_tvd: convertValue(data.top_depth_tvd, 'length', 'ft'),
        bottom_depth: convertValue(data.bottom_depth, 'length', 'ft'),
        bottom_depth_tvd: convertValue(data.bottom_depth_tvd, 'length', 'ft'),
        length: convertValue(data.length, 'length', 'ft'),
        inner_diameter: convertValue(data.inner_diameter, 'shortLength', 'in'),
        outer_diameter: convertValue(data.outer_diameter, 'shortLength', 'in'),
        linear_weight: convertValue(data.linear_weight, 'massPerLength', 'lb-ft'),
      },
    };
  });
}

export function convertHoleSectionData(sectionData = []) {
  return sectionData.map(section => {
    const { data } = section;

    return {
      ...section,
      data: {
        ...data,
        top_depth: convertValue(data.top_depth, 'length', 'ft'),
        top_depth_tvd: convertValue(data.top_depth_tvd, 'length', 'ft'),
        bottom_depth: convertValue(data.bottom_depth, 'length', 'ft'),
        bottom_depth_tvd: convertValue(data.bottom_depth_tvd, 'length', 'ft'),
      },
    };
  });
}

export function convertNptData(nptData = []) {
  return nptData.map(npt => {
    const { data } = npt;

    return {
      ...npt,
      data: {
        ...data,
        depth: convertValue(data.depth, 'length', 'ft'),
        depth_tvd: convertValue(data.depth_tvd, 'length', 'ft'),
      },
    };
  });
}

export function convertLessonsData(lessonsData = []) {
  return lessonsData.map(lesson => {
    const { data } = lesson;

    return {
      ...lesson,
      data: {
        ...data,
        depth: convertValue(get(data, 'md_start'), 'length', 'ft'),
        depth_tvd: convertValue(get(data, 'tvd_start'), 'length', 'ft'),
      },
    };
  });
}

export function convertPlanSurveyData(planSurveyData) {
  if (!planSurveyData) {
    return planSurveyData;
  }

  const stations = planSurveyData.stations.map(station => {
    return {
      ...station,
      measured_depth: convertValue(station.measured_depth, 'length', 'ft'),
      tvd: convertValue(station.tvd, 'length', 'ft'),
      northing: convertValue(station.northing, 'length', 'ft'),
      easting: convertValue(station.easting, 'length', 'ft'),
      vertical_section: convertValue(station.vertical_section, 'length', 'ft'),
      inclination: convertValue(station.inclination, 'angle', 'deg'),
      azimuth: convertValue(station.azimuth, 'angle', 'deg'),
      dls: convertValue(station.dls, 'anglePerLength', 'dp100f'),
    };
  });

  return {
    ...planSurveyData,
    stations,
  };
}

export const getConvertedWellData = wellData => {
  const { casingData, holeSectionData, nptData, lessonsData, planSurveyData } = wellData;
  return {
    ...wellData,
    casingData: convertCasingData(casingData),
    holeSectionData: convertHoleSectionData(holeSectionData),
    nptData: convertNptData(nptData),
    lessonsData: convertLessonsData(lessonsData),
    planSurveyData: convertPlanSurveyData(planSurveyData),
  };
};
