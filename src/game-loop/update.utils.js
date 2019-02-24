import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * mapInputState - hoc that returns a function mapsInputStateToEventObs
 *
 * @param eventObsDict
 * @returns {function[]}
 */
export function mapInputState(eventObsDict) {
  /**
   * mapInputStateToEventObs - used inside udpate loop, given def of obs to run given event type,
   * return the observable to run
   *
   * @param frames$
   * @param updateState
   * @param inputState
   * @returns {Observables[]}
   */
  return (frames$, updateState, inputState) => undefined;
}

/**
 * obsDictFactory - for storing event obs
 *
 * @param {Array} chain - array of rxjs operators
 * @param {String} type - available types: takeLatest
 * @returns {Object} - hasAttr of .create .obs and .next
 */
export function obsDictFactory(_obs$, type) {
  let obsvr;
  let obs$;
  if (type === 'takeLatest') {
    obs$ = Observable.create(
      (_obsvr) => {
        obsvr = _obsvr;
        obsvr.next();
      },
    ).pipe(
      switchMap(nextObs$ => nextObs$ || _obs$),
    );
  }
  return {
    obs$,
    next: arg => obsvr.next(arg),
  };
}

/**
 * createInputObservableCommand
 *
 * @param eventObsDict
 * @returns {function} returns an inputObservableCommadn
 */

export function createInputObservableCommand(eventObsDict) {
  /**
   * InputObservableCommand - runs an observable depending on event
   *    if multi is not specified, means we are u sing a behaviour subject and we should
   *    be using the next function only if obs has already been initiated
   *
   * @param {bool}| multi - if true, then don't use old observable, create a new obs
   * @returns {Observable}
   */
  return (name, createArgs, multi) => {
    if (!eventObsDict.next || multi) {
      const obs = eventObsDict[name](createArgs);
      eventObsDict.next = obs;
      eventObsDict.subscribe();
    }
  };
}

export default {};
