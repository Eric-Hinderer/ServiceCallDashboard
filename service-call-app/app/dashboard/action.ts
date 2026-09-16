"use server";

import db from "@/lib/firebase";
import {
  listServiceCalls,
  listServiceCallOptions,
  removeServiceCall,
} from "@/lib/service-calls/repository";

export async function getLocations() {
  return listServiceCallOptions(db, "location");
}

export async function getMachines() {
  return listServiceCallOptions(db, "machine");
}

export async function deleteServiceCall(id: string) {
  try {
    await removeServiceCall(db, id);
    return { success: true, message: "Service call deleted successfully." };
  } catch (error) {
    console.error("Error deleting service call:", error);
    return { success: false, message: "Error deleting service call." };
  }
}

export async function getServiceCalls() {
  return listServiceCalls(db);
}
