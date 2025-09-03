import { getOctokit } from './GitHub';

export type WorkflowRun = {
  id: number;
  status: string;
  conclusion?: string;
  html_url: string;
  created_at: string;
  updated_at: string;
};

export type JobSummary = {
  id: number;
  name: string;
  status: string;
  conclusion?: string;
  started_at?: string;
  completed_at?: string;
};

export async function listLatestRuns(owner: string, repo: string, perPage = 5) {
  const octo = await getOctokit();
  const r = await octo.request('GET /repos/{owner}/{repo}/actions/runs', { owner, repo, per_page: perPage });
  return (r.data.workflow_runs || []).map((w: any) => ({
    id: w.id, status: w.status, conclusion: w.conclusion, html_url: w.html_url, created_at: w.created_at, updated_at: w.updated_at,
  }));
}

export async function listJobsForRun(owner: string, repo: string, runId: number) {
  const octo = await getOctokit();
  const r = await octo.request("GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs", { owner, repo, run_id: runId, per_page: 50 });
  return (r.data.jobs || []).map((j: any) => ({
    id: j.id, name: j.name, status: j.status, conclusion: j.conclusion, started_at: j.started_at, completed_at: j.completed_at,
  }));
}

export async function getJobLogsUrl(owner: string, repo: string, jobId: number): Promise<string> {
  const octo = await getOctokit();
  const r = await octo.request("GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs", {
    owner, repo, job_id: jobId, request: { redirect: "manual" as any }
  });
  return (r as any).headers?.location || '';
}

