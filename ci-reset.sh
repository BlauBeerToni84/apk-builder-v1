#!/usr/bin/env bash
set -Eeuo pipefail
echo "🔧 CI Reset…"
rm -rf node_modules android/.gradle
rm -rf ~/.gradle/caches ~/.gradle/daemon ~/.m2 || true

node -e '
const fs=require("fs"); const p=JSON.parse(fs.readFileSync("package.json","utf8"));
p.dependencies=p.dependencies||{};
p.dependencies["react-native-screens"]="3.20.0";
p.dependencies["react-native-gesture-handler"]="2.9.0";
p.dependencies["react-native-safe-area-context"]="4.5.0";
p.dependencies["react-native-reanimated"]="2.14.4";
p.scripts=p.scripts||{};
p.scripts.postinstall = (typeof p.scripts.postinstall==="string"&&p.scripts.postinstall.length>0)
  ? p.scripts.postinstall+" || true" : "echo skip postinstall";
fs.writeFileSync("package.json", JSON.stringify(p,null,2));
'

if command -v pnpm >/dev/null 2>&1; then pnpm i --no-frozen-lockfile;
elif command -v yarn >/dev/null 2>&1; then yarn install --network-timeout 600000;
else npm i --legacy-peer-deps; fi

mkdir -p android
gp=android/gradle.properties; touch "$gp"
grep -q '^kotlinVersion=' "$gp" || echo "kotlinVersion=1.9.24" >> "$gp"
grep -q '^kotlin.compiler.execution.strategy=' "$gp" || echo "kotlin.compiler.execution.strategy=in-process" >> "$gp"
grep -q '^org.gradle.jvmargs=' "$gp" || echo "org.gradle.jvmargs=-Xmx3g -Dfile.encoding=UTF-8" >> "$gp"
grep -q '^android.suppressUnsupportedCompileSdk=' "$gp" || echo "android.suppressUnsupportedCompileSdk=35" >> "$gp"
grep -q '^newArchEnabled=' "$gp" && sed -i 's#^newArchEnabled=.*#newArchEnabled=false#g' "$gp" || echo "newArchEnabled=false" >> "$gp"
grep -q '^REANIMATED_DISABLE_VERSION_CHECK=' "$gp" || echo "REANIMATED_DISABLE_VERSION_CHECK=true" >> "$gp"
grep -q '^reanimated.useFabric=' "$gp" || echo "reanimated.useFabric=false" >> "$gp"

ab=android/build.gradle
if [ -f "$ab" ]; then
  if grep -q 'kotlin-gradle-plugin' "$ab"; then
    sed -i 's#org.jetbrains.kotlin:kotlin-gradle-plugin:[0-9.]\+#org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24#g' "$ab" || true
  elif grep -q 'buildscript' "$ab" && grep -q 'dependencies' "$ab"; then
    sed -i '/dependencies\s*{.*/a \        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24"' "$ab" || true
  fi
fi

appb=android/app/build.gradle
if [ -f "$appb" ]; then
  grep -q 'androidx.appcompat:appcompat' "$appb" || sed -i '/dependencies\s*{.*/a \    implementation "androidx.appcompat:appcompat:1.6.1"' "$appb" || true
  grep -q 'com.google.android.material:material' "$appb" || sed -i '/dependencies\s*{.*/a \    implementation "com.google.android.material:material:1.9.0"' "$appb" || true
fi
