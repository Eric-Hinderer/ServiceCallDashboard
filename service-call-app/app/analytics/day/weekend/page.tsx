"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Sun } from "lucide-react";
import { DataTable } from "../../data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WeekendServiceCallsPage() {
  const router = useRouter();
  const [serviceCalls, setServiceCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedServiceCalls = sessionStorage.getItem("weekendServiceCalls");
    if (storedServiceCalls) {
      setServiceCalls(JSON.parse(storedServiceCalls));
    }
    setLoading(false);
  }, []);

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
            <Sun className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Weekend Service Calls
            </h1>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Calendar className="h-5 w-5" />
              Weekend Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-900">{serviceCalls.length}</div>
                <p className="text-sm text-orange-600">Total Weekend Calls</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-900">Sat & Sun</div>
                <p className="text-sm text-orange-600">Weekend Days</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-900">Non-Business</div>
                <p className="text-sm text-orange-600">Call Classification</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Loading weekend service calls...</span>
            </CardContent>
          </Card>
        ) : (
          <DataTable 
            columns={columns} 
            data={serviceCalls}
            title="Weekend Service Calls"
            description="Detailed view of all service calls that occurred during weekends (Saturday and Sunday)."
          />
        )}
      </div>
    </div>
  );
}
