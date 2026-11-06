"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Progress, Stat, Table, Tabs, inputCls } from "@/components/ui";
import type { Unit } from "@/lib/data";
import { approvalsOwnProject, ownBudget } from "@/lib/data";
import { fdate, inr, inrShort, pct } from "@/lib/format";
import { useDemo } from "@/lib/store";
import ExportButtons from "@/components/ExportButtons";

const tone: Record<Unit["status"], string> = { Sold: "bg-emerald-500 text-white", Booked: "bg-sky-500 text-white", Available: "bg-white text-slate-700 ring-1 ring-slate-300", Hold: "bg-amber-400 text-white" };

export default function OwnProjectsPage() {
  const { state, update, notify } = useDemo();
  const p = state.projects.find((x) => x.id === "P-B")!;
  const units = state.units;
  const [sel, setSel] = useState<Unit | null>(null);
  const [buyer, setBuyer] = useState("");
  const sold = units.filter((u) => u.status === "Sold" || u.status === "Booked");
  const salesValue = sold.reduce((a, u) => a + u.price, 0);
  const collected = units.reduce((a, u) => a + (u.paid ?? 0), 0);
  const budget = ownBudget.reduce((a, b) => a + b.budget, 0);
  const actual = ownBudget.reduce((a, b) => a + b.actual, 0);

  const book = () => {
    if (!sel || !buyer) return;
    update((s) => ({ ...s, units: s.units.map((u) => (u.id === sel.id ? { ...u, status: "Booked", buyer, paid: Math.round(u.price * 0.1) } : u)) }), `Booked flat ${sel.id} for ${buyer}`);
    notify(`Flat ${sel.id} booked - 10% booking amount recorded`); setSel(null); setBuyer("");
  };

  return (
    <>
      <PageHeader title="Patil Residency - Own Project" sub="G+3, 12 flats on company land · Gangapur Road · for sale"
        actions={<><ExportButtons id="flats" size="md" label="Sales report" /><Button variant="secondary" icon="Send" onClick={() => notify("Demand letters for '2nd slab complete' sent to 9 buyers (demo)")}>Send stage demand letters</Button></>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Construction progress" value={`${p.progress}%`} sub="2nd slab complete" icon="Building" tone="orange" />
        <Stat label="Flats sold / booked" value={`${sold.length} / ${units.length}`} sub={inrShort(salesValue)} icon="Home" tone="green" />
        <Stat label="Collected from buyers" value={inrShort(collected)} sub={`${pct(collected, salesValue)}% of sold value`} icon="Wallet" tone="blue" />
        <Stat label="Spent vs budget" value={inrShort(actual)} sub={`of ${inrShort(budget)} (${pct(actual, budget)}%)`} icon="PieChart" tone="amber" />
      </div>
      <Tabs tabs={[
        { id: "u", label: "Flat inventory", content: (
          <Card title="Click an available flat to book" action={<div className="hidden gap-3 text-xs sm:flex">{(["Sold", "Booked", "Available", "Hold"] as const).map((s) => <span key={s} className="flex items-center gap-1"><span className={`h-3 w-3 rounded ${tone[s]}`} />{s}</span>)}</div>}>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((fl) => (
                <div key={fl} className="flex items-center gap-2">
                  <div className="w-14 shrink-0 text-xs font-medium text-slate-500">Floor {fl}</div>
                  <div className="grid flex-1 grid-cols-3 gap-2">
                    {units.filter((u) => u.floor === fl).map((u) => (
                      <button key={u.id} onClick={() => (u.status === "Available" ? setSel(u) : notify(`${u.id}: ${u.status}${u.buyer ? ` - ${u.buyer}, paid ${inrShort(u.paid ?? 0)}` : ""}`))}
                        className={`rounded-lg p-2 text-left text-xs shadow-sm transition hover:scale-[1.02] sm:p-3 ${tone[u.status]}`}>
                        <div className="text-sm font-semibold">{u.id}</div>
                        <div className="opacity-90">{u.type} · {u.area} sqft</div>
                        <div className="mt-1 font-medium">{inrShort(u.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="ml-16 rounded-lg bg-slate-100 py-1.5 text-center text-xs text-slate-500">Ground floor - parking</div>
            </div>
          </Card>) },
        { id: "b", label: "Buyers & collections", content: (
          <Card pad={false}><Table rows={units.filter((u) => u.buyer)} cols={[
            { key: "id", label: "Flat" }, { key: "buyer", label: "Buyer" }, { key: "price", label: "Agreement value", align: "right", render: (r) => inr(r.price) },
            { key: "paid", label: "Paid", align: "right", render: (r) => inr(r.paid ?? 0) }, { key: "due", label: "Due on 2nd slab", align: "right", render: (r) => inr(Math.max(0, r.price * 0.4 - (r.paid ?? 0))) },
            { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
          ]} /></Card>) },
        { id: "c", label: "Budget & funding", content: (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="Budget vs actual by head" className="lg:col-span-2">
              <ul className="space-y-3">
                {ownBudget.filter((b) => b.budget > 0).map((b) => (
                  <li key={b.head}>
                    <div className="mb-1 flex justify-between text-sm"><span>{b.head}</span><span className="tabular-nums text-slate-600">{inrShort(b.actual)} / {inrShort(b.budget)}</span></div>
                    <Progress value={pct(b.actual, b.budget)} tone={pct(b.actual, b.budget) > 90 ? "bg-amber-500" : "bg-sky-500"} />
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Funding">
              <ul className="space-y-2.5 text-sm">
                <li className="flex justify-between"><span>Owner&apos;s capital</span><b>₹80.00 L</b></li>
                <li className="flex justify-between"><span>Bank loan sanctioned</span><b>₹1.60 Cr</b></li>
                <li className="flex justify-between"><span>Loan disbursed</span><b>₹45.00 L</b></li>
                <li className="flex justify-between"><span>Buyer advances</span><b>{inrShort(collected)}</b></li>
                <li className="flex justify-between border-t border-slate-100 pt-2"><span>Cost to complete</span><b className="text-orange-700">{inrShort(budget - actual)}</b></li>
              </ul>
            </Card>
          </div>) },
        { id: "a", label: "Approvals", content: (
          <Card pad={false}><Table rows={approvalsOwnProject} cols={[{ key: "name", label: "Approval" }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }, { key: "date", label: "Date", render: (r) => fdate(r.date) }]} /></Card>) },
      ]} />

      <Modal open={!!sel} onClose={() => setSel(null)} title={`Book flat ${sel?.id ?? ""}`} footer={<><Button variant="secondary" onClick={() => setSel(null)}>Cancel</Button><Button onClick={book}>Confirm booking</Button></>}>
        {sel && <div className="rounded-lg bg-slate-50 p-3 text-sm">{sel.type} · {sel.area} sqft · Floor {sel.floor} · <b>{inr(sel.price)}</b></div>}
        <Field label="Buyer name"><input className={inputCls} value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="e.g. Rohit Deshpande" /></Field>
        <p className="text-xs text-slate-500">Booking amount 10%. Further payments are linked to construction stages; demand letters go out automatically when a stage is marked complete.</p>
      </Modal>
    </>
  );
}
