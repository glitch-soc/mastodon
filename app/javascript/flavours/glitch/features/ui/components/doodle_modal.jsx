import React from 'react';
import PropTypes from 'prop-types';
import Button from 'flavours/glitch/components/button';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Atrament from 'atrament'; // the doodling library
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { doodleSet, uploadCompose } from 'flavours/glitch/actions/compose';
import IconButton from 'flavours/glitch/components/icon_button';
import { debounce, mapValues } from 'lodash';
import classNames from 'classnames';

// translateable strings
const messages = defineMessages({
  discard: { id: 'doodle.discard', defaultMessage: 'Discard doodle? All changes will be lost!' },
  canvas_size: { id: 'doodle.canvas_size', defaultMessage: 'Change canvas size? This will erase your current drawing!' },
  canvas_clear: { id: 'doodle.canvas_clear', defaultMessage: 'Clear canvas? This will erase your current drawing!' },
  smoothing: { id: 'doodle.smoothing', defaultMessage: 'Smoothing' },
  adaptive: { id: 'doodle.adaptive', defaultMessage: 'Adaptive' },
  weight: { id: 'doodle.weight', defaultMessage: 'Weight' },
  done: { id: 'doodle.done', defaultMessage: 'Done' },
  cancel: { id: 'doodle.cancel', defaultMessage: 'Cancel' },
  draw: { id: 'doodle.draw', defaultMessage: 'Draw' },
  fill: { id: 'doodle.fill', defaultMessage: 'Fill' },
  undo: { id: 'doodle.undo', defaultMessage: 'Undo' },
  clear: { id: 'doodle.clear', defaultMessage: 'Clear' },
  color_black: { id: 'doodle.color.black', defaultMessage: 'Black' },
  color_grey_15: { id: 'doodle.color.grey_15', defaultMessage: 'Grey 15' },
  color_grey_30: { id: 'doodle.color.grey_30', defaultMessage: 'Grey 30' },
  color_grey_50: { id: 'doodle.color.grey_50', defaultMessage: 'Grey 50' },
  color_grey_67: { id: 'doodle.color.grey_67', defaultMessage: 'Grey 67' },
  color_grey_85: { id: 'doodle.color.grey_85', defaultMessage: 'Grey 85' },
  color_white: { id: 'doodle.color.white', defaultMessage: 'White' },
  color_maroon: { id: 'doodle.color.maroon', defaultMessage: 'Maroon' },
  color_english_red: { id: 'doodle.color.english_red', defaultMessage: 'English-red' },
  color_tomato: { id: 'doodle.color.tomato', defaultMessage: 'Tomato' },
  color_orange_red: { id: 'doodle.color.orange_red', defaultMessage: 'Orange-red' },
  color_salmon: { id: 'doodle.color.salmon', defaultMessage: 'Salmon' },
  color_cadium: { id: 'doodle.color.cadium_yellow', defaultMessage: 'Cadium-yellow' },
  color_lemon_yellow: { id: 'doodle.color.lemon_yellow', defaultMessage: 'Lemon yellow' },
  color_dark_crimson: { id: 'doodle.color.dark_crimson', defaultMessage: 'Dark crimson' },
  color_deep_carmine: { id: 'doodle.color.deep_carmine', defaultMessage: 'Deep carmine' },
  color_orange: { id: 'doodle.color.orange', defaultMessage: 'Orange' },
  color_dark_tangerine: { id: 'doodle.color.dark_tangerine', defaultMessage: 'Dark tangerine' },
  color_persian_orange: { id: 'doodle.color.persian_orange', defaultMessage: 'Persian orange' },
  color_sand: { id: 'doodle.color.sand', defaultMessage: 'Sand' },
  color_peach: { id: 'doodle.color.peach', defaultMessage: 'Peach' },
  color_bole: { id: 'doodle.color.bole', defaultMessage: 'Bole' },
  color_dark_cordovan: { id: 'doodle.color.dark_cordovan', defaultMessage: 'Dark cordovan' },
  color_chestnut: { id: 'doodle.color.chestnut', defaultMessage: 'Chestnut' },
  color_dark_salmon: { id: 'doodle.color.dark_salmon', defaultMessage: 'Dark salmon' },
  color_apricot: { id: 'doodle.color.apricot', defaultMessage: 'Apricot' },
  color_unbleached_silk: { id: 'doodle.color.unbleached_silk', defaultMessage: 'Unbleached silk' },
  color_straw: { id: 'doodle.color.straw', defaultMessage: 'Straw' },
  color_bistre: { id: 'doodle.color.bistre', defaultMessage: 'Bistre' },
  color_dark_chocolate: { id: 'doodle.color.dark_chocolate', defaultMessage: 'Dark chocolate' },
  color_burnt_sienna: { id: 'doodle.color.burnt_sienna', defaultMessage: 'Burnt sienna' },
  color_sienna: { id: 'doodle.color.sienna', defaultMessage: 'Sienna' },
  color_yellow_ochre: { id: 'doodle.color.yellow_ochre', defaultMessage: 'Yellow ochre' },
  color_tan: { id: 'doodle.color.tan', defaultMessage: 'Tan' },
  color_dark_wheat: { id: 'doodle.color.dark_wheat', defaultMessage: 'Dark wheat' },
  color_prussian_blue: { id: 'doodle.color.prussian_blue', defaultMessage: 'Prussian blue' },
  color_dark_grey_blue: { id: 'doodle.color.dark_grey_blue', defaultMessage: 'Dark grey blue' },
  color_cobalt_blue: { id: 'doodle.color.cobalt', defaultMessage: 'Cobalt blue' },
  color_blue: { id: 'doodle.color.blue', defaultMessage: 'Blue' },
  color_bright_french_blue: { id: 'doodle.color.bright_french_blue', defaultMessage: 'Bright french blue' },
  color_bright_steel_blue: { id: 'doodle.color.bright_steel_blue', defaultMessage: 'Bright steel blue' },
  color_ice_blue: { id: 'doodle.color.ice_blue', defaultMessage: 'Ice blue' },
  color_medium_jungle_green: { id: 'doodle.color.medium_jungle_green', defaultMessage: 'Medium jungle green' },
  color_dark_slate_grey: { id: 'doodle.color.dark_slate_grey', defaultMessage: 'Dark slate grey' },
  color_dark_grullo_green: { id: 'doodle.color.dark_grullo_green', defaultMessage: 'Dark grullo green' },
  color_teal: { id: 'doodle.color.teal', defaultMessage: 'Teal' },
  color_turquoise: { id: 'doodle.color.turquoise', defaultMessage: 'Turquoise' },
  color_cerulean_frost: { id: 'doodle.color.cerulean_frost', defaultMessage: 'Cerulean frost' },
  color_tiffany_green: { id: 'doodle.color.tiffany_green', defaultMessage: 'Tiffany green' },
  color_gray_asparagus: { id: 'doodle.color.gray_asparagus', defaultMessage: 'Gray-asparagus' },
  color_medium_dark_teal: { id: 'doodle.color.medium_dark_teal', defaultMessage: 'Medium dark teal' },
  color_xanadu: { id: 'doodle.color.xanadu', defaultMessage: 'Xanadu' },
  color_mint: { id: 'doodle.color.mint', defaultMessage: 'Mint' },
  color_timberwolf: { id: 'doodle.color.timberwolf', defaultMessage: 'Timberwolf' },
  color_celeste: { id: 'doodle.color.celeste', defaultMessage: 'Celeste' },
  color_aquamarine: { id: 'doodle.color.aquamarine', defaultMessage: 'Aquamarine' },
  color_cal_poly_pomona: { id: 'doodle.color.cal_poly_pomona', defaultMessage: 'Cal Poly Pomona' },
  color_forest_green: { id: 'doodle.color.forest_green', defaultMessage: 'Forest green' },
  color_napier_green: { id: 'doodle.color.napier_green', defaultMessage: 'Napier green' },
  color_olive: { id: 'doodle.color.olive', defaultMessage: 'Olive' },
  color_sea_green: { id: 'doodle.color.sea_green', defaultMessage: 'Sea green' },
  color_green_yellow: { id: 'doodle.color.green_yellow', defaultMessage: 'Green-yellow' },
  color_bright_chartreuse: { id: 'doodle.color.bright_chartreuse', defaultMessage: 'Bright chartreuse' },
  color_purple: { id: 'doodle.color.purple', defaultMessage: 'Purple' },
  color_violet: { id: 'doodle.color.violet', defaultMessage: 'Violet' },
  color_dark_thulian_pink: { id: 'doodle.color.dark_thulian_pink', defaultMessage: 'Dark thulian pink' },
  color_cerise: { id: 'doodle.color.cerise', defaultMessage: 'Cerise' },
  color_deep_pink: { id: 'doodle.color.deep_pink', defaultMessage: 'Deep pink' },
  color_rose_pink: { id: 'doodle.color.rose_pink', defaultMessage: 'Rose pink' },
  color_pink: { id: 'doodle.color.pink', defaultMessage: 'Pink' },
  color_rgb_red: { id: 'doodle.color.rgb_red', defaultMessage: 'RGB Red' },
  color_rgb_green: { id: 'doodle.color.rgb_green', defaultMessage: 'RGB Green' },
  color_rgb_blue: { id: 'doodle.color.rgb_blue', defaultMessage: 'RGB Blue' },
  color_cmyk_cyan: { id: 'doodle.color.cmyk_cyan', defaultMessage: 'CMYK Cyan' },
  color_cmyk_magenta: { id: 'doodle.color.cmyk_magenta', defaultMessage: 'CMYK Magenta' },
  color_cmyk_yellow: { id: 'doodle.color.cmyk_yellow', defaultMessage: 'CMYK Yellow' },
});

// palette nicked from MyPaint, CC0
const palette = [
  ['rgb(  0,    0,    0)', messages.color_black],
  ['rgb( 38,   38,   38)', messages.color_grey_15],
  ['rgb( 77,   77,   77)', messages.color_grey_30],
  ['rgb(128,  128,  128)', messages.color_grey_50],
  ['rgb(171,  171,  171)', messages.color_grey_67],
  ['rgb(217,  217,  217)', messages.color_grey_85],
  ['rgb(255,  255,  255)', messages.color_white],
  ['rgb(128,    0,    0)', messages.color_maroon],
  ['rgb(209,    0,    0)', messages.color_english_red],
  ['rgb(255,   54,   34)', messages.color_tomato],
  ['rgb(252,   60,    3)', messages.color_orange_red],
  ['rgb(255,  140,  105)', messages.color_salmon],
  ['rgb(252,  232,   32)', messages.color_cadium],
  ['rgb(243,  253,   37)', messages.color_lemon_yellow],
  ['rgb(121,    5,   35)', messages.color_dark_crimson],
  ['rgb(169,   32,   62)', messages.color_deep_carmine],
  ['rgb(255,  140,    0)', messages.color_orange],
  ['rgb(255,  168,   18)', messages.color_dark_tangerine],
  ['rgb(217,  144,   88)', messages.color_persian_orange],
  ['rgb(194,  178,  128)', messages.color_sand],
  ['rgb(255,  229,  180)', messages.color_peach],
  ['rgb(100,   54,   46)', messages.color_bole],
  ['rgb(108,   41,   52)', messages.color_dark_cordovan],
  ['rgb(163,   65,   44)', messages.color_chestnut],
  ['rgb(228,  136,  100)', messages.color_dark_salmon],
  ['rgb(255,  195,  143)', messages.color_apricot],
  ['rgb(255,  219,  188)', messages.color_unbleached_silk],
  ['rgb(242,  227,  198)', messages.color_straw],
  ['rgb( 53,   19,   13)', messages.color_bistre],
  ['rgb( 84,   42,   14)', messages.color_dark_chocolate],
  ['rgb(102,   51,   43)', messages.color_burnt_sienna],
  ['rgb(184,   66,    0)', messages.color_sienna],
  ['rgb(216,  153,   12)', messages.color_yellow_ochre],
  ['rgb(210,  180,  140)', messages.color_tan],
  ['rgb(232,  204,  144)', messages.color_dark_wheat],
  ['rgb(  0,   49,   83)', messages.color_prussian_blue],
  ['rgb( 48,   69,  119)', messages.color_dark_grey_blue],
  ['rgb(  0,   71,  171)', messages.color_cobalt_blue],
  ['rgb( 31,  117,  254)', messages.color_blue],
  ['rgb(120,  180,  255)', messages.color_bright_french_blue],
  ['rgb(171,  200,  255)', messages.color_bright_steel_blue],
  ['rgb(208,  231,  255)', messages.color_ice_blue],
  ['rgb( 30,   51,   58)', messages.color_medium_jungle_green],
  ['rgb( 47,   79,   79)', messages.color_dark_slate_grey],
  ['rgb( 74,  104,   93)', messages.color_dark_grullo_green],
  ['rgb(  0,  128,  128)', messages.color_teal],
  ['rgb( 67,  170,  176)', messages.color_turquoise],
  ['rgb(109,  174,  199)', messages.color_cerulean_frost],
  ['rgb(173,  217,  186)', messages.color_tiffany_green],
  ['rgb( 22,   34,   29)', messages.color_gray_asparagus],
  ['rgb( 36,   48,   45)', messages.color_medium_dark_teal],
  ['rgb( 74,  104,   93)', messages.color_xanadu],
  ['rgb(119,  198,  121)', messages.color_mint],
  ['rgb(175,  205,  182)', messages.color_timberwolf],
  ['rgb(185,  245,  246)', messages.color_celeste],
  ['rgb(193,  255,  234)', messages.color_aquamarine],
  ['rgb( 29,   52,   35)', messages.color_cal_poly_pomona],
  ['rgb(  1,   68,   33)', messages.color_forest_green],
  ['rgb( 42,  128,    0)', messages.color_napier_green],
  ['rgb(128,  128,    0)', messages.color_olive],
  ['rgb( 65,  156,  105)', messages.color_sea_green],
  ['rgb(189,  246,   29)', messages.color_green_yellow],
  ['rgb(231,  244,  134)', messages.color_bright_chartreuse],
  ['rgb(138,   23,  137)', messages.color_purple],
  ['rgb( 78,   39,  138)', messages.color_violet],
  ['rgb(193,   75,  110)', messages.color_dark_thulian_pink],
  ['rgb(222,   49,   99)', messages.color_cerise],
  ['rgb(255,   20,  147)', messages.color_deep_pink],
  ['rgb(255,  102,  204)', messages.color_rose_pink],
  ['rgb(255,  203,  219)', messages.color_pink],
  ['rgb(255,  255,  255)', messages.color_white],
  ['rgb(229,   17,    1)', messages.color_rgb_red],
  ['rgb(  0,  255,    0)', messages.color_rgb_green],
  ['rgb(  0,    0,  255)', messages.color_rgb_blue],
  ['rgb(  0,  255,  255)', messages.color_cmyk_cyan],
  ['rgb(255,    0,  255)', messages.color_cmyk_magenta],
  ['rgb(255,  255,    0)', messages.color_cmyk_yellow],
];

// re-arrange to the right order for display
let palReordered = [];
for (let row = 0; row < 7; row++) {
  for (let col = 0; col < 11; col++) {
    palReordered.push(palette[col * 7 + row]);
  }
  palReordered.push(null); // null indicates a <br />
}

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
/** Doodle canvas size options */
const DOODLE_SIZES = {
  normal: [500, 500, 'Square 500'],
  tootbanner: [702, 330, 'Tootbanner'],
  s640x480: [640, 480, '640×480 - 480p'],
  s800x600: [800, 600, '800×600 - SVGA'],
  s720x480: [720, 405, '720x405 - 16:9'],
};


const mapStateToProps = state => ({
  options: state.getIn(['compose', 'doodle']),
});

const mapDispatchToProps = dispatch => ({
  /** Set options in the redux store */
  setOpt: (opts) => dispatch(doodleSet(opts)),
  /** Submit doodle for upload */
  submit: (file) => dispatch(uploadCompose([file])),
});

/**
 * Doodling dialog with drawing canvas
 *
 * Keyboard shortcuts:
 * - Delete: Clear screen, fill with background color
 * - Backspace, Ctrl+Z: Undo one step
 * - Ctrl held while drawing: Use background color
 * - Shift held while clicking screen: Use fill tool
 *
 * Palette:
 * - Left mouse button: pick foreground
 * - Ctrl + left mouse button: pick background
 * - Right mouse button: pick background
 */
class DoodleModal extends ImmutablePureComponent {

  static propTypes = {
    options: ImmutablePropTypes.map,
    onClose: PropTypes.func.isRequired,
    setOpt: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
  };

  //region Option getters/setters

  /** Foreground color */
  get fg () {
    return this.props.options.get('fg');
  }
  set fg (value) {
    this.props.setOpt({ fg: value });
  }

  /** Background color */
  get bg () {
    return this.props.options.get('bg');
  }
  set bg (value) {
    this.props.setOpt({ bg: value });
  }

  /** Swap Fg and Bg for drawing */
  get swapped () {
    return this.props.options.get('swapped');
  }
  set swapped (value) {
    this.props.setOpt({ swapped: value });
  }

  /** Mode - 'draw' or 'fill' */
  get mode () {
    return this.props.options.get('mode');
  }
  set mode (value) {
    this.props.setOpt({ mode: value });
  }

  /** Base line weight */
  get weight () {
    return this.props.options.get('weight');
  }
  set weight (value) {
    this.props.setOpt({ weight: value });
  }

  /** Drawing opacity */
  get opacity () {
    return this.props.options.get('opacity');
  }
  set opacity (value) {
    this.props.setOpt({ opacity: value });
  }

  /** Adaptive stroke - change width with speed */
  get adaptiveStroke () {
    return this.props.options.get('adaptiveStroke');
  }
  set adaptiveStroke (value) {
    this.props.setOpt({ adaptiveStroke: value });
  }

  /** Smoothing (for mouse drawing) */
  get smoothing () {
    return this.props.options.get('smoothing');
  }
  set smoothing (value) {
    this.props.setOpt({ smoothing: value });
  }

  /** Size preset */
  get size () {
    return this.props.options.get('size');
  }
  set size (value) {
    this.props.setOpt({ size: value });
  }

  //endregion

  /** Key up handler */
  handleKeyUp = (e) => {
    if (e.target.nodeName === 'INPUT') return;

    if (e.key === 'Delete') {
      e.preventDefault();
      this.handleClearBtn();
      return;
    }

    if (e.key === 'Backspace' || (e.key === 'z' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      this.undo();
    }

    if (e.key === 'Control' || e.key === 'Meta') {
      this.controlHeld = false;
      this.swapped = false;
    }

    if (e.key === 'Shift') {
      this.shiftHeld = false;
      this.mode = 'draw';
    }
  };

  /** Key down handler */
  handleKeyDown = (e) => {
    if (e.key === 'Control' || e.key === 'Meta') {
      this.controlHeld = true;
      this.swapped = true;
    }

    if (e.key === 'Shift') {
      this.shiftHeld = true;
      this.mode = 'fill';
    }
  };

  /**
   * Component installed in the DOM, do some initial set-up
   */
  componentDidMount () {
    this.controlHeld = false;
    this.shiftHeld = false;
    this.swapped = false;
    window.addEventListener('keyup', this.handleKeyUp, false);
    window.addEventListener('keydown', this.handleKeyDown, false);
  }

  /**
   * Tear component down
   */
  componentWillUnmount () {
    window.removeEventListener('keyup', this.handleKeyUp, false);
    window.removeEventListener('keydown', this.handleKeyDown, false);
    if (this.sketcher) this.sketcher.destroy();
  }

  /**
   * Set reference to the canvas element.
   * This is called during component init
   *
   * @param elem - canvas element
   */
  setCanvasRef = (elem) => {
    this.canvas = elem;
    if (elem) {
      elem.addEventListener('dirty', () => {
        this.saveUndo();
        this.sketcher._dirty = false;
      });

      elem.addEventListener('click', () => {
        // sketcher bug - does not fire dirty on fill
        if (this.mode === 'fill') {
          this.saveUndo();
        }
      });

      // prevent context menu
      elem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      elem.addEventListener('mousedown', (e) => {
        if (e.button === 2) {
          this.swapped = true;
        }
      });

      elem.addEventListener('mouseup', (e) => {
        if (e.button === 2) {
          this.swapped = this.controlHeld;
        }
      });

      this.initSketcher(elem);
      this.mode = 'draw'; // Reset mode - it's confusing if left at 'fill'
    }
  };

  /**
   * Set up the sketcher instance
   *
   * @param canvas - canvas element. Null if we're just resizing
   */
  initSketcher (canvas = null) {
    const sizepreset = DOODLE_SIZES[this.size];

    if (this.sketcher) this.sketcher.destroy();
    this.sketcher = new Atrament(canvas || this.canvas, sizepreset[0], sizepreset[1]);

    if (canvas) {
      this.ctx = this.sketcher.context;
      this.updateSketcherSettings();
    }

    this.clearScreen();
  }

  /**
   * Done button handler
   */
  onDoneButton = () => {
    const dataUrl = this.sketcher.toImage();
    const file = dataURLtoFile(dataUrl, 'doodle.png');
    this.props.submit(file);
    this.props.onClose(); // close dialog
  };

  /**
   * Cancel button handler
   */
  onCancelButton = () => {
    const { intl } = this.props;

    if (this.undos.length > 1 && !confirm(intl.formatMessage(messages.discard))) {
      return;
    }

    this.props.onClose(); // close dialog
  };

  /**
   * Update sketcher options based on state
   */
  updateSketcherSettings () {
    if (!this.sketcher) return;

    if (this.oldSize !== this.size) this.initSketcher();

    this.sketcher.color = (this.swapped ? this.bg : this.fg);
    this.sketcher.opacity = this.opacity;
    this.sketcher.weight = this.weight;
    this.sketcher.mode = this.mode;
    this.sketcher.smoothing = this.smoothing;
    this.sketcher.adaptiveStroke = this.adaptiveStroke;

    this.oldSize = this.size;
  }

  /**
   * Fill screen with background color
   */
  clearScreen = () => {
    this.ctx.fillStyle = this.bg;
    this.ctx.fillRect(-1, -1, this.canvas.width+2, this.canvas.height+2);
    this.undos = [];

    this.doSaveUndo();
  };

  /**
   * Undo one step
   */
  undo = () => {
    if (this.undos.length > 1) {
      this.undos.pop();
      const buf = this.undos.pop();

      this.sketcher.clear();
      this.ctx.putImageData(buf, 0, 0);
      this.doSaveUndo();
    }
  };

  /**
   * Save canvas content into the undo buffer immediately
   */
  doSaveUndo = () => {
    this.undos.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
  };

  /**
   * Called on each canvas change.
   * Saves canvas content to the undo buffer after some period of inactivity.
   */
  saveUndo = debounce(() => {
    this.doSaveUndo();
  }, 100);

  /**
   * Palette left click.
   * Selects Fg color (or Bg, if Control/Meta is held)
   *
   * @param e - event
   */
  onPaletteClick = (e) => {
    const c = e.target.dataset.color;

    if (this.controlHeld) {
      this.bg = c;
    } else {
      this.fg = c;
    }

    e.target.blur();
    e.preventDefault();
  };

  /**
   * Palette right click.
   * Selects Bg color
   *
   * @param e - event
   */
  onPaletteRClick = (e) => {
    this.bg = e.target.dataset.color;
    e.target.blur();
    e.preventDefault();
  };

  /**
   * Handle click on the Draw mode button
   *
   * @param e - event
   */
  setModeDraw = (e) => {
    this.mode = 'draw';
    e.target.blur();
  };

  /**
   * Handle click on the Fill mode button
   *
   * @param e - event
   */
  setModeFill = (e) => {
    this.mode = 'fill';
    e.target.blur();
  };

  /**
   * Handle click on Smooth checkbox
   *
   * @param e - event
   */
  tglSmooth = (e) => {
    this.smoothing = !this.smoothing;
    e.target.blur();
  };

  /**
   * Handle click on Adaptive checkbox
   *
   * @param e - event
   */
  tglAdaptive = (e) => {
    this.adaptiveStroke = !this.adaptiveStroke;
    e.target.blur();
  };

  /**
   * Handle change of the Weight input field
   *
   * @param e - event
   */
  setWeight = (e) => {
    this.weight = +e.target.value || 1;
  };

  /**
   * Set size - clalback from the select box
   *
   * @param e - event
   */
  changeSize = (e) => {
    const { intl } = this.props;

    let newSize = e.target.value;
    if (newSize === this.oldSize) return;

    if (this.undos.length > 1 && !confirm(intl.formatMessage(messages.change_size))) {
      return;
    }

    this.size = newSize;
  };

  handleClearBtn = () => {
    const { intl } = this.props;

    if (this.undos.length > 1 && !confirm(intl.formatMessage(messages.canvas_clear))) {
      return;
    }

    this.clearScreen();
  };

  /**
   * Render the component
   */
  render () {
    const { intl } = this.props;
    this.updateSketcherSettings();

    return (
      <div className='modal-root__modal doodle-modal'>
        <div className='doodle-modal__container'>
          <canvas ref={this.setCanvasRef} />
        </div>

        <div className='doodle-modal__action-bar'>
          <div className='doodle-toolbar'>
            <Button text={intl.formatMessage(messages.done)} onClick={this.onDoneButton} />
            <Button text={intl.formatMessage(messages.cancel)} onClick={this.onCancelButton} />
          </div>
          <div className='filler' />
          <div className='doodle-toolbar with-inputs'>
            <div>
              <label htmlFor='dd_smoothing'>{intl.formatMessage(messages.smoothing)}</label>
              <span className='val'>
                <input type='checkbox' id='dd_smoothing' onChange={this.tglSmooth} checked={this.smoothing} />
              </span>
            </div>
            <div>
              <label htmlFor='dd_adaptive'>{intl.formatMessage(messages.adaptive)}</label>
              <span className='val'>
                <input type='checkbox' id='dd_adaptive' onChange={this.tglAdaptive} checked={this.adaptiveStroke} />
              </span>
            </div>
            <div>
              <label htmlFor='dd_weight'>{intl.formatMessage(messages.weight)}</label>
              <span className='val'>
                <input type='number' min={1} id='dd_weight' value={this.weight} onChange={this.setWeight} />
              </span>
            </div>
            <div>
              <select aria-label='Canvas size' onInput={this.changeSize} defaultValue={this.size}>
                { Object.values(mapValues(DOODLE_SIZES, (val, k) =>
                  <option key={k} value={k}>{val[2]}</option>,
                )) }
              </select>
            </div>
          </div>
          <div className='doodle-toolbar'>
            <IconButton icon='pencil' title={intl.formatMessage(messages.draw)} label={intl.formatMessage(messages.draw)} onClick={this.setModeDraw} size={18} active={this.mode === 'draw'} inverted />
            <IconButton icon='bath' title={intl.formatMessage(messages.fill)} label={intl.formatMessage(messages.fill)} onClick={this.setModeFill} size={18} active={this.mode === 'fill'} inverted />
            <IconButton icon='undo' title={intl.formatMessage(messages.undo)} label={intl.formatMessage(messages.undo)} onClick={this.undo} size={18} inverted />
            <IconButton icon='trash' title={intl.formatMessage(messages.clear)} label={intl.formatMessage(messages.clear)} onClick={this.handleClearBtn} size={18} inverted />
          </div>
          <div className='doodle-palette'>
            {
              palReordered.map((c, i) =>
                c === null ?
                  <br key={i} /> :
                  <button
                    key={i}
                    style={{ backgroundColor: c[0] }}
                    onClick={this.onPaletteClick}
                    onContextMenu={this.onPaletteRClick}
                    data-color={c[0]}
                    title={c[1]}
                    className={classNames({
                      'foreground': this.fg === c[0],
                      'background': this.bg === c[0],
                    })}
                  />,
              )
            }
          </div>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DoodleModal));
