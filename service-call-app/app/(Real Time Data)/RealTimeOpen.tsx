"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ServiceCall } from "../(definitions)/definitions";
import db from "@/lib/firebase";
import ServiceCallModalButton from "@/components/ServiceCallModalButton";
import Status from "../../components/Status";
import TakenBy from "@/components/TakenBy";
import { useAuth } from "@/components/AuthContext";
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
} from "@mui/material";

import Grid from "@mui/material/Grid2";
import { getMachines, getLocations } from "@/app/dashboard/action";

const RealTimeOpenInProgress = () => {
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const { user: currentUser, signIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "ServiceCalls"),
      where("status", "in", ["OPEN", "IN_PROGRESS"]),
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updatedServiceCalls = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date ? doc.data().date.toDate() : null,
          updatedAt: doc.data().updatedAt
            ? doc.data().updatedAt.toDate()
            : null,
          createdAt: doc.data().createdAt
            ? doc.data().createdAt.toDate()
            : null,
        })) as ServiceCall[];

        setServiceCalls(updatedServiceCalls);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching service calls: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Clean up Firestore subscription on unmount
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const machines = await getMachines();
        setMachines(machines);

        const locations = await getLocations();
        setLocations(locations);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); 

  if (!currentUser) {
    return (
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ marginTop: "2rem" }}
      >
        <Typography variant="h6" align="center" gutterBottom>
          Please sign in to start managing your service calls.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={signIn}
          style={{ marginTop: "1rem" }}
        >
          Sign In with Google
        </Button>
      </Grid>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" marginTop="2rem">
        <CircularProgress />
      </Box>
    );
  }

  return (
    // <div className="p-4 md:p-8">
    //   <ServiceCallModalButton locations={locations} machines={machines} />
    //   <h2 className="text-xl font-semibold mb-6 text-center">
    //     Current Service Calls (Open/In Progress)
    //   </h2>

    //   <div className="hidden md:flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 ">
    //     <div className="bg-green-100 p-4 rounded-lg shadow-md w-full md:w-1/2">
    //       <h3 className="text-lg font-semibold text-green-800">
    //         Open / In Progress
    //       </h3>
    //       <div className="flex items-center space-x-2">
    //         <span className="text-gray-600">Total:</span>
    //         <span className="text-gray-800 font-semibold">{openCalls}</span>
    //       </div>
    //     </div>

    //     <div className="bg-yellow-100 p-4 rounded-lg shadow-md w-full md:w-1/2">
    //       <h3 className="text-lg font-semibold text-yellow-800">Unassigned</h3>
    //       <div className="flex items-center space-x-2">
    //         <span className="text-gray-600">Total:</span>
    //         <span className="text-gray-800 font-semibold">
    //           {unAssignedCalls.length}
    //         </span>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Table Layout for Desktop */}
    //   <div className="hidden md:block mx-auto max-w-6xl">
    //     <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
    //       <thead className="bg-gray-100">
    //         <tr>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Date
    //           </th>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Location
    //           </th>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Who Called
    //           </th>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Machine
    //           </th>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Reported Problem
    //           </th>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Status
    //           </th>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Taken By
    //           </th>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Notes
    //           </th>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Updated At
    //           </th>
    //           <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
    //             Actions
    //           </th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {serviceCalls.map((serviceCall) => (
    //           <tr
    //             key={serviceCall.id}
    //             className={`border border-gray-200 ${
    //               serviceCall.overDue
    //                 ? "bg-red-50 border-2 hover:bg-red-200 transition-colors duration-300 ease-in-out"
    //                 : "hover:bg-gray-50 transition-colors duration-300 ease-in-out"
    //             }`}
    //           >
    //             <td className="py-2 px-4 text-sm text-gray-700">
    //               {serviceCall.date ? serviceCall.date.toLocaleString() : "N/A"}
    //             </td>
    //             <td className="py-2 px-4 text-sm text-gray-700">
    //               {serviceCall.location || "N/A"}
    //             </td>
    //             <td className="py-2 px-4 text-sm text-gray-700">
    //               {serviceCall.whoCalled || "N/A"}
    //             </td>
    //             <td className="py-2 px-4 text-sm text-gray-700">
    //               {serviceCall.machine || "N/A"}
    //             </td>
    //             <td className="py-2 px-4 text-sm text-gray-700">
    //               {serviceCall.reportedProblem || "N/A"}
    //             </td>
    //             <td
    //               className="py-2 px-4 text-sm text-gray-700 break-words"
    //               style={{ width: "125px" }}
    //             >
    //               {serviceCall.id && (
    //                 <Status
    //                   id={serviceCall.id}
    //                   currentStatus={serviceCall.status}
    //                 />
    //               )}
    //             </td>
    //             <td
    //               className="py-2 px-4 text-sm text-gray-700"
    //               style={{ width: "125px" }}
    //             >
    //               <TakenBy
    //                 id={serviceCall.id!}
    //                 currentTakenBy={serviceCall.takenBy}
    //               />
    //             </td>
    //             <td className="py-2 px-4 text-sm text-gray-700 break-words">
    //               {serviceCall.notes || "N/A"}
    //             </td>
    //             <td className="py-2 px-4 text-sm text-gray-700">
    //               {serviceCall.updatedAt
    //                 ? serviceCall.updatedAt.toLocaleString()
    //                 : "N/A"}
    //             </td>
    //             <td className="py-2 px-4 text-sm text-gray-700">
    //               <Link href={`/dashboard/${serviceCall.id}/edit`} passHref>
    //                 <button className="text-blue-500 hover:underline">
    //                   Edit
    //                 </button>
    //               </Link>
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>

    //   {/* Card Layout for Mobile */}
    //   <div className="space-y-4 md:hidden mx-auto max-w-2xl">
    //     {serviceCalls.map((serviceCall) => (
    //       <div
    //         key={serviceCall.id}
    //         className={`border border-gray-200 rounded-lg shadow-md p-6 ${
    //           serviceCall.overDue
    //             ? "bg-red-100 hover:bg-red-200 transition-colors duration-300 ease-in-out"
    //             : "bg-white hover:bg-gray-50 transition-colors duration-300 ease-in-out"
    //         }`}
    //       >
    // <div className="flex justify-between items-center mb-2">
    //   <h3 className="text-lg font-semibold">
    //     {serviceCall.location || "Unknown Location"}
    //   </h3>
    //   <div className="text-sm text-gray-600">
    //     {serviceCall.date ? serviceCall.date.toLocaleString() : "N/A"}
    //   </div>
    // </div>
    //         <div className="mt-2 space-y-2">
    // <div>
    //   <strong>Who Called:</strong> {serviceCall.whoCalled || "N/A"}
    // </div>
    // <div>
    //   <strong>Machine:</strong> {serviceCall.machine || "N/A"}
    // </div>
    // <div>
    //   <strong>Reported Problem:</strong>{" "}
    //   {serviceCall.reportedProblem || "N/A"}
    // </div>
    // <div>
    //   <strong>Taken By:</strong>{" "}
    //   <TakenBy
    //     id={serviceCall.id!}
    //     currentTakenBy={serviceCall.takenBy}
    //   />
    // </div>
    // <div>
    //   <strong>Notes:</strong>
    //   <div className="text-sm text-gray-700 max-w-xs break-words">
    //     {serviceCall.notes || "N/A"}
    //   </div>
    // </div>
    // <div>
    //   <strong>Status:</strong>
    //   <Status
    //     id={serviceCall.id!}
    //     currentStatus={serviceCall.status}
    //   />
    // </div>
    //         </div>
    // <div className="mt-4 text-right">
    //   <Link href={`/dashboard/${serviceCall.id}/edit`} passHref>
    //     <button className="text-blue-500 hover:underline">Edit</button>
    //   </Link>
    // </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
    <div style={{ padding: "1rem" }}>
      <ServiceCallModalButton
        locations={locations}
        machines={machines}
      />
      <Typography variant="h5" align="center" gutterBottom>
        Current Service Calls (Open/In Progress)
      </Typography>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        marginBottom="1rem"
        display={{ xs: "none", md: "flex" }}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            style={{ padding: "1rem", backgroundColor: "rgb(220, 252, 231)" }}
          >
            <Typography variant="subtitle1" className="text-green-900">
              Open / In Progress
            </Typography>
            <Typography variant="h6">{serviceCalls.length}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper style={{ padding: "1rem", backgroundColor: "#FFFDE7" }}>
            <Typography variant="subtitle1" className="text-yellow-800">
              Unassigned
            </Typography>
            <Typography variant="h6">
              {
                serviceCalls.filter((call) => call.takenBy === "Select...")
                  .length
              }
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} display={{ xs: "block", md: "none" }}>
        {serviceCalls.map((serviceCall) => (
          <Paper
            key={serviceCall.id}
            sx={{
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: serviceCall.overDue ? "#FFEBEE" : "#FFF",
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                {serviceCall.location || "Unknown Location"}
              </h3>
              <div className="text-sm text-gray-600">
                {serviceCall.date ? serviceCall.date.toLocaleString() : "N/A"}
              </div>
            </div>
            <div>
              <strong>Who Called:</strong> {serviceCall.whoCalled || "N/A"}
            </div>
            <div>
              <strong>Machine:</strong> {serviceCall.machine || "N/A"}
            </div>
            <div>
              <strong>Reported Problem:</strong>{" "}
              {serviceCall.reportedProblem || "N/A"}
            </div>
            <div>
              <strong>Taken By:</strong>{" "}
              <TakenBy
                id={serviceCall.id!}
                currentTakenBy={serviceCall.takenBy}
              />
            </div>
            <div>
              <strong>Notes:</strong>
              <div className="text-sm text-gray-700 max-w-xs break-words">
                {serviceCall.notes || "N/A"}
              </div>
            </div>
            <div>
              <strong>Status:</strong>
              <Status id={serviceCall.id!} currentStatus={serviceCall.status} />
            </div>
            <div className="mt-4 text-right">
              <Link href={`/dashboard/${serviceCall.id}/edit`} passHref>
                <button className="text-blue-500 hover:underline">Edit</button>
              </Link>
            </div>
          </Paper>
        ))}
      </Grid>
      {/* Service Calls Table */}
      <TableContainer
        component={Paper}
        className="hidden md:block"
        sx={{ backgroundColor: "#F5F5F5" }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="service calls table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Who Called</TableCell>
              <TableCell>Machine</TableCell>
              <TableCell>Reported Problem</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Taken By</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {serviceCalls.map((serviceCall) => (
              <TableRow
                key={serviceCall.id}
                sx={{
                  backgroundColor: serviceCall.overDue ? "#FFEBEE" : "#F9F9F9",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: serviceCall.overDue
                      ? "#FFCDD2"
                      : "#E0E0E0",
                  },
                }}
              >
                <TableCell>
                  {serviceCall.date ? serviceCall.date.toLocaleString() : "N/A"}
                </TableCell>
                <TableCell>{serviceCall.location || "N/A"}</TableCell>
                <TableCell>{serviceCall.whoCalled || "N/A"}</TableCell>
                <TableCell>{serviceCall.machine || "N/A"}</TableCell>
                <TableCell>{serviceCall.reportedProblem || "N/A"}</TableCell>
                <TableCell>
                  {serviceCall.id && (
                    <Status
                      id={serviceCall.id}
                      currentStatus={serviceCall.status}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <TakenBy
                    id={serviceCall.id!}
                    currentTakenBy={serviceCall.takenBy}
                  />
                </TableCell>
                <TableCell>{serviceCall.notes || "N/A"}</TableCell>
                <TableCell>
                  {serviceCall.updatedAt
                    ? serviceCall.updatedAt.toLocaleString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/${serviceCall.id}/edit`} passHref>
                    <Button variant="text" color="primary">
                      Edit
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default RealTimeOpenInProgress;
