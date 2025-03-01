const webpack = require('webpack');

module.exports = function override(config) {
  // Thêm polyfills cho các module Node.js
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false, // Không cần fs trong trình duyệt
    path: require.resolve('path-browserify'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    os: require.resolve('os-browserify/browser'),
    constants: require.resolve('constants-browserify'),
    util: require.resolve('util/'),
    assert: require.resolve('assert/'),
    net: false, // Không cần net trong trình duyệt
  };

  // Thêm plugin để cung cấp Buffer và process
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ];

  return config;
};