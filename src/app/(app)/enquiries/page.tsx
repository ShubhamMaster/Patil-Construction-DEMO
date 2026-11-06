"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Stat, Table, Tabs, inputCls } from "@/components/ui";
import type { Enquiry } from "@/lib/data";
import { DEMO_TODAY } from "@/lib/data";
import { fdate, inr, inrShort, pct } from "@/lib/format";
import { useDemo } from "@/lib/store";
import ExportButtons, { useDocExport } from "@/components/ExportButtons";
import { quotationPdf } from "@/lib/reports";

const stages: Enquiry["stage"][] = ["New", "Site Visit", "Estimating", "Quoted", "Negotiation", "Won", "Lost"];

export default function EnquiriesPage() {
  const { state, update, notify, user } = useDemo();
  const [add, setAdd] = useState(false);
  const [quote, setQuote] = useState<Enquiry | null>(null);
  const doc = useDocExport();
  const [form, setForm] = useState({ client: "", work: "", source: "Direct", value: "" });
  const list = state.enquiries;
  const open = list.filter((e) => e.stage !== "Won" && e.stage !== "Lost");
  const won = list.filter((e) => e.stage === "Won").length, lost = list.filter((e) => e.stage === "Lost").length;

  const move = (e: Enquiry, dir: 1 | -1) => {
    const i = stages.indexOf(e.stage);
    const next = stages[Math.min(stages.length - 2, Math.max(0, i + dir))];
    update((s) => ({ ...s, enquiries: s.enquiries.map((x) => (x.id === e.id ? { ...x, stage: next } : x)) }), `Moved ${e.id} to ${next}`);
    notify(`${e.id} moved to ${next}`);
  };
  const markWon = (e: Enquiry) => {
    update((s) => ({ ...s, enquiries: s.enquiries.map((x) => (x.id === e.id ? { ...x, stage: "Won", note: "Converted to contract & project" } : x)) }), `Won ${e.id} - converted to contract`);
    notify(`${e.id} won - contract and project created`);
  };
  const save = () => {
    if (!form.client || !form.work) return;
    const id = `ENQ-${130 + list.length}`;
    update((s) => ({ ...s, enquiries: [{ id, client: form.client, work: form.work, source: form.source, value: Number(form.value) * 100000 || 0, stage: "New", owner: user?.name ?? "", followUp: DEMO_TODAY, note: "New enquiry" }, ...s.enquiries] }), `Added enquiry ${id}`);
    setAdd(false); setForm({ client: "", work: "", source: "Direct", value: "" }); notify(`${id} added to pipeline`);
  };

  const board = (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {stages.map((st) => {
        const col = list.filter((e) => e.stage === st);
        return (
          <div key={st} className="w-64 shrink-0 rounded-xl bg-slate-100/80 p-2">
            <div className="mb-2 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>{st}</span><span>{col.length} · {inrShort(col.reduce((a, e) => a + e.value, 0))}</span>
            </div>
            <div className="space-y-2">
              {col.map((e) => (
                <div key={e.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
                  <div className="flex items-start justify-between gap-1"><span className="font-medium text-slate-800">{e.client}</span><span className="text-[10px] text-slate-400">{e.id}</span></div>
                  <div className="text-xs text-slate-500">{e.work}</div>
                  <div className="mt-2 flex items-center justify-between text-xs"><b>{inrShort(e.value)}</b><span className={e.followUp <= DEMO_TODAY && st !== "Won" && st !== "Lost" ? "font-medium text-red-600" : "text-slate-400"}>{e.followUp === "-" ? "" : `Follow ${fdate(e.followUp).slice(0, 6)}`}</span></div>
                  <div className="mt-1 text-[11px] text-slate-400">{e.note}</div>
                  {st !== "Won" && st !== "Lost" && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost" onClick={() => move(e, -1)}>◀</Button>
                      <Button size="sm" variant="secondary" onClick={() => move(e, 1)}>Next ▶</Button>
                      {(st === "Quoted" || st === "Negotiation") && <Button size="sm" variant="secondary" onClick={() => setQuote(e)}>Quote</Button>}
                      {st === "Negotiation" && <Button size="sm" variant="success" onClick={() => markWon(e)}>Won</Button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <PageHeader title="Enquiries & Quotations" sub="Sales pipeline from first call to signed contract" actions={<><ExportButtons id="enq" size="md" label="Pipeline" /><Button icon="Plus" onClick={() => setAdd(true)}>New enquiry</Button></>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open enquiries" value={open.length} icon="Briefcase" tone="orange" />
        <Stat label="Pipeline value" value={inrShort(open.reduce((a, e) => a + e.value, 0))} icon="TrendingUp" tone="blue" />
        <Stat label="Win rate" value={`${pct(won, won + lost)}%`} sub={`${won} won · ${lost} lost`} icon="Trophy" tone="green" />
        <Stat label="Follow-ups due" value={open.filter((e) => e.followUp <= DEMO_TODAY).length} icon="PhoneCall" tone="red" />
      </div>
      <Tabs tabs={[
        { id: "b", label: "Pipeline board", content: board },
        { id: "l", label: "List", content: (
          <Card pad={false}><Table rows={list} cols={[
            { key: "id", label: "No." }, { key: "client", label: "Client" }, { key: "work", label: "Work" }, { key: "source", label: "Source" },
            { key: "value", label: "Value", align: "right", render: (r) => inrShort(r.value) }, { key: "stage", label: "Stage", render: (r) => <Badge>{r.stage}</Badge> },
            { key: "followUp", label: "Follow-up", render: (r) => fdate(r.followUp) }, { key: "owner", label: "Owner" },
          ]} /></Card>) },
      ]} />

      <Modal open={add} onClose={() => setAdd(false)} title="New enquiry" footer={<><Button variant="secondary" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={save}>Save enquiry</Button></>}>
        <Field label="Client name"><input className={inputCls} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="e.g. Hotel Panchavati" /></Field>
        <Field label="Type of work"><input className={inputCls} value={form.work} onChange={(e) => setForm({ ...form, work: e.target.value })} placeholder="e.g. Renovation of 24 rooms" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source"><select className={inputCls} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>{["Direct", "Architect", "Reference", "Repeat client", "Website", "Tender"].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Expected value (₹ lakh)"><input className={inputCls} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="78" /></Field>
        </div>
      </Modal>

      <Modal open={!!quote} onClose={() => setQuote(null)} title={`Quotation - ${quote?.client ?? ""}`} footer={<><Button variant="secondary" icon="FileDown" onClick={() => quote && doc("Quotation PDF", (_s, by) => quotationPdf(quote, by))}>Quotation PDF</Button><Button icon="Send" onClick={() => { notify("Quotation emailed to client (demo)"); setQuote(null); }}>Email to client</Button></>}>
        {quote && (
          <div className="text-sm">
            <div className="rounded-lg bg-slate-50 p-3"><div className="font-semibold">{quote.work}</div><div className="text-xs text-slate-500">{quote.id} · Version 2 · valid 30 days</div></div>
            <table className="mt-3 w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {[["Estimated cost", quote.value * 0.89], ["Overheads (4%)", quote.value * 0.89 * 0.04], ["Profit margin", quote.value - quote.value * 0.89 * 1.04]].map(([k, v]) => (
                  <tr key={k as string}><td className="py-2 text-slate-600">{k}</td><td className="py-2 text-right tabular-nums">{inr(v as number)}</td></tr>
                ))}
                <tr className="font-semibold"><td className="py-2">Quoted amount (excl. GST)</td><td className="py-2 text-right">{inr(quote.value)}</td></tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-slate-500">Terms: 10% advance, monthly running bills, 5% retention, 12-month defect period. Margin is visible only to the company, not printed for the client.</p>
          </div>
        )}
      </Modal>
    </>
  );
}
