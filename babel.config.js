/** Babel: Alias @ -> ./src + (optional) Reanimated zuletzt */
module.exports = function (api) {
  api.cache(true);
  const plugins = [
    ["module-resolver", {
      root: ["."],
      alias: { "@": "./src" },
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
    }],
  ];
  try {
    require.resolve("react-native-reanimated/plugin");
    plugins.push("react-native-reanimated/plugin"); // immer zuletzt
  } catch (e) {}
  return { presets: ["babel-preset-expo"], plugins };
};
