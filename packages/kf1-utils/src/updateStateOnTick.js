import { pipe, pathOr } from 'ramda';

function getRunHandler(encoder) {
  return (stateUpdateHandler, byteData, cb) => {
    const handler = pathOr(null, [encoder.decode(byteData[0])], stateUpdateHandler);
    if (typeof handler === 'function') cb(handler);
  };
}

function getStateUpdateHandler(encoder) {
  return ({
    spritePosOnChange,
    spriteCharStateOnChange,
    spriteOrientatonOnChange,
  }) => {
    const runHandler = getRunHandler(encoder);
    return {
      SET_SPRITE_POS: (byteData) => {
        const pos = byteData.splice(-2);
        runHandler(spritePosOnChange, byteData, handler => handler(pos));
      },
      SET_CHAR_STATE: (byteData) => {
        runHandler(spriteCharStateOnChange, byteData, handler => handler(byteData)(encoder));
      },
      CHANGE_ORIENTATION: (byteData) => {
        runHandler(spriteOrientatonOnChange, byteData, handler => handler(byteData));
      },
    };
  };
}

/**
 * updateStateOnTick -> (gameStateByteArr) => ...
 *
 * @param encoder
 * @returns {undefined}
 */
export default (encoder, stateUpdateHanderConfig) => pipe(
  getStateUpdateHandler(encoder),
  encoder.decodeByteArray,
)(stateUpdateHanderConfig);
