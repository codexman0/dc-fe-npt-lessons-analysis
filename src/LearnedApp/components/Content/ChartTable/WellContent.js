import { memo, useState, useMemo, useRef, useCallback } from 'react';
import { string, shape, arrayOf, number, func } from 'prop-types';
import { get } from 'lodash';
import { makeStyles } from '@material-ui/core';

import { useResizeObserver } from './utils/effects';

import WellHeader from './WellHeader';
import WellChart from './WellChart';
import WellInfoDialog from './dialog/WellInfoDialog';

const useStyles = makeStyles({
  wellContainer: {
    height: '100%',
    width: '100%',
    minWidth: ({ isNotDesktop }) => (isNotDesktop ? '100%' : '50%'),
    paddingRight: ({ isNotDesktop }) => (isNotDesktop ? 0 : 20),
    display: 'flex',
    flexDirection: 'column',
    scrollSnapAlign: 'start',
  },
  wellContent: {
    position: 'relative',
    width: '100%',
    height: 'calc(100%)',
  },
  wellHeader: {
    borderRadius: '5px 5px 0 0',
    backgroundColor: '#272727',
    height: '32px',
  },
  wellChart: {
    height: '100%',
  },
});

function WellContent(props) {
  const contentRef = useRef();
  const dimensions = useResizeObserver(contentRef);

  const { wellData, hazardFilters, formationsFilters, zoom, appSize, onChangeGridHeight } = props;

  const {
    asset,
    casingData,
    holeSectionData,
    drillstringData,
    witData,
    planSurveyData,
    actualMudData,
    planMudData,
    nptData,
    directionalData,
    formationsData,
    phaseData,
  } = wellData;

  const classes = useStyles({ isNotDesktop: appSize !== 'desktop' });

  const assetId = get(asset, ['data', 'id']);
  const chartSize = useMemo(() => {
    if (!dimensions) return null;
    return { width: dimensions.width, height: dimensions.height - 32 };
  }, [dimensions]);
  const [isWellInfoDialogOpen, setIsWellInfoDialogOpen] = useState(false);
  const handleToggleWellInfoDialog = useCallback(() => {
    setIsWellInfoDialogOpen(value => !value);
  }, []);

  const isDataEmpty =
    wellData.holeSectionData.length < 1 ||
    wellData.casingData.length < 1 ||
    wellData.drillstringData.length < 1;

  return (
    <div className={classes.wellContainer}>
      <div className={classes.wellContent} ref={contentRef}>
        <WellInfoDialog
          isDialogOpen={isWellInfoDialogOpen}
          onToggle={handleToggleWellInfoDialog}
          asset={asset}
          wellData={planSurveyData}
        />

        {chartSize && (
          <div id={`c-ws-well-header-${assetId}`} className={classes.wellHeader}>
            <WellHeader
              asset={asset}
              chartSize={chartSize}
              onToggleWellInfoDialog={handleToggleWellInfoDialog}
            />
          </div>
        )}
        {chartSize && (
          <div id={`c-ws-well-chart-${assetId}`} className={classes.wellChart}>
            {!isDataEmpty && (
              <WellChart
                assetId={+assetId}
                chartSize={chartSize}
                witData={witData}
                casingData={casingData}
                holeSectionData={holeSectionData}
                drillstringData={drillstringData}
                actualMudData={actualMudData}
                planMudData={planMudData}
                nptData={nptData}
                directionalData={directionalData}
                formationsData={formationsData}
                phaseData={phaseData}
                hazardFilters={hazardFilters}
                formationsFilters={formationsFilters}
                zoom={zoom}
                onChangeGridHeight={onChangeGridHeight}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

WellContent.propTypes = {
  wellData: shape({}).isRequired,
  zoom: arrayOf(number).isRequired,
  appSize: string.isRequired,
  hazardFilters: shape({}).isRequired,
  formationsFilters: shape({}).isRequired,
  onChangeGridHeight: func.isRequired,
};

export default memo(WellContent);
