import { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { get } from 'lodash';
import { makeStyles } from '@material-ui/core';

import SharedAxis from './SharedAxis';
import WellContent from './WellContent';
import { getAppSize } from './utils/responsive';
import {
  fetchWellsData,
  fetchWellLiveData,
  fetchNptPickList,
  fetchLithologyPickList,
} from './utils/apiCall';
import {
  getMaxDepth,
  getInitHazardFilters,
  getInitFormationFilters,
  getInitZoom,
  processWellsData,
  injectLiveData,
} from './utils/dataProcessing';

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

function ChartTable(props) {
  const classes = useStyles();

  const { well, coordinates, query, currentUser, selectedWellIds } = props;
  const assetId = well && get(well, 'asset_id');
  const assetStatus = well && get(well, 'status');
  const offsetWellIds = useMemo(() => {
    return selectedWellIds || [];
  }, [selectedWellIds]);
  const appSize = getAppSize(coordinates, false);
  const [isLoading, setIsLoading] = useState(false);

  const [wellsData, setWellsData] = useState([]);
  const [formationsFilters, setFormationsFilters] = useState({ on: true });
  const [hazardFilters, setHazardFilters] = useState({ on: true });
  const [maxDepth, setMaxDepth] = useState(null);
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    if (!assetId) {
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const [rawWellsData, nptPickList, lithologyPickList] = await Promise.all([
        fetchWellsData(assetId, query, offsetWellIds),
        fetchNptPickList(),
        fetchLithologyPickList(),
      ]);
      const processedWellsData = processWellsData(rawWellsData, nptPickList, lithologyPickList);

      const initialMaxDepth = getMaxDepth(processedWellsData);
      const initialZoom = [0, initialMaxDepth];
      // if hazard and/or formation filter is empty, fill with npt pick list
      setHazardFilters(prev => getInitHazardFilters(prev, nptPickList));
      setFormationsFilters(prev => getInitFormationFilters(prev, lithologyPickList));

      setMaxDepth(initialMaxDepth);
      setZoom(prev => getInitZoom(prev, initialZoom));
      setWellsData(processedWellsData);
      setIsLoading(false);
    };

    fetchData();

    const fetchAndInjectLiveData = async () => {
      if (query || assetStatus !== 'active') {
        return;
      }

      const liveData = await fetchWellLiveData(assetId);
      setWellsData(prev => {
        const newData = injectLiveData(prev, liveData);
        return newData;
      });
    };

    const intervalHandler = setInterval(() => {
      fetchAndInjectLiveData();
    }, 30 * 1000); // Get the live data for every 30 seconds only for subject well

    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(intervalHandler);
    };
  }, [assetId, assetStatus, query, offsetWellIds]);

  const axisContainerClass = classNames(classes.axisContainer, {
    [classes.axisContainerMobile]: appSize === 'phone',
  });

  return (
    <div className={classes.mainContentWrapper}>
      <div className={classes.mainContainer}>
        <div className={axisContainerClass}>
          <SharedAxis zoom={zoom} appSize={appSize} />
        </div>
        <div className={classes.wellsContainer}>
          {wellsData.map(wellData => (
            <WellContent
              key={wellData.assetId}
              wellData={wellData}
              formationsFilters={formationsFilters}
              hazardFilters={hazardFilters}
              maxDepth={maxDepth}
              zoom={zoom}
              appSize={appSize}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

ChartTable.propTypes = {
  well: PropTypes.shape({}).isRequired,
  coordinates: PropTypes.shape({}).isRequired,
  query: PropTypes.shape({}).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  selectedWellIds: PropTypes.shape([]).isRequired,
};

export default memo(ChartTable);
