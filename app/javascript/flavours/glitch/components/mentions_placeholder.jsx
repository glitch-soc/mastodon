import ImmutablePropTypes from 'react-immutable-proptypes';

import { Permalink } from 'flavours/glitch/components/permalink';

export const MentionsPlaceholder = ({ status }) => {
  if (status.get('spoiler_text').length === 0 || !status.get('mentions')) {
    return null;
  }

  return (
    <div className='status__content'>
      {status.get('mentions').map(item => (
        <Permalink
          to={`/@${item.get('acct')}`}
          href={item.get('url')}
          key={item.get('id')}
          className='mention'
        >
          @<span>{item.get('username')}</span>
        </Permalink>
      )).reduce((aggregate, item) => [...aggregate, item, ' '], [])}
    </div>
  );
};

MentionsPlaceholder.propTypes = {
  status: ImmutablePropTypes.map.isRequired,
};
  