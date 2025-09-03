import Constants from 'expo-constants';

export async function chatQwen(prompt: string, code?: string): Promise<string> {
  const key = (Constants.expoConfig?.extra as any)?.QWEN_API_KEY || '';
  const base = (Constants.expoConfig?.extra as any)?.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const model = (Constants.expoConfig?.extra as any)?.QWEN_MODEL || 'qwen2.5-32b-instruct';
  if (!key) throw new Error('QWEN_API_KEY missing');
  const res = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You optimize code and produce Expo-ready projects. Keep to the point.' },
        { role: 'user', content: prompt + (code ? "\n\n<CODE>\n" + code + "\n</CODE>" : '') },
      ],
    }),
  });
  if (!res.ok) throw new Error('Qwen error ' + res.status);
  const j = await res.json();
  return j.choices?.[0]?.message?.content || '';
}

