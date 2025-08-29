export default ({ config }) => ({
  ...config,
  name: "k1w1 APK Builder",
  slug: "k1w1-apk-builder",
  icon: "./assets/icon.png",
  android: {
    package: "com.anonymous.k1w1apkbuilder",
    adaptiveIcon: { foregroundImage: "./assets/icon.png", backgroundColor: "#FFFFFF" }
  }
});
