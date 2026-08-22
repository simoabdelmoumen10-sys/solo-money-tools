import { useState, useEffect, useCallback } from 'react';
import { loadDB, saveDB, DBState } from '../utils/db';

export function useDB() {
  const [db, setDb] = useState<DBState>(() => loadDB());

  const refresh = useCallback(() => {
    setDb(loadDB());
  }, []);

  useEffect(() => {
    const handleStorage = () => refresh();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refresh]);

  const updateDB = useCallback((updater: (prev: DBState) => DBState) => {
    setDb(prev => {
      const next = updater(prev);
      saveDB(next);
      return next;
    });
  }, []);

  return { db, refresh, updateDB };
}