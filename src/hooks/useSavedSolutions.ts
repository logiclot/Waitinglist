import { useState, useEffect } from 'react';
import { toggleSavedSolution, getSavedSolutions } from '@/actions/saved';

export function useSavedSolutions() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const ids = await getSavedSolutions();
      setSavedIds(new Set(ids));
      setLoading(false);
    };
    fetchSaved();
  }, []);

  const toggleSaved = async (solutionId: string) => {
    // Optimistic update
    const isSaved = savedIds.has(solutionId);
    const newSavedIds = new Set(savedIds);
    if (isSaved) {
      newSavedIds.delete(solutionId);
    } else {
      newSavedIds.add(solutionId);
    }
    setSavedIds(newSavedIds);

    const result = await toggleSavedSolution(solutionId);
    
    if (result.error) {
      // Rollback
      setSavedIds(savedIds);
      return false; // Indicating failure/auth required
    }
    
    return true;
  };

  return { savedIds, toggleSaved, loading };
}
