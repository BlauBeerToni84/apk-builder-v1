export type ImportResult = { files: { path: string; content: string }[]; detectedName?: string };
export async function importFromText(text: string): Promise<ImportResult> {
  const content = `/* from text */\nexport default function App(){return null}`;
  return { files: [{ path: "App.tsx", content }], detectedName: undefined };
}
export default importFromText;
