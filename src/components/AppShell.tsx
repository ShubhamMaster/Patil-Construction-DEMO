"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { alerts, roleLabel, users, DEMO_TODAY } from "@/lib/data";
import { allowed, navFor } from "@/lib/nav";
import { useDemo } from "@/lib/store";
import { fdate } from "@/lib/format";
import { Icon } from "./ui";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, user, logout, login, reset, toast, notify } = useDemo();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);
  // Close the mobile drawer and user menu whenever the route changes.
  const [shownPath, setShownPath] = useState(path);
  if (shownPath !== path) { setShownPath(path); setOpen(false); setMenu(false); }

  if (!ready || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">Loading…</div>;
  }

  const nav = navFor(user.role);
  const myAlerts = alerts.filter((a) => a.roles.includes(user.role));
  const ok = allowed(user.role, path);

  const sidebar = (
    <nav className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white"><Icon name="HardHat" className="h-5 w-5" /></div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">Patil Constructions</div>
          <div className="text-[11px] text-slate-400">{user.role === "client" ? "Client Portal" : "Company Management System"}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {nav.map((n) => {
          const active = path === n.href || path.startsWith(n.href + "/");
          const count = n.href === "/alerts" ? myAlerts.length : 0;
          return (
            <Link key={n.href} href={n.href}
              className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active ? "bg-orange-600 text-white" : "hover:bg-white/5 hover:text-white"}`}>
              <Icon name={n.icon} className="h-4 w-4 shrink-0" />
              <span className="flex-1">{n.label}</span>
              {count > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">{count}</span>}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-white/10 p-3 text-[11px] text-slate-500">
        Demo data · as on {fdate(DEMO_TODAY)}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%]" onClick={(e) => e.stopPropagation()}>{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:px-5">
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Icon name="Menu" className="h-5 w-5" />
          </button>
          <div className="hidden text-sm text-slate-500 md:block">
            {user.role === "client" ? "Welcome to your project portal" : `Logged in as ${roleLabel[user.role]}`}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => { reset(); notify("Demo data reset to original"); }}
              className="hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 sm:flex" title="Reset demo data">
              <Icon name="RotateCcw" className="h-3.5 w-3.5" /> Reset demo
            </button>
            {user.role !== "client" && (
              <Link href="/alerts" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Alerts">
                <Icon name="Bell" className="h-5 w-5" />
                {myAlerts.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
              </Link>
            )}
            <div className="relative">
              <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">{user.initials}</span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-medium text-slate-800">{user.name}</span>
                  <span className="block text-[11px] text-slate-500">{roleLabel[user.role]}</span>
                </span>
                <Icon name="ChevronDown" className="h-4 w-4 text-slate-400" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <div className="px-2.5 py-2 text-xs text-slate-500">{user.email}</div>
                  <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Switch demo role</div>
                  <div className="max-h-64 overflow-y-auto">
                    {users.map((u) => (
                      <button key={u.id} onClick={() => { login(u); router.push("/dashboard"); notify(`Switched to ${u.name} (${roleLabel[u.role]})`); }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-slate-50 ${u.id === user.id ? "font-semibold text-orange-700" : "text-slate-700"}`}>
                        <span>{roleLabel[u.role]}</span><span className="text-xs text-slate-400">{u.name.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { logout(); router.push("/login"); }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-slate-100 px-2.5 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Icon name="LogOut" /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-3 sm:p-5 lg:p-6">
          {ok ? children : (
            <div className="mx-auto mt-16 max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
              <Icon name="Lock" className="mx-auto h-8 w-8 text-slate-400" />
              <h2 className="mt-3 font-semibold text-slate-800">No access for {roleLabel[user.role]}</h2>
              <p className="mt-1 text-sm text-slate-500">This screen is not part of your role. Role-based access keeps each user to their own work.</p>
              <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-orange-700">Go to dashboard</Link>
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 z-50 w-max max-w-[92vw] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          <span className="mr-2 text-emerald-400">✓</span>{toast}
        </div>
      )}
    </div>
  );
}
