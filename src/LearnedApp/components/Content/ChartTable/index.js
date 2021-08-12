import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core';

import SharedAxis from './SharedAxis';
import WellContent from './WellContent';

const useStyles = makeStyles({
  mainContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    minWidth: '0px',
  },
  mainContainer: {
    display: 'flex',
    height: '100%',
  },
  axisContainer: {
    width: 60,
    height: '100%',
    paddingTop: 32,
    marginLeft: 10,
    overflowY: 'hidden',
    '&::-webkit-scrollbar': {
      height: 16,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      backgroundColor: '#a4a4a7b8',
      borderRadius: '10px',
      border: '5px solid rgba(0, 0, 0, 0.01)',
      backgroundClip: 'padding-box',
    },
  },
  axisContainerMobile: {
    marginLeft: 0,
  },
  wellsContainer: {
    display: 'flex',
    overflowY: 'hidden',
    height: '100%',
    flex: 1,
    scrollSnapType: 'x mandatory',
    '&::-webkit-scrollbar': {
      height: 16,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      backgroundColor: '#a4a4a7b8',
      borderRadius: '10px',
      border: '5px solid rgba(0, 0, 0, 0.01)',
      backgroundClip: 'padding-box',
    },
  },
});

function ChartTable({ appSize, zoom, wellsData, hazardFilters, maxDepth }) {
  const classes = useStyles();
  const [gridHeight, setGridHeight] = useState(0);

  const axisContainerClass = classNames(classes.axisContainer, {
    [classes.axisContainerMobile]: appSize === 'phone',
  });

  return (
    <div className={classes.mainContentWrapper}>
      <div className={classes.mainContainer}>
        <div className={axisContainerClass}>
          <SharedAxis zoom={zoom} appSize={appSize} gridHeight={gridHeight} />
        </div>
        <div className={classes.wellsContainer}>
          {wellsData.map(wellData => (
            <WellContent
              key={wellData.assetId}
              wellData={wellData}
              hazardFilters={hazardFilters}
              maxDepth={maxDepth}
              zoom={zoom}
              appSize={appSize}
              onChangeGridHeight={setGridHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

ChartTable.propTypes = {
  appSize: PropTypes.string.isRequired,
  zoom: PropTypes.shape([]).isRequired,
  wellsData: PropTypes.shape([]).isRequired,
  hazardFilters: PropTypes.shape({}).isRequired,
  maxDepth: PropTypes.number.isRequired,
};

export default memo(ChartTable);
