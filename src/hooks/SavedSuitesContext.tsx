"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "logiclot_saved_suites";

interface SavedSuitesContextType {
  savedIds: Set<string>;
  toggleSaved: (suiteId: string) => void;
}

const SavedSuitesContext = createContext<SavedSuitesContextType>({
  savedIds: new Set(),
  toggleSaved: () => {},
});

export function SavedSuitesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const toggleSaved = useCallback((suiteId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(suiteId)) {
        next.delete(suiteId);
      } else {
        next.add(suiteId);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  return (
    <SavedSuitesContext.Provider value={{ savedIds, toggleSaved }}>
      {children}
    </SavedSuitesContext.Provider>
  );
}

export function useSavedSuitesContext() {
  return useContext(SavedSuitesContext);
}
