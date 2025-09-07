import { getTokenByName } from '@/utils/Tokens';
export async function chatOpenAI(prompt:string,code?:string):Promise<string>{
  const key=await getTokenByName("OPENAI_API_KEY"); const model=\u0027gpt-4o-mini\u0027; if(!key) throw new Error("OPENAI_API_KEY missing");
  const res=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:"system",content:"You are an AI assistant that helps build React Native apps using Expo/EAS. Always propose concrete code fixes and explain briefly."},{role:"user",content:prompt+(code?`\n\n<CODE>\n${code}\n</CODE>`:'')}]})});
  if(!res.ok) throw new Error("OpenAI error "+res.status); const j=await res.json(); return j.choices?.[0]?.message?.content||'';
}


