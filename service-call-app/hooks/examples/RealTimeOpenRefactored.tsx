// Example: Refactored RealTimeOpen component using custom hooks
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ServiceCall } from "@/lib/types";
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
import toast from "react-hot-toast";
import Grid from "@mui/material/Grid2";
import { formatDistanceToNow } from "date-fns";

// Import our custom hooks
import { 
  useOpenServiceCalls, 
  useLocationsAndMachines,
  useDashboardStats 
} from "@/hooks";

const RealTimeOpenRefactored = () => {
  const { user: currentUser, signIn } = useAuth();
  const [lastIds, setLastIds] = useState<string[]>([]);

  // Use custom hooks for data fetching
  const { 
    serviceCalls, 
    loading: serviceCallsLoading, 
    error: serviceCallsError 
  } = useOpenServiceCalls();
  
  const { 
    locations, 
    machines, 
    loading: locationsLoading, 
    error: locationsError 
  } = useLocationsAndMachines();

  const dashboardStats = useDashboardStats(serviceCalls);

  // Handle new service call notifications
  useEffect(() => {
    if (!serviceCalls.length) return;

    const newIds = serviceCalls.map(call => call.id);
    if (lastIds.length > 0) {
      const newCall = serviceCalls.find(call => !lastIds.includes(call.id));
      if (newCall) {
        toast.success(`New service call at ${newCall.location || "Unknown Location"}`);
      }
    }
    setLastIds(newIds);
  }, [serviceCalls, lastIds]);

  // Loading state
  const isLoading = serviceCallsLoading || locationsLoading;

  // Error handling
  if (serviceCallsError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">Error loading service calls: {serviceCallsError}</Typography>
      </Box>
    );
  }

  if (locationsError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">Error loading locations: {locationsError}</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "50vh" }}
      >
        <Grid>
          <Paper style={{ padding: "2rem", textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              Service Call Dashboard
            </Typography>
            <Typography variant="body1" style={{ marginBottom: "1rem" }}>
              Please sign in to access the dashboard.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={signIn}
              size="large"
            >
              Sign In with Google
            </Button>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      {/* Dashboard Stats Cards */}
      <Grid container spacing={2} style={{ marginBottom: "2rem" }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            style={{ padding: "1rem", backgroundColor: "rgb(220, 252, 231)" }}
          >
            <Typography variant="subtitle1" className="text-green-900">
              Open / In Progress
            </Typography>
            <Typography variant="h6">
              {isLoading ? <CircularProgress size={20} /> : serviceCalls.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper style={{ padding: "1rem", backgroundColor: "#FFFDE7" }}>
            <Typography variant="subtitle1" className="text-yellow-800">
              Unassigned
            </Typography>
            <Typography variant="h6">
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                dashboardStats.unassignedServiceCalls
              )}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Service Calls Table */}
      <Paper>
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <Typography variant="h6">
            Open Service Calls ({serviceCalls.length})
          </Typography>
          {!isLoading && (
            <ServiceCallModalButton locations={locations} machines={machines} />
          )}
        </Box>
        
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : serviceCalls.length === 0 ? (
          <Box textAlign="center" p={4}>
            <Typography variant="body1" color="textSecondary">
              No open service calls at the moment
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Who Called</TableCell>
                  <TableCell>Machine</TableCell>
                  <TableCell>Problem</TableCell>
                  <TableCell>Taken By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serviceCalls.map((serviceCall) => (
                  <TableRow key={serviceCall.id}>
                    <TableCell>
                      {serviceCall.date
                        ? new Date(serviceCall.date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{serviceCall.location}</TableCell>
                    <TableCell>{serviceCall.whoCalled}</TableCell>
                    <TableCell>{serviceCall.machine}</TableCell>
                    <TableCell>{serviceCall.reportedProblem}</TableCell>
                    <TableCell>
                      <TakenBy
                        id={serviceCall.id}
                        currentTakenBy={serviceCall.takenBy}
                      />
                    </TableCell>
                    <TableCell>
                      <Status
                        id={serviceCall.id}
                        currentStatus={serviceCall.status}
                      />
                    </TableCell>
                    <TableCell>
                      {serviceCall.date
                        ? formatDistanceToNow(new Date(serviceCall.date), {
                            addSuffix: true,
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/${serviceCall.id}/edit`}>
                        <Button size="small" variant="outlined">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </div>
  );
};

export default RealTimeOpenRefactored;
