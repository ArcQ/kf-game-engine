const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  transform: {
    'packages/game-utils': '../../babel-jest-wrapper.js',
    'lib/es6/*': '../../babel-jest-wrapper.js',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!@glennsl/bs-jest|bs-platform).+\\.js$',
    'interop.js',
  ],
};
