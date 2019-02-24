import { getIn } from 'utils/cljs.utils';
/**
 * setPos - set position of sprite (mutates original sprite)
 *
 * @param sprite
 * @param pos - pos is always an immutablearray
 * @returns {undefined}
 */
export function setPos(sprite, pos) {
  sprite.position.x = getIn(pos, [0]); //eslint-disable-line
  sprite.position.y = getIn(pos, [1]); //eslint-disable-line
}
