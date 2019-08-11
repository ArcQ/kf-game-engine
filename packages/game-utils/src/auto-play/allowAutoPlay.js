import { Observable, from } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { pipe } from 'ramda';

function makeDecision(curState) {
}

function runAutoPlay(config, actionsMapper, updatesMapper) {
  const getDecisionController = curState => Observable.create((observer) => {
    const evt = pipe(
      makeDecision,
      actionsMapper,
    )(curState);

    observer.next(evt);
  });

  let wasmStateObserver;

  const onWasmStateChange$ = Observable.create((observer) => {
    wasmStateObserver = observer;
  });

  from(
    fetch(`http://localhost:9999/models/${config.autoPlayModel}`),
  ).pipe(
    flatMap(onWasmStateChange$),
    map(() => updatesMapper),
    flatMap(getDecisionController),
  );

  return wasmStateObserver;
}

export default function allowAutoPlay(
  initialState,
  config,
  actionsMapper,
  updatesMapper,
) {
  let wasmStateObserver;
  const wrapper = (ifNoAutoPlayEvt) => {
    if (config.autoPlayModel) {
      console.info('running auto play'); //eslint-disable-line
      wasmStateObserver = runAutoPlay(config, actionsMapper, updatesMapper);
    }
    return ifNoAutoPlayEvt;
  };
  return {
    onWasmStateChange: stateByteDiff => wasmStateObserver.next(stateByteDiff),
    wrapper,
  };
}

// TODO we can actually modify the game-runner code to also use the autoplay code, as long as we set ids for this specific function
