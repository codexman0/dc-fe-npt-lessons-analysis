import { select, event as d3Event } from 'd3';
import hazardTooltip from './hazardTooltip';
import { showTooltip, hideTooltip } from './tooltip';

function increaseHazardSize(x, y, width, height, size) {
  const elem = select(this);
  elem
    .attr('x', x - size)
    .attr('y', y - size)
    .attr('width', width + size * 2)
    .attr('height', height + size * 2);
}

function decreaseHazardSize(x, y, width, height) {
  const elem = select(this);
  elem
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', height);
}

function showMultiHazardTooltip(data, handler, hazardSize) {
  const { hazards } = data;
  const option = {
    hazards,
    hazardSize,
    style: {
      padding: '4px',
    },
    position: 'center',
    handler,
  };
  hazardTooltip.show(option);
}

function hideMultiHazardTooltip() {
  hazardTooltip.hide(400);
}

export const renderHazards = (
  parentElem,
  depthScale,
  hazardStartX,
  hazardSize,
  hazardGroups,
  gradientPatternId,
  handleClickHazard
) => {
  const enlargeSize = Math.floor(hazardSize / 4);

  const hazardLayer = parentElem
    .selectAll('g.c-wsc-hazards')
    .data(['hazards'])
    .join('g')
    .attr('class', 'c-wsc-hazards')
    .attr('transform', `translate(${hazardStartX}, 0)`);

  const singleHazardGroups = hazardGroups.filter(group => group.hazards.length === 1);
  const multiHazardGroups = hazardGroups.filter(group => group.hazards.length > 1);

  hazardLayer
    .selectAll('rect.c-wsc-single-hazard')
    .data(singleHazardGroups)
    .join('rect')
    .attr('class', 'c-wsc-single-hazard')
    .attr('x', 0)
    .attr('y', d => depthScale(d.depth))
    .attr('width', hazardSize)
    .attr('height', hazardSize)
    .attr('rx', 2)
    .attr('ry', 2)
    .attr('fill', d => d.hazards[0].color)
    .on('mouseenter', function onEnter(d) {
      increaseHazardSize.call(this, 0, depthScale(d.depth), hazardSize, hazardSize, enlargeSize);
      // show tooltip
      if (!d3Event.detail || !d3Event.detail.suppressTooltip) {
        showTooltip({
          html: `<div style="text-transform: capitalize;"> Type: ${d.hazards[0].type} </div>`,
        });
      }
    })
    .on('mouseleave', function onLeave(d) {
      decreaseHazardSize.call(this, 0, depthScale(d.depth), hazardSize, hazardSize);

      // hide tooltip
      hideTooltip();
    })
    .on('click', function onClick(d) {
      handleClickHazard(d.hazards[0].id);
    });

  hazardLayer
    .selectAll('rect.c-wsc-multi-hazard')
    .data(multiHazardGroups)
    .join('rect')
    .attr('class', 'c-wsc-multi-hazard')
    .attr('x', 0)
    .attr('y', d => depthScale(d.depth))
    .attr('width', hazardSize)
    .attr('height', hazardSize)
    .attr('rx', 2)
    .attr('ry', 2)
    .attr('fill', `url(#${gradientPatternId})`)
    .on('mouseenter', function onEnter(d) {
      increaseHazardSize.call(this, 0, depthScale(d.depth), hazardSize, hazardSize, enlargeSize);
      if (!d3Event.detail || !d3Event.detail.suppressTooltip) {
        showMultiHazardTooltip(d, handleClickHazard, hazardSize);
      }
    })
    .on('mouseleave', function onLeave(d) {
      decreaseHazardSize.call(this, 0, depthScale(d.depth), hazardSize, hazardSize);
      hideMultiHazardTooltip();
    });
};

export const renderOtherHazardElements = () => {};
