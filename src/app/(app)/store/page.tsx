"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Stat, Table, Tabs, inputCls } from "@/components/ui";
import { DEMO_TODAY } from "@/lib/data";
import { fdate, inr, inrShort } from "@/lib/format";
import { useDemo, useMyProjects } from "@/lib/store";
import ExportButtons from "@/components/ExportButtons";

export default function StorePage() {
  const { state, update, notify, user } = useDemo();
  const mine = useMyProjects();
  const [indent, setIndent] = useState(false);
  const [grn, setGrn] = useState(false);
  const [fi, setFi] = useState({ project: mine[0]?.id ?? "P-A", item: "Cement OPC 53", qty: "", needBy: "2026-11-12" });
  const [fg, setFg] = useState({ po: "PO-1043", qty: "7", vehicle: "MH15 GV 4521" });
  const sites = new Set(mine.map((p) => p.id));
  const stock = state.stock.filter((s) => sites.has(s.site));
  const low = stock.filter((s) => s.stock < s.min);
  const role = user?.role;

  const raiseIndent = () => {
    if (!fi.qty) return;
    const id = `IND-${320 + state.indents.length}`;
    update((s) => ({ ...s, indents: [{ id, project: fi.project, item: fi.item, qty: fi.qty, needBy: fi.needBy, by: user!.name, status: "Pending Approval" }, ...s.indents] }), `Raised indent ${id}`);
    setIndent(false); notify(`${id} sent to project manager for approval`);
  };
  const saveGrn = () => {
    const po = state.pos.find((p) => p.id === fg.po)!;
    const id = `GRN-${2211 + state.grns.length - 3}`;
    update((s) => ({
      ...s,
      grns: [{ id, po: po.id, project: po.project, item: po.item.split(" - ")[0], qty: `${fg.qty}`, vehicle: fg.vehicle, date: DEMO_TODAY, by: user!.name }, ...s.grns],
      pos: s.pos.map((p) => (p.id === po.id ? { ...p, status: "Delivered" } : p)),
      stock: s.stock.map((st) => (st.site === po.project && po.item.toLowerCase().includes(st.item.split(" ")[0].toLowerCase()) ? { ...st, stock: st.stock + Number(fg.qty) } : st)),
    }), `Created ${id} against ${po.id}`);
    setGrn(false); notify(`${id} saved - stock updated`);
  };
  const raisePO = (id: string) => {
    update((s) => ({ ...s, indents: s.indents.map((i) => (i.id === id ? { ...i, status: "PO Raised" } : i)) }), `Raised PO for ${id}`);
    notify("Purchase order created and emailed to vendor (demo)");
  };

  return (
    <>
      <PageHeader title="Store & Purchase" sub="Indent → quotation → purchase order → receipt → issue, for every site"
        actions={<>
          <ExportButtons id="stock" size="md" label="Stock" />
          {(role === "site" || role === "pm") && <Button icon="PackagePlus" variant="secondary" onClick={() => setIndent(true)}>Raise indent</Button>}
          {(role === "store" || role === "owner") && <Button icon="Truck" onClick={() => setGrn(true)}>Receive material (GRN)</Button>}
        </>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Stock value" value={inrShort(stock.reduce((a, s) => a + s.stock * s.rate, 0))} icon="Warehouse" tone="blue" />
        <Stat label="Low stock" value={low.length} icon="AlertTriangle" tone="red" />
        <Stat label="Open POs" value={state.pos.filter((p) => p.status !== "Delivered").length} icon="FileText" tone="amber" />
        <Stat label="Indents pending" value={state.indents.filter((i) => i.status === "Pending Approval").length} icon="ClipboardList" tone="orange" />
      </div>
      <Tabs tabs={[
        { id: "s", label: "Stock by site", content: (
          <Card pad={false}><Table rows={stock} cols={[
            { key: "site", label: "Site", render: (r) => state.projects.find((p) => p.id === r.site)?.name.split(" (")[0] },
            { key: "item", label: "Material" },
            { key: "stock", label: "In stock", align: "right", render: (r) => <span className={r.stock < r.min ? "font-semibold text-red-600" : ""}>{r.stock.toLocaleString("en-IN")} {r.unit}</span> },
            { key: "min", label: "Min level", align: "right", render: (r) => `${r.min.toLocaleString("en-IN")} ${r.unit}` },
            { key: "rate", label: "Rate", align: "right", render: (r) => inr(r.rate) },
            { key: "x", label: "", render: (r) => (r.stock < r.min ? <Badge tone="red">Low</Badge> : <Badge tone="green">OK</Badge>) },
          ]} /></Card>) },
        { id: "i", label: "Indents", content: (
          <Card pad={false}><Table rows={state.indents} cols={[
            { key: "id", label: "Indent" }, { key: "project", label: "Site" }, { key: "item", label: "Material" }, { key: "qty", label: "Qty" },
            { key: "needBy", label: "Needed by", render: (r) => fdate(r.needBy) }, { key: "by", label: "Raised by" },
            { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
            { key: "a", label: "", render: (r) => (r.status === "Approved" && (role === "store" || role === "owner") ? <Button size="sm" onClick={() => raisePO(r.id)}>Raise PO</Button> : null) },
          ]} /></Card>) },
        { id: "p", label: "Purchase orders", content: (
          <Card pad={false}><Table rows={state.pos} cols={[
            { key: "id", label: "PO" }, { key: "date", label: "Date", render: (r) => fdate(r.date) }, { key: "vendor", label: "Vendor" }, { key: "item", label: "Item" },
            { key: "amount", label: "Amount", align: "right", render: (r) => inr(r.amount) }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
          ]} /></Card>) },
        { id: "g", label: "Receipts (GRN)", content: (
          <Card pad={false}><Table rows={state.grns} cols={[
            { key: "id", label: "GRN" }, { key: "date", label: "Date", render: (r) => fdate(r.date) }, { key: "po", label: "PO" }, { key: "project", label: "Site" },
            { key: "item", label: "Material" }, { key: "qty", label: "Qty" }, { key: "vehicle", label: "Vehicle" }, { key: "by", label: "Received by" },
          ]} /></Card>) },
        { id: "c", label: "Consumption check", content: (
          <Card title="Cement & steel - theoretical vs actual (Shree Sai, Oct)" pad={false}>
            <Table rows={[
              { m: "Cement OPC 53", th: "2,840 bags", ac: "2,965 bags", d: "+4.4%", ok: true },
              { m: "TMT steel", th: "31.6 MT", ac: "32.1 MT", d: "+1.6%", ok: true },
              { m: "AAC blocks", th: "118 cum", ac: "131 cum", d: "+11.0%", ok: false },
            ]} cols={[{ key: "m", label: "Material" }, { key: "th", label: "As per work done", align: "right" }, { key: "ac", label: "Actually issued", align: "right" }, { key: "d", label: "Difference", align: "right" }, { key: "ok", label: "", render: (r) => (r.ok ? <Badge tone="green">Within limit</Badge> : <Badge tone="red">Check wastage</Badge>) }]} />
          </Card>) },
      ]} />

      <Modal open={indent} onClose={() => setIndent(false)} title="Raise material indent" footer={<><Button variant="secondary" onClick={() => setIndent(false)}>Cancel</Button><Button onClick={raiseIndent}>Send for approval</Button></>}>
        <Field label="Site"><select className={inputCls} value={fi.project} onChange={(e) => setFi({ ...fi, project: e.target.value })}>{mine.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <Field label="Material"><select className={inputCls} value={fi.item} onChange={(e) => setFi({ ...fi, item: e.target.value })}>{["Cement OPC 53", "TMT Fe-500D 12 mm", "TMT Fe-500D 16 mm", "Crushed sand", "20 mm aggregate", "AAC blocks 200 mm"].map((m) => <option key={m}>{m}</option>)}</select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity"><input className={inputCls} value={fi.qty} onChange={(e) => setFi({ ...fi, qty: e.target.value })} placeholder="e.g. 300 bags" /></Field>
          <Field label="Needed by"><input type="date" className={inputCls} value={fi.needBy} onChange={(e) => setFi({ ...fi, needBy: e.target.value })} /></Field>
        </div>
        <p className="rounded-lg bg-slate-50 p-2 text-xs text-slate-500">Current stock and BOQ balance are shown to the approver with this request.</p>
      </Modal>

      <Modal open={grn} onClose={() => setGrn(false)} title="Goods receipt (GRN)" footer={<><Button variant="secondary" onClick={() => setGrn(false)}>Cancel</Button><Button onClick={saveGrn}>Save receipt</Button></>}>
        <Field label="Against PO"><select className={inputCls} value={fg.po} onChange={(e) => setFg({ ...fg, po: e.target.value })}>{state.pos.filter((p) => p.status !== "Delivered" && p.status !== "Pending Owner").map((p) => <option key={p.id} value={p.id}>{p.id} · {p.vendor} · {p.item}</option>)}</select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity received"><input className={inputCls} value={fg.qty} onChange={(e) => setFg({ ...fg, qty: e.target.value })} /></Field>
          <Field label="Vehicle no."><input className={inputCls} value={fg.vehicle} onChange={(e) => setFg({ ...fg, vehicle: e.target.value })} /></Field>
        </div>
        <p className="rounded-lg bg-slate-50 p-2 text-xs text-slate-500">Challan photo and weighbridge slip are attached from the mobile app.</p>
      </Modal>
    </>
  );
}
