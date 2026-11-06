"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Stat, inputCls } from "@/components/ui";
import type { ChangeOrder } from "@/lib/data";
import { DEMO_TODAY } from "@/lib/data";
import { fdate, inr, inrShort } from "@/lib/format";
import { useDemo, useMyProjects } from "@/lib/store";
import ExportButtons from "@/components/ExportButtons";

export default function ChangeOrdersPage() {
  const { state, update, notify, user } = useDemo();
  const mine = useMyProjects();
  const ids = new Set(mine.map((p) => p.id));
  const list = state.changeOrders.filter((c) => ids.has(c.project));
  const [add, setAdd] = useState(false);
  const [f, setF] = useState({ project: mine[0]?.id ?? "P-A", title: "", value: "", days: "0" });
  const isClient = user?.role === "client";
  const canCreate = user && ["pm", "billing", "owner"].includes(user.role);

  const decide = (c: ChangeOrder, status: ChangeOrder["status"]) => {
    update((s) => ({
      ...s,
      changeOrders: s.changeOrders.map((x) => (x.id === c.id ? { ...x, status } : x)),
      projects: status === "Approved" ? s.projects.map((p) => (p.id === c.project ? { ...p, value: p.value + c.value } : p)) : s.projects,
    }), `${status} ${c.id}`);
    notify(status === "Approved" ? `${c.id} approved - contract value increased by ${inrShort(c.value)}` : `${c.id} marked ${status}`);
  };
  const save = () => {
    if (!f.title || !f.value) return;
    const id = `CO-${String(state.changeOrders.length + 1).padStart(2, "0")}`;
    update((s) => ({ ...s, changeOrders: [{ id, project: f.project, title: f.title, value: Number(f.value), days: Number(f.days), status: "Pending Client", raised: DEMO_TODAY, by: "Client" }, ...s.changeOrders] }), `Created ${id} and sent to client`);
    setAdd(false); setF({ ...f, title: "", value: "" }); notify(`${id} sent to client for approval`);
  };
  const pending = list.filter((c) => c.status === "Pending Client");

  return (
    <>
      <PageHeader title={isClient ? "Change Approvals" : "Change Orders"} sub={isClient ? "Changes you asked for - approve cost and time before work starts" : "Every client change is priced and approved before it is billed"}
        actions={<>{!isClient && <ExportButtons id="co" size="md" label="Register" />}{canCreate && <Button icon="Plus" onClick={() => setAdd(true)}>New change order</Button>}</>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Pending approval" value={pending.length} sub={inrShort(pending.reduce((a, c) => a + c.value, 0))} icon="Hourglass" tone="amber" />
        <Stat label="Approved value" value={inrShort(list.filter((c) => c.status === "Approved").reduce((a, c) => a + c.value, 0))} icon="CheckCircle2" tone="green" />
        <Stat label="Extra time asked" value={`${pending.reduce((a, c) => a + c.days, 0)} days`} icon="CalendarPlus" tone="blue" />
      </div>
      <div className="space-y-3">
        {list.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><b>{c.id}</b><Badge>{c.status}</Badge><span className="text-xs text-slate-400">{state.projects.find((p) => p.id === c.project)?.name}</span></div>
                <p className="mt-1 text-sm text-slate-700">{c.title}</p>
                <p className="mt-1 text-xs text-slate-500">Asked by {c.by} · raised {fdate(c.raised)} · {c.days ? `+${c.days} days` : "no extra time"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="mr-2 text-lg font-semibold tabular-nums">{inr(c.value)}</span>
                {isClient && c.status === "Pending Client" && (<>
                  <Button size="sm" variant="secondary" onClick={() => decide(c, "On Hold")}>Hold</Button>
                  <Button size="sm" variant="success" onClick={() => decide(c, "Approved")}>Approve</Button>
                </>)}
                {!isClient && c.status === "Pending Client" && <Button size="sm" variant="secondary" icon="Mail" onClick={() => notify(`Reminder sent to client for ${c.id} (demo)`)}>Remind</Button>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={add} onClose={() => setAdd(false)} title="New change order" footer={<><Button variant="secondary" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={save}>Send to client</Button></>}>
        <Field label="Project"><select className={inputCls} value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })}>{mine.filter((p) => p.category !== "Own Project").map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <Field label="Change requested"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Granite instead of Kota on staircase" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Net value (₹)"><input className={inputCls} type="number" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} placeholder="120000" /></Field>
          <Field label="Extra days"><input className={inputCls} type="number" value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} /></Field>
        </div>
      </Modal>
    </>
  );
}
