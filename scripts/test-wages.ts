import fs from "node:fs";
import writeXlsxFile from "write-excel-file/node";
import * as seed from "../src/lib/data";
import { buildExcelSheets, buildPdf, pdfSink } from "../src/lib/exporter";
import { getReport, wageSlipPdf } from "../src/lib/reports";
const out = process.argv[2];
const state = { ...seed, attendanceSaved: false } as never;
(async () => {
  const r = getReport("wagesheet").build(state, "Mahesh Jadhav (Accountant)");
  fs.writeFileSync(`${out}/${r.fileName}.pdf`, Buffer.from((await buildPdf(r)).output("arraybuffer")));
  await writeXlsxFile(buildExcelSheets(r) as never).toFile(`${out}/${r.fileName}.xlsx`);
  pdfSink.capture = (n, d) => { fs.writeFileSync(`${out}/${n}.pdf`, Buffer.from(d.output("arraybuffer"))); console.log("ok", n); };
  await wageSlipPdf(state, "W01", "Mahesh Jadhav (Accountant)");
  console.log("ok", r.fileName);
})();
