import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import { List as ImmutableList } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { TimelineHint } from 'flavours/glitch/components/timeline_hint';
import ProfileColumnHeader from 'flavours/glitch/features/account/components/profile_column_header';
import BundleColumnError from 'flavours/glitch/features/ui/components/bundle_column_error';
import { normalizeForLookup } from 'flavours/glitch/reducers/accounts_map';
import { getAccountHidden } from 'flavours/glitch/selectors';
import { useAppSelector } from 'flavours/glitch/store';

import { lookupAccount, fetchAccount } from '../../actions/accounts';
import { fetchFeaturedTags } from '../../actions/featured_tags';
import { expandAccountFeaturedTimeline, expandAccountTimeline } from '../../actions/timelines';
import { LoadingIndicator } from '../../components/loading_indicator';
import StatusList from '../../components/status_list';
import Column from '../ui/components/column';

import { LimitedAccountHint } from './components/limited_account_hint';
import HeaderContainer from './containers/header_container';

const emptyList = ImmutableList();

const mapStateToProps = (state, { params: { acct, id, tagged }, withReplies = false }) => {
  const accountId = id || state.getIn(['accounts_map', normalizeForLookup(acct)]);

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
    remote: !!(state.getIn(['accounts', accountId, 'acct']) !== state.getIn(['accounts', accountId, 'username'])),
    remoteUrl: state.getIn(['accounts', accountId, 'url']),
    isAccount: !!state.getIn(['accounts', accountId]),
    statusIds: state.getIn(['timelines', `account:${path}`, 'items'], ImmutableList()),
    featuredStatusIds: withReplies ? ImmutableList() : state.getIn(['timelines', `account:${accountId}:pinned${tagged ? `:${tagged}` : ''}`, 'items'], ImmutableList()),
    isLoading: state.getIn(['timelines', `account:${path}`, 'isLoading']),
    hasMore:   state.getIn(['timelines', `account:${path}`, 'hasMore']),
    suspended: state.getIn(['accounts', accountId, 'suspended'], false),
    hidden: getAccountHidden(state, accountId),
  };
};

const RemoteHint = ({ accountId, url }) => {
  const acct = useAppSelector(state => state.accounts.get(accountId)?.acct);
  const domain = acct ? acct.split('@')[1] : undefined;

  return (
    <TimelineHint
      url={url}
      message={<FormattedMessage id='hints.profiles.posts_may_be_missing' defaultMessage='Some posts from this profile may be missing.' />}
      label={<FormattedMessage id='hints.profiles.see_more_posts' defaultMessage='See more posts on {domain}' values={{ domain: <strong>{domain}</strong> }} />}
    />
  );
};

RemoteHint.propTypes = {
  url: PropTypes.string.isRequired,
  accountId: PropTypes.string.isRequired,
};

class AccountTimeline extends ImmutablePureComponent {

  static propTypes = {
    params: PropTypes.shape({
      acct: PropTypes.string,
      id: PropTypes.string,
      tagged: PropTypes.string,
    }).isRequired,
    accountId: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    statusIds: ImmutablePropTypes.list,
    featuredStatusIds: ImmutablePropTypes.list,
    isLoading: PropTypes.bool,
    hasMore: PropTypes.bool,
    withReplies: PropTypes.bool,
    isAccount: PropTypes.bool,
    suspended: PropTypes.bool,
    hidden: PropTypes.bool,
    remote: PropTypes.bool,
    remoteUrl: PropTypes.string,
    multiColumn: PropTypes.bool,
  };

  _load () {
    const { accountId, withReplies, params: { tagged }, dispatch } = this.props;

    dispatch(fetchAccount(accountId));

    if (!withReplies) {
      dispatch(expandAccountFeaturedTimeline(accountId, { tagged }));
    }

    dispatch(fetchFeaturedTags(accountId));
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
    const { accountId, statusIds, featuredStatusIds, isLoading, hasMore, suspended, isAccount, hidden, multiColumn, remote, remoteUrl } = this.props;

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

    const remoteMessage = remote ? <RemoteHint accountId={accountId} url={remoteUrl} /> : null;

    return (
      <Column ref={this.setRef}>
        <ProfileColumnHeader onClick={this.handleHeaderClick} multiColumn={multiColumn} />

        <StatusList
          prepend={<HeaderContainer accountId={this.props.accountId} hideTabs={forceEmptyState} tagged={this.props.params.tagged} />}
          alwaysPrepend
          append={remoteMessage}
          scrollKey='account_timeline'
          statusIds={forceEmptyState ? emptyList : statusIds}
          featuredStatusIds={featuredStatusIds}
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
