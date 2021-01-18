import React from 'react';
import PropTypes from 'prop-types';
import Button from 'flavours/glitch/components/button';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { giphySet, uploadCompose } from 'flavours/glitch/actions/compose';
import IconButton from 'flavours/glitch/components/icon_button';
import { debounce, mapValues } from 'lodash';
import classNames from 'classnames';
import ReactGiphySearchbox from 'react-giphy-searchbox'
import { changeCompose } from 'flavours/glitch/actions/compose';

// Utility for converting base64 image to binary for upload
// https://stackoverflow.com/questions/35940290/how-to-convert-base64-string-to-javascript-file-object-like-as-from-file-input-f
function dataURLtoFile(dataurl, filename) {
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const mapStateToProps = state => ({
  options: state.getIn(['compose', 'giphy']),
});

const mapDispatchToProps = dispatch => ({
  /** Set options in the redux store */
  setOpt: (opts) => dispatch(giphySet(opts)),
  /** Submit GIF for upload */
  submit: (file) => dispatch(uploadCompose([file])),
});

export default @connect(mapStateToProps, mapDispatchToProps)
class GIFModal extends ImmutablePureComponent {

  static propTypes = {
    options: ImmutablePropTypes.map,
    onClose: PropTypes.func.isRequired,
    setOpt: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
  };

  componentDidMount() {
    //If component mounted
  }

  onDoneButton = (item) => {
    const url = item["images"]["original"]["mp4"];
    var modal = this;
    fetch(url).then(function(response) {
      return response.blob();
    }).then(function(blob) {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = function() {
        var dataUrl = reader.result;
        const file = dataURLtoFile(dataUrl, 'giphy.mp4');
        modal.props.submit(file);
        modal.props.onClose(); // close dialog
      };
    });
  };

  handleClick = () => {
    this.props.onClose();
  }

  handleCancel = () => {
    this.props.onClose();
  }

  setRef = (c) => {
    this.button = c;
  }

  toggleNotifications = () => {
    this.props.onToggleNotifications();
  }

  changeMuteDuration = (e) => {
    this.props.onChangeMuteDuration(e);
  }

  render () {

    return (
      <div className='modal-root__modal mute-modal'>
        <div className='mute-modal__container'>
          <ReactGiphySearchbox
            apiKey="1ttK05MF98dLllFFknTAVo0U4CGcQb4J"
            onSelect={item => this.onDoneButton(item)}
            masonryConfig={[
              { columns: 2, imageWidth: 190, gutter: 5 },
              { mq: "700px", columns: 2, imageWidth: 210, gutter: 5 }
            ]}
          />
        </div>
      </div>
    );
  }

}
