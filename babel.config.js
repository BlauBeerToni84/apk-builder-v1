module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', { alias: { '@': './src', buffer: 'buffer' } }],
      'react-native-reanimated/plugin'
    ]
  };
};


