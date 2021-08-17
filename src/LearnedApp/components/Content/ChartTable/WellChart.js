/* eslint-disable no-underscore-dangle */
import { memo, useRef, useEffect, useCallback } from 'react';
import { arrayOf, shape, number, func } from 'prop-types';
import { select, scaleLinear } from 'd3';

import { getNptGroups, getLessonsGroups, getAdjustedLabelData } from './utils/dataProcessing';
import { getLayersInfo } from './utils/responsive';
import { defineClip } from './utils/defs';
import { defineTooltip } from './utils/tooltip';

import { renderXGrid, renderYGrid } from './utils/axis';
import {
  renderLeftCasings,
  renderRightCasings,
  renderSectionFill,
  renderLessons,
} from './utils/casing';
import { renderNpts } from './utils/hazard';

function WellChart(props) {
  const {
    assetId,
    chartSize,
    casingData,
    nptFilters,
    lessonsFilter,
    zoom,
    nptData,
    lessonsData,
    onChangeGridHeight,
    onClickNpt,
    onClickLessons,
  } = props;
  const svgRef = useRef();

  const handleClickNpt = useCallback(
    id => {
      onClickNpt(nptData.findIndex(item => item._id === id));
    },
    [onClickNpt, nptData]
  );

  const handleClickLessons = useCallback(
    index => {
      onClickLessons(index);
    },
    [onClickLessons]
  );

  useEffect(() => {
    const {
      gridWidth,
      gridHeight,
      marginLeft,
      marginTop,
      casingWidth,
      casingLeftStartX,
      casingRightStartX,
      nptStartX,
      nptSize,
      learnedStartX,
    } = getLayersInfo(chartSize.width, chartSize.height, casingData);

    // const pxPerUnit = gridHeight / (zoom[1] - zoom[0]);
    // const labelData = getAdjustedLabelData(pxPerUnit, casingData);

    onChangeGridHeight(gridHeight);
    defineTooltip();
    const depthScale = scaleLinear().domain([zoom[0], zoom[1]]).range([0, gridHeight]);
    const xScale = scaleLinear().domain([0, 10]).range([0, gridWidth]);
    const nptGroups = getNptGroups(nptData, nptFilters, zoom);
    const lessonsGroups = getLessonsGroups(lessonsData, lessonsFilter, zoom);
    // console.log('nptGroups=', nptGroups);
    // console.log('lessonsGroups=', lessonsGroups);
    const svg = select(svgRef.current)
      .attr('width', chartSize.width)
      .attr('height', chartSize.height);

    const axes = svg
      .selectAll('g.c-wsc-axes')
      .data(['axes'])
      .join('g')
      .attr('class', 'c-wsc-axes')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    const grid = svg
      .selectAll('g.c-wsc-grid')
      .data(['grid'])
      .join('g')
      .attr('class', 'c-wsc-grid')
      .attr('transform', `translate(${marginLeft},${marginTop})`);
    const gridClipPathId = defineClip(assetId, grid, 'grid', gridWidth, gridHeight);
    grid.attr('clip-path', `url(#${gridClipPathId})`);

    renderYGrid(axes, depthScale, gridWidth);
    renderXGrid(axes, xScale, gridHeight);

    renderSectionFill(
      grid,
      depthScale,
      casingData,
      casingLeftStartX,
      casingRightStartX,
      casingWidth
    );
    renderLeftCasings(grid, depthScale, casingData, casingLeftStartX, casingWidth, true);
    renderRightCasings(grid, depthScale, casingData, casingRightStartX, casingWidth, true);

    renderLessons(grid, depthScale, lessonsGroups, learnedStartX, handleClickLessons);

    const gradientPatternId = `multiHazardPattern${assetId}`;
    renderNpts(grid, depthScale, nptStartX, nptSize, nptGroups, gradientPatternId, handleClickNpt);
  }, [assetId, chartSize, casingData, nptFilters, zoom]);

  return (
    <svg ref={svgRef} style={{ width: '100%', height: '100%' }}>
      <defs>
        <pattern patternUnits="userSpaceOnUse" id={`dotsPattern${assetId}`} width="10" height="10">
          <circle cx="5" cy="5" r="1" fill="#41a7f9" opacity="0.5" />
        </pattern>
        <linearGradient
          id={`multiHazardPattern${assetId}`}
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          gradientUnits="objectBoundingBox"
        >
          <stop stopColor="#BB002E" />
          <stop offset="0.2" stopColor="#FFE268" />
          <stop offset="0.4" stopColor="#85D947" />
          <stop offset="0.6" stopColor="#FB4E32" />
          <stop offset="0.8" stopColor="#38F7BE" />
          <stop offset="1" stopColor="#FFBA00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

WellChart.propTypes = {
  assetId: number.isRequired,
  chartSize: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,
  casingData: arrayOf(shape({})).isRequired,
  nptFilters: shape({}).isRequired,
  lessonsFilter: shape({}).isRequired,
  zoom: arrayOf(number).isRequired,
  nptData: arrayOf(shape({})).isRequired,
  lessonsData: arrayOf(shape({})).isRequired,
  onChangeGridHeight: func.isRequired,
  onClickNpt: func.isRequired,
  onClickLessons: func.isRequired,
};

export default memo(WellChart);
