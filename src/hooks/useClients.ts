import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { TenantClient } from '../types';

export function useClients() {
  const [clients, setClients] = useState<TenantClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, "clients"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const clientData = snapshot.docs.map(doc => ({
          ...doc.data(),
          domain: doc.id
        })) as TenantClient[];
        setClients(clientData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching clients:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { clients, loading, error };
}
