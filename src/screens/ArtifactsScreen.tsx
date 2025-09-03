import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Text, Divider } from 'react-native-paper';
import { listArtifacts, Artifact, downloadArtifactZip } from '@/modules/build/Artifacts';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

function parseOwnerRepo(repoUrl?: string): { owner: string, repo: string } | null {
  if (!repoUrl) return null;
  const m = repoUrl.match(/github\.com\/(.+?)\/(.+?)(\/|$)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

export default function ArtifactsScreen({ route }: any) {
  const repoUrl: string | undefined = route?.params?.repoUrl;
  const runId: number | undefined = route?.params?.runId;
  const or = parseOwnerRepo(repoUrl);
  const owner = or?.owner || '';
  const repo = or?.repo || '';

  const [status, setStatus] = useState('Lade...');
  const [arts, setArts] = useState<Artifact[]>([]);
  const [downloadInfo, setDownloadInfo] = useState('');

  const refresh = async () => {
    if (!owner || !repo) {
      setStatus('Repo nicht erkennbar.');
      return;
    }
    try {
      setStatus('Artifacts holen ...');
      const a = await listArtifacts(owner, repo, runId);
      setArts(a);
      setStatus(`Gefunden: ${a.length}`);
    } catch (e: any) {
      setStatus('Fehler: ' + e.message);
    }
  };

  const download = async (a: Artifact) => {
    try {
      setDownloadInfo('Lade herunter ...');
      const local = `${FileSystem.documentDirectory}artifact-${a.id}.zip`;
      const uri = await downloadArtifactZip(owner, repo, a.id, local);
      setDownloadInfo('Gespeichert: ' + uri);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (e: any) {
      setDownloadInfo('Download-Fehler: ' + e.message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleLarge">Build-Artefakte</Text>
      <Text>{owner}/{repo}{runId ? ` (Run ${runId})` : ''}</Text>
      <Button mode="outlined" style={{ marginTop: 8 }} onPress={refresh}>Aktualisieren</Button>
      <Text style={{ marginTop: 8 }}>{status}</Text>
      {downloadInfo ? <Text style={{ marginTop: 4 }}>{downloadInfo}</Text> : null}
      <Divider style={{ marginVertical: 12 }} />
      {arts.map(a => (
        <React.Fragment key={a.id}>
          <Text variant="titleMedium">{a.name}</Text>
          <Text>Größe: {Math.round(a.size_in_bytes / 1024)} KB</Text>
          <Text>Erstellt: {a.created_at}</Text>
          <Text>Expires: {a.expires_at}</Text>
          <Button style={{ marginTop: 6 }} onPress={() => download(a)}>Download & Teilen</Button>
          <Divider style={{ marginVertical: 12 }} />
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

