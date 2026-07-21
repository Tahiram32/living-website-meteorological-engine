import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { PipelineRun } from '../types';

export function useRuns(limitCount = 50) {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "runs"),
      orderBy("startedAt", "desc"),
      limit(limitCount)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const runData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as PipelineRun[];
        setRuns(runData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching runs:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitCount]);

  return { runs, loading, error };
}
