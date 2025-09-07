const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = { buffer: require.resolve('buffer/') };
module.exports = config;
