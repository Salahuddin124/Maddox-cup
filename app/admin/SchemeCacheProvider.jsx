"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { hydrateScheme, SCHEME_CACHE_KEY, schemeStore } from "./schemeStore";

const writeCache = () => {
  try {
    window.localStorage.setItem(
      SCHEME_CACHE_KEY,
      JSON.stringify(schemeStore.getState().scheme),
    );
  } catch {
    // Private browsing / full storage: the in-memory store still works.
  }
};

export default function SchemeCacheProvider({ children }) {
  useEffect(() => {
    let cached = null;
    try {
      const raw = window.localStorage.getItem(SCHEME_CACHE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch {
      // A corrupt cache just means the bracket starts fresh.
    }

    // Subscribe before hydrating so the restored state is written back too.
    const unsubscribe = schemeStore.subscribe(writeCache);

    if (cached) schemeStore.dispatch(hydrateScheme(cached));
    else writeCache();

    return unsubscribe;
  }, []);

  return <Provider store={schemeStore}>{children}</Provider>;
}
