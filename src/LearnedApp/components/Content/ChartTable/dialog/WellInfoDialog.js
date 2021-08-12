import { memo } from 'react';
import { shape, bool, func } from 'prop-types';
import { get } from 'lodash';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  IconButton,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { Close as CloseIcon, FiberManualRecord as CircleImageIcon } from '@material-ui/icons';

import { main } from '@corva/ui/utils';

const mainUtils = main.default;

const useStyles = makeStyles({
  dialogTitleStyle: {
    fontSize: '20px',
    color: '#BBBBBB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogStyle: {
    width: '100%',
    maxHeight: '100%',
  },
  dialogBodyStyle: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    gridTemplateRows: 'repeat(8, 1fr)',
  },
  dialogItemStyle: {
    display: 'block',
  },
  dialogItemLabelStyle: {
    color: 'rgba(255, 255, 255, 0.54)',
    marginRight: '5px',
  },
  dialogTextStyle: {
    textTransform: 'capitalize',
  },
  itemGroupStyle: { display: 'flex', alignItems: 'center' },
  circleImageIcon: {
    style: {
      width: 18,
      height: 18,
      position: 'relative',
      top: 4,
    },
  },
});

function WellInfoDialog({ onToggle, isDialogOpen, asset, wellData }) {
  const classes = useStyles();
  const {
    dialogTitleStyle,
    dialogStyle,
    dialogBodyStyle,
    dialogItemStyle,
    dialogItemLabelStyle,
    dialogTextStyle,
    circleImageIcon,
    itemGroupStyle,
  } = classes;
  return (
    <Dialog
      onBackdropClick={onToggle}
      onEscapeKeyDown={onToggle}
      open={isDialogOpen}
      maxWidth={false}
    >
      <DialogTitle disableTypography className={dialogTitleStyle}>
        Well Information
        <IconButton data-not-migrated-MuiIconButton onClick={onToggle}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={dialogStyle}>
        <List className={dialogBodyStyle}>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Well Name
            </Typography>
            <Typography variant="body2">{get(asset, ['data', 'attributes', 'name'])}</Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Target Formation
            </Typography>
            <Typography variant="body2">
              {get(asset, ['data', 'attributes', 'target_formation'])}
            </Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Pad
            </Typography>
            <Typography variant="body2">
              {get(asset, ['data', 'attributes', 'pad_name'])}
            </Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              API Number
            </Typography>
            <Typography variant="body2">
              {get(asset, ['data', 'attributes', 'api_number'])}
            </Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Rig
            </Typography>
            <Typography variant="body2">
              {get(asset, ['data', 'attributes', 'rig_name'])}
            </Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Wellhead Location
            </Typography>
            <div className={itemGroupStyle}>
              <Typography variant="body2" className={dialogItemLabelStyle}>
                Lat:{' '}
              </Typography>
              <Typography variant="body2">
                {get(asset, ['data', 'attributes', 'lon_lat', 'latitude'])}
              </Typography>
            </div>
            <div className={itemGroupStyle}>
              <Typography variant="body2" className={dialogItemLabelStyle}>
                Long:
              </Typography>
              <Typography variant="body2">
                {get(asset, ['data', 'attributes', 'lon_lat', 'longitude'])}
              </Typography>
            </div>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Program
            </Typography>
            <Typography variant="body2">
              {get(asset, ['data', 'attributes', 'root_asset_name'])}
            </Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Directional Company
            </Typography>
            <Typography variant="body2">
              {get(asset, ['data', 'attributes', 'directional_driller'])}
            </Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              County
            </Typography>
            <Typography variant="body2">{get(asset, ['data', 'attributes', 'county'])}</Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              AFE #
            </Typography>
            <Typography variant="body2">
              {get(asset, ['data', 'attributes', 'settings', 'drilling_afe_number'], null)}
            </Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Basin
            </Typography>
            <Typography variant="body2">{get(asset, ['data', 'attributes', 'basin'])}</Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Vertical Section Direction
            </Typography>
            <Typography variant="body2">
              {wellData ? wellData.vertical_section_azimuth : ' '}
            </Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Area
            </Typography>
            <Typography variant="body2">{get(asset, ['data', 'attributes', 'area'])}</Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Directional Plan Name
            </Typography>
            <Typography variant="body2">{wellData ? wellData.plan_name : ' '}</Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              String Design
            </Typography>
            <Typography variant="body2">
              {get(asset, ['data', 'attributes', 'string_design'])}
            </Typography>
          </ListItem>
          <ListItem className={dialogItemStyle}>
            <Typography variant="body2" noWrap className={dialogItemLabelStyle}>
              Status
            </Typography>
            <div className={itemGroupStyle}>
              <CircleImageIcon
                htmlColor={mainUtils.getAssetStatusColor(
                  get(asset, ['data', 'attributes', 'status'])
                )}
                className={circleImageIcon}
              />
              <Typography variant="body2" className={dialogTextStyle}>
                {get(asset, ['data', 'attributes', 'status'])}
              </Typography>
            </div>
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}

WellInfoDialog.propTypes = {
  wellData: shape({}).isRequired,
  onToggle: func.isRequired,
  isDialogOpen: bool.isRequired,
  asset: shape({}).isRequired,
};

export default memo(WellInfoDialog);
