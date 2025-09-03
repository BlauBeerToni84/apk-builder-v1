import React from 'react';
import { ScrollView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useProjects } from '@/contexts/ProjectsContext';

export default function ProjectScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { byId } = useProjects();
  const id = route.params?.id as string;
  const project = byId(id);
  if (!project) return <Text>Projekt nicht gefunden.</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleLarge">{project.name}</Text>
      <Text>Erstellt: {project.createdAt}</Text>
      <Text>Zuletzt: {project.updatedAt}</Text>
      <Text>Status: {project.status}</Text>
      {project.repoUrl ? <Text>Repo: {project.repoUrl}</Text> : null}
      {project.easBuildUrl ? <Text>EAS: {project.easBuildUrl}</Text> : null}
      {project.lastError ? <Text>Fehler: {project.lastError}</Text> : null}
      <Text style={{ marginTop: 16 }}>Snapshot: {project.codeSnapshotPath || '—'}</Text>
      {project.repoUrl ? (
        <>
          <Button mode="contained" style={{ marginTop: 16 }} onPress={() => nav.navigate('Logs', { repoUrl: project.repoUrl })}>Logs anzeigen</Button>
          <Button mode="outlined" style={{ marginTop: 8 }} onPress={() => nav.navigate('Artifacts', { repoUrl: project.repoUrl })}>Artefakte anzeigen</Button>
        </>
      ) : null}
    </ScrollView>
  );
}

