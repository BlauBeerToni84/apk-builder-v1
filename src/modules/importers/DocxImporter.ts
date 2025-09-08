export type ImportResult = { files: { path: string; content: string }[]; detectedName?: string };
export async function importDocx(_: Blob | ArrayBuffer | Uint8Array): Promise<ImportResult> {
  const content = `/* Extracted from DOCX (stub) */
export default function App(){ return null }`;
  return { files: [{ path: "App.tsx", content }], detectedName: undefined };
}
export { importDocx as importFromDocx };
export default importDocx;
