import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
type SettingsBlob = Partial<{
  githubToken: string; easToken: string; expoProjectId: string; repoOwner: string; repoNamePrefix: string;
  openaiApiKey: string; grokApiKey: string; anthropicApiKey: string; qwenApiKey: string; deepseekApiKey: string; geminiApiKey: string;
}>;
let cache: SettingsBlob | null = null, lastLoad = 0;
async function loadSettings(): Promise<SettingsBlob> {
  const now = Date.now();
  if (cache && now - lastLoad < 5000) return cache;
  try { const raw = await SecureStore.getItemAsync('settings'); cache = raw ? JSON.parse(raw) : {}; } catch { cache = {}; }
  lastLoad = now; return cache!;
}
export async function getTokenByName(name: string): Promise<string> {
  const s = await loadSettings();
  const map: Record<string, keyof SettingsBlob> = {
    GITHUB_TOKEN:"githubToken",EAS_TOKEN:"easToken",OPENAI_API_KEY:"openaiApiKey",GROK_API_KEY:"grokApiKey",
    ANTHROPIC_API_KEY:"anthropicApiKey",QWEN_API_KEY:"qwenApiKey",DEEPSEEK_API_KEY:"deepseekApiKey",GEMINI_API_KEY:"geminiApiKey"
  };
  const key = map[name] || (name as keyof SettingsBlob);
  const val = (s as any)?.[key]; if (val && typeof val === 'string') return val;
  const extra = (Constants.expoConfig?.extra as any) || {}; if (extra[name]) return extra[name];
  return '';
}


