import { getTokenByName } from '@/utils/Tokens';
export async function chatGemini(prompt:string,code?:string):Promise<string>{
  const key=await getTokenByName('GEMINI_API_KEY'); if(!key) throw new Error('GEMINI_API_KEY missing');
  const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt+(code?`\n\n<CODE>\n${code}\n</CODE>`:'')}]}]})});
  if(!res.ok) throw new Error('Gemini error '+res.status); const j=await res.json(); return j.candidates?.[0]?.content?.parts?.[0]?.text||'';
}


