import { constants } from 'store/ducks';
import { getImgSrc } from './img';

export default engine => ({
  storeConstants: constants,
  getImgSrc: getImgSrc(engine),
  mapDOMPosToStage(pos) {
    return pos.map(v => v / 2);
  },
});
