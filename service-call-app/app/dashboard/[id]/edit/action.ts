"use server";

import db from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getData(key: string) {
    const docRef = doc(db, "ServiceCalls", key);
    const test = await getDoc(docRef);
    return test.data();

}