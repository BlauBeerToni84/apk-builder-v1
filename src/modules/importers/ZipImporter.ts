import JSZip from 'jszip';

export async function importFromZip(bytes: Uint8Array): Promise<{ files: { path: string, content: string }[], detectedName?: string }> {
  const zip = await JSZip.loadAsync(bytes);
  const out: { path: string, content: string }[] = [];
  let detectedName: string | undefined;
  const entries = Object.keys(zip.files);
  for (const p of entries) {
    const f = zip.files[p];
    if (f.dir) continue;
    const content = await f.async('text');
    out.push({ path: p, content });
    if (!detectedName && /app\.json$/i.test(p)) {
      try {
        const j = JSON.parse(content);
        detectedName = j?.expo?.name || j?.name;
      } catch {}
    }
  }
  return { files: out, detectedName };
}

