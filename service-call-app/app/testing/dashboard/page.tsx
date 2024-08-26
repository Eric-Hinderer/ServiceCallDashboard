"use client";
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import db from '@/lib/firebase'; // Import your Firestore db

// Define the structure of a Service Call
interface ServiceCall {
  id: string;
  date: { seconds: number; nanoseconds: number }; // Assuming Firestore timestamp
  location: string;
  whoCalled: string;
  machine: string;
  reportedProblem: string;
  takenBy: string;
  notes: string;
  status: string;
}

export default function ServiceCalls() {
  // Use the ServiceCall type in useState
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);

  useEffect(() => {
    // Set up Firestore onSnapshot listener for real-time updates
    const q = query(collection(db, "serviceCalls"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedServiceCalls = snapshot.docs.map((doc) => ({
          id: doc.id, // Include the document ID
          ...doc.data() // Spread the document's data
        } as ServiceCall));// Ensure the returned object is typed as ServiceCall
      
      setServiceCalls(updatedServiceCalls); // Update state with new data
    });

    // Cleanup listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Service Calls</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Who Called</th>
            <th>Machine</th>
            <th>Reported Problem</th>
            <th>Taken By</th>
            <th>Notes</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {serviceCalls.map((serviceCall) => (
            <tr key={serviceCall.id}>
              <td>{new Date(serviceCall.date.seconds * 1000).toLocaleString()}</td>
              <td>{serviceCall.location}</td>
              <td>{serviceCall.whoCalled}</td>
              <td>{serviceCall.machine}</td>
              <td>{serviceCall.reportedProblem}</td>
              <td>{serviceCall.takenBy}</td>
              <td>{serviceCall.notes}</td>
              <td>{serviceCall.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
