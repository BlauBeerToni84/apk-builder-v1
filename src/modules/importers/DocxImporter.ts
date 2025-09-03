import PizZip from 'pizzip';

export async function importFromDocx(bytes: Uint8Array): Promise<{ files: { path: string, content: string }[], detectedName?: string }> {
  const zip = new PizZip(bytes as any);
  const docXml = zip.file('word/document.xml')?.asText();
  if (!docXml) {
    return { files: [{ path: 'App.tsx', content: '// (Leeres DOCX oder kein document.xml gefunden)' }], detectedName: undefined };
  }
  const text = (docXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || []).map(x => x.replace(/<\/?w:t[^>]*>/g, '')).join('');
  const codeBlocks = [...text.matchAll(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g)].map(m => m[1]);
  let merged = '';
  if (codeBlocks.length > 0) {
    merged = codeBlocks.join('\n\n// ---- next block ----\n\n');
  } else {
    merged = `/* Extracted from DOCX:\n${text}\n*/\n\nexport default function App(){return null;}\n`;
  }
  return { files: [{ path: 'App.tsx', content: merged }], detectedName: undefined };
}

