/** @module * */
const isEmpty = v => v === null || v === undefined;
const isObj = v => (typeof v === 'object');
const isSafe = v => (!isEmpty(v)) && isObj(v);

/**
 * safeGetIn use this to avoid the need for null checks everywehre, supports immutable maps
 *
 * @param {Object|ImmutableMap} obj
 * @param keyDef
 * @returns {undefined}
 */
export function safeGetIn(obj, keyDef) {
  if (isEmpty(obj)) return undefined;

  return (keyDef instanceof Array)
    ? keyDef.reduce((prev, key) => (isSafe(prev) ? prev[key] : undefined), obj)
    : obj[keyDef];
}
