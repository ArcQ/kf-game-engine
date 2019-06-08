/**
 * AssetManager for managing static local and remote aws assets
 * @module game/engine/asset-manager
 */

import * as PIXI from 'pixi.js';
import { Observable } from 'rxjs';
import { curry, difference } from 'ramda';

let loadedDicts = [];

function combineDicts(engine, requiredDicts) {
  const combinedDict = requiredDicts.reduce((_combinedDict, dictName) => {
    const curDict = Object.keys(
      engine.assetDicts[dictName],
    ).map(key => ({ dictName, key, assetName: engine.assetDicts[dictName][key] }));
    return [..._combinedDict, ...curDict];
  }, []);
  return combinedDict;
}

/**
 * load assets with events for progress percentage, should only be called inside of scene manager
 *
 * @emits Load#percentage
 * @param {engine} {object} this will be curried, so you don't need to pass this in
 * @param {Array.<string>} {assets}
 * @returns {Observable}
 */
function load(engine, assetUrl, { assets }) {
  return Observable.create((observer) => {
    const notAddedDicts = difference(assets, loadedDicts);
    if (notAddedDicts.length === 0) {
      observer.complete();
      return;
    }
    const combinedDicts = combineDicts(engine, notAddedDicts);
    combinedDicts
      .reduce((loader, { dictName, key, assetName }) => ((loadedDicts.indexOf(dictName) === -1)
        ? loader.add(`${dictName}_${key}`, `${assetUrl}${assetName}`)
        : loader),
      PIXI.loader)
    /**
     * Percentage event.
     *
     * @event Load#percentage
     * @type {object}
     * @property {number} percentage - Indicates loading progress
     */
      .on('progress', loader => observer.next({ percentage: parseInt(loader.progress, 10) }))
      .load(() => {
        loadedDicts = loadedDicts.concat(assets);
        observer.complete();
      });
  });
}

export default engine => ({
  load: curry(load)(engine),
});
