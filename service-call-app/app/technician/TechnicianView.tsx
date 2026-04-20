"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import db from "@/lib/firebase";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
  Clock,
  MapPin,
  Phone,
  Wrench,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Plus,
  Filter,
  ShieldCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ServiceCall } from "../(definitions)/definitions";
import InstallCard from "@/components/InstallCard";
import { ADMIN_DISPLAY_NAMES, isAdmin } from "@/lib/admins";

const TECH_NAME_KEY = "technician-name";
const PREDEFINED_NAMES = [
  "Kurt",
  "Chris",
  "Mike",
  "Dean",
  "Damon",
  "John",
  "Aaron",
  ...ADMIN_DISPLAY_NAMES,
];

type FilterMode = "mine" | "unassigned" | "all";

export default function TechnicianView() {
  const { user, loading, signIn } = useAuth();
  const [techName, setTechName] = useState<string>("");
  const [filter, setFilter] = useState<FilterMode>("mine");
  const [calls, setCalls] = useState<ServiceCall[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(TECH_NAME_KEY);
    if (stored) setTechName(stored);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "ServiceCalls"),
      where("status", "in", ["OPEN", "IN_PROGRESS"]),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCalls(
          snap.docs.map(
            (d) =>
              ({
                id: d.id,
                ...d.data(),
                date: d.data().date ? d.data().date.toDate() : null,
                updatedAt: d.data().updatedAt
                  ? d.data().updatedAt.toDate()
                  : null,
                createdAt: d.data().createdAt
                  ? d.data().createdAt.toDate()
                  : null,
              }) as ServiceCall
          )
        );
      },
      (err) => {
        console.error(err);
        toast.error("Couldn't load service calls");
      }
    );
    return () => unsub();
  }, [user]);

  const visibleCalls = useMemo(() => {
    if (filter === "mine") {
      if (!techName) return [];
      return calls.filter((c) => c.takenBy === techName);
    }
    if (filter === "unassigned") {
      return calls.filter(
        (c) => !c.takenBy || c.takenBy === "Select..." || c.takenBy === ""
      );
    }
    return calls;
  }, [calls, filter, techName]);

  const counts = useMemo(() => {
    const mine = techName
      ? calls.filter((c) => c.takenBy === techName).length
      : 0;
    const unassigned = calls.filter(
      (c) => !c.takenBy || c.takenBy === "Select..." || c.takenBy === ""
    ).length;
    const overdue = calls.filter((c) => c.overDue).length;
    return { mine, unassigned, overdue, all: calls.length };
  }, [calls, techName]);

  const handleSaveName = (name: string) => {
    localStorage.setItem(TECH_NAME_KEY, name);
    setTechName(name);
    toast.success(`Signed in as ${name}`);
  };

  const updateCall = async (
    id: string,
    patch: Partial<Pick<ServiceCall, "status" | "takenBy">>,
    successMsg: string
  ) => {
    setBusyId(id);
    try {
      await updateDoc(doc(db, "ServiceCalls", id), {
        ...patch,
        updatedAt: Timestamp.now(),
      });
      toast.success(successMsg);
    } catch (err) {
      console.error(err);
      toast.error("Update failed — will retry when online");
    } finally {
      setBusyId(null);
    }
  };

  const claimCall = (id: string) => {
    if (!techName) {
      toast.error("Choose your name first");
      return;
    }
    return updateCall(
      id,
      { takenBy: techName, status: "IN_PROGRESS" },
      "Claimed — good luck out there"
    );
  };

  const startCall = (id: string) =>
    updateCall(id, { status: "IN_PROGRESS" }, "Marked in progress");

  const completeCall = (id: string) =>
    updateCall(id, { status: "DONE" }, "Marked done");

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
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 space-y-4 text-center">
            <Wrench className="h-10 w-10 text-slate-700 mx-auto" />
            <h1 className="text-xl font-bold">Technician Sign-In</h1>
            <p className="text-sm text-slate-600">
              Sign in with your Google account to see and update service calls.
            </p>
            <Button onClick={signIn} className="w-full">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!techName) {
    const myName = user.displayName?.trim();
    const showMyName = myName && !PREDEFINED_NAMES.includes(myName);
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-center">
              Who&apos;s working today?
            </h1>
            <p className="text-sm text-slate-600 text-center">
              Pick your name. We&apos;ll use it when you claim a call.
            </p>
            {showMyName && (
              <Button
                variant="default"
                className="w-full h-12 text-base"
                onClick={() => handleSaveName(myName!)}
              >
                Use my name: {myName}
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              {PREDEFINED_NAMES.map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  className="h-12 text-base"
                  onClick={() => handleSaveName(name)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main
      className="pb-28 px-3 pt-3 max-w-2xl mx-auto"
      style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
    >
      <header className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="text-xs text-slate-500">Signed in as</div>
          <div className="text-lg font-bold truncate">{techName}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin(user) && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold active:scale-95 transition"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          <button
            onClick={() => {
              localStorage.removeItem(TECH_NAME_KEY);
              setTechName("");
            }}
            className="text-xs text-slate-500 underline"
          >
            Switch user
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatPill label="Mine" value={counts.mine} tone="slate" />
        <StatPill label="Unassigned" value={counts.unassigned} tone="amber" />
        <StatPill label="Overdue" value={counts.overdue} tone="red" />
      </div>

      <div
        role="tablist"
        className="grid grid-cols-3 rounded-full bg-slate-100 p-1 mb-4"
      >
        {(
          [
            { id: "mine", label: "My Calls" },
            { id: "unassigned", label: "Unassigned" },
            { id: "all", label: "All Open" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-full py-2 text-sm font-medium transition ${
              filter === tab.id
                ? "bg-white shadow text-slate-900"
                : "text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <InstallCard />
      </div>

      {visibleCalls.length === 0 ? (
        <Card className="text-center py-10 border-dashed">
          <CardContent className="space-y-3">
            <Filter className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-slate-600 font-medium">
              {filter === "mine"
                ? "You have no open calls right now."
                : filter === "unassigned"
                  ? "No unassigned calls — nice work."
                  : "No open calls on the board."}
            </p>
            {filter === "mine" && counts.unassigned > 0 && (
              <button
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 px-3 py-1.5 text-sm font-medium border border-amber-200"
                onClick={() => setFilter("unassigned")}
              >
                {counts.unassigned} waiting — tap to claim one
              </button>
            )}
            {filter === "mine" && counts.unassigned === 0 && counts.all > 0 && (
              <button
                className="text-sm text-slate-600 underline"
                onClick={() => setFilter("all")}
              >
                See all {counts.all} active calls
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {visibleCalls.map((c) => (
            <li key={c.id}>
              <CallCard
                call={c}
                busy={busyId === c.id}
                mine={c.takenBy === techName}
                onClaim={() => claimCall(c.id!)}
                onStart={() => startCall(c.id!)}
                onComplete={() => completeCall(c.id!)}
              />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/dashboard/create"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-slate-900 text-white px-5 py-3 shadow-xl active:scale-95 transition"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-semibold">New Call</span>
      </Link>
    </main>
  );
}

function CallCard({
  call,
  busy,
  mine,
  onClaim,
  onStart,
  onComplete,
}: {
  call: ServiceCall;
  busy: boolean;
  mine: boolean;
  onClaim: () => void;
  onStart: () => void;
  onComplete: () => void;
}) {
  const assigned =
    call.takenBy && call.takenBy !== "Select..." && call.takenBy !== "";
  const inProgress = call.status === "IN_PROGRESS";

  return (
    <Card
      className={`${
        call.overDue ? "border-red-300 bg-red-50" : "border-slate-200"
      } shadow-sm`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-lg truncate">
              <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="truncate">{call.location || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Clock className="h-3 w-3" />
              {call.date
                ? formatDistanceToNow(call.date, { addSuffix: true })
                : "No date"}
              {call.overDue && (
                <span className="ml-1 inline-flex items-center gap-0.5 text-red-700 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Overdue
                </span>
              )}
            </div>
          </div>
          <StatusBadge status={call.status} />
        </div>

        <div className="text-sm text-slate-800">
          <span className="font-medium">Problem:</span>{" "}
          {call.reportedProblem || "Not specified"}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <span className="font-medium text-slate-700">Machine:</span>{" "}
            {call.machine || "—"}
          </div>
          <div>
            <span className="font-medium text-slate-700">Caller:</span>{" "}
            {call.whoCalled || "—"}
          </div>
        </div>

        {call.notes && (
          <div className="text-xs bg-slate-50 rounded-md p-2 text-slate-700 border border-slate-100">
            {call.notes}
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-1">
          <div className="text-slate-500">
            {assigned ? (
              <>
                Assigned to <span className="font-medium">{call.takenBy}</span>
              </>
            ) : (
              <span className="text-amber-700 font-medium">Unassigned</span>
            )}
          </div>
          {call.whoCalled && (
            <a
              href={`tel:${call.whoCalled}`}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              <Phone className="h-3 w-3" /> Call
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {!mine ? (
            <Button
              onClick={onClaim}
              disabled={busy}
              className="h-12 text-base col-span-2 bg-blue-600 hover:bg-blue-700"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Claim this call
            </Button>
          ) : inProgress ? (
            <Button
              onClick={onComplete}
              disabled={busy}
              className="h-12 text-base col-span-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark done
            </Button>
          ) : (
            <>
              <Button
                onClick={onStart}
                disabled={busy}
                className="h-12 text-base bg-amber-600 hover:bg-amber-700"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button
                onClick={onComplete}
                disabled={busy}
                variant="outline"
                className="h-12 text-base"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Done
              </Button>
            </>
          )}
        </div>

        <Link
          href={`/dashboard/${call.id}/edit?from=technician`}
          className="block text-center text-xs text-slate-500 underline pt-1"
        >
          Open full details
        </Link>
      </CardContent>
    </Card>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "amber" | "red";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-800 border-slate-200",
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    red: "bg-red-50 text-red-900 border-red-200",
  }[tone];
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-center ${tones}`}
      aria-label={`${label}: ${value}`}
    >
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wide mt-0.5">
        {label}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    OPEN: { label: "Open", cls: "bg-blue-100 text-blue-800" },
    IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-800" },
    DONE: { label: "Done", cls: "bg-green-100 text-green-800" },
  };
  const s = map[status] || { label: status, cls: "bg-slate-100 text-slate-700" };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
