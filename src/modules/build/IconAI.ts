import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

export async function generateIconPng(prompt: string, resultPath: string): Promise<string> {
  const extra = (Constants.expoConfig?.extra as any) || {};
  const key = extra.OPENAI_API_KEY;
  const base = extra.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = extra.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  if (!key) throw new Error('OPENAI_API_KEY fehlt (app.json → expo.extra).');
  const res = await fetch(base + '/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({ model, prompt, size: '1024x1024', response_format: 'b64_json' }),
  });
  if (!res.ok) throw new Error('OpenAI Images Fehler: ' + res.status);
  const j = await res.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) throw new Error('Kein Bild erhalten');
  await FileSystem.writeAsStringAsync(resultPath, b64, { encoding: FileSystem.EncodingType.Base64 });
  return resultPath;
}

