const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
config.transformer = { ...config.transformer, enableBabelRCLookup: true };
config.resolver = { ...config.resolver, sourceExts: [...config.resolver.sourceExts, "cjs"] };
module.exports = config;

