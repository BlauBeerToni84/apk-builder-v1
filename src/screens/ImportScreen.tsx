import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { importFromDocx } from '@/modules/importers/DocxImporter';
import { importFromZip } from '@/modules/importers/ZipImporter';
import { importFromText } from '@/modules/importers/TextImporter';

export default function ImportScreen() {
  const [status, setStatus] = useState("Bereit zum Import");

  const importFile = async (type: 'text' | 'zip' | 'docx') => {
    try {
      setStatus(`Importiere ${type.toUpperCase()}...`);
      const result = await DocumentPicker.getDocumentAsync({
        type: type === 'text' ? 'text/plain' : type === 'zip' ? 'application/zip' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setStatus("Import abgebrochen.");
        return;
      }

      const uri = result.assets[0].uri;
      const fileContent = await fetch(uri).then(res => res.arrayBuffer());

      let importedData;
      if (type === 'text') {
        importedData = importFromText(new TextDecoder().decode(fileContent));
      } else if (type === 'zip') {
        importedData = await importFromZip(new Uint8Array(fileContent));
      } else {
        importedData = await importFromDocx(new Uint8Array(fileContent));
      }

      setStatus(`Import erfolgreich! ${importedData.files.length} Dateien importiert.`);
      // Hier könnten Sie die importierten Dateien weiterverarbeiten, z.B. in den Zustand der App laden
      console.log(importedData.files);

    } catch (error: any) {
      setStatus(`Fehler beim Import: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleLarge">Projekt importieren</Text>
      <Button mode="contained" style={{ marginTop: 12 }} onPress={() => importFile('text')}>Textdatei importieren (.txt)</Button>
      <Button mode="contained" style={{ marginTop: 12 }} onPress={() => importFile('zip')}>ZIP-Datei importieren (.zip)</Button>
      <Button mode="contained" style={{ marginTop: 12 }} onPress={() => importFile('docx')}>DOCX-Datei importieren (.docx)</Button>
      <Text style={{ marginTop: 16, color: '#666' }}>{status}</Text>
    </ScrollView>
  );
}


