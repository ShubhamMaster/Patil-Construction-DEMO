// Weekly wage calculation for daily-wage workers: days x rate + overtime - ESIC - advance recovery.
import type { WageRow, Worker } from "./data";

export const WEEK = { no: 44, label: "Week 44", from: "2026-11-02", to: "2026-11-07", days: ["Mon 02", "Tue 03", "Wed 04", "Thu 05", "Fri 06", "Sat 07"], site: "Shree Sai Commercial Complex", payableId: "PAY-901" };
export const ESIC_RATE = 0.0075; // employee share

export function wageCalc(w: Pick<Worker, "rate">, r: Pick<WageRow, "days" | "ot" | "advance">) {
  const days = r.days.reduce((a, d) => a + d, 0);
  const basic = Math.round(days * w.rate);
  const otAmt = Math.round((r.ot * w.rate) / 8);
  const gross = basic + otAmt;
  const esic = Math.round(gross * ESIC_RATE);
  const net = gross - esic - r.advance;
  return { days, basic, otAmt, gross, esic, advance: r.advance, net };
}

export const dayMark = (d: number) => (d === 1 ? "P" : d === 0.5 ? "H" : "A");
