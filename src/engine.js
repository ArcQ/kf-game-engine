import * as _PIXI from 'pixi.js';
import { actions as gameEngineActions } from 'utils/store/ducks';
import _encoder from 'utils/encoder';
import scaleToWindowPixi from 'scale-to-window-pixi';
import { getWindow, getDocument, devicePixelRatio } from 'utils/global';
import _assetManager from './asset-manager';
import _sceneManager from './scene-manager';
import utils from './utils';


function getDimensions(aspectRatio, _getWindow) {
  const wWidth = _getWindow().screen.width;
  const wHeight = _getWindow().screen.height;

  const isLimitWidth = ((aspectRatio * wWidth) / wHeight) < 0;
  return (isLimitWidth)
    ? {
      x: wWidth,
      y: wWidth * aspectRatio,
    }
    : {
      x: wHeight / aspectRatio,
      y: wHeight,
    };
}

function resizeContainers(app, mainGameViewRef, engine) {
  const scale = scaleToWindowPixi(
    {
      containerSel: '.app',
    },
    getWindow,
    getDocument,
    '#333',
  )(app.renderer.view);
  engine.scale = scale;
  engine.web.screen.bounds = [
    getDocument().querySelector('.app').clientWidth,
    getDocument().querySelector('.app').clientHeight,
  ];
  engine.web.screen.offset = [
    getDocument().querySelector('.app').offsetLeft,
    getDocument().querySelector('.app').offsetTop,
  ];
}

const engine = {
  app: null,
  ticker: null,
  stopTicker: () => {},
  assetUrl: '',
  assetDicts: null,
  web: {
    screen: {
      bounds: null,
      offset: null,
    },
  },
  scale: null,
  ui: {
    dispatch() {},
    select() {},
  },

  /**
   * starts the scene manager with a default scene as specified in the config
   *
   * @function
   * @param {GameConfig} gameConfig - Game config, requires assetUrl as param
   * @param {GameConfig} mainGameViewRef - the dom element (div) to use for your canvas
   * @param {GameConfig} storeFn - store functions (like redux) { dispatchFn, selectFn }
   * @returns {undefined}
   *
   */
  start(gameConfig, mainGameViewRef, storeFn, assetDicts) {
    engine.assetUrl = 'https://s3.ca-central-1.amazonaws.com/dev-assets-1/';
    engine.ui = { ...engine.ui, ...storeFn };

    const options = { antialias: false, transparent: true, resolution: devicePixelRatio };
    const initialDimensions = getDimensions(
      gameConfig.aspectRatio.y / gameConfig.aspectRatio.x,
      getWindow,
    );
    const app = new _PIXI.Application(initialDimensions.x, initialDimensions.y, options);
    // scaling
    app.renderer.autoResize = true;
    mainGameViewRef.appendChild(app.view);
    resizeContainers(app, mainGameViewRef, engine);
    if (!gameConfig.disableResponsive) {
      getWindow().onresize = () => {
        resizeContainers(app, mainGameViewRef, engine);
      };
    }
    engine.app = app;
    engine.ticker = new _PIXI.ticker.Ticker();
    engine.ticker.start();
    // engine.ticker.stop();
    // engine.ticker.autoStart = true;
    engine.ui.dispatch(gameEngineActions.pushLocation({ path: '/' }));
    engine.assetDicts = assetDicts;
    return engine.app;
  },
  assetManager: _assetManager,
  encoder: _encoder,
  sceneManager: _sceneManager,
  PIXI: _PIXI,
};

engine.utils = utils(engine);

export const assetManager = _assetManager;
export const sceneManager = _sceneManager;
export const PIXI = _PIXI;
export const encoder = _encoder;

export default engine;
