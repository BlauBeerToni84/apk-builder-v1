const path = require('path');

let getDefaultConfig;
try {
  ({ getDefaultConfig } = require('@react-native/metro-config'));
} catch (e) {
  ({ getDefaultConfig } = require('expo/metro-config'));
}

const { resolver, transformer, serializer, server, symbolicator } = getDefaultConfig(__dirname);

// Standard-Resolver von Metro:
const { resolve } = require('metro-resolver');

module.exports = {
  resolver: {
    ...resolver,
    // Handle "@/foo/bar" -> "<repo>/src/foo/bar"
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('@/')) {
        const mapped = path.join(__dirname, 'src', moduleName.slice(2));
        return resolve(context, mapped, platform);
      }
      return resolve(context, moduleName, platform);
    },
  },
  transformer,
  serializer,
  server,
  symbolicator,
};
