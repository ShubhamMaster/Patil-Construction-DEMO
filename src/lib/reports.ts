// Report definitions built from live demo state. Each returns a Report usable for PDF and Excel.
import type { DemoState } from "./store";
import { boq, DEMO_TODAY, monthly, ownBudget, type Bill, type Enquiry, type Staff } from "./data";
import { billNet, fdate, pct } from "./format";
import { exportDocumentPdf, rs, type Report } from "./exporter";
import { jobCost, whoPays } from "./maint";
import { WEEK, dayMark, wageCalc } from "./wages";

const L = (n: number) => `Rs. ${(n / 1e5).toFixed(2)} L`;
const CR = (n: number) => (n >= 1e7 ? `Rs. ${(n / 1e7).toFixed(2)} Cr` : L(n));
const sum = <T,>(a: T[], f: (x: T) => number) => a.reduce((t, x) => t + f(x), 0);
const pname = (s: DemoState, id: string) => s.projects.find((p) => p.id === id)?.name ?? id;
const client = (s: DemoState, id: string) => s.projects.find((p) => p.id === id)?.client ?? "";
const outstanding = (b: Bill) => billNet(b) - (b.received ?? 0);
const days = (iso: string) => Math.round((new Date(DEMO_TODAY).getTime() - new Date(iso).getTime()) / 86400000);

export type ReportDef = { id: string; name: string; desc: string; group: string; build: (s: DemoState, by: string) => Report };

function profitability(s: DemoState) {
  const rows = s.projects.map((p) => [p.code, p.name, p.category, p.value, p.budget, p.cost, p.billed, p.received, `${pct(p.value - p.budget, p.value)}%`, `${p.progress}%`]);
  return {
    heading: "Project profitability",
    columns: [
      { header: "Code", width: 22 }, { header: "Project" }, { header: "Category" }, { header: "Value (Rs.)", money: true }, { header: "Budget cost", money: true },
      { header: "Cost to date", money: true }, { header: "Billed", money: true }, { header: "Received", money: true }, { header: "Exp. margin", align: "right" as const }, { header: "Progress", align: "right" as const },
    ],
    rows,
    totals: ["", "Total", "", sum(s.projects, (p) => p.value), sum(s.projects, (p) => p.budget), sum(s.projects, (p) => p.cost), sum(s.projects, (p) => p.billed), sum(s.projects, (p) => p.received), `${pct(sum(s.projects, (p) => p.value - p.budget), sum(s.projects, (p) => p.value))}%`, ""],
    note: "Expected margin = (value - budget cost) / value. Own project value is expected sales value.",
  };
}

function receivables(s: DemoState) {
  const open = s.bills.filter((b) => ["Invoiced", "Part Paid", "Certified"].includes(b.status));
  return {
    heading: "Client outstanding and ageing",
    columns: [{ header: "Bill" }, { header: "Client" }, { header: "Project" }, { header: "Bill date" }, { header: "Net payable", money: true }, { header: "Received", money: true }, { header: "Outstanding", money: true }, { header: "Days", align: "right" as const }, { header: "Status" }],
    rows: open.map((b) => [b.no, client(s, b.project), pname(s, b.project), fdate(b.date), billNet(b), b.received ?? 0, outstanding(b), b.daysPending ?? days(b.date), b.status]),
    totals: ["", "Total", "", "", sum(open, billNet), sum(open, (b) => b.received ?? 0), sum(open, outstanding), "", ""],
  };
}

function payables(s: DemoState) {
  const rows = [...s.payables].sort((a, b) => a.due.localeCompare(b.due));
  return {
    heading: "Payables and payment plan",
    columns: [{ header: "Ref." }, { header: "Party" }, { header: "Type" }, { header: "Site" }, { header: "Document" }, { header: "Due date" }, { header: "Amount (Rs.)", money: true }, { header: "Status" }],
    rows: rows.map((p) => [p.id, p.party, p.type, p.project, p.ref, fdate(p.due), p.amount, p.status]),
    totals: ["", "Total open", "", "", "", "", sum(rows.filter((p) => p.status !== "Paid"), (p) => p.amount), ""],
  };
}

export const reportDefs: ReportDef[] = [
  {
    id: "mis", group: "Management", name: "Monthly MIS report", desc: "Owner's monthly pack: key figures, billing trend, profitability, receivables, payables, delays.",
    build: (s, by) => {
      const inHand = sum(s.projects, (p) => p.value);
      const recv = s.bills.filter((b) => ["Invoiced", "Part Paid", "Certified"].includes(b.status));
      return {
        title: "Monthly MIS Report", subtitle: "November 2026 (as on " + fdate(DEMO_TODAY) + ")", fileName: "MIS_Report_Nov-2026", landscape: true, preparedBy: by,
        sections: [
          {
            heading: "1. Key figures",
            kpis: [
              ["Work in hand", CR(inHand)], ["Billed this year", CR(sum(monthly, (m) => m.billed))], ["Collected this year", CR(sum(monthly, (m) => m.received))],
              ["Client outstanding", L(sum(recv, outstanding))], ["Payables open", L(sum(s.payables.filter((p) => p.status !== "Paid"), (p) => p.amount))],
              ["Retention held", L(sum(s.projects, (p) => p.retention))], ["Projects running", String(s.projects.length)], ["Open complaints", String(s.complaints.filter((c) => c.status !== "Closed").length)],
              ["Change orders pending", String(s.changeOrders.filter((c) => c.status === "Pending Client").length)], ["Flats sold / booked", `${s.units.filter((u) => u.status === "Sold" || u.status === "Booked").length} of ${s.units.length}`],
            ],
            text: [
              "Highlights: Shree Sai Commercial Complex is at 62% against 66% planned; lift shaft drawing is awaited from the architect (6 days running). Patil Residency reached 2nd slab; 9 of 12 flats are sold or booked. Sunrise Hospital AMC-Q3 invoice is overdue 36 days and needs follow-up.",
            ],
          },
          {
            heading: "2. Billing, collection and cost by month",
            columns: [{ header: "Month" }, { header: "Billed (Rs.)", money: true }, { header: "Received (Rs.)", money: true }, { header: "Cost (Rs.)", money: true }, { header: "Collection %", align: "right" }],
            rows: monthly.map((m) => [m.m, m.billed, m.received, m.cost, `${pct(m.received, m.billed)}%`]),
            totals: ["Total", sum(monthly, (m) => m.billed), sum(monthly, (m) => m.received), sum(monthly, (m) => m.cost), `${pct(sum(monthly, (m) => m.received), sum(monthly, (m) => m.billed))}%`],
            note: "* November figures are up to " + fdate(DEMO_TODAY) + ".",
          },
          { ...profitability(s), heading: "3. Project profitability" },
          { ...receivables(s), heading: "4. Client outstanding and ageing" },
          { ...payables(s), heading: "5. Payables and payment plan" },
          {
            heading: "6. Delay register",
            columns: [{ header: "Project" }, { header: "Cause" }, { header: "Responsibility" }, { header: "From" }, { header: "To" }, { header: "Days", align: "right" }],
            rows: s.delays.map((d) => [pname(s, d.project), d.cause, d.resp, fdate(d.from), d.to ? fdate(d.to) : "Running", d.days]),
          },
        ],
      };
    },
  },
  {
    id: "profit", group: "Management", name: "Project profitability", desc: "Value, budget, cost, billing, receipts and margin for every project.",
    build: (s, by) => ({ title: "Project Profitability", subtitle: "All projects - as on " + fdate(DEMO_TODAY), fileName: "Project_Profitability", landscape: true, preparedBy: by, sections: [profitability(s)] }),
  },
  {
    id: "wih", group: "Management", name: "Works in hand statement", desc: "For banks and new clients: contract value, billed and balance work.",
    build: (s, by) => {
      const ps = s.projects.filter((p) => p.category !== "Own Project");
      return {
        title: "Works in Hand Statement", subtitle: "As on " + fdate(DEMO_TODAY), fileName: "Works_In_Hand", preparedBy: by, signatures: ["Prepared by", "For Patil Constructions (Authorised Signatory)"],
        sections: [{
          columns: [{ header: "Sr." , align: "center" }, { header: "Name of work" }, { header: "Client" }, { header: "Contract value", money: true }, { header: "Billed", money: true }, { header: "Balance work", money: true }, { header: "Progress", align: "right" }, { header: "Completion" }],
          rows: ps.map((p, i) => [i + 1, p.name, p.client, p.value, p.billed, Math.max(0, p.value - p.billed), `${p.progress}%`, fdate(p.end)]),
          totals: ["", "Total", "", sum(ps, (p) => p.value), sum(ps, (p) => p.billed), sum(ps, (p) => Math.max(0, p.value - p.billed)), "", ""],
          note: "Certified that the above works are in hand with Patil Constructions as on the date shown.",
        }],
      };
    },
  },
  {
    id: "recv", group: "Billing", name: "Client outstanding & ageing", desc: "Every unpaid bill with days pending - for follow-up calls.",
    build: (s, by) => ({ title: "Client Outstanding & Ageing", subtitle: "As on " + fdate(DEMO_TODAY), fileName: "Client_Outstanding", landscape: true, preparedBy: by, sections: [receivables(s)] }),
  },
  {
    id: "bills", group: "Billing", name: "Bill register", desc: "All running bills with GST, retention, advance recovery, TDS and net.",
    build: (s, by) => ({
      title: "Bill Register", subtitle: "All projects - FY 2026-27", fileName: "Bill_Register", landscape: true, preparedBy: by,
      sections: [{
        columns: [{ header: "Bill" }, { header: "Project" }, { header: "Date" }, { header: "Work value", money: true }, { header: "GST", money: true }, { header: "Retention", money: true }, { header: "Advance rec.", money: true }, { header: "TDS", money: true }, { header: "Net payable", money: true }, { header: "Received", money: true }, { header: "Status" }],
        rows: s.bills.map((b) => [b.no, pname(s, b.project), fdate(b.date), b.workValue, b.gst, b.retention, b.advance, b.tds, billNet(b), b.received ?? 0, b.status]),
        totals: ["", "Total", "", sum(s.bills, (b) => b.workValue), sum(s.bills, (b) => b.gst), sum(s.bills, (b) => b.retention), sum(s.bills, (b) => b.advance), sum(s.bills, (b) => b.tds), sum(s.bills, billNet), sum(s.bills, (b) => b.received ?? 0), ""],
      }],
    }),
  },
  {
    id: "co", group: "Billing", name: "Change order register", desc: "Client changes with value, extra days and approval status.",
    build: (s, by) => ({
      title: "Change Order Register", fileName: "Change_Orders", preparedBy: by,
      sections: [{
        columns: [{ header: "No." }, { header: "Project" }, { header: "Change" }, { header: "Asked by" }, { header: "Raised" }, { header: "Value (Rs.)", money: true }, { header: "Days", align: "right" }, { header: "Status" }],
        rows: s.changeOrders.map((c) => [c.id, pname(s, c.project), c.title, c.by, fdate(c.raised), c.value, c.days, c.status]),
        totals: ["", "Approved total", "", "", "", sum(s.changeOrders.filter((c) => c.status === "Approved"), (c) => c.value), "", ""],
      }],
    }),
  },
  {
    id: "pay", group: "Payments", name: "Payables & payment plan", desc: "Suppliers, subcontractors, machinery hire and wages - by due date.",
    build: (s, by) => ({ title: "Payables & Payment Plan", subtitle: "As on " + fdate(DEMO_TODAY), fileName: "Payables", landscape: true, preparedBy: by, sections: [payables(s)] }),
  },
  {
    id: "salary", group: "Payments", name: "Salary sheet (November)", desc: "Staff remuneration with allowances, incentives, PF and advance recovery.",
    build: (s, by) => {
      const net = (x: Staff) => x.basic + x.allowance + x.incentive - x.advance - Math.round(x.basic * 0.12);
      return {
        title: "Salary Sheet - November 2026", fileName: "Salary_Sheet_Nov-2026", landscape: true, preparedBy: by,
        sections: [{
          columns: [{ header: "Emp." }, { header: "Name" }, { header: "Designation" }, { header: "Basic", money: true }, { header: "Site allow.", money: true }, { header: "Incentive", money: true }, { header: "Gross", money: true }, { header: "PF 12%", money: true }, { header: "Advance", money: true }, { header: "Net pay", money: true }, { header: "Status" }],
          rows: s.staff.map((x) => [x.id, x.name, x.designation, x.basic, x.allowance, x.incentive, x.basic + x.allowance + x.incentive, Math.round(x.basic * 0.12), x.advance, net(x), x.status]),
          totals: ["", "Total", "", sum(s.staff, (x) => x.basic), sum(s.staff, (x) => x.allowance), sum(s.staff, (x) => x.incentive), sum(s.staff, (x) => x.basic + x.allowance + x.incentive), sum(s.staff, (x) => Math.round(x.basic * 0.12)), sum(s.staff, (x) => x.advance), sum(s.staff, net), ""],
        }],
      };
    },
  },
  {
    id: "wages", group: "Payments", name: "Muster roll & wages (today)", desc: "Attendance and wage calculation for the Shree Sai site.",
    build: (s, by) => ({
      title: "Muster Roll & Wage Sheet", subtitle: "Shree Sai Commercial Complex - " + fdate(DEMO_TODAY), fileName: "Muster_Roll", preparedBy: by, signatures: ["Site Supervisor", "Site Engineer", "Project Manager"],
      sections: [{
        columns: [{ header: "ID" }, { header: "Worker" }, { header: "Category" }, { header: "Contractor" }, { header: "Attendance" }, { header: "Rate (Rs.)", money: true }, { header: "OT hrs", align: "right" }, { header: "Wage (Rs.)", money: true }],
        rows: s.workers.map((w) => [w.id, w.name, w.category, w.contractor, w.present ? "P" : "A", w.rate, w.ot, w.present ? w.rate + Math.round((w.ot * w.rate) / 8) : 0]),
        totals: ["", "Total", "", "", `${s.workers.filter((w) => w.present).length} P`, "", "", sum(s.workers, (w) => (w.present ? w.rate + Math.round((w.ot * w.rate) / 8) : 0))],
      }],
    }),
  },
  {
    id: "wagesheet", group: "Payments", name: "Weekly wage sheet (per worker)", desc: "Week 44: day-wise attendance, overtime, gross, ESIC, advance and net pay for each worker, with signature column.",
    build: (s, by) => {
      const rows = s.wageRows.map((r) => { const w = s.workers.find((x) => x.id === r.workerId)!; return { r, w, k: wageCalc(w, r) }; });
      return {
        title: "Weekly Wage Sheet", subtitle: `${WEEK.label} (${fdate(WEEK.from)} to ${fdate(WEEK.to)})  |  ${WEEK.site}`, fileName: `Wage_Sheet_Week-${WEEK.no}`, landscape: true, preparedBy: by,
        signatures: ["Site Supervisor", "Project Manager (approved)", "Accountant (paid)"],
        sections: [{
          columns: [
            { header: "ID", width: 11 }, { header: "Worker" }, { header: "Category" },
            ...WEEK.days.map((d) => ({ header: d.split(" ")[0], align: "center" as const, width: 10 })),
            { header: "Days", align: "right" as const, width: 11 }, { header: "Rate", money: true, width: 14 }, { header: "OT h", align: "right" as const, width: 11 },
            { header: "Gross", money: true }, { header: "ESIC", money: true }, { header: "Advance", money: true }, { header: "Net pay", money: true }, { header: "Mode", width: 13 }, { header: "Sign / thumb", width: 24 },
          ],
          rows: rows.map(({ r, w, k }) => [w.id, w.name, w.category, ...r.days.map(dayMark), k.days, w.rate, r.ot, k.gross, k.esic, k.advance, k.net, r.mode, r.paid ? "Paid" : ""]),
          totals: ["", `Total (${rows.length})`, "", "", "", "", "", "", "", sum(rows, (x) => x.k.days), "", "", sum(rows, (x) => x.k.gross), sum(rows, (x) => x.k.esic), sum(rows, (x) => x.k.advance), sum(rows, (x) => x.k.net), "", ""],
          note: "P = present, H = half day, A = absent. Net pay = days x rate + overtime (rate / 8 per hour) - ESIC 0.75% - advance recovery. Cash payments are signed or thumb-marked by the worker.",
        }],
      };
    },
  },
  {
    id: "stock", group: "Store", name: "Stock statement", desc: "Material in stock at every site with value and low-stock flag.",
    build: (s, by) => ({
      title: "Stock Statement", subtitle: "All sites - " + fdate(DEMO_TODAY), fileName: "Stock_Statement", preparedBy: by,
      sections: [{
        columns: [{ header: "Site" }, { header: "Material" }, { header: "Unit" }, { header: "Stock", align: "right" }, { header: "Min level", align: "right" }, { header: "Rate (Rs.)", money: true }, { header: "Value (Rs.)", money: true }, { header: "Flag" }],
        rows: s.stock.map((x) => [pname(s, x.site), x.item, x.unit, x.stock, x.min, x.rate, Math.round(x.stock * x.rate), x.stock < x.min ? "LOW" : "OK"]),
        totals: ["Total", "", "", "", "", "", sum(s.stock, (x) => Math.round(x.stock * x.rate)), ""],
      }],
    }),
  },
  {
    id: "po", group: "Store", name: "Purchase order register", desc: "POs with vendor, amount and delivery status; recent receipts.",
    build: (s, by) => ({
      title: "Purchase Order Register", fileName: "PO_Register", preparedBy: by,
      sections: [
        { heading: "Purchase orders", columns: [{ header: "PO" }, { header: "Date" }, { header: "Vendor" }, { header: "Site" }, { header: "Item" }, { header: "Amount (Rs.)", money: true }, { header: "Status" }], rows: s.pos.map((p) => [p.id, fdate(p.date), p.vendor, p.project, p.item, p.amount, p.status]), totals: ["", "", "Total", "", "", sum(s.pos, (p) => p.amount), ""] },
        { heading: "Goods received (GRN)", columns: [{ header: "GRN" }, { header: "Date" }, { header: "PO" }, { header: "Site" }, { header: "Material" }, { header: "Qty" }, { header: "Vehicle" }, { header: "Received by" }], rows: s.grns.map((g) => [g.id, fdate(g.date), g.po, g.project, g.item, g.qty, g.vehicle, g.by]) },
      ],
    }),
  },
  {
    id: "dpr", group: "Site", name: "Daily progress summary", desc: "Daily reports from all sites: work, labour, material and issues.",
    build: (s, by) => ({
      title: "Daily Progress Summary", subtitle: "Last 3 days - all sites", fileName: "Daily_Progress_Summary", landscape: true, preparedBy: by,
      sections: [{
        columns: [{ header: "Report" }, { header: "Date" }, { header: "Site" }, { header: "By" }, { header: "Labour", align: "right" }, { header: "Work done" }, { header: "Material" }, { header: "Issues" }, { header: "Status" }],
        rows: s.dprs.map((d) => [d.id, fdate(d.date), pname(s, d.project), d.by, d.labour, d.work, d.materials, d.issues, d.status]),
      }],
    }),
  },
  {
    id: "quality", group: "Site", name: "Quality & delay register", desc: "Test results, failures and the delay register used for time extension.",
    build: (s, by) => ({
      title: "Quality & Delay Register", fileName: "Quality_Delay_Register", landscape: true, preparedBy: by,
      sections: [
        { heading: "Test register", columns: [{ header: "Test" }, { header: "Site" }, { header: "Type" }, { header: "Location" }, { header: "Cast" }, { header: "Due" }, { header: "Result" }, { header: "Status" }], rows: s.tests.map((t) => [t.id, t.project, t.test, t.location, fdate(t.cast), fdate(t.due), t.result, t.status]) },
        { heading: "Delay register", columns: [{ header: "Site" }, { header: "Cause" }, { header: "Responsibility" }, { header: "From" }, { header: "To" }, { header: "Days", align: "right" }, { header: "Reference" }], rows: s.delays.map((d) => [pname(s, d.project), d.cause, d.resp, fdate(d.from), d.to ? fdate(d.to) : "Running", d.days, d.ref]), totals: ["", "Client-caused days", "", "", "", sum(s.delays.filter((d) => d.resp === "Client"), (d) => d.days), ""] },
      ],
    }),
  },
  {
    id: "enq", group: "Sales", name: "Enquiry pipeline", desc: "All enquiries by stage with value and next follow-up.",
    build: (s, by) => ({
      title: "Enquiry Pipeline", subtitle: "As on " + fdate(DEMO_TODAY), fileName: "Enquiry_Pipeline", landscape: true, preparedBy: by,
      sections: [{
        kpis: [["Open enquiries", String(s.enquiries.filter((e) => e.stage !== "Won" && e.stage !== "Lost").length)], ["Pipeline value", CR(sum(s.enquiries.filter((e) => e.stage !== "Won" && e.stage !== "Lost"), (e) => e.value))], ["Won", String(s.enquiries.filter((e) => e.stage === "Won").length)], ["Lost", String(s.enquiries.filter((e) => e.stage === "Lost").length)]],
        columns: [{ header: "No." }, { header: "Client" }, { header: "Work" }, { header: "Source" }, { header: "Value (Rs.)", money: true }, { header: "Stage" }, { header: "Follow-up" }, { header: "Note" }],
        rows: s.enquiries.map((e) => [e.id, e.client, e.work, e.source, e.value, e.stage, fdate(e.followUp), e.note]),
      }],
    }),
  },
  {
    id: "flats", group: "Sales", name: "Flat sales & collections", desc: "Patil Residency: flat status, buyers, payments and budget vs actual.",
    build: (s, by) => ({
      title: "Patil Residency - Sales & Collections", subtitle: "Own project - " + fdate(DEMO_TODAY), fileName: "Patil_Residency_Sales", preparedBy: by,
      sections: [
        { heading: "Flat inventory", columns: [{ header: "Flat" }, { header: "Floor", align: "right" }, { header: "Type" }, { header: "Area (sqft)", align: "right" }, { header: "Price (Rs.)", money: true }, { header: "Status" }, { header: "Buyer" }, { header: "Paid (Rs.)", money: true }], rows: s.units.map((u) => [u.id, u.floor, u.type, u.area, u.price, u.status, u.buyer ?? "-", u.paid ?? 0]), totals: ["", "", "", "", "", "", "Collected", sum(s.units, (u) => u.paid ?? 0)] },
        { heading: "Budget vs actual", columns: [{ header: "Head" }, { header: "Budget (Rs.)", money: true }, { header: "Actual (Rs.)", money: true }, { header: "Used", align: "right" }], rows: ownBudget.filter((b) => b.budget).map((b) => [b.head, b.budget, b.actual, `${pct(b.actual, b.budget)}%`]), totals: ["Total", sum(ownBudget, (b) => b.budget), sum(ownBudget, (b) => b.actual), `${pct(sum(ownBudget, (b) => b.actual), sum(ownBudget, (b) => b.budget))}%`] },
      ],
    }),
  },
  {
    id: "cmp", group: "Maintenance", name: "Complaint register", desc: "Maintenance complaints with response time, type and status.",
    build: (s, by) => ({
      title: "Maintenance Complaint Register", fileName: "Complaint_Register", landscape: true, preparedBy: by,
      sections: [
        { heading: "Complaints", columns: [{ header: "No." }, { header: "Property" }, { header: "Location" }, { header: "Problem" }, { header: "Trade" }, { header: "Priority" }, { header: "Reported" }, { header: "Response" }, { header: "Type" }, { header: "Status" }], rows: s.complaints.map((c) => [c.id, c.property, c.location, c.issue, c.trade, c.priority, fdate(c.reported), c.response ?? "-", c.type, c.status]) },
        { heading: "Planned maintenance", columns: [{ header: "Job" }, { header: "Property" }, { header: "Task" }, { header: "Frequency" }, { header: "Due" }, { header: "Status" }], rows: s.pmJobs.map((j) => [j.id, j.property, j.task, j.freq, fdate(j.due), j.status]) },
      ],
    }),
  },
  {
    id: "mcost", group: "Maintenance", name: "Maintenance cost report", desc: "Every repair job costed: material, labour, overhead, amount billed and margin, by property and trade.",
    build: (s, by) => {
      const rows = s.complaints.map((c) => ({ c, k: jobCost(s.jobCards.find((j) => j.complaintId === c.id), c.type) }));
      const props = Array.from(new Set(rows.map((r) => r.c.property)));
      const trs = Array.from(new Set(rows.map((r) => r.c.trade)));
      return {
        title: "Maintenance Cost Report", subtitle: "November 2026 - all maintained properties", fileName: "Maintenance_Cost_Report", landscape: true, preparedBy: by,
        sections: [
          {
            heading: "Summary",
            kpis: [["Jobs", String(rows.length)], ["Repair cost", rs(sum(rows, (r) => r.k.cost))], ["Chargeable value (excl. GST)", rs(sum(rows, (r) => r.k.price))], ["Margin on chargeable", rs(sum(rows, (r) => r.k.margin))], ["Labour hours", String(sum(rows, (r) => r.k.labourHours))]],
          },
          {
            heading: "Job-wise costing",
            columns: [{ header: "Job" }, { header: "Property" }, { header: "Problem" }, { header: "Trade" }, { header: "Type" }, { header: "Material", money: true }, { header: "Labour", money: true }, { header: "Overhead", money: true }, { header: "Cost", money: true }, { header: "Billed", money: true }, { header: "Status" }],
            rows: rows.map(({ c, k }) => [c.id, c.property, c.issue, c.trade, c.type, k.material, k.labour, k.overhead, k.cost, k.price, c.status]),
            totals: ["", "Total", "", "", "", sum(rows, (r) => r.k.material), sum(rows, (r) => r.k.labour), sum(rows, (r) => r.k.overhead), sum(rows, (r) => r.k.cost), sum(rows, (r) => r.k.price), ""],
            note: "AMC and warranty jobs are not billed to the client; their cost is borne by the company against AMC income or as defect-period cost. Billed amounts are before GST.",
          },
          {
            heading: "By property",
            columns: [{ header: "Property" }, { header: "Jobs", align: "right" }, { header: "Repair cost", money: true }, { header: "Billed", money: true }, { header: "AMC income (month)", money: true }, { header: "Result", money: true }],
            rows: props.map((p) => { const r = rows.filter((x) => x.c.property === p); const amc = p === "Sunrise Hospital" ? 150000 : 0; const cost = sum(r, (x) => x.k.cost), billed = sum(r, (x) => x.k.price); return [p, r.length, cost, billed, amc, billed + amc - cost]; }),
          },
          {
            heading: "By trade",
            columns: [{ header: "Trade" }, { header: "Jobs", align: "right" }, { header: "Material", money: true }, { header: "Labour", money: true }, { header: "Total cost", money: true }],
            rows: trs.map((t) => { const r = rows.filter((x) => x.c.trade === t); return [t, r.length, sum(r, (x) => x.k.material), sum(r, (x) => x.k.labour), sum(r, (x) => x.k.cost)]; }),
          },
        ],
      };
    },
  },
  {
    id: "audit", group: "Admin", name: "Audit trail", desc: "Who did what and when - includes every action done in this demo.",
    build: (s, by) => ({
      title: "Audit Trail", fileName: "Audit_Trail", preparedBy: by, signatures: ["Reviewed by (Admin)", "Approved by (Owner)"],
      sections: [{ columns: [{ header: "Date & time", width: 34 }, { header: "User", width: 34 }, { header: "Action" }], rows: s.auditLog.map((a) => [fdate(a.at), a.user, a.action]) }],
    }),
  },
];

export const getReport = (id: string) => reportDefs.find((r) => r.id === id)!;

/* ---------------------------------------------------- Document PDFs */

export async function billPdf(s: DemoState, b: Bill, by: string) {
  const p = s.projects.find((x) => x.id === b.project)!;
  const items = boq[b.project];
  const lines = items
    ? items.filter((i) => i.executed > 0).map((i, k) => {
        const share = [0.08, 0.04, 0.42, 0.31, 0.1, 0.05][k] ?? 0;
        const amt = Math.round(b.workValue * share);
        return [i.code, i.desc, i.unit, Math.round(amt / i.rate * 100) / 100, i.rate, amt] as (string | number)[];
      })
    : [["1", `Work done as per measurement - ${p.type}`, "LS", 1, b.workValue, b.workValue]];
  const diff = b.workValue - lines.reduce((a, l) => a + Number(l[5]), 0);
  if (diff && lines.length) lines[lines.length - 1][5] = Number(lines[lines.length - 1][5]) + diff;
  const prevBilled = s.bills.filter((x) => x.project === b.project && x.date < b.date).reduce((a, x) => a + x.workValue, 0);
  await exportDocumentPdf({
    title: b.project === "P-C" ? "TAX INVOICE - AMC" : "RUNNING ACCOUNT BILL",
    subtitle: `${b.no}  |  ${fdate(b.date)}`, fileName: `${b.no}_${p.code.replace(/\//g, "-")}`, preparedBy: by,
    partyTitle: "Bill to", party: [p.client, p.location, "GSTIN 27AAACS9921K1ZQ", `Project: ${p.name}`],
    fields: [["Bill no.", b.no], ["Bill date", fdate(b.date)], ["Work order", p.code], ["Status", b.status], ["Place of supply", "Maharashtra (27)"], ["Certified value", b.certified ? rs(b.certified) : "Pending"]],
    sections: [
      {
        heading: "Abstract of work done this bill",
        columns: [{ header: "Item", width: 14 }, { header: "Description" }, { header: "Unit", width: 12 }, { header: "Qty", align: "right", width: 18 }, { header: "Rate (Rs.)", money: true, width: 22 }, { header: "Amount (Rs.)", money: true, width: 28 }],
        rows: lines, totals: ["", "Value of work done this bill", "", "", "", b.workValue],
      },
      {
        heading: "Bill summary",
        columns: [{ header: "Particulars" }, { header: "Basis", width: 55 }, { header: "Amount (Rs.)", money: true, width: 32 }],
        rows: [
          ["Work done up to previous bill", "Cumulative", prevBilled],
          ["Work done this bill", "Certified quantities x contract rates", b.workValue],
          ["Add: GST on works contract", "18%", b.gst],
          ["Gross amount this bill", "", b.workValue + b.gst],
          ["Less: Retention", "5% of work value", -b.retention],
          ...(b.advance ? [["Less: Mobilisation advance recovery", "10% of work value", -b.advance] as (string | number)[]] : []),
          ["Less: Income Tax TDS (194C)", "2% of work value", -b.tds],
        ],
        totals: ["Net amount payable", "", billNet(b)],
      },
    ],
    amountInWords: billNet(b),
    terms: [
      "Payment due within 30 days of certification as per contract.",
      `Bank: State Bank of India, College Road, Nashik  |  A/c 3920 1145 6672  |  IFSC SBIN0001234.`,
      "Retention will be released after completion of the 12-month defect liability period.",
      "Measurement sheets and site photographs are attached separately.",
    ],
  });
}

export async function quotationPdf(e: Enquiry, by: string) {
  const heads: [string, number][] = [["Civil & structural works", 0.46], ["Masonry & plaster", 0.14], ["Flooring & tiling", 0.12], ["Plumbing & sanitary", 0.08], ["Electrical works", 0.09], ["Painting & finishing", 0.07], ["External works & cleaning", 0.04]];
  await exportDocumentPdf({
    title: "QUOTATION", subtitle: `${e.id}/Q2  |  ${fdate(DEMO_TODAY)}`, fileName: `Quotation_${e.id}_${e.client.replace(/\W+/g, "_")}`, preparedBy: by,
    partyTitle: "Quotation to", party: [e.client, `Work: ${e.work}`, `Source: ${e.source}`, `Contact: ${e.owner}`],
    fields: [["Quotation no.", `${e.id}/Q2`], ["Date", fdate(DEMO_TODAY)], ["Valid till", "06-Dec-2026"], ["Version", "2 (revised)"], ["Duration", "As per schedule"], ["Currency", "INR"]],
    sections: [
      { text: [`Dear Sir / Madam,`, `Thank you for your enquiry for "${e.work}". We are pleased to submit our quotation as below, based on the drawings and site visit. Detailed item-wise BOQ is attached.`] },
      {
        heading: "Summary of quotation",
        columns: [{ header: "Sr.", align: "center", width: 12 }, { header: "Description of work" }, { header: "Amount (Rs.)", money: true, width: 36 }],
        rows: heads.map(([h, f], i) => [i + 1, h, Math.round(e.value * f)]),
        totals: ["", "Total (excluding GST)", e.value],
        note: "GST @ 18% extra as applicable.",
      },
    ],
    amountInWords: e.value,
    terms: ["10% advance with work order; balance by monthly running bills within 15 days of certification.", "5% retention, released after 12-month defect liability period.", "Rates valid for 30 days. Steel and cement prices beyond +/-5% will be adjusted.", "Water and electricity for construction to be provided by the client.", "Approvals, consultant fees and statutory charges are excluded."],
    signatures: ["Prepared by (Estimation)", "For Patil Constructions (Authorised Signatory)"],
  });
}

export async function payslipPdf(x: Staff, by: string) {
  const pf = Math.round(x.basic * 0.12);
  const gross = x.basic + x.allowance + x.incentive;
  await exportDocumentPdf({
    title: "PAYSLIP", subtitle: "November 2026", fileName: `Payslip_${x.id}_${x.name.replace(/\s+/g, "_")}_Nov-2026`, preparedBy: by,
    partyTitle: "Employee", party: [x.name, x.designation, `Employee ID: ${x.id}`, "Location: Nashik"],
    fields: [["Pay period", "01-30 Nov 2026"], ["Days paid", "30"], ["Bank", "SBI - XXXX4421"], ["PF no.", `MH/NSK/48812/${x.id}`], ["UAN", "1009 2231 " + x.id.slice(1)], ["Status", x.status]],
    sections: [{
      heading: "Earnings and deductions",
      columns: [{ header: "Earnings" }, { header: "Amount (Rs.)", money: true }, { header: "Deductions" }, { header: "Amount (Rs.)", money: true }],
      rows: [["Basic salary", x.basic, "Provident fund (12%)", pf], ["Site allowance", x.allowance, "Salary advance recovery", x.advance], ["Incentive", x.incentive, "Professional tax", 200]],
      totals: ["Gross earnings", gross, "Total deductions", pf + x.advance + 200],
    }],
    amountInWords: gross - pf - x.advance - 200,
    terms: [`Net pay: ${rs(gross - pf - x.advance - 200)} credited to bank account.`, "This is a computer-generated payslip."],
    signatures: ["Accountant", "Employee signature"],
  });
}

export async function jobCardPdf(s: DemoState, complaintId: string, by: string) {
  const c = s.complaints.find((x) => x.id === complaintId)!;
  const card = s.jobCards.find((j) => j.complaintId === complaintId);
  const k = jobCost(card, c.type);
  const lines = card?.lines ?? [];
  const isInvoice = !!card?.invoiceNo;
  const title = c.type === "Chargeable" ? (isInvoice ? "SERVICE INVOICE" : "REPAIR ESTIMATE") : "MAINTENANCE JOB CARD";
  const client = c.property === "Sunrise Hospital" ? "Sunrise Hospital Pvt. Ltd." : c.property === "Orchid Villa" ? "Dr. Meera Kapoor" : "Shree Sai Traders";
  const summary: (string | number)[][] = [["Material & services", k.material], [`Labour (${k.labourHours} hours)`, k.labour], [`Overhead ${card?.overheadPct ?? 10}%`, k.overhead]];
  const sumRows = c.type === "Chargeable"
    ? [...summary, ["Cost", k.cost], [`Margin ${card?.marginPct ?? 15}%`, k.margin], ["Taxable value", k.price], ["GST 18% (CGST 9% + SGST 9%)", k.gst]]
    : [...summary];
  await exportDocumentPdf({
    title, subtitle: `${isInvoice ? card!.invoiceNo + "  |  " : ""}${c.id}  |  ${fdate(DEMO_TODAY)}`,
    fileName: `${isInvoice ? card!.invoiceNo + "_" : ""}${title.replace(/\s+/g, "_")}_${c.id}`, preparedBy: by,
    partyTitle: c.type === "Chargeable" ? "Bill to" : "Property", party: [client, c.property, `Location: ${c.location}`, `Problem: ${c.issue}`],
    fields: [["Complaint no.", c.id], ["Reported", fdate(c.reported)], ["Trade", c.trade], ["Job type", c.type], ["Technician", c.tech], ["Status", c.status]],
    sections: [
      {
        heading: "Material and labour",
        columns: [{ header: "Code", width: 16 }, { header: "Description" }, { header: "Type", width: 20 }, { header: "Qty", align: "right", width: 14 }, { header: "Unit", width: 14 }, { header: "Rate (Rs.)", money: true, width: 22 }, { header: "Amount (Rs.)", money: true, width: 26 }],
        rows: lines.map((l) => [l.code, l.item, l.kind, l.qty, l.unit, l.rate, Math.round(l.qty * l.rate)]),
        totals: ["", "Sub-total", "", "", "", "", k.material + k.labour],
      },
      {
        heading: c.type === "Chargeable" ? "Amount payable" : "Cost summary",
        columns: [{ header: "Particulars" }, { header: "Amount (Rs.)", money: true, width: 36 }],
        rows: sumRows,
        totals: c.type === "Chargeable" ? ["Total amount payable", k.total] : ["Cost to company (not billed)", k.cost],
        note: c.type === "Chargeable" ? undefined : whoPays[c.type] + ".",
      },
    ],
    amountInWords: c.type === "Chargeable" ? k.total : undefined,
    terms: c.type === "Chargeable"
      ? [isInvoice ? "Payment due within 15 days of invoice." : "Estimate valid for 15 days. Work starts after your approval.", "Replaced parts carry 6 months warranty on workmanship.", "Bank: State Bank of India, College Road, Nashik | A/c 3920 1145 6672 | IFSC SBIN0001234."]
      : ["Work completed and checked by the technician. Before/after photographs are kept in the system.", "Client signature confirms the work is done to satisfaction."],
    signatures: c.type === "Chargeable" ? ["Technician", "For Patil Constructions (Authorised Signatory)"] : ["Technician", "Client / property in-charge", "Project Manager"],
  });
}

export async function wageSlipPdf(s: DemoState, workerId: string, by: string) {
  const w = s.workers.find((x) => x.id === workerId)!;
  const r = s.wageRows.find((x) => x.workerId === workerId)!;
  const k = wageCalc(w, r);
  await exportDocumentPdf({
    title: "WAGE SLIP", subtitle: `${WEEK.label}  |  ${fdate(WEEK.from)} to ${fdate(WEEK.to)}`, fileName: `Wage_Slip_${w.id}_${w.name.replace(/\s+/g, "_")}_Week-${WEEK.no}`, preparedBy: by,
    partyTitle: "Worker", party: [w.name, `${w.category}  |  ID ${w.id}`, `Contractor: ${w.contractor}`, `Site: ${WEEK.site}`],
    fields: [["Week", WEEK.label], ["Period", `${fdate(WEEK.from)} - ${fdate(WEEK.to).slice(0, 6)}`], ["Daily rate", rs(w.rate)], ["Payment mode", r.mode], ["ESIC no.", `3100${w.id.slice(1)}7712`], ["Status", r.paid ? "Paid" : "Pending"]],
    sections: [
      {
        heading: "Attendance",
        columns: WEEK.days.map((d) => ({ header: d, align: "center" as const })).concat([{ header: "Days", align: "center" as const }, { header: "OT hours", align: "center" as const }]),
        rows: [[...r.days.map(dayMark), k.days, r.ot]],
      },
      {
        heading: "Earnings and deductions",
        columns: [{ header: "Earnings" }, { header: "Amount (Rs.)", money: true }, { header: "Deductions" }, { header: "Amount (Rs.)", money: true }],
        rows: [[`Wages (${k.days} days x Rs. ${w.rate})`, k.basic, "ESIC (0.75%)", k.esic], [`Overtime (${r.ot} h)`, k.otAmt, "Advance recovery", k.advance]],
        totals: ["Gross wages", k.gross, "Total deductions", k.esic + k.advance],
      },
    ],
    amountInWords: k.net,
    terms: [`Net wages: ${rs(k.net)} ${r.mode === "Bank" ? "credited to bank account" : "paid in cash against signature"}.`, "Wages are above the notified minimum wage for this category.", "This is a computer-generated wage slip."],
    signatures: ["Site Supervisor", "Accountant", "Worker signature / thumb"],
  });
}
