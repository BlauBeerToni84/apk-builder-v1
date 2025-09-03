import Constants from 'expo-constants';

export async function chatGrok(prompt: string, code?: string): Promise<string> {
  const key = (Constants.expoConfig?.extra as any)?.GROK_API_KEY || '';
  const base = (Constants.expoConfig?.extra as any)?.GROK_BASE_URL || 'https://api.x.ai/v1';
  const model = (Constants.expoConfig?.extra as any)?.GROK_MODEL || 'grok-2-latest';
  if (!key) throw new Error('GROK_API_KEY missing');
  const payload = {
    model,
    messages: [
      { role: 'system', content: 'You help build and debug Expo projects. Keep responses concise and provide exact patches.' },
      { role: 'user', content: prompt + (code ? "\n\n<CODE>\n" + code + "\n</CODE>" : '') },
    ],
  };
  const res = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Grok error ' + res.status);
  const j = await res.json();
  return j.choices?.[0]?.message?.content || '';
}

