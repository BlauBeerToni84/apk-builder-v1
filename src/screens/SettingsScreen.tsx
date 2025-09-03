import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, TextInput, Text, SegmentedButtons } from 'react-native-paper';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsScreen() {
  const { settings, setSettings, save } = useSettings();
  const [local, setLocal] = useState(settings);

  const handleSave = async () => {
    setSettings(local);
    await save();
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleLarge">Einstellungen / Tokens</Text>
      <SegmentedButtons
        value={local.activeProvider}
        onValueChange={(v: any) => setLocal({ ...local, activeProvider: v })}
        buttons={[
          { value: 'grok', label: 'Grok' },
          { value: 'claude', label: 'Claude' },
          { value: 'qwen', label: 'Qwen' },
          { value: 'deepseek', label: 'Deepseek' },
          { value: 'gemini', label: 'Gemini' },
          { value: 'openai', label: 'OpenAI' }
        ]}
      />
      <TextInput label="GitHub Token" value={local.githubToken} onChangeText={t => setLocal({ ...local, githubToken: t })} mode="outlined" style={{ marginTop: 8 }} />
      <TextInput label="EAS Token (Expo)" value={local.easToken} onChangeText={t => setLocal({ ...local, easToken: t })} mode="outlined" style={{ marginTop: 8 }} />
      <TextInput label="Expo Account Name" value={local.expoAccountName} onChangeText={t => setLocal({ ...local, expoAccountName: t })} mode="outlined" style={{ marginTop: 8 }} />
      <TextInput label="Expo Project ID" value={local.expoProjectId} onChangeText={t => setLocal({ ...local, expoProjectId: t })} mode="outlined" style={{ marginTop: 8 }} />
      <TextInput label="Repo Owner (GitHub)" value={local.repoOwner} onChangeText={t => setLocal({ ...local, repoOwner: t })} mode="outlined" style={{ marginTop: 8 }} />
      <TextInput label="Repo Prefix" value={local.repoNamePrefix} onChangeText={t => setLocal({ ...local, repoNamePrefix: t })} mode="outlined" style={{ marginTop: 8 }} />
      <Button mode="contained" style={{ marginTop: 12 }} onPress={handleSave}>Speichern</Button>
    </ScrollView>
  );
}

