import JSZip from 'jszip';

export async function packFiles(files: { path: string, content: string | Uint8Array }[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const f of files) zip.file(f.path, f.content);
  return await zip.generateAsync({ type: 'uint8array' });
}

