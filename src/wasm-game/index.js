import { compose } from 'ramda';
import { getWindow } from 'utils/global';

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
};

function createWasmInterface({ wasm, wasmBindgen, onWasmStateChange }) {
  return {
    update: (args) => {
      const buffer = getWindow()
        ? new Float32Array(wasmBindgen.wasm.memory.buffer, args)
        : new Float32Array(wasm.memory.buffer, args);
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
  }

  tick(0);
  return config;
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
      fromWasm: createWasmInterface({ wasmBindgen, onWasmStateChange, wasm }),
      toWasm: {
        onTick: dt => wasmGame.get_update(dt),
        reset: wasmGame.reset,
        onEvent: a => wasmGame.on_event(a),
      },
    },
  };
}
