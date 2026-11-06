"use client";

import { Badge, Button, Card, PageHeader, Stat, Table } from "@/components/ui";
import { DEMO_TODAY } from "@/lib/data";
import { fdate, inr } from "@/lib/format";
import { useDemo } from "@/lib/store";
import ExportButtons from "@/components/ExportButtons";

export default function AttendancePage() {
  const { state, update, notify, user } = useDemo();
  const ws = state.workers;
  const present = ws.filter((w) => w.present);
  const canMark = user && ["supervisor", "site"].includes(user.role);
  const toggle = (id: string) => update((s) => ({ ...s, attendanceSaved: false, workers: s.workers.map((w) => (w.id === id ? { ...w, present: !w.present } : w)) }));
  const save = () => { update((s) => ({ ...s, attendanceSaved: true }), `Marked attendance - ${present.length} present, ${ws.length - present.length} absent (P-A)`); notify(`Attendance saved: ${present.length} present`); };
  const wages = present.reduce((a, w) => a + w.rate + (w.ot * w.rate) / 8, 0);
  const byCat = Object.entries(present.reduce<Record<string, number>>((a, w) => ({ ...a, [w.category]: (a[w.category] ?? 0) + 1 }), {}));

  return (
    <>
      <PageHeader title="Attendance" sub={`Shree Sai Commercial Complex · ${fdate(DEMO_TODAY)}`}
        actions={<><ExportButtons id="wages" size="md" label="Muster roll" />{canMark && <Button icon="Save" variant={state.attendanceSaved ? "success" : "primary"} onClick={save}>{state.attendanceSaved ? "Saved ✓" : "Save attendance"}</Button>}</>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Present" value={present.length} sub={`of ${ws.length} registered`} icon="UserCheck" tone="green" />
        <Stat label="Absent" value={ws.length - present.length} icon="UserX" tone="red" />
        <Stat label="Today's wage cost" value={inr(wages)} sub="Incl. overtime" icon="IndianRupee" tone="orange" />
        <Stat label="Below minimum wage" value="0" sub="All rates checked" icon="ShieldCheck" tone="blue" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Mark attendance (tap to change)" className="lg:col-span-2" pad={false}>
          <ul className="divide-y divide-slate-100">
            {ws.map((w) => (
              <li key={w.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${w.present ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{w.name.split(" ").map((x) => x[0]).join("")}</span>
                <div className="min-w-0 flex-1"><div className="text-sm font-medium">{w.name}</div><div className="text-xs text-slate-500">{w.category} · {w.contractor} · {inr(w.rate)}/day{w.ot ? ` · OT ${w.ot}h` : ""}</div></div>
                <button disabled={!canMark} onClick={() => toggle(w.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${w.present ? "bg-emerald-600 text-white" : "bg-red-50 text-red-700 ring-1 ring-red-200"} disabled:opacity-70`}>
                  {w.present ? "Present" : "Absent"}
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-4">
          <Card title="Present by category">
            <ul className="space-y-2 text-sm">{byCat.map(([c, n]) => <li key={c} className="flex justify-between"><span>{c}</span><b>{n}</b></li>)}</ul>
          </Card>
          <Card title="Week 44 attendance (man-days)" pad={false}>
            <Table rows={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => ({ d, n: state.wageRows.reduce((a, r) => a + r.days[i], 0) }))} cols={[{ key: "d", label: "Day" }, { key: "n", label: "Present", align: "right" }]} />
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm"><span>Status</span><Badge>{state.payables.find((p) => p.id === "PAY-901")?.status ?? "Pending Approval"}</Badge></div>
          </Card>
        </div>
      </div>
    </>
  );
}
