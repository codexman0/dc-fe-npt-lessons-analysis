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

function showMultiHazardTooltip(data, handler, nptSize) {
  const { hazards } = data;
  const option = {
    hazards,
    nptSize,
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

export const renderNpts = (
  parentElem,
  depthScale,
  nptStartX,
  nptSize,
  nptGroups,
  gradientPatternId,
  handleClickNpt
) => {
  const enlargeSize = Math.floor(nptSize / 4);

  const hazardLayer = parentElem
    .selectAll('g.c-wsc-hazards')
    .data(['hazards'])
    .join('g')
    .attr('class', 'c-wsc-hazards')
    .attr('transform', `translate(${nptStartX}, 0)`);

  const singleNptGroups = nptGroups.filter(group => group.hazards.length === 1);
  const multiNptGroups = nptGroups.filter(group => group.hazards.length > 1);
// console.log('singleNptGroups=', singleNptGroups);
// console.log('multiNptGroups=', multiNptGroups);
  hazardLayer
    .selectAll('rect.c-wsc-single-hazard')
    .data(singleNptGroups)
    .join('rect')
    .attr('class', 'c-wsc-single-hazard')
    .attr('x', 0)
    .attr('y', d => depthScale(d.depth))
    .attr('width', nptSize)
    .attr('height', nptSize)
    .attr('rx', 2)
    .attr('ry', 2)
    .attr('fill', d => d.hazards[0].color)
    .on('mouseenter', function onEnter(d) {
      increaseHazardSize.call(this, 0, depthScale(d.depth), nptSize, nptSize, enlargeSize);
      // show tooltip
      if (!d3Event.detail || !d3Event.detail.suppressTooltip) {
        showTooltip({
          html: `<div style="text-transform: capitalize;"> Type: ${d.hazards[0].type} </div>`,
        });
      }
    })
    .on('mouseleave', function onLeave(d) {
      decreaseHazardSize.call(this, 0, depthScale(d.depth), nptSize, nptSize);

      // hide tooltip
      hideTooltip();
    })
    .on('click', function onClick(d) {
      handleClickNpt(d.hazards[0].id);
    });

  hazardLayer
    .selectAll('rect.c-wsc-multi-hazard')
    .data(multiNptGroups)
    .join('rect')
    .attr('class', 'c-wsc-multi-hazard')
    .attr('x', 0)
    .attr('y', d => depthScale(d.depth))
    .attr('width', nptSize)
    .attr('height', nptSize)
    .attr('rx', 2)
    .attr('ry', 2)
    .attr('fill', `url(#${gradientPatternId})`)
    .on('mouseenter', function onEnter(d) {
      increaseHazardSize.call(this, 0, depthScale(d.depth), nptSize, nptSize, enlargeSize);
      if (!d3Event.detail || !d3Event.detail.suppressTooltip) {
        showMultiHazardTooltip(d, handleClickNpt, nptSize);
      }
    })
    .on('mouseleave', function onLeave(d) {
      decreaseHazardSize.call(this, 0, depthScale(d.depth), nptSize, nptSize);
      hideMultiHazardTooltip();
    });
};

export const renderOtherHazardElements = () => {};
