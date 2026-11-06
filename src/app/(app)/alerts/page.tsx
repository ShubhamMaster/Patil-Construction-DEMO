"use client";

import Link from "next/link";
import { Card, Empty, Icon, PageHeader } from "@/components/ui";
import { alerts } from "@/lib/data";
import { useDemo } from "@/lib/store";

const style = {
  red: ["AlertOctagon", "bg-red-50 text-red-600"], amber: ["AlertTriangle", "bg-amber-50 text-amber-600"],
  blue: ["Info", "bg-sky-50 text-sky-600"], green: ["CheckCircle2", "bg-emerald-50 text-emerald-600"],
} as const;

export default function AlertsPage() {
  const { user } = useDemo();
  const list = alerts.filter((a) => user && a.roles.includes(user.role));
  return (
    <>
      <PageHeader title="Alerts" sub="Reminders sent to you in the app and by email (SMS / WhatsApp optional)" />
      {list.length === 0 ? <Empty text="No alerts" /> : (
        <Card pad={false}>
          <ul className="divide-y divide-slate-100">
            {list.map((a) => (
              <li key={a.id}>
                <Link href={a.href} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                  <span className={`rounded-lg p-2 ${style[a.level][1]}`}><Icon name={style[a.level][0]} className="h-4 w-4" /></span>
                  <span className="flex-1 text-sm text-slate-700">{a.text}</span>
                  <Icon name="ChevronRight" className="h-4 w-4 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
