"use server";

import db from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { cache } from "react";
import { FIRESTORE_COLLECTION } from "@/lib/constants";

export const getData = cache(async (key: string) => {
  try {
    if (!key || typeof key !== 'string') {
      return null;
    }

    const docRef = doc(db, FIRESTORE_COLLECTION, key);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return null;
    }

    return docSnapshot.data();
  } catch (error) {
    console.error('Error fetching service call data:', error);
    return null;
  }
});
