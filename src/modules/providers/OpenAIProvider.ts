import Constants from 'expo-constants';

export async function chatOpenAI(prompt: string, code?: string): Promise<string> {
  const key = (Constants.expoConfig?.extra as any)?.OPENAI_API_KEY || '';
  const base = (Constants.expoConfig?.extra as any)?.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = (Constants.expoConfig?.extra as any)?.OPENAI_MODEL || 'gpt-4o-mini';
  if (!key) throw new Error('OPENAI_API_KEY missing');
  const payload = {
    model,
    messages: [
      { role: 'system', content: 'You are an AI assistant that helps build React Native apps using Expo/EAS. Always propose concrete code fixes and explain briefly.' },
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
  if (!res.ok) throw new Error('OpenAI error ' + res.status);
  const j = await res.json();
  return j.choices?.[0]?.message?.content || '';
}

