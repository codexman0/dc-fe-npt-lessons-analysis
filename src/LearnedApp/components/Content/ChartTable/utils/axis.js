import { axisLeft, axisBottom } from 'd3';
import { getUnitDisplay } from '@corva/ui/utils';

export const renderDepthAxis = (parentElem, depthScale, contentHeight) => {
  const tickCount = 10;

  const depthAxis = parentElem
    .selectAll('g.c-wsc-depth-axis')
    .data(['depth axis'])
    .join('g')
    .attr('class', 'c-wsc-depth-axis')
    .call(axisLeft(depthScale).ticks(tickCount));

  depthAxis.selectAll('text').attr('fill', '#9e9e9e');
  depthAxis.selectAll('line').attr('stroke', '#808080');

  parentElem
    .selectAll('text.c-wsc-depth-axis-label')
    .data(['Measured Depth'])
    .join('text')
    .attr('class', 'c-wsc-depth-axis-label')
    .attr('x', -contentHeight / 2)
    .attr('y', -50)
    .attr('fill', '#9E9E9E')
    .attr('font-family', 'Roboto')
    .attr('font-size', '14px')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text(`Measured Depth (${getUnitDisplay('length')})`);
};

export const renderYGrid = (parentElem, depthScale, contentWidth) => {
  const tickCount = 10;

  const depthAxisGrid = parentElem
    .selectAll('g.c-wsc-depth-axis-grid')
    .data(['depth axis grid'])
    .join('g')
    .attr('class', 'c-wsc-depth-axis-grid')
    .call(
      axisLeft(depthScale)
        .tickSize(-contentWidth)
        .tickFormat('')
        .ticks(tickCount)
    );

  depthAxisGrid.selectAll('line').attr('stroke', '#333333');
  depthAxisGrid.selectAll('path').attr('stroke', '#333333');
};

export const renderXGrid = (parentElem, xScale, contentHeight) => {
  const tickCount = 10;

  const xAxisGrid = parentElem
    .selectAll('g.c-wsc-x-axis-grid')
    .data(['x axis grid'])
    .join('g')
    .attr('class', 'c-wsc-x-axis-grid')
    .call(
      axisBottom(xScale)
        .tickSize(contentHeight)
        .tickFormat('')
        .ticks(tickCount)
    );

  xAxisGrid.selectAll('line').attr('stroke', '#333333');
  xAxisGrid.selectAll('path').attr('stroke', '#333333');
};
