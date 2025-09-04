#!/usr/bin/env bash
set -Eeuo pipefail
echo "🔧 CI Reset: Gradle+node clean, harte Pins, fehlende Libs…"

# 1) Alles wegputzen (damit keine 'latest' Patches mehr durchrutschen)
rm -rf node_modules android/.gradle
# GitHub Runner:
rm -rf ~/.gradle/caches ~/.gradle/daemon ~/.m2 || true

# 2) package.json Pins setzen (robuste Kombi)
node -e '
const fs=require("fs");
const p=JSON.parse(fs.readFileSync("package.json","utf8"));
p.dependencies=p.dependencies||{};
p.dependencies["react-native-screens"]    = process.env.PIN_SCREENS||"3.20.0";
p.dependencies["react-native-gesture-handler"]=process.env.PIN_GH||"2.9.0";
p.dependencies["react-native-safe-area-context"]=process.env.PIN_SAFE||"4.5.0";
p.dependencies["react-native-reanimated"] = process.env.PIN_REANIM||"2.14.4";
p.scripts=p.scripts||{};
if (typeof p.scripts.postinstall==="string" && p.scripts.postinstall.length>0){
  p.scripts.postinstall = p.scripts.postinstall + " || true";
} else {
  p.scripts.postinstall = "echo skip postinstall";
}
fs.writeFileSync("package.json", JSON.stringify(p,null,2));
'

# 3) Install
if command -v pnpm >/dev/null 2>&1; then pnpm i --no-frozen-lockfile;
elif command -v yarn >/dev/null 2>&1; then yarn install --network-timeout 600000;
else npm i --legacy-peer-deps; fi

# 4) Gradle properties (New Arch OFF + Reanimated checks aus)
mkdir -p android
gp=android/gradle.properties; touch "$gp"
grep -q '^kotlinVersion=' "$gp" || echo "kotlinVersion=${KOTLIN_VER:-1.9.24}" >> "$gp"
grep -q '^kotlin.compiler.execution.strategy=' "$gp" || echo "kotlin.compiler.execution.strategy=in-process" >> "$gp"
grep -q '^org.gradle.jvmargs=' "$gp" || echo "org.gradle.jvmargs=-Xmx3g -Dfile.encoding=UTF-8" >> "$gp"
grep -q '^android.suppressUnsupportedCompileSdk=' "$gp" || echo "android.suppressUnsupportedCompileSdk=35" >> "$gp"
if grep -q '^newArchEnabled=' "$gp"; then
  sed -i "s#^newArchEnabled=.*#newArchEnabled=${NEW_ARCH:-false}#g" "$gp"
else
  echo "newArchEnabled=${NEW_ARCH:-false}" >> "$gp"
fi
grep -q '^REANIMATED_DISABLE_VERSION_CHECK=' "$gp" || echo "REANIMATED_DISABLE_VERSION_CHECK=true" >> "$gp"
grep -q '^reanimated.useFabric=' "$gp" || echo "reanimated.useFabric=false" >> "$gp"

# 5) Kotlin Gradle Plugin pin
ab=android/build.gradle
if [ -f "$ab" ]; then
  if grep -q 'kotlin-gradle-plugin' "$ab"; then
    sed -i 's#org.jetbrains.kotlin:kotlin-gradle-plugin:[0-9.]\+#org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24#g' "$ab" || true
  elif grep -q 'buildscript' "$ab" && grep -q 'dependencies' "$ab"; then
    sed -i '/dependencies\s*{.*/a \        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24"' "$ab" || true
  fi
fi

# 6) Fehlende Android-Libs für Screens HeaderConfig
appb=android/app/build.gradle
if [ -f "$appb" ]; then
  grep -q 'androidx.appcompat:appcompat' "$appb" || sed -i '/dependencies\s*{.*/a \    implementation "androidx.appcompat:appcompat:1.6.1"' "$appb" || true
  grep -q 'com.google.android.material:material' "$appb" || sed -i '/dependencies\s*{.*/a \    implementation "com.google.android.material:material:1.9.0"' "$appb" || true
fi

# 7) Sauber starten
( cd android && ./gradlew --no-daemon clean ) || true
