import Constants from 'expo-constants';

export async function chatClaude(prompt: string, code?: string): Promise<string> {
  const key = (Constants.expoConfig?.extra as any)?.ANTHROPIC_API_KEY || '';
  const base = (Constants.expoConfig?.extra as any)?.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
  const model = (Constants.expoConfig?.extra as any)?.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
  if (!key) throw new Error('ANTHROPIC_API_KEY missing');
  const res = await fetch(base + '/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: 'You are a precise build orchestrator. You generate step-by-step, safe build plans and concrete file patches.',
      messages: [{ role: 'user', content: prompt + (code ? "\n\n<CODE>\n" + code + "\n</CODE>" : '') }],
    }),
  });
  if (!res.ok) throw new Error('Claude error ' + res.status);
  const j = await res.json();
  return j.content?.[0]?.text || '';
}

