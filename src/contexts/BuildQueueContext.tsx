import React, { createContext, useContext, useRef, useState } from 'react';
import PQueue from 'p-queue';

export type BuildTask = {
  id: string;
  projectId: string;
  title: string;
  action: () => Promise<void>;
};

type Ctx = {
  queue: PQueue;
  enq: (t: BuildTask) => void;
  running: boolean;
  lastTask?: string;
};

const BuildQueueContext = createContext<Ctx | undefined>(undefined);

export const BuildQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queueRef = useRef(new PQueue({ concurrency: 1 }));
  const [running, setRunning] = useState(false);
  const [lastTask, setLastTask] = useState<string | undefined>(undefined);

  queueRef.current.on('active', () => setRunning(true));
  queueRef.current.on('idle', () => setRunning(false));

  const enq = (t: BuildTask) => {
    queueRef.current.add(async () => {
      setLastTask(t.title);
      await t.action();
    });
  };

  return (
    <BuildQueueContext.Provider value={{ queue: queueRef.current, enq, running, lastTask }}>
      {children}
    </BuildQueueContext.Provider>
  );
};

export const useBuildQueue = () => {
  const ctx = useContext(BuildQueueContext);
  if (!ctx) throw new Error('useBuildQueue outside provider');
  return ctx;
};

