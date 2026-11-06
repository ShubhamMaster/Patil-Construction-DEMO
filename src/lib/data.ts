// Demo seed data for Patil Constructions. All names, places and amounts are fictional.

export const DEMO_TODAY = "2026-11-06";

export type Role =
  | "owner" | "admin" | "sales" | "pm" | "site" | "supervisor"
  | "store" | "billing" | "accountant" | "technician" | "client";

export type User = { id: string; name: string; role: Role; email: string; phone: string; projects: string[]; initials: string };

export const users: User[] = [
  { id: "u1", name: "Rajesh Patil", role: "owner", email: "owner@patilconstructions.in", phone: "98220 11001", projects: ["*"], initials: "RP" },
  { id: "u2", name: "Vinod Kale", role: "admin", email: "admin@patilconstructions.in", phone: "98220 11002", projects: ["*"], initials: "VK" },
  { id: "u3", name: "Sneha Joshi", role: "sales", email: "sales@patilconstructions.in", phone: "98220 11003", projects: ["*"], initials: "SJ" },
  { id: "u4", name: "Amit Deshmukh", role: "pm", email: "pm@patilconstructions.in", phone: "98220 11004", projects: ["P-A", "P-B", "P-D", "P-E"], initials: "AD" },
  { id: "u5", name: "Kiran Pawar", role: "site", email: "kiran@patilconstructions.in", phone: "98220 11005", projects: ["P-A", "P-B"], initials: "KP" },
  { id: "u6", name: "Ramesh Shinde", role: "supervisor", email: "ramesh@patilconstructions.in", phone: "98220 11006", projects: ["P-A"], initials: "RS" },
  { id: "u7", name: "Sunil More", role: "store", email: "store@patilconstructions.in", phone: "98220 11007", projects: ["P-A", "P-B", "P-D", "P-E"], initials: "SM" },
  { id: "u8", name: "Pooja Kulkarni", role: "billing", email: "billing@patilconstructions.in", phone: "98220 11008", projects: ["*"], initials: "PK" },
  { id: "u9", name: "Mahesh Jadhav", role: "accountant", email: "accounts@patilconstructions.in", phone: "98220 11009", projects: ["*"], initials: "MJ" },
  { id: "u10", name: "Ganesh Bhosale", role: "technician", email: "ganesh@patilconstructions.in", phone: "98220 11010", projects: ["P-C", "P-F"], initials: "GB" },
  { id: "u11", name: "Suresh Agarwal", role: "client", email: "suresh@shreesaitraders.in", phone: "98500 22011", projects: ["P-A"], initials: "SA" },
];

export const roleLabel: Record<Role, string> = {
  owner: "Owner", admin: "Office Admin", sales: "Sales & Estimation", pm: "Project Manager",
  site: "Site Engineer", supervisor: "Site Supervisor", store: "Store Keeper", billing: "Billing Engineer",
  accountant: "Accountant", technician: "Maintenance Technician", client: "Client (Portal)",
};

export type Project = {
  id: string; code: string; name: string; category: "Client Contract" | "Own Project" | "Maintenance" | "Renovation" | "Reconstruction" | "Interior";
  client: string; location: string; value: number; budget: number; cost: number; billed: number; received: number;
  progress: number; planned: number; status: string; start: string; end: string; pm: string; engineer: string;
  type: string; retention: number;
};

export const projects: Project[] = [
  { id: "P-A", code: "PC/26/014", name: "Shree Sai Commercial Complex (G+4)", category: "Client Contract", client: "Shree Sai Traders", location: "Nashik Road, Nashik", value: 45640000, budget: 40500000, cost: 21900000, billed: 24800000, received: 21040000, progress: 62, planned: 66, status: "In Progress", start: "2026-04-01", end: "2027-06-14", pm: "Amit Deshmukh", engineer: "Kiran Pawar", type: "Commercial - item rate", retention: 1240000 },
  { id: "P-B", code: "PC/26/OWN-02", name: "Patil Residency (G+3, 12 flats)", category: "Own Project", client: "Own project", location: "Gangapur Road, Nashik", value: 48000000, budget: 32000000, cost: 12800000, billed: 0, received: 14600000, progress: 38, planned: 40, status: "In Progress", start: "2026-03-15", end: "2027-09-15", pm: "Amit Deshmukh", engineer: "Kiran Pawar", type: "Residential - for sale", retention: 0 },
  { id: "P-C", code: "PC/AMC/07", name: "Sunrise Hospital - Annual Maintenance", category: "Maintenance", client: "Sunrise Hospital Pvt. Ltd.", location: "College Road, Nashik", value: 1800000, budget: 1250000, cost: 1020000, billed: 1350000, received: 900000, progress: 75, planned: 75, status: "Under Maintenance", start: "2026-02-01", end: "2027-01-31", pm: "Amit Deshmukh", engineer: "Ganesh Bhosale", type: "AMC - civil, plumbing, waterproofing", retention: 0 },
  { id: "P-D", code: "PC/26/019", name: "Greenfield School Renovation", category: "Renovation", client: "Greenfield Education Trust", location: "Satpur, Nashik", value: 8650000, budget: 7480000, cost: 6390000, billed: 6900000, received: 6210000, progress: 81, planned: 85, status: "In Progress", start: "2026-06-10", end: "2026-12-20", pm: "Amit Deshmukh", engineer: "Nitin Gaikwad", type: "Renovation in occupied building", retention: 345000 },
  { id: "P-E", code: "PC/26/023", name: "Mehta Warehouse Fire Reconstruction", category: "Reconstruction", client: "Mehta Logistics LLP", location: "Ambad MIDC, Nashik", value: 13200000, budget: 11600000, cost: 2850000, billed: 3100000, received: 2600000, progress: 24, planned: 22, status: "In Progress", start: "2026-08-20", end: "2027-04-30", pm: "Amit Deshmukh", engineer: "Nitin Gaikwad", type: "Reconstruction after fire", retention: 155000 },
  { id: "P-F", code: "PC/25/031", name: "Orchid Villa Interiors", category: "Interior", client: "Dr. Meera Kapoor", location: "Indira Nagar, Nashik", value: 4200000, budget: 3600000, cost: 3540000, billed: 4200000, received: 3990000, progress: 100, planned: 100, status: "Under Defect Period", start: "2025-11-01", end: "2026-04-15", pm: "Amit Deshmukh", engineer: "Ganesh Bhosale", type: "Interior fit-out", retention: 210000 },
];

export type Enquiry = { id: string; client: string; work: string; source: string; value: number; stage: "New" | "Site Visit" | "Estimating" | "Quoted" | "Negotiation" | "Won" | "Lost"; owner: string; followUp: string; note: string };
export const enquiries: Enquiry[] = [
  { id: "ENQ-118", client: "Kulkarni Hospital", work: "OPD block extension (G+2)", source: "Architect", value: 21000000, stage: "Quoted", owner: "Sneha Joshi", followUp: "2026-11-07", note: "Quote v2 sent 02-Nov; client comparing 3 bids" },
  { id: "ENQ-121", client: "Nashik Auto Components", work: "Factory shed + office", source: "Repeat client", value: 38000000, stage: "Negotiation", owner: "Sneha Joshi", followUp: "2026-11-06", note: "Asked 2% reduction on steel items" },
  { id: "ENQ-124", client: "Mr. Anil Bhandari", work: "Bungalow (G+1)", source: "Reference", value: 9500000, stage: "Estimating", owner: "Pooja Kulkarni", followUp: "2026-11-09", note: "Drawings received; BOQ 70% done" },
  { id: "ENQ-125", client: "St. Xavier's School", work: "Terrace waterproofing + painting", source: "Direct", value: 2400000, stage: "Site Visit", owner: "Sneha Joshi", followUp: "2026-11-08", note: "Visit scheduled Sat 10 am" },
  { id: "ENQ-126", client: "Hotel Panchavati", work: "Renovation of 24 rooms", source: "Website", value: 7800000, stage: "New", owner: "Sneha Joshi", followUp: "2026-11-06", note: "Call back today" },
  { id: "ENQ-109", client: "Mehta Logistics LLP", work: "Warehouse fire reconstruction", source: "Repeat client", value: 13200000, stage: "Won", owner: "Sneha Joshi", followUp: "-", note: "Converted to PC/26/023" },
  { id: "ENQ-112", client: "Shah Developers", work: "Podium parking slab", source: "Tender", value: 16500000, stage: "Lost", owner: "Sneha Joshi", followUp: "-", note: "Lost on price; L1 was 6% lower" },
  { id: "ENQ-127", client: "Gupta Textiles", work: "Godown roof replacement", source: "Reference", value: 3100000, stage: "New", owner: "Sneha Joshi", followUp: "2026-11-10", note: "Enquiry via WhatsApp" },
];

export type BoqItem = { code: string; desc: string; unit: string; qty: number; rate: number; executed: number; budgetRate: number };
export const boq: Record<string, BoqItem[]> = {
  "P-A": [
    { code: "1.01", desc: "Excavation in all soils up to 3 m depth", unit: "cum", qty: 2850, rate: 285, executed: 2850, budgetRate: 240 },
    { code: "2.03", desc: "PCC 1:4:8 in foundation", unit: "cum", qty: 145, rate: 5400, executed: 145, budgetRate: 4850 },
    { code: "3.10", desc: "RCC M25 in footings, columns, beams, slabs", unit: "cum", qty: 1980, rate: 7850, executed: 1310, budgetRate: 7050 },
    { code: "3.21", desc: "TMT Fe-500D reinforcement", unit: "MT", qty: 238, rate: 72500, executed: 158, budgetRate: 66800 },
    { code: "4.05", desc: "AAC block masonry 200 mm", unit: "cum", qty: 1120, rate: 6200, executed: 420, budgetRate: 5500 },
    { code: "5.12", desc: "Internal plaster 12 mm", unit: "sqm", qty: 14800, rate: 310, executed: 2100, budgetRate: 265 },
    { code: "6.40", desc: "Imported vitrified tiles 800x800 (CO-01)", unit: "sqm", qty: 5200, rate: 1650, executed: 0, budgetRate: 1420 },
    { code: "7.02", desc: "Structural glazing - front elevation", unit: "sqm", qty: 860, rate: 7400, executed: 0, budgetRate: 6550 },
  ],
};

export type Bill = { id: string; project: string; no: string; date: string; workValue: number; gst: number; retention: number; advance: number; tds: number; status: "Draft" | "Submitted" | "Certified" | "Invoiced" | "Paid" | "Part Paid"; certified?: number; paidOn?: string; received?: number; daysPending?: number };
export const bills: Bill[] = [
  { id: "B1", project: "P-A", no: "RA-01", date: "2026-05-31", workValue: 4200000, gst: 756000, retention: 210000, advance: 420000, tds: 84000, status: "Paid", certified: 4200000, paidOn: "2026-06-24", received: 4242000 },
  { id: "B2", project: "P-A", no: "RA-02", date: "2026-06-30", workValue: 4650000, gst: 837000, retention: 232500, advance: 465000, tds: 93000, status: "Paid", certified: 4650000, paidOn: "2026-07-28", received: 4696500 },
  { id: "B3", project: "P-A", no: "RA-03", date: "2026-07-31", workValue: 3900000, gst: 702000, retention: 195000, advance: 390000, tds: 78000, status: "Paid", certified: 3900000, paidOn: "2026-09-02", received: 3939000 },
  { id: "B4", project: "P-A", no: "RA-04", date: "2026-08-31", workValue: 4050000, gst: 729000, retention: 202500, advance: 405000, tds: 81000, status: "Paid", certified: 4050000, paidOn: "2026-09-30", received: 4090500 },
  { id: "B5", project: "P-A", no: "RA-05", date: "2026-09-30", workValue: 4000000, gst: 720000, retention: 200000, advance: 400000, tds: 80000, status: "Paid", certified: 4000000, paidOn: "2026-10-29", received: 4040000 },
  { id: "B6", project: "P-A", no: "RA-06", date: "2026-10-31", workValue: 4000000, gst: 720000, retention: 200000, advance: 400000, tds: 80000, status: "Invoiced", certified: 4000000, daysPending: 6 },
  { id: "B7", project: "P-A", no: "RA-07", date: "2026-11-05", workValue: 3850000, gst: 693000, retention: 192500, advance: 385000, tds: 77000, status: "Submitted", daysPending: 1 },
  { id: "B8", project: "P-D", no: "RA-04", date: "2026-10-25", workValue: 1450000, gst: 261000, retention: 72500, advance: 0, tds: 29000, status: "Part Paid", certified: 1420000, received: 900000, daysPending: 12 },
  { id: "B9", project: "P-E", no: "RA-02", date: "2026-10-28", workValue: 1650000, gst: 297000, retention: 82500, advance: 165000, tds: 33000, status: "Certified", certified: 1600000, daysPending: 9 },
  { id: "B10", project: "P-C", no: "AMC-Q3", date: "2026-10-01", workValue: 450000, gst: 81000, retention: 0, advance: 0, tds: 9000, status: "Invoiced", certified: 450000, daysPending: 36 },
];

export type ChangeOrder = { id: string; project: string; title: string; value: number; days: number; status: "Pending Client" | "Approved" | "On Hold" | "Rejected" | "Draft"; raised: string; by: string };
export const changeOrders: ChangeOrder[] = [
  { id: "CO-01", project: "P-A", title: "Imported vitrified tiles instead of quoted tiles (all floors)", value: 640000, days: 0, status: "Approved", raised: "2026-08-12", by: "Client" },
  { id: "CO-02", project: "P-A", title: "Additional toilet block on terrace", value: 810000, days: 15, status: "Pending Client", raised: "2026-08-14", by: "Client" },
  { id: "CO-03", project: "P-A", title: "Shift staircase opening at 2nd floor (architect instruction)", value: 85000, days: 2, status: "Pending Client", raised: "2026-10-28", by: "Architect" },
  { id: "CO-04", project: "P-D", title: "Extra waterproofing to old terrace", value: 265000, days: 5, status: "Approved", raised: "2026-07-20", by: "Client" },
  { id: "CO-05", project: "P-E", title: "Replace corroded columns C4-C7 (found after dismantling)", value: 540000, days: 10, status: "Pending Client", raised: "2026-10-30", by: "Site" },
];

export type Delay = { id: string; project: string; cause: string; resp: "Client" | "Company" | "Neutral"; from: string; to?: string; days: number; ref: string };
export const delays: Delay[] = [
  { id: "D1", project: "P-A", cause: "Revised elevation drawing awaited from architect", resp: "Client", from: "2026-09-01", to: "2026-09-18", days: 18, ref: "Email 01-Sep" },
  { id: "D2", project: "P-A", cause: "RA-03 payment overdue - work slowed", resp: "Client", from: "2026-09-10", to: "2026-09-21", days: 12, ref: "Letter PC/A/112" },
  { id: "D3", project: "P-A", cause: "Lift shaft drawing awaited", resp: "Client", from: "2026-11-01", days: 6, ref: "Email 01-Nov" },
  { id: "D4", project: "P-D", cause: "Classrooms not vacated (exams)", resp: "Client", from: "2026-10-12", to: "2026-10-19", days: 8, ref: "Letter GS/14" },
  { id: "D5", project: "P-B", cause: "Steel supply shortage", resp: "Company", from: "2026-10-03", to: "2026-10-07", days: 5, ref: "-" },
];

export type DPR = { id: string; project: string; date: string; by: string; labour: number; work: string; materials: string; weather: string; issues: string; status: "Approved" | "Submitted"; photos: number };
export const dprs: DPR[] = [
  { id: "DPR-A-201", project: "P-A", date: "2026-11-05", by: "Kiran Pawar", labour: 38, work: "4th slab shuttering 70% done; column casting C12-C18 (14.5 cum)", materials: "Cement 120 bags, steel 2.8 MT used", weather: "Clear", issues: "Lift shaft drawing still awaited", status: "Submitted", photos: 6 },
  { id: "DPR-A-200", project: "P-A", date: "2026-11-04", by: "Kiran Pawar", labour: 41, work: "Column reinforcement C12-C24; AAC masonry 2nd floor 18 cum", materials: "Cement 95 bags, AAC 18 cum", weather: "Clear", issues: "-", status: "Approved", photos: 8 },
  { id: "DPR-A-199", project: "P-A", date: "2026-11-03", by: "Kiran Pawar", labour: 36, work: "Masonry 2nd floor 21 cum; plaster 1st floor 240 sqm", materials: "Cement 140 bags", weather: "Light rain evening", issues: "Pump breakdown 2 hrs", status: "Approved", photos: 5 },
  { id: "DPR-B-088", project: "P-B", date: "2026-11-05", by: "Kiran Pawar", labour: 24, work: "2nd slab de-shuttering; brickwork 1st floor 9 cum", materials: "Bricks 4,500 nos", weather: "Clear", issues: "-", status: "Submitted", photos: 4 },
  { id: "DPR-D-131", project: "P-D", date: "2026-11-05", by: "Nitin Gaikwad", labour: 18, work: "Painting Block B 420 sqm; toilet tiling 2 nos", materials: "Paint 60 L, tiles 38 sqm", weather: "Clear", issues: "Block C to be vacated on Monday", status: "Approved", photos: 7 },
];

export type Worker = { id: string; name: string; category: string; rate: number; contractor: string; present: boolean; ot: number };
export const workers: Worker[] = [
  { id: "W01", name: "Babu Rathod", category: "Mason", rate: 900, contractor: "Direct", present: true, ot: 2 },
  { id: "W02", name: "Sanjay Kale", category: "Mason", rate: 900, contractor: "Direct", present: true, ot: 0 },
  { id: "W03", name: "Raju Pawar", category: "Bar bender", rate: 850, contractor: "Shiv Steel Works", present: true, ot: 2 },
  { id: "W04", name: "Mohan Jadhav", category: "Bar bender", rate: 850, contractor: "Shiv Steel Works", present: false, ot: 0 },
  { id: "W05", name: "Sunita Bhoir", category: "Helper", rate: 550, contractor: "Direct", present: true, ot: 0 },
  { id: "W06", name: "Lakshmi Gavit", category: "Helper", rate: 550, contractor: "Direct", present: true, ot: 0 },
  { id: "W07", name: "Ajay Mali", category: "Carpenter", rate: 950, contractor: "Direct", present: true, ot: 1 },
  { id: "W08", name: "Vikas Sonawane", category: "Carpenter", rate: 950, contractor: "Direct", present: false, ot: 0 },
  { id: "W09", name: "Deepak Wagh", category: "Helper", rate: 550, contractor: "Direct", present: true, ot: 0 },
  { id: "W10", name: "Imran Shaikh", category: "Electrician", rate: 1000, contractor: "Bright Electricals", present: true, ot: 0 },
  { id: "W11", name: "Ravi Thakare", category: "Plumber", rate: 950, contractor: "Direct", present: true, ot: 0 },
  { id: "W12", name: "Kavita Ahire", category: "Helper", rate: 550, contractor: "Direct", present: true, ot: 0 },
];

export type StockItem = { id: string; site: string; item: string; unit: string; stock: number; min: number; rate: number };
export const stock: StockItem[] = [
  { id: "S1", site: "P-A", item: "Cement OPC 53", unit: "bags", stock: 420, min: 300, rate: 365 },
  { id: "S2", site: "P-A", item: "TMT Fe-500D 12 mm", unit: "MT", stock: 3.2, min: 5, rate: 66500 },
  { id: "S3", site: "P-A", item: "TMT Fe-500D 16 mm", unit: "MT", stock: 6.8, min: 5, rate: 66200 },
  { id: "S4", site: "P-A", item: "Crushed sand", unit: "brass", stock: 14, min: 10, rate: 5200 },
  { id: "S5", site: "P-A", item: "20 mm aggregate", unit: "brass", stock: 9, min: 10, rate: 3900 },
  { id: "S6", site: "P-A", item: "AAC blocks 200 mm", unit: "cum", stock: 46, min: 30, rate: 4100 },
  { id: "S7", site: "P-B", item: "Cement OPC 53", unit: "bags", stock: 180, min: 200, rate: 365 },
  { id: "S8", site: "P-B", item: "Red bricks", unit: "nos", stock: 12500, min: 8000, rate: 9 },
  { id: "S9", site: "P-D", item: "Exterior emulsion", unit: "L", stock: 140, min: 100, rate: 310 },
  { id: "S10", site: "P-E", item: "Cement OPC 53", unit: "bags", stock: 260, min: 150, rate: 365 },
];

export type Indent = { id: string; project: string; item: string; qty: string; needBy: string; by: string; status: "Pending Approval" | "Approved" | "PO Raised" | "Rejected" };
export const indents: Indent[] = [
  { id: "IND-311", project: "P-A", item: "TMT Fe-500D 12 mm", qty: "12 MT", needBy: "2026-11-15", by: "Kiran Pawar", status: "Pending Approval" },
  { id: "IND-312", project: "P-B", item: "Cement OPC 53", qty: "400 bags", needBy: "2026-11-10", by: "Kiran Pawar", status: "Pending Approval" },
  { id: "IND-309", project: "P-A", item: "20 mm aggregate", qty: "15 brass", needBy: "2026-11-08", by: "Kiran Pawar", status: "PO Raised" },
  { id: "IND-306", project: "P-D", item: "Exterior emulsion", qty: "200 L", needBy: "2026-11-04", by: "Nitin Gaikwad", status: "Approved" },
];

export type PO = { id: string; vendor: string; project: string; item: string; amount: number; status: "Pending Owner" | "Approved" | "Delivered" | "Part Delivered"; date: string };
export const pos: PO[] = [
  { id: "PO-1044", vendor: "Godavari Steel Traders", project: "P-A", item: "TMT 12/16 mm - 12 MT", amount: 798000, status: "Pending Owner", date: "2026-11-05" },
  { id: "PO-1043", vendor: "Sahyadri Aggregates", project: "P-A", item: "20 mm aggregate - 15 brass", amount: 58500, status: "Part Delivered", date: "2026-11-03" },
  { id: "PO-1041", vendor: "UltraTech Dealer - Nashik", project: "P-B", item: "Cement OPC 53 - 600 bags", amount: 219000, status: "Delivered", date: "2026-10-28" },
  { id: "PO-1040", vendor: "Asian Paints Dealer", project: "P-D", item: "Exterior emulsion - 200 L", amount: 62000, status: "Approved", date: "2026-10-27" },
];

export type GRN = { id: string; po: string; project: string; item: string; qty: string; vehicle: string; date: string; by: string };
export const grns: GRN[] = [
  { id: "GRN-2210", po: "PO-1043", project: "P-A", item: "20 mm aggregate", qty: "8 brass", vehicle: "MH15 GV 4521", date: "2026-11-05", by: "Sunil More" },
  { id: "GRN-2209", po: "PO-1041", project: "P-B", item: "Cement OPC 53", qty: "300 bags", vehicle: "MH15 EF 1189", date: "2026-11-02", by: "Sunil More" },
  { id: "GRN-2207", po: "PO-1041", project: "P-B", item: "Cement OPC 53", qty: "300 bags", vehicle: "MH15 EF 1189", date: "2026-10-30", by: "Sunil More" },
];

export type Test = { id: string; project: string; test: string; location: string; cast: string; due: string; result: string; status: "Pass" | "Fail" | "Due" | "Pending" };
export const tests: Test[] = [
  { id: "T-551", project: "P-A", test: "Cube 28-day (M25)", location: "3rd slab", cast: "2026-10-06", due: "2026-11-03", result: "22.4 N/mm2", status: "Fail" },
  { id: "T-552", project: "P-A", test: "Cube 28-day (M25)", location: "Columns C1-C11 (4th)", cast: "2026-10-10", due: "2026-11-07", result: "-", status: "Due" },
  { id: "T-553", project: "P-A", test: "Cube 7-day (M25)", location: "Columns C12-C18", cast: "2026-11-05", due: "2026-11-12", result: "-", status: "Pending" },
  { id: "T-548", project: "P-A", test: "Cube 28-day (M25)", location: "2nd slab", cast: "2026-09-08", due: "2026-10-06", result: "31.8 N/mm2", status: "Pass" },
  { id: "T-540", project: "P-D", test: "Waterproofing ponding test", location: "Terrace Block A", cast: "2026-10-20", due: "2026-10-22", result: "No leakage", status: "Pass" },
];

export type Staff = { id: string; name: string; designation: string; basic: number; allowance: number; incentive: number; advance: number; status: "Pending" | "Paid" };
export const staff: Staff[] = [
  { id: "E01", name: "Amit Deshmukh", designation: "Project Manager", basic: 85000, allowance: 8000, incentive: 10000, advance: 0, status: "Pending" },
  { id: "E02", name: "Kiran Pawar", designation: "Site Engineer", basic: 48000, allowance: 6000, incentive: 5000, advance: 5000, status: "Pending" },
  { id: "E03", name: "Nitin Gaikwad", designation: "Site Engineer", basic: 45000, allowance: 6000, incentive: 0, advance: 0, status: "Pending" },
  { id: "E04", name: "Ramesh Shinde", designation: "Site Supervisor", basic: 28000, allowance: 4000, incentive: 0, advance: 2000, status: "Pending" },
  { id: "E05", name: "Sunil More", designation: "Store Keeper", basic: 24000, allowance: 2000, incentive: 0, advance: 0, status: "Pending" },
  { id: "E06", name: "Pooja Kulkarni", designation: "Billing Engineer", basic: 52000, allowance: 3000, incentive: 0, advance: 0, status: "Pending" },
  { id: "E07", name: "Mahesh Jadhav", designation: "Accountant", basic: 46000, allowance: 2000, incentive: 0, advance: 0, status: "Pending" },
  { id: "E08", name: "Sneha Joshi", designation: "Sales & Estimation", basic: 42000, allowance: 3000, incentive: 12000, advance: 0, status: "Pending" },
  { id: "E09", name: "Ganesh Bhosale", designation: "Maintenance Technician", basic: 26000, allowance: 3000, incentive: 0, advance: 0, status: "Pending" },
];

export type WageRow = { workerId: string; days: number[]; ot: number; advance: number; mode: "Bank" | "Cash"; paid: boolean };
// Week 44 (02-07 Nov 2026), Shree Sai site: 1 = present, 0.5 = half day, 0 = absent (Mon..Sat)
export const wageRows: WageRow[] = [
  { workerId: "W01", days: [1, 1, 1, 1, 1, 1], ot: 6, advance: 1000, mode: "Bank", paid: false },
  { workerId: "W02", days: [1, 1, 1, 1, 1, 0.5], ot: 0, advance: 0, mode: "Bank", paid: false },
  { workerId: "W03", days: [1, 1, 1, 1, 1, 1], ot: 4, advance: 500, mode: "Bank", paid: false },
  { workerId: "W04", days: [1, 1, 0, 1, 1, 0], ot: 0, advance: 0, mode: "Cash", paid: false },
  { workerId: "W05", days: [1, 1, 1, 1, 1, 1], ot: 0, advance: 0, mode: "Bank", paid: false },
  { workerId: "W06", days: [1, 0.5, 1, 1, 1, 1], ot: 0, advance: 300, mode: "Cash", paid: false },
  { workerId: "W07", days: [1, 1, 1, 1, 1, 1], ot: 3, advance: 0, mode: "Bank", paid: false },
  { workerId: "W08", days: [1, 1, 1, 0, 0, 1], ot: 0, advance: 0, mode: "Bank", paid: false },
  { workerId: "W09", days: [1, 1, 1, 1, 1, 1], ot: 0, advance: 0, mode: "Cash", paid: false },
  { workerId: "W10", days: [1, 1, 1, 1, 0, 1], ot: 2, advance: 0, mode: "Bank", paid: false },
  { workerId: "W11", days: [1, 1, 1, 1, 1, 1], ot: 0, advance: 1000, mode: "Bank", paid: false },
  { workerId: "W12", days: [0, 1, 1, 1, 1, 1], ot: 0, advance: 0, mode: "Cash", paid: false },
];
const weekNet = (): number => wageRows.reduce((a, r) => {
  const w = workers.find((x) => x.id === r.workerId)!;
  const days = r.days.reduce((t, d) => t + d, 0);
  const gross = Math.round(days * w.rate) + Math.round((r.ot * w.rate) / 8);
  return a + gross - Math.round(gross * 0.0075) - r.advance;
}, 0);

export type Payable = { id: string; party: string; type: "Supplier" | "Subcontractor" | "Machinery Hire" | "Wages"; project: string; ref: string; amount: number; due: string; status: "Due" | "Paid" | "Pending Approval" };
export const payables: Payable[] = [
  { id: "PAY-901", party: "Weekly wages - Shree Sai site (12 workers)", type: "Wages", project: "P-A", ref: "Wage sheet wk 44", amount: weekNet(), due: "2026-11-07", status: "Pending Approval" },
  { id: "PAY-902", party: "Godavari Steel Traders", type: "Supplier", project: "P-A", ref: "INV 7781", amount: 412000, due: "2026-11-08", status: "Due" },
  { id: "PAY-903", party: "Shiv Steel Works (bar bending)", type: "Subcontractor", project: "P-A", ref: "Sub-bill SB-14", amount: 236500, due: "2026-11-10", status: "Due" },
  { id: "PAY-904", party: "Om Earthmovers (JCB hire)", type: "Machinery Hire", project: "P-E", ref: "Log Oct", amount: 96000, due: "2026-11-06", status: "Due" },
  { id: "PAY-905", party: "UltraTech Dealer - Nashik", type: "Supplier", project: "P-B", ref: "INV 3320", amount: 219000, due: "2026-11-12", status: "Due" },
  { id: "PAY-906", party: "Perfect Plaster Co.", type: "Subcontractor", project: "P-D", ref: "Sub-bill SB-07", amount: 158000, due: "2026-11-04", status: "Paid" },
  { id: "PAY-907", party: "Weekly wages - Patil Residency", type: "Wages", project: "P-B", ref: "Wage sheet wk 44", amount: 121800, due: "2026-11-07", status: "Pending Approval" },
];

export type Trade = "Civil" | "Tiling" | "Glazing" | "Electrical" | "Plumbing" | "Carpentry" | "Painting" | "Waterproofing";
export const trades: Trade[] = ["Civil", "Tiling", "Glazing", "Electrical", "Plumbing", "Carpentry", "Painting", "Waterproofing"];

export type Complaint = { id: string; property: string; location: string; issue: string; priority: "Urgent" | "High" | "Normal"; reported: string; status: "Open" | "In Progress" | "Closed"; tech: string; response?: string; type: "AMC" | "Warranty" | "Chargeable"; trade: Trade };
export const complaints: Complaint[] = [
  { id: "CMP-414", property: "Shree Sai Showroom", location: "Front elevation - shop window", issue: "Window glass cracked - 2 panes (stone hit)", priority: "High", reported: "2026-11-06 09:20", status: "Open", tech: "Ganesh Bhosale", type: "Chargeable", trade: "Glazing" },
  { id: "CMP-412", property: "Sunrise Hospital", location: "Ward 3 - toilet", issue: "Leaking pipe under wash basin", priority: "Urgent", reported: "2026-11-06 10:05", status: "In Progress", tech: "Ganesh Bhosale", response: "1h 25m", type: "AMC", trade: "Plumbing" },
  { id: "CMP-416", property: "Sunrise Hospital", location: "OPD waiting hall", issue: "4 LED panel lights not working, 2 switches broken", priority: "High", reported: "2026-11-05 18:10", status: "Open", tech: "Ganesh Bhosale", type: "AMC", trade: "Electrical" },
  { id: "CMP-415", property: "Sunrise Hospital", location: "Ward 2 corridor", issue: "6 floor tiles removed / loose - trip hazard", priority: "High", reported: "2026-11-05 11:30", status: "In Progress", tech: "Ganesh Bhosale", response: "2h 05m", type: "AMC", trade: "Tiling" },
  { id: "CMP-411", property: "Sunrise Hospital", location: "OPD corridor", issue: "Floor tile cracked near lift", priority: "Normal", reported: "2026-11-05 16:40", status: "Open", tech: "Ganesh Bhosale", type: "AMC", trade: "Tiling" },
  { id: "CMP-409", property: "Orchid Villa", location: "Master bedroom", issue: "Wardrobe shutter alignment", priority: "Normal", reported: "2026-11-03 11:00", status: "Open", tech: "Ganesh Bhosale", type: "Warranty", trade: "Carpentry" },
  { id: "CMP-417", property: "Orchid Villa", location: "Kitchen", issue: "Sink mixer tap leaking", priority: "Normal", reported: "2026-10-31 10:15", status: "Closed", tech: "Ganesh Bhosale", response: "3h 10m", type: "Warranty", trade: "Plumbing" },
  { id: "CMP-405", property: "Sunrise Hospital", location: "Terrace", issue: "Seepage near water tank", priority: "High", reported: "2026-10-30 09:15", status: "Closed", tech: "Ganesh Bhosale", response: "2h 10m", type: "AMC", trade: "Waterproofing" },
  { id: "CMP-403", property: "Shree Sai Showroom", location: "Cabin 2", issue: "Door closer broken, door slamming", priority: "Normal", reported: "2026-10-27 15:00", status: "Closed", tech: "Ganesh Bhosale", response: "5h", type: "Chargeable", trade: "Carpentry" },
  { id: "CMP-401", property: "Shree Sai Showroom", location: "Parking ramp", issue: "Plaster cracks and patch repair", priority: "Normal", reported: "2026-10-26 12:00", status: "Closed", tech: "Ganesh Bhosale", response: "4h", type: "Chargeable", trade: "Civil" },
];

export type RepairRate = { code: string; trade: Trade; item: string; unit: string; rate: number; kind: "Material" | "Labour" | "Service" };
export const repairRates: RepairRate[] = [
  { code: "G-01", trade: "Glazing", item: "Clear float glass 5 mm (cut to size)", unit: "sqft", rate: 180, kind: "Material" },
  { code: "G-02", trade: "Glazing", item: "Toughened glass 8 mm", unit: "sqft", rate: 420, kind: "Material" },
  { code: "G-03", trade: "Glazing", item: "Window rubber beading / gasket", unit: "rft", rate: 35, kind: "Material" },
  { code: "G-04", trade: "Glazing", item: "Silicone sealant tube", unit: "nos", rate: 290, kind: "Material" },
  { code: "G-L", trade: "Glazing", item: "Glazier", unit: "hour", rate: 250, kind: "Labour" },
  { code: "T-01", trade: "Tiling", item: "Vitrified tile 600x600 (matching shade)", unit: "sqm", rate: 780, kind: "Material" },
  { code: "T-02", trade: "Tiling", item: "Tile adhesive (20 kg)", unit: "bag", rate: 450, kind: "Material" },
  { code: "T-03", trade: "Tiling", item: "Epoxy grout", unit: "kg", rate: 120, kind: "Material" },
  { code: "T-04", trade: "Tiling", item: "Hacking and removal of broken tiles", unit: "sqm", rate: 150, kind: "Service" },
  { code: "T-L", trade: "Tiling", item: "Tile mason", unit: "hour", rate: 300, kind: "Labour" },
  { code: "E-01", trade: "Electrical", item: "LED panel light 18W 2x2", unit: "nos", rate: 1150, kind: "Material" },
  { code: "E-02", trade: "Electrical", item: "LED tube light 20W", unit: "nos", rate: 420, kind: "Material" },
  { code: "E-03", trade: "Electrical", item: "Modular switch / socket", unit: "nos", rate: 260, kind: "Material" },
  { code: "E-04", trade: "Electrical", item: "MCB 16A SP", unit: "nos", rate: 380, kind: "Material" },
  { code: "E-L", trade: "Electrical", item: "Electrician", unit: "hour", rate: 280, kind: "Labour" },
  { code: "P-01", trade: "Plumbing", item: "Basin pillar cock / mixer tap", unit: "nos", rate: 1450, kind: "Material" },
  { code: "P-02", trade: "Plumbing", item: "CPVC pipe 1/2 inch with fittings", unit: "rft", rate: 85, kind: "Material" },
  { code: "P-03", trade: "Plumbing", item: "Drain line jetting / cleaning", unit: "job", rate: 1200, kind: "Service" },
  { code: "P-L", trade: "Plumbing", item: "Plumber", unit: "hour", rate: 280, kind: "Labour" },
  { code: "C-01", trade: "Carpentry", item: "Hydraulic door closer", unit: "nos", rate: 1850, kind: "Material" },
  { code: "C-02", trade: "Carpentry", item: "SS hinge (heavy duty)", unit: "nos", rate: 140, kind: "Material" },
  { code: "C-L", trade: "Carpentry", item: "Carpenter", unit: "hour", rate: 300, kind: "Labour" },
  { code: "PT-01", trade: "Painting", item: "Putty and paint touch-up (2 coats)", unit: "sqm", rate: 95, kind: "Material" },
  { code: "PT-L", trade: "Painting", item: "Painter", unit: "hour", rate: 250, kind: "Labour" },
  { code: "CV-01", trade: "Civil", item: "Cement mortar patch repair", unit: "sqm", rate: 220, kind: "Material" },
  { code: "CV-L", trade: "Civil", item: "Mason", unit: "hour", rate: 300, kind: "Labour" },
  { code: "CV-H", trade: "Civil", item: "Helper", unit: "hour", rate: 180, kind: "Labour" },
  { code: "W-01", trade: "Waterproofing", item: "Polymer crack filling and coating", unit: "rft", rate: 95, kind: "Material" },
  { code: "W-L", trade: "Waterproofing", item: "Waterproofing applicator", unit: "hour", rate: 300, kind: "Labour" },
];

export type JobLine = { code: string; item: string; unit: string; qty: number; rate: number; kind: RepairRate["kind"] };
export type JobCard = { complaintId: string; lines: JobLine[]; overheadPct: number; marginPct: number; estimate: "Not sent" | "Sent to client" | "Approved" | "Rejected" | "Not needed"; invoiceNo?: string };

const L = (code: string, qty: number): JobLine => {
  const r = repairRates.find((x) => x.code === code)!;
  return { code, item: r.item, unit: r.unit, qty, rate: r.rate, kind: r.kind };
};
export const jobCards: JobCard[] = [
  { complaintId: "CMP-414", lines: [L("G-01", 12), L("G-03", 16), L("G-04", 1), L("G-L", 3)], overheadPct: 10, marginPct: 15, estimate: "Sent to client" },
  { complaintId: "CMP-412", lines: [L("P-01", 1), L("P-02", 4), L("P-L", 1.5)], overheadPct: 10, marginPct: 0, estimate: "Not needed" },
  { complaintId: "CMP-416", lines: [L("E-01", 4), L("E-03", 2), L("E-L", 2.5)], overheadPct: 10, marginPct: 0, estimate: "Not needed" },
  { complaintId: "CMP-415", lines: [L("T-04", 2.2), L("T-01", 2.2), L("T-02", 1), L("T-03", 2), L("T-L", 4)], overheadPct: 10, marginPct: 0, estimate: "Not needed" },
  { complaintId: "CMP-417", lines: [L("P-01", 1), L("P-L", 1)], overheadPct: 10, marginPct: 0, estimate: "Not needed" },
  { complaintId: "CMP-405", lines: [L("W-01", 18), L("W-L", 3)], overheadPct: 10, marginPct: 0, estimate: "Not needed" },
  { complaintId: "CMP-403", lines: [L("C-01", 1), L("C-02", 2), L("C-L", 1.5)], overheadPct: 10, marginPct: 15, estimate: "Approved", invoiceNo: "SI-0031" },
  { complaintId: "CMP-401", lines: [L("CV-01", 6), L("PT-01", 6), L("CV-L", 4), L("CV-H", 4)], overheadPct: 10, marginPct: 15, estimate: "Approved", invoiceNo: "SI-0030" },
];

export type PMJob = { id: string; property: string; task: string; due: string; freq: string; status: "Due" | "Done" | "Upcoming" };
export const pmJobs: PMJob[] = [
  { id: "PM-71", property: "Sunrise Hospital", task: "Overhead tank cleaning (4 tanks)", due: "2026-11-06", freq: "Monthly", status: "Due" },
  { id: "PM-72", property: "Sunrise Hospital", task: "Pump servicing - fire & domestic", due: "2026-11-12", freq: "Quarterly", status: "Upcoming" },
  { id: "PM-68", property: "Sunrise Hospital", task: "Drainage chamber cleaning", due: "2026-10-28", freq: "Monthly", status: "Done" },
  { id: "PM-73", property: "Orchid Villa", task: "Defect period inspection (6 months)", due: "2026-11-15", freq: "Once", status: "Upcoming" },
  { id: "PM-74", property: "Shree Sai Showroom", task: "Electrical safety check - DB, earthing, lights", due: "2026-11-20", freq: "Half-yearly", status: "Upcoming" },
];

export type Unit = { id: string; floor: number; type: string; area: number; price: number; status: "Available" | "Booked" | "Sold" | "Hold"; buyer?: string; paid?: number };
export const units: Unit[] = [
  { id: "101", floor: 1, type: "2 BHK", area: 1040, price: 3900000, status: "Sold", buyer: "Prakash Nair", paid: 1560000 },
  { id: "102", floor: 1, type: "2 BHK", area: 1040, price: 3900000, status: "Sold", buyer: "Anita Sharma", paid: 1560000 },
  { id: "103", floor: 1, type: "3 BHK", area: 1380, price: 5200000, status: "Booked", buyer: "Rahul Bendre", paid: 520000 },
  { id: "201", floor: 2, type: "2 BHK", area: 1040, price: 3950000, status: "Sold", buyer: "Vaishali Patkar", paid: 1580000 },
  { id: "202", floor: 2, type: "2 BHK", area: 1040, price: 3950000, status: "Available" },
  { id: "203", floor: 2, type: "3 BHK", area: 1380, price: 5250000, status: "Sold", buyer: "Dr. Sameer Khan", paid: 2100000 },
  { id: "301", floor: 3, type: "2 BHK", area: 1040, price: 4000000, status: "Booked", buyer: "Neha Kulkarni", paid: 400000 },
  { id: "302", floor: 3, type: "2 BHK", area: 1040, price: 4000000, status: "Available" },
  { id: "303", floor: 3, type: "3 BHK", area: 1380, price: 5300000, status: "Hold" },
  { id: "401", floor: 4, type: "2 BHK", area: 1040, price: 4050000, status: "Available" },
  { id: "402", floor: 4, type: "2 BHK", area: 1040, price: 4050000, status: "Sold", buyer: "Sachin Rane", paid: 1620000 },
  { id: "403", floor: 4, type: "3 BHK (terrace)", area: 1520, price: 6100000, status: "Booked", buyer: "Amol Thorat", paid: 610000 },
];

export const ownBudget = [
  { head: "Land (owned)", budget: 0, actual: 0 },
  { head: "Approvals & fees", budget: 1800000, actual: 1650000 },
  { head: "Construction", budget: 26000000, actual: 9850000 },
  { head: "Consultants", budget: 900000, actual: 520000 },
  { head: "Finance cost (loan interest)", budget: 2100000, actual: 560000 },
  { head: "Marketing & brokerage", budget: 1200000, actual: 220000 },
];

export const approvalsOwnProject = [
  { name: "Building permission", status: "Approved", date: "2026-02-20" },
  { name: "Commencement certificate", status: "Approved", date: "2026-03-10" },
  { name: "Plinth checking", status: "Approved", date: "2026-05-28" },
  { name: "RERA registration", status: "Approved", date: "2026-04-02" },
  { name: "Water & drainage connection", status: "Applied", date: "2026-10-15" },
  { name: "Occupancy certificate", status: "Not yet due", date: "-" },
];

export type Doc = { id: string; project: string; name: string; folder: string; rev: string; date: string; by: string };
export const docs: Doc[] = [
  { id: "DOC-1", project: "P-A", name: "Agreement - Shree Sai Traders.pdf", folder: "Contract", rev: "-", date: "2026-03-20", by: "Pooja Kulkarni" },
  { id: "DOC-2", project: "P-A", name: "ARCH-101 Ground floor plan", folder: "Drawings", rev: "R3", date: "2026-09-18", by: "Ar. Mehul Shah" },
  { id: "DOC-3", project: "P-A", name: "STR-204 4th slab reinforcement", folder: "Drawings", rev: "R1", date: "2026-10-22", by: "Er. V. Rao" },
  { id: "DOC-4", project: "P-A", name: "ARCH-110 Front elevation", folder: "Drawings", rev: "R2 (latest)", date: "2026-09-18", by: "Ar. Mehul Shah" },
  { id: "DOC-5", project: "P-A", name: "CAR insurance policy 2026-27.pdf", folder: "Insurance", rev: "-", date: "2026-03-28", by: "Mahesh Jadhav" },
  { id: "DOC-6", project: "P-A", name: "Cube test report T-551.pdf", folder: "Tests", rev: "-", date: "2026-11-03", by: "Kiran Pawar" },
];

export type Licence = { name: string; number: string; expiry: string };
export const licences: Licence[] = [
  { name: "Labour licence (Shree Sai site)", number: "LL/NSK/2026/1182", expiry: "2026-11-28" },
  { name: "Contractor's All Risk policy - P-A", number: "CAR-55210-26", expiry: "2027-03-27" },
  { name: "Workmen compensation policy", number: "WC-88123", expiry: "2026-12-15" },
  { name: "ISO 9001:2015 certificate", number: "QMS-2291", expiry: "2027-08-01" },
  { name: "Advance BG - Shree Sai Traders", number: "BG/SBI/4410", expiry: "2026-12-01" },
  { name: "JCB MH15 AB 2201 insurance", number: "VEH-77120", expiry: "2026-11-20" },
];

export const monthly = [
  { m: "Jun", billed: 5110000, received: 4242000, cost: 3920000 },
  { m: "Jul", billed: 5420000, received: 5380000, cost: 4480000 },
  { m: "Aug", billed: 6230000, received: 4610000, cost: 5010000 },
  { m: "Sep", billed: 6850000, received: 6990000, cost: 5650000 },
  { m: "Oct", billed: 7920000, received: 6480000, cost: 6120000 },
  { m: "Nov*", billed: 4540000, received: 900000, cost: 1480000 },
];

export const cashForecast = [
  { m: "Nov", inflow: 9800000, outflow: 8700000 },
  { m: "Dec", inflow: 8900000, outflow: 9400000 },
  { m: "Jan", inflow: 10200000, outflow: 9100000 },
];

export const rateLibrary = [
  { code: "R-3.10", item: "RCC M25 (material + labour)", unit: "cum", rate: 7050, updated: "2026-10-01" },
  { code: "R-3.21", item: "TMT Fe-500D cut, bent, placed", unit: "MT", rate: 66800, updated: "2026-10-15" },
  { code: "R-4.05", item: "AAC block masonry 200 mm", unit: "cum", rate: 5500, updated: "2026-09-01" },
  { code: "R-5.12", item: "Internal plaster 12 mm", unit: "sqm", rate: 265, updated: "2026-09-01" },
  { code: "R-8.02", item: "Exterior emulsion 2 coats", unit: "sqm", rate: 120, updated: "2026-08-20" },
];

export const auditLog = [
  { at: "2026-11-06 09:42", user: "Pooja Kulkarni", action: "Submitted RA-07 for Shree Sai Commercial Complex" },
  { at: "2026-11-06 09:15", user: "Ramesh Shinde", action: "Marked attendance - 10 present, 2 absent (P-A)" },
  { at: "2026-11-05 19:02", user: "Kiran Pawar", action: "Submitted daily report DPR-A-201" },
  { at: "2026-11-05 17:30", user: "Sunil More", action: "Created GRN-2210 for PO-1043 (8 brass aggregate)" },
  { at: "2026-11-05 16:10", user: "Amit Deshmukh", action: "Raised PO-1044 - sent to owner for approval" },
  { at: "2026-11-05 11:20", user: "Vinod Kale", action: "Updated GST TDS rate master (effective 01-Nov-2026)" },
];

export type Alert = { id: string; text: string; level: "red" | "amber" | "blue" | "green"; roles: Role[]; href: string };
export const alerts: Alert[] = [
  { id: "a1", text: "PO-1044 (Rs. 7.98 L) waiting for your approval", level: "amber", roles: ["owner"], href: "/approvals" },
  { id: "a2", text: "Cube test T-551 failed (3rd slab) - NCR open", level: "red", roles: ["owner", "pm", "site"], href: "/quality" },
  { id: "a3", text: "Sunrise Hospital AMC-Q3 invoice overdue 36 days", level: "red", roles: ["owner", "accountant", "billing"], href: "/billing" },
  { id: "a4", text: "Labour licence for Shree Sai site expires in 22 days", level: "amber", roles: ["owner", "admin", "pm"], href: "/admin" },
  { id: "a5", text: "CO-02 terrace toilet pending client approval for 84 days", level: "amber", roles: ["owner", "pm", "billing", "client"], href: "/change-orders" },
  { id: "a6", text: "Low stock: TMT 12 mm at Shree Sai site (3.2 MT)", level: "amber", roles: ["store", "pm", "site"], href: "/store" },
  { id: "a7", text: "2 indents waiting for approval", level: "blue", roles: ["pm"], href: "/approvals" },
  { id: "a8", text: "Urgent complaint CMP-412 - Ward 3 leakage", level: "red", roles: ["technician", "pm"], href: "/maintenance" },
  { id: "a9", text: "Follow up today: Nashik Auto Components, Hotel Panchavati", level: "blue", roles: ["sales"], href: "/enquiries" },
  { id: "a10", text: "Wage sheets of 2 sites waiting for approval", level: "blue", roles: ["pm", "accountant"], href: "/payments" },
  { id: "a11", text: "Daily report for today not yet submitted", level: "amber", roles: ["site", "supervisor"], href: "/daily-reports" },
  { id: "a12", text: "Payment of Rs. 40.40 L received for RA-05", level: "green", roles: ["owner", "billing", "client"], href: "/billing" },
  { id: "a14", text: "Estimate for broken window glass (CMP-414) waiting for your approval", level: "amber", roles: ["client"], href: "/maintenance" },
  { id: "a15", text: "New repair job CMP-416: 4 LED lights + 2 switches at Sunrise OPD", level: "blue", roles: ["technician", "pm"], href: "/maintenance" },
  { id: "a13", text: "Advance BG (SBI/4410) expires 01-Dec - renew", level: "amber", roles: ["owner", "accountant"], href: "/admin" },
];

export const photos = [
  { id: "ph1", project: "P-A", caption: "4th slab shuttering - grid C", date: "05-Nov 16:20", tag: "During", hue: 28 },
  { id: "ph2", project: "P-A", caption: "Column C14 casting", date: "05-Nov 12:05", tag: "During", hue: 210 },
  { id: "ph3", project: "P-A", caption: "Front elevation from main road", date: "04-Nov 10:40", tag: "Progress", hue: 140 },
  { id: "ph4", project: "P-A", caption: "AAC masonry 2nd floor", date: "04-Nov 15:10", tag: "During", hue: 0 },
  { id: "ph5", project: "P-E", caption: "Fire-damaged columns C4-C7", date: "22-Aug 11:00", tag: "Before", hue: 15 },
  { id: "ph6", project: "P-D", caption: "Block A terrace after waterproofing", date: "21-Oct 09:30", tag: "After", hue: 190 },
];
