import { get } from 'lodash';

export const renderSectionFill = (
  parentElem,
  depthScale,
  casingData,
  casingLeftStart,
  casingRightStart,
  casingWidth,
) => {
  const data = casingData && casingData.length > 0 ? casingData[casingData.length - 1] : [];
  const left = casingLeftStart + (casingData ? casingData.length : 0) * casingWidth;
  const height = depthScale(data.data.bottom_depth);
  const width = casingRightStart - left;

  parentElem
    .selectAll('rect.c-wsc-casing-middle-fill')
    .data(casingData)
    .join('rect')
    .attr('class', 'c-wsc-casing-middle-fill')
    .attr('x', left)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'rgba(255,255,255, .04)');
};

export const renderLeftCasings = (
  parentElem,
  depthScale,
  casingData,
  casingLeftStart,
  casingWidth,
  isVisible
) => {
  parentElem
    .selectAll('rect.c-wsc-casing-left-fill')
    .data(isVisible ? casingData : [])
    .join('rect')
    .attr('class', 'c-wsc-casing-left-fill')
    .attr('x', (d, idx) => {
      return casingLeftStart + idx * casingWidth;
    })
    .attr('y', 0)
    .attr('width', casingWidth)
    .attr('height', d => depthScale(d.data.bottom_depth))
    .attr('fill', 'rgba(255,255,255, .04)');

  parentElem
    .selectAll('polygon.c-wsc-casing-left-shoe')
    .data(isVisible ? casingData : [])
    .join('polygon')
    .attr('class', 'c-wsc-casing-left-shoe')
    .attr('points', (d, idx) => {
      const x1 = casingLeftStart + idx * casingWidth;
      const y1 = depthScale(d.data.bottom_depth);
      const x2 = x1 + casingWidth;
      const y2 = y1;
      const x3 = x2;
      const y3 = y2 - casingWidth;
      return [x1, y1, x2, y2, x3, y3].join(',');
    })
    .attr('fill', 'rgba(76,175,80, .2)')
    .attr('stroke', '#4CAF50');

  parentElem
    .selectAll('line.c-wsc-casing-left-stroke')
    .data(isVisible ? casingData : [])
    .join('line')
    .attr('class', d => `c-wsc-casing-left-stroke c-wsc-casing-stroke-${get(d, '_id')}`)
    .attr('x1', (d, idx) => {
      return casingLeftStart + (idx + 1) * casingWidth;
    })
    .attr('y1', 0)
    .attr('x2', (d, idx) => {
      return casingLeftStart + (idx + 1) * casingWidth;
    })
    .attr('y2', d => depthScale(d.data.bottom_depth))
    .attr('stroke', '#BDBDBD');
};

export const renderRightCasings = (
  parentElem,
  depthScale,
  casingData,
  casingRightStart,
  casingWidth,
  isVisible
) => {
  const casingDataReversed = !isVisible ? [] : [...casingData].reverse();
  parentElem
    .selectAll('rect.c-wsc-casing-right-fill')
    .data(casingDataReversed)
    .join('rect')
    .attr('class', 'c-wsc-casing-right-fill')
    .attr('x', (d, idx) => {
      return casingRightStart + idx * casingWidth;
    })
    .attr('y', 0)
    .attr('width', casingWidth)
    .attr('height', d => depthScale(d.data.bottom_depth))
    .attr('fill', 'rgba(255,255,255, .04)');

  parentElem
    .selectAll('line.c-wsc-casing-right-stroke')
    .data(casingDataReversed)
    .join('line')
    .attr('id', d => `c-wsc-casing-right-stroke-${get(d, '_id')}`)
    .attr('class', d => `c-wsc-casing-right-stroke c-wsc-casing-stroke-${get(d, '_id')}`)
    .attr('x1', (d, idx) => {
      return casingRightStart + idx * casingWidth;
    })
    .attr('y1', 0)
    .attr('x2', (d, idx) => {
      return casingRightStart + idx * casingWidth;
    })
    .attr('y2', d => depthScale(d.data.bottom_depth))
    .attr('stroke', '#BDBDBD');

  parentElem
    .selectAll('polygon.c-wsc-casing-right-shoe')
    .data(casingDataReversed)
    .join('polygon')
    .attr('class', 'c-wsc-casing-right-shoe')
    .attr('id', d => `c-wsc-casing-right-shoe-${get(d, '_id')}`)
    .attr('points', (d, idx) => {
      const x1 = casingRightStart + idx * casingWidth;
      const y1 = depthScale(d.data.bottom_depth);
      const x2 = x1 + casingWidth;
      const y2 = y1;
      const x3 = x1;
      const y3 = y2 - casingWidth;
      return [x1, y1, x2, y2, x3, y3].join(',');
    })
    .attr('fill', 'rgba(76,175,80, .2)')
    .attr('stroke', '#4CAF50');
};
