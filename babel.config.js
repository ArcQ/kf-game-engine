module.exports = function (api) {
  api.cache(true);

  return {
    plugins: [
      ['module-resolver', {
        root: ['./src/**'],
        alias: {
          test: './test',
        },
      }],
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-syntax-import-meta',
      ['@babel/plugin-proposal-class-properties', { loose: false }],
      '@babel/plugin-proposal-json-strings',
      '@babel/plugin-transform-regenerator',
      '@babel/plugin-transform-async-to-generator',
    ],
  };
};
