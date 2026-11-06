"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, Icon, Modal, PageHeader, Stat, inputCls } from "@/components/ui";
import { DEMO_TODAY } from "@/lib/data";
import { fdate } from "@/lib/format";
import { useDemo, useMyProjects } from "@/lib/store";
import ExportButtons from "@/components/ExportButtons";

export default function DailyReportsPage() {
  const { state, update, notify, user } = useDemo();
  const mine = useMyProjects();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ project: mine[0]?.id ?? "P-A", labour: "36", work: "", materials: "", weather: "Clear", issues: "", photos: 0 });
  const canAdd = user && ["site", "supervisor", "pm"].includes(user.role);
  const canApprove = user && ["pm", "owner"].includes(user.role);
  const list = state.dprs.filter((d) => mine.some((p) => p.id === d.project));

  const submit = () => {
    if (!f.work) return;
    const id = `DPR-${f.project.slice(2)}-${300 + state.dprs.length}`;
    update((s) => ({ ...s, dprs: [{ id, project: f.project, date: DEMO_TODAY, by: user!.name, labour: Number(f.labour), work: f.work, materials: f.materials || "-", weather: f.weather, issues: f.issues || "-", status: "Submitted", photos: f.photos }, ...s.dprs] }), `Submitted daily report ${id}`);
    setOpen(false); setF({ ...f, work: "", materials: "", issues: "", photos: 0 }); notify("Daily report submitted - stock and progress updated");
  };
  const approve = (id: string) => { update((s) => ({ ...s, dprs: s.dprs.map((d) => (d.id === id ? { ...d, status: "Approved" } : d)) }), `Approved ${id}`); notify(`${id} approved`); };

  return (
    <>
      <PageHeader title="Daily Progress Reports" sub="Work done, labour, material, weather and problems - from every site, every day"
        actions={<><ExportButtons id="dpr" size="md" label="Summary" />{canAdd && <Button icon="Plus" onClick={() => setOpen(true)}>Today&apos;s report</Button>}</>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Reports this week" value={list.length} icon="ClipboardList" tone="blue" />
        <Stat label="Waiting review" value={list.filter((d) => d.status === "Submitted").length} icon="Eye" tone="amber" />
        <Stat label="Labour yesterday" value={list.filter((d) => d.date === "2026-11-05").reduce((a, d) => a + d.labour, 0)} sub="All your sites" icon="Users" tone="orange" />
        <Stat label="Photos attached" value={list.reduce((a, d) => a + d.photos, 0)} sub="Geo-tagged" icon="Camera" tone="green" />
      </div>
      <div className="space-y-3">
        {list.map((d) => (
          <Card key={d.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-900">{state.projects.find((p) => p.id === d.project)?.name}</span>
                  <Badge>{d.status}</Badge>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{d.id} · {fdate(d.date)} · by {d.by}</div>
                <p className="mt-2 text-sm text-slate-700">{d.work}</p>
                <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                  <span className="flex items-center gap-1.5"><Icon name="Users" className="h-3.5 w-3.5" />{d.labour} labour</span>
                  <span className="flex items-center gap-1.5"><Icon name="Package" className="h-3.5 w-3.5" />{d.materials}</span>
                  <span className="flex items-center gap-1.5"><Icon name="CloudSun" className="h-3.5 w-3.5" />{d.weather}</span>
                  <span className="flex items-center gap-1.5"><Icon name="Camera" className="h-3.5 w-3.5" />{d.photos} photos</span>
                </div>
                {d.issues !== "-" && <div className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800"><b>Issue:</b> {d.issues}</div>}
              </div>
              {canApprove && d.status === "Submitted" && <Button size="sm" variant="success" icon="Check" onClick={() => approve(d.id)}>Approve</Button>}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Daily report - ${fdate(DEMO_TODAY)}`} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Save draft</Button><Button onClick={submit}>Submit report</Button></>}>
        <Field label="Site"><select className={inputCls} value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })}>{mine.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <Field label="Work done today (link to BOQ items)"><textarea className={inputCls} rows={3} value={f.work} onChange={(e) => setF({ ...f, work: e.target.value })} placeholder="e.g. 4th slab shuttering completed; RCC M25 columns C19-C24 - 12.5 cum" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Labour present"><input className={inputCls} type="number" value={f.labour} onChange={(e) => setF({ ...f, labour: e.target.value })} /></Field>
          <Field label="Weather"><select className={inputCls} value={f.weather} onChange={(e) => setF({ ...f, weather: e.target.value })}>{["Clear", "Cloudy", "Light rain", "Heavy rain - work stopped"].map((w) => <option key={w}>{w}</option>)}</select></Field>
        </div>
        <Field label="Material used"><input className={inputCls} value={f.materials} onChange={(e) => setF({ ...f, materials: e.target.value })} placeholder="Cement 110 bags, steel 2.1 MT" /></Field>
        <Field label="Problems / instructions"><input className={inputCls} value={f.issues} onChange={(e) => setF({ ...f, issues: e.target.value })} placeholder="Optional" /></Field>
        <button onClick={() => { setF({ ...f, photos: f.photos + 1 }); notify("Photo captured with GPS and time stamp"); }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:border-orange-400 hover:text-orange-700">
          <Icon name="Camera" /> Add photo {f.photos > 0 && `(${f.photos} added)`}
        </button>
      </Modal>
    </>
  );
}
