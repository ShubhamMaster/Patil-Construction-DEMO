import fs from "node:fs";
import * as seed from "../src/lib/data";
import { pdfSink } from "../src/lib/exporter";
import { jobCardPdf } from "../src/lib/reports";
const out = process.argv[2];
const state = { ...seed, attendanceSaved: false } as never;
pdfSink.capture = (name, doc) => { fs.writeFileSync(`${out}/${name}.pdf`, Buffer.from(doc.output("arraybuffer"))); console.log("ok", name); };
(async () => { for (const id of ["CMP-414", "CMP-403", "CMP-415"]) await jobCardPdf(state, id, "Ganesh Bhosale (Maintenance Technician)"); })();
