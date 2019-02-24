/**
 * AssetManager for managing static local and remote aws assets
 * @module game/engine/asset-manager
 */

import * as PIXI from 'pixi.js';
import { Observable } from 'rxjs';
import { difference } from 'ramda';
import engine from 'game/engine';

let loadedDicts = [];

function combineDicts(requiredDicts) {
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
 * @param {string[]} {assets}
 * @returns {Observable}
 */
export function load(assetUrl, { assets }) {
  return Observable.create((observer) => {
    const notAddedDicts = difference(assets, loadedDicts);
    if (notAddedDicts.length === 0) {
      observer.complete();
      return;
    }
    const combinedDicts = combineDicts(notAddedDicts);
    combinedDicts
      .reduce((loader, { dictName, key, assetName }) => ((loadedDicts.indexOf(dictName) === -1)
        ? loader.add(console.log(`${dictName}_${key}`) || `${dictName}_${key}`, `${assetUrl}${assetName}`)
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
        console.log(PIXI.loader.resources);
        loadedDicts = loadedDicts.concat(assets);
        observer.complete();
      });
  });
}

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

export default { getSprite, getSpriteSheetFrames };
