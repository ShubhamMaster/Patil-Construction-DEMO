# Patil Constructions - Company Management System (Demo)

Clickable demo of a construction company management system for one owner and all projects: client contracts, own projects, maintenance and payments.

All data is sample data kept in the browser. There is no backend in this demo.

## Features

- Login with 11 roles: Owner, Office Admin, Sales & Estimation, Project Manager, Site Engineer, Site Supervisor, Store Keeper, Billing Engineer, Accountant, Maintenance Technician, Client portal
- Role-based dashboards and menus
- Projects with BOQ, bills, change orders, delays, photos and documents
- Enquiries and quotations pipeline
- Daily progress reports, attendance, store and purchase, quality and delay register
- Running bills with retention, advance recovery, TDS and GST; collections and ageing
- Payroll: staff salary with payslips, weekly labour wage sheet with wage slips
- Own project: flat inventory, bookings, budget and funding
- Maintenance: complaints, job cards with material and labour costing, client estimate approval, service invoices
- Reports: 19 reports as formatted PDF and Excel, plus bill, quotation, payslip, wage slip and job card PDFs

## Run locally

```bash
npm install
npm run demo
```

Open http://localhost:3000. The password for all demo users is `demo123`, or use the quick login cards.

See [DEMO_GUIDE.md](DEMO_GUIDE.md) for a step-by-step demo script.

## Deploy to Cloudflare Workers

```bash
npm run export
npx wrangler login
npx wrangler deploy
```

## Tech

Next.js, React, TypeScript, Tailwind CSS, jsPDF (PDF), write-excel-file (Excel).
