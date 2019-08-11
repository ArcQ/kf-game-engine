import { Observable } from 'rxjs';

const stateObservers = {
  observers: {},
  intConfig: {},
};

export const getStateObserver = k => stateObservers.observers[k];

const createStateObservable = k => Observable.create((observer) => {
  stateObservers.observers[k] = observer;
});

export function nextStateObserver(k, stateDiffBytes) {
  const stateObserver = k
    && getStateObserver(k);
  if (stateObserver) {
    stateObserver.next({
      type: 'nextState',
      payload: {
        stateDiffBytes,
      },
    });
  }
}

export function resetObserver(k, newState) {
  if (!k) return;
  const stateObserver = k
    && getStateObserver(k);

  if (stateObserver) {
    stateObserver.next({ type: 'reset', newState });
  } else {
    createStateObservable(k);
  }
}
