import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, TextInput, Text, SegmentedButtons } from 'react-native-paper';
import { useSettings } from '@/contexts/SettingsContext';
import { chatGrok } from '@/modules/providers/GrokProvider';
import { chatClaude } from '@/modules/providers/ClaudeProvider';
import { chatQwen } from '@/modules/providers/QwenProvider';
import { chatDeepseek } from '@/modules/providers/DeepseekProvider';
import { chatGemini } from '@/modules/providers/GeminiProvider';
import { chatOpenAI } from '@/modules/providers/OpenAIProvider';

export default function ChatScreen() {
  const { settings } = useSettings();
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const [out, setOut] = useState('');
  const [provider, setProvider] = useState(settings.activeProvider);

  const callProvider = async () => {
    const p = provider;
    let ans = '';
    if (p === 'grok') ans = await chatGrok(input, code);
    else if (p === 'claude') ans = await chatClaude(input, code);
    else if (p === 'qwen') ans = await chatQwen(input, code);
    else if (p === 'deepseek') ans = await chatDeepseek(input, code);
    else if (p === 'gemini') ans = await chatGemini(input, code);
    else ans = await chatOpenAI(input, code);
    setOut(ans);
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <SegmentedButtons
        value={provider}
        onValueChange={(v: any) => setProvider(v)}
        buttons={[
          { value: 'grok', label: 'Grok' },
          { value: 'claude', label: 'Claude' },
          { value: 'qwen', label: 'Qwen' },
          { value: 'deepseek', label: 'Deepseek' },
          { value: 'gemini', label: 'Gemini' },
          { value: 'openai', label: 'OpenAI' }
        ]}
      />
      <TextInput label="Prompt / Aufgabe" value={input} onChangeText={setInput} mode="outlined" multiline style={{ marginTop: 12 }} />
      <TextInput label="Sourcecode (optional)" value={code} onChangeText={setCode} mode="outlined" multiline style={{ marginTop: 12, minHeight: 160 }} />
      <Button mode="contained" style={{ marginTop: 12 }} onPress={callProvider}>Senden</Button>
      {out ? <Text style={{ marginTop: 16 }}>{out}</Text> : null}
    </ScrollView>
  );
}

