import { ReplaySubject } from 'rxjs';

const stateSubjects = {
  subjects: {},
  intConfigs: {},
};

export const getStateSubject = k => stateSubjects.subjects[k];

const createStateSubject = (k) => {
  if (!k) return;
  stateSubjects.subjects[k] = new ReplaySubject();
  stateSubjects.subjects[k].subscribe((v) => console.log(v));
};

export function nextStateSubject(k, stateDiffBytes) {
  if (!k) return;

  const stateSubject = k
    && getStateSubject(k);
  if (stateSubject) {
    stateSubject.next({
      type: 'nextState',
      payload: {
        stateDiffBytes,
      },
    });
  }
}

export function resetSubject(k, newState) {
  if (!k) return;

  const stateSubject = k
    && getStateSubject(k);

  if (stateSubject) {
    stateSubject.next({ type: 'reset', newState });
  }

  stateSubjects.initConfigs = newState;
  createStateSubject(k);
}
