import { pathOr } from 'ramda';

/**
 * getRunHandler - run handler if it is a function
 *
 * @param encoder
 * @returns {undefined}
 */
function getRunHandler(encoder) {
  return (stateUpdateHandler, byteData, cb) => {
    const handler = pathOr(null, [encoder.decode(byteData[0])], stateUpdateHandler);
    if (typeof handler === 'function') cb(handler);
  };
}

/**
 * createUpdateHandlers
 * @param encoder
 * @param handlers
 *
 * @returns {undefined}
 */
export default function createUpdateHandlers(encoder, {
  spritePosOnChange,
  spriteCharStateOnChange,
  spriteOrientatonOnChange,
}) {
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
}
