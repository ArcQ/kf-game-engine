// @flow weak
//
import type { engine } from 'types';
import * as PIXI from 'pixi.js';
import {
  pipe,
  map,
  curry,
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

function createSpriteForChar({
  spriteSheetArgs,
  pos,
  anchor,
  size: [height = 100, width = 100],
  animationSpeed = 0.3,
}) {
  const frames = getSpriteSheetFrames(...spriteSheetArgs);
  const anim = new PIXI.extras.AnimatedSprite(frames);
  anim.height = height;
  anim.width = width;
  setPos({ sprite: anim, pos, anchor: anchor || ANCHOR_BM });
  anim.anchor.set(0.5);
  anim.animationSpeed = 0.3;
  anim.play();
  return anim;
}

/**
 * createAnims note should document defaults
 *
 * @param anims
 * @returns {undefined}
 */
function createAnims(anims) {
  const defaultAnims = {
    spriteHandler: (sprite) => {
      sprite.loop = true;
    },
  };
  return map(
    v => (Array.isArray(v)
      ? { ...defaultAnims, frames: () => getSpriteSheetFrames(...v) }
      : { ...defaultAnims, ...v }),
    anims,
  );
}

/**
 * charFactory - returns function that creates a character type object
 * that has initial state and sprite
 *
 * @param {spriteSheetArgs}
 * @returns {function} returns a functions that takes instance arguments as an object
 */
export function createCharFactory(charTypeDicts, initialStateObj) {
  const getCharK = v => v.charK;
  return Object.entries(initialStateObj).reduce((acc, [k, charConfig]) =>
    ({
      ...acc,
      [k]: pipe(
        getCharK,
        charK => charTypeDicts[charK],
        curry(createCharFactory)(charConfig),
      )(charConfig),
    }), {});
}
