import { Octokit } from '@octokit/core';
import * as SecureStore from 'expo-secure-store';

async function getToken(): Promise<string> {
  const s = await SecureStore.getItemAsync('settings');
  if (!s) throw new Error('settings missing');
  const j = JSON.parse(s);
  if (!j.githubToken) throw new Error('GitHub token missing in Settings');
  return j.githubToken as string;
}

export async function getOctokit(): Promise<Octokit> {
  return new Octokit({ auth: await getToken() });
}

export async function ensureRepo(owner: string, repo: string): Promise<string> {
  const octo = await getOctokit();
  try {
    const res = await octo.request('GET /repos/{owner}/{repo}', { owner, repo });
    return (res.data as any).html_url as string;
  } catch {
    const res = await octo.request('POST /user/repos', { name: repo, private: true, auto_init: true });
    return (res.data as any).html_url as string;
  }
}

export async function putFile(owner: string, repo: string, path: string, contentBase64: string, message: string) {
  const octo = await getOctokit();
  let sha: string | undefined = undefined;
  try {
    const r = await octo.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path });
    sha = (r.data as any).sha;
  } catch {}
  await octo.request('PUT /repos/{owner}/{repo}/contents/{path}', { owner, repo, path, message, content: contentBase64, sha });
}

export async function dispatchWorkflow(owner: string, repo: string, workflow: string, inputs: Record<string, string> = {}) {
  const octo = await getOctokit();
  await octo.request("POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches", {
    owner, repo, workflow_id: workflow, ref: "main", inputs
  });
}

