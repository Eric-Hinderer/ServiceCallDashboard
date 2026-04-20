"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import db from "@/lib/firebase";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TakenBy from "@/components/TakenBy";
import Status from "@/components/Status";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Clock,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ServiceCall } from "../(definitions)/definitions";
import { ADMIN_DISPLAY_NAMES, isAdmin } from "@/lib/admins";

const TECH_NAMES = [
  "Kurt",
  "Chris",
  "Mike",
  "Dean",
  "Damon",
  "John",
  "Aaron",
  ...ADMIN_DISPLAY_NAMES,
];

const UNASSIGNED = "Unassigned";

export default function AdminView() {
  const { user, loading, signIn } = useAuth();
  const [calls, setCalls] = useState<ServiceCall[]>([]);
  const [techFilter, setTechFilter] = useState<string>("all");
  const [loadingCalls, setLoadingCalls] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin(user)) return;
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
              } as ServiceCall)
          )
        );
        setLoadingCalls(false);
      },
      (err) => {
        console.error(err);
        toast.error("Failed to load service calls");
        setLoadingCalls(false);
      }
    );
    return () => unsub();
  }, [user]);

  const totals = useMemo(
    () => ({
      open: calls.filter((c) => c.status === "OPEN").length,
      inProgress: calls.filter((c) => c.status === "IN_PROGRESS").length,
      overdue: calls.filter((c) => c.overDue).length,
      unassigned: calls.filter(
        (c) => !c.takenBy || c.takenBy === "Select..." || c.takenBy === ""
      ).length,
    }),
    [calls]
  );

  const perTech = useMemo(() => {
    const stats: Record<
      string,
      { open: number; inProgress: number; overdue: number }
    > = {};
    const ensure = (name: string) => {
      if (!stats[name]) stats[name] = { open: 0, inProgress: 0, overdue: 0 };
    };
    ensure(UNASSIGNED);
    TECH_NAMES.forEach(ensure);
    calls.forEach((c) => {
      const name =
        !c.takenBy || c.takenBy === "Select..." || c.takenBy === ""
          ? UNASSIGNED
          : c.takenBy;
      ensure(name);
      if (c.status === "OPEN") stats[name].open++;
      else if (c.status === "IN_PROGRESS") stats[name].inProgress++;
      if (c.overDue) stats[name].overdue++;
    });
    return stats;
  }, [calls]);

  const filteredCalls = useMemo(() => {
    if (techFilter === "all") return calls;
    if (techFilter === UNASSIGNED) {
      return calls.filter(
        (c) => !c.takenBy || c.takenBy === "Select..." || c.takenBy === ""
      );
    }
    return calls.filter((c) => c.takenBy === techFilter);
  }, [calls, techFilter]);

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
            <ShieldCheck className="h-10 w-10 text-slate-700 mx-auto" />
            <h1 className="text-xl font-bold">Admin Sign-In</h1>
            <p className="text-sm text-slate-600">
              Sign in with your Google account to view the admin dashboard.
            </p>
            <Button onClick={signIn} className="w-full">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!isAdmin(user)) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="max-w-sm w-full border-red-200">
          <CardContent className="p-6 space-y-3 text-center">
            <ShieldAlert className="h-10 w-10 text-red-600 mx-auto" />
            <h1 className="text-xl font-bold">Not authorized</h1>
            <p className="text-sm text-slate-600">
              You&apos;re signed in as{" "}
              <strong>{user.displayName || user.email}</strong>, but this
              account isn&apos;t on the admin list.
            </p>
            <p className="text-xs text-slate-500">
              Admins are configured in <code>lib/admins.ts</code>.
            </p>
            <Link href="/technician">
              <Button variant="outline" className="w-full">
                Go to Technician View
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main
      className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 space-y-5"
      style={{ paddingBottom: "calc(3rem + env(safe-area-inset-bottom))" }}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Admin
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            Operations
          </h1>
          <div className="text-xs text-slate-500 truncate">
            Signed in as {user.displayName || user.email}
          </div>
        </div>
        <Link href="/technician" className="shrink-0">
          <Button variant="outline" size="sm">
            <Wrench className="h-4 w-4 mr-1.5" />
            Tech View
          </Button>
        </Link>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Open"
          value={totals.open}
          icon={<AlertCircle className="h-4 w-4" />}
          tone="blue"
        />
        <StatCard
          label="In Progress"
          value={totals.inProgress}
          icon={<Wrench className="h-4 w-4" />}
          tone="amber"
        />
        <StatCard
          label="Overdue"
          value={totals.overdue}
          icon={<Clock className="h-4 w-4" />}
          tone="red"
        />
        <StatCard
          label="Unassigned"
          value={totals.unassigned}
          icon={<Users className="h-4 w-4" />}
          tone="slate"
        />
      </section>

      <section>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Workload by technician</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              <TechRow
                name="All"
                open={totals.open}
                inProgress={totals.inProgress}
                overdue={totals.overdue}
                active={techFilter === "all"}
                onClick={() => setTechFilter("all")}
              />
              {[UNASSIGNED, ...TECH_NAMES].map((name) => {
                const s = perTech[name] || {
                  open: 0,
                  inProgress: 0,
                  overdue: 0,
                };
                if (s.open === 0 && s.inProgress === 0 && name !== UNASSIGNED)
                  return null;
                return (
                  <TechRow
                    key={name}
                    name={name}
                    open={s.open}
                    inProgress={s.inProgress}
                    overdue={s.overdue}
                    active={techFilter === name}
                    onClick={() => setTechFilter(name)}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-slate-900">
            {techFilter === "all"
              ? "All active calls"
              : `Calls for ${techFilter}`}
            <span className="ml-2 text-xs text-slate-500 font-normal">
              ({filteredCalls.length})
            </span>
          </h2>
          {techFilter !== "all" && (
            <button
              className="text-xs text-slate-500 underline"
              onClick={() => setTechFilter("all")}
            >
              Clear filter
            </button>
          )}
        </div>

        {loadingCalls ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Loading…
          </div>
        ) : filteredCalls.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent className="text-slate-500 text-sm">
              No active calls match this filter.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {filteredCalls.map((c) => (
              <li key={c.id}>
                <AdminCallRow call={c} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "blue" | "amber" | "red" | "slate";
}) {
  const tones = {
    blue: "from-blue-50 to-blue-100 text-blue-900 border-blue-200",
    amber: "from-amber-50 to-amber-100 text-amber-900 border-amber-200",
    red: "from-red-50 to-red-100 text-red-900 border-red-200",
    slate: "from-slate-50 to-slate-100 text-slate-900 border-slate-200",
  }[tone];
  return (
    <div
      className={`rounded-xl border bg-gradient-to-r ${tones} p-3 flex items-center gap-3`}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-xs font-medium opacity-80">{label}</div>
        <div className="text-2xl font-bold leading-none mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function TechRow({
  name,
  open,
  inProgress,
  overdue,
  active,
  onClick,
}: {
  name: string;
  open: number;
  inProgress: number;
  overdue: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition ${
        active ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-800"
      }`}
    >
      <div className="font-medium truncate shrink-0">{name}</div>
      <div className="flex items-center gap-1.5 text-xs flex-wrap justify-end">
        <span
          className={`rounded-full px-2 py-0.5 ${
            active ? "bg-white/20" : "bg-blue-100 text-blue-800"
          }`}
        >
          {open} open
        </span>
        <span
          className={`rounded-full px-2 py-0.5 ${
            active ? "bg-white/20" : "bg-amber-100 text-amber-800"
          }`}
        >
          {inProgress} in progress
        </span>
        {overdue > 0 && (
          <span
            className={`rounded-full px-2 py-0.5 ${
              active ? "bg-white/20" : "bg-red-100 text-red-800"
            }`}
          >
            {overdue} overdue
          </span>
        )}
      </div>
    </button>
  );
}

function AdminCallRow({ call }: { call: ServiceCall }) {
  return (
    <Card
      className={`${
        call.overDue ? "border-red-300 bg-red-50" : "border-slate-200"
      } shadow-sm`}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 truncate">
              <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="truncate">{call.location || "Unknown"}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {call.date
                  ? formatDistanceToNow(call.date, { addSuffix: true })
                  : "No date"}
                {" • "}
                {call.machine || "—"}
                {call.whoCalled ? ` • ${call.whoCalled}` : ""}
              </span>
            </div>
          </div>
          {call.overDue && (
            <span className="inline-flex items-center gap-0.5 text-red-700 text-xs font-semibold bg-red-100 border border-red-200 rounded-full px-2 py-0.5 shrink-0">
              <AlertCircle className="h-3 w-3" />
              Overdue
            </span>
          )}
        </div>

        <div className="text-sm text-slate-800 line-clamp-2">
          {call.reportedProblem || "No problem description"}
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
          <TakenBy id={call.id!} currentTakenBy={call.takenBy} />
          <Status id={call.id!} currentStatus={call.status} />
          <Link href={`/dashboard/${call.id}/edit`} className="ml-auto">
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
