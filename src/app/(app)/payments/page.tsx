"use client";

import { Badge, Button, Card, PageHeader, Stat, Table, Tabs } from "@/components/ui";
import type { Payable } from "@/lib/data";
import { DEMO_TODAY } from "@/lib/data";
import { fdate, inr, inrShort } from "@/lib/format";
import { useDemo } from "@/lib/store";
import ExportButtons, { useDocExport } from "@/components/ExportButtons";
import { payslipPdf } from "@/lib/reports";
import WageSheet from "@/components/WageSheet";
import { WEEK } from "@/lib/wages";

export default function PaymentsPage() {
  const { state, update, notify, user } = useDemo();
  const role = user?.role;
  const canPay = role === "accountant" || role === "owner";
  const doc = useDocExport();
  const canApprove = role === "pm" || role === "owner";
  const open = state.payables.filter((p) => p.status !== "Paid");
  const net = (s: (typeof state.staff)[number]) => s.basic + s.allowance + s.incentive - s.advance - Math.round(s.basic * 0.12);

  const setPay = (p: Payable, status: Payable["status"], msg: string) => {
    update((s) => ({ ...s, payables: s.payables.map((x) => (x.id === p.id ? { ...x, status } : x)), wageRows: p.id === WEEK.payableId && status === "Paid" ? s.wageRows.map((r) => ({ ...r, paid: true })) : s.wageRows }), `${msg} ${p.id}`);
    notify(`${p.party}: ${msg.toLowerCase()}`);
  };
  const runPayroll = () => {
    update((s) => ({ ...s, staff: s.staff.map((x) => ({ ...x, status: "Paid" })) }), "Processed November salary for all staff");
    notify("November salary processed - payslips generated");
  };

  return (
    <>
      <PageHeader title="Payments & Payroll" sub="Everyone the company pays - wages, salaries, subcontractors, suppliers and machinery hire" actions={<ExportButtons id="pay" size="md" label="Payment plan" />} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open payables" value={inrShort(open.reduce((a, p) => a + p.amount, 0))} sub={`${open.length} bills`} icon="ArrowUpCircle" tone="red" />
        <Stat label="Due in 7 days" value={inrShort(open.filter((p) => p.due <= "2026-11-13").reduce((a, p) => a + p.amount, 0))} icon="CalendarClock" tone="amber" />
        <Stat label="Monthly salary" value={inrShort(state.staff.reduce((a, s) => a + net(s), 0))} sub={`${state.staff.length} staff`} icon="Users" tone="blue" />
        <Stat label="Bank balance (demo)" value="₹42.80 L" sub="Main + site accounts" icon="Landmark" tone="green" />
      </div>
      <Tabs tabs={[
        { id: "p", label: "Payment plan", content: (
          <Card pad={false}><Table rows={state.payables} cols={[
            { key: "party", label: "Party", className: "min-w-[180px]" }, { key: "type", label: "Type", render: (r) => <Badge tone="slate">{r.type}</Badge> },
            { key: "project", label: "Site" }, { key: "ref", label: "Reference" },
            { key: "due", label: "Due", render: (r) => <span className={r.due < DEMO_TODAY && r.status !== "Paid" ? "font-medium text-red-600" : ""}>{fdate(r.due)}</span> },
            { key: "amount", label: "Amount", align: "right", render: (r) => inr(r.amount) }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
            { key: "a", label: "", render: (r) => r.status === "Pending Approval" && canApprove ? <Button size="sm" variant="success" onClick={() => setPay(r, "Due", "Approved")}>Approve</Button>
              : r.status === "Due" && canPay ? <Button size="sm" onClick={() => setPay(r, "Paid", "Paid")}>Pay</Button> : null },
          ]} /></Card>) },
        { id: "s", label: "Staff salary (Nov)", content: (
          <Card pad={false} title="Salary sheet - November 2026" action={<div className="flex flex-wrap gap-2"><ExportButtons id="salary" />{canPay && <Button size="sm" icon="Play" onClick={runPayroll} disabled={state.staff.every((s) => s.status === "Paid")}>Process salary</Button>}</div>}>
            <Table rows={state.staff} cols={[
              { key: "name", label: "Employee" }, { key: "designation", label: "Designation" },
              { key: "basic", label: "Basic", align: "right", render: (r) => inr(r.basic) }, { key: "allowance", label: "Site allow.", align: "right", render: (r) => inr(r.allowance) },
              { key: "incentive", label: "Incentive", align: "right", render: (r) => (r.incentive ? <span className="text-emerald-700">{inr(r.incentive)}</span> : "—") },
              { key: "pf", label: "PF 12%", align: "right", render: (r) => `-${inr(Math.round(r.basic * 0.12))}` },
              { key: "advance", label: "Advance rec.", align: "right", render: (r) => (r.advance ? `-${inr(r.advance)}` : "—") },
              { key: "net", label: "Net pay", align: "right", render: (r) => <b>{inr(net(r))}</b> }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
              { key: "slip", label: "", render: (r) => <Button size="sm" variant="ghost" icon="FileDown" onClick={() => doc(`Payslip of ${r.name}`, (_s, by) => payslipPdf(r, by))}>Payslip</Button> },
            ]} />
          </Card>) },
        { id: "w", label: "Labour wages (weekly)", content: <WageSheet /> },
        { id: "c", label: "Subcontractors", content: (
          <Card pad={false}><Table rows={[
            { sc: "Shiv Steel Works", work: "Bar bending - Shree Sai", billed: 1420000, paid: 1183500, ret: 71000, margin: "7.9%" },
            { sc: "Perfect Plaster Co.", work: "Internal plaster - Greenfield", billed: 612000, paid: 581400, ret: 30600, margin: "11.2%" },
            { sc: "AquaSeal Waterproofing", work: "Terrace - Greenfield", billed: 245000, paid: 232750, ret: 12250, margin: "18.0%" },
          ]} cols={[
            { key: "sc", label: "Subcontractor" }, { key: "work", label: "Work" }, { key: "billed", label: "Billed", align: "right", render: (r) => inr(r.billed) },
            { key: "paid", label: "Paid", align: "right", render: (r) => inr(r.paid) }, { key: "ret", label: "Retention 5%", align: "right", render: (r) => inr(r.ret) },
            { key: "margin", label: "Our margin", align: "right" },
          ]} /></Card>) },
      ]} />
    </>
  );
}
