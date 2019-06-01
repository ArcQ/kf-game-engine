import * as PIXI from 'pixi.js';
import { getSpriteSheetFrames } from 'asset-manager';

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

function createSpriteForChar(spriteSheetArgs, pos) {
  const frames = getSpriteSheetFrames(...spriteSheetArgs);
  const anim = new PIXI.extras.AnimatedSprite(frames);
  setPos({ sprite: anim, pos });
  anim.height = 100;
  anim.width = 100;
  anim.anchor.set(0.5);
  anim.animationSpeed = 0.3;
  anim.play();
  return anim;
}

/**
 * charFactory - returns function that creates a character type object
 * that has initial state and sprite
 *
 * @param {spriteSheetArgs}
 * @returns {function} returns a functions that takes instance arguments as an object
 */
export function createCharFactory({ spriteSheetArgs }) {
  return ({ pos }) => {
    const sprite = createSpriteForChar(spriteSheetArgs, pos);
    return {
      initialState: { sprite: '', pos },
      sprite,
      spriteK: [spriteSheetArgs[2]],
    };
  };
}
