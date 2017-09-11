//  <Status>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages } from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

//  Mastodon imports.
import scheduleIdleTask from 'mastodon/features/ui/util/schedule_idle_task';

//  Our imports.
import StatusActionBar from './action_bar';
import StatusContent from './content';
import StatusFooter from './footer';
import StatusHeader from './header';
import StatusMissing from './missing';
import StatusNav from './nav';
import StatusPrepend from './prepend';
import CommonButton from 'glitch/components/common/button';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  Initial setup
//  -------------

//  Holds our localization messages.
const messages = defineMessages({
  detailed:
    { id: 'status.detailed', defaultMessage: 'Detailed view' },
});

//  * * * * * * * //

//  The component
//  -------------

export default class Status extends ImmutablePureComponent {

  //  Props, and state.
  static propTypes = {
    autoPlayGif: PropTypes.bool,
    comrade: ImmutablePropTypes.map,
    deleteModal: PropTypes.bool,
    detailed: PropTypes.bool,
    handler: PropTypes.objectOf(PropTypes.func).isRequired,
    history: PropTypes.object,
    index: PropTypes.number,
    id: PropTypes.number,
    listLength: PropTypes.number,
    me: PropTypes.number,
    muted: PropTypes.bool,
    prepend: PropTypes.string,
    reblogModal: PropTypes.bool,
    setDetail: PropTypes.func,
    settings: ImmutablePropTypes.map,
    status: ImmutablePropTypes.map,
    intersectionObserverWrapper: PropTypes.object,
    intl : PropTypes.object,
  }
  state = {
    isExpanded: null,
    isIntersecting: true,
    isHidden: false,
  }

  //  Instance variables.
  componentMounted = false;

  //  Prior to mounting, we fetch the status's card if this is a
  //  detailed status and we don't already have it.
  componentWillMount () {
    const { detailed, handler, status } = this.props;
    if (!status.get('card') && detailed) handler.fetchCard(status);
  }

  //  On mounting, we start up our intersection observer.
  //  `componentMounted` tells us everything worked out OK.
  componentDidMount () {
    const { handleIntersection, node } = this;
    const { id, intersectionObserverWrapper } = this.props;
    if (!intersectionObserverWrapper) return;
    else intersectionObserverWrapper.observe(
      id,
      node,
      handleIntersection
    );
    this.componentMounted = true;
  }

  //  If the status is about to be both offscreen (not intersecting)
  //  and hidden, then we don't bother updating unless it's not already
  //  that way currently. Alternatively, if we're moving from offscreen
  //  to onscreen, we *have* to re-render. As a default case we just
  //  rely on `updateOnProps` and `updateOnStates` via the
  //  built-in `shouldComponentUpdate()` function.
  shouldComponentUpdate (nextProps, nextState) {
    switch (true) {
    case !nextState.isIntersecting && nextState.isHidden:
      switch (true) {
      case this.state.isIntersecting:
      case !this.state.isHidden:
      case nextProps.listLength !== this.props.listLength:
      case nextProps.index !== this.props.index:
        return true;
      default:
        return false;
      }
    case nextState.isIntersecting && !this.state.isIntersecting:
      return true;
    default:
      return super.shouldComponentUpdate(nextProps, nextState);
    }
  }

  //  If our component is about to update and is detailed, we request
  //  its card if we don't have it.
  componentWillUpdate (nextProps) {
    const { detailed, handler, status } = this.props;
    if (!status.get('card') && nextProps.detailed && !detailed) {
      handler.fetchCard(status);
    }
  }

  //  If the component is updated for any reason we save the height.
  componentDidUpdate () {
    const { isHidden, isIntersecting } = this.state;
    if (isIntersecting || !isHidden) this.saveHeight();
  }

  //  If our component is about to unmount, we'd better unset
  //  `componentMounted` lol.
  componentWillUnmount () {
    const { node } = this;
    const { id, intersectionObserverWrapper } = this.props;
    intersectionObserverWrapper.unobserve(id, node);
    this.componentMounted = false;
  }

  //  Doesn't quite work on Edge 15 but it gets close. This tells us if
  //  our status is onscreen, and if not we hide it at the next
  //  available opportunity. This isn't a huge deal (but it saves some
  //  rendering cycles if we don't have as much DOM) so we schedule
  //  it using `scheduleIdleTask`.
  handleIntersection = (entry) => {
    const isIntersecting = (
      typeof entry.isIntersecting === 'boolean' ?
      entry.isIntersecting :
      entry.intersectionRect.height > 0
    );
    this.setState((prevState) => {
      if (prevState.isIntersecting && !isIntersecting) {
        scheduleIdleTask(this.hideIfNotIntersecting);
      }
      return {
        isIntersecting,
        isHidden: false,
      };
    });
  }

  //  Because we scheduled toot-hiding as an idle task (see above), we
  //  *do* need to ensure that it's still not intersecting before we
  //  hide it lol.
  hideIfNotIntersecting = () => {
    if (!this.componentMounted) return;
    this.setState((prevState) => ({
      isHidden: !prevState.isIntersecting,
    }));
  }

  //  `saveHeight()` saves the status height so that we preserve its
  //  dimensions when it's being hidden.
  saveHeight = () => {
    if (this.node && this.node.children.length) {
      this.height = this.node.getBoundingClientRect().height;
    }
  }

  //  `setExpansion` handles expanding and collapsing statuses. Note
  //  that `isExpanded` is a *trinary* value:
  setExpansion = (value) => {
    const { detailed } = this.props;
    switch (true) {

    //  A value of `null` or `undefined` means the status should be
    //  neither expanded or collapsed.
    case value === undefined || value === null:
      this.setState({ isExpanded: null });
      break;

    //  A value of `false` means that the status should be collapsed.
    case !value:
      if (!detailed) this.setState({ isExpanded: false });
      else this.setState({ isExpanded: null });  //  fallback
      break;

    //  A value of `true` means that the status should be expanded.
    case !!value:
      this.setState({ isExpanded: true });
      break;
    }
  }

  //  Stores our node and saves its height.
  handleRef = (node) => {
    this.node = node;
    this.saveHeight();
  }

  //  `handleClick()` handles all clicking stuff. We route links and
  //  make our status detailed if it isn't already.
  handleClick = (e) => {
    const { detailed, history, id, setDetail, status } = this.props;
    if (!history || e.button || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
    if (setDetail) setDetail(detailed ? null : id);
    else history.push(`/statuses/${status.get('id')}`);
    e.preventDefault();
  }

  //  Puts our element on the screen.
  render () {
    const {
      handleRef,
      handleClick,
      saveHeight,
      setExpansion,
    } = this;
    const {
      autoPlayGif,
      comrade,
      detailed,
      handler,
      history,
      index,
      intl,
      listLength,
      me,
      muted,
      prepend,
      setDetail,
      settings,
      status,
    } = this.props;
    const {
      isExpanded,
      isHidden,
      isIntersecting,
    } = this.state;
    let account = status.get('account');
    let computedClass = 'glitch glitch__status';
    let conditionalProps = {};
    let selectorAttribs = {};

    //  If there's no status, we can't render lol.
    if (status === null) {
      return <StatusMissing />;
    }

    //  Here are extra data-* attributes for use with CSS selectors.
    //  We don't use these but users can via UserStyles.
    selectorAttribs = {
      'data-status-by': `@${account.get('acct')}`,
    };
    if (prepend && comrade) {
      selectorAttribs[`data-${prepend === 'favourite' ? 'favourited' : 'boosted'}-by`] = `@${comrade.get('acct')}`;
    }

    //  If our index and list length have been set, we can set the
    //  corresponding ARIA attributes.
    if (isFinite(index) && isFinite(listLength)) conditionalProps = {
      'aria-posinset': index,
      'aria-setsize': listLength,
    };

    //  This sets our class names.
    computedClass = classNames('glitch', 'glitch__status', {
      _detailed: detailed,
      _muted: muted,
    }, `_${status.get('visibility')}`);

    //  If our status is offscreen and hidden, we render an empty div.
    if (!isIntersecting && isHidden) {
      return (
        <article
          {...conditionalProps}
          data-id={status.get('id')}
          ref={handleRef}
          style={{
            height: `${this.height}px`,
            opacity: 0,
            overflow: 'hidden',
            visibility: 'hidden',
          }}
          tabIndex='0'
        >
          <div hidden>
            {account.get('display_name') || account.get('username')}
            {' '}
            {status.get('content')}
          </div>
        </article>
      );
    }

    //  Otherwise, we can render our status!
    return (
      <article
        className={computedClass}
        {...conditionalProps}
        data-id={status.get('id')}
        ref={handleRef}
        {...selectorAttribs}
        tabIndex='0'
      >
        {prepend && comrade ? (
          <StatusPrepend
            comrade={comrade}
            history={history}
            type={prepend}
          />
        ) : null}
        {setDetail ? (
          <CommonButton
            active={detailed}
            className='status\detail status\button'
            icon={detailed ? 'minus' : 'plus'}
            onClick={handleClick}
            title={intl.formatMessage(messages.detailed)}
          />
        ) : null}
        <StatusHeader
          account={account}
          comrade={comrade}
          history={history}
        />
        <StatusContent
          autoPlayGif={autoPlayGif}
          detailed={detailed}
          expanded={isExpanded}
          handler={handler}
          hideMedia={muted}
          history={history}
          intl={intl}
          letterbox={settings.getIn(['media', 'letterbox'])}
          onClick={handleClick}
          onHeightUpdate={saveHeight}
          setExpansion={setExpansion}
          status={status}
        />
        <StatusFooter
          application={status.get('application')}
          datetime={status.get('created_at')}
          detailed={detailed}
          href={status.get('url')}
          intl={intl}
          visibility={status.get('visibility')}
        />
        <StatusActionBar
          detailed={detailed}
          handler={handler}
          history={history}
          intl={intl}
          me={me}
          status={status}
        />
        {detailed ? (
          <StatusNav id={status.get('id')} intl={intl} />
        ) : null}
      </article>
    );

  }

}
