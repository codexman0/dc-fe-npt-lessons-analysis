import { memo } from 'react';
import { shape, func } from 'prop-types';
import { get } from 'lodash';
import { IconButton, makeStyles } from '@material-ui/core';
import { InfoOutlined, DragIndicator } from '@material-ui/icons';

const useStyles = makeStyles({
  container: {
    height: '100%',
    padding: '0px 5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  wellNameContainer: {
    display: 'flex',
    width: '100%',
  },
  wellName: {
    color: '#fff',
    fontSize: '12px',
    lineHeight: '14px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  icon: {
    fontSize: '16px',
    color: '#9E9E9E',
  },
  iconButton: {
    padding: '5px',
  },
});

function WellHeader({ asset, chartSize, onToggleWellInfoDialog }) {
  const assetId = get(asset, ['data', 'id']);
  const isPhoneSize = chartSize.width < 420;

  const classes = useStyles({
    shouldWellNameShrink: isPhoneSize,
  });

  return (
    <div className={classes.container}>
      <IconButton
        data-not-migrated-MuiIconButton
        className={classes.iconButton}
        onClick={onToggleWellInfoDialog}
      >
        <DragIndicator className={classes.icon} />
      </IconButton>

      <div className={classes.wellNameContainer}>
        <a href={`/assets/${assetId}`} className={classes.wellName}>
          {get(asset, ['data', 'attributes', 'name'])}
        </a>
      </div>

      <div>
        <IconButton
          data-not-migrated-MuiIconButton
          className={classes.iconButton}
          onClick={onToggleWellInfoDialog}
        >
          <InfoOutlined className={classes.icon} />
        </IconButton>
      </div>
    </div>
  );
}

WellHeader.propTypes = {
  asset: shape({}).isRequired,
  chartSize: shape({}).isRequired,
  onToggleWellInfoDialog: func.isRequired,
};

export default memo(WellHeader);
