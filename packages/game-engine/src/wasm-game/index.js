import { compose } from 'ramda';
import { getWindow } from '@kf/game-utils/es/render/global';

function _requestAnimationFrame(fn) {
  if (getWindow()) {
    requestAnimationFrame(fn);
  } else {
    fn();
  }
}

export function createArrFromBuffer(buffer) {
  const sliced = buffer.slice(1, parseInt(buffer[0], 10));
  return Array.from(sliced);
}

function createWasmInterface({ onWasmStateChange }) {
  return {
    update: args =>
      _requestAnimationFrame(() =>
        compose(onWasmStateChange, createArrFromBuffer)(args),
      ),
  };
}

function startGameLoop(fps, onTick) {
  const config = {
    running: true,
    stop: () => {
      config.running = false;
    },
  };
  let lastTime;
  const tick = curTime => {
    setTimeout(() => {
      if (!config.running) return;
      const dt = curTime - lastTime;
      onTick(dt / 1000);
      _requestAnimationFrame(tick);
      lastTime = curTime;
    }, 1000 / fps);
  };

  tick(0);
  return config;
}

/*
 * setWasmInterface - wasm_bindgen is being initiated in the window, so set
 * updatefn taht wasm needs to call in a global obj, function is initiated by passing
 * in a global override in case it is called in nodejs
 *
 * @param props
 * @returns {undefined}
 */
export function setWasmInterface(globalOverride) {
  return ({ update, ...props }) => {
    const g = globalOverride || getWindow();
    g.js_wasm_adapter = { update, ...props };
  };
}

/**
 * runOnWasmLoad
 *
 * whenever you're accessing wasm, should do a safe check f
 * or whether it exists/isLoaded, else wait for it to load
 */
export function runOnWasmLoad(cb) {
  // check for wasm_bindgen for rust or check the manually set wasmAdapter
  const _cb = () =>
    cb(getWindow(['wasm_bindgen']) || getWindow(['wasmAdapter']));
  if (getWindow(['wasmLoaded'])) {
    _cb();
  } else {
    getWindow(['addEventListener'])('wasm_load', _cb);
  }
}

/**
 * createWasmGame - only should be direclty called in node,
 * in the actual client app, you should use scene-manager to invoke this
 *
 * @returns GameInterface {gameLoop, wasmInterface}
 */
export default function createWasmGame({
  wasmAdapter,
  fps = 40,
  wasmConfig,
  onWasmStateChange,
  globalOverride,
  broadcastUnchanged = false,
}) {
  let config;

  const setUpEventListener = compose(
    setWasmInterface(globalOverride),
    createWasmInterface,
  );
  setUpEventListener({ onWasmStateChange });

  const wasmName = wasmConfig.name || 'GameEnvAdapter';
  console.log(wasmName);
  console.log(wasmConfig);
  const wasmGame = new wasmAdapter[wasmName](
    broadcastUnchanged,
    wasmConfig.encoderKeys,
    wasmConfig.initConfig,
  );

  const onTick = dt => wasmGame.tick(dt);

  return {
    gameLoop: {
      start: () => {
        config = startGameLoop(fps, onTick);
      },
      stop: () => config && config.stop(),
    },
    wasmInterface: {
      toWasm: {
        onTick,
        reset: state => {
          wasmGame.reset(state);
        },
        onEvent: a => wasmGame.on_event(a),
      },
    },
  };
}
