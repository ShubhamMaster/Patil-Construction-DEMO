"use client";

import * as Icons from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Icon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Circle;
  return <C className={className} />;
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className = "", pad = true }: { title?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {action}
        </header>
      )}
      <div className={pad ? "p-4" : ""}>{children}</div>
    </section>
  );
}

const tones: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700", green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20", red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20", violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
};

const statusTone: Record<string, string> = {
  Paid: "green", Approved: "green", Pass: "green", Closed: "green", Done: "green", Delivered: "green", Sold: "green", Won: "green", Present: "green",
  "In Progress": "blue", Invoiced: "blue", Certified: "blue", Submitted: "blue", "PO Raised": "blue", Quoted: "blue", Booked: "blue", Upcoming: "blue", Applied: "blue",
  "Pending Approval": "amber", "Pending Client": "amber", "Pending Owner": "amber", Due: "amber", Open: "amber", "Part Paid": "amber", "Part Delivered": "amber", Negotiation: "amber", Hold: "amber", "On Hold": "amber", Pending: "amber", High: "amber",
  Fail: "red", Rejected: "red", Lost: "red", Urgent: "red", Overdue: "red", Absent: "red",
  "Under Maintenance": "violet", "Under Defect Period": "violet", New: "violet", "Site Visit": "violet", Estimating: "violet",
  Available: "slate", Draft: "slate", Normal: "slate",
};

export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  const t = tone ?? statusTone[String(children)] ?? "slate";
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-slate-500/10 ${tones[t]}`}>{children}</span>;
}

export function Stat({ label, value, sub, icon, tone = "slate", href }: { label: string; value: React.ReactNode; sub?: React.ReactNode; icon?: string; tone?: "slate" | "green" | "amber" | "red" | "blue" | "orange"; href?: string }) {
  const iconTone: Record<string, string> = { slate: "bg-slate-100 text-slate-600", green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", red: "bg-red-100 text-red-700", blue: "bg-sky-100 text-sky-700", orange: "bg-orange-100 text-orange-700" };
  const body = (
    <div className="flex h-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      {icon && <div className={`rounded-lg p-2 ${iconTone[tone]}`}><Icon name={icon} className="h-5 w-5" /></div>}
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
        <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
        {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}

export function Progress({ value, planned, tone = "bg-orange-500" }: { value: number; planned?: number; tone?: string }) {
  return (
    <div className="relative h-2 w-full rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.min(100, value)}%` }} />
      {planned !== undefined && <div className="absolute -top-1 h-4 w-0.5 bg-slate-700" style={{ left: `${Math.min(100, planned)}%` }} title={`Planned ${planned}%`} />}
    </div>
  );
}

export type Col<T> = { key: string; label: string; render?: (row: T) => React.ReactNode; className?: string; align?: "right" };
export function Table<T>({ cols, rows, empty = "No records", rowKey }: { cols: Col<T>[]; rows: T[]; empty?: string; rowKey?: (r: T, i: number) => string }) {
  const cell = (r: T, c: Col<T>) => (c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? ""));
  // Small tables stay as tables on phones; wider ones become stacked cards below the md breakpoint.
  const stack = cols.length > 3;
  const [head, ...rest] = cols;
  const fields = rest.filter((c) => c.label);
  const actions = rest.filter((c) => !c.label);
  return (
    <>
    {stack && (
      <div className="divide-y divide-slate-100 md:hidden">
        {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">{empty}</div>}
        {rows.map((r, i) => (
          <div key={rowKey ? rowKey(r, i) : i} className="space-y-2 px-4 py-3">
            <div className="text-sm font-semibold text-slate-800">{cell(r, head)}</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {fields.map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{c.label}</dt>
                  <dd className="break-words text-slate-700">{cell(r, c)}</dd>
                </div>
              ))}
            </dl>
            {actions.length > 0 && <div className="flex flex-wrap justify-end gap-2">{actions.map((c) => <span key={c.key}>{cell(r, c)}</span>)}</div>}
          </div>
        ))}
      </div>
    )}
    <div className={`overflow-x-auto ${stack ? "hidden md:block" : ""}`}>
      <table className={`w-full text-left text-sm ${stack ? "min-w-[640px]" : ""}`}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {cols.map((c) => <th key={c.key} className={`px-3 py-2.5 font-medium ${c.align === "right" ? "text-right" : ""}`}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && <tr><td colSpan={cols.length} className="px-3 py-8 text-center text-slate-400">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={rowKey ? rowKey(r, i) : i} className="hover:bg-slate-50/70">
              {cols.map((c) => (
                <td key={c.key} className={`px-3 py-2.5 align-top text-slate-700 ${c.align === "right" ? "whitespace-nowrap text-right tabular-nums" : ""} ${c.className ?? ""}`}>
                  {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

export function Button({ children, onClick, variant = "primary", size = "md", type = "button", disabled, icon }: { children?: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger" | "success"; size?: "sm" | "md"; type?: "button" | "submit"; disabled?: boolean; icon?: string }) {
  const v = {
    primary: "bg-orange-600 text-white hover:bg-orange-700",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  }[variant];
  const s = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${s}`}>
      {icon && <Icon name={icon} className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
      {children}
    </button>
  );
}

export function Tabs({ tabs, initial }: { tabs: { id: string; label: string; content: React.ReactNode }[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0].id);
  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${active === t.id ? "border-orange-600 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === active)?.content}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100"><Icon name="X" /></button>
        </div>
        <div className="space-y-3 px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
export const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

export function BarChart({ data, series, height = 180, fmt = (n: number) => String(n) }: { data: Record<string, number | string>[]; series: { key: string; label: string; color: string }[]; height?: number; fmt?: (n: number) => string }) {
  const max = Math.max(...data.flatMap((d) => series.map((s) => Number(d[s.key]))), 1);
  const labelKey = Object.keys(data[0]).find((k) => typeof data[0][k] === "string") ?? "m";
  return (
    <div>
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 flex-col justify-end">
            <div className="flex h-full items-end justify-center gap-1">
              {series.map((s) => (
                <div key={s.key} className="group relative w-full max-w-6 rounded-t" style={{ height: `${(Number(d[s.key]) / max) * 100}%`, background: s.color }}>
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white group-hover:block">{fmt(Number(d[s.key]))}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d, i) => <div key={i} className="flex-1 text-center text-xs text-slate-500">{String(d[labelKey])}</div>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
        {series.map((s) => <span key={s.key} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />{s.label}</span>)}
      </div>
    </div>
  );
}

export function PhotoTile({ caption, date, tag, hue }: { caption: string; date: string; tag: string; hue: number }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="relative flex aspect-[4/3] items-center justify-center" style={{ background: `linear-gradient(135deg, hsl(${hue} 30% 78%), hsl(${hue + 30} 25% 58%))` }}>
        <Icon name="Camera" className="h-8 w-8 text-white/80" />
        <span className="absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">{tag}</span>
        <span className="absolute bottom-1.5 right-2 text-[10px] font-medium text-white/90">GPS ✓ {date}</span>
      </div>
      <figcaption className="px-2 py-1.5 text-xs text-slate-600">{caption}</figcaption>
    </figure>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">{text}</div>;
}
