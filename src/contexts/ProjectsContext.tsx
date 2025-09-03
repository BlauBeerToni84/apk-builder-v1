import React, { createContext, useContext, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';

export interface ProjectEntry {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: 'idle' | 'building' | 'success' | 'error';
  lastError?: string;
  provider?: string;
  repoUrl?: string;
  easBuildUrl?: string;
  codeSnapshotPath?: string;
}

type Ctx = {
  projects: ProjectEntry[];
  upsert: (p: ProjectEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
  byId: (id: string) => ProjectEntry | undefined;
  refresh: () => Promise<void>;
  baseDir: string;
};

const ProjectsContext = createContext<Ctx | undefined>(undefined);
const PROJECTS_FILE = FileSystem.documentDirectory! + 'k1w1/projects.json';

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const baseDir = FileSystem.documentDirectory! + 'k1w1/';

  const refresh = async () => {
    await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
    const info = await FileSystem.getInfoAsync(PROJECTS_FILE);
    if (!info.exists) {
      await FileSystem.writeAsStringAsync(PROJECTS_FILE, JSON.stringify([]));
      setProjects([]);
      return;
    }
    const raw = await FileSystem.readAsStringAsync(PROJECTS_FILE);
    setProjects(JSON.parse(raw));
  };

  useEffect(() => {
    refresh();
  }, []);

  const persist = async (list: ProjectEntry[]) => {
    setProjects(list);
    await FileSystem.writeAsStringAsync(PROJECTS_FILE, JSON.stringify(list, null, 2));
  };

  const upsert = async (p: ProjectEntry) => {
    const list = projects.slice();
    const idx = list.findIndex(x => x.id === p.id);
    if (idx >= 0) list[idx] = p;
    else list.push(p);
    await persist(list);
  };

  const remove = async (id: string) => {
    const list = projects.filter(x => x.id !== id);
    await persist(list);
  };

  const byId = (id: string) => projects.find(x => x.id === id);

  return (
    <ProjectsContext.Provider value={{ projects, upsert, remove, byId, refresh, baseDir }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects outside provider');
  return ctx;
};

