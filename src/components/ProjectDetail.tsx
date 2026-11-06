"use client";

import Link from "next/link";
import { boq, docs, photos } from "@/lib/data";
import { billNet, fdate, inr, inrShort, pct } from "@/lib/format";
import { useDemo } from "@/lib/store";
import { Badge, Card, Empty, Icon, PageHeader, PhotoTile, Progress, Stat, Table, Tabs } from "./ui";

export default function ProjectDetail({ id }: { id: string }) {
  const { state, user } = useDemo();
  const p = state.projects.find((x) => x.id === id);
  if (!p || !user) return <Empty text="Project not found" />;
  if (!user.projects.includes("*") && !user.projects.includes(p.id)) return <Empty text="This project is not assigned to you." />;

  const isClient = user.role === "client";
  const seeCost = ["owner", "pm", "billing", "accountant"].includes(user.role);
  const bills = state.bills.filter((b) => b.project === p.id);
  const cos = state.changeOrders.filter((c) => c.project === p.id);
  const delays = state.delays.filter((d) => d.project === p.id);
  const dprs = state.dprs.filter((d) => d.project === p.id);
  const items = boq[p.id] ?? [];
  const margin = p.value - p.budget;

  const overview = (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Project details" className="lg:col-span-2">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {[
            ["Client", p.client], ["Category", p.category], ["Type", p.type], ["Location", p.location],
            ["Start date", fdate(p.start)], ["Completion date", fdate(p.end)], ["Project manager", p.pm], ["Site engineer", p.engineer],
          ].map(([k, v]) => (<div key={k}><dt className="text-xs text-slate-400">{k}</dt><dd className="font-medium text-slate-800">{v}</dd></div>))}
        </dl>
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Actual {p.progress}%</span><span>Planned {p.planned}%</span></div>
          <Progress value={p.progress} planned={p.planned} />
        </div>
      </Card>
      <Card title="Recent activity">
        <ul className="space-y-3 text-sm">
          {dprs.slice(0, 3).map((d) => <li key={d.id}><div className="text-xs text-slate-400">{fdate(d.date)} · {d.by}</div>{d.work}</li>)}
          {dprs.length === 0 && <li className="text-slate-400">No daily reports yet.</li>}
        </ul>
      </Card>
    </div>
  );

  const boqTab = items.length ? (
    <Card pad={false}>
      <Table rows={items} cols={[
        { key: "code", label: "Item" }, { key: "desc", label: "Description", className: "min-w-[220px]" }, { key: "unit", label: "Unit" },
        { key: "qty", label: "Contract qty", align: "right", render: (r) => r.qty.toLocaleString("en-IN") },
        { key: "executed", label: "Executed", align: "right", render: (r) => r.executed.toLocaleString("en-IN") },
        { key: "rate", label: "Rate", align: "right", render: (r) => inr(r.rate) },
        ...(seeCost ? [{ key: "budgetRate", label: "Cost rate", align: "right" as const, render: (r: typeof items[number]) => inr(r.budgetRate) },
          { key: "m", label: "Margin", align: "right" as const, render: (r: typeof items[number]) => <span className="text-emerald-700">{pct(r.rate - r.budgetRate, r.rate)}%</span> }] : []),
        { key: "bal", label: "Done", render: (r) => <div className="w-20"><Progress value={pct(r.executed, r.qty)} tone="bg-sky-500" /></div> },
      ]} />
    </Card>
  ) : <Empty text="BOQ not applicable for this project type (see budget)." />;

  const billsTab = (
    <Card pad={false}>
      <Table rows={bills} empty="No bills yet" cols={[
        { key: "no", label: "Bill" }, { key: "date", label: "Date", render: (r) => fdate(r.date) },
        { key: "workValue", label: "Work value", align: "right", render: (r) => inr(r.workValue) },
        { key: "net", label: "Net payable", align: "right", render: (r) => inr(billNet(r)) },
        { key: "received", label: "Received", align: "right", render: (r) => (r.received ? inr(r.received) : "—") },
        { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
      ]} />
    </Card>
  );

  const coTab = (
    <Card pad={false}>
      <Table rows={cos} empty="No change orders" cols={[
        { key: "id", label: "No." }, { key: "title", label: "Change", className: "min-w-[240px]" }, { key: "by", label: "Asked by" },
        { key: "value", label: "Value", align: "right", render: (r) => inr(r.value) }, { key: "days", label: "Extra days", align: "right" },
        { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
      ]} />
    </Card>
  );

  const delayTab = (
    <Card pad={false}>
      <Table rows={delays} empty="No delays recorded" cols={[
        { key: "cause", label: "Cause", className: "min-w-[220px]" }, { key: "resp", label: "Responsibility", render: (r) => <Badge tone={r.resp === "Client" ? "amber" : r.resp === "Company" ? "red" : "slate"}>{r.resp}</Badge> },
        { key: "from", label: "From", render: (r) => fdate(r.from) }, { key: "to", label: "To", render: (r) => (r.to ? fdate(r.to) : <Badge tone="red">Running</Badge>) },
        { key: "days", label: "Days", align: "right" }, { key: "ref", label: "Reference" },
      ]} />
    </Card>
  );

  const photoTab = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.filter((x) => x.project === p.id).map((x) => <PhotoTile key={x.id} {...x} />)}
      {photos.filter((x) => x.project === p.id).length === 0 && <Empty text="No photos yet" />}
    </div>
  );

  const docTab = (
    <Card pad={false}>
      <Table rows={docs.filter((d) => d.project === p.id && (!isClient || d.folder !== "Insurance"))} empty="No documents" cols={[
        { key: "name", label: "Document", render: (r) => <span className="flex items-center gap-2"><Icon name="FileText" className="h-4 w-4 text-slate-400" />{r.name}</span> },
        { key: "folder", label: "Folder" }, { key: "rev", label: "Revision" }, { key: "date", label: "Date", render: (r) => fdate(r.date) }, { key: "by", label: "By" },
      ]} />
    </Card>
  );

  const tabs = [
    { id: "o", label: "Overview", content: overview },
    ...(p.category !== "Maintenance" ? [{ id: "b", label: "BOQ & Measurement", content: boqTab }] : []),
    ...(!["site", "supervisor", "store"].includes(user.role) ? [{ id: "bl", label: "Bills", content: billsTab }] : []),
    { id: "c", label: "Change Orders", content: coTab },
    ...(!isClient ? [{ id: "d", label: "Delays", content: delayTab }] : []),
    { id: "p", label: "Photos", content: photoTab },
    { id: "doc", label: "Documents", content: docTab },
  ];

  return (
    <>
      {!isClient && <Link href="/projects" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-700"><Icon name="ArrowLeft" className="h-4 w-4" />All projects</Link>}
      <PageHeader title={p.name} sub={`${p.code} · ${p.client} · ${p.location}`} actions={<Badge>{p.status}</Badge>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Progress" value={`${p.progress}%`} sub={`Planned ${p.planned}%`} icon="TrendingUp" tone={p.progress + 3 < p.planned ? "amber" : "green"} />
        <Stat label={p.category === "Own Project" ? "Expected sales" : "Contract value"} value={inrShort(p.value)} sub={p.type} icon="FileText" tone="orange" />
        {seeCost ? (
          <>
            <Stat label="Cost to date" value={inrShort(p.cost)} sub={`Budget ${inrShort(p.budget)} · ${pct(p.cost, p.budget)}% used`} icon="Coins" tone="blue" />
            <Stat label="Expected margin" value={inrShort(margin)} sub={`${pct(margin, p.value)}% of value`} icon="PiggyBank" tone="green" />
          </>
        ) : (
          <>
            <Stat label={isClient ? "Paid so far" : "Received"} value={inrShort(p.received)} sub={`Billed ${inrShort(p.billed)}`} icon="CheckCircle2" tone="green" />
            <Stat label="Completion" value={fdate(p.end)} sub={`Started ${fdate(p.start)}`} icon="CalendarDays" tone="blue" />
          </>
        )}
      </div>
      <Tabs tabs={tabs} />
    </>
  );
}
