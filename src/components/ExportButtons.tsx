"use client";

import { useState } from "react";
import { exportExcel, exportPdf } from "@/lib/exporter";
import { getReport } from "@/lib/reports";
import { roleLabel } from "@/lib/data";
import { useDemo } from "@/lib/store";
import { Button } from "./ui";

/** PDF + Excel buttons for a report defined in lib/reports.ts */
export default function ExportButtons({ id, size = "sm", pdfOnly, label }: { id: string; size?: "sm" | "md"; pdfOnly?: boolean; label?: string }) {
  const { state, user, notify } = useDemo();
  const [busy, setBusy] = useState<"" | "pdf" | "xls">("");
  const by = user ? `${user.name} (${roleLabel[user.role]})` : "";

  const run = async (kind: "pdf" | "xls") => {
    setBusy(kind);
    try {
      const r = getReport(id).build(state, by);
      if (kind === "pdf") await exportPdf(r); else await exportExcel(r);
      notify(`${r.title} downloaded as ${kind === "pdf" ? "PDF" : "Excel"}`);
    } catch (e) {
      console.error(e);
      notify("Export failed - please try again");
    } finally { setBusy(""); }
  };

  return (
    <>
      <Button size={size} variant="secondary" icon="FileDown" disabled={!!busy} onClick={() => run("pdf")}>{busy === "pdf" ? "Preparing…" : label ? `${label} PDF` : "PDF"}</Button>
      {!pdfOnly && <Button size={size} variant="secondary" icon="FileSpreadsheet" disabled={!!busy} onClick={() => run("xls")}>{busy === "xls" ? "Preparing…" : "Excel"}</Button>}
    </>
  );
}

/** Run any async document export with toast + busy handling. */
export function useDocExport() {
  const { state, user, notify } = useDemo();
  const by = user ? `${user.name} (${roleLabel[user.role]})` : "";
  return async (label: string, fn: (s: typeof state, by: string) => Promise<void>) => {
    try { await fn(state, by); notify(`${label} downloaded`); } catch (e) { console.error(e); notify("Export failed - please try again"); }
  };
}
