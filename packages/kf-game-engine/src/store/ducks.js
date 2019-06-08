import createHelpers from 'utils/redux.utils.js';

const namespace = 'GAME-ENGINE';
const { createConstantsAndActions } = createHelpers(namespace);

const constArr = [
  'PUSH_LOCATION',
  'SET_LOAD_PERCENTAGE',
];

export const { constants, actions } = createConstantsAndActions(constArr);
