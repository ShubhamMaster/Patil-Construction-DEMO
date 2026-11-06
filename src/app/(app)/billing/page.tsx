"use client";

import { useState } from "react";
import { Badge, Button, Card, Modal, PageHeader, Stat, Table, Tabs } from "@/components/ui";
import type { Bill } from "@/lib/data";
import { DEMO_TODAY } from "@/lib/data";
import { billNet, fdate, inr, inrShort } from "@/lib/format";
import { useDemo, useMyProjects } from "@/lib/store";
import ExportButtons, { useDocExport } from "@/components/ExportButtons";
import { billPdf } from "@/lib/reports";

export default function BillingPage() {
  const { state, update, notify, user } = useDemo();
  const mine = useMyProjects();
  const ids = new Set(mine.map((p) => p.id));
  const bills = state.bills.filter((b) => ids.has(b.project));
  const [view, setView] = useState<Bill | null>(null);
  const doc = useDocExport();
  const role = user?.role;
  const isClient = role === "client";
  const pname = (id: string) => state.projects.find((p) => p.id === id)?.name ?? id;
  const outstanding = (b: Bill) => billNet(b) - (b.received ?? 0);

  const setStatus = (b: Bill, patch: Partial<Bill>, log: string, msg: string) => {
    update((s) => ({ ...s, bills: s.bills.map((x) => (x.id === b.id ? { ...x, ...patch } : x)) }), log);
    setView(null); notify(msg);
  };

  const open = bills.filter((b) => b.status !== "Paid");
  const receivable = bills.filter((b) => ["Invoiced", "Part Paid", "Certified"].includes(b.status));
  const ageing = [
    { band: "0-30 days", amt: receivable.filter((b) => (b.daysPending ?? 0) <= 30).reduce((a, b) => a + outstanding(b), 0) },
    { band: "31-60 days", amt: receivable.filter((b) => (b.daysPending ?? 0) > 30 && (b.daysPending ?? 0) <= 60).reduce((a, b) => a + outstanding(b), 0) },
    { band: "Over 60 days", amt: 0 },
  ];

  const table = (rows: Bill[]) => (
    <Card pad={false}><Table rows={rows} empty="No bills" cols={[
      { key: "no", label: "Bill" }, ...(isClient ? [] : [{ key: "project", label: "Project", render: (r: Bill) => <span className="block md:max-w-[200px] md:truncate">{pname(r.project)}</span> }]),
      { key: "date", label: "Date", render: (r) => fdate(r.date) },
      { key: "workValue", label: "Work value", align: "right", render: (r) => inr(r.workValue) },
      { key: "net", label: "Net payable", align: "right", render: (r) => inr(billNet(r)) },
      { key: "received", label: "Received", align: "right", render: (r) => (r.received ? inr(r.received) : "—") },
      { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
      { key: "a", label: "", render: (r) => <Button size="sm" variant="secondary" onClick={() => setView(r)}>Open</Button> },
    ]} /></Card>
  );

  return (
    <>
      <PageHeader title={isClient ? "Bills & Payments" : "Billing & Collections"} sub={isClient ? "Every bill for your project, with deductions and payment status" : "Running bills, certification, GST invoices, receipts and follow-up"}
        actions={!isClient && <ExportButtons id="bills" size="md" label="Bill register" />} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Billed (work value)" value={inrShort(bills.reduce((a, b) => a + b.workValue, 0))} icon="Receipt" tone="orange" />
        <Stat label={isClient ? "Paid by you" : "Received"} value={inrShort(bills.reduce((a, b) => a + (b.received ?? 0), 0))} icon="CheckCircle2" tone="green" />
        <Stat label="Outstanding" value={inrShort(receivable.reduce((a, b) => a + outstanding(b), 0))} sub={`${receivable.length} bills`} icon="Clock" tone="red" />
        <Stat label="Retention held" value={inrShort(bills.reduce((a, b) => a + b.retention, 0))} sub="Released after defect period" icon="Lock" tone="blue" />
      </div>
      <Tabs tabs={[
        { id: "o", label: `Open bills (${open.length})`, content: table(open) },
        { id: "a", label: "All bills", content: table(bills) },
        ...(!isClient ? [{ id: "g", label: "Receivables ageing", content: (
          <div className="grid gap-4 lg:grid-cols-3">
            {ageing.map((a) => <Stat key={a.band} label={a.band} value={inrShort(a.amt)} icon="CalendarClock" tone={a.band.startsWith("0") ? "green" : a.band.startsWith("31") ? "amber" : "red"} />)}
            <Card title="Follow-up list" className="lg:col-span-3" pad={false} action={<div className="flex gap-2"><ExportButtons id="recv" /></div>}>
              <Table rows={receivable} cols={[
                { key: "no", label: "Bill" }, { key: "project", label: "Client", render: (r) => state.projects.find((p) => p.id === r.project)?.client },
                { key: "o", label: "Outstanding", align: "right", render: (r) => inr(outstanding(r)) }, { key: "daysPending", label: "Days", align: "right" },
                { key: "x", label: "", render: (r) => <Button size="sm" variant="secondary" icon="Mail" onClick={() => notify(`Payment reminder sent to ${state.projects.find((p) => p.id === r.project)?.client} (demo)`)}>Remind</Button> },
              ]} />
            </Card>
          </div>) }] : []),
      ]} />

      <Modal open={!!view} onClose={() => setView(null)} title={view ? `${view.no} · ${pname(view.project)}` : ""}
        footer={view && (
          <>
            <Button variant="secondary" icon="FileDown" onClick={() => doc(`${view.no} bill PDF`, (s, by) => billPdf(s, view, by))}>Bill PDF</Button>
            {role === "billing" && view.status === "Submitted" && <Button onClick={() => setStatus(view, { status: "Certified", certified: view.workValue, daysPending: 0 }, `Recorded certification for ${view.no}`, `${view.no} certified by client's PMC`)}>Mark certified</Button>}
            {role === "billing" && view.status === "Certified" && <Button onClick={() => setStatus(view, { status: "Invoiced" }, `Raised GST invoice for ${view.no}`, "GST tax invoice generated")}>Raise invoice</Button>}
            {role === "accountant" && ["Invoiced", "Part Paid", "Certified"].includes(view.status) && <Button variant="success" onClick={() => setStatus(view, { status: "Paid", received: billNet(view), paidOn: DEMO_TODAY }, `Recorded receipt for ${view.no}`, `Receipt of ${inrShort(billNet(view) - (view.received ?? 0))} recorded`)}>Record payment</Button>}
            {isClient && view.status === "Invoiced" && <Button variant="success" onClick={() => setStatus(view, { status: "Paid", received: billNet(view), paidOn: DEMO_TODAY }, `Client paid ${view.no}`, "Payment confirmed - thank you")}>Pay now</Button>}
          </>
        )}>
        {view && (
          <div className="text-sm">
            <div className="mb-2 flex items-center justify-between"><span className="text-slate-500">Bill date {fdate(view.date)}</span><Badge>{view.status}</Badge></div>
            <table className="w-full">
              <tbody className="divide-y divide-slate-100">
                <tr><td className="py-1.5">Value of work done (certified)</td><td className="py-1.5 text-right tabular-nums">{inr(view.workValue)}</td></tr>
                <tr><td className="py-1.5">GST @ 18%</td><td className="py-1.5 text-right tabular-nums">{inr(view.gst)}</td></tr>
                <tr className="font-semibold"><td className="py-1.5">Gross bill</td><td className="py-1.5 text-right tabular-nums">{inr(view.workValue + view.gst)}</td></tr>
                <tr><td className="py-1.5 text-slate-500">Less: Retention 5%</td><td className="py-1.5 text-right tabular-nums text-red-600">-{inr(view.retention)}</td></tr>
                {view.advance > 0 && <tr><td className="py-1.5 text-slate-500">Less: Advance recovery 10%</td><td className="py-1.5 text-right tabular-nums text-red-600">-{inr(view.advance)}</td></tr>}
                <tr><td className="py-1.5 text-slate-500">Less: Income Tax TDS 2%</td><td className="py-1.5 text-right tabular-nums text-red-600">-{inr(view.tds)}</td></tr>
                <tr className="text-base font-semibold"><td className="py-2">Net payable</td><td className="py-2 text-right tabular-nums">{inr(billNet(view))}</td></tr>
                {view.received ? <tr className="text-emerald-700"><td className="py-1.5">Received {view.paidOn ? `on ${fdate(view.paidOn)}` : "(part)"}</td><td className="py-1.5 text-right tabular-nums">{inr(view.received)}</td></tr> : null}
              </tbody>
            </table>
            <ol className="mt-4 flex flex-wrap gap-1 text-[11px]">
              {["Draft", "Submitted", "Certified", "Invoiced", "Paid"].map((st, i, arr) => {
                const reached = arr.indexOf(view.status === "Part Paid" ? "Invoiced" : view.status) >= i;
                return <li key={st} className={`rounded-full px-2 py-0.5 ${reached ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"}`}>{st}</li>;
              })}
            </ol>
          </div>
        )}
      </Modal>
    </>
  );
}
