BEGIN{ins=0}
{
  print
  if ($0 ~ /Expo prebuild \(Android\)/ && ins==0) {
    print "      - name: Ensure ext.react for Reanimated (minor)"
    print "        run: |"
    print "          set -e"
    print "          RN_MINOR=$(node -p \"(()=>{const v=require('react-native/package.json').version;const m=/^0\\.(\\d+)\\./.exec(v);return m?m[1]:'71'})()\")"
    print "          FILE=android/build.gradle"
    print "          [ -f \"$FILE\" ] || { echo \"android/build.gradle fehlt (prebuild?)\"; exit 1; }"
    print "          if grep -q \"ext\\\\s*{[^}]*react\\\\s*=\" \"$FILE\"; then"
    print "            sed -i \"0,/ext\\\\s*{[^}]*react\\\\s*=\\\\s*\\[/{s//ext { react = [ minor: ${RN_MINOR} , /}\" \"$FILE\""
    print "            sed -i \"s/minor: [0-9]\\\\+, *minor:/${RN_MINOR}, minor:/g\" \"$FILE\" || true"
    print "          else"
    print "            sed -i \"1i ext { react = [ minor: ${RN_MINOR} ] }\" \"$FILE\""
    print "          fi"
    print "          echo \"ext.react.minor=${RN_MINOR} gesetzt.\""
    ins=1
  }
}
