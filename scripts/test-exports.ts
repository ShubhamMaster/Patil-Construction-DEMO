// Generates every report as PDF and XLSX into an output folder, for checking layout outside the browser.
import fs from "node:fs";
import path from "node:path";
import writeXlsxFile from "write-excel-file/node";
import * as seed from "../src/lib/data";
import { buildExcelSheets, buildPdf, pdfSink } from "../src/lib/exporter";
import { billPdf, payslipPdf, quotationPdf, reportDefs } from "../src/lib/reports";

const out = process.argv[2] ?? "export-test";
fs.mkdirSync(out, { recursive: true });
const state = {
  projects: seed.projects, enquiries: seed.enquiries, bills: seed.bills, changeOrders: seed.changeOrders, delays: seed.delays, dprs: seed.dprs,
  workers: seed.workers, attendanceSaved: false, wageRows: seed.wageRows, stock: seed.stock, indents: seed.indents, pos: seed.pos, grns: seed.grns, tests: seed.tests,
  staff: seed.staff, payables: seed.payables, complaints: seed.complaints, jobCards: seed.jobCards, pmJobs: seed.pmJobs, units: seed.units, auditLog: seed.auditLog,
};
const by = "Rajesh Patil (Owner)";

async function main() {
  for (const def of reportDefs) {
    const r = def.build(state, by);
    const doc = await buildPdf(r);
    fs.writeFileSync(path.join(out, `${r.fileName}.pdf`), Buffer.from(doc.output("arraybuffer")));
    await writeXlsxFile(buildExcelSheets(r) as never, { fontFamily: "Calibri", fontSize: 10 }).toFile(path.join(out, `${r.fileName}.xlsx`));
    console.log("ok", def.id, `${doc.getNumberOfPages()} page(s)`);
  }
  pdfSink.capture = (name, doc) => { fs.writeFileSync(path.join(out, `${name}.pdf`), Buffer.from(doc.output("arraybuffer"))); console.log("ok doc", name); };
  await billPdf(state, seed.bills[4], by);
  await billPdf(state, seed.bills[9], by);
  await quotationPdf(seed.enquiries[0], by);
  await payslipPdf(seed.staff[1], by);
}
main().catch((e) => { console.error(e); process.exit(1); });
