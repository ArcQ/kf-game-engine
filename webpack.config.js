const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    index: './src/index.js',
    // ['asset-manager']: './src/asset-manager/index.js',
    // ['scene-manager']: './src/scene-manager/index.js'
  },
  resolve: {
    alias: {
      utils: path.resolve(__dirname, 'src/utils/'),
      'game/engine': path.resolve(__dirname, 'src/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    library: 'gameEngine',
    libraryTarget: 'commonjs2',
  },
  externals: [nodeExternals()],
};
