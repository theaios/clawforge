import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createOpenClawClient } from './openclawClient';
import { readStore } from './missionControlStore';

const Ctx = createContext(null);

export function MissionControlProvider({ children }) {
  const client = useMemo(() => createOpenClawClient(), []);
  const [store, setStore] = useState(() => readStore());

  useEffect(() => {
    const sync = () => setStore(readStore());
    window.addEventListener('mc-store-updated', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('mc-store-updated', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      try {
        await client.checkHealth();
        if (!cancelled) setStore(readStore());
      } catch {
        if (!cancelled) setStore(readStore());
      }
    };
    probe();
    const t = setInterval(probe, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [client]);

  const value = useMemo(() => ({ store, client }), [store, client]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMissionControl() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMissionControl must be used inside MissionControlProvider');
  return ctx;
}
