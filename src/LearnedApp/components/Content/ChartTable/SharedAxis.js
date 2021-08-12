import { memo, useRef, useEffect } from 'react';
import { arrayOf, number } from 'prop-types';
import { select, scaleLinear } from 'd3';

import { useResizeObserver } from './utils/effects';
import { renderDepthAxis } from './utils/axis';

// TODO: determine margin based on filters
const margin = {
  left: 60,
  right: 0,
  top: 5,
  bottom: 10,
};

const SharedAxis = props => {
  const { zoom } = props;

  const wrapperRef = useRef();
  const svgRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  useEffect(() => {
    if (!dimensions) {
      return;
    }

    const contentHeight = dimensions.height - margin.top - margin.bottom;
    const depthScale = scaleLinear()
      .domain(zoom ? [zoom[0], zoom[1]] : [0, 0])
      .range([0, contentHeight]);

    const svg = select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .selectAll('g.c-wsc-content')
      .data(['content'])
      .join('g')
      .attr('class', 'c-wsc-content')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    renderDepthAxis(svg, depthScale, contentHeight);
  }, [dimensions, zoom]);

  return (
    <div id="c-ws-shared-axis" ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

SharedAxis.propTypes = {
  zoom: arrayOf(number).isRequired,
};

export default memo(SharedAxis);
