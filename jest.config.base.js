module.exports = {
  testURL: 'http://localhost/',
  testMatch: [
    '**/?(*_)+(spec|test).[jt]s?(x)',
  ],
  moduleNameMapper: {
    '@kf/(.+)$': '<rootDir>/../../packages/$1',
  },
  verbose: true,
};
