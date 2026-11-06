// Professional PDF (jsPDF + autotable) and Excel (.xlsx) export for all demo reports.
import { DEMO_TODAY } from "./data";
import { fdate } from "./format";

export type Cell = string | number;
export type ColDef = { header: string; align?: "left" | "right" | "center"; money?: boolean; width?: number; xlWidth?: number };
export type Section = {
  heading?: string;
  text?: string[];
  kpis?: [string, string][];
  columns?: ColDef[];
  rows?: Cell[][];
  totals?: Cell[];
  note?: string;
  pageBreakBefore?: boolean;
};
export type Report = {
  title: string;
  subtitle?: string;
  fileName: string;
  landscape?: boolean;
  sections: Section[];
  preparedBy?: string;
  signatures?: string[];
};

export const COMPANY = {
  name: "PATIL CONSTRUCTIONS",
  line1: "12, Shivaji Nagar, College Road, Nashik - 422005, Maharashtra",
  line2: "GSTIN 27AAKFP4821M1Z6  |  PAN AAKFP4821M",
  line3: "+91 98220 11001  |  accounts@patilconstructions.in",
};

const ORANGE: [number, number, number] = [234, 88, 12];
const SLATE: [number, number, number] = [15, 23, 42];
const GREY: [number, number, number] = [100, 116, 139];

export const rs = (n: number) => "Rs. " + Math.round(n).toLocaleString("en-IN");
const fmtCell = (v: Cell, c?: ColDef) => (typeof v === "number" && c?.money ? Math.round(v).toLocaleString("en-IN") : String(v ?? ""));

function stamp() {
  const t = new Date();
  return `${fdate(DEMO_TODAY)} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ PDF */

type Doc = import("jspdf").jsPDF & { lastAutoTable?: { finalY: number } };

async function newDoc(landscape?: boolean) {
  const { jsPDF } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: "a4" }) as Doc;
  return { doc, autoTable };
}

function letterhead(doc: Doc, title: string, subtitle: string | undefined, by?: string) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...ORANGE);
  doc.roundedRect(14, 11, 11, 11, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").setFontSize(10);
  doc.text("PC", 19.5, 18, { align: "center" });
  doc.setTextColor(...SLATE).setFontSize(13).text(COMPANY.name, 28, 16);
  doc.setFont("helvetica", "normal").setFontSize(6.8).setTextColor(...GREY);
  doc.text(COMPANY.line1, 28, 19.6);
  doc.text(COMPANY.line2, 28, 22.6);
  doc.text(COMPANY.line3, 28, 25.6);
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...SLATE);
  doc.text(title, W - 14, 15.5, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...GREY);
  if (subtitle) doc.text(subtitle, W - 14, 20, { align: "right" });
  doc.text(`Generated ${stamp()}${by ? `  |  ${by}` : ""}`, W - 14, 24, { align: "right" });
  doc.setDrawColor(...ORANGE).setLineWidth(0.7).line(14, 28, W - 14, 28);
  doc.setTextColor(...SLATE);
}

function footers(doc: Doc, title: string) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240).setLineWidth(0.3).line(14, H - 12, W - 14, H - 12);
    doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...GREY);
    doc.text(`Patil Constructions  |  ${title}  |  Confidential - for internal / client use only`, 14, H - 7.5);
    doc.text(`Page ${i} of ${n}`, W - 14, H - 7.5, { align: "right" });
  }
}

function ensure(doc: Doc, y: number, need: number) {
  const H = doc.internal.pageSize.getHeight();
  if (y + need > H - 18) { doc.addPage(); return 18; }
  return y;
}

function kpiBoxes(doc: Doc, y: number, kpis: [string, string][]) {
  const W = doc.internal.pageSize.getWidth();
  const per = W > 250 ? 5 : 4, gap = 3, bw = (W - 28 - gap * (per - 1)) / per, bh = 15;
  kpis.forEach(([label, value], i) => {
    const col = i % per, row = Math.floor(i / per);
    const x = 14 + col * (bw + gap), yy = y + row * (bh + gap);
    doc.setFillColor(248, 250, 252).setDrawColor(226, 232, 240).setLineWidth(0.2).roundedRect(x, yy, bw, bh, 1.5, 1.5, "FD");
    doc.setFillColor(...ORANGE).rect(x, yy + 2, 0.8, bh - 4, "F");
    doc.setFont("helvetica", "normal").setFontSize(6.5).setTextColor(...GREY).text(label.toUpperCase(), x + 3.5, yy + 5.5);
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...SLATE).text(value, x + 3.5, yy + 11.5);
  });
  return y + Math.ceil(kpis.length / per) * (bh + gap) + 2;
}

async function drawSections(doc: Doc, autoTable: (d: Doc, o: object) => void, sections: Section[], startY: number) {
  let y = startY;
  for (const s of sections) {
    if (s.pageBreakBefore) { doc.addPage(); y = 18; }
    if (s.heading) {
      y = ensure(doc, y, 20);
      doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...SLATE).text(s.heading, 14, y);
      doc.setDrawColor(226, 232, 240).setLineWidth(0.3).line(14, y + 1.8, doc.internal.pageSize.getWidth() - 14, y + 1.8);
      y += 6;
    }
    if (s.text) {
      doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(51, 65, 85);
      for (const t of s.text) {
        const lines = doc.splitTextToSize(t, doc.internal.pageSize.getWidth() - 28);
        y = ensure(doc, y, lines.length * 4 + 2);
        doc.text(lines, 14, y); y += lines.length * 4 + 1.5;
      }
      y += 1;
    }
    if (s.kpis?.length) { y = ensure(doc, y, 20); y = kpiBoxes(doc, y, s.kpis); }
    if (s.columns && s.rows) {
      const cols = s.columns;
      const columnStyles: Record<number, object> = {};
      cols.forEach((c, i) => { columnStyles[i] = { halign: c.align ?? (c.money ? "right" : "left"), ...(c.width ? { cellWidth: c.width } : {}) }; });
      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14, top: 18, bottom: 18 },
        head: [cols.map((c) => c.header)],
        body: s.rows.map((r) => r.map((v, i) => fmtCell(v, cols[i]))),
        foot: s.totals ? [s.totals.map((v, i) => fmtCell(v, cols[i]))] : undefined,
        showFoot: "lastPage",
        theme: "grid",
        styles: { font: "helvetica", fontSize: 7.8, cellPadding: 1.8, lineColor: [226, 232, 240], lineWidth: 0.15, textColor: [30, 41, 59], overflow: "linebreak" },
        headStyles: { fillColor: SLATE, textColor: 255, fontStyle: "bold", halign: "center", fontSize: 7.5 },
        footStyles: { fillColor: [255, 237, 213], textColor: SLATE, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles,
        didParseCell: (d: { section: string; column: { index: number }; cell: { styles: { halign: string } } }) => {
          if (d.section === "foot") { const c = cols[d.column.index]; d.cell.styles.halign = c?.align ?? (c?.money ? "right" : "left"); }
        },
      });
      y = (doc.lastAutoTable?.finalY ?? y) + 4;
    }
    if (s.note) {
      doc.setFont("helvetica", "italic").setFontSize(7.5).setTextColor(...GREY);
      const lines = doc.splitTextToSize(s.note, doc.internal.pageSize.getWidth() - 28);
      y = ensure(doc, y, lines.length * 3.5 + 2);
      doc.text(lines, 14, y); y += lines.length * 3.5 + 2;
    }
    y += 3;
  }
  return y;
}

function signatures(doc: Doc, y: number, labels: string[]) {
  y = ensure(doc, y + 6, 26);
  const W = doc.internal.pageSize.getWidth();
  const bw = (W - 28) / labels.length;
  labels.forEach((l, i) => {
    const x = 14 + i * bw;
    doc.setDrawColor(148, 163, 184).setLineWidth(0.3).line(x + 4, y + 14, x + bw - 8, y + 14);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...GREY).text(l, x + 4, y + 18.5);
  });
  return y + 22;
}

export async function buildPdf(r: Report) {
  const { doc, autoTable } = await newDoc(r.landscape);
  letterhead(doc, r.title, r.subtitle, r.preparedBy);
  const y = await drawSections(doc, autoTable as never, r.sections, 35);
  signatures(doc, y, r.signatures ?? ["Prepared by", "Checked by", "Approved by (Owner)"]);
  footers(doc, r.title);
  return doc;
}

export async function exportPdf(r: Report) {
  (await buildPdf(r)).save(`${r.fileName}.pdf`);
}

/* ------------------------------------------------------------- Excel */

export function buildExcelSheets(r: Report) {
  type XCell = Record<string, unknown> | null;
  const sheets: { data: XCell[][]; sheet: string; columns: { width: number }[]; stickyRowsCount?: number }[] = [];
  const used = new Set<string>();
  const sheetName = (n: string) => {
    let base = n.replace(/[\\/?*[\]:]/g, "").slice(0, 28) || "Sheet";
    let k = base, i = 2;
    while (used.has(k)) k = `${base.slice(0, 26)} ${i++}`;
    used.add(k); base = k; return base;
  };
  const titleRows = (span: number, heading?: string): XCell[][] => {
    const pad = (c: XCell): XCell[] => [c, ...Array(Math.max(0, span - 1)).fill(null)];
    return [
      pad({ value: COMPANY.name, fontWeight: "bold", fontSize: 14, textColor: "#EA580C", columnSpan: span }),
      pad({ value: `${r.title}${heading ? " - " + heading : ""}`, fontWeight: "bold", fontSize: 12, columnSpan: span }),
      pad({ value: `${r.subtitle ? r.subtitle + "  |  " : ""}Generated ${stamp()}${r.preparedBy ? "  |  " + r.preparedBy : ""}`, textColor: "#64748B", columnSpan: span }),
      pad(null),
    ];
  };

  // Summary sheet: KPIs and text from every section
  const summary: XCell[][] = [...titleRows(2)];
  r.sections.forEach((s) => {
    if (s.kpis?.length || s.text?.length) {
      if (s.heading) summary.push([{ value: s.heading, fontWeight: "bold", backgroundColor: "#F1F5F9" }, { value: "", backgroundColor: "#F1F5F9" }]);
      s.kpis?.forEach(([k, v]) => summary.push([{ value: k }, { value: v, fontWeight: "bold", align: "right" }]));
      s.text?.forEach((t) => summary.push([{ value: t, wrap: true, columnSpan: 2 }, null]));
      summary.push([null, null]);
    }
  });
  if (summary.length > 4) sheets.push({ data: summary, sheet: sheetName("Summary"), columns: [{ width: 44 }, { width: 26 }] });

  r.sections.filter((s) => s.columns && s.rows).forEach((s) => {
    const cols = s.columns!;
    const data: XCell[][] = [...titleRows(cols.length, s.heading)];
    data.push(cols.map((c) => ({ value: c.header, fontWeight: "bold", textColor: "#FFFFFF", backgroundColor: "#0F172A", align: "center", wrap: true, borderStyle: "thin", borderColor: "#CBD5E1" })));
    s.rows!.forEach((row, ri) => data.push(row.map((v, i) => ({
      value: v, type: typeof v === "number" ? Number : String,
      ...(typeof v === "number" ? { format: cols[i].money ? "#,##0" : "0.##" } : {}),
      align: cols[i].align ?? (cols[i].money ? "right" : "left"),
      backgroundColor: ri % 2 ? "#F8FAFC" : "#FFFFFF", borderStyle: "thin", borderColor: "#E2E8F0", wrap: true,
    }))));
    if (s.totals) data.push(s.totals.map((v, i) => ({
      value: v, type: typeof v === "number" ? Number : String, ...(typeof v === "number" ? { format: "#,##0" } : {}),
      fontWeight: "bold", backgroundColor: "#FFEDD5", align: cols[i].align ?? (cols[i].money ? "right" : "left"), borderStyle: "thin", borderColor: "#E2E8F0",
    })));
    if (s.note) { data.push(cols.map(() => null)); data.push([{ value: s.note, textColor: "#64748B", columnSpan: cols.length }, ...Array(cols.length - 1).fill(null)]); }
    sheets.push({
      data, sheet: sheetName(s.heading ?? r.title),
      columns: cols.map((c) => ({ width: c.xlWidth ?? Math.min(48, Math.max(12, c.header.length + 4, ...s.rows!.map((row) => String(row[cols.indexOf(c)] ?? "").length + 2))) })),
      stickyRowsCount: 5,
    });
  });

  return sheets;
}

export async function exportExcel(r: Report) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  await writeXlsxFile(buildExcelSheets(r) as never, { fontFamily: "Calibri", fontSize: 10 }).toFile(`${r.fileName}.xlsx`);
}

/* --------------------------------------------- Amount in words (Indian) */

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
function two(n: number) { return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`; }
function three(n: number) { const h = Math.floor(n / 100), r = n % 100; return `${h ? ONES[h] + " Hundred" + (r ? " " : "") : ""}${r ? two(r) : ""}`; }
export function inWords(amount: number) {
  let n = Math.round(amount);
  if (n === 0) return "Rupees Zero Only";
  const parts: string[] = [];
  const cr = Math.floor(n / 1e7); n %= 1e7;
  const lk = Math.floor(n / 1e5); n %= 1e5;
  const th = Math.floor(n / 1e3); n %= 1e3;
  if (cr) parts.push(`${two(cr)} Crore`);
  if (lk) parts.push(`${two(lk)} Lakh`);
  if (th) parts.push(`${two(th)} Thousand`);
  if (n) parts.push(three(n));
  return `Rupees ${parts.join(" ")} Only`;
}

/* ------------------------------------------------- Document-style PDFs */

export type DocField = [string, string];
export type DocOpts = {
  title: string; subtitle?: string; fileName: string; preparedBy?: string;
  partyTitle: string; party: string[]; fields: DocField[];
  sections: Section[]; amountInWords?: number; terms?: string[]; signatures?: string[];
};

/** Set by tests to capture documents instead of downloading them. */
export const pdfSink: { capture?: (fileName: string, doc: Doc) => void } = {};

export async function exportDocumentPdf(opts: DocOpts) {
  const { doc, autoTable } = await newDoc(false);
  letterhead(doc, opts.title, opts.subtitle, opts.preparedBy);
  const W = doc.internal.pageSize.getWidth();
  // Party box (left) and reference fields (right)
  doc.setDrawColor(226, 232, 240).setLineWidth(0.2);
  doc.roundedRect(14, 33, (W - 31) / 2, 30, 1.5, 1.5);
  doc.roundedRect(14 + (W - 31) / 2 + 3, 33, (W - 31) / 2, 30, 1.5, 1.5);
  doc.setFont("helvetica", "bold").setFontSize(7).setTextColor(...GREY).text(opts.partyTitle.toUpperCase(), 17, 38);
  doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(...SLATE).text(opts.party[0] ?? "", 17, 43.5);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(51, 65, 85);
  opts.party.slice(1, 5).forEach((l, i) => doc.text(l, 17, 48 + i * 4));
  const fx = 14 + (W - 31) / 2 + 6;
  opts.fields.slice(0, 6).forEach(([k, v], i) => {
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...GREY).text(k, fx, 38.5 + i * 4.2);
    doc.setFont("helvetica", "bold").setTextColor(...SLATE).text(v, W - 17, 38.5 + i * 4.2, { align: "right" });
  });
  let y = await drawSections(doc, autoTable as never, opts.sections, 70);
  if (opts.amountInWords !== undefined) {
    y = ensure(doc, y, 10);
    doc.setFillColor(255, 247, 237).rect(14, y - 4, W - 28, 8, "F");
    doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...SLATE).text(`Amount in words: ${inWords(opts.amountInWords)}`, 16, y + 1);
    y += 9;
  }
  if (opts.terms?.length) {
    y = ensure(doc, y, 10 + opts.terms.length * 4);
    doc.setFont("helvetica", "bold").setFontSize(8.5).text("Terms & notes", 14, y); y += 4.5;
    doc.setFont("helvetica", "normal").setFontSize(7.8).setTextColor(51, 65, 85);
    opts.terms.forEach((t, i) => { const lines = doc.splitTextToSize(`${i + 1}. ${t}`, W - 30); y = ensure(doc, y, lines.length * 3.6); doc.text(lines, 16, y); y += lines.length * 3.6 + 0.6; });
  }
  signatures(doc, y, opts.signatures ?? ["Prepared by", "Checked by", "For Patil Constructions (Authorised Signatory)"]);
  footers(doc, opts.title);
  if (pdfSink.capture) pdfSink.capture(opts.fileName, doc); else doc.save(`${opts.fileName}.pdf`);
}
