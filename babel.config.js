module.exports = function (api) {
  api.cache(true);

  return {
    sourceMaps: 'both',
    plugins: [
      ['module-resolver', {
        root: ['./src/**'],
        alias: {
          test: './test',
        },
      }],
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-transform-destructuring',
      '@babel/plugin-syntax-import-meta',
      ['@babel/plugin-proposal-class-properties', { loose: false }],
      '@babel/plugin-proposal-json-strings',
      '@babel/plugin-transform-regenerator',
      '@babel/plugin-transform-async-to-generator',

    ],
    env: {
      test: {
        plugins: [
          '@babel/plugin-transform-modules-commonjs',
        ],
      },
    },
  };
};
