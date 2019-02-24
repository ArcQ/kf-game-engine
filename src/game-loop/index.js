import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  zip, expand, filter, map, share, buffer, takeUntil,
} from 'rxjs/operators';

import { flatten } from 'utils/arrUtils';

import { clampToFPS } from './game-loop.utils';

const FPS = 30;

/**
 * getBufferedEvent - Here we buffer our event stream until we get a new frame emission. This
 gives us a set of all the events that have triggered since the previous
 frame. We reduce these all down to a single dictionary of events that occured
 *
 * @param frames$
 * @param event$
 * @returns {undefined}
 */

function getBufferedEvent(frames$, event$) {
  const eventPerFrame$ = event$
    .pipe(
      buffer(frames$),
    );
  return eventPerFrame$;
}

/**
 * calculateStep - We use recursively call this function using expand to give us each
 * new Frame based on the window.requestAnimationFrame calls.
 * Expand emits the value of the called functions
 * returned observable, as well as recursively calling the function with that same
 * emitted value. This works perfectly for calculating our frame steps because each step
 * needs to know the lastStepFrameTime to calculate the next.
 *
 * @param prevFrame
 * @returns {Observable}
 */
function calculateStep(prevFrame) {
  // TODO rx has it's own requestAnimationFrame direclty to obs
  return Observable.create((observer) => {
    requestAnimationFrame((frameStartTime) => {
      const deltaTime = prevFrame ? (frameStartTime - prevFrame.frameStartTime) / 1000 : 0;
      observer.next({
        frameStartTime,
        deltaTime,
      });
    });
  })
    .pipe(
      map(clampToFPS(FPS)),
    );
}


function createGameLoopState(initialGameState, cancel$) {
  const gameState$ = new BehaviorSubject(initialGameState);
  return {
    gameState$,
    /**
     * updateGame - takes in a update func, and returns a func that will update game state
     *
     * @returns {updatedGameState}
     */
    updateGame: (updateF) => {
      gameState$.next(
        updateF(gameState$.getValue()),
      );
      return gameState$.getValue();
    },
  };
}

/**
 * createGameLoop - returns an observable game loop that you can subscribe to,
 * will run until you manually cancel
 *
 * @description game flow should go as such frame$ + event observable updates should flow through
 * update function, which will spawn multiple observables and update gameState using updateState
 * a single render function will watch all updates to gameState$ and 'dumbly' update screen
 * keeping unidirectional state flow
 *
 * @param sceneObj {Object} - base scene config at index of every scene
 * @param scene.obsGetterList - event getters that are functions that return observables such as
 * $keysDown to merge with the main frame$ observable, getters should take an argument frame$
 * so for example they can buffer to the frame$ observable
 * @param scene.update - update function called every frame update, returns a new game state obj
 * @param gameState {Observable} - should be an observable...most probably a behaviorsubject that
 * many can subscribe to
 * @returns frames {Observable} - returns the frame observable that a scene can subscribre to
 */
export function createGameLoop(eventSources = [], initialState, cancel$) {
  const gameLoopStates = createGameLoopState(initialState, cancel$);

  const frames$ = of(undefined)
    .pipe(
      expand(val => calculateStep(val)),
      filter(frame => frame !== undefined),
      map(frame => frame.deltaTime),
      takeUntil(cancel$),
    );

  const bufferedObsList = eventSources.map(obsGetter => getBufferedEvent(frames$, obsGetter));

  return {
    framesAndEvents$: frames$.pipe(
      zip(...bufferedObsList,
        (deltaTime, ...args) => ({ deltaTime, inputState: flatten(args) })),
      share(),
    ),
    ...gameLoopStates,
  };
}

export default {};
