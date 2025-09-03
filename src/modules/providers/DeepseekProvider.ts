import Constants from 'expo-constants';

export async function chatDeepseek(prompt: string, code?: string): Promise<string> {
  const key = (Constants.expoConfig?.extra as any)?.DEEPSEEK_API_KEY || '';
  const base = (Constants.expoConfig?.extra as any)?.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const model = (Constants.expoConfig?.extra as any)?.DEEPSEEK_MODEL || 'deepseek-chat';
  if (!key) throw new Error('DEEPSEEK_API_KEY missing');
  const res = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You stream concise, actionable build steps and fix Gradle/EAS errors.' },
        { role: 'user', content: prompt + (code ? "\n\n<CODE>\n" + code + "\n</CODE>" : '') },
      ],
      stream: false,
    }),
  });
  if (!res.ok) throw new Error('Deepseek error ' + res.status);
  const j = await res.json();
  return j.choices?.[0]?.message?.content || '';
}

