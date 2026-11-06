"use client";

import ExportButtons, { useDocExport } from "./ExportButtons";
import { Badge, Button, Card, Stat } from "./ui";
import { fdate, inr } from "@/lib/format";
import { wageSlipPdf } from "@/lib/reports";
import { useDemo } from "@/lib/store";
import { WEEK, dayMark, wageCalc } from "@/lib/wages";

const cellTone = { P: "bg-emerald-100 text-emerald-800", H: "bg-amber-100 text-amber-800", A: "bg-red-50 text-red-600" } as const;

export default function WageSheet() {
  const { state, update, notify, user } = useDemo();
  const doc = useDocExport();
  const role = user?.role;
  const payable = state.payables.find((p) => p.id === WEEK.payableId);
  const status = payable?.status ?? "Pending Approval";
  const rows = state.wageRows.map((r) => {
    const w = state.workers.find((x) => x.id === r.workerId)!;
    return { r, w, k: wageCalc(w, r) };
  });
  const tot = rows.reduce((a, { k }) => ({ days: a.days + k.days, gross: a.gross + k.gross, esic: a.esic + k.esic, advance: a.advance + k.advance, net: a.net + k.net, ot: a.ot + k.otAmt }), { days: 0, gross: 0, esic: 0, advance: 0, net: 0, ot: 0 });
  const paidCount = rows.filter((x) => x.r.paid).length;

  const approve = () => {
    update((s) => ({ ...s, payables: s.payables.map((p) => (p.id === WEEK.payableId ? { ...p, status: "Due" } : p)) }), `Approved ${WEEK.label} wage sheet (${inr(tot.net)})`);
    notify("Wage sheet approved - sent to accounts for payment");
  };
  const payAll = () => {
    update((s) => ({
      ...s,
      wageRows: s.wageRows.map((r) => ({ ...r, paid: true })),
      payables: s.payables.map((p) => (p.id === WEEK.payableId ? { ...p, status: "Paid" } : p)),
    }), `Paid ${WEEK.label} wages to ${rows.length} workers (${inr(tot.net)})`);
    notify(`Wages paid to ${rows.length} workers - bank transfer file + cash list ready`);
  };
  const payOne = (id: string, name: string, net: number) => {
    update((s) => ({ ...s, wageRows: s.wageRows.map((r) => (r.workerId === id ? { ...r, paid: true } : r)) }), `Paid wages to ${name} (${inr(net)})`);
    notify(`${name} paid ${inr(net)}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Workers this week" value={rows.length} sub={`${tot.days} man-days`} icon="Users" tone="blue" />
        <Stat label="Gross wages" value={inr(tot.gross)} sub={`incl. overtime ${inr(tot.ot)}`} icon="IndianRupee" tone="orange" />
        <Stat label="Deductions" value={inr(tot.esic + tot.advance)} sub={`ESIC ${inr(tot.esic)} · advance ${inr(tot.advance)}`} icon="MinusCircle" tone="red" />
        <Stat label="Net payable" value={inr(tot.net)} sub={`${paidCount}/${rows.length} paid`} icon="Wallet" tone="green" />
      </div>

      <Card pad={false}
        title={<span className="flex flex-wrap items-center gap-2">{WEEK.label} wage sheet · {fdate(WEEK.from)} to {fdate(WEEK.to)} · {WEEK.site} <Badge>{status}</Badge></span>}
        action={<div className="flex flex-wrap gap-2">
          <ExportButtons id="wagesheet" />
          {status === "Pending Approval" && (role === "owner" || role === "pm") && <Button size="sm" variant="success" icon="Check" onClick={approve}>Approve sheet</Button>}
          {status === "Due" && (role === "owner" || role === "accountant") && <Button size="sm" icon="Banknote" onClick={payAll}>Pay all</Button>}
        </div>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-medium">Worker</th>
                {WEEK.days.map((d) => <th key={d} className="px-1 py-2.5 text-center font-medium">{d.split(" ")[0]}<div className="text-[10px] font-normal normal-case">{d.split(" ")[1]}</div></th>)}
                <th className="px-2 py-2.5 text-right font-medium">Days</th><th className="px-2 py-2.5 text-right font-medium">Rate</th>
                <th className="px-2 py-2.5 text-right font-medium">OT h</th><th className="px-2 py-2.5 text-right font-medium">Gross</th>
                <th className="px-2 py-2.5 text-right font-medium">ESIC</th><th className="px-2 py-2.5 text-right font-medium">Advance</th>
                <th className="px-2 py-2.5 text-right font-medium">Net pay</th><th className="px-2 py-2.5 font-medium">Mode</th><th className="px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ r, w, k }) => (
                <tr key={w.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2"><div className="font-medium text-slate-800">{w.name}</div><div className="text-xs text-slate-500">{w.id} · {w.category} · {w.contractor}</div></td>
                  {r.days.map((d, i) => { const m = dayMark(d); return <td key={i} className="px-1 py-2 text-center"><span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-semibold ${cellTone[m]}`}>{m}</span></td>; })}
                  <td className="px-2 py-2 text-right tabular-nums">{k.days}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{inr(w.rate)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{r.ot || "—"}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{inr(k.gross)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-red-600">-{inr(k.esic)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-red-600">{k.advance ? `-${inr(k.advance)}` : "—"}</td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums">{inr(k.net)}</td>
                  <td className="px-2 py-2"><Badge tone={r.mode === "Bank" ? "blue" : "slate"}>{r.mode}</Badge></td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-1">
                      {r.paid ? <Badge tone="green">Paid</Badge> : status === "Due" && (role === "owner" || role === "accountant") ? <Button size="sm" variant="secondary" onClick={() => payOne(w.id, w.name, k.net)}>Pay</Button> : <Badge tone="amber">Pending</Badge>}
                      <Button size="sm" variant="ghost" icon="FileDown" onClick={() => doc(`Wage slip of ${w.name}`, (s, by) => wageSlipPdf(s, w.id, by))}>Slip</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-orange-50 font-semibold">
                <td className="px-3 py-2.5">Total ({rows.length} workers)</td><td colSpan={6} />
                <td className="px-2 py-2.5 text-right tabular-nums">{tot.days}</td><td /><td />
                <td className="px-2 py-2.5 text-right tabular-nums">{inr(tot.gross)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">-{inr(tot.esic)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">-{inr(tot.advance)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{inr(tot.net)}</td><td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="border-t border-slate-100 p-3 text-xs text-slate-500">
          Attendance comes from the supervisor&apos;s daily entries (P = present, H = half day, A = absent). Net pay = days × daily rate + overtime (rate ÷ 8 per hour) − ESIC 0.75% − advance recovery. Flow: supervisor closes week → project manager approves → accountant pays (bank transfer or cash with signature).
        </p>
      </Card>
    </div>
  );
}
