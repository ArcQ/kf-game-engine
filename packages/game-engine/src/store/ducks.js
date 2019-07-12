import createHelpers from '@kf/game-utils/dist/redux.utils';

const namespace = 'GAME-ENGINE';
const { createConstantsAndActions } = createHelpers(namespace);

const constArr = [
  'PUSH_LOCATION',
  'SET_LOAD_PERCENTAGE',
];

export const { constants, actions } = createConstantsAndActions(constArr);
