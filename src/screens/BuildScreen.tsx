import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Text, TextInput, SegmentedButtons, HelperText } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { encode as b64encode } from 'base-64';
import { useProjects } from '@/contexts/ProjectsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { ensureRepo, putFile, dispatchWorkflow } from '@/modules/build/GitHub';
import { packFiles } from '@/modules/build/Pack';
import { generateIconPng } from '@/modules/build/IconAI';

const WORKFLOW_YML = `name: EAS Android Build
on:
  workflow_dispatch:
    inputs:
      easProfile:
        description: 'EAS profile'
        required: true
        default: 'production'
      androidArtifact:
        description: 'apk|aab'
        required: true
        default: 'apk'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          token: \${{ secrets.EXPO_TOKEN }}
      - name: Install deps
        run: |
          npm ci || npm i
      - name: EAS build (Android)
        run: |
          npx eas build -p android --profile "\${{ github.event.inputs.easProfile }}" --non-interactive --json > build.json
          cat build.json
      - name: Upload artifacts (build.json)
        uses: actions/upload-artifact@v4
        with:
          name: build-json
          path: build.json
`;

function toB64(s: string) {
  return b64encode(unescape(encodeURIComponent(s)));
}

export default function BuildScreen() {
  const { upsert, baseDir } = useProjects();
  const { settings } = useSettings();
  const [appName, setAppName] = useState('MyK1W1App');
  const [code, setCode] = useState('// paste RN/Expo code here');
  const [artifact, setArtifact] = useState<'apk' | 'aab'>('apk');
  const [profile, setProfile] = useState<'production' | 'preview' | 'development'>('production');
  const [iconPrompt, setIconPrompt] = useState('');
  const [status, setStatus] = useState('');

  const build = async () => {
    try {
      setStatus('Vorbereitung...');
      const now = new Date().toISOString();
      const id = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, appName + now);
      const projectId = id.slice(0, 12);
      const repo = (settings.repoNamePrefix || 'k1w1-') + appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const owner = settings.repoOwner || 'YOUR_GITHUB_USERNAME';
      const appSlug = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const appTsx = code && code.trim().length > 0 ? code : `import React from 'react'; import { Text, View } from 'react-native'; export default function App(){ return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}> <Text>Hello ${appName}</Text> </View>; }`;

      let iconB64: string | undefined;
      if (iconPrompt.trim().length > 0) {
        setStatus('Icon generieren ...');
        const tmp = FileSystem.documentDirectory! + `icon-${projectId}.png`;
        await generateIconPng(iconPrompt, tmp);
        iconB64 = await FileSystem.readAsStringAsync(tmp, { encoding: FileSystem.EncodingType.Base64 });
      }

      setStatus('Dateien vorbereiten ...');
      const repoFiles = [
        { path: 'App.tsx', content: appTsx },
        { path: 'index.js', content: `import { registerRootComponent } from 'expo';\nimport App from './App';\nregisterRootComponent(App);\n` },
        { path: 'babel.config.js', content: `module.exports = function(api){api.cache(true);return {presets:['babel-preset-expo']};};\n` },
        { path: 'eas.json', content: JSON.stringify({ builds: { android: { production: { workflow: 'generic', distribution: 'internal' }, preview: { workflow: 'generic', distribution: 'internal' }, development: { workflow: 'generic', distribution: 'internal' } } } }, null, 2) },
        { path: 'package.json', content: JSON.stringify({ name: appSlug, version: "1.0.0", private: true, main: "index.js", scripts: { start: "expo start --tunnel" }, dependencies: { "expo": "~54.0.0", "react": "18.2.0", "react-native": "0.74.5" } }, null, 2) },
        { path: 'app.json', content: JSON.stringify({ expo: { name: appName, slug: appSlug, android: { package: `com.example.${appSlug}` }, icon: iconB64 ? "./assets/icon.png" : undefined } }, null, 2) },
        { path: '.github/workflows/eas-build.yml', content: WORKFLOW_YML }
      ];

      if (iconB64) {
        repoFiles.push({ path: 'assets/icon.png', content: iconB64 });
      }

      const zipBytes = await packFiles(repoFiles.map(f => ({ path: f.path, content: f.content })));
      const projectDir = baseDir + projectId + '/';
      await FileSystem.makeDirectoryAsync(projectDir, { intermediates: true });
      const zipPath = projectDir + 'snapshot.zip';
      await FileSystem.writeAsStringAsync(zipPath, b64encode(String.fromCharCode(...zipBytes as any)), { encoding: FileSystem.EncodingType.Base64 });

      setStatus('GitHub Repo prüfen/anlegen ...');
      const url = await ensureRepo(owner, repo);

      setStatus('Dateien pushen ...');
      for (const f of repoFiles) {
        const isBinary = f.path.endsWith('.png');
        const contentB64 = isBinary ? (f.content as string) : toB64(f.content as string);
        await putFile(owner, repo, f.path, contentB64, `Add ${f.path}`);
      }

      setStatus(`Workflow dispatch (${profile}, ${artifact}) ...`);
      await dispatchWorkflow(owner, repo, 'eas-build.yml', { easProfile: profile, androidArtifact: artifact });

      await upsert({
        id: projectId,
        name: appName,
        createdAt: now,
        updatedAt: now,
        status: 'building',
        provider: settings.activeProvider,
        repoUrl: url,
        codeSnapshotPath: zipPath
      });

      setStatus('Build gestartet. → History/Project → Logs/Artifacts öffnen.');
    } catch (e: any) {
      setStatus('Error: ' + e.message);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleLarge">APK/AAB Build</Text>
      <TextInput label="App Name" value={appName} onChangeText={setAppName} mode="outlined" style={{ marginTop: 8 }} />
      <SegmentedButtons value={artifact} onValueChange={(v: any) => setArtifact(v)} buttons={[{ value: 'apk', label: 'APK' }, { value: 'aab', label: 'AAB' }]} style={{ marginTop: 8 }} />
      <SegmentedButtons value={profile} onValueChange={(v: any) => setProfile(v)} buttons={[{ value: 'production', label: 'Production' }, { value: 'preview', label: 'Preview' }, { value: 'development', label: 'Development' }]} style={{ marginTop: 8 }} />
      <TextInput label="Icon Prompt (optional, OpenAI Images)" value={iconPrompt} onChangeText={setIconPrompt} mode="outlined" multiline style={{ marginTop: 8 }} />
      <HelperText type="info" visible>Setze OPENAI_API_KEY in app.json → expo.extra, damit Icon-Gen funktioniert.</HelperText>
      <TextInput label="Sourcecode (Text)" value={code} onChangeText={setCode} mode="outlined" multiline style={{ marginTop: 8, minHeight: 200 }} />
      <Button mode="contained" style={{ marginTop: 12 }} onPress={build}>Build starten (GitHub → EAS)</Button>
      <Text style={{ marginTop: 16 }}>{status}</Text>
    </ScrollView>
  );
}

