import { memo } from 'react';
import { get } from 'lodash';
import { func, shape, string, number } from 'prop-types';
import moment from 'moment-timezone';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  makeStyles,
  List,
  ListItem,
  Input,
} from '@material-ui/core';
import {
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  InsertComment as InsertCommentIcon,
  AccountCircle as AccountCircleIcon,
} from '@material-ui/icons';

import LessonsIcon from './LessonsIcon';

const useStyles = makeStyles({
  paper: {
    padding: 26,
    background: 'transparent',
    boxShadow: 'none',
  },
  dialog: {
    background: '#424242',
    borderRadius: '4px',
    // boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.4)',
    border: '5px solid rgba(0,0,0,.01)',
  },
  dialogTitle: {
    padding: '20px 5px 0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 500,
  },
  dialogContent: {
    width: '380px',
    padding: '0 20px',
    marginBottom: '10px',
  },
  lessonsIcon: {
    background: '#8B8B8B',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '-48px',
  },
  title: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  wellName: {
    padding: '0 0 10px 0',
    fontSize: '14px',
    color: '#BDBDBD',
    borderBottom: '1px solid #bdbdbd',
  },
  navigate: {
    color: '#03bcd4',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  navigateListItem: {
    padding: '10px 0 0 0',
    justifyContent: 'space-between',
  },
  listItem: {
    padding: '10px 0 0 0',
  },
  commentListItem: {
    padding: 0,
  },
  label: {
    fontSize: '14px',
    color: '#BDBDBD',
  },
  value: {
    fontSize: '14px',
    color: '#fff',
    paddingLeft: '10px',
  },
  descripton: {
    fontSize: '14px',
    color: '#fff',
  },
  editText: {
    width: '100%',
    height: '30px',
    paddingLeft: '8px',
    fontSize: '14px',
    background: '#565656',
    borderRadius: '3px',
    color: '#fff',
  },
});

function formatNumber(value, precision) {
  return Number.isFinite(parseFloat(value)) ? parseFloat(value).toFixed(precision) : '-';
}

function formatDateTime(timestamp) {
  return moment.unix(timestamp).format('MM/DD/YY HH:mm');
}

const OneLessonsDialog = ({ assetId, rigName, wellName, lessonData, onClose }) => {
  const classes = useStyles();

  const handleClickThumbsUp = () => {};

  const handleClickComment = () => {};

  const handleChangeEdit = e => {
    console.log(e.target.value);
  };

  return (
    <Dialog open scroll="paper" classes={{ paper: classes.paper }}>
      <div className={classes.dialog}>
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <div className={classes.title}>
            <div className={classes.lessonsIcon}>
              <LessonsIcon />
            </div>
            &nbsp;&nbsp;Lessons Learned
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography style={{ fontSize: 14, color: '#BDBDBD' }}>
              {formatDateTime(get(lessonData, 'start_time'))}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon fontSize="small" style={{ color: '#BDBDBD' }} />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <List>
            <ListItem classes={{ gutters: classes.wellName }}>
              {`${rigName} - ${wellName}`}
            </ListItem>
            <ListItem classes={{ gutters: classes.navigateListItem }}>
              <Typography variant="body2" classes={{ body2: classes.label }}>
                {get(lessonData, 'topic')}
              </Typography>
              <Typography
                variant="body2"
                classes={{ body2: classes.navigate }}
                component="a"
                href={`/assets/${assetId}`}
              >
                Navigate to well
              </Typography>
            </ListItem>
            <ListItem classes={{ gutters: classes.listItem }}>
              <Typography variant="body2" classes={{ body2: classes.label }}>
                Event Severity:
              </Typography>
              <Typography variant="body2" classes={{ body2: classes.value }}>
                {get(lessonData, 'severity')}
              </Typography>
            </ListItem>
            <ListItem classes={{ gutters: classes.listItem }}>
              <Typography variant="body2" classes={{ body2: classes.label }}>
                TVD:
              </Typography>
              <Typography variant="body2" classes={{ body2: classes.value }}>
                {`${formatNumber(get(lessonData, 'tvd_start'), 1)} ft`}
              </Typography>
            </ListItem>
            <ListItem classes={{ gutters: classes.listItem }}>
              <Typography variant="body2" classes={{ body2: classes.label }}>
                Hole Section:
              </Typography>
              <Typography variant="body2" classes={{ body2: classes.value }}>
                {get(lessonData, 'section')}
              </Typography>
            </ListItem>
            <ListItem classes={{ gutters: classes.listItem }}>
              <Typography variant="body2" classes={{ body2: classes.label }}>
                Operation:
              </Typography>
              <Typography variant="body2" classes={{ body2: classes.value }}>
                {get(lessonData, 'activity')}
              </Typography>
            </ListItem>
            <ListItem classes={{ gutters: classes.listItem }}>
              <Typography variant="body2" classes={{ body2: classes.label }}>
                Description:
              </Typography>
            </ListItem>
            <ListItem classes={{ gutters: classes.listItem }}>
              <Typography variant="body2" classes={{ body2: classes.descripton }}>
                {get(lessonData, 'description')}
              </Typography>
            </ListItem>
            <ListItem classes={{ gutters: classes.commentListItem }}>
              <IconButton onClick={handleClickThumbsUp}>
                <ThumbUpIcon fontSize="small" style={{ color: '#BDBDBD' }} />
              </IconButton>
              <IconButton onClick={handleClickComment}>
                <InsertCommentIcon fontSize="small" style={{ color: '#BDBDBD' }} />
              </IconButton>
            </ListItem>
            <ListItem classes={{ gutters: classes.commentListItem }}>
              <IconButton>
                <AccountCircleIcon fontSize="medium" style={{ color: '#BDBDBD' }} />
              </IconButton>
              <Input
                placeholder="Type here"
                inputProps={{ 'aria-label': 'message' }}
                className={classes.editText}
                onChange={handleChangeEdit}
              />
            </ListItem>
          </List>
        </DialogContent>
      </div>
    </Dialog>
  );
};

OneLessonsDialog.propTypes = {
  assetId: number.isRequired,
  rigName: string.isRequired,
  wellName: string.isRequired,
  lessonData: shape({}).isRequired,
  onClose: func.isRequired,
};

export default memo(OneLessonsDialog);
