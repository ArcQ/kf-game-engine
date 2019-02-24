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
              // cbWrapper expects a function that returns and array of u32 that we will pass to rust through on_update
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
 * @property {string[]} assets - assets dictionary to use to match keys inside of assets/index.js
 * @property {function=} onFinishLoad - to be fired when scene is ready
 * @property {function=} update - game rendering cycle to be fired every fps
 * @property {function=} [load$] - to be called in parallel with loading scene assets
 * @property {function=} [willLoad] - to be called right before load assets
 */

import { Observable, forkJoin, of } from 'rxjs';
import { mapDOMPosToStage } from 'game/engine/game-loop/render.utils';
import { concat, map, tap, catchError } from 'rxjs/operators';
import { compose, curry } from 'ramda';

import { load } from 'game/engine/asset-manager';
import { actions as gameEngineActions } from 'utils/store/ducks';
import engine from 'game/engine';
import { getWindow } from 'utils/global';

import { ticker, createGameLoop } from '../game-loop';
import { runOnWasmLoad } from 'utils/wasm.utils';

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
function _createLoadObs(wrappedScene) {
  const loadingSceneObj = wrappedScene.loading();
  const loadFromAssetUrl = curry(load)(sceneManager.assetUrl);
  const loadLoadingAssets$ = loadFromAssetUrl(loadingSceneObj);
  const loadSceneAssets$ = loadFromAssetUrl(wrappedScene);
  const sceneCustomLoad$ = wrappedScene.load$ || of(false);

  // const rObj = {
  //   pathname: loadingSceneObj.uiRoute,
  //   state: { loadingScene: true },
  // };
  const launchLoadingScene$ = tap(null, null, () =>
    engine.ui.dispatch(gameEngineActions.pushLocation({ path: loadingSceneObj.uiRoute }))
  );

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
 * @param sceneObj
 * @param wrappedScene
 * @returns {undefined}
 */
function _loadScene(wrappedScene) {
  const loadScene$ = _createLoadObs(wrappedScene);
  const  obs$ = (wrappedScene.willLoad)
    ? forkJoin(wrappedScene.willLoad(), loadScene$) : loadScene$;

  obs$.subscribe(
    ([initConfig]) => { //eslint-disable-line
      engine.ui.dispatch(gameEngineActions.pushLocation({ path: wrappedScene.uiRoute }));
      wrappedScene.onFinishLoad(initConfig);
    },
  );
}

let _cancelPrevGameLoopObs;
const _cancelPrevGameLoop$ = new Observable((obs) => {
  _cancelPrevGameLoopObs = obs;
});

function setCljsWasmAdapter(props) {
  if (!(getWindow().game_config)) {
    getWindow().game_config = {};
  }
  getWindow().game_config = {
    ...getWindow().game_config, ...props };
}

/**
 * _wrapInSceneHelpers - wraps a scene with the helper methods so it connects with _loadScene
 *
 * @param sceneObj
 * @returns {SceneDef}
 */
function _wrapInSceneHelpers(sceneObj) {
  const wrappedScene = Object.assign({}, sceneObj, {
    start() {
      // emit event ot cancel previous game loop
      if (_cancelPrevGameLoopObs) _cancelPrevGameLoopObs.next();
      _loadScene(wrappedScene);
    },
    /**
     * onFinishLoad - launches scene def methods and should also launch ui
     * @param sceneCustomRes - response form custom load$ observable supplied in scene def
     * @returns {undefined}
     */
    onFinishLoad(initConfig) {
      const initialState = (sceneObj.onFinishLoad)
        ? sceneObj.onFinishLoad(engine.app.stage)
        : {};

      runOnWasmLoad((wasmBindgen) => {
        if (sceneObj.update) {

          const createArrFromBuffer = (buffer) => {
            const sliced = buffer.slice(0, parseInt(buffer[0]));
            return Array.from(sliced);
          }

          setCljsWasmAdapter({
            updateFn: (args) => {
              const buffer = new Float32Array(wasmBindgen.wasm.memory.buffer, args);
              compose(
                sceneObj.update,
                createArrFromBuffer,
              )(buffer);
            },
            // encode the keys into integers to make passing to rust more efficient
            mapEventsKeyDict: (fn) => Object.keys(getWindow().game_config.eventsKeyDict).map((v, i) => fn(v, i)),
          });

          window.encoderKeys = sceneObj.encoderKeys;
          // should load earlier and be the last 10% that gets loaded
          const wasmGame = new wasmBindgen.LevelOne(sceneObj.encoderKeys, initConfig);
          const updateFn = (dt) => wasmGame.get_update(dt);
          const wasmUpdate = (a) => wasmGame.on_event(a);

          engine.wasmUpdate = wasmUpdate;
          // wait on mount of ui elements
          if (sceneObj.start) setTimeout(() => sceneObj.start(), 500);

          // engine.ticker.add(updateFn);
          let lastTime;
          const fps = 40;
          function tick(curTime) {
            setTimeout(function() {
              const dt = curTime - lastTime;
              requestAnimationFrame(tick);
              updateFn(dt / 1000);
              lastTime = curTime;
            }, 1000 / fps);
          }

          tick(0.1);

          setTimeout(() => wasmGame.reset(), 5000);

          // engine.stopTicker = () => {
          //   engine.ticker.remove(updateFn)
          //   engine.ticker.stop();
          // };
        }
      });

    },
  });
  return wrappedScene;
}

/** @namespace sceneManager * */
const sceneManager = {
  sceneDict: undefined,
  assetUrl: undefined,
  storeFn: undefined,
  /**
   * starts the scene manager with a default scene as specified in the config
   *
   * @function
   * @param {GameConfig} config - Game config, requires assetUrl as param
   * @param {GameConfig} sceneDict - a dictionary of all the different scene definitions in the game
   * @returns {undefined}
   *
   */
  start(config, sceneDict, storeFn) {
    sceneManager.assetUrl = config.assetUrl;
    sceneManager.sceneDict = sceneDict;
    sceneManager.pushScene(config.defaultScene);
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
    const sceneObj = sceneManager.sceneDict[sceneKey]();
    const scene = _wrapInSceneHelpers(sceneObj);
    scene.start(engine.app.stage);
  },
};

export default sceneManager;
