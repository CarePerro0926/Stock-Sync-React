// src/hooks/useRealtimeSync.js
import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

const useRealtimeSync = (table, setState) => {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-sync`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table
      }, ({ eventType, new: nuevo, old: anterior }) => {
        setState(prev => {
          if (eventType === 'INSERT') {
            return [...prev, nuevo];
          }
          if (eventType === 'UPDATE') {
            return prev.map(item => item.id === nuevo.id ? nuevo : item);
          }
          if (eventType === 'DELETE') {
            return prev.filter(item => item.id !== anterior.id);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, setState]);
};

export default useRealtimeSync;