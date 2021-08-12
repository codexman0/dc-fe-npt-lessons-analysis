import { func, bool } from 'prop-types';
import { Assessment as ChartIcon, ViewList as TableIcon } from '@material-ui/icons';

import ToggleButton from './ToggleButton';

const TABS = [
  {
    label: <TableIcon fontSize="small" />,
    key: false,
  },
  {
    label: <ChartIcon fontSize="small" />,
    key: true,
  },
];

const ChartTableToggle = ({ onChange, value }) => {
  const handleTabChange = active => {
    onChange(active.key);
  };
  return (
    <ToggleButton
      tabs={TABS}
      onChange={handleTabChange}
      index={TABS.findIndex(item => item.key === value)}
    />
  );
};

ChartTableToggle.propTypes = {
  onChange: func.isRequired,
  value: bool.isRequired,
};

export default ChartTableToggle;
