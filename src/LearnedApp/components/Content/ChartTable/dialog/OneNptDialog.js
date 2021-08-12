import { memo } from 'react';
import { shape, func } from 'prop-types';
import moment from 'moment';
import { Close as CloseIcon } from '@material-ui/icons';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Typography,
  withStyles,
  IconButton,
} from '@material-ui/core';

import { getUnitDisplay } from '@corva/ui/utils';

const muiStyles = {
  dialogWidth: { minWidth: '420px' },
  dialogTitleStyle: {
    fontSize: '20px',
    color: '#BBBBBB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0px',
  },
  listItemStyle: { display: 'flex', justifyContent: 'space-between' },
  spacingItem: { padding: '20px' },
};

const NptEventContentComp = ({ classes, nptEvent }) => {
  const { listItemStyle, spacingItem } = classes;

  const lengthUnit = getUnitDisplay('length');

  const duration =
    nptEvent.data.start_time && nptEvent.data.end_time
      ? ((nptEvent.data.end_time - nptEvent.data.start_time) / 3600).fixFloat(1)
      : '';
  const startTimeDisplay = nptEvent.data.start_time
    ? moment.unix(nptEvent.data.start_time).format('MM/DD/YYYY HH:mm')
    : '';

  const md = Number.isFinite(nptEvent.data.depth) ? nptEvent.data.depth.formatNumeral('0,00') : '';

  const tvd = Number.isFinite(nptEvent.data.depth_tvd)
    ? nptEvent.data.depth_tvd.formatNumeral('0,00')
    : '';

  return (
    <List>
      <ListItem divider className={listItemStyle}>
        <Typography variant="body2">Type</Typography>
        <Typography variant="body2">{nptEvent.data.display_name}</Typography>
      </ListItem>
      <ListItem divider className={listItemStyle}>
        <Typography variant="body2">Duration(h)</Typography>
        <Typography variant="body2">{duration}</Typography>
      </ListItem>
      <ListItem divider className={listItemStyle}>
        <Typography variant="body2">Start Time</Typography>
        <Typography variant="body2">{startTimeDisplay}</Typography>
      </ListItem>
      <ListItem divider className={listItemStyle}>
        <Typography variant="body2">MD ({lengthUnit})</Typography>
        <Typography variant="body2">{md}</Typography>
      </ListItem>
      <ListItem divider className={listItemStyle}>
        <Typography variant="body2">TVD ({lengthUnit})</Typography>
        <Typography variant="body2">{tvd}</Typography>
      </ListItem>
      <ListItem divider className={listItemStyle}>
        <Typography variant="body2">Comment</Typography>
        <Typography variant="body2" style={{ textAlign: 'right' }}>
          {nptEvent.data.comment}
        </Typography>
      </ListItem>
      <ListItem className={spacingItem} />
    </List>
  );
};

NptEventContentComp.propTypes = {
  classes: shape({}).isRequired,
  nptEvent: shape({}).isRequired,
};

const NptEventContent = withStyles(muiStyles)(memo(NptEventContentComp));

const NptEventDialog = ({ classes, nptEvent, onClose }) => {
  const { dialogWidth, dialogTitleStyle } = classes;

  return (
    <Dialog open scroll="paper">
      <DialogTitle disableTypography className={dialogTitleStyle}>
        Hazard
        <IconButton
          data-not-migrated-MuiIconButton
          onClick={onClose}
        >
          <CloseIcon htmlColor="#BDBDBD" />
        </IconButton>
      </DialogTitle>
      <DialogContent className={dialogWidth}>
        <NptEventContent nptEvent={nptEvent} />
      </DialogContent>
    </Dialog>
  );
};

NptEventDialog.propTypes = {
  classes: shape({}).isRequired,
  nptEvent: shape({}).isRequired,
  onClose: func.isRequired,
};

export default withStyles(muiStyles)(memo(NptEventDialog));
