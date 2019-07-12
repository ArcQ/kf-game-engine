function encode(encoderKeys) {
  return k => encoderKeys.indexOf(k);
}

function decode(encoderKeys) {
  return i => encoderKeys[i];
}

function splitIntoBlocksOfState({ stateBlocks, origByteArr }) {
  if (!origByteArr || origByteArr.length === 0) {
    return stateBlocks;
  }
  const [subStateLen, ...restByteArr] = origByteArr;
  const nextByteArr = restByteArr.splice(subStateLen - 1);
  stateBlocks.push(restByteArr);
  return splitIntoBlocksOfState({ stateBlocks, origByteArr: nextByteArr });
}


/**
 * encoder hoc
 * @param encoderKeys {array[string]}
 *
 * @returns {undefined}
 */
export default (encoderKeys) => {
  const encoder = {
    /**
     * encode
     * @param encoderKeys
     *
     * @returns {string}
     */
    encode: encode(encoderKeys),
    /**
     * decode
     * @param encoderKeys
     *
     * @returns {number}
     */
    decode: decode(encoderKeys),
    /**
     * decodeByteArray
     * @param stateUpdateHandler {object} -takes in an object with the keys of events as
     * keys and functions as handlers, runs these handlers
     *
     * @returns {undefined}
     */
    decodeByteArray(stateUpdateHandler) {
      return (gameStateByteArr) => {
        splitIntoBlocksOfState({ stateBlocks: [], origByteArr: gameStateByteArr })
          .map(([k, ...data]) =>
            stateUpdateHandler[encoder.decode(k)]
              && stateUpdateHandler[encoder.decode(k)](data)(encoder));
      };
    },
  };
  return encoder;
};
