import * as PIXI from 'pixi.js';

import {
  pipe,
  values,
  map,
  curry,
} from 'ramda';
import {
  setPos,
  ANCHOR_BM,
  getSpriteSheetFrames,
} from '@kf/game-utils/es/pixi/sprite';

function createSpriteForChar({
  spriteSheetKs,
  pos,
  anchor = ANCHOR_BM,
  size = [100, 100],
  animationSpeed = 0.3,
}) {
  const frames = getSpriteSheetFrames(...spriteSheetKs);
  const anim = new PIXI.extras.AnimatedSprite(frames);
  [anim.width, anim.height] = size;
  setPos({ sprite: anim, pos, anchor });
  anim.anchor.set(0.5);
  anim.animationSpeed = animationSpeed;
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
 * createCharFactory - (depruecated) returns function that creates a character type object
 * that has initial state and sprite
 *
 * @param {spriteSheetKs}
 * @returns {function} returns a functions that takes instance arguments as an object
 */
function createCharFactory(initialState, charArgs) {
  const sprite = createSpriteForChar({ ...charArgs, ...initialState });
  const anims = (charArgs.anims) && createAnims(charArgs.anims);
  const { charK, ...state } = initialState;
  return {
    state,
    sprite,
    anims,
    charArgs,
    charK,
  };
}

/**
 * createChar
 *
 * @param config {Object} object with character keys and position as and attribute
 * @returns {Object} character object
 */
export function createChars(charConfig, charTypesDict) {
  const getCharK = v => v.charK;
  return Object.entries(charConfig).reduce((acc, [k, initialStateObj]) =>
    ({
      ...acc,
      [k]: pipe(
        getCharK,
        charK => charTypesDict[charK],
        curry(createCharFactory)(initialStateObj),
      )(initialStateObj),
    }), {});
}


/**
 * getSpritesFromChars
 * @param charEntities {Array[char]} an array of entity objects {}
 *
 * @returns {undefined}
 */
export const getSpritesFromChars = pipe(
  values,
  map(v => v.sprite),
);
