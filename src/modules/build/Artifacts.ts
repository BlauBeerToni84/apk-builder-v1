import { getOctokit } from './GitHub';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

export type Artifact = {
  id: number;
  name: string;
  size_in_bytes: number;
  archive_download_url: string;
  created_at: string;
  expires_at: string;
};

export async function listArtifacts(owner: string, repo: string, runId?: number): Promise<Artifact[]> {
  const octo = await getOctokit();
  if (runId) {
    const r = await octo.request("GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts", { owner, repo, run_id: runId, per_page: 50 });
    return (r.data.artifacts || []) as any;
  }
  const r2 = await octo.request("GET /repos/{owner}/{repo}/actions/artifacts", { owner, repo, per_page: 50 });
  return (r2.data.artifacts || []) as any;
}

async function getGitHubToken(): Promise<string> {
  const s = await SecureStore.getItemAsync('settings');
  if (!s) throw new Error('settings missing');
  const j = JSON.parse(s);
  if (!j.githubToken) throw new Error('GitHub token missing');
  return j.githubToken as string;
}

export async function downloadArtifactZip(owner: string, repo: string, artifactId: number, targetPath: string): Promise<string> {
  const token = await getGitHubToken();
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`;
  const res = await FileSystem.downloadAsync(url, targetPath, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  return res.uri;
}

