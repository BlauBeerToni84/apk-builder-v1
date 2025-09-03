let getDefaultConfig;
try {
  // RN ≥0.73 Empfehlung
  ({ getDefaultConfig } = require("@react-native/metro-config"));
} catch (e) {
  // Expo-Fallback
  ({ getDefaultConfig } = require("expo/metro-config"));
}
const config = getDefaultConfig(__dirname);
module.exports = config;
