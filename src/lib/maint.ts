// Maintenance job costing: material + labour + overhead (+ margin and GST for chargeable jobs).
import type { Complaint, JobCard } from "./data";

export const CLIENT_PROPERTIES = ["Shree Sai Complex", "Shree Sai Showroom"];
export const PROPERTIES = ["Sunrise Hospital", "Orchid Villa", "Shree Sai Showroom", "Shree Sai Complex"];

export function jobCost(card: JobCard | undefined, type: Complaint["type"]) {
  const lines = card?.lines ?? [];
  const material = lines.filter((l) => l.kind !== "Labour").reduce((a, l) => a + l.qty * l.rate, 0);
  const labour = lines.filter((l) => l.kind === "Labour").reduce((a, l) => a + l.qty * l.rate, 0);
  const sub = material + labour;
  const overhead = Math.round((sub * (card?.overheadPct ?? 10)) / 100);
  const cost = Math.round(sub + overhead);
  const chargeable = type === "Chargeable";
  const margin = chargeable ? Math.round((cost * (card?.marginPct ?? 15)) / 100) : 0;
  const price = chargeable ? cost + margin : 0;
  const gst = Math.round(price * 0.18);
  const labourHours = lines.filter((l) => l.kind === "Labour").reduce((a, l) => a + l.qty, 0);
  return { material: Math.round(material), labour: Math.round(labour), overhead, cost, margin, price, gst, total: price + gst, labourHours, chargeable };
}

export const whoPays: Record<Complaint["type"], string> = {
  AMC: "Covered by AMC - cost borne by company",
  Warranty: "Free under defect period - cost borne by company",
  Chargeable: "Chargeable to client - estimate + GST invoice",
};
