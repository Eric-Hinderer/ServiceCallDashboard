import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Firestore,
  type QueryConstraint,
} from "firebase/firestore";
import {
  createServiceCallSchema,
  deserializeServiceCall,
  serviceCallPatchSchema,
  Status,
  type CreateServiceCallInput,
  type ServiceCall,
  type ServiceCallPatch,
} from "./model";

const COLLECTION = "ServiceCalls";
export type ServiceCallScope = "active" | "all";

function callsQuery(db: Firestore, scope: ServiceCallScope) {
  const constraints: QueryConstraint[] =
    scope === "active"
      ? [where("status", "in", [Status.OPEN, Status.IN_PROGRESS])]
      : [];
  return query(
    collection(db, COLLECTION),
    ...constraints,
    orderBy("date", "desc"),
  );
}

export async function listServiceCalls(db: Firestore) {
  const snapshot = await getDocs(callsQuery(db, "all"));
  return snapshot.docs.map((record) =>
    deserializeServiceCall(record.id, record.data()),
  );
}

export async function findServiceCall(db: Firestore, id: string) {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  return snapshot.exists()
    ? deserializeServiceCall(snapshot.id, snapshot.data())
    : null;
}

export function subscribeToServiceCalls(
  db: Firestore,
  scope: ServiceCallScope,
  onData: (calls: ServiceCall[]) => void,
  onError: (error: Error) => void,
  onAdded?: (call: ServiceCall) => void,
) {
  let initial = true;
  return onSnapshot(
    callsQuery(db, scope),
    (snapshot) => {
      onData(
        snapshot.docs.map((record) =>
          deserializeServiceCall(record.id, record.data()),
        ),
      );
      if (!initial && onAdded) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added")
            onAdded(deserializeServiceCall(change.doc.id, change.doc.data()));
        });
      }
      initial = false;
    },
    onError,
  );
}

export async function createServiceCall(
  db: Firestore,
  input: CreateServiceCallInput,
) {
  const data = createServiceCallSchema.parse(input);
  const reference = doc(collection(db, COLLECTION));
  // One write: listeners never see a partially initialized document.
  await setDoc(reference, {
    ...data,
    id: reference.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateServiceCall(
  db: Firestore,
  id: string,
  patch: ServiceCallPatch,
) {
  const data = serviceCallPatchSchema.parse(patch);
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function removeServiceCall(db: Firestore, id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function listServiceCallOptions(
  db: Firestore,
  field: "location" | "machine",
) {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy(field)),
  );
  return Array.from(
    new Set(
      snapshot.docs
        .map((record) => record.data()[field])
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.toLowerCase().trim())
        .filter(Boolean),
    ),
  );
}
