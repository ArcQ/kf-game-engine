import { getWindow } from './global';

/**
 * MemoryFactor
 *
 * dictionary of functions that create a wasm memory object based on the type of argument passed in
 */
export const MemoryFactory = {
  inputDef: (inputDef) => {
    return [1, 100, 200, 200, 200]
  },
};

/**
 * runOnWasmLoad
 *
 * whenever you're accessing wasm, should do a safe check for whether it exists/isLoaded, else wait for it to load
 */
export function runOnWasmLoad(cb) {
  const _cb = () => cb(getWindow(['wasm_bindgen']));
  if (getWindow(['wasmLoaded'])) {
    _cb();
  } else {
    getWindow(['addEventListener'])('wasm_load', _cb)
  }
};
