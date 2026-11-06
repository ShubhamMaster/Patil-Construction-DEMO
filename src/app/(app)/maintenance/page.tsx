"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, Icon, Modal, PageHeader, Progress, Stat, Table, Tabs, inputCls } from "@/components/ui";
import ExportButtons, { useDocExport } from "@/components/ExportButtons";
import type { Complaint, JobCard, Trade } from "@/lib/data";
import { DEMO_TODAY, repairRates, trades } from "@/lib/data";
import { fdate, inr, pct } from "@/lib/format";
import { CLIENT_PROPERTIES, PROPERTIES, jobCost, whoPays } from "@/lib/maint";
import { jobCardPdf } from "@/lib/reports";
import { useDemo } from "@/lib/store";

const tradeIcon: Record<Trade, string> = { Civil: "BrickWall", Tiling: "Grid3x3", Glazing: "AppWindow", Electrical: "Lightbulb", Plumbing: "Droplets", Carpentry: "DoorOpen", Painting: "Paintbrush", Waterproofing: "Umbrella" };

export default function MaintenancePage() {
  const { state, update, notify, user } = useDemo();
  const doc = useDocExport();
  const role = user?.role;
  const isClient = role === "client";
  const canWork = role === "technician" || role === "pm" || role === "owner";
  const [raise, setRaise] = useState(false);
  const [card, setCard] = useState<string | null>(null);
  const [f, setF] = useState({ property: isClient ? "Shree Sai Showroom" : "Sunrise Hospital", location: "", issue: "", priority: "Normal", trade: "Glazing" as Trade, type: isClient ? "Chargeable" : "AMC" });

  const jc = (id: string) => state.jobCards.find((j) => j.complaintId === id);
  const list = isClient ? state.complaints.filter((c) => CLIENT_PROPERTIES.includes(c.property)) : state.complaints;
  const costed = state.complaints.map((c) => ({ c, k: jobCost(jc(c.id), c.type) }));

  const setCardField = (id: string, patch: Partial<JobCard>, log?: string) =>
    update((s) => ({ ...s, jobCards: s.jobCards.some((j) => j.complaintId === id) ? s.jobCards.map((j) => (j.complaintId === id ? { ...j, ...patch } : j)) : [...s.jobCards, { complaintId: id, lines: [], overheadPct: 10, marginPct: 15, estimate: "Not sent", ...patch }] }), log);

  const setStatus = (c: Complaint, status: Complaint["status"]) => {
    const k = jobCost(jc(c.id), c.type);
    if (status === "Closed" && c.type === "Chargeable" && jc(c.id)?.estimate !== "Approved") { notify("Client has not approved the estimate yet"); return; }
    if (status === "Closed" && k.cost === 0) { notify("Add material and labour on the job card before closing"); setCard(c.id); return; }
    update((s) => ({ ...s, complaints: s.complaints.map((x) => (x.id === c.id ? { ...x, status, response: x.response ?? "0h 40m" } : x)) }), `${c.id} → ${status}${status === "Closed" ? ` (cost ${inr(k.cost)})` : ""}`);
    notify(status === "Closed" ? `${c.id} closed - cost ${inr(k.cost)} booked to ${c.property}` : `${c.id} - work started`);
  };
  const decideEstimate = (c: Complaint, ok: boolean) => {
    setCardField(c.id, { estimate: ok ? "Approved" : "Rejected" }, `Client ${ok ? "approved" : "rejected"} estimate for ${c.id}`);
    notify(ok ? "Estimate approved - technician can start the work" : "Estimate rejected - company will contact you");
  };
  const save = () => {
    if (!f.issue) return;
    const id = `CMP-${418 + state.complaints.length - 10}`;
    const type = (isClient ? (f.property === "Shree Sai Showroom" ? "Chargeable" : "Warranty") : f.type) as Complaint["type"];
    update((s) => ({
      ...s,
      complaints: [{ id, property: f.property, location: f.location || "-", issue: f.issue, priority: f.priority as "Normal", reported: `${DEMO_TODAY} ${new Date().toTimeString().slice(0, 5)}`, status: "Open", tech: "Ganesh Bhosale", type, trade: f.trade }, ...s.complaints],
      jobCards: [...s.jobCards, { complaintId: id, lines: [], overheadPct: 10, marginPct: type === "Chargeable" ? 15 : 0, estimate: type === "Chargeable" ? "Not sent" : "Not needed" }],
    }), `Complaint ${id} raised (${f.trade}, ${type})`);
    setRaise(false); setF({ ...f, location: "", issue: "" }); notify(`${id} logged - technician notified`);
  };

  const complaintsView = (
    <div className="space-y-3">
      {list.map((c) => {
        const card = jc(c.id); const k = jobCost(card, c.type);
        return (
          <Card key={c.id}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <b>{c.id}</b><Badge>{c.priority}</Badge><Badge>{c.status}</Badge>
                  <Badge tone="violet">{c.type}</Badge>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"><Icon name={tradeIcon[c.trade]} className="h-3 w-3" />{c.trade}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-800">{c.property} · {c.location}</p>
                <p className="text-sm text-slate-600">{c.issue}</p>
                <p className="mt-1 text-xs text-slate-500">Reported {fdate(c.reported)} · {c.tech}{c.response ? ` · response ${c.response}` : ""}</p>
                {k.cost > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {!isClient && <><span>Material <b>{inr(k.material)}</b></span><span>Labour <b>{inr(k.labour)}</b> ({k.labourHours} h)</span><span>Cost <b>{inr(k.cost)}</b></span></>}
                    {k.chargeable ? <span className="text-orange-700">{isClient ? "Estimate" : "Bill to client"} <b>{inr(k.price)} + GST = {inr(k.total)}</b></span> : <span className="text-violet-700">{whoPays[c.type]}</span>}
                    {k.chargeable && card && <Badge tone={card.estimate === "Approved" ? "green" : card.estimate === "Rejected" ? "red" : "amber"}>{card.invoiceNo ? `Invoiced ${card.invoiceNo}` : `Estimate: ${card.estimate}`}</Badge>}
                  </div>
                )}
                {isClient && card?.estimate === "Sent to client" && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="text-sm font-medium text-amber-900">Estimate for your approval: {inr(k.total)} incl. GST</div>
                    <ul className="mt-1 text-xs text-amber-900/80">{card.lines.map((l) => <li key={l.code}>• {l.item} - {l.qty} {l.unit}</li>)}</ul>
                    <div className="mt-2 flex gap-2"><Button size="sm" variant="success" icon="Check" onClick={() => decideEstimate(c, true)}>Approve estimate</Button><Button size="sm" variant="secondary" onClick={() => decideEstimate(c, false)}>Reject</Button></div>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {canWork && <Button size="sm" variant="secondary" icon="ClipboardList" onClick={() => setCard(c.id)}>Job card</Button>}
                {canWork && c.status === "Open" && <Button size="sm" variant="secondary" icon="Play" onClick={() => setStatus(c, "In Progress")}>Start</Button>}
                {canWork && c.status !== "Closed" && <Button size="sm" variant="success" icon="Camera" onClick={() => setStatus(c, "Closed")}>Close with photo</Button>}
                {card?.invoiceNo && <Button size="sm" variant="secondary" icon="FileDown" onClick={() => doc("Service invoice", (s, by) => jobCardPdf(s, c.id, by))}>Invoice PDF</Button>}
              </div>
            </div>
          </Card>
        );
      })}
      {list.length === 0 && <Card><p className="text-sm text-slate-500">No complaints yet.</p></Card>}
    </div>
  );

  // ---- cost analysis
  const props = PROPERTIES.map((p) => {
    const rows = costed.filter((x) => x.c.property === p);
    return { p, jobs: rows.length, cost: rows.reduce((a, x) => a + x.k.cost, 0), billed: rows.reduce((a, x) => a + x.k.price, 0), amcIncome: p === "Sunrise Hospital" ? 150000 : 0 };
  }).filter((x) => x.jobs > 0);
  const byTrade = trades.map((t) => ({ t, cost: costed.filter((x) => x.c.trade === t).reduce((a, x) => a + x.k.cost, 0), jobs: costed.filter((x) => x.c.trade === t).length })).filter((x) => x.jobs);
  const maxTrade = Math.max(...byTrade.map((x) => x.cost), 1);
  const totalCost = costed.reduce((a, x) => a + x.k.cost, 0);
  const totalBilled = costed.reduce((a, x) => a + x.k.price, 0);

  const analysis = (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Cost and billing by property (this month)" className="lg:col-span-2" pad={false}>
        <Table rows={props} cols={[
          { key: "p", label: "Property" }, { key: "jobs", label: "Jobs", align: "right" },
          { key: "cost", label: "Repair cost", align: "right", render: (r) => inr(r.cost) },
          { key: "billed", label: "Billed (chargeable)", align: "right", render: (r) => (r.billed ? inr(r.billed) : "—") },
          { key: "amcIncome", label: "AMC income / month", align: "right", render: (r) => (r.amcIncome ? inr(r.amcIncome) : "—") },
          { key: "net", label: "Result", align: "right", render: (r) => { const n = r.billed + r.amcIncome - r.cost; return <b className={n >= 0 ? "text-emerald-700" : "text-red-600"}>{inr(n)}</b>; } },
        ]} />
        <p className="border-t border-slate-100 p-3 text-xs text-slate-500">Warranty jobs (Orchid Villa) are free to the client - their cost is the price of the defect period. AMC income is ₹18 L / year = ₹1.5 L per month for Sunrise Hospital.</p>
      </Card>
      <Card title="Repair cost by trade">
        <ul className="space-y-3">
          {byTrade.sort((a, b) => b.cost - a.cost).map((x) => (
            <li key={x.t}>
              <div className="mb-1 flex justify-between text-sm"><span className="flex items-center gap-1.5"><Icon name={tradeIcon[x.t]} className="h-3.5 w-3.5 text-slate-400" />{x.t} <span className="text-xs text-slate-400">({x.jobs})</span></span><span className="tabular-nums">{inr(x.cost)}</span></div>
              <Progress value={pct(x.cost, maxTrade)} tone="bg-orange-500" />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );

  const [rateTrade, setRateTrade] = useState<string>("All");
  const rates = (
    <Card pad={false} title="Repair rate list (used on job cards)" action={
      <select className={`${inputCls} w-40 py-1 text-xs`} value={rateTrade} onChange={(e) => setRateTrade(e.target.value)}>{["All", ...trades].map((t) => <option key={t}>{t}</option>)}</select>}>
      <Table rows={repairRates.filter((r) => rateTrade === "All" || r.trade === rateTrade)} cols={[
        { key: "code", label: "Code" }, { key: "trade", label: "Trade" }, { key: "item", label: "Item" }, { key: "unit", label: "Unit" },
        { key: "rate", label: "Rate", align: "right", render: (r) => inr(r.rate) }, { key: "kind", label: "Type", render: (r) => <Badge tone={r.kind === "Labour" ? "blue" : r.kind === "Service" ? "violet" : "slate"}>{r.kind}</Badge> },
      ]} />
    </Card>
  );

  return (
    <>
      <PageHeader title={isClient ? "Complaints & Service" : "Maintenance & Repairs"} sub={isClient ? "Raise a complaint, approve estimates and track repairs until fixed" : "Complaints, job cards with material + labour costing, estimates, service invoices and planned maintenance"}
        actions={<>{!isClient && <ExportButtons id="mcost" size="md" label="Cost report" />}<Button icon="Plus" onClick={() => setRaise(true)}>Raise complaint</Button></>} />
      {!isClient && (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Open jobs" value={state.complaints.filter((c) => c.status !== "Closed").length} sub={`${state.complaints.filter((c) => c.priority === "Urgent" && c.status !== "Closed").length} urgent`} icon="Wrench" tone="red" />
          <Stat label="Repair cost (Nov)" value={inr(totalCost)} sub="Material + labour + overhead" icon="Coins" tone="orange" />
          <Stat label="Chargeable value" value={inr(totalBilled)} sub="Chargeable jobs, before GST" icon="Receipt" tone="green" />
          <Stat label="Estimates pending" value={state.jobCards.filter((j) => j.estimate === "Sent to client").length} sub="Waiting for client" icon="Hourglass" tone="amber" />
        </div>
      )}
      {isClient ? complaintsView : (
        <Tabs tabs={[
          { id: "c", label: "Complaints & job cards", content: complaintsView },
          { id: "a", label: "Cost analysis", content: analysis },
          { id: "r", label: "Repair rate list", content: rates },
          { id: "p", label: "Planned maintenance", content: (
            <Card pad={false}><Table rows={state.pmJobs} cols={[
              { key: "property", label: "Property" }, { key: "task", label: "Task" }, { key: "freq", label: "Frequency" },
              { key: "due", label: "Due", render: (r) => fdate(r.due) }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
              { key: "a", label: "", render: (r) => (r.status !== "Done" && canWork ? <Button size="sm" variant="success" onClick={() => { update((s) => ({ ...s, pmJobs: s.pmJobs.map((j) => (j.id === r.id ? { ...j, status: "Done" } : j)) }), `Completed ${r.id}`); notify(`${r.task} - done`); }}>Mark done</Button> : null) },
            ]} /></Card>) },
          { id: "m", label: "AMC contracts", content: (
            <Card pad={false} action={<div className="flex gap-2"><ExportButtons id="cmp" /></div>} title="Contracts and complaint register">
              <Table rows={[
                { p: "Sunrise Hospital", scope: "Civil, plumbing, electrical, tiling, waterproofing", value: 1800000, billing: "Quarterly", resp: "4 h urgent / 24 h normal", end: "2027-01-31" },
                { p: "Orchid Villa (defect period)", scope: "Free repairs - interior works", value: 0, billing: "-", resp: "48 h", end: "2027-04-15" },
                { p: "Shree Sai Showroom", scope: "Pay per job - estimate before work", value: 0, billing: "Per job", resp: "24 h", end: "-" },
              ]} cols={[
                { key: "p", label: "Property" }, { key: "scope", label: "Scope" }, { key: "value", label: "Value / yr", align: "right", render: (r) => (r.value ? inr(r.value) : r.billing === "Per job" ? "Per job" : "Free") },
                { key: "billing", label: "Billing" }, { key: "resp", label: "Response time" }, { key: "end", label: "Renewal", render: (r) => fdate(r.end) },
              ]} />
            </Card>) },
        ]} />
      )}

      {card && <JobCardModal id={card} onClose={() => setCard(null)} setCardField={setCardField} />}

      <Modal open={raise} onClose={() => setRaise(false)} title="Raise complaint" footer={<><Button variant="secondary" onClick={() => setRaise(false)}>Cancel</Button><Button onClick={save}>Submit</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Property"><select className={inputCls} value={f.property} onChange={(e) => setF({ ...f, property: e.target.value })}>{(isClient ? CLIENT_PROPERTIES : PROPERTIES).map((p) => <option key={p}>{p}</option>)}</select></Field>
          <Field label="Type of problem"><select className={inputCls} value={f.trade} onChange={(e) => setF({ ...f, trade: e.target.value as Trade })}>{trades.map((t) => <option key={t}>{t}</option>)}</select></Field>
        </div>
        <Field label="Location"><input className={inputCls} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="e.g. 2nd floor - shop 204 window" /></Field>
        <Field label="Problem"><textarea className={inputCls} rows={3} value={f.issue} onChange={(e) => setF({ ...f, issue: e.target.value })} placeholder="e.g. 3 tube lights not working in cabin" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority"><select className={inputCls} value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>{["Normal", "High", "Urgent"].map((p) => <option key={p}>{p}</option>)}</select></Field>
          {!isClient && <Field label="Who pays"><select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{["AMC", "Warranty", "Chargeable"].map((p) => <option key={p}>{p}</option>)}</select></Field>}
        </div>
        <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm text-slate-500"><Icon name="ImagePlus" /> Attach photo (optional)</div>
      </Modal>
    </>
  );
}

function JobCardModal({ id, onClose, setCardField }: { id: string; onClose: () => void; setCardField: (id: string, patch: Partial<JobCard>, log?: string) => void }) {
  const { state, notify } = useDemo();
  const doc = useDocExport();
  const c = state.complaints.find((x) => x.id === id)!;
  const card = state.jobCards.find((j) => j.complaintId === id) ?? { complaintId: id, lines: [], overheadPct: 10, marginPct: c.type === "Chargeable" ? 15 : 0, estimate: c.type === "Chargeable" ? "Not sent" : "Not needed" } as JobCard;
  const k = jobCost(card, c.type);
  const [trade, setTrade] = useState<string>(c.trade);
  const options = repairRates.filter((r) => trade === "All" || r.trade === trade);
  const [code, setCode] = useState(options[0]?.code ?? "");
  const [qty, setQty] = useState("1");

  const setLines = (lines: JobCard["lines"], log?: string) => setCardField(id, { lines }, log);
  const add = () => {
    const r = repairRates.find((x) => x.code === code); const q = Number(qty);
    if (!r || !q) return;
    setLines([...card.lines.filter((l) => l.code !== r.code), { code: r.code, item: r.item, unit: r.unit, qty: q, rate: r.rate, kind: r.kind }], `Job card ${id}: added ${r.item}`);
    setQty("1");
  };
  const lineAmt = (q: number, r: number) => Math.round(q * r);

  return (
    <Modal open onClose={onClose} title={`Job card ${c.id} · ${c.trade}`} footer={<>
      <Button variant="secondary" icon="FileDown" onClick={() => doc(k.chargeable ? "Estimate PDF" : "Job card PDF", (s, by) => jobCardPdf(s, id, by))}>{k.chargeable && !card.invoiceNo ? "Estimate PDF" : card.invoiceNo ? "Invoice PDF" : "Job card PDF"}</Button>
      {k.chargeable && (card.estimate === "Not sent" || card.estimate === "Rejected") && <Button icon="Send" disabled={!k.cost} onClick={() => { setCardField(id, { estimate: "Sent to client" }, `Estimate ${inr(k.total)} sent to client for ${id}`); notify("Estimate sent to client portal for approval"); }}>Send estimate</Button>}
      {k.chargeable && card.estimate === "Approved" && c.status === "Closed" && !card.invoiceNo && <Button variant="success" icon="Receipt" onClick={() => { const no = `SI-00${32 + state.jobCards.filter((j) => j.invoiceNo).length - 2}`; setCardField(id, { invoiceNo: no }, `Service invoice ${no} raised for ${id}`); notify(`Service invoice ${no} raised - ${inr(k.total)}`); }}>Raise invoice</Button>}
      <Button variant="secondary" onClick={onClose}>Done</Button>
    </>}>
      <div className="rounded-lg bg-slate-50 p-3 text-sm">
        <div className="font-medium">{c.property} · {c.location}</div>
        <div className="text-slate-600">{c.issue}</div>
        <div className="mt-1 text-xs text-violet-700">{whoPays[c.type]}</div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Material & labour</div>
        {card.lines.length === 0 && <p className="text-sm text-slate-400">No items yet - add from the repair rate list below.</p>}
        {card.lines.map((l) => (
          <div key={l.code} className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 shrink-0 rounded-full ${l.kind === "Labour" ? "bg-sky-500" : l.kind === "Service" ? "bg-violet-500" : "bg-slate-400"}`} />
            <span className="min-w-0 flex-1 truncate">{l.item}</span>
            <input type="number" min={0} step="0.5" className="w-16 rounded border border-slate-300 px-1.5 py-1 text-right text-sm" value={l.qty}
              onChange={(e) => setLines(card.lines.map((x) => (x.code === l.code ? { ...x, qty: Number(e.target.value) } : x)))} />
            <span className="w-10 text-xs text-slate-500">{l.unit}</span>
            <span className="w-16 text-right text-xs text-slate-500">@{l.rate}</span>
            <span className="w-20 text-right tabular-nums">{inr(lineAmt(l.qty, l.rate))}</span>
            <button className="text-slate-400 hover:text-red-600" onClick={() => setLines(card.lines.filter((x) => x.code !== l.code))} aria-label="Remove"><Icon name="Trash2" className="h-4 w-4" /></button>
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-slate-300 p-2">
          <select className={`${inputCls} w-32 py-1.5`} value={trade} onChange={(e) => { setTrade(e.target.value); const first = repairRates.find((r) => e.target.value === "All" || r.trade === e.target.value); setCode(first?.code ?? ""); }}>{["All", ...trades].map((t) => <option key={t}>{t}</option>)}</select>
          <select className={`${inputCls} min-w-0 flex-1 py-1.5`} value={code} onChange={(e) => setCode(e.target.value)}>{options.map((r) => <option key={r.code} value={r.code}>{r.item} - ₹{r.rate}/{r.unit}</option>)}</select>
          <input className={`${inputCls} w-20 py-1.5`} type="number" min={0} step="0.5" value={qty} onChange={(e) => setQty(e.target.value)} />
          <Button size="sm" icon="Plus" onClick={add}>Add</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Overhead % (transport, consumables)"><input type="number" className={inputCls} value={card.overheadPct} onChange={(e) => setCardField(id, { overheadPct: Number(e.target.value) })} /></Field>
        {k.chargeable && <Field label="Margin %"><input type="number" className={inputCls} value={card.marginPct} onChange={(e) => setCardField(id, { marginPct: Number(e.target.value) })} /></Field>}
      </div>

      <table className="w-full text-sm">
        <tbody className="divide-y divide-slate-100">
          <tr><td className="py-1.5 text-slate-600">Material & services</td><td className="py-1.5 text-right tabular-nums">{inr(k.material)}</td></tr>
          <tr><td className="py-1.5 text-slate-600">Labour ({k.labourHours} hours)</td><td className="py-1.5 text-right tabular-nums">{inr(k.labour)}</td></tr>
          <tr><td className="py-1.5 text-slate-600">Overhead {card.overheadPct}%</td><td className="py-1.5 text-right tabular-nums">{inr(k.overhead)}</td></tr>
          <tr className="font-semibold"><td className="py-1.5">Cost to company</td><td className="py-1.5 text-right tabular-nums">{inr(k.cost)}</td></tr>
          {k.chargeable ? (<>
            <tr><td className="py-1.5 text-slate-600">Margin {card.marginPct}%</td><td className="py-1.5 text-right tabular-nums">{inr(k.margin)}</td></tr>
            <tr><td className="py-1.5 text-slate-600">GST 18%</td><td className="py-1.5 text-right tabular-nums">{inr(k.gst)}</td></tr>
            <tr className="text-base font-semibold text-orange-700"><td className="py-2">Amount to client</td><td className="py-2 text-right tabular-nums">{inr(k.total)}</td></tr>
          </>) : <tr><td colSpan={2} className="py-2 text-xs text-violet-700">Not billed to the client - booked as {c.type === "AMC" ? "AMC" : "defect period"} cost for {c.property}.</td></tr>}
        </tbody>
      </table>
      {k.chargeable && <div className="flex items-center gap-2 text-xs text-slate-500">Estimate status: <Badge tone={card.estimate === "Approved" ? "green" : card.estimate === "Rejected" ? "red" : "amber"}>{card.estimate}</Badge>{card.invoiceNo && <Badge tone="green">Invoice {card.invoiceNo}</Badge>}</div>}
    </Modal>
  );
}
