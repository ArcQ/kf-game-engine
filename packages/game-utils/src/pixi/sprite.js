import * as PIXI from 'pixi.js';
import {
  pipe,
  map,
  flatten,
} from 'ramda';

export const ANCHOR_MID = 'm';
export const ANCHOR_TR = 'tm';
export const ANCHOR_BM = 'bm';

const BUFFER = 2;

const handleAnchor = {
  [ANCHOR_MID]: pos => pos,
  [ANCHOR_TR]: (sprite, pos) => [
    pos.x + sprite.width,
    pos.y + sprite.height,
  ],
  [ANCHOR_BM]: (sprite, pos) => [
    pos[0],
    pos[1] + BUFFER - (sprite.height / 2),
  ],
};

/**
 * getSprite from cached assets
 *
 * @param {string} dictName - the string key referencing the json dict as defined in assets/index.js
 * @param {string} key - the key defined in the json dict
 * @returns {PIXI.sprite}
 */
export function getSprite(dictName, key) {
  return new PIXI.Sprite(
    PIXI.loader.resources[`${dictName}_${key}`].texture,
  );
}

export function getSpriteSheetFrames(dictName, k, animK) {
  return PIXI.loader.resources[`${dictName}_${k}`].spritesheet.animations[animK];
}

/**
 * setPos - set position of sprite (mutates original sprite)
 *
 * @param sprite
 * @param pos - pos is always an immutablearray
 * @param anchor {string} - ANCHOR_MID is middle, ANCHOR_TR is top right
 * , ANCHOR_BM is bottom middle, default is middle
 * @returns {undefined}
 */
export function setPos({ sprite, pos, anchor }) {
  const handler = handleAnchor[anchor];
  const spritePos = handler ? handler(sprite, pos) : pos;
  sprite.position.x = spritePos[0]; //eslint-disable-line
  sprite.position.y = spritePos[1]; //eslint-disable-line
}

/**
 *  addAllToStage - curied function (engine) => (sprites)
 *  @param sprites {Array[Sprite]} add an array of sprite to stage
 * @returns {undefined}
 */
export function addAllToStage(engine, args) {
  return pipe(
    flatten,
    map(s => engine.app.stage.addChild(s)),
  )(args);
}

export default {};
