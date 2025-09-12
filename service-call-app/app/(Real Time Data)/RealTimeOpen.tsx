"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import { getMachines, getLocations } from "@/app/dashboard/action";
import { formatDistanceToNow } from "date-fns";
import { Clock, Users, AlertCircle, MapPin, Wrench } from "lucide-react";

const RealTimeOpenInProgress = () => {
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const { user: currentUser, signIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const isInitialLoad = useRef(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized calculations for better performance
  const statistics = useMemo(() => ({
    total: serviceCalls.length,
    unassigned: serviceCalls.filter((call) => call.takenBy === "Select...").length,
    overdue: serviceCalls.filter((call) => call.overDue).length,
    inProgress: serviceCalls.filter(call => call.status === "IN_PROGRESS").length,
  }), [serviceCalls]);

  // Memoized formatted service calls to prevent re-calculations on each render
  const formattedServiceCalls = useMemo(() => 
    serviceCalls.map(call => ({
      ...call,
      formattedDate: call.date 
        ? {
            full: call.date.toLocaleString(),
            relative: formatDistanceToNow(call.date, { addSuffix: true }),
            short: call.date.toLocaleDateString(),
          }
        : null,
      formattedUpdatedAt: call.updatedAt
        ? {
            full: call.updatedAt.toLocaleString(),
            relative: formatDistanceToNow(call.updatedAt, { addSuffix: true }),
            short: call.updatedAt.toLocaleDateString(),
          }
        : null,
    })),
    [serviceCalls]
  );

  // Optimized toast notification function
  const showNewCallNotification = useCallback((newCall: ServiceCall) => {
    toast.success(
      `New service call at ${newCall.location || "Unknown Location"}`,
      {
        duration: 4000,
        position: 'top-right',
        icon: '🔧',
      }
    );
  }, []);

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

        // Only show toast for new service calls after initial load
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
        } else {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newCall = {
                id: change.doc.id,
                ...change.doc.data(),
                date: change.doc.data().date ? change.doc.data().date.toDate() : null,
                updatedAt: change.doc.data().updatedAt
                  ? change.doc.data().updatedAt.toDate()
                  : null,
                createdAt: change.doc.data().createdAt
                  ? change.doc.data().createdAt.toDate()
                  : null,
              } as ServiceCall;
              showNewCallNotification(newCall);
            }
          });
        }

        setServiceCalls(updatedServiceCalls);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Error fetching service calls: ", error);
        setError("Failed to fetch service calls");
        toast.error("Failed to fetch service calls");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [showNewCallNotification]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [machinesData, locationsData] = await Promise.all([
          getMachines(),
          getLocations(),
        ]);
        setMachines(machinesData);
        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch configuration data");
        toast.error("Failed to fetch configuration data");
      }
    };

    fetchData();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center mt-8 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to start managing your service calls.
          </p>
          <Button onClick={signIn} className="w-full sm:w-auto">
            Sign In with Google
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-8 text-center">
          {/* Logo and Loading Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2 mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Loading Real-Time Data</h2>
            <p className="text-gray-600">Connecting to live service calls...</p>
          </div>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Real-Time Service Calls</h1>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live
          </div>
        </div>
        <ServiceCallModalButton locations={locations} machines={machines} />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-Time Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Total Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 transition-all duration-500">
              {statistics.total}
            </div>
            <p className="text-xs text-blue-600 mt-1">Active service calls</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unassigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 transition-all duration-500">
              {statistics.unassigned}
            </div>
            <p className="text-xs text-amber-600 mt-1">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 transition-all duration-500">
              {statistics.overdue}
            </div>
            <p className="text-xs text-red-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 transition-all duration-500">
              {statistics.inProgress}
            </div>
            <p className="text-xs text-green-600 mt-1">Being worked on</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {formattedServiceCalls.map((serviceCall) => (
          <Card
            key={serviceCall.id}
            className={`${
              serviceCall.overDue 
                ? "border-red-200 bg-red-50" 
                : "border-gray-200 bg-white"
            } shadow-sm hover:shadow-md transition-shadow`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-lg">
                    {serviceCall.location || "Unknown Location"}
                  </CardTitle>
                </div>
                {serviceCall.overDue && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Overdue
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {serviceCall.formattedDate
                  ? `${serviceCall.formattedDate.full} (${serviceCall.formattedDate.relative})`
                  : "N/A"}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Who Called:</span>
                  <p className="text-gray-900">{serviceCall.whoCalled || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Machine:</span>
                  <p className="text-gray-900">{serviceCall.machine || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Problem:</span>
                <p className="text-gray-900 mt-1">{serviceCall.reportedProblem || "N/A"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-medium text-gray-700">Taken By:</span>
                  <div className="mt-1">
                    <TakenBy
                      id={serviceCall.id!}
                      currentTakenBy={serviceCall.takenBy}
                    />
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <div className="mt-1">
                    <Status id={serviceCall.id!} currentStatus={serviceCall.status} />
                  </div>
                </div>
              </div>
              
              {serviceCall.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-900 mt-1 text-sm break-words">
                    {serviceCall.notes}
                  </p>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <Link href={`/dashboard/${serviceCall.id}/edit`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Edit Service Call
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Service Calls Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedServiceCalls.map((serviceCall) => (
                  <TableRow
                    key={serviceCall.id}
                    className={`${
                      serviceCall.overDue 
                        ? "bg-red-50 hover:bg-red-100" 
                        : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <TableCell className="font-medium">
                      <div className="text-sm">
                        {serviceCall.formattedDate ? (
                          <>
                            <div>{serviceCall.formattedDate.short}</div>
                            <div className="text-xs text-gray-500">
                              {serviceCall.formattedDate.relative}
                            </div>
                          </>
                        ) : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {serviceCall.location || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{serviceCall.whoCalled || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-3 w-3 text-gray-400" />
                        {serviceCall.machine || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={serviceCall.reportedProblem || "N/A"}>
                        {serviceCall.reportedProblem || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TakenBy
                        id={serviceCall.id!}
                        currentTakenBy={serviceCall.takenBy}
                      />
                    </TableCell>
                    <TableCell>
                      {serviceCall.id && (
                        <Status
                          id={serviceCall.id}
                          currentStatus={serviceCall.status}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={serviceCall.notes || "N/A"}>
                        {serviceCall.notes || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {serviceCall.formattedUpdatedAt ? (
                          <>
                            <div>{serviceCall.formattedUpdatedAt.short}</div>
                            <div className="text-xs text-gray-500">
                              {serviceCall.formattedUpdatedAt.relative}
                            </div>
                          </>
                        ) : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/${serviceCall.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {serviceCalls.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-gray-100 p-3">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">No Service Calls</h3>
                <p className="text-gray-500 mt-1">
                  There are currently no open or in-progress service calls.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeOpenInProgress;
