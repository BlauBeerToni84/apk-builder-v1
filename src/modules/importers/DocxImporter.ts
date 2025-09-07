import JSZip from 'jszip';
export async function importFromDocx(bytes:Uint8Array):Promise<{files:{path:string,content:string}[],detectedName?:string}>{
  try{
    const zip=await JSZip.loadAsync(bytes);
    const entry=zip.file("word/document.xml");
    if(!entry) return { files:[{path:
'App.tsx
',content:
'// DOCX had no word/document.xml
'}] };
    const xml=await entry.async("text");
    const text=xml.replace(/<[^>]+>/g,
'\n
').replace(/&amp;/g,
'&
').replace(/&lt;/g,
'<
').replace(/&gt;/g,
'>
').replace(/\n{2,}/g,
'\n
');
    const codeBlocks=[...text.matchAll(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g)].map(m=>m[1]);
    const merged=codeBlocks.length?codeBlocks.join(
'\n\n// ---- next block ----\n\n
'):`/* Extracted from DOCX */\nexport default function App(){return null;}`;
    return { files:[{ path:
'App.tsx
', content: merged }], detectedName: undefined };
  }catch{
    return { files:[{ path:
'App.tsx
', content:
'// DOCX parsing failed
' }], detectedName: undefined };
  }
}


