"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  Home,
  ClipboardList,
  LayoutGrid,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { isAdmin } from "@/lib/admins";
import { cn } from "@/lib/utils";

type Tab = {
  name: string;
  href: string;
  Icon: LucideIcon;
  match: (pathname: string) => boolean;
};

export default function BottomTabBar() {
  const { user, loading } = useAuth();
  const pathname = usePathname() ?? "/";

  const tabs = useMemo<Tab[]>(() => {
    if (!user) return [];
    const base: Tab[] = [
      { name: "Home", href: "/", Icon: Home, match: (p) => p === "/" },
      {
        name: "My Calls",
        href: "/technician",
        Icon: ClipboardList,
        match: (p) => p.startsWith("/technician"),
      },
      {
        name: "Calls",
        href: "/dashboard",
        Icon: LayoutGrid,
        match: (p) => p.startsWith("/dashboard"),
      },
      {
        name: "Stats",
        href: "/analytics",
        Icon: BarChart3,
        match: (p) => p.startsWith("/analytics"),
      },
    ];
    if (isAdmin(user)) {
      base.push({
        name: "Admin",
        href: "/admin",
        Icon: ShieldCheck,
        match: (p) => p.startsWith("/admin"),
      });
    }
    return base;
  }, [user]);

  const visible = !loading && tabs.length > 0 && pathname !== "/offline";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.bottomNav = visible ? "true" : "false";
  }, [visible]);

  if (!visible) return null;

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-1px_0_rgba(0,0,0,0.02)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul
        className="grid max-w-md mx-auto"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map(({ name, href, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-1 pt-2 pb-1.5 text-[11px] font-medium transition-transform duration-100 active:scale-[0.92]",
                  active ? "text-slate-900" : "text-slate-500",
                )}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={active ? 2.4 : 1.9}
                  aria-hidden="true"
                />
                <span className="truncate max-w-full">{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
