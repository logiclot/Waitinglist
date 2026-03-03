"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toggleSavedSolution, getSavedSolutions } from "@/actions/saved";

interface SavedSolutionsContextType {
  savedIds: Set<string>;
  toggleSaved: (solutionId: string) => Promise<boolean>;
  loading: boolean;
}

const SavedSolutionsContext = createContext<SavedSolutionsContextType>({
  savedIds: new Set(),
  toggleSaved: async () => false,
  loading: true,
});

export function SavedSolutionsProvider({ children }: { children: ReactNode }) {
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

  const toggleSaved = useCallback(async (solutionId: string) => {
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
      return false;
    }

    return true;
  }, [savedIds]);

  return (
    <SavedSolutionsContext.Provider value={{ savedIds, toggleSaved, loading }}>
      {children}
    </SavedSolutionsContext.Provider>
  );
}

export function useSavedSolutionsContext() {
  return useContext(SavedSolutionsContext);
}
