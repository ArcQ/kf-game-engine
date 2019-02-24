import { getImgSrc } from './img';
import request from './request';
import { MemoryFactory, runOnWasmLoad } from 'utils/wasm.utils';
import { constants } from 'utils/store/ducks';

export default (engine) => ({
  storeConstants: constants,
  request,
  getImgSrc: getImgSrc(engine),
  MemoryFactory,
  runOnWasmLoad,
  mapDOMPosToStage(pos) {
    return pos.map((v, idx) =>  v / 2 );
  },
});
