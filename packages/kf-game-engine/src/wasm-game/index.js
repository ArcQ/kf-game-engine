import { compose } from 'ramda';
import { getWindow } from 'kf-utils/dist/render/global';

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

function createWasmInterface({ wasm, onWasmStateChange }) {
  return {
    update: (args) => {
      const buffer = new Float32Array(wasm.memory.buffer, args);
      _requestAnimationFrame(() =>
        compose(
          onWasmStateChange,
          createArrFromBuffer,
        )(buffer));
    },
  };
}

function startGameLoop(fps, onTick) {
  const config = {
    running: true,
    stop: () => { config.running = false; },
  };
  let lastTime;
  const tick = (curTime) => {
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
 * updatefn taht wasm needs to call in a global obj
 *
 * @param props
 * @returns {undefined}
 */
export function setWasmInterface(props) {
  if (!(getWindow().game_config)) {
    getWindow().game_config = {};
  }
  getWindow().game_config = { ...getWindow().game_config, ...props };
}

/**
 * runOnWasmLoad
 *
 * whenever you're accessing wasm, should do a safe check f
 * or whether it exists/isLoaded, else wait for it to load
 */
export function runOnWasmLoad(cb) {
  const _cb = () => cb(getWindow(['wasm']), getWindow(['wasm_bindgen']));
  if (getWindow(['wasmLoaded'])) {
    _cb();
  } else {
    getWindow(['addEventListener'])('wasm_load', _cb);
  }
}


export default function createWasmGame({
  wasmBindgen,
  fps = 40,
  wasmConfig,
  wasm,
  onWasmStateChange,
}) {
  let config;
  const wasmGame = new wasmBindgen[wasmConfig.name](wasmConfig.encoderKeys, wasmConfig.initConfig);
  const onTick = dt => wasmGame.get_update(dt);

  return {
    gameLoop: {
      start: () => {
        config = startGameLoop(fps, onTick);
      },
      stop: () => config && config.stop(),
    },
    wasmInterface: {
      fromWasm: compose(
        setWasmInterface,
        createWasmInterface,
      )({ onWasmStateChange, wasm }),
      toWasm: {
        onTick: dt => wasmGame.get_update(dt),
        reset: wasmGame.reset,
        onEvent: a => wasmGame.on_event(a),
      },
    },
  };
}
