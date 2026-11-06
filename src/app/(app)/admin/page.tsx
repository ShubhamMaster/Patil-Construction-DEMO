"use client";

import { Badge, Button, Card, PageHeader, Table, Tabs } from "@/components/ui";
import { DEMO_TODAY, licences, rateLibrary, roleLabel, users, type Role } from "@/lib/data";
import { fdate, inr } from "@/lib/format";
import { useDemo } from "@/lib/store";
import ExportButtons from "@/components/ExportButtons";

const modules = ["Projects", "Enquiries", "Daily reports", "Store", "Billing", "Change orders", "Payments", "Maintenance", "Reports", "Admin"];
const matrix: Record<Role, string> = {
  owner: "AAAAAAAAAA", admin: "VV-V-V-V-VA", sales: "VE------VV-", pm: "EVAEVEVEV-", site: "V-EE-V----",
  supervisor: "--E-------", store: "V--E------", billing: "V---EE--V-", accountant: "V---VVE-V-", technician: "-------E--", client: "V---VA-E--",
};
const cell = (c: string) => (c === "A" ? <Badge tone="green">Approve</Badge> : c === "E" ? <Badge tone="blue">Edit</Badge> : c === "V" ? <Badge tone="slate">View</Badge> : <span className="text-slate-300">—</span>);

export default function AdminPage() {
  const { state, notify } = useDemo();
  const days = (d: string) => Math.round((new Date(d).getTime() - new Date(DEMO_TODAY).getTime()) / 86400000);
  return (
    <>
      <PageHeader title="Admin & Masters" sub="Users, role permissions, company documents, rate library and audit trail"
        actions={<Button icon="UserPlus" onClick={() => notify("New user form (demo)")}>Add user</Button>} />
      <Tabs tabs={[
        { id: "u", label: "Users", content: (
          <Card pad={false}><Table rows={users} cols={[
            { key: "name", label: "Name", render: (r) => <span className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-[10px] font-semibold text-orange-700">{r.initials}</span>{r.name}</span> },
            { key: "role", label: "Role", render: (r) => <Badge tone={r.role === "client" ? "blue" : "orange"}>{roleLabel[r.role]}</Badge> },
            { key: "email", label: "Email" }, { key: "phone", label: "Mobile" },
            { key: "projects", label: "Projects", render: (r) => (r.projects.includes("*") ? "All" : r.projects.join(", ")) },
            { key: "s", label: "Status", render: () => <Badge tone="green">Active</Badge> },
          ]} /></Card>) },
        { id: "r", label: "Role permissions", content: (
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-xs">
                <thead><tr className="border-b border-slate-200 bg-slate-50 text-slate-500"><th className="px-3 py-2 text-left">Role</th>{modules.map((m) => <th key={m} className="px-2 py-2">{m}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {(Object.keys(matrix) as Role[]).map((r) => (
                    <tr key={r}><td className="px-3 py-2 font-medium text-slate-700">{roleLabel[r]}</td>{modules.map((m, i) => <td key={m} className="px-2 py-2 text-center">{cell(matrix[r][i])}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-slate-100 p-3 text-xs text-slate-500">Approval limits: purchase orders and site expenses above ₹5,00,000 and ₹25,000 need owner approval. Users cannot approve their own entries.</p>
          </Card>) },
        { id: "l", label: "Licences & policies", content: (
          <Card pad={false}><Table rows={[...licences].sort((a, b) => a.expiry.localeCompare(b.expiry))} cols={[
            { key: "name", label: "Document" }, { key: "number", label: "Number" }, { key: "expiry", label: "Expiry", render: (r) => fdate(r.expiry) },
            { key: "d", label: "Days left", render: (r) => <Badge tone={days(r.expiry) <= 30 ? "red" : days(r.expiry) <= 60 ? "amber" : "green"}>{days(r.expiry)} days</Badge> },
          ]} /></Card>) },
        { id: "m", label: "Rate library", content: (
          <Card pad={false}><Table rows={rateLibrary} cols={[
            { key: "code", label: "Code" }, { key: "item", label: "Item" }, { key: "unit", label: "Unit" },
            { key: "rate", label: "Rate", align: "right", render: (r) => inr(r.rate) }, { key: "updated", label: "Updated", render: (r) => fdate(r.updated) },
          ]} /></Card>) },
        { id: "a", label: "Audit trail", content: (
          <Card pad={false} title="Every action, with user and time" action={<div className="flex gap-2"><ExportButtons id="audit" /></div>}><Table rows={state.auditLog} cols={[{ key: "at", label: "Time", render: (r) => fdate(r.at) }, { key: "user", label: "User" }, { key: "action", label: "Action" }]} /></Card>) },
      ]} />
    </>
  );
}
