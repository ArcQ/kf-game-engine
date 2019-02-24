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

/*
 * flattenObject - Flatten Object @gdibble: Inspired by https://gist.github.com/penguinboy/762197
 *  https://gist.github.com/slidenerd/04b78a5732f063a6ce6d73ef66a3fb3a
 *
 *   input:  { 'a':{ 'b':{ 'b2':2 }, 'c':{ 'c2':2, 'c3':3 } } }
 *   output: { 'a.b.b2':2, 'a.c.c2':2, 'a.c.c3':3 }
 */

/* eslint-disable */
export function flattenObject(ob) {
  let toReturn = {};
  let flatObject;
  for (let i in ob) {
    if (!ob.hasOwnProperty(i)) {
      continue;
    }
    //Exclude arrays from the final result
    //Check this http://stackoverflow.com/questions/4775722/check-if-object-is-array
    if(ob[i] && Array === ob[i].constructor){
    	continue;
    }
    if ((typeof ob[i]) === 'object') {
      flatObject = flattenObject(ob[i]);
      for (let x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) {
          continue;
        }
        //Exclude arrays from the final result
        if(flatObject[x] && Array === flatObject.constructor){
        	continue;
        }
        toReturn[i + (!!isNaN(x) ? '.' + x : '')] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}
/* eslint-enable */

/** @module **/
const isEmpty = (v) => v === null || v === undefined;
const isObj = (v) => (typeof v === 'object');
const isSafe = (v) => (!isEmpty(v)) && isObj(v);

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
