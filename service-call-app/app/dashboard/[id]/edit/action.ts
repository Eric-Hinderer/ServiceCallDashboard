"use server";

import db from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { cache } from "react";

// Cache the getData function to prevent duplicate database calls
export const getData = cache(async (key: string) => {
  try {
    if (!key || typeof key !== 'string') {
      console.error('Invalid key provided to getData:', key);
      return null;
    }

    const docRef = doc(db, "ServiceCalls", key);
    const docSnapshot = await getDoc(docRef);
    
    if (!docSnapshot.exists()) {
      console.log('No document found with key:', key);
      return null;
    }
    
    return docSnapshot.data();
  } catch (error) {
    console.error('Error fetching service call data:', error);
    return null;
  }
});
