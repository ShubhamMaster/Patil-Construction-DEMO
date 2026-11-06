"use client";

import { Badge, Button, Card, Empty, PageHeader } from "@/components/ui";
import { fdate, inrShort } from "@/lib/format";
import { useDemo } from "@/lib/store";

type Item = { id: string; kind: string; title: string; sub: string; amount?: number; approve: () => void; reject: () => void };

export default function ApprovalsPage() {
  const { state, update, notify, user } = useDemo();
  const role = user?.role;
  const items: Item[] = [];

  if (role === "owner") {
    state.pos.filter((p) => p.status === "Pending Owner").forEach((p) => items.push({
      id: p.id, kind: "Purchase order (above ₹5 L)", title: `${p.vendor} - ${p.item}`, sub: `${p.project} · raised ${fdate(p.date)} by Amit Deshmukh`, amount: p.amount,
      approve: () => { update((s) => ({ ...s, pos: s.pos.map((x) => (x.id === p.id ? { ...x, status: "Approved" } : x)) }), `Approved ${p.id}`); notify(`${p.id} approved - emailed to vendor`); },
      reject: () => notify(`${p.id} sent back to PM with comment (demo)`),
    }));
  }
  if (role === "owner" || role === "pm") {
    state.payables.filter((p) => p.status === "Pending Approval").forEach((p) => items.push({
      id: p.id, kind: "Wage sheet", title: p.party, sub: `${p.ref} · due ${fdate(p.due)}`, amount: p.amount,
      approve: () => { update((s) => ({ ...s, payables: s.payables.map((x) => (x.id === p.id ? { ...x, status: "Due" } : x)) }), `Approved ${p.id}`); notify("Wage sheet approved - sent to accounts"); },
      reject: () => notify("Wage sheet returned to supervisor (demo)"),
    }));
  }
  if (role === "pm") {
    state.indents.filter((i) => i.status === "Pending Approval").forEach((i) => items.push({
      id: i.id, kind: "Material indent", title: `${i.item} - ${i.qty}`, sub: `${i.project} · needed by ${fdate(i.needBy)} · ${i.by}`,
      approve: () => { update((s) => ({ ...s, indents: s.indents.map((x) => (x.id === i.id ? { ...x, status: "Approved" } : x)) }), `Approved ${i.id}`); notify(`${i.id} approved - sent to purchase`); },
      reject: () => { update((s) => ({ ...s, indents: s.indents.map((x) => (x.id === i.id ? { ...x, status: "Rejected" } : x)) }), `Rejected ${i.id}`); notify(`${i.id} rejected`); },
    }));
  }
  if (role === "owner") {
    items.push({ id: "EXP-77", kind: "Site expense (above ₹25,000)", title: "Crane hire for glazing frames - 1 day", sub: "Shree Sai · Kiran Pawar · bill photo attached", amount: 38000, approve: () => notify("EXP-77 approved"), reject: () => notify("EXP-77 rejected") });
  }

  return (
    <>
      <PageHeader title="Approvals" sub={role === "owner" ? "Everything above your staff's approval limit comes here" : "Indents and wage sheets from your sites"} />
      {items.length === 0 ? <Empty text="All clear - nothing waiting for approval." /> : (
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><Badge tone="orange">{it.kind}</Badge><span className="text-xs text-slate-400">{it.id}</span></div>
                  <p className="mt-1 font-medium text-slate-800">{it.title}</p>
                  <p className="text-xs text-slate-500">{it.sub}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {it.amount !== undefined && <span className="mr-2 text-lg font-semibold">{inrShort(it.amount)}</span>}
                  <Button size="sm" variant="secondary" onClick={it.reject}>Send back</Button>
                  <Button size="sm" variant="success" icon="Check" onClick={it.approve}>Approve</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
