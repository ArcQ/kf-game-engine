// vendor
import { createActions } from 'redux-actions';
import constants from 'namespace-constants';

const separator = '-';

function convertArrToObj(arr) {
  return Object.assign(...arr.map(key => ({ [key]: payload => ({ payload }) })));
}

function actionsNamespaceWrapper(namespace) {
  return obj => Object.keys(obj).reduce((newActions, key) => Object.assign(newActions, {
    [key]: (payload) => {
      const action = obj[key](payload);
      return Object.assign(action, { type: `${namespace}${separator}${action.type}` });
    },
  }), {});
}

export default function createHelpers(nameSpace) {
  const wrapNamespace = actionsNamespaceWrapper(nameSpace);
  return {
    createConstants: arr => constants(nameSpace, arr, { separator }),
    createActions: arr => wrapNamespace(createActions(convertArrToObj(arr))),
    createConstantsAndActions: arr => ({
      actions: wrapNamespace(createActions(...arr)),
      constants: constants(nameSpace, arr, { separator }),
    }),
  };
}
