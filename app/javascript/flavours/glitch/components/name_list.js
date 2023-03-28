import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl } from 'react-intl';

/**
 * Displays a single account (or label) as a link.
 *
 * Noteworthy that onClick gets called as `onClick(account, ev)` if an account is provided,
 * but only gets called with `onClick(ev)` if no account was provided.
 */
class NameLink extends React.PureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map,
    href: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.string,
  };

  handleClick = (ev) => {
    const { account, onClick } = this.props;
    onClick(account, ev);
  };

  render() {
    const { href, children } = this.props;
    return (
      <a
        href={href}
        className='status__display-name'
        onClick={this.handleClick}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }

}

/**
 * Displays a list of accounts as a comma-separated, link-ified list of displaynames.
 */
@injectIntl
export default class NameList extends React.PureComponent {

  static propTypes = {
    intl: PropTypes.object,
    accounts: ImmutablePropTypes.listOf(ImmutablePropTypes.map),
    viewMoreHref: PropTypes.string,
    onClick: PropTypes.func,
  };

  render() {
    const { accounts, intl, viewMoreHref, onClick } = this.props;

    // render a single name if there is only one account
    if (accounts.size === 1) {
      return (
        <span>
          <NameLink
            href={accounts.get(0).get('url')}
            account={accounts.get(0)}
            onClick={onClick}
          >
            {accounts.get(0).get('display_name_html') || accounts.get(0).get('username')}
          </NameLink>
        </span>
      );
    }

    // turn a list of accounts into a list (max length 3) of labels
    let accountsToIntl;
    const hasOthers = accounts.size > 3;
    if (hasOthers) {
      accountsToIntl = accounts.slice(0, 2).map(acct => acct.get('display_name_html') || acct.get('username'));
      accountsToIntl = accountsToIntl.push(intl.formatMessage({ id: 'notifications.others', defaultMessage: 'others' }));
    } else {
      accountsToIntl = accounts.map(acct => acct.get('display_name_html') || acct.get('username'));
    }

    // turn the list of labels into an array of parts, with the correct localization
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat
    const parts = new Intl.ListFormat(intl.locale, { type: 'conjunction' }).formatToParts(accountsToIntl);

    // linkify the list of labels
    let elementNum = 0;
    return parts.map(({ type, value }) => {
      const currentElement = elementNum;
      const account = accounts.get(currentElement);

      // if this is a label, linkify it
      if (type === 'element') {
        elementNum++;

        // special case for the "and others" label
        if (hasOthers && currentElement === 2) {
          return (
            <NameLink
              key={account.get('id')}
              href={viewMoreHref}
              onClick={onClick}
            >
              {value}
            </NameLink>
          );
        }

        // return the linkified label
        return <NameLink href={account.get('url')} account={account} key={account.get('id')} onClick={onClick}>{value}</NameLink>;
      } else {
        // if this is a separator, just print it out regularly
        return <React.Fragment key={`${account.get('id')}_separator`}>{value}</React.Fragment>;
      }
    });
  }

}
