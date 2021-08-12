import { memo, useState, useMemo, useRef, useCallback } from 'react';
import { string, shape, arrayOf, number, func } from 'prop-types';
import { get } from 'lodash';
import { makeStyles } from '@material-ui/core';

import { useResizeObserver } from './utils/effects';

import WellHeader from './WellHeader';
import WellChart from './WellChart';
import WellInfoDialog from './dialog/WellInfoDialog';
import NptEventDialog from './dialog/OneNptDialog';

const useStyles = makeStyles({
  wellContainer: {
    height: '100%',
    width: '100%',
    minWidth: ({ isNotDesktop }) => (isNotDesktop ? '100%' : '33.34%'),
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
  const { wellData, hazardFilters, zoom, appSize, onChangeGridHeight } = props;
  const { asset, casingData, planSurveyData, nptData } = wellData;
  const classes = useStyles({ isNotDesktop: appSize !== 'desktop' });
  const assetId = get(asset, ['data', 'id']);
  const chartSize = useMemo(() => {
    if (!dimensions) return null;
    return { width: dimensions.width, height: dimensions.height - 32 };
  }, [dimensions]);
  const [isWellInfoDialogOpen, setIsWellInfoDialogOpen] = useState(false);
  const [nptIndex, setNptIndex] = useState(-1);

  const handleToggleWellInfoDialog = useCallback(() => {
    setIsWellInfoDialogOpen(value => !value);
  }, []);

  const handleOpenNptEventDialog = useCallback(index => {
    setNptIndex(index);
  }, []);

  const handleCloseNptEventDialog = useCallback(() => {
    setNptIndex(-1);
  }, []);

  const isDataEmpty = wellData.casingData.length < 1;

  return (
    <div className={classes.wellContainer}>
      <div className={classes.wellContent} ref={contentRef}>
        <WellInfoDialog
          isDialogOpen={isWellInfoDialogOpen}
          onToggle={handleToggleWellInfoDialog}
          asset={asset}
          wellData={planSurveyData}
        />

        {nptIndex !== -1 && (
          <NptEventDialog nptEvent={nptData[nptIndex]} onClose={handleCloseNptEventDialog} />
        )}

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
                casingData={casingData}
                hazardFilters={hazardFilters}
                zoom={zoom}
                nptData={nptData}
                onChangeGridHeight={onChangeGridHeight}
                onClickHazard={handleOpenNptEventDialog}
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
  onChangeGridHeight: func.isRequired,
};

export default memo(WellContent);
