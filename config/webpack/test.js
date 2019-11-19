// Note: You must restart bin/webpack-dev-server for changes to take effect

const merge = require('webpack-merge');
const sharedConfig = require('./shared.js');

module.exports = merge(sharedConfig, {
  mode: 'development',
  optimization: {
    minimize: false,
    runtimeChunk: {
      name: 'locales',
    },
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        common: {
          name: 'common',
          chunks: 'all',
          minChunks: 2,
          minSize: 0,
        },
      },
    },
  },
});
