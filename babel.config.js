/** Safe Babel config for Expo + Reanimated */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // weitere Plugins (falls nötig) vor Reanimated eintragen …
      'react-native-reanimated/plugin', // MUSS als letztes stehen
    ],
  };
};
