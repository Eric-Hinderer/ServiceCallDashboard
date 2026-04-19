import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { firebaseApp } from "./firebaseConfig";

let db: Firestore;

if (typeof window !== "undefined") {
  try {
    db = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    db = getFirestore(firebaseApp);
  }
} else {
  db = getFirestore(firebaseApp);
}

export default db;
