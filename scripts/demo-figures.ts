// Prints the key numbers shown in the demo, so the presenter script quotes them exactly.
import * as s from "../src/lib/data";
import { billNet, inrShort, inr } from "../src/lib/format";
import { jobCost } from "../src/lib/maint";
import { wageCalc } from "../src/lib/wages";
const day = (iso: string) => Math.round((new Date(iso).getTime() - new Date(s.DEMO_TODAY).getTime()) / 86400000);
const out = s.bills.filter((b) => !["Paid", "Draft", "Submitted"].includes(b.status)).reduce((a, b) => a + billNet(b) - (b.received ?? 0), 0);
const due7 = s.payables.filter((p) => p.status !== "Paid" && day(p.due) <= 7).reduce((a, p) => a + p.amount, 0);
console.log("inHand", inrShort(s.projects.reduce((a, p) => a + p.value, 0)), "outstanding", inrShort(out), "due7", inrShort(due7), "retention", inrShort(s.projects.reduce((a, p) => a + p.retention, 0)));
console.log("approvals", s.pos.filter((p) => p.status === "Pending Owner").map((p) => `${p.id} ${inrShort(p.amount)}`), s.payables.filter((p) => p.status === "Pending Approval").map((p) => `${p.party} ${inr(p.amount)}`));
const pa = s.bills.filter((b) => b.project === "P-A");
console.log("client paid", inrShort(pa.reduce((a, b) => a + (b.received ?? 0), 0)), pa.filter((b) => b.received).length, "due", inrShort(pa.filter((b) => b.status === "Invoiced").reduce((a, b) => a + billNet(b), 0)));
for (const b of pa.filter((b) => b.status !== "Paid")) console.log(b.no, b.status, "net", inr(billNet(b)));
for (const id of ["CMP-414", "CMP-416", "CMP-415"]) { const c = s.complaints.find((x) => x.id === id)!; const k = jobCost(s.jobCards.find((j) => j.complaintId === id), c.type); console.log(id, "cost", inr(k.cost), "price", inr(k.price), "total", inr(k.total)); }
const w = s.wageRows.reduce((a, r) => a + wageCalc(s.workers.find((x) => x.id === r.workerId)!, r).net, 0);
console.log("wages net", inr(w), "salary net", inr(s.staff.reduce((a, x) => a + x.basic + x.allowance + x.incentive - x.advance - Math.round(x.basic * 0.12), 0)));
console.log("units", s.units.filter((u) => u.status === "Sold" || u.status === "Booked").length, "of", s.units.length, "available", s.units.filter((u) => u.status === "Available").map((u) => u.id));
console.log("enquiries open", s.enquiries.filter((e) => e.stage !== "Won" && e.stage !== "Lost").length, inrShort(s.enquiries.filter((e) => e.stage !== "Won" && e.stage !== "Lost").reduce((a, e) => a + e.value, 0)));
