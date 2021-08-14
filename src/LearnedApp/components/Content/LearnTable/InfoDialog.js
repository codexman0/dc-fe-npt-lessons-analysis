import { memo } from 'react';
import { func } from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';

const useStyles = makeStyles({
  dialogTitle: {},
  dialog: {
    width: '420px',
    display: 'flex',
  },
  wellName: {
    borderBottom: '1px solid #333333',
  },
  navigate: {
    justifyContent: 'space-between',
  },
  listItem: {
    display: 'flex',
  },
  label: {},
  value: {},
});

const InfoDialog = ({ onClose }) => {
  const classes = useStyles();

  return (
    <Dialog open scroll="paper">
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography>Lessons Learned</Typography>
        <Typography>04/25/19 14:49</Typography>
        <IconButton onClick={onClose}>
          <MoreVertIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialog}>
        <div classes={classes.wellName}>Rig Name - Well Name</div>
        <div classes={classes.navigate}>
          <Typography>Drilling Optimization</Typography>
          <Typography>Navigate to well</Typography>
        </div>
        <div classes={classes.listItem}>
          <Typography classes={classes.label}>Event Severity:</Typography>
          <Typography classes={classes.value}>Critical</Typography>
        </div>
        <div classes={classes.listItem}>
          <Typography classes={classes.label}>TVD:</Typography>
          <Typography classes={classes.value}>1789</Typography>
        </div>
        <div classes={classes.listItem}>
          <Typography classes={classes.label}>Hole Section:</Typography>
          <Typography classes={classes.value}>Name</Typography>
        </div>
        <div classes={classes.listItem}>
          <Typography classes={classes.label}>Operation:</Typography>
          <Typography classes={classes.value}>Description</Typography>
        </div>
        <div classes={classes.listItem}>
          <Typography classes={classes.label}>Description:</Typography>
          <Typography classes={classes.value}>Description</Typography>
        </div>
        <div classes={classes.listItem}>
          <Typography classes={classes.label}>Description:</Typography>
          <Typography classes={classes.value}>Description</Typography>
        </div>
      </DialogContent>
    </Dialog>
  );
};

InfoDialog.propTypes = {
  onClose: func.isRequired,
};

export default memo(InfoDialog);
