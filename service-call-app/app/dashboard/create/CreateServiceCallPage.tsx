"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import CreateServiceCall from "@/components/CreateServiceCall";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";

export default function CreateServiceCallPage({
  locations,
  machines,
}: {
  locations: string[];
  machines: string[];
}) {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();

  const handleClose = () => {
    router.push("/technician");
  };

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-xl shadow-md p-6 text-center space-y-4">
          <Phone className="h-10 w-10 text-slate-700 mx-auto" />
          <h1 className="text-xl font-bold">Sign in to create a call</h1>
          <Button onClick={signIn} className="w-full">
            Sign in with Google
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-3 sm:p-6 pb-24">
      <header className="sticky top-16 z-30 -mx-3 sm:mx-0 px-3 sm:px-0 mb-4 bg-white/90 backdrop-blur py-2 flex items-center gap-2">
        <Link
          href="/technician"
          aria-label="Back"
          className="p-2 -ml-1 rounded-full hover:bg-slate-100 active:bg-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold leading-tight">New Service Call</h1>
          <div className="text-xs text-slate-500">
            Fill out the details and submit
          </div>
        </div>
      </header>

      <CreateServiceCall
        locations={locations}
        machines={machines}
        closeModalAction={handleClose}
      />
    </main>
  );
}
