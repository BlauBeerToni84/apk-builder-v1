/** Guarded Babel config for Expo + Reanimated */
module.exports = function (api) {
  api.cache(true);

  const plugins = [];
  // andere Plugins (falls nötig) VOR Reanimated pushen …

  // Reanimated nur einbinden, wenn installiert:
  try {
    require.resolve('react-native-reanimated/plugin');
    plugins.push('react-native-reanimated/plugin'); // MUSS zuletzt stehen
  } catch (e) {
    // not installed – skip to avoid 'opts' undefined errors during prebuild
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
