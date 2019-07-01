import * as PIXI from 'pixi.js';
import {
  pipe,
  values,
  map,
  flatten,
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

function createSpriteForChar({ spriteSheetArgs, pos, anchor }) {
  const frames = getSpriteSheetFrames(...spriteSheetArgs);
  const anim = new PIXI.extras.AnimatedSprite(frames);
  anim.height = 100;
  anim.width = 100;
  setPos({ sprite: anim, pos, anchor: anchor || ANCHOR_BM });
  anim.anchor.set(0.5);
  anim.animationSpeed = 0.3;
  anim.play();
  return anim;
}

/**
 * createAnimsForChar note should document defaults
 *
 * @param anims
 * @returns {undefined}
 */
function createAnimsForChar(anims) {
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
function createCharFactory(initialState, charArgs) {
  const sprite = createSpriteForChar({ ...charArgs, ...initialState });
  const anims = (charArgs.anims) && createAnimsForChar(charArgs.anims);
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
 * createCharEntities
 *
 * @param config {Object} object with character keys and position as and attribute
 * @returns {Object} character object
 */
export function createCharEntities(charConfig, charTypesDict) {
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
 * getSpritesFromCharEntities
 * @param charEntities {Array[charEntity]} an array of entity objects {}
 *
 * @returns {undefined}
 */
export const getSpritesFromCharEntities = pipe(
  values,
  map(v => v.sprite),
);

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
