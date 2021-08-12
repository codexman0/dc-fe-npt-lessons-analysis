import { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { makeStyles, TableContainer } from '@material-ui/core';
import { LoadingIndicator } from '@corva/ui/components';

import Header from './Header';
import Settings from './Settings';
import LearnTable from './LearnTable';
import ChartTable from './ChartTable';
import WellsMap from './Map';
import Legend from './Legend';
import AppFooter from './AppFooter';
import { TABLE_KIND } from '../../constants';

// Well chart
import { getAppSize } from './ChartTable/utils/responsive';
import { fetchWellsData, fetchNptPickList } from './ChartTable/utils/apiCall';
import {
  getMaxDepth,
  getInitHazardFilters,
  getInitZoom,
  processWellsData,
} from './ChartTable/utils/dataProcessing';

const useStyles = makeStyles({
  contentWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingBottom: '35px',
    minWidth: 0,
  },
  noDataWrapper: {
    position: 'relative',
    flexGrow: 100,
    display: 'flex',
    alignItems: 'center',
  },
  headerWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '8px',
  },
  mapWrapper: ({ isMobile }) => {
    const widthPercent = 100;

    return {
      display: 'flex',
      height: '240px',
      overflowX: 'auto',
      minWidth: isMobile ? '100%' : '200px',
      width: `${widthPercent}%`,
    };
  },
  tableWrapper: {
    flex: 1,
    overflowX: 'auto',
    '&::-webkit-scrollbar-corner': {
      background: 'rgba(0, 0, 0, 0)',
    },
  },
  loadingWrapper: {
    position: 'relative',
    flexGrow: 100,
    display: 'flex',
    alignItems: 'center',
  },
  legendWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap-reverse',
  },
  paginationToolbar: {
    padding: '0px 10px',
  },
});

function Content({
  isMobile,
  isDrawerOpen,
  showChartView,
  eventKind,
  nptData,
  lessonsData,
  nptTypeFilter,
  lessonsFilter,
  opFilter,
  depthFilter,
  dateFilter,
  offsetWells,
  tableSettings,
  showWellFullName,
  onChangeShowChart,
  onChangeShowWellFullName,
  onChangeTableSettings,
  onShowTutorial,
  well,
  coordinates,
  offsetSetting,
}) {
  // NOTE: Fetch npt and lessons data
  const classes = useStyles({ isMobile });
  const [mapExpanded, setMapExpanded] = useState(true);
  const [isOpenSettingsPopover, setIsOpenSettingsPopover] = useState(false);
  const filteredData = useMemo(() => {
    const data = [];
    const startTimeStamp = new Date(dateFilter[0]).getTime() / 1000 || 0;
    const endTimeStamp = new Date(dateFilter[1]).getTime() / 1000 || 4294967295;
    let counter = 0;
    // Filter NPT data
    // eslint-disable-next-line no-bitwise
    if (eventKind & TABLE_KIND.npt) {
      nptData?.forEach(row => {
        const typeChecked = get(
          nptTypeFilter?.find(item => item.key === get(row, ['data', 'type'])),
          'checked'
        );

        const dateChecked =
          get(row, ['data', 'start_time']) >= startTimeStamp &&
          get(row, ['data', 'start_time']) <= endTimeStamp;
        if (typeChecked && dateChecked) {
          counter += 1;
          data.push({
            id: counter,
            wellName: get(
              offsetWells.find(well => well.id === get(row, 'asset_id')),
              'name'
            ),
            rigName: get(
              offsetWells.find(well => well.id === get(row, 'asset_id')),
              'rigName'
            ),
            type: get(
              nptTypeFilter.find(item => item.key === get(row, ['data', 'type'])),
              'color'
            ),
            description: get(row, ['data', 'comment']),
            tvd: get(row, ['data', 'depth']),
            startTime: get(row, ['data', 'start_time']),
            endTime: get(row, ['data', 'end_time']),
            isMore: true,
          });
        }
      });
    }
    // Filter Lessons Data
    // eslint-disable-next-line no-bitwise
    if (eventKind & TABLE_KIND.lessons) {
      lessonsData?.forEach(row => {
        const lessonsChecked = lessonsFilter
          ? (get(lessonsFilter[0], 'value') === get(row, ['data', 'topic']) ||
              get(lessonsFilter[0], 'value') === 'All') &&
            (get(lessonsFilter[1], 'value') === get(row, ['data', 'severity']) ||
              get(lessonsFilter[1], 'value') === 'All') &&
            (get(lessonsFilter[2], 'value') === get(row, ['data', 'cause']) ||
              get(lessonsFilter[2], 'value') === 'All')
          : true;

        const opChecked = opFilter
          ? (get(opFilter[0], 'value') === get(row, ['data', 'section']) ||
              get(opFilter[0], 'value') === 'All') &&
            (get(opFilter[1], 'value') === get(row, ['data', 'activity']) ||
              get(opFilter[1], 'value') === 'All') &&
            (get(opFilter[2], 'value') === get(row, ['data', 'phase']) ||
              get(opFilter[2], 'value') === 'All')
          : true;

        const startRange = get(depthFilter, [get(opFilter[3], 'value'), 'startRange']);
        const endRange = get(depthFilter, [get(opFilter[3], 'value'), 'endRange']);
        const [startKey, endKey] =
          opFilter?.length === 4 && get(opFilter[3], 'value') === 'Measured Depth'
            ? ['md_start', 'md_end']
            : ['tvd_start', 'tvd_end'];
        const depthChecked =
          opFilter?.length === 4
            ? get(row, ['data', startKey]) >= startRange[0] &&
              get(row, ['data', startKey]) <= startRange[1] &&
              get(row, ['data', endKey]) >= endRange[0] &&
              get(row, ['data', endKey]) <= endRange[1]
            : true;
        const dateChecked =
          get(row, ['data', 'start_time']) >= startTimeStamp &&
          get(row, ['data', 'start_time']) <= endTimeStamp;

        if (lessonsChecked && opChecked && depthChecked && dateChecked) {
          counter += 1;
          data.push({
            id: counter,
            wellName: get(
              offsetWells.find(well => well.id === get(row, 'asset_id')),
              'name'
            ),
            rigName: get(
              offsetWells.find(well => well.id === get(row, 'asset_id')),
              'rigName'
            ),
            type: 'lessons',
            topic: get(row, ['data', 'topic']),
            severity: get(row, ['data', 'severity']),
            cause: get(row, ['data', 'cause']),
            description: get(row, ['data', 'description']),
            holeSection: get(row, ['data', 'section']),
            operation: get(row, ['data', 'activity']),
            tvd: get(row, ['data', 'tvd_start']),
            phase: get(row, ['data', 'phase']),
            startTime: get(row.data, 'start_time'),
            endTime: get(row.data, 'end_time'),
            isMore: true,
          });
        }
      });
    }
    return data;
  }, [
    eventKind,
    nptData,
    lessonsData,
    nptTypeFilter,
    lessonsFilter,
    opFilter,
    depthFilter,
    dateFilter,
  ]);

  // NOTE: Fetch Well char data
  const assetId = well && get(well, 'asset_id');
  const assetStatus = well && get(well, 'status');
  const offsetWellIds = useMemo(() => {
    return get(offsetSetting, 'selectedWellIds') || [];
  }, [offsetSetting]);
  const appSize = getAppSize(coordinates, false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [wellsData, setWellsData] = useState([]);
  const [hazardFilters, setHazardFilters] = useState({ on: true });
  const [maxDepth, setMaxDepth] = useState(null);
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    if (!assetId) {
      return;
    }

    const fetchData = async () => {
      setIsChartLoading(true);
      const [rawWellsData, nptPickList] = await Promise.all([
        fetchWellsData(assetId, offsetWellIds),
        fetchNptPickList(),
      ]);
      const processedWellsData = processWellsData(rawWellsData, nptPickList);

      const initialMaxDepth = getMaxDepth(processedWellsData);
      const initialZoom = [0, initialMaxDepth];
      // if hazard and/or formation filter is empty, fill with npt pick list
      setHazardFilters(prev => getInitHazardFilters(prev, nptPickList));

      setMaxDepth(initialMaxDepth);
      setZoom(prev => getInitZoom(prev, initialZoom));
      setWellsData(processedWellsData);
      setIsChartLoading(false);
    };

    fetchData();
  }, [assetId, assetStatus, offsetWellIds]);

  const handleMouseEvent = useCallback(newActiveWell => {
    console.log('activeWell=', newActiveWell);
  }, []);

  const handleOpenSettingsPopover = useCallback(() => {
    setIsOpenSettingsPopover(true);
  }, []);

  const handleCloseSettingsPopover = useCallback(() => {
    setIsOpenSettingsPopover(false);
  }, []);

  const handleSaveSettings = useCallback(
    settings => {
      onChangeTableSettings(settings.tableSettings);
      setIsOpenSettingsPopover(false);
    },
    [onChangeTableSettings]
  );

  const handleExportCsv = () => {};

  const handleShowTutorial = () => {
    setIsOpenSettingsPopover(false);
    onShowTutorial();
  };

  const handleChartTableView = useCallback(tab => {
    onChangeShowChart(tab);
  }, []);

  return (
    <div className={classes.contentWrapper}>
      <div className={classes.headerWrapper}>
        <Header
          mapExpanded={mapExpanded}
          showChartView={showChartView}
          onOpenSettingsPopover={handleOpenSettingsPopover}
          onChangeMapExpanded={() => setMapExpanded(!mapExpanded)}
          onChangeChartTableView={handleChartTableView}
        />

        {isOpenSettingsPopover && (
          <Settings
            tableSettings={tableSettings}
            onClose={handleCloseSettingsPopover}
            onSave={handleSaveSettings}
            onExportCsv={handleExportCsv}
            onShowTutorial={handleShowTutorial}
          />
        )}
      </div>
      {mapExpanded && (
        <div className={classes.mapWrapper}>
          <WellsMap wells={offsetWells} offsetWells={offsetWells} activeWellId={null} />
        </div>
      )}

      {!showChartView ? (
        <TableContainer className={classes.tableWrapper}>
          <LearnTable
            showWellFullName={showWellFullName}
            onChangeShowWellFullName={onChangeShowWellFullName}
            data={filteredData}
            tableSettings={tableSettings}
            onMouseEvent={handleMouseEvent}
          />
        </TableContainer>
      ) : (
        <>
          {!isChartLoading ? (
            <div className={classes.tableWrapper}>
              <ChartTable
                appSize={appSize}
                zoom={zoom}
                wellsData={wellsData}
                hazardFilters={hazardFilters}
                maxDepth={maxDepth}
              />
            </div>
          ) : (
            <div className={classes.loadingWrapper}>
              <LoadingIndicator />
            </div>
          )}
        </>
      )}
      <div className={classes.legendWrapper}>
        <Legend records={filteredData} typeFilter={nptTypeFilter} />
      </div>
      <AppFooter isDrawerOpen={isDrawerOpen} />
    </div>
  );
}

Content.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  well: PropTypes.shape({ id: PropTypes.number }).isRequired,
  coordinates: PropTypes.shape({}).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  showChartView: PropTypes.bool.isRequired,
  showWellFullName: PropTypes.bool.isRequired,
  onChangeShowWellFullName: PropTypes.func.isRequired,
  eventKind: PropTypes.number.isRequired,
  nptData: PropTypes.shape([]).isRequired,
  lessonsData: PropTypes.shape([]).isRequired,
  nptTypeFilter: PropTypes.shape([]).isRequired,
  lessonsFilter: PropTypes.shape([]).isRequired,
  opFilter: PropTypes.shape([]).isRequired,
  depthFilter: PropTypes.shape({}).isRequired,
  dateFilter: PropTypes.shape([]).isRequired,
  offsetWells: PropTypes.shape([]),
  tableSettings: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onChangeShowChart: PropTypes.func.isRequired,
  onChangeTableSettings: PropTypes.func.isRequired,
  onShowTutorial: PropTypes.func.isRequired,
  offsetSetting: PropTypes.shape({}).isRequired,
};

Content.defaultProps = {
  offsetWells: null,
};

export default memo(Content);
