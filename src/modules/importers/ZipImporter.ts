export type ImportResult = { files: { path: string; content: string }[]; detectedName?: string };
export async function importFromZip(_: Blob | ArrayBuffer | Uint8Array): Promise<ImportResult> {
  return { files: [{ path: "App.tsx", content: "export default function App(){return null}" }] };
}
export default importFromZip;
