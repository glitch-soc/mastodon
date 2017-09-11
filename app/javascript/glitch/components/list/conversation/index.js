//  <ListConversation>
//  ====================

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/list/conversation

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import React from 'react';
import PropTypes from 'prop-types';
import ScrollContainer from 'react-router-scroll';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

//  Our imports.
import StatusContainer from 'glitch/components/status/container';

//  Stylesheet imports.
import './style';

//  * * * * * * * //

//  The component
//  -------------

export default class ListConversation extends ImmutablePureComponent {

  //  Props.
  static propTypes = {
    id: PropTypes.number.isRequired,
    ancestors: ImmutablePropTypes.list,
    descendants: ImmutablePropTypes.list,
    fetch: PropTypes.func.isRequired,
  }

  //  If this is a detailed status, we should fetch its contents and
  //  context upon mounting.
  componentWillMount () {
    const { id, fetch } = this.props;
    fetch(id);
  }

  //  Similarly, if the component receives new props, we need to fetch
  //  the new status.
  componentWillReceiveProps (nextProps) {
    const { id, fetch } = this.props;
    if (nextProps.id !== id) fetch(nextProps.id);
  }

  //  We just render our status inside a column with its
  //  ancestors and decendants.
  render () {
    const { id, ancestors, descendants } = this.props;
    return (
      <ScrollContainer scrollKey='thread'>
        <div className='glitch glitch__list__conversation scrollable'>
          {ancestors && ancestors.size > 0 ? (
            ancestors.map(
              ancestor => <StatusContainer key={ancestor} id={ancestor} route />
            )
          ) : null}
          <StatusContainer key={id} id={id} detailed route />
          {descendants && descendants.size > 0 ? (
            descendants.map(
              descendant => <StatusContainer key={descendant} id={descendant} route />
            )
          ) : null}
        </div>
      </ScrollContainer>
    );
  }

};
