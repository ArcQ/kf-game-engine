/**
 *
 * Scene Manager that manages loading scene assets, loading screens and runs scene
 *
 * @example <caption>To Start scene manager called inside initPixi.</caption>
 * sceneManager.start(config.game, gameViewRef, store)
 *

 * @example <caption>To push scene use pushScene</caption>
 * sceneManager.pushScene("testScene")
 *
 * @example <caption>Define a scene def, making sure you define
 asset keys inside of assets index.js</caption>
 *
 * export default {
 *   name: 'level-one-scene',
 *   loading: mainLoadingScene,
 *   uiRoute: '/level-one',
 *   assets: ['levelOne', 'goblins'],
 *   eventSources: [function (cbWrapper) {
          document.getElementById('mainGameContainer').addEventListener("click", (event) =>
            cbWrapper(
              // cbWrapper expects a function that returns and array of
              // u32 that we will pass to rust through on_update
              () => mapDOMPosToStage([event.offsetX, event.offsetY]),
            ),
          )), false);
 *   }],
 *   willLoad() {
 *     request('/gamemap/generate').subscribe(
 *       (data) => data,
 *     );
 *   },
 *   onTick() {
 *     // anim.rotation += 0.01;
 *   },
 *   onFinishLoad(stage) {
 *     // create an array of textures from an image path
 *     const goblin = createGoblin();
 *     stage.addChild(goblin);
 *
 *     const tile = createTile();
 *     stage.addChild(tile);
 *   },
 * };


 * @module game/engine/scene-manager
 *
 */

/**
 * scene definition object
 * @typedef {Object} SceneDef
 * @property {string} name - name of scene
 * @property {SceneDef} loading - another scene to be used while loading assets,
 scenes will load assets while running loading scene
 * @property {Array.<string>} assets - assets dictionary to use to match keys
 * inside of assets/index.js
 * @property {function=} onFinishLoad - to be fired when scene is ready
 * @property {function=} update - game rendering cycle to be fired every fps
 * @property {function=} [load$] - to be called in parallel with loading scene assets
 * @property {function=} [willLoad] - to be called right before load assets
 */

import { forkJoin, of } from 'rxjs';
import {
  concat, map, tap, catchError,
} from 'rxjs/operators';
import { curry, mergeDeepRight } from 'ramda';
import createWasmGame, { runOnWasmLoad } from 'wasm-game';

import { actions as gameEngineActions } from 'store/ducks';
import flatten from 'flat';

/**
 * _createLoadObs - creates the observer that first loads the loading scene assets
 then runs the loading scene, then loads the actual scene assets, subscribe to this
 and then run the actual scene
 in parallell it will run load$ if specified inside of the scene definition object
 *
 * @param wrappedScene
 * @param assetUrl
 * @returns {Observable}
 */
function _createLoadObs(engine, wrappedScene, assetUrl) {
  const loadingSceneObj = wrappedScene.loading();
  const loadFromAssetUrl = curry(engine.assetManager.load)(assetUrl);
  const loadLoadingAssets$ = loadFromAssetUrl(loadingSceneObj);
  const loadSceneAssets$ = loadFromAssetUrl(wrappedScene);
  const sceneCustomLoad$ = wrappedScene.load$ || of(false);

  // const rObj = {
  //   pathname: loadingSceneObj.uiRoute,
  //   state: { loadingScene: true },
  // };
  const launchLoadingScene$ = tap(null, null, () =>
    engine.ui.dispatch(gameEngineActions.pushLocation({ path: loadingSceneObj.uiRoute })));

  const setLoadPercentage$ = map(({ percentage }) => {
    engine.ui.dispatch(
      gameEngineActions.setLoadPercentage({ percentage }),
    );
    if (wrappedScene.onLoadNext) wrappedScene.onLoadNext();
  });

  const loadAssetPipe$ = loadLoadingAssets$.pipe(
    launchLoadingScene$,
    concat(loadSceneAssets$),
    setLoadPercentage$,
  );

  return forkJoin(loadAssetPipe$, sceneCustomLoad$).pipe(
    catchError((e) => {
      console.warn(`error in loading scene ${wrappedScene.name}: ${e}`); //eslint-disable-line
      if (wrappedScene.onLoadError) wrappedScene.onLoadError(e);
    }),
  );
}

/**
 * _loadScene function called on every scene change
 * this takes the scene object and loads all assets defined inside of assets attribute
 *
 * @private
 * @param wrappedScene
 * @param assetUrl
 * @returns {undefined}
 */
function _loadScene(engine, wrappedScene, assetUrl) {
  const loadScene$ = _createLoadObs(engine, wrappedScene, assetUrl);
  const obs$ = (wrappedScene.willLoad)
    ? forkJoin(wrappedScene.willLoad(), loadScene$) : loadScene$;

  obs$.subscribe(
    ([asyncConfig]) => { //eslint-disable-line
      engine.ui.dispatch(gameEngineActions.pushLocation({ path: wrappedScene.uiRoute }));
      wrappedScene.onFinishLoad(asyncConfig);
    },
  );
}

let prevGameLoop;

/**
 * _wrapInSceneHelpers - wraps a scene with the helper methods so it connects with _loadScene
 *
 * @param sceneObj
 * @returns {SceneDef}
 */
function _wrapInSceneHelpers(engine, sceneObj, assetUrl) {
  const wrappedScene = Object.assign({}, sceneObj, {
    start() {
      if (prevGameLoop) prevGameLoop.stop();
      _loadScene(engine, wrappedScene, assetUrl);
    },
    /**
     * onFinishLoad - launches scene def methods and should also launch ui
     * @param sceneCustomRes - response form custom load$ observable supplied in scene def
     * @returns {undefined}
     */
    onFinishLoad(asyncConfig) {
      runOnWasmLoad((wasm, wasmBindgen) => {
        if (sceneObj.update) {
          window.encoderKeys = sceneObj.encoderKeys;
          // TODO should load earlier and be the last 10% that gets loaded
          const {
            gameLoop,
            wasmInterface,
          } = createWasmGame({
            wasm,
            wasmBindgen,
            fps: 40,
            wasmConfig: {
              name: 'LevelOne',
              encoderKeys: sceneObj.encoderKeys,
              initConfig: flatten(mergeDeepRight(sceneObj.initConfig, asyncConfig), { safe: true }),
            },
            onWasmStateChange: sceneObj.update,
          });

          gameLoop.start();

          engine.onEvent = wasmInterface.toWasm.onEvent;
          engine.resetWasm = wasmInterface.toWasm.reset;
          // TODO wait on mount of ui elements
          if (sceneObj.start) setTimeout(() => sceneObj.start(), 500);
          prevGameLoop = gameLoop;
        }
      });
    },
  });
  return wrappedScene;
}

/** @namespace sceneManager * */
const sceneManager = (engine) => {
  const self = {
    sceneDict: undefined,
    assetUrl: undefined,
    /**
     * starts the scene manager with a default scene as specified in the config
     *
     * @function
     * @param {GameConfig} config - Game config, requires assetUrl as param
     * @param {GameConfig} sceneDict - a dictionary of all the
     * different scene definitions in the game
     * @returns {undefined}
     *
     */
    start(config, sceneDict) {
      self.assetUrl = config.assetUrl;
      self.sceneDict = sceneDict;
      self.pushScene(config.defaultScene);
    },
    /**
     * pushes another scene
     *
     * @function
     * @param {string} sceneKey - key of the scene defined in scenes/index namespace
     * @returns {undefined}
     *
     */
    pushScene(sceneKey) {
      const sceneObj = self.sceneDict[sceneKey]();
      const scene = _wrapInSceneHelpers(engine, sceneObj, self.assetUrl);
      scene.start(engine.app.stage);
    },
  };
  return self;
};

export default sceneManager;
