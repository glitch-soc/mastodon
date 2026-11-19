import { FormattedMessage } from 'react-intl';

import { CircularProgress } from '@/flavours/glitch/components/circular_progress';
import { Column } from '@/flavours/glitch/components/column';
import { ColumnHeader } from '@/flavours/glitch/components/column_header';
import { Skeleton } from '@/flavours/glitch/components/skeleton';

import classes from './styles.module.scss';

export const ColumnLoading: React.FC = () => (
  <Column>
    <ColumnHeader title={<Skeleton width='120px' />} />

    <div className='scrollable'>
      <div className={classes.loadingWrapper}>
        <CircularProgress size={30} strokeWidth={2} />
        <FormattedMessage
          id='loading_indicator.label'
          defaultMessage='Loading…'
        />
      </div>
    </div>
  </Column>
);
