# Demo Guide - Patil Constructions Company Management System

Static clickable demo. All data is sample data kept in the browser; nothing is sent to a server.

## Start the demo

```bash
cd construction-portal
npm run demo
```

Open http://localhost:3000. (`npm run dev` also works, but shows the Next.js dev badge.)

- Every user's password is **demo123**, or use the **Quick demo login** cards.
- Switch role any time: click your name (top right) → **Switch demo role**.
- **Reset demo** (top bar) restores the original data after you have clicked around.
- Works on phone: open `http://<your-laptop-ip>:3000` on the same Wi-Fi.

## Put it online (Cloudflare Workers)

The demo is fully static (all data lives in the browser), so it runs on Cloudflare Workers as static assets - free plan is enough.

```bash
npm run export            # builds static files into ./out
npx wrangler login        # one time: opens Cloudflare in the browser
npx wrangler deploy       # uploads ./out using wrangler.jsonc
```

You get a link like `https://patil-constructions-demo.<your-subdomain>.workers.dev` that works on any laptop or phone. Each visitor gets their own copy of the demo data in their browser.

## Reports and exports (real downloads)

Every export creates a real file from the live demo data, so anything clicked during the demo shows up in the reports.

- **Reports & MIS → Report center**: 18 reports, each as **PDF** (letterhead, summary boxes, tables with totals, signature block, page numbers) and **Excel** (formatted header, frozen rows, numeric cells, totals, Summary sheet).
  - Management: Monthly MIS (multi-page), Project profitability, Works in hand statement (for bank/clients)
  - Billing: Client outstanding & ageing, Bill register, Change order register
  - Payments: Payables & payment plan, Salary sheet, Weekly wage sheet (per worker), Muster roll & wages
  - Store: Stock statement, PO register with GRNs
  - Site: Daily progress summary, Quality & delay register
  - Sales: Enquiry pipeline, Flat sales & collections
  - Maintenance: Complaint register, Maintenance cost report (job-wise material, labour, overhead, billed) · Admin: Audit trail
- **Billing → Open a bill → Bill PDF**: Running Account Bill with abstract of work, deductions, net payable, amount in words, bank details.
- **Enquiries → Quote → Quotation PDF**: client quotation with summary, terms and validity.
- **Payments → Staff salary → Payslip**: individual payslip PDF.
- **Payments → Labour wages → Slip**: weekly wage slip per worker (attendance, wages, overtime, ESIC, advance, net in words).
- **Maintenance → Job card**: Repair estimate PDF (chargeable), Service invoice PDF (after invoice), or Maintenance job card PDF (AMC / warranty - cost not billed).
- Export buttons also sit on Store, Attendance, Daily Reports, Quality, Change Orders, Own Projects, Maintenance and Admin (audit trail).

Good demo moment: approve / pay / book something, then download the Audit Trail or MIS - the new action is already in it.

## Suggested 20-minute flow

| # | Login as | Show | Click |
|---|---|---|---|
| 1 | Owner | One-page view of the whole company | Dashboard stats, billing chart, progress vs planned, alerts |
| 2 | Owner | Approvals above limit | Approve **PO-1044** (₹7.98 L) on dashboard |
| 3 | Sales & Estimation | Pipeline | Enquiries → move **Hotel Panchavati** with *Next ▶*; open *Quote* on Kulkarni Hospital; add *New enquiry* |
| 4 | Project Manager | Site control | Approve indent **IND-311**; Daily Reports → approve a report; Quality & Delays → delay register (21 net days) |
| 5 | Site Engineer | Daily site work | Daily Reports → *Today's report* → fill → *Add photo* → Submit; Store → *Raise indent*; Quality → *Enter result* on T-552 |
| 6 | Site Supervisor | Attendance on phone | Tap workers Present/Absent → *Save attendance* |
| 7 | Store Keeper | Material | Store → *Receive material (GRN)* against PO-1043; see stock rise; Consumption check tab |
| 8 | Billing Engineer | Client bills | Billing → open **RA-07** → *Mark certified* → *Raise invoice*; Change Orders list |
| 9 | Accountant | Money in and out | Billing → open **RA-06** → *Record payment*; Payments → *Process salary*, pay a supplier |
| 9a | Owner / Accountant | Worker wages | Payments → **Labour wages (weekly)**: day-wise P/H/A for 12 workers, overtime, ESIC, advance → *Approve sheet* (owner/PM) → *Pay all* or pay one worker (accountant) → **Slip** for any worker; wage sheet PDF has a signature/thumb column |
| 10 | Owner | Own project | Own Projects → click an available flat (e.g. 202) → book it; Budget & funding tab |
| 11 | Maintenance Technician | Repairs with costing | Open **Job card** on CMP-416 (4 LED lights + switches) → add an item from the rate list → see material + labour + overhead cost → *Close with photo*; mark tank cleaning done |
| 11a | Client (Portal) | Approve a repair estimate | Complaints → **CMP-414 broken window glass** → *Approve estimate* (₹5,612 incl. GST) |
| 11b | Maintenance Technician | Invoice the repair | CMP-414 → *Close with photo* → *Job card* → **Raise invoice** → *Invoice PDF* |
| 11c | Owner | Is maintenance profitable? | Maintenance → **Cost analysis** (by property and trade) → *Cost report* PDF / Excel |
| 12 | Client (Portal) | What the client sees | Progress ring and milestones; Change Approvals → approve **CO-02**; Bills → *Pay now*; Complaints → raise one |
| 13 | Owner | Reports | Reports & MIS → profitability, works in hand; Admin → role permissions, licence expiry, audit trail (shows every action done in the demo) |

Tip: do step 13 last - the audit trail lists everything clicked during the demo.

## Roles and what they see

| Role | Login | Menus |
|---|---|---|
| Owner | owner@patilconstructions.in | Everything + approvals |
| Office Admin | admin@patilconstructions.in | Admin, projects, reports |
| Sales & Estimation | sales@patilconstructions.in | Enquiries, flat sales, AMC renewals |
| Project Manager | pm@patilconstructions.in | Sites, reports, approvals, quality, store |
| Site Engineer | kiran@patilconstructions.in | Own sites, daily report, indent, tests |
| Site Supervisor | ramesh@patilconstructions.in | Attendance, daily work |
| Store Keeper | store@patilconstructions.in | Stock, GRN, PO |
| Billing Engineer | billing@patilconstructions.in | Bills, change orders |
| Accountant | accounts@patilconstructions.in | Payments, payroll, receipts, reports |
| Maintenance Technician | ganesh@patilconstructions.in | Complaints, planned jobs |
| Client (Portal) | suresh@shreesaitraders.in | Own project, bills, approvals, complaints |
