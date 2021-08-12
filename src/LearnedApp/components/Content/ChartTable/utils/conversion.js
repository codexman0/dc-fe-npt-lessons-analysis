import { cloneDeep } from 'lodash'; // song
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

export function convertWitData(witData) {
  const { data } = witData;

  return {
    ...witData,
    data: {
      ...data,
      bit_depth: convertValue(data.bit_depth, 'length', 'ft'),
      bit_depth_tvd: convertValue(data.bit_depth_tvd, 'length', 'ft'),
      hole_depth: convertValue(data.hole_depth, 'length', 'ft'),
      hole_depth_tvd: convertValue(data.hole_depth_tvd, 'length', 'ft'),
    },
  };
}

export function convertActualMudData(actualMudData = []) {
  return actualMudData.map(mud => {
    const { data } = mud;

    return {
      ...mud,
      data: {
        ...data,
        depth: convertValue(data.depth, 'length', 'ft'),
        depth_tvd: convertValue(data.depth_tvd, 'length', 'ft'),
        mud_density: convertValue(data.mud_density, 'density', 'ppg'),
        viscosity: {
          ...data.viscosity,
          yp: convertValue(data.viscosity.yp, 'yp', 'hsf'),
        },
      },
    };
  });
}

export function convertPlanMudData(planMudData = []) {
  return planMudData.map(mud => {
    const { data } = mud;

    return {
      ...mud,
      data: {
        ...data,
        depth: convertValue(data.depth, 'length', 'ft'),
        depth_tvd: convertValue(data.depth_tvd, 'length', 'ft'),
        mud_density: convertValue(data.mud_density, 'density', 'ppg'),
      },
    };
  });
}

export function convertFormationsData(formationsData = []) {
  return formationsData.map(formation => {
    const { data } = formation;

    return {
      ...formation,
      data: {
        ...data,
        md: convertValue(data.md, 'length', 'ft'),
        td: convertValue(data.td, 'length', 'ft'),
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

function convertToPrefUnit(val, unitType, unit, precision = 2) {
  if (val !== 0 && !val) {
    return null;
  }
  return unitType && unit ? convertValue(val, unitType, unit, null, precision) : val;
}

// Note: This is the copy from global DrillstringUtils which is immutable version
function convertDrillstringRecord(record) {
  const data = cloneDeep(record.data);
  const { components } = data;
  data.start_depth = convertToPrefUnit(data.start_depth, 'length', 'ft');
  data.end_depth = convertToPrefUnit(data.end_depth, 'length', 'ft');
  data.start_depth_tvd = convertToPrefUnit(data.start_depth_tvd, 'length', 'ft');
  data.end_depth_tvd = convertToPrefUnit(data.end_depth_tvd, 'length', 'ft');

  if (components.length > 0) {
    if (components[0].family === 'bit') {
      components[0].c_length = components[0].length || 0;
      for (let i = 1; i < components.length; i += 1) {
        components[i].c_length =
          parseFloat(components[i - 1].c_length) + parseFloat(components[i].length || 0);
      }
    } else {
      const lastIndex = components.length - 1;
      components[lastIndex].c_length = components[lastIndex].length || 0;
      for (let i = lastIndex - 1; i >= 0; i -= 1) {
        components[i].c_length =
          parseFloat(components[i + 1].c_length) + parseFloat(components[i].length || 0);
      }
    }
  }

  for (let i = 0; i < components.length; i += 1) {
    const comp = components[i];
    comp.inner_diameter = convertToPrefUnit(comp.inner_diameter, 'shortLength', 'in');
    comp.outer_diameter = convertToPrefUnit(comp.outer_diameter, 'shortLength', 'in', 4);
    comp.linear_weight = convertToPrefUnit(comp.linear_weight, 'massPerLength', 'lb-ft');
    comp.weight = convertToPrefUnit(comp.weight, 'mass', 'lb');
    comp.length = convertToPrefUnit(comp.length, 'length', 'ft');
    comp.component_length = convertToPrefUnit(comp.component_length, 'length', 'ft');
    comp.outer_diameter_tooljoint = convertToPrefUnit(
      comp.outer_diameter_tooljoint,
      'shortLength',
      'in'
    );
    comp.inner_diameter_tooljoint = convertToPrefUnit(
      comp.inner_diameter_tooljoint,
      'shortLength',
      'in'
    );
    comp.length_tooljoint = convertToPrefUnit(comp.length_tooljoint, 'length', 'ft');

    comp.c_length = convertToPrefUnit(comp.c_length, 'length', 'ft');
    comp.gamma_sensor_to_bit_distance = convertToPrefUnit(
      comp.gamma_sensor_to_bit_distance,
      'length',
      'ft'
    );

    if (comp.family === 'bit' || comp.family === 'ur') {
      const ratio = convertToPrefUnit(1, 'shortLength', 'in');
      comp.size = convertToPrefUnit(comp.size, 'shortLength', 'in');
      if (comp.nozzle_sizes && comp.nozzle_sizes.length > 0) {
        for (let j = 0; j < comp.nozzle_sizes.length; j += 1) {
          const item = comp.nozzle_sizes[j];
          item.size =
            ratio !== 1 ? convertToPrefUnit(item.size, 'shortLength', 'in') / 32 : item.size;
        }
      }
      comp.tfa = ratio !== 1 ? comp.tfa * (ratio * ratio) : comp.tfa;
    }

    if (comp.family === 'pdm') {
      comp.max_weight_on_bit = convertToPrefUnit(comp.max_weight_on_bit, 'force', 'klbf');
      comp.min_standard_flowrate = convertToPrefUnit(
        comp.min_standard_flowrate,
        'volumeFlowRate',
        'gal/min'
      );
      comp.max_standard_flowrate = convertToPrefUnit(
        comp.max_standard_flowrate,
        'volumeFlowRate',
        'gal/min'
      );
      comp.max_operating_differential_pressure = convertToPrefUnit(
        comp.max_operating_differential_pressure,
        'pressure',
        'psi'
      );
      comp.torque_at_max_operating_differential_pressure = convertToPrefUnit(
        comp.torque_at_max_operating_differential_pressure,
        'torque',
        'ft-klbf',
        3
      );
      if (comp.off_bottom_pressure_loss && comp.off_bottom_pressure_loss.length > 0) {
        for (let j = 0; j < comp.off_bottom_pressure_loss.length; j += 1) {
          const item = comp.off_bottom_pressure_loss[j];
          item.flow_rate = convertToPrefUnit(item.flow_rate, 'volumeFlowRate', 'gal/min');
          item.pressure_loss = convertToPrefUnit(item.pressure_loss, 'pressure', 'psi');
        }
      }
      comp.rpg = convertToPrefUnit(comp.rpg, 'revolutionPerVolume', 'rpg');
      if (comp.has_stabilizer && comp.stabilizer) {
        comp.stabilizer.inner_diameter = convertToPrefUnit(
          comp.stabilizer.inner_diameter,
          'shortLength',
          'in'
        );
        comp.stabilizer.outer_diameter = convertToPrefUnit(
          comp.stabilizer.outer_diameter,
          'shortLength',
          'in'
        );
        comp.stabilizer.linear_weight = convertToPrefUnit(
          comp.stabilizer.linear_weight,
          'massPerLength',
          'lb-ft'
        );
        comp.stabilizer.weight = convertToPrefUnit(comp.stabilizer.weight, 'mass', 'lb');
        comp.stabilizer.length = convertToPrefUnit(comp.stabilizer.length, 'length', 'ft');
        comp.stabilizer.gauge_od = convertToPrefUnit(comp.stabilizer.gauge_od, 'shortLength', 'in');
        comp.stabilizer.gauge_length = convertToPrefUnit(
          comp.stabilizer.gauge_length,
          'shortLength',
          'in'
        );
        comp.stabilizer.blade_width = convertToPrefUnit(
          comp.stabilizer.blade_width,
          'shortLength',
          'in'
        );
        comp.stabilizer.stab_centerpoint_to_bit = convertToPrefUnit(
          comp.stabilizer.stab_centerpoint_to_bit,
          'length',
          'ft'
        );
      }
    }

    if (comp.family === 'stabilizer') {
      comp.gauge_od = convertToPrefUnit(comp.gauge_od, 'shortLength', 'in');
      comp.gauge_length = convertToPrefUnit(comp.gauge_length, 'shortLength', 'in');
      comp.blade_width = convertToPrefUnit(comp.blade_width, 'shortLength', 'in');
    }

    if (comp.family === 'mwd' || comp.family === 'rss' || comp.family === 'agitator') {
      if (comp.pressure_loss && comp.pressure_loss.length > 0) {
        for (let j = 0; j < comp.pressure_loss.length; j += 1) {
          const item = comp.pressure_loss[j];
          item.flow_rate = convertToPrefUnit(item.flow_rate, 'volumeFlowRate', 'gal/min');
          item.pressure_loss = convertToPrefUnit(item.pressure_loss, 'pressure', 'psi');
        }
      }
    }
  }

  return {
    ...record,
    data,
  };
}

export function convertDrillstringData(drillstringData = []) {
  return drillstringData.map(drillstring => convertDrillstringRecord(drillstring));
}

export function convertRoadmapData(roadmapData) {
  if (!roadmapData || !roadmapData.data) {
    return roadmapData;
  }

  const formations = roadmapData.data.formations.map(formation => {
    const from = {
      rpm: formation.from.rpm,
      wob: convertValue(formation.from.wob, 'force', 'klbf'),
    };

    const to = {
      rpm: formation.to.rpm,
      wob: convertValue(formation.to.wob, 'force', 'klbf'),
    };

    return {
      ...formation,
      md_start: convertValue(formation.md_start, 'length', 'ft'),
      md_end: convertValue(formation.md_end, 'length', 'ft'),
      tvd_start: convertValue(formation.tvd_start, 'length', 'ft'),
      tvd_end: convertValue(formation.tvd_end, 'length', 'ft'),
      from,
      to,
      diff_press: convertValue(formation.diff_press, 'pressure', 'psi'),
      mse: convertValue(formation.mse, 'msePressure', 'psi'),
      rop: convertValue(formation.rop, 'velocity', 'ft/h'),
      flow_in: convertValue(formation.flow_in, 'volumeFlowRate', 'gal/min'),
      mud_density: convertValue(formation.mud_density, 'density', 'ppg'),
    };
  });

  return {
    ...roadmapData,
    data: {
      ...roadmapData.data,
      formations,
    },
  };
}

export function convertScoringData(scoringData) {
  if (!scoringData || !scoringData.data) {
    return scoringData;
  }

  const scoring = scoringData.data.scoring.map(item => {
    const diffPressActual = (item.diff_press || {}).actual;
    const flowInActual = (item.flow_in || {}).actual;
    const wobActual = (item.wob || {}).actual;
    const ropActual = (item.rop || {}).actual;
    const mseActual = (item.mse || {}).actual;

    return {
      ...item,
      wob: { actual: convertValue(wobActual, 'force', 'klbf') },
      mse: { actual: convertValue(mseActual, 'msePressure', 'psi') },
      diff_press: { actual: convertValue(diffPressActual, 'pressure', 'psi') },
      rop: { actual: convertValue(ropActual, 'velocity', 'ft/h') },
      flow_in: { actual: convertValue(flowInActual, 'volumeFlowRate', 'gal/min') },
    };
  });

  return {
    ...scoringData,
    data: {
      ...scoringData.data,
      scoring,
    },
  };
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
  const {
    casingData,
    holeSectionData,
    witData,
    actualMudData,
    planMudData,
    formationsData,
    nptData,
    planSurveyData,
    drillstringData,
    roadmapData,
    scoringData,
  } = wellData;

  return {
    ...wellData,
    casingData: convertCasingData(casingData),
    holeSectionData: convertHoleSectionData(holeSectionData),
    witData: convertWitData(witData),
    actualMudData: convertActualMudData(actualMudData),
    planMudData: convertPlanMudData(planMudData),
    formationsData: convertFormationsData(formationsData),
    nptData: convertNptData(nptData),
    drillstringData: convertDrillstringData(drillstringData),
    roadmapData: convertRoadmapData(roadmapData),
    scoringData: convertScoringData(scoringData),
    planSurveyData: convertPlanSurveyData(planSurveyData),
  };
};
