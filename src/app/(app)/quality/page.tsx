"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Stat, Table, Tabs, inputCls } from "@/components/ui";
import { DEMO_TODAY } from "@/lib/data";
import { fdate } from "@/lib/format";
import { useDemo, useMyProjects } from "@/lib/store";
import ExportButtons from "@/components/ExportButtons";

export default function QualityPage() {
  const { state, update, notify, user } = useDemo();
  const mine = useMyProjects();
  const ids = new Set(mine.map((p) => p.id));
  const tests = state.tests.filter((t) => ids.has(t.project));
  const delays = state.delays.filter((d) => ids.has(d.project));
  const [res, setRes] = useState<{ id: string; v: string } | null>(null);
  const [nd, setNd] = useState(false);
  const [fd, setFd] = useState({ project: mine[0]?.id ?? "P-A", cause: "", resp: "Client" });
  const canEdit = user && ["site", "pm"].includes(user.role);

  const saveResult = () => {
    if (!res) return;
    const pass = Number(res.v) >= 25;
    update((s) => ({ ...s, tests: s.tests.map((t) => (t.id === res.id ? { ...t, result: `${res.v} N/mm2`, status: pass ? "Pass" : "Fail" } : t)) }), `Entered result for ${res.id}`);
    notify(pass ? `${res.id} passed` : `${res.id} failed - NCR opened and PM alerted`);
    setRes(null);
  };
  const addDelay = () => {
    if (!fd.cause) return;
    update((s) => ({ ...s, delays: [{ id: `D${s.delays.length + 1}`, project: fd.project, cause: fd.cause, resp: fd.resp as "Client", from: DEMO_TODAY, days: 0, ref: "Email today" }, ...s.delays] }), `Recorded delay: ${fd.cause}`);
    setNd(false); setFd({ ...fd, cause: "" }); notify("Delay recorded - days will count until closed");
  };
  const closeDelay = (id: string) => { update((s) => ({ ...s, delays: s.delays.map((d) => (d.id === id ? { ...d, to: DEMO_TODAY } : d)) }), `Closed delay ${id}`); notify("Delay closed"); };
  const clientDays = delays.filter((d) => d.resp === "Client").reduce((a, d) => a + d.days, 0);

  return (
    <>
      <PageHeader title="Quality & Delays" sub="Tests, non-conformance, and delay register for time extension"
        actions={<><ExportButtons id="quality" size="md" label="Registers" />{canEdit && <Button icon="Hourglass" variant="secondary" onClick={() => setNd(true)}>Record delay</Button>}</>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Tests failed" value={tests.filter((t) => t.status === "Fail").length} sub="NCR open" icon="XCircle" tone="red" />
        <Stat label="Tests due" value={tests.filter((t) => t.status === "Due" || t.status === "Pending").length} icon="FlaskConical" tone="amber" />
        <Stat label="Running delays" value={delays.filter((d) => !d.to).length} icon="Hourglass" tone="orange" />
        <Stat label="Client-caused delay" value={`${clientDays} days`} sub="Basis for extension" icon="CalendarClock" tone="blue" />
      </div>
      <Tabs tabs={[
        { id: "t", label: "Test register", content: (
          <Card pad={false}><Table rows={tests} cols={[
            { key: "id", label: "Test" }, { key: "test", label: "Type" }, { key: "location", label: "Location" },
            { key: "cast", label: "Cast", render: (r) => fdate(r.cast) }, { key: "due", label: "Due", render: (r) => fdate(r.due) },
            { key: "result", label: "Result" }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
            { key: "a", label: "", render: (r) => (canEdit && (r.status === "Due" || r.status === "Pending") ? <Button size="sm" onClick={() => setRes({ id: r.id, v: "" })}>Enter result</Button> : null) },
          ]} /></Card>) },
        { id: "n", label: "NCR", content: (
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2"><b>NCR-014</b><Badge tone="red">Open</Badge></div>
                <p className="mt-1 text-sm text-slate-700">Cube test T-551 (3rd slab, M25) - 28-day strength 22.4 N/mm² against required 25.</p>
                <p className="mt-1 text-sm text-slate-500">Action: core test on 3rd slab ordered by Amit Deshmukh on 04-Nov. Lab visit 08-Nov. Bill item 3.10 flagged until closed.</p>
              </div>
              {user?.role === "pm" && <Button size="sm" variant="success" onClick={() => notify("Core test passed - NCR-014 closed (demo)")}>Close NCR</Button>}
            </div>
          </Card>) },
        { id: "d", label: "Delay register", content: (
          <Card pad={false}><Table rows={delays} cols={[
            { key: "project", label: "Site" }, { key: "cause", label: "Cause", className: "min-w-[220px]" },
            { key: "resp", label: "Responsibility", render: (r) => <Badge tone={r.resp === "Client" ? "amber" : "red"}>{r.resp}</Badge> },
            { key: "from", label: "From", render: (r) => fdate(r.from) }, { key: "to", label: "To", render: (r) => (r.to ? fdate(r.to) : <Badge tone="red">Running</Badge>) },
            { key: "days", label: "Days", align: "right" }, { key: "ref", label: "Ref." },
            { key: "a", label: "", render: (r) => (!r.to && canEdit ? <Button size="sm" variant="secondary" onClick={() => closeDelay(r.id)}>Close</Button> : null) },
          ]} />
          <div className="border-t border-slate-100 p-3 text-xs text-slate-500">Overlap is removed automatically: Shree Sai delays of 18 + 12 days overlap by 9 days = <b>21 net days</b>, agreed with client as extension.</div>
          </Card>) },
      ]} />

      <Modal open={!!res} onClose={() => setRes(null)} title={`Enter result - ${res?.id}`} footer={<><Button variant="secondary" onClick={() => setRes(null)}>Cancel</Button><Button onClick={saveResult}>Save</Button></>}>
        <Field label="Average compressive strength (N/mm²) - required 25"><input className={inputCls} type="number" value={res?.v ?? ""} onChange={(e) => setRes(res && { ...res, v: e.target.value })} placeholder="e.g. 31.5" /></Field>
        <p className="text-xs text-slate-500">Below 25 opens an NCR automatically and alerts the project manager.</p>
      </Modal>
      <Modal open={nd} onClose={() => setNd(false)} title="Record delay (same day)" footer={<><Button variant="secondary" onClick={() => setNd(false)}>Cancel</Button><Button onClick={addDelay}>Save</Button></>}>
        <Field label="Site"><select className={inputCls} value={fd.project} onChange={(e) => setFd({ ...fd, project: e.target.value })}>{mine.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <Field label="Cause"><input className={inputCls} value={fd.cause} onChange={(e) => setFd({ ...fd, cause: e.target.value })} placeholder="e.g. Client decision on facade colour pending" /></Field>
        <Field label="Responsibility"><select className={inputCls} value={fd.resp} onChange={(e) => setFd({ ...fd, resp: e.target.value })}>{["Client", "Company", "Neutral"].map((r) => <option key={r}>{r}</option>)}</select></Field>
      </Modal>
    </>
  );
}
