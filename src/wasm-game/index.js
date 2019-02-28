import { compose } from 'ramda';
import { getWindow } from 'utils/global';

function _requestAnimationFrame(fn) {
  if (!getWindow()) {
    setTimeout(fn, 0);
  } else {
    requestAnimationFrame(fn);
  }
}

function createWasmInterface(wasmBindgen, update) {
  const createArrFromBuffer = (buffer) => {
    const sliced = buffer.slice(1, parseInt(buffer[0], 10));
    return Array.from(sliced);
  };

  return {
    updateFn: (args) => {
      const buffer = new Float32Array(wasmBindgen.wasm.memory.buffer, args);
      _requestAnimationFrame(() =>
        compose(
          update,
          createArrFromBuffer,
        )(buffer));
    },
  };
}

function startGameLoop(fps, updateFn) {
  const config = {
    running: true,
    stop: () => { config.running = false; },
  };
  let lastTime;
  const tick = (curTime) => {
    setTimeout(() => {
      if (!config.running) return;
      const dt = curTime - lastTime;
      updateFn(dt / 1000);
      _requestAnimationFrame(tick);
      lastTime = curTime;
    }, 1000 / fps);
  };

  tick(0);
  return config;
}

export default function createWasmGame({
  wasmBindgen,
  fps = 40,
  wasmConfig,
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
      fromWasm: createWasmInterface(wasmBindgen, onWasmStateChange),
      toWasm: {
        reset: wasmGame.reset,
        update: a => wasmGame.on_event(a),
      },
    },
  };
}
