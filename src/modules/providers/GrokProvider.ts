import { getTokenByName } from '@/utils/Tokens';
export async function chatGrok(prompt:string,code?:string):Promise<string>{
  const key=await getTokenByName('GROK_API_KEY'); const model='grok-code-fast-1'; if(!key) throw new Error('GROK_API_KEY missing');
  const res=await fetch('https://api.x.ai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:'system',content:'You help build and debug Expo projects. Keep responses concise and provide exact patches.'},{role:'user',content:prompt+(code?`\n\n<CODE>\n${code}\n</CODE>`:'')}]})});
  if(!res.ok) throw new Error('Grok error '+res.status); const j=await res.json(); return j.choices?.[0]?.message?.content||'';
}


