"use client";

import Link from "next/link";
import { alerts, cashForecast, licences, monthly, photos, users, DEMO_TODAY, roleLabel, type Role } from "@/lib/data";
import { billNet, fdate, inrShort, pct } from "@/lib/format";
import { jobCost } from "@/lib/maint";
import { useDemo, useMyProjects } from "@/lib/store";
import { Badge, BarChart, Button, Card, Icon, PageHeader, PhotoTile, Progress, Stat, Table } from "./ui";

const dayDiff = (iso: string) => Math.round((new Date(iso).getTime() - new Date(DEMO_TODAY).getTime()) / 86400000);

function AlertsCard({ role }: { role: Role }) {
  const list = alerts.filter((a) => a.roles.includes(role));
  const dot = { red: "bg-red-500", amber: "bg-amber-500", blue: "bg-sky-500", green: "bg-emerald-500" };
  return (
    <Card title="Alerts for you" action={<Link href="/alerts" className="text-xs font-medium text-orange-700">View all</Link>}>
      <ul className="space-y-2.5">
        {list.slice(0, 5).map((a) => (
          <li key={a.id}>
            <Link href={a.href} className="flex items-start gap-2.5 text-sm text-slate-700 hover:text-orange-700">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[a.level]}`} />{a.text}
            </Link>
          </li>
        ))}
        {list.length === 0 && <li className="text-sm text-slate-400">Nothing needs your attention.</li>}
      </ul>
    </Card>
  );
}

function ProjectProgress() {
  const list = useMyProjects();
  return (
    <Card title="Projects - actual vs planned progress" action={<Link href="/projects" className="text-xs font-medium text-orange-700">All projects</Link>}>
      <ul className="space-y-4">
        {list.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`} className="block">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium text-slate-800">{p.name}</span>
                <span className="flex shrink-0 items-center gap-2"><Badge>{p.category}</Badge><span className="w-10 text-right font-semibold tabular-nums">{p.progress}%</span></span>
              </div>
              <Progress value={p.progress} planned={p.planned} tone={p.progress + 3 < p.planned ? "bg-amber-500" : "bg-emerald-500"} />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-400">Black marker = planned progress as on today.</p>
    </Card>
  );
}

function Greeting({ sub }: { sub: string }) {
  const { user } = useDemo();
  return <PageHeader title={`Good morning, ${user?.name.split(" ")[0]}`} sub={`${fdate(DEMO_TODAY)} · ${sub}`} />;
}

/* ---------------- Owner: company financial profile ---------------- */
function FinancialProfile() {
  const { state } = useDemo();
  const ps = state.projects;
  const value = ps.reduce((a, p) => a + p.value, 0);
  const totalCost = ps.reduce((a, p) => a + p.budget, 0);
  const spent = ps.reduce((a, p) => a + p.cost, 0);
  const toSpend = Math.max(0, totalCost - spent);
  const profit = value - totalCost;
  const w = (n: number) => `${Math.max(0, (n / value) * 100)}%`;
  const rows = ps.map((p) => {
    const spentPct = pct(p.cost, p.budget);
    const watch = spentPct > p.progress + 5;
    return { ...p, profit: p.value - p.budget, margin: pct(p.value - p.budget, p.value), spentPct, watch };
  });

  const tiles: [string, string, string, string][] = [
    ["Total project value", inrShort(value), `${ps.length} projects - what we will receive`, "text-slate-900"],
    ["Total project cost", inrShort(totalCost), "Estimated full cost of all projects", "text-slate-900"],
    ["Spent so far", inrShort(spent), `${pct(spent, totalCost)}% of total cost`, "text-orange-700"],
    ["Still to spend", inrShort(toSpend), "To finish all projects", "text-sky-700"],
    ["Expected profit", inrShort(profit), `${pct(profit, value)}% margin on value`, "text-emerald-700"],
  ];

  return (
    <Card title="Company financial profile - all projects" className="mt-4" action={<Link href="/reports" className="text-xs font-medium text-orange-700">Full profitability report</Link>}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map(([label, val, sub, tone], i) => (
          <div key={label} className={`rounded-lg border border-slate-200 bg-slate-50/60 p-3 ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}>
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
            <div className={`mt-1 text-lg font-semibold sm:text-xl ${tone}`}>{val}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 text-xs text-slate-500">Where the total project value goes</div>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="bg-orange-500" style={{ width: w(spent) }} title={`Spent ${inrShort(spent)}`} />
          <div className="bg-sky-400" style={{ width: w(toSpend) }} title={`Still to spend ${inrShort(toSpend)}`} />
          <div className="bg-emerald-500" style={{ width: w(profit) }} title={`Profit ${inrShort(profit)}`} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />Spent {inrShort(spent)} ({pct(spent, value)}%)</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-sky-400" />Still to spend {inrShort(toSpend)} ({pct(toSpend, value)}%)</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Profit {inrShort(profit)} ({pct(profit, value)}%)</span>
        </div>
      </div>

      <div className="-mx-4 mt-4 border-t border-slate-100">
        <Table rows={rows} cols={[
          { key: "name", label: "Project", render: (r) => <Link href={`/projects/${r.id}`} className="font-medium text-slate-800 hover:text-orange-700">{r.name}</Link> },
          { key: "value", label: "Value", align: "right", render: (r) => inrShort(r.value) },
          { key: "budget", label: "Total cost", align: "right", render: (r) => inrShort(r.budget) },
          { key: "cost", label: "Spent so far", align: "right", render: (r) => <span>{inrShort(r.cost)} <span className="text-xs text-slate-400">({r.spentPct}%)</span></span> },
          { key: "progress", label: "Work done", align: "right", render: (r) => `${r.progress}%` },
          { key: "profit", label: "Expected profit", align: "right", render: (r) => <b className="text-emerald-700">{inrShort(r.profit)}</b> },
          { key: "margin", label: "Margin", align: "right", render: (r) => `${r.margin}%` },
          { key: "watch", label: "Cost check", render: (r) => (r.watch ? <Badge tone="amber">Spending ahead of work</Badge> : <Badge tone="green">On track</Badge>) },
        ]} />
      </div>
      <p className="mt-3 text-xs text-slate-500">Total cost is the estimated full cost (budget) of each project. The cost check compares money spent with work done - if spending runs more than 5% ahead of progress, profit is at risk.</p>
    </Card>
  );
}

/* ---------------- Owner ---------------- */
function OwnerDash() {
  const { state, update, notify } = useDemo();
  const ps = state.projects;
  const inHand = ps.filter((p) => p.status !== "Closed").reduce((a, p) => a + p.value, 0);
  const outstanding = state.bills.filter((b) => b.status !== "Paid" && b.status !== "Draft" && b.status !== "Submitted").reduce((a, b) => a + billNet(b) - (b.received ?? 0), 0);
  const retention = ps.reduce((a, p) => a + p.retention, 0);
  const dueWeek = state.payables.filter((p) => p.status !== "Paid" && dayDiff(p.due) <= 7).reduce((a, p) => a + p.amount, 0);
  const pending = [
    ...state.pos.filter((p) => p.status === "Pending Owner").map((p) => ({ id: p.id, text: `${p.id} · ${p.vendor}`, sub: p.item, amount: p.amount, kind: "po" as const })),
    ...state.payables.filter((p) => p.status === "Pending Approval").map((p) => ({ id: p.id, text: p.party, sub: p.ref, amount: p.amount, kind: "pay" as const })),
  ];
  const approve = (id: string, kind: "po" | "pay") => {
    if (kind === "po") update((s) => ({ ...s, pos: s.pos.map((p) => (p.id === id ? { ...p, status: "Approved" } : p)) }), `Approved ${id}`);
    else update((s) => ({ ...s, payables: s.payables.map((p) => (p.id === id ? { ...p, status: "Due" } : p)) }), `Approved payment ${id}`);
    notify(`${id} approved`);
  };
  const byClient = ps.filter((p) => p.billed > 0).map((p) => ({ client: p.client, project: p.name, due: Math.max(0, p.billed - p.received) })).filter((x) => x.due > 0);

  return (
    <>
      <Greeting sub="Whole company at a glance - client works, own projects and maintenance" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Work in hand" value={inrShort(inHand)} sub={`${ps.length} projects`} icon="Building2" tone="orange" href="/projects" />
        <Stat label="Client outstanding" value={inrShort(outstanding)} sub="Invoiced, not received" icon="Clock" tone="red" href="/billing" />
        <Stat label="Payments due (7 days)" value={inrShort(dueWeek)} sub="Suppliers, subcontractors, wages" icon="Wallet" tone="amber" href="/payments" />
        <Stat label="Retention held by clients" value={inrShort(retention)} sub="Released after defect period" icon="Lock" tone="blue" href="/reports" />
      </div>
      <FinancialProfile />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Billing vs collection vs cost (₹)" className="lg:col-span-2">
          <BarChart data={monthly} fmt={inrShort} series={[{ key: "billed", label: "Billed", color: "#ea580c" }, { key: "received", label: "Received", color: "#10b981" }, { key: "cost", label: "Cost", color: "#94a3b8" }]} />
        </Card>
        <Card title={`Waiting for your approval (${pending.length})`} action={<Link href="/approvals" className="text-xs font-medium text-orange-700">Open</Link>}>
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 text-sm"><div className="truncate font-medium text-slate-800">{p.text}</div><div className="truncate text-xs text-slate-500">{p.sub} · {inrShort(p.amount)}</div></div>
                <Button size="sm" variant="success" onClick={() => approve(p.id, p.kind)}>Approve</Button>
              </li>
            ))}
            {pending.length === 0 && <li className="text-sm text-slate-400">All clear - nothing pending.</li>}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ProjectProgress /></div>
        <AlertsCard role="owner" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Outstanding by client" pad={false}>
          <Table rows={byClient} cols={[{ key: "client", label: "Client" }, { key: "project", label: "Project" }, { key: "due", label: "Due", align: "right", render: (r) => inrShort(r.due) }]} />
        </Card>
        <Card title="Cash flow forecast - next 3 months">
          <BarChart data={cashForecast} fmt={inrShort} height={150} series={[{ key: "inflow", label: "Expected receipts", color: "#10b981" }, { key: "outflow", label: "Planned payments", color: "#ef4444" }]} />
          <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">December shows a gap of {inrShort(500000)} - follow up Sunrise Hospital and Greenfield School dues early.</p>
        </Card>
      </div>
    </>
  );
}

/* ---------------- Admin ---------------- */
function AdminDash() {
  const { state } = useDemo();
  const counts = users.reduce<Record<string, number>>((a, u) => ({ ...a, [u.role]: (a[u.role] ?? 0) + 1 }), {});
  return (
    <>
      <Greeting sub="System setup, users, masters and document validity" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active users" value={users.length} sub="11 roles" icon="Users" tone="blue" href="/admin" />
        <Stat label="Expiring in 30 days" value={licences.filter((l) => dayDiff(l.expiry) <= 30).length} sub="Licences, BGs, insurance" icon="CalendarClock" tone="amber" href="/admin" />
        <Stat label="Last backup" value="02:00 today" sub="Auto daily · 30 days kept" icon="DatabaseBackup" tone="green" />
        <Stat label="Projects" value={state.projects.length} sub="All categories" icon="Building2" tone="orange" href="/projects" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Document validity" className="lg:col-span-2" pad={false}>
          <Table rows={[...licences].sort((a, b) => a.expiry.localeCompare(b.expiry))} cols={[
            { key: "name", label: "Document" }, { key: "number", label: "Number" },
            { key: "expiry", label: "Expiry", render: (r) => fdate(r.expiry) },
            { key: "d", label: "Status", render: (r) => { const d = dayDiff(r.expiry); return <Badge tone={d <= 30 ? "red" : d <= 60 ? "amber" : "green"}>{d} days left</Badge>; } },
          ]} />
        </Card>
        <Card title="Users by role">
          <ul className="space-y-2 text-sm">{Object.entries(counts).map(([r, n]) => <li key={r} className="flex justify-between"><span>{roleLabel[r as Role]}</span><b>{n}</b></li>)}</ul>
        </Card>
      </div>
      <Card title="Recent activity (audit trail)" className="mt-4" pad={false}>
        <Table rows={state.auditLog.slice(0, 8)} cols={[{ key: "at", label: "Time", render: (r) => fdate(r.at) }, { key: "user", label: "User" }, { key: "action", label: "Action" }]} />
      </Card>
    </>
  );
}

/* ---------------- Sales ---------------- */
function SalesDash() {
  const { state } = useDemo();
  const open = state.enquiries.filter((e) => e.stage !== "Won" && e.stage !== "Lost");
  const won = state.enquiries.filter((e) => e.stage === "Won").length;
  const lost = state.enquiries.filter((e) => e.stage === "Lost").length;
  const today = open.filter((e) => e.followUp <= DEMO_TODAY);
  const u = state.units;
  return (
    <>
      <Greeting sub="Enquiries, quotations, flat sales and AMC renewals" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open enquiries" value={open.length} sub={`Pipeline ${inrShort(open.reduce((a, e) => a + e.value, 0))}`} icon="Briefcase" tone="orange" href="/enquiries" />
        <Stat label="Follow-ups today" value={today.length} sub="Call or visit" icon="PhoneCall" tone="red" href="/enquiries" />
        <Stat label="Win rate (this year)" value={`${pct(won, won + lost)}%`} sub={`${won} won · ${lost} lost`} icon="Trophy" tone="green" />
        <Stat label="Patil Residency flats" value={`${u.filter((x) => x.status === "Sold" || x.status === "Booked").length} / ${u.length}`} sub="Sold or booked" icon="Home" tone="blue" href="/own-projects" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Follow up today" className="lg:col-span-2" pad={false}>
          <Table rows={today} cols={[{ key: "id", label: "No." }, { key: "client", label: "Client" }, { key: "work", label: "Work" }, { key: "stage", label: "Stage", render: (r) => <Badge>{r.stage}</Badge> }, { key: "note", label: "Note", className: "text-slate-500" }]} />
        </Card>
        <Card title="AMC renewals coming">
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Sunrise Hospital AMC</span><Badge tone="amber">31-Jan-2027</Badge></li>
            <li className="flex justify-between"><span>Orchid Villa - defect period ends</span><Badge tone="blue">15-Apr-2027</Badge></li>
            <li className="flex justify-between"><span>City Centre Mall (proposal)</span><Badge tone="violet">Quote sent</Badge></li>
          </ul>
        </Card>
      </div>
      <div className="mt-4"><AlertsCard role="sales" /></div>
    </>
  );
}

/* ---------------- Project Manager ---------------- */
function PMDash() {
  const { state, update, notify } = useDemo();
  const pendingIndents = state.indents.filter((i) => i.status === "Pending Approval");
  const pendingWages = state.payables.filter((p) => p.type === "Wages" && p.status === "Pending Approval");
  const openDelays = state.delays.filter((d) => !d.to);
  const todayDpr = state.dprs.filter((d) => d.status === "Submitted");
  return (
    <>
      <Greeting sub="Your sites, approvals and problems needing action" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Approvals pending" value={pendingIndents.length + pendingWages.length} sub="Indents and wage sheets" icon="CheckSquare" tone="amber" href="/approvals" />
        <Stat label="Daily reports to review" value={todayDpr.length} sub="Submitted by engineers" icon="ClipboardList" tone="blue" href="/daily-reports" />
        <Stat label="Open delays" value={openDelays.length} sub={`${openDelays.reduce((a, d) => a + d.days, 0)} days running`} icon="Hourglass" tone="red" href="/quality" />
        <Stat label="Change orders pending" value={state.changeOrders.filter((c) => c.status === "Pending Client").length} sub="Waiting for client" icon="FilePen" tone="orange" href="/change-orders" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ProjectProgress /></div>
        <Card title="Approve indents">
          <ul className="space-y-3">
            {pendingIndents.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                <div><div className="font-medium">{i.item} · {i.qty}</div><div className="text-xs text-slate-500">{i.id} · {i.project} · by {fdate(i.needBy)}</div></div>
                <Button size="sm" variant="success" onClick={() => { update((s) => ({ ...s, indents: s.indents.map((x) => (x.id === i.id ? { ...x, status: "Approved" } : x)) }), `Approved indent ${i.id}`); notify(`${i.id} approved - sent to purchase`); }}>Approve</Button>
              </li>
            ))}
            {pendingIndents.length === 0 && <li className="text-sm text-slate-400">No indents pending.</li>}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Today's daily reports" pad={false}>
          <Table rows={state.dprs.slice(0, 4)} cols={[{ key: "project", label: "Site" }, { key: "by", label: "By" }, { key: "labour", label: "Labour", align: "right" }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]} />
        </Card>
        <AlertsCard role="pm" />
      </div>
    </>
  );
}

/* ---------------- Site Engineer ---------------- */
function SiteDash() {
  const { state } = useDemo();
  const mine = useMyProjects();
  const todayDone = state.dprs.some((d) => d.date === DEMO_TODAY && d.by === "Kiran Pawar");
  const due = state.tests.filter((t) => t.status === "Due" || t.status === "Fail");
  return (
    <>
      <Greeting sub="Today's site work - Shree Sai Complex and Patil Residency" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/daily-reports" className={`flex items-center gap-3 rounded-xl p-4 text-white shadow-sm ${todayDone ? "bg-emerald-600" : "bg-orange-600"}`}>
          <Icon name={todayDone ? "CheckCircle2" : "ClipboardPlus"} className="h-7 w-7" />
          <div><div className="font-semibold">{todayDone ? "Today's report submitted" : "Fill today's daily report"}</div><div className="text-xs text-white/80">Work, labour, material, photos</div></div>
        </Link>
        <Stat label="Indent material" value="Raise indent" sub="Steel, cement, sand..." icon="PackagePlus" tone="blue" href="/store" />
        <Stat label="Tests due / failed" value={due.length} sub="Cube tests, NCR" icon="FlaskConical" tone="red" href="/quality" />
        <Stat label="Open delays" value={state.delays.filter((d) => !d.to && mine.some((p) => p.id === d.project)).length} sub="Record same day" icon="Hourglass" tone="amber" href="/quality" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="My sites" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {mine.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="rounded-lg border border-slate-200 p-3 hover:border-orange-300">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mb-2 text-xs text-slate-500">{p.location}</div>
                <Progress value={p.progress} planned={p.planned} />
                <div className="mt-1 text-xs text-slate-500">{p.progress}% done · planned {p.planned}%</div>
              </Link>
            ))}
          </div>
        </Card>
        <AlertsCard role="site" />
      </div>
      <Card title="Recent photos from site" className="mt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{photos.filter((p) => p.project === "P-A").map((p) => <PhotoTile key={p.id} {...p} />)}</div>
      </Card>
    </>
  );
}

/* ---------------- Supervisor ---------------- */
function SupervisorDash() {
  const { state } = useDemo();
  const present = state.workers.filter((w) => w.present).length;
  return (
    <>
      <Greeting sub="Shree Sai Commercial Complex · site supervisor" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/attendance" className={`flex items-center gap-3 rounded-xl p-4 text-white shadow-sm ${state.attendanceSaved ? "bg-emerald-600" : "bg-orange-600"}`}>
          <Icon name="UserCheck" className="h-7 w-7" />
          <div><div className="font-semibold">{state.attendanceSaved ? "Attendance saved" : "Mark today's attendance"}</div><div className="text-xs text-white/80">{present} of {state.workers.length} present</div></div>
        </Link>
        <Stat label="Labour on site" value={present} sub="Masons, helpers, bar benders..." icon="Users" tone="blue" href="/attendance" />
        <Stat label="Work entries" value="Add update" sub="With photos" icon="Camera" tone="green" href="/daily-reports" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Today's plan (from engineer)">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>Complete 4th slab shuttering grid C-D</li>
            <li>Column casting C19-C24 (cube samples to be taken)</li>
            <li>AAC masonry 2nd floor - 20 cum target</li>
            <li>Toolbox talk at 8:45 am - working at height</li>
          </ol>
        </Card>
        <AlertsCard role="supervisor" />
      </div>
    </>
  );
}

/* ---------------- Store ---------------- */
function StoreDash() {
  const { state } = useDemo();
  const low = state.stock.filter((s) => s.stock < s.min);
  return (
    <>
      <Greeting sub="Stock, receipts and purchase at all sites" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Low stock items" value={low.length} sub="Below minimum level" icon="AlertTriangle" tone="red" href="/store" />
        <Stat label="Deliveries pending" value={state.pos.filter((p) => p.status !== "Delivered").length} sub="Open purchase orders" icon="Truck" tone="amber" href="/store" />
        <Stat label="GRN this week" value={state.grns.length} sub="Material received" icon="PackageCheck" tone="green" href="/store" />
        <Stat label="Indents approved" value={state.indents.filter((i) => i.status === "Approved").length} sub="Ready for PO" icon="ClipboardCheck" tone="blue" href="/store" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Low stock" className="lg:col-span-2" pad={false}>
          <Table rows={low} cols={[{ key: "site", label: "Site" }, { key: "item", label: "Item" }, { key: "stock", label: "Stock", align: "right", render: (r) => `${r.stock} ${r.unit}` }, { key: "min", label: "Min", align: "right", render: (r) => `${r.min} ${r.unit}` }]} />
        </Card>
        <AlertsCard role="store" />
      </div>
    </>
  );
}

/* ---------------- Billing ---------------- */
function BillingDash() {
  const { state } = useDemo();
  const notCert = state.bills.filter((b) => b.status === "Submitted");
  const overdue = state.bills.filter((b) => (b.status === "Invoiced" || b.status === "Part Paid") && (b.daysPending ?? 0) > 10);
  return (
    <>
      <Greeting sub="Measurement, client bills, change orders and follow-up" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Awaiting certification" value={notCert.length} sub={inrShort(notCert.reduce((a, b) => a + b.workValue, 0))} icon="FileClock" tone="amber" href="/billing" />
        <Stat label="Overdue invoices" value={overdue.length} sub="Beyond credit period" icon="AlarmClock" tone="red" href="/billing" />
        <Stat label="Change orders pending" value={state.changeOrders.filter((c) => c.status === "Pending Client").length} sub="Client approval" icon="FilePen" tone="orange" href="/change-orders" />
        <Stat label="Next bill" value="RA-08" sub="Shree Sai · due 30-Nov" icon="CalendarDays" tone="blue" href="/billing" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Bills in progress" className="lg:col-span-2" pad={false}>
          <Table rows={state.bills.filter((b) => b.status !== "Paid")} cols={[
            { key: "no", label: "Bill" }, { key: "project", label: "Project" },
            { key: "workValue", label: "Work value", align: "right", render: (r) => inrShort(r.workValue) },
            { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
            { key: "daysPending", label: "Days", align: "right" },
          ]} />
        </Card>
        <AlertsCard role="billing" />
      </div>
    </>
  );
}

/* ---------------- Accountant ---------------- */
function AccountantDash() {
  const { state } = useDemo();
  const due = state.payables.filter((p) => p.status !== "Paid");
  const recv = state.bills.filter((b) => b.status === "Invoiced" || b.status === "Part Paid" || b.status === "Certified");
  return (
    <>
      <Greeting sub="Receipts, payments, payroll and tax" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="To receive" value={inrShort(recv.reduce((a, b) => a + billNet(b) - (b.received ?? 0), 0))} sub={`${recv.length} invoices`} icon="ArrowDownCircle" tone="green" href="/billing" />
        <Stat label="To pay (open)" value={inrShort(due.reduce((a, p) => a + p.amount, 0))} sub={`${due.length} bills`} icon="ArrowUpCircle" tone="red" href="/payments" />
        <Stat label="November payroll" value={inrShort(state.staff.reduce((a, s) => a + s.basic + s.allowance + s.incentive - s.advance, 0))} sub={`${state.staff.filter((s) => s.status === "Paid").length}/${state.staff.length} paid`} icon="Users" tone="blue" href="/payments" />
        <Stat label="TDS to reconcile" value="₹3.65 L" sub="Q2 · 26AS check" icon="FileSearch" tone="amber" href="/reports" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Payments due this week" className="lg:col-span-2" pad={false}>
          <Table rows={due} cols={[{ key: "party", label: "Party" }, { key: "type", label: "Type" }, { key: "due", label: "Due", render: (r) => fdate(r.due) }, { key: "amount", label: "Amount", align: "right", render: (r) => inrShort(r.amount) }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]} />
        </Card>
        <AlertsCard role="accountant" />
      </div>
    </>
  );
}

/* ---------------- Technician ---------------- */
function TechDash() {
  const { state } = useDemo();
  const jobs = state.complaints.filter((c) => c.tech === "Ganesh Bhosale" && c.status !== "Closed");
  const pm = state.pmJobs.filter((j) => j.status !== "Done");
  return (
    <>
      <Greeting sub="Your maintenance jobs for today" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Open complaints" value={jobs.length} sub={`${jobs.filter((j) => j.priority === "Urgent").length} urgent`} icon="Wrench" tone="red" href="/maintenance" />
        <Stat label="Planned jobs" value={pm.length} sub="Preventive maintenance" icon="CalendarCheck" tone="blue" href="/maintenance" />
        <Stat label="Avg response (Oct)" value="1h 48m" sub="Target 4 hours" icon="Timer" tone="green" />
      </div>
      <div className="mt-4 space-y-3">
        {jobs.map((j) => (
          <Link key={j.id} href="/maintenance" className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-orange-300">
            <div className="flex items-center justify-between gap-2"><div className="font-semibold">{j.property} · {j.location}</div><Badge>{j.priority}</Badge></div>
            <div className="mt-1 text-sm text-slate-600">{j.issue}</div>
            <div className="mt-2 flex gap-2 text-xs text-slate-500"><span>{j.id}</span>·<span>{fdate(j.reported)}</span>·<Badge>{j.status}</Badge><Badge tone="violet">{j.type}</Badge></div>
          </Link>
        ))}
      </div>
    </>
  );
}

/* ---------------- Client ---------------- */
function ClientDash() {
  const { state } = useDemo();
  const p = state.projects.find((x) => x.id === "P-A")!;
  const myBills = state.bills.filter((b) => b.project === "P-A");
  const paid = myBills.reduce((a, b) => a + (b.received ?? 0), 0);
  const dueNow = myBills.filter((b) => b.status === "Invoiced").reduce((a, b) => a + billNet(b), 0);
  const cos = state.changeOrders.filter((c) => c.project === "P-A" && c.status === "Pending Client");
  const milestones = [
    { m: "Foundation & plinth", d: "Jun 2026", done: true }, { m: "Slabs 1-3", d: "Sep 2026", done: true },
    { m: "Slab 4 & 5", d: "Dec 2026", done: false }, { m: "Masonry & plaster", d: "Mar 2027", done: false }, { m: "Finishing & handover", d: "Jun 2027", done: false },
  ];
  return (
    <>
      <PageHeader title="Shree Sai Commercial Complex" sub="Your project with Patil Constructions · Nashik Road" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative mx-auto h-36 w-36 shrink-0">
              <svg viewBox="0 0 36 36" className="h-36 w-36 -rotate-90"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.2" /><circle cx="18" cy="18" r="15.9" fill="none" stroke="#ea580c" strokeWidth="3.2" strokeDasharray={`${p.progress} 100`} strokeLinecap="round" /></svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold">{p.progress}%</span><span className="text-xs text-slate-500">complete</span></div>
            </div>
            <div className="flex-1">
              <ol className="space-y-2.5">
                {milestones.map((m) => (
                  <li key={m.m} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${m.done ? "bg-emerald-500 text-white" : "border-2 border-slate-300"}`}>{m.done && <Icon name="Check" className="h-3 w-3" />}</span>
                    <span className={`flex-1 ${m.done ? "text-slate-800" : "text-slate-500"}`}>{m.m}</span><span className="text-xs text-slate-400">{m.d}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-slate-500">Expected completion: <b>14-Jun-2027</b> (includes 21 days agreed extension)</p>
            </div>
          </div>
        </Card>
        <div className="grid gap-3">
          <Stat label="Contract value" value={inrShort(p.value)} sub="Including approved changes" icon="FileText" tone="slate" />
          <Stat label="Paid by you" value={inrShort(paid)} sub={`Against ${myBills.filter((b) => b.received).length} bills`} icon="CheckCircle2" tone="green" href="/billing" />
          <Stat label="Due now" value={inrShort(dueNow)} sub={dueNow ? "Invoice raised - pay online" : "Nothing due"} icon="Clock" tone="amber" href="/billing" />
        </div>
      </div>
      {state.jobCards.filter((j) => j.estimate === "Sent to client").map((j) => {
        const c = state.complaints.find((x) => x.id === j.complaintId);
        if (!c) return null;
        const k = jobCost(j, c.type);
        return (
          <Card key={j.complaintId} title="Repair estimate waiting for you" className="mt-4" action={<Link href="/maintenance" className="text-xs font-medium text-orange-700">Review & approve</Link>}>
            <div className="flex items-center justify-between gap-2 text-sm"><span>{c.id} · {c.property} - {c.issue}</span><b className="shrink-0">{inrShort(k.total)} incl. GST</b></div>
          </Card>
        );
      })}
      {cos.length > 0 && (
        <Card title="Needs your approval" className="mt-4" action={<Link href="/change-orders" className="text-xs font-medium text-orange-700">Review</Link>}>
          <ul className="space-y-2">{cos.map((c) => <li key={c.id} className="flex items-center justify-between gap-2 text-sm"><span>{c.id} · {c.title}</span><b className="shrink-0">{inrShort(c.value)}</b></li>)}</ul>
        </Card>
      )}
      <Card title="Latest site photos" className="mt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{photos.filter((x) => x.project === "P-A").map((x) => <PhotoTile key={x.id} {...x} />)}</div>
      </Card>
    </>
  );
}

export function RoleDashboard({ role }: { role: Role }) {
  const map: Record<Role, () => React.ReactElement> = {
    owner: OwnerDash, admin: AdminDash, sales: SalesDash, pm: PMDash, site: SiteDash, supervisor: SupervisorDash,
    store: StoreDash, billing: BillingDash, accountant: AccountantDash, technician: TechDash, client: ClientDash,
  };
  const C = map[role];
  return <C />;
}
