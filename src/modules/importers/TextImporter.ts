export function importFromText(text:string):{files:{path:string,content:string}[],detectedName?:string}{
  const files=[{path:'App.tsx',content:text}];
  const m=text.match(/export default function\s+([A-Za-z0-9_]+)/);
  return { files, detectedName: m ? m[1] : undefined };
}


