const path = require('path');
let getDefaultConfig;
try { ({ getDefaultConfig } = require('@react-native/metro-config')); }
catch { ({ getDefaultConfig } = require('expo/metro-config')); }

const config = getDefaultConfig(__dirname);

// Alias '@' -> '<root>/src' (deckt '@/x/y' automatisch ab)
config.resolver = {
  ...(config.resolver || {}),
  alias: { ...(config.resolver?.alias || {}), '@': path.resolve(__dirname, 'src') },
};

module.exports = config;
