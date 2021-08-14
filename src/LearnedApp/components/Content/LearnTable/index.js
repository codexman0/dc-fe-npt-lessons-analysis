import { memo, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  withTheme,
  makeStyles,
} from '@material-ui/core';

import {
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
} from '@material-ui/icons';

import { HIGHLIGHTING_METRICS } from '../../../constants';
import LearnTableRow from './LearnTableRow';
import InfoDialog from './InfoDialog';

const useStyles = makeStyles({
  headerCell: {
    height: '100%',
    padding: '6px 0 6px 10px',
    background: '#202020',
    borderTop: '1px solid #5C5C5C',
    color: '#9e9e9e',
    fontSize: '12px',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    verticalAlign: 'inherit',
  },
  headerCellContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    lineHeight: '14px',
  },
  headerCellInnerContent: {
    display: 'flex',
    alignItems: 'center',
  },
  sortIcon: {
    cursor: 'pointer',
    fontSize: '16px',
    '&:hover': {
      color: '#fff',
    },
    marginRight: '10px',
  },
});

function getCellStyles(key, zIndex) {
  if (key === 'type') {
    return { left: 0, position: 'sticky', zIndex };
  } else if (key === 'wellName') {
    return { left: '40px', position: 'sticky', boxShadow: '5px 0px 5px #1b1b1b', zIndex };
  }
  return {};
}

function LearnTable({
  theme,
  data,
  showWellFullName,
  onChangeShowWellFullName,
  tableSettings,
  onMouseEvent,
}) {
  const classes = useStyles({
    isLightTheme: theme.isLightTheme,
  });
  const [tableData, setTableData] = useState([]);
  const tableColumns = tableSettings.filter(column => column.show);
  useEffect(() => {
    setTableData(data);
  }, [data]);

  const minMaxDict = useMemo(() => {
    const result = {};
    tableData.forEach(record => {
      HIGHLIGHTING_METRICS.forEach(key => {
        if (!result[key] && Number.isFinite(get(record, key))) {
          result[key] = {
            min: get(record, key),
            max: get(record, key),
          };
        } else if (Number.isFinite(get(record, key))) {
          result[key] = {
            min: Math.min(result[key].min, get(record, key)),
            max: Math.max(result[key].max, get(record, key)),
          };
        }
      });
    });
    return result;
  }, [tableData]);

  const handleClickHeaderCell = column => {
    console.log('handleClickHeaderCell=', column);
  };

  const handleClickMoreCell = row => {
    const data = tableData.map(item =>
      item.id === row.id ? { ...item, isMore: !item.isMore } : item
    );
    setTableData(data);
  };

  // NOTE: Info dialog
  const [infoOpenDialog, setInfoOpenDialog] = useState(false);
  const handleClickInfo = wellId => {
    console.log('111=', wellId);
    setInfoOpenDialog(true);
  };

  const handleClosInfoDialog = () => {
    setInfoOpenDialog(false);
  };

  console.log('tableData=', tableData);
  return (
    <>
      {infoOpenDialog && <InfoDialog onClose={handleClosInfoDialog} />}

      <Table aria-label="npt table" style={{ borderCollapse: 'separate' }}>
        <TableHead>
          <TableRow>
            {tableColumns.map(columnSettings => (
              <TableCell
                key={columnSettings.key}
                className={classes.headerCell}
                style={getCellStyles(columnSettings.key, 3)}
              >
                <div
                  className={classes.headerCellContent}
                  onClick={() => handleClickHeaderCell(columnSettings)}
                  style={{
                    cursor: columnSettings.sortable ? 'pointer' : 'auto',
                    minWidth: columnSettings.width - 10,
                  }}
                >
                  <span className={classes.headerCellInnerContent}>{columnSettings.label}</span>

                  {columnSettings.key === 'wellName' && (
                    <>
                      {!showWellFullName ? (
                        <ArrowRightIcon
                          className={classes.sortIcon}
                          onClick={onChangeShowWellFullName}
                        />
                      ) : (
                        <ArrowLeftIcon
                          className={classes.sortIcon}
                          onClick={onChangeShowWellFullName}
                        />
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            ))}
            <TableCell className={classes.headerCell}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map(rowData => (
            <LearnTableRow
              key={`${rowData.wellId}-${rowData.bhaId}`}
              showWellFullName={showWellFullName}
              rowData={rowData}
              rowSettings={tableColumns}
              minMaxDict={minMaxDict}
              onMouseEvent={onMouseEvent}
              handleClickMoreCell={handleClickMoreCell}
              getCellStyles={getCellStyles}
              onClickInfo={handleClickInfo}
            />
          ))}
        </TableBody>
      </Table>
    </>
  );
}

LearnTable.propTypes = {
  showWellFullName: PropTypes.bool.isRequired,
  onChangeShowWellFullName: PropTypes.func.isRequired,
  theme: PropTypes.shape({
    isLightTheme: PropTypes.bool.isRequired,
  }).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  tableSettings: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onMouseEvent: PropTypes.func.isRequired,
};

export default withTheme(memo(LearnTable));
