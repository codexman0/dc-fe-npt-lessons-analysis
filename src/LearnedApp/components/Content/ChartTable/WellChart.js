/* eslint-disable no-underscore-dangle */
import { memo, useRef, useEffect } from 'react';
import { arrayOf, shape, number, func } from 'prop-types';
import { select, scaleLinear } from 'd3';

import { getLayersInfo } from './utils/responsive';
import { defineClip } from './utils/defs';
import { defineTooltip } from './utils/tooltip';

import { renderXGrid, renderYGrid } from './utils/axis';
import { renderLeftCasings, renderRightCasings } from './utils/casing';

function WellChart(props) {
  const {
    assetId,
    chartSize,
    casingData,
    hazardFilters,
    formationsFilters,
    zoom,
    onChangeGridHeight,
  } = props;

  const svgRef = useRef();

  useEffect(() => {
    const {
      isMinimized,
      gridWidth,
      gridHeight,
      marginLeft,
      marginTop,
      casingWidth,
      casingLeftStartX,
      casingRightStartX,
    } = getLayersInfo(chartSize.width, chartSize.height, casingData, formationsFilters);

    onChangeGridHeight(gridHeight);
    defineTooltip();
    const depthScale = scaleLinear().domain([zoom[0], zoom[1]]).range([0, gridHeight]);
    const xScale = scaleLinear().domain([0, 10]).range([0, gridWidth]);

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

    renderLeftCasings(grid, depthScale, casingData, casingLeftStartX, casingWidth, true);
    renderRightCasings(grid, depthScale, casingData, casingRightStartX, casingWidth, !isMinimized);
  }, [
    assetId,
    chartSize,
    casingData,
    hazardFilters,
    formationsFilters,
    zoom,
  ]);

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
  hazardFilters: shape({}).isRequired,
  formationsFilters: shape({}).isRequired,
  zoom: arrayOf(number).isRequired,
  onChangeGridHeight: func.isRequired,
};

export default memo(WellChart);