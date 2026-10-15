"use client";

import { useEffect, useState } from "react";
import db from "@/lib/firebase";
import { DEFAULT_TECHNICIANS, subscribeToTechnicians } from "./technicians";

export function useTechnicians(): string[] {
  const [names, setNames] = useState<string[]>(DEFAULT_TECHNICIANS);

  useEffect(
    () =>
      subscribeToTechnicians(db, setNames, (error) =>
        console.error("Error loading technicians, using defaults:", error)
      ),
    []
  );

  return names;
}
