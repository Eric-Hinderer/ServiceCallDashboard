"use client";

import { useEffect, useRef, useState } from "react";
import db from "@/lib/firebase";
import { subscribeToServiceCalls, type ServiceCallScope } from "./repository";
import type { ServiceCall } from "./model";

export function useServiceCalls(
  scope: ServiceCallScope,
  subscriberKey: string | null,
  onAdded?: (call: ServiceCall) => void,
) {
  const [state, setState] = useState<{
    calls: ServiceCall[];
    loading: boolean;
    error: string | null;
    key: string | null;
    scope: ServiceCallScope;
  }>({
    calls: [],
    loading: !!subscriberKey,
    error: null,
    key: subscriberKey,
    scope,
  });
  const onAddedRef = useRef(onAdded);
  useEffect(() => {
    onAddedRef.current = onAdded;
  }, [onAdded]);

  useEffect(() => {
    setState({
      calls: [],
      loading: !!subscriberKey,
      error: null,
      key: subscriberKey,
      scope,
    });
    if (!subscriberKey) return;
    let active = true;
    const unsubscribe = subscribeToServiceCalls(
      db,
      scope,
      (calls) => {
        if (active)
          setState({
            calls,
            loading: false,
            error: null,
            key: subscriberKey,
            scope,
          });
      },
      (error) => {
        console.error("Error loading service calls:", error);
        if (active)
          setState({
            calls: [],
            loading: false,
            error: "Couldn't load service calls.",
            key: subscriberKey,
            scope,
          });
      },
      (call) => {
        if (active) onAddedRef.current?.(call);
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [scope, subscriberKey]);

  // Do not expose the previous user's records during an account/scope change.
  if (state.key !== subscriberKey || state.scope !== scope) {
    return { calls: [], loading: !!subscriberKey, error: null };
  }
  return state;
}
