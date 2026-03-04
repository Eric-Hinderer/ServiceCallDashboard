import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { ServiceCall } from "@/app/(definitions)/definitions";

/**
 * Transforms a Firestore document snapshot into a ServiceCall object,
 * converting Firestore Timestamps to JavaScript Dates.
 */
export function docToServiceCall(doc: QueryDocumentSnapshot<DocumentData>): ServiceCall {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date: data.date ? data.date.toDate() : null,
    createdAt: data.createdAt ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
  } as ServiceCall;
}

/**
 * Transforms an array of Firestore document snapshots into ServiceCall objects.
 */
export function docsToServiceCalls(
  docs: QueryDocumentSnapshot<DocumentData>[]
): ServiceCall[] {
  return docs.map(docToServiceCall);
}
