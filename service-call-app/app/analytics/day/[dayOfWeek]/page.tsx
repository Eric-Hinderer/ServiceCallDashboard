"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { dayNames } from "@/app/(definitions)/definitions";
import { columns } from "@/app/analytics/day/weekend/columns";
import { DataTable } from "../../data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DayAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { dayOfWeek } = params;
  const [serviceCalls, setServiceCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem("serviceCalls");
    if (storedData) {
      setServiceCalls(JSON.parse(storedData));
    }
    setLoading(false);
  }, []);

  const dayName = dayNames[+dayOfWeek];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analytics
          </Button>
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {dayName} After-Hours Calls
            </h1>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{serviceCalls.length}</div>
                <p className="text-sm text-blue-600">Total Calls</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{dayName}</div>
                <p className="text-sm text-blue-600">Day of Week</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">After Hours</div>
                <p className="text-sm text-blue-600">Call Type</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Loading service calls...</span>
            </CardContent>
          </Card>
        ) : (
          <DataTable 
            columns={columns} 
            data={serviceCalls}
            title={`${dayName} After-Hours Service Calls`}
            description={`Detailed view of all service calls that occurred on ${dayName} outside normal business hours.`}
          />
        )}
      </div>
    </div>
  );
}
