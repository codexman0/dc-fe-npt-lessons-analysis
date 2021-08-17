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
import { fetchWellsData } from './ChartTable/utils/apiCall';
import { getMaxDepth, getInitZoom, sortDepthWellsData } from './ChartTable/utils/dataProcessing';

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
  asset,
  coordinates,
}) {
  // NOTE: Fetch npt and lessons data
  const classes = useStyles({ isMobile });
  const [mapExpanded, setMapExpanded] = useState(true);
  const [isOpenSettingsPopover, setIsOpenSettingsPopover] = useState(false);
  const [filteredNptData, setFilteredNptData] = useState([]);
  const [filteredLessonsData, setFilteredLessonsData] = useState([]);

  const filteredTableData = useMemo(() => {
    const tableData = [];
    const newNptData = [];
    const newLessonData = [];
    const startTimeStamp = new Date(dateFilter[0]).getTime() / 1000 || 0;
    const endTimeStamp = new Date(dateFilter[1]).getTime() / 1000 || 4294967295;
    let counter = 0;
    // Filter NPT data
    // eslint-disable-next-line no-bitwise
    if (eventKind & TABLE_KIND.npt) {
      nptData?.forEach(npt => {
        const typeChecked = get(
          nptTypeFilter?.find(item => item.key === get(npt, ['data', 'type'])),
          'checked'
        );

        const dateChecked =
          get(npt, ['data', 'start_time']) >= startTimeStamp &&
          get(npt, ['data', 'start_time']) <= endTimeStamp;

        if (typeChecked && dateChecked) {
          counter += 1;
          tableData.push({
            id: counter,
            wellName: get(
              offsetWells.find(well => well.id === get(npt, 'asset_id')),
              'name'
            ),
            rigName: get(
              offsetWells.find(well => well.id === get(npt, 'asset_id')),
              'rigName'
            ),
            type: get(
              nptTypeFilter.find(item => item.key === get(npt, ['data', 'type'])),
              'color'
            ),
            description: get(npt, ['data', 'comment']),
            tvd: get(npt, ['data', 'depth']),
            startTime: get(npt, ['data', 'start_time']),
            endTime: get(npt, ['data', 'end_time']),
            isMore: true,
          });

          newNptData.push(npt);
        }
      });
    }
    setFilteredNptData(newNptData);
    // Filter Lessons Data
    // eslint-disable-next-line no-bitwise
    if (eventKind & TABLE_KIND.lessons) {
      lessonsData?.forEach(lesson => {
        const lessonsChecked = lessonsFilter
          ? (get(lessonsFilter[0], 'value') === get(lesson, ['data', 'topic']) ||
              get(lessonsFilter[0], 'value') === 'All') &&
            (get(lessonsFilter[1], 'value') === get(lesson, ['data', 'severity']) ||
              get(lessonsFilter[1], 'value') === 'All') &&
            (get(lessonsFilter[2], 'value') === get(lesson, ['data', 'cause']) ||
              get(lessonsFilter[2], 'value') === 'All')
          : true;

        const opChecked = opFilter
          ? (get(opFilter[0], 'value') === get(lesson, ['data', 'section']) ||
              get(opFilter[0], 'value') === 'All') &&
            (get(opFilter[1], 'value') === get(lesson, ['data', 'activity']) ||
              get(opFilter[1], 'value') === 'All') &&
            (get(opFilter[2], 'value') === get(lesson, ['data', 'phase']) ||
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
            ? get(lesson, ['data', startKey]) >= startRange[0] &&
              get(lesson, ['data', startKey]) <= startRange[1] &&
              get(lesson, ['data', endKey]) >= endRange[0] &&
              get(lesson, ['data', endKey]) <= endRange[1]
            : true;
        const dateChecked =
          get(lesson, ['data', 'start_time']) >= startTimeStamp &&
          get(lesson, ['data', 'start_time']) <= endTimeStamp;

        if (lessonsChecked && opChecked && depthChecked && dateChecked) {
          counter += 1;
          tableData.push({
            id: counter,
            wellName: get(
              offsetWells.find(well => well.id === get(lesson, 'asset_id')),
              'name'
            ),
            rigName: get(
              offsetWells.find(well => well.id === get(lesson, 'asset_id')),
              'rigName'
            ),
            type: 'lessons',
            topic: get(lesson, ['data', 'topic']),
            severity: get(lesson, ['data', 'severity']),
            cause: get(lesson, ['data', 'cause']),
            description: get(lesson, ['data', 'description']),
            holeSection: get(lesson, ['data', 'section']),
            operation: get(lesson, ['data', 'activity']),
            tvd: get(lesson, ['data', 'tvd_start']),
            phase: get(lesson, ['data', 'phase']),
            startTime: get(lesson.data, 'start_time'),
            endTime: get(lesson.data, 'end_time'),
            isMore: true,
          });

          newLessonData.push(lesson);
        }
      });
    }
    setFilteredLessonsData(newLessonData);

    return tableData;
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
  
  // NOTE: fetch well schematic data
  const assetId = asset && get(asset, 'asset_id');
  const offsetWellIds = useMemo(() => {
    return offsetWells.map(well => well.id) || [];
  }, [offsetWells]);
  const appSize = getAppSize(coordinates, false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [wellsData, setWellsData] = useState([]);
  const [maxDepth, setMaxDepth] = useState(null);
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    if (!assetId) {
      return;
    }

    const fetchData = async () => {
      setIsChartLoading(true);
      const rawWellsData = await fetchWellsData(assetId, offsetWellIds, filteredNptData, filteredLessonsData);
      const sortedWellsData = sortDepthWellsData(rawWellsData);
      const initialMaxDepth = getMaxDepth(sortedWellsData);
      const initialZoom = [0, initialMaxDepth];
      // if hazard and/or formation filter is empty, fill with npt pick list
      setMaxDepth(initialMaxDepth);
      setZoom(prev => getInitZoom(prev, initialZoom));
      setWellsData(sortedWellsData);
      setIsChartLoading(false);
    };

    fetchData();
  }, [assetId, offsetWellIds, filteredNptData, filteredLessonsData]);

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

      {!showChartView ? (
        <>
          {mapExpanded && (
            <div className={classes.mapWrapper}>
              <WellsMap wells={offsetWells} offsetWells={offsetWells} activeWellId={null} />
            </div>
          )}

          <TableContainer className={classes.tableWrapper}>
            <LearnTable
              showWellFullName={showWellFullName}
              onChangeShowWellFullName={onChangeShowWellFullName}
              data={filteredTableData}
              tableSettings={tableSettings}
              onMouseEvent={handleMouseEvent}
            />
          </TableContainer>
        </>
      ) : (
        <>
          {!isChartLoading ? (
            <div className={classes.tableWrapper}>
              <ChartTable
                appSize={appSize}
                zoom={zoom}
                wellsData={wellsData}
                nptFilters={nptTypeFilter}
                lessonsFilter={lessonsFilter}
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
        <Legend records={filteredTableData} typeFilter={nptTypeFilter} />
      </div>
      <AppFooter isDrawerOpen={isDrawerOpen} />
    </div>
  );
}

Content.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  asset: PropTypes.shape({ id: PropTypes.number }).isRequired,
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
};

Content.defaultProps = {
  offsetWells: null,
};

export default memo(Content);
