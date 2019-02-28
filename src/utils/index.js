import { constants } from 'utils/store/ducks';
import { getImgSrc } from './img';
import request from './request';

export default engine => ({
  storeConstants: constants,
  request,
  getImgSrc: getImgSrc(engine),
  mapDOMPosToStage(pos) {
    return pos.map((v, idx) => v / 2);
  },
});
