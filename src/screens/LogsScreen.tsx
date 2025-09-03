import React, { useEffect, useState } from 'react';
import { ScrollView, Linking } from 'react-native';
import { Button, Text, Divider } from 'react-native-paper';
import { listLatestRuns, listJobsForRun, getJobLogsUrl, WorkflowRun, JobSummary } from '@/modules/build/Logs';

function parseOwnerRepo(repoUrl?: string): { owner: string, repo: string } | null {
  if (!repoUrl) return null;
  const m = repoUrl.match(/github\.com\/(.+?)\/(.+?)(\/|$)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

export default function LogsScreen({ route, navigation }: any) {
  const repoUrl: string | undefined = route?.params?.repoUrl;
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [jobs, setJobs] = useState<Record<number, JobSummary[]>>({});
  const [status, setStatus] = useState('Lade...');

  const or = parseOwnerRepo(repoUrl);
  const owner = or?.owner || '';
  const repo = or?.repo || '';

  const refresh = async () => {
    if (!owner || !repo) {
      setStatus('Repo nicht erkennbar.');
      return;
    }
    try {
      setStatus('Runs holen ...');
      const r = await listLatestRuns(owner, repo, 5);
      setRuns(r);
      setStatus(`Runs: ${r.length}`);
      const jmap: Record<number, JobSummary[]> = {};
      for (const run of r) {
        const js = await listJobsForRun(owner, repo, run.id);
        jmap[run.id] = js;
      }
      setJobs(jmap);
    } catch (e: any) {
      setStatus('Fehler: ' + e.message);
    }
  };

  const openLogs = async (jobId: number) => {
    try {
      const url = await getJobLogsUrl(owner, repo, jobId);
      url ? Linking.openURL(url) : setStatus('Keine Log-URL (CORS).');
    } catch (e: any) {
      setStatus('Log-URL Fehler: ' + e.message);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleLarge">Live-Logs</Text>
      <Text>{owner}/{repo}</Text>
      <Button style={{ marginTop: 8 }} mode="outlined" onPress={refresh}>Aktualisieren</Button>
      <Text style={{ marginTop: 8 }}>{status}</Text>
      <Divider style={{ marginVertical: 12 }} />
      {runs.map(run => (
        <React.Fragment key={run.id}>
          <Text variant="titleMedium">Run #{run.id} – {run.status}{run.conclusion ? ` (${run.conclusion})` : ''}</Text>
          <Text onPress={() => Linking.openURL(run.html_url)} style={{ color: '#2e6ddf' }}>{run.html_url}</Text>
          <Button mode="text" onPress={() => navigation.navigate('Artifacts', { repoUrl, runId: run.id })}>Artefakte zu diesem Run anzeigen</Button>
          {(jobs[run.id] || []).map(job => (
            <React.Fragment key={job.id}>
              <Text>• {job.name} – {job.status}{job.conclusion ? ` (${job.conclusion})` : ''}</Text>
              <Button compact style={{ marginVertical: 4 }} onPress={() => openLogs(job.id)}>Logs öffnen</Button>
            </React.Fragment>
          ))}
          <Divider style={{ marginVertical: 12 }} />
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

