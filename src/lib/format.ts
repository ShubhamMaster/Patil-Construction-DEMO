export const inr = (n: number) => (n < 0 ? "-₹" : "₹") + Math.abs(Math.round(n)).toLocaleString("en-IN");

/** Short Indian format: ₹4.56 Cr, ₹38.50 L, ₹95,000 */
export function inrShort(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(2)} L`;
  return sign + inr(a);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fdate(iso: string) {
  if (!iso || iso === "-" || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso;
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}-${MONTHS[Number(m) - 1]}-${y}${iso.length > 10 ? " " + iso.slice(11) : ""}`;
}

export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export function billNet(b: { workValue: number; gst: number; retention: number; advance: number; tds: number }) {
  return b.workValue + b.gst - b.retention - b.advance - b.tds;
}
