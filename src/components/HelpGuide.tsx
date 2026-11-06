"use client";

import { useEffect, useState } from "react";
import { roleLabel } from "@/lib/data";
import { abbreviations, roleGuides } from "@/lib/glossary";
import { Icon, inputCls } from "./ui";

const roleIcon: Record<string, string> = {
  owner: "Crown", admin: "Settings", sales: "Briefcase", pm: "ClipboardCheck", site: "HardHat", supervisor: "Users",
  store: "Package", billing: "Receipt", accountant: "Wallet", technician: "Wrench", client: "UserRound",
};

/** Button that opens the Help guide: role responsibilities and short forms with full forms. */
export default function HelpGuide({ variant = "button" }: { variant?: "button" | "icon" }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"roles" | "abbr">("roles");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const term = q.trim().toLowerCase();
  const list = abbreviations.filter((a) => !term || a.short.toLowerCase().includes(term) || a.full.toLowerCase().includes(term));
  const groups = Array.from(new Set(list.map((a) => a.group)));

  return (
    <>
      {variant === "icon" ? (
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Help: roles and short forms" title="Help: roles and short forms">
          <Icon name="CircleHelp" className="h-5 w-5" />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
          <Icon name="BookOpen" className="h-4 w-4 text-orange-600" /> Roles & short forms
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/50 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="flex h-full w-full flex-col bg-white shadow-xl sm:h-[88vh] sm:max-w-4xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Help guide">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Help guide</h3>
                <p className="text-xs text-slate-500">What each person does in the system, and the meaning of every short form used.</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close"><Icon name="X" className="h-5 w-5" /></button>
            </div>

            <div className="flex gap-1 border-b border-slate-200 px-4 sm:px-6">
              {([["roles", `Roles & responsibilities (${roleGuides.length})`], ["abbr", `Short forms (${abbreviations.length})`]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${tab === id ? "border-orange-600 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {tab === "roles" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {roleGuides.map((g) => (
                    <div key={g.role} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${g.role === "client" ? "bg-sky-100 text-sky-700" : "bg-orange-50 text-orange-700"}`}><Icon name={roleIcon[g.role]} className="h-4 w-4" /></span>
                        <div className="min-w-0"><div className="font-semibold text-slate-900">{roleLabel[g.role]}</div><div className="truncate text-xs text-slate-500">{g.who}</div></div>
                      </div>
                      <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                        {g.responsibilities.map((r) => <li key={r} className="flex gap-2"><Icon name="Check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{r}</span></li>)}
                      </ul>
                      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"><b className="text-slate-700">Screens:</b> {g.screens}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="relative mb-4 sm:max-w-sm">
                    <Icon name="Search" className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input className={`${inputCls} pl-8`} placeholder="Search e.g. GRN, retention, ESIC" value={q} onChange={(e) => setQ(e.target.value)} />
                  </div>
                  {groups.length === 0 && <p className="text-sm text-slate-400">No match for “{q}”.</p>}
                  <div className="space-y-5">
                    {groups.map((g) => (
                      <div key={g}>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{g}</h4>
                        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                          {list.filter((a) => a.group === g).map((a) => (
                            <div key={a.short} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:gap-4">
                              <dt className="shrink-0 font-semibold text-orange-700 sm:w-40">{a.short}</dt>
                              <dd className="text-sm text-slate-700">{a.full}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
