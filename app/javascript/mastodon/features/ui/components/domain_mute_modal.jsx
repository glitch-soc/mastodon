import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import Toggle from 'react-toggle';
import Button from '../../../components/button';
import { closeModal } from '../../../actions/modal';
import { muteDomain, toggleHideFromHome } from '../../../actions/domain_mutes';

const mapStateToProps = state => {
  return {
    domain: state.getIn(['domain_mutes', 'new', 'domain']),
    hideFromHome: state.getIn(['domain_mutes', 'new', 'hide_from_home']),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onConfirm(domain, hideFromHome) {
      dispatch(muteDomain(domain, hideFromHome));
    },

    onClose() {
      dispatch(closeModal());
    },

    onToggleHideFromHome() {
      dispatch(toggleHideFromHome());
    },
  };
};

class DomainMuteModal extends React.PureComponent {

  static propTypes = {
    domain: PropTypes.string.isRequired,
    hideFromHome: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onToggleHideFromHome: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.button.focus();
  }

  handleClick = () => {
    this.props.onClose();
    this.props.onConfirm(this.props.domain, this.props.hideFromHome);
  };

  handleCancel = () => {
    this.props.onClose();
  };

  setRef = (c) => {
    this.button = c;
  };

  toggleHideFromHome = () => {
    this.props.onToggleHideFromHome();
  };

  render () {
    const { domain, hideFromHome } = this.props;

    return (
      <div className='modal-root__modal mute-modal'>
        <div className='mute-modal__container'>
          <p>
            <FormattedMessage
              id='confirmations.domain_mute.message'
              defaultMessage='Are you sure you want to mute entire domain {domain}?'
              values={{ domain: <strong>{domain}</strong> }}
            />
          </p>
          <p className='mute-modal__explanation'>
            <FormattedMessage
              id='confirmations.domain_mute.explanation'
              defaultMessage='This will hide posts from {domain} from public timeline except you followed'
            />
          </p>
          <div className='setting-toggle'>
            <Toggle id='domain-mute-modal__hide-from-home-checkbox' checked={hideFromHome} onChange={this.toggleHideFromHome} />
            <label className='setting-toggle__label' htmlFor='domain-mute-modal__hide-from-home-checkbox'>
              <FormattedMessage id='domain_mute_modal.hide_from_home' defaultMessage='Hide from home timeline?' />
            </label>
          </div>
        </div>

        <div className='mute-modal__action-bar'>
          <Button onClick={this.handleCancel} className='mute-modal__cancel-button'>
            <FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />
          </Button>
          <Button onClick={this.handleClick} ref={this.setRef}>
            <FormattedMessage id='confirmations.domain_mute.confirm' defaultMessage='Mute domain' />
          </Button>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DomainMuteModal));
