const path = require('path');

module.exports = {
  'parser': 'babel-eslint',
  'extends': [
    'airbnb-base'
  ],
  'plugins': [
    'eslint-plugin-flowtype',
    'babel',
    'promise',
    'jest'
  ],
  'env': {
    "jest": true,
    'browser' : true
  },
  'globals': {
    'Phaser': true,
    'PIXI': true,
    'p2': true,
  },
  'settings': {
    'import/resolver': {
      'node':{
        'moduleDirectory': [
          path.resolve('packages/kf-game-engine/src'),
          path.resolve('packages/game-utils/src'),
          path.resolve('packages/game-utils/node_modules'),
          path.resolve('packages/kf-game-engine/node_modules'),
          path.resolve('node_modules'),
        ]
      }
    }
  },
  'rules': {
    'max-len': [1, 100, 2],
    'import/no-named-as-default': 0,
    'no-param-reassign': ['error', { 'props': false }],
    'no-mixed-operators': 1,
    'no-underscore-dangle': 0,
    'import/no-unresolved': [2,{'ignore':[ 'rxjs']}],
    'func-names':0,
    // temporary since webpack-resolver not working with aliases in webpack2
    'import/no-extraneous-dependencies':0,
    // exception for class methods for phaser api
    'class-methods-use-this':0,
    'react/require-default-props':0,
    'array-callback-return':0,
    'react/destructuring-assignment':0,
    'space-before-function-paren':0,
    'import/prefer-default-export':0,
    'implicit-arrow-linebreak':0,
  },
}
