import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import { List as ImmutableList } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { ProfileColumnHeader } from 'flavours/glitch/features/account/components/profile_column_header';
import BundleColumnError from 'flavours/glitch/features/ui/components/bundle_column_error';
import { normalizeForLookup } from 'flavours/glitch/reducers/accounts_map';
import { getAccountHidden } from 'flavours/glitch/selectors/accounts';

import { lookupAccount, fetchAccount } from '../../actions/accounts';
import { expandAccountFeaturedTimeline, expandAccountTimeline } from '../../actions/timelines';
import { LoadingIndicator } from '../../components/loading_indicator';
import StatusList from '../../components/status_list';
import Column from '../ui/components/column';
import { RemoteHint } from 'flavours/glitch/components/remote_hint';

import { AccountHeader } from './components/account_header';
import { LimitedAccountHint } from './components/limited_account_hint';
import { FeaturedCarousel } from '@/flavours/glitch/components/featured_carousel';

const emptyList = ImmutableList();

const mapStateToProps = (state, { params: { acct, id, tagged }, withReplies = false }) => {
  const accountId = id || state.accounts_map[normalizeForLookup(acct)];

  if (accountId === null) {
    return {
      isLoading: false,
      isAccount: false,
      statusIds: emptyList,
    };
  } else if (!accountId) {
    return {
      isLoading: true,
      statusIds: emptyList,
    };
  }

  const path = withReplies ? `${accountId}:with_replies` : `${accountId}${tagged ? `:${tagged}` : ''}`;

  return {
    accountId,
    isAccount: !!state.getIn(['accounts', accountId]),
    statusIds: state.getIn(['timelines', `account:${path}`, 'items'], ImmutableList()),
    isLoading: state.getIn(['timelines', `account:${path}`, 'isLoading']),
    hasMore:   state.getIn(['timelines', `account:${path}`, 'hasMore']),
    suspended: state.getIn(['accounts', accountId, 'suspended'], false),
    hidden: getAccountHidden(state, accountId),
  };
};

class AccountTimeline extends ImmutablePureComponent {

  static contextTypes = {
    identity: PropTypes.object,
  };

  static propTypes = {
    params: PropTypes.shape({
      acct: PropTypes.string,
      id: PropTypes.string,
      tagged: PropTypes.string,
    }).isRequired,
    accountId: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    statusIds: ImmutablePropTypes.list,
    isLoading: PropTypes.bool,
    hasMore: PropTypes.bool,
    withReplies: PropTypes.bool,
    isAccount: PropTypes.bool,
    suspended: PropTypes.bool,
    hidden: PropTypes.bool,
    multiColumn: PropTypes.bool,
  };

  _load () {
    const { accountId, withReplies, remote, remoteUrl, params: { tagged }, dispatch } = this.props;

    if (remote && !this.context.identity.signedIn) {
      window.location.replace(remoteUrl);
    }

    dispatch(fetchAccount(accountId));

    if (!withReplies) {
      dispatch(expandAccountFeaturedTimeline(accountId, { tagged }));
    }

    dispatch(expandAccountTimeline(accountId, { withReplies, tagged }));
  }

  componentDidMount () {
    const { params: { acct }, accountId, dispatch } = this.props;

    if (accountId) {
      this._load();
    } else {
      dispatch(lookupAccount(acct));
    }
  }

  componentDidUpdate (prevProps) {
    const { params: { acct, tagged }, accountId, withReplies, dispatch } = this.props;

    if (prevProps.accountId !== accountId && accountId) {
      this._load();
    } else if (prevProps.params.acct !== acct) {
      dispatch(lookupAccount(acct));
    } else if (prevProps.params.tagged !== tagged) {
      if (!withReplies) {
        dispatch(expandAccountFeaturedTimeline(accountId, { tagged }));
      }
      dispatch(expandAccountTimeline(accountId, { withReplies, tagged }));
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { dispatch } = this.props;

    if ((nextProps.params.accountId !== this.props.params.accountId && nextProps.params.accountId) || nextProps.withReplies !== this.props.withReplies) {
      dispatch(fetchAccount(nextProps.params.accountId));

      if (!nextProps.withReplies) {
        dispatch(expandAccountFeaturedTimeline(nextProps.params.accountId));
      }

      dispatch(expandAccountTimeline(nextProps.params.accountId, { withReplies: nextProps.params.withReplies }));
    }
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  };

  handleLoadMore = maxId => {
    this.props.dispatch(expandAccountTimeline(this.props.accountId, { maxId, withReplies: this.props.withReplies, tagged: this.props.params.tagged }));
  };

  setRef = c => {
    this.column = c;
  };

  render () {
    const { accountId, statusIds, isLoading, hasMore, suspended, isAccount, hidden, multiColumn, remote, remoteUrl, params: { tagged } } = this.props;

    if (isLoading && statusIds.isEmpty()) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    } else if (!isLoading && !isAccount) {
      return (
        <BundleColumnError multiColumn={multiColumn} errorType='routing' />
      );
    }

    let emptyMessage;

    const forceEmptyState = suspended || hidden;

    if (suspended) {
      emptyMessage = <FormattedMessage id='empty_column.account_suspended' defaultMessage='Account suspended' />;
    } else if (hidden) {
      emptyMessage = <LimitedAccountHint accountId={accountId} />;
    } else if (remote && statusIds.isEmpty()) {
      emptyMessage = <RemoteHint accountId={accountId} url={remoteUrl} />;
    } else {
      emptyMessage = <FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts found' />;
    }

    return (
      <Column ref={this.setRef}>
        <ProfileColumnHeader onClick={this.handleHeaderClick} multiColumn={multiColumn} />

        <StatusList
          prepend={
            <>
              <AccountHeader accountId={this.props.accountId} hideTabs={forceEmptyState} tagged={tagged} />
              {!forceEmptyState && <FeaturedCarousel accountId={this.props.accountId} tagged={tagged} />}
            </>
        }
          alwaysPrepend
          append={<RemoteHint accountId={accountId} />}
          scrollKey='account_timeline'
          statusIds={forceEmptyState ? emptyList : statusIds}
          isLoading={isLoading}
          hasMore={!forceEmptyState && hasMore}
          onLoadMore={this.handleLoadMore}
          emptyMessage={emptyMessage}
          bindToDocument={!multiColumn}
          timelineId='account'
        />
      </Column>
    );
  }

}

export default connect(mapStateToProps)(AccountTimeline);
