"use server";

import db from "@/lib/firebase";
import { findServiceCall } from "@/lib/service-calls/repository";
import { cache } from "react";

export const getData = cache(async (id: string) => {
  if (!id) return null;
  return findServiceCall(db, id);
});
