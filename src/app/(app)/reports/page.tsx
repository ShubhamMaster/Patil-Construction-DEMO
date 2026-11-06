"use client";

import { BarChart, Card, Icon, PageHeader, Stat, Table, Tabs } from "@/components/ui";
import ExportButtons from "@/components/ExportButtons";
import { reportDefs } from "@/lib/reports";
import { monthly } from "@/lib/data";
import { inr, inrShort, pct } from "@/lib/format";
import { useDemo } from "@/lib/store";

export default function ReportsPage() {
  const { state } = useDemo();
  const ps = state.projects;
  const groups = Array.from(new Set(reportDefs.map((r) => r.group)));
  const groupIcon: Record<string, string> = { Management: "Crown", Billing: "Receipt", Payments: "Wallet", Store: "Package", Site: "HardHat", Sales: "Briefcase", Maintenance: "Wrench", Admin: "Settings" };

  return (
    <>
      <PageHeader title="Reports & MIS" sub="Monthly management reports - filter by project, client, category or period"
        actions={<ExportButtons id="mis" size="md" label="Monthly MIS" />} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Billed this year" value={inrShort(monthly.reduce((a, m) => a + m.billed, 0))} icon="Receipt" tone="orange" />
        <Stat label="Collected" value={inrShort(monthly.reduce((a, m) => a + m.received, 0))} icon="CheckCircle2" tone="green" />
        <Stat label="Cost incurred" value={inrShort(monthly.reduce((a, m) => a + m.cost, 0))} icon="Coins" tone="slate" />
        <Stat label="Funds blocked" value={inrShort(ps.reduce((a, p) => a + p.retention, 0) + 4500000)} sub="Retention + BGs" icon="Lock" tone="blue" />
      </div>
      <Tabs tabs={[
        { id: "rc", label: "Report center", content: (
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g}>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Icon name={groupIcon[g] ?? "FileText"} className="h-3.5 w-3.5" />{g}</h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {reportDefs.filter((r) => r.group === g).map((r) => (
                    <div key={r.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div>
                        <div className="flex items-center gap-2 font-medium text-slate-800"><Icon name="FileText" className="h-4 w-4 text-orange-600" />{r.name}</div>
                        <p className="mt-1 text-xs text-slate-500">{r.desc}</p>
                      </div>
                      <div className="flex gap-2"><ExportButtons id={r.id} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-400">PDFs carry the company letterhead, page numbers and signature blocks. Excel files have formatted headers, totals and frozen header rows. All reports use live data, including changes made during this demo.</p>
          </div>) },
        { id: "p", label: "Project profitability", content: (
          <Card pad={false} action={<div className="flex gap-2"><ExportButtons id="profit" /></div>} title="Profitability - all projects">
            <Table rows={ps} cols={[
              { key: "name", label: "Project", className: "min-w-[200px]" }, { key: "category", label: "Category" },
              { key: "value", label: "Value", align: "right", render: (r) => inrShort(r.value) }, { key: "budget", label: "Budget cost", align: "right", render: (r) => inrShort(r.budget) },
              { key: "cost", label: "Cost to date", align: "right", render: (r) => inrShort(r.cost) },
              { key: "billed", label: "Billed", align: "right", render: (r) => (r.billed ? inrShort(r.billed) : "—") },
              { key: "m", label: "Exp. margin", align: "right", render: (r) => <span className={pct(r.value - r.budget, r.value) < 10 ? "text-amber-700" : "text-emerald-700"}>{pct(r.value - r.budget, r.value)}%</span> },
            ]} />
          </Card>) },
        { id: "m", label: "Monthly trend", content: (
          <Card title="Billing, collection and cost by month">
            <BarChart data={monthly} height={220} fmt={inrShort} series={[{ key: "billed", label: "Billed", color: "#ea580c" }, { key: "received", label: "Received", color: "#10b981" }, { key: "cost", label: "Cost", color: "#94a3b8" }]} />
          </Card>) },
        { id: "w", label: "Works in hand", content: (
          <Card pad={false} title="Works in hand statement (for bank / new clients)" action={<div className="flex gap-2"><ExportButtons id="wih" /></div>}>
            <Table rows={ps.filter((p) => p.category !== "Own Project")} cols={[
              { key: "name", label: "Name of work" }, { key: "client", label: "Client" }, { key: "value", label: "Contract value", align: "right", render: (r) => inr(r.value) },
              { key: "billed", label: "Billed", align: "right", render: (r) => inr(r.billed) }, { key: "bal", label: "Balance work", align: "right", render: (r) => inr(Math.max(0, r.value - r.billed)) },
              { key: "progress", label: "Progress", align: "right", render: (r) => `${r.progress}%` },
            ]} />
          </Card>) },
        { id: "t", label: "Tax summary", content: (
          <Card pad={false} title="GST & TDS - FY 2026-27 (Q1 + Q2)">
            <Table rows={[
              { h: "GST output on invoices", a: 5094000 }, { h: "GST input on purchases", a: 3612000 }, { h: "Net GST paid", a: 1482000 },
              { h: "TDS deducted by clients (194C)", a: 365000 }, { h: "TDS seen in Form 26AS", a: 331000 }, { h: "Difference to follow up", a: 34000 },
            ]} cols={[{ key: "h", label: "Head" }, { key: "a", label: "Amount", align: "right", render: (r) => inr(r.a) }]} />
          </Card>) },
      ]} />
    </>
  );
}
