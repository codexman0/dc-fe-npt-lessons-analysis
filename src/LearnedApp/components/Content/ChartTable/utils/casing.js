import { event as d3Event } from 'd3';
import { get } from 'lodash';

import { createOrSelectElem } from './selector';
import { showTooltip, hideTooltip } from './tooltip';

export const renderSectionFill = (
  parentElem,
  depthScale,
  casingData,
  casingLeftStart,
  casingRightStart,
  casingWidth
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

const renderLessonsContainer = g => {
  const circle = createOrSelectElem(g, 'circle');

  circle.attr('cx', 7).attr('cy', 7).attr('r', 12).attr('fill', '#3B3B3B');
};

const renderLessonsIcon = g => {
  const casingIconPath =
    'M13.4788 0.015225L9.91016 0C9.36656 4.7515e-05 8.83044 0.126697 8.34428 0.369912C7.85812 0.613128 7.43529 0.966225 7.10929 1.40122L7.00429 1.54061L6.89929 1.40061C6.57341 0.965826 6.15075 0.612899 5.66481 0.369792C5.17887 0.126686 4.643 7.80939e-05 4.09964 0L0.52115 0C0.382901 4.64059e-05 0.250332 0.0550041 0.1526 0.152785C0.0548677 0.250567 -2.32043e-05 0.383164 7.35864e-09 0.521412V11.2979C-2.32043e-05 11.4362 0.0548677 11.5688 0.1526 11.6665C0.250332 11.7643 0.382901 11.8193 0.52115 11.8193H4.0999C4.68981 11.8204 5.25703 12.0468 5.68566 12.4521C6.11429 12.8574 6.37197 13.4111 6.40605 14H7.60375C7.6379 13.411 7.89568 12.8573 8.32443 12.4519C8.75317 12.0466 9.32051 11.8203 9.91051 11.8193L13.4792 11.8345C13.6174 11.8344 13.7499 11.7794 13.8475 11.6816C13.9452 11.5839 14 11.4513 14 11.3131V0.536638C14 0.398389 13.9451 0.265792 13.8474 0.16801C13.7497 0.0702291 13.6171 0.0152714 13.4788 0.015225ZM6.40946 11.4878L6.19894 11.3293C5.59488 10.8749 4.85946 10.6292 4.10357 10.6293H1.19061V1.19H4.09972C4.40316 1.19 4.70362 1.24978 4.98395 1.36593C5.26427 1.48208 5.51897 1.65232 5.73348 1.86692C5.948 2.08153 6.11813 2.3363 6.23416 2.61667C6.35019 2.89704 6.40985 3.19753 6.40972 3.50096L6.40946 11.4878ZM12.8095 10.6443L9.91025 10.6291H9.90299C9.14899 10.629 8.41543 10.8742 7.81296 11.3276L7.59999 11.4878V3.50254C7.59987 3.19894 7.65956 2.89829 7.77565 2.61776C7.89174 2.33722 8.06195 2.08231 8.27656 1.86757C8.49118 1.65282 8.74599 1.48246 9.02645 1.3662C9.30691 1.24994 9.60752 1.19007 9.91113 1.19L12.8095 1.20514V10.6443Z';

  const path = createOrSelectElem(g, 'path');

  path.attr('d', casingIconPath).attr('fill', '#BDBDBD').attr('opacity', 1);
};

export const renderLessons = (
  parentElem,
  depthScale,
  lessonsGroups,
  labelSectionStart,
  handleClick
) => {
  parentElem
    .selectAll('g.c-wsc-lessons')
    .data(lessonsGroups)
    .join(
      enter => {
        const g = enter.append('g');
        renderLessonsContainer(g);
        renderLessonsIcon(g);
        return g;
      },
      update => {
        renderLessonsContainer(update);
        renderLessonsIcon(update);
        return update;
      }
    )
    .attr('class', 'c-wsc-lessons')
    .attr('transform', d => `translate(${labelSectionStart}, ${depthScale(d.depth) - 6})`)
    .on('mouseenter', function onEnter(d) {
      // show tooltip
      if (!d3Event.detail || !d3Event.detail.suppressTooltip) {
        showTooltip({
          html: `<div style="text-transform: capitalize;"> ${d.hazards[0].title} </div>`,
        });
      }
    })
    .on('mouseleave', function onLeave() {
      // hide tooltip
      hideTooltip();
    })
    .on('click', function onClick(d) {
      handleClick(d.hazards[0].id);
    });
};
