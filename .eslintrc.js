const path = require('path');

module.exports = {
  'parser': 'babel-eslint',
  'extends': [
    'airbnb-base'
  ],
  'plugins': [
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
          path.resolve('src'),
          path.resolve('node_modules'),
          path.resolve('lib'),
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
