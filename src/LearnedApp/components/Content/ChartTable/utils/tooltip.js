import { select, event as d3Event } from 'd3';

function setDefaultTooltipContainerStyle(container) {
  container
    .style('position', 'absolute')
    .style('background', '#414141')
    .style('padding', '8px')
    .style('font-size', '10px')
    .style('line-height', '14px')
    .style('border-radius', '4px')
    .style('z-index', 9999);
}

export const defineTooltip = () => {
  const parentElem = select('body');
  const isTooltipEmpty = parentElem.select('div#c-wsc-tooltip').empty();

  if (isTooltipEmpty) {
    const tooltipContainer = parentElem
      .append('div')
      .attr('id', 'c-wsc-tooltip')
      .style('display', 'none');

    setDefaultTooltipContainerStyle(tooltipContainer);
  }
};

export const showTooltip = option => {
  const { html, style, position } = option;

  const tooltipContainer = select('div#c-wsc-tooltip');

  setDefaultTooltipContainerStyle(tooltipContainer);
  tooltipContainer.html(html);

  if (style) {
    const { padding, fontSize, borderRadius } = style;

    if (style.padding) {
      tooltipContainer.style('padding', padding);
    }

    if (style.fontSize) {
      tooltipContainer.style('font-size', fontSize);
    }

    if (style.borderRadius) {
      tooltipContainer.style('border-radius', borderRadius);
    }
  }

  // TODO: currently position only supports horizontal center, left, and right. default: center
  // Try to support vertical positioning
  const mouseX = d3Event.pageX;
  const mouseY = d3Event.pageY;

  tooltipContainer.style('top', `${mouseY + 15}px`);
  tooltipContainer.style('display', 'block');

  const containerWidth = tooltipContainer.style('width').slice(0, -2);
  if (position === 'left') {
    tooltipContainer.style('left', `${mouseX - containerWidth}px`);
  } else if (position === 'center') {
    tooltipContainer.style('left', `${mouseX - containerWidth / 2}px`);
  } else if (position === 'right') {
    tooltipContainer.style('left', `${mouseX}px`);
  } else {
    tooltipContainer.style('left', `${mouseX - containerWidth / 2}px`);
  }
};

export const hideTooltip = () => {
  const tooltipContainer = select('div#c-wsc-tooltip');
  tooltipContainer.style('display', 'none');
};
