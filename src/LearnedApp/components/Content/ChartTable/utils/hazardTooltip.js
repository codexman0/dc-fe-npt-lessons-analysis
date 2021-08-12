// Note: This tooltip is an adhoc solution for interactive tooltip for hazard
// Improve it for more general usage if it needs to be used in other layers
import { select, event as d3Event } from 'd3';
import { showTooltip, hideTooltip } from './tooltip';

const tooltip = (function hazardTooltip() {
  let timer;

  const container = select('body')
    .append('div')
    .attr('id', 'c-wsc-hazard-tooltip')
    .style('display', 'none');

  function setDefaultContainerStyle() {
    container
      .style('position', 'absolute')
      .style('background', '#414141')
      .style('padding', '8px')
      .style('font-size', '10px')
      .style('line-height', '14px')
      .style('border-radius', '4px')
      .style('z-index', 9999);
  }

  function hideHazardTooltip() {
    container.style('display', 'none');
  }

  function showHazardTooltip(option) {
    const { hazards, hazardSize, style, position, handler } = option;
    setDefaultContainerStyle();
    // "c-wsc-single-hazard-in-tooltip" css class was defined in chart.css
    container
      .selectAll('rect.c-wsc-single-hazard-in-tooltip')
      .data(hazards)
      .join('rect')
      .attr('class', 'c-wsc-single-hazard-in-tooltip')
      .attr('width', hazardSize)
      .attr('height', hazardSize)
      .attr('rx', 2)
      .attr('ry', 2)
      .style('width', '12px')
      .style('height', '12px')
      .style('display', 'inline-block')
      .style('margin', '0px 2px')
      .style('border-radius', 2)
      .style('background-color', d => d.color)
      .on('mouseenter', function onEnter(d) {
        // show tooltip
        if (!d3Event.detail || !d3Event.detail.suppressTooltip) {
          showTooltip({
            html: `<div style="text-transform: capitalize;"> Type: ${d.type} </div>`,
          });
        }
      })
      .on('mouseleave', function onLeave() {
        // hide tooltip
        hideTooltip();
      })
      .on('click', function onClick(d) {
        handler(d.id);
        hideHazardTooltip();
      });
    if (style) {
      const { padding, fontSize, borderRadius } = style;

      if (style.padding) {
        container.style('padding', padding);
      }

      if (style.fontSize) {
        container.style('font-size', fontSize);
      }

      if (style.borderRadius) {
        container.style('border-radius', borderRadius);
      }
    }

    const mouseX = d3Event.pageX;
    const mouseY = d3Event.pageY;

    container.style('top', `${mouseY + 15}px`);
    container.style('display', 'block');

    const containerWidth = container.style('width').slice(0, -2);
    if (position === 'left') {
      container.style('left', `${mouseX - containerWidth}px`);
    } else if (position === 'center') {
      container.style('left', `${mouseX - containerWidth / 2}px`);
    } else if (position === 'right') {
      container.style('left', `${mouseX}px`);
    } else {
      container.style('left', `${mouseX - containerWidth / 2}px`);
    }
  }

  container
    .on('mouseenter', function onEnter() {
      if (timer) {
        clearTimeout(timer);
      }
    })
    .on('mouseleave', function onLeave() {
      hideHazardTooltip();
    });

  return {
    show: option => {
      showHazardTooltip(option);
    },
    hide: delay => {
      timer = setTimeout(() => {
        hideHazardTooltip();
      }, delay);
    },
  };
})();

export default tooltip;
