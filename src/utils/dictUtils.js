import { path } from 'ramda';

/**
 * swapKV - for a { k : v }, return { v : k }
 *
 * @param obj
 * @returns {Object}
 */

export function swapKV(obj) {
  return Object.keys(obj).reduce(key => ({ [obj[key]]: key }));
}

/**
 * safeGetFn - given list of keys, 'deep' run a function if it exists
 * this is so we don't ahve to check if the function attr actually exists before running
 *
 * @param obj
 * @param keyList
 * @returns {undefined}
 */

export function safeGetFn(keyList, obj) {
  if (obj === undefined) return function() {};
  const f = path(keyList, obj);
  if ((typeof f) === 'function') {
    return f;
  }
  return function() {};
}

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
