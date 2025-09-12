"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import db from "@/lib/firebase";

interface UseLocationsReturn {
  locations: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const snapshot = await getDocs(collection(db, "Locations"));
      const locationList = snapshot.docs.map((doc) => doc.data().name as string);
      
      setLocations(locationList);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchLocations();
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return { locations, loading, error, refetch };
}

interface UseMachinesReturn {
  machines: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMachines(): UseMachinesReturn {
  const [machines, setMachines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const snapshot = await getDocs(collection(db, "Machines"));
      const machineList = snapshot.docs.map((doc) => doc.data().name as string);
      
      setMachines(machineList);
    } catch (err) {
      console.error("Error fetching machines:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch machines");
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchMachines();
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return { machines, loading, error, refetch };
}

interface UseLocationsAndMachinesReturn {
  locations: string[];
  machines: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLocationsAndMachines(): UseLocationsAndMachinesReturn {
  const [locations, setLocations] = useState<string[]>([]);
  const [machines, setMachines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [locationsSnapshot, machinesSnapshot] = await Promise.all([
        getDocs(collection(db, "Locations")),
        getDocs(collection(db, "Machines")),
      ]);

      const locationList = locationsSnapshot.docs.map((doc) => doc.data().name as string);
      const machineList = machinesSnapshot.docs.map((doc) => doc.data().name as string);

      setLocations(locationList);
      setMachines(machineList);
    } catch (err) {
      console.error("Error fetching locations and machines:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch locations and machines");
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { locations, machines, loading, error, refetch };
}
