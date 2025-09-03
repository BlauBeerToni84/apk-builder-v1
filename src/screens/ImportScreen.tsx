import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { importFromDocx } from '@/modules/importers/DocxImporter';
import { importFromZip } from '@/modules/importers/ZipImporter';
import { importFromText } from '@/modules/importers/TextImporter';

export default function ImportScreen() {
  const [code, setCode] = useState('');
  const [info, setInfo] = useState('Noch nichts importiert.');
  const [appName, setAppName] = useState('ImportedApp');

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (res.canceled || !res.assets || !res.assets[0]) return;
    const asset = res.assets[0];
    const uri = asset.uri;
    const name = asset.name || 'file';
    const mime = asset.mimeType || '';
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    try {
      if (name.toLowerCase().endsWith('.docx')) {
        const out = await importFromDocx(bytes);
        setCode(out.files.map(f => `// ${f.path}\n${f.content}`).join('\n\n'));
        setInfo(`DOCX importiert (${name}).`);
        if (out.detectedName) setAppName(out.detectedName);
      } else if (name.toLowerCase().endsWith('.zip')) {
        const out = await importFromZip(bytes);
        const appFile = out.files.find(f => /(^|\/)app\.tsx$/i.test(f.path));
        const body = (appFile ? [appFile, ...out.files.filter(f => f !== appFile)] : out.files)
          .map(f => `// ${f.path}\n${f.content}`).join('\n\n');
        setCode(body);
        setInfo(`ZIP importiert (${name}). Dateien: ${out.files.length}`);
        if (out.detectedName) setAppName(out.detectedName);
      } else if (mime.startsWith('text/') || /\.(txt|ts|tsx|js)$/i.test(name)) {
        const out = importFromText(atob(base64));
        setCode(out.files[0].content);
        setInfo(`Text importiert (${name}).`);
        if (out.detectedName) setAppName(out.detectedName);
      } else {
        setInfo(`Nicht unterstützter Dateityp: ${name} (${mime}).`);
      }
    } catch (e: any) {
      setInfo('Import-Fehler: ' + e.message);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleLarge">Import (DOCX / ZIP / Text)</Text>
      <Button mode="contained" style={{ marginTop: 8 }} onPress={pick}>Datei auswählen</Button>
      <Text style={{ marginTop: 12 }}>{info}</Text>
      <TextInput label="App-Name (optional)" value={appName} onChangeText={setAppName} mode="outlined" style={{ marginTop: 8 }} />
      <TextInput label="Extrahierter Code" value={code} onChangeText={setCode} mode="outlined" multiline style={{ marginTop: 8, minHeight: 260 }} />
    </ScrollView>
  );
}

